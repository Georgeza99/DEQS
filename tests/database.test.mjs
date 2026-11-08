import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdir, mkdtemp, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { join, resolve } from "node:path";
import { test } from "node:test";

const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const owner = id(1);
const principal = id(2);
const customer = id(3);
const cutover = id(4);
const draft = id(5);
const epoch = id(6);
const otherCustomer = id(7);
const effectiveAt = "2026-01-01T00:00:00+03:00";

function run(bin, name, args, env, input = "", detachOutput = false) {
  const executable = join(bin, process.platform === "win32" ? `${name}.exe` : name);
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { env, windowsHide: true, stdio: detachOutput ? "ignore" : "pipe" });
    let stdout = "";
    let stderr = "";
    child.stdout?.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    child.stderr?.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
    child.stdin?.on("error", (error) => { if (error.code !== "EPIPE") reject(error); });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout: stdout.trim(), stderr }));
    child.stdin?.end(input);
  });
}

async function reservePort() {
  const listener = createServer();
  await new Promise((resolve, reject) => {
    listener.once("error", reject);
    listener.listen(0, "127.0.0.1", resolve);
  });
  const { port } = listener.address();
  await new Promise((resolve, reject) => listener.close((error) => error ? reject(error) : resolve()));
  return port;
}

const prepare = (key, kind = "purchase", payload = '{"amount_fils":"9007199254740993"}') => `
  insert into deqs_data.financial_commands
    (store_id,idempotency_key,write_epoch,kind,payload,actor_principal_id,actor_auth_uid)
  values (1,'${id(key)}','${epoch}','${kind}','${payload}','${principal}','${owner}')`;
const commit = (key, ...entryIds) => `
  update deqs_data.financial_commands
  set state='committed', terminal_at=clock_timestamp(),
    receipt=jsonb_build_object('idempotency_key','${id(key)}','entry_ids',
      jsonb_build_array(${entryIds.map((entry) => `'${id(entry)}'`).join(",")}))
  where idempotency_key='${id(key)}';`;
const entry = (key, entryId, amount, kind = "purchase", entryRole = "original", ordinal = 1,
  customerId = customer, stamp = "clock_timestamp()") => `
  insert into deqs_data.ledger_entries
    (store_id,entry_id,command_key,ordinal,customer_id,economic_kind,entry_role,delta_fils,effective_at,recorded_at)
  values (1,'${id(entryId)}','${id(key)}',${ordinal},'${customerId}','${kind}','${entryRole}',${amount},
    '${effectiveAt}',${stamp});`;
const asRole = (role, uid, aal, query) => `
  set role ${role};
  set request.jwt.claims = '${JSON.stringify({ sub: uid, aal })}';
  ${query}`;

test("Milestone A on isolated PostgreSQL", { timeout: 180000 }, async (t) => {
  const bin = process.env.DEQS_PG_BIN || (process.platform === "win32" ? "C:\\Program Files\\PostgreSQL\\18\\bin" : "");
  assert.ok(bin, "Set DEQS_PG_BIN to a PostgreSQL installation's bin directory.");
  const scratch = resolve(".qa");
  await mkdir(scratch, { recursive: true });
  const cluster = await mkdtemp(join(scratch, "pg-"));
  const data = join(cluster, "data");
  const passwordFile = join(cluster, "bootstrap-password");
  const password = randomBytes(32).toString("hex");
  const port = await reservePort();
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^PG/i.test(key)));
  const user = "deqs_test_admin";
  const check = ({ code, stdout, stderr }) => {
    assert.equal(code, 0, stderr || stdout);
    return stdout;
  };

  await writeFile(passwordFile, password + "\n", { flag: "wx", mode: 0o600 });
  try {
    check(await run(bin, "initdb", ["-D", data, "-U", user, "--encoding=UTF8", "--locale=C",
      "--auth=scram-sha-256", `--pwfile=${passwordFile}`], env));
  } finally {
    await unlink(passwordFile);
  }
  t.after(async () => {
    const status = await run(bin, "pg_ctl", ["-D", data, "status"], env);
    if (status.code === 0) check(await run(bin, "pg_ctl", ["-D", data, "stop", "-m", "fast", "-w"], env));
  });
  const log = join(cluster, "postgres.log");
  const started = await run(bin, "pg_ctl", ["-D", data, "-l", log, "-w",
    "-o", `-h 127.0.0.1 -p ${port} -c unix_socket_directories=`, "start"], env, "", true);
  assert.equal(started.code, 0, `Could not start isolated PostgreSQL. See ${log}`);

  const query = (input) => run(bin, "psql", ["-X", "-qAt", "-v", "ON_ERROR_STOP=1",
    "-v", "VERBOSITY=verbose", "-h", "127.0.0.1", "-p", String(port), "-U", user, "-d", "postgres"],
  { ...env, PGPASSWORD: password, PGCONNECT_TIMEOUT: "5" }, input);
  const sql = async (input) => check(await query(input));
  const rejects = async (input, errorCode) => {
    const result = await query(input);
    assert.equal(result.code, 3, result.stderr || result.stdout);
    assert.match(result.stderr, new RegExp(`ERROR:\\s+${errorCode}:`));
  };

  assert.equal(resolve(await sql("show data_directory;")), data);
  // Emulate only the database-facing Supabase roles and claims. No JWT is issued here.
  await sql(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create function auth.jwt() returns jsonb language sql stable
      as $$select nullif(current_setting('request.jwt.claims', true), '')::jsonb$$;
    create function auth.uid() returns uuid language sql stable
      as $$select (auth.jwt()->>'sub')::uuid$$;
  `);
  const migrationDir = resolve("supabase", "migrations");
  for (const file of (await readdir(migrationDir)).filter((name) => name.endsWith(".sql")).sort()) {
    await sql(await readFile(join(migrationDir, file), "utf8"));
  }

  await t.test("all tables force RLS and the owner boundary fails closed", async () => {
    const readContext = "select deqs_api.owner_context();";
    assert.equal(await sql(`select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='deqs_data' and relkind='r' and relrowsecurity and relforcerowsecurity;`), "9");
    assert.equal(await sql("select count(*) from deqs_data.stores;"), "0");
    await rejects(asRole("authenticated", owner, "aal2", readContext), "42501");
    await sql(`insert into deqs_data.stores(store_id,owner_principal_id,owner_auth_uid,write_epoch)
      values (1,'${principal}','${owner}','${epoch}');`);
    await rejects(asRole("authenticated", owner, "aal2", readContext), "42501");
    await sql("update deqs_data.stores set access_enabled=true;");
    await rejects(asRole("anon", owner, "aal2", readContext), "42501");
    await rejects(asRole("service_role", owner, "aal2", readContext), "42501");
    await rejects(asRole("authenticated", id(999), "aal2", readContext), "42501");
    await rejects(asRole("authenticated", owner, "aal1", readContext), "42501");
    await rejects(asRole("authenticated", owner, undefined, readContext), "42501");
    assert.deepEqual(JSON.parse(await sql(asRole("authenticated", owner, "aal2", readContext))), {
      store_id: 1, owner_principal_id: principal, write_epoch: epoch, writes_enabled: false,
    });
    await rejects(asRole("authenticated", owner, "aal2", "select * from deqs_data.stores;"), "42501");
    await rejects(asRole("service_role", owner, "aal2", "select * from deqs_data.stores;"), "42501");
    await rejects(asRole("deqs_context_reader", owner, "aal2", "update deqs_data.stores set writes_enabled=true;"), "42501");
    await rejects(asRole("authenticated", owner, "aal2", "delete from deqs_data.ledger_entries;"), "42501");
  });

  await t.test("Save persists a draft and approval posts exactly one opening and source claim", async () => {
    await sql(`insert into deqs_data.customers(store_id,customer_id,display_name,name_search)
      values (1,'${customer}','Synthetic A','synthetic a'),(1,'${otherCustomer}','Synthetic B','synthetic b');
      insert into deqs_data.ledger_cutovers
        (store_id,cutover_id,local_cutover_date,effective_at,paper_ledger_ref,expected_account_count,expected_opening_fils,state)
      values (1,'${cutover}','2026-01-01','${effectiveAt}','test-only',1,0,'reconciling');
      insert into deqs_data.opening_drafts
        (store_id,draft_id,cutover_id,paper_ref,candidate_name,proposed_fils,saved_by)
      values (1,'${draft}','${cutover}','p01-r01','Synthetic A',0,'${principal}');`);
    assert.equal(await sql("select state || ':' || (select count(*) from deqs_data.ledger_entries) from deqs_data.opening_drafts;"), "draft:0");
    await rejects(`insert into deqs_data.opening_drafts
      (store_id,cutover_id,paper_ref,candidate_name,proposed_fils,saved_by)
      values (1,'${cutover}','p01-r01','Synthetic B',5,'${principal}');`, "23505");
    await rejects(`begin; ${prepare(10, "opening")}; ${entry(10, 11, 0, "opening")}
      ${commit(10, 11)} commit;`, "23514");
    await sql(`begin; ${prepare(10, "opening", '{"proposed_fils":"0"}')}; ${entry(10, 11, 0, "opening")}
      update deqs_data.opening_drafts set state='approved', approval_command_key='${id(10)}',
        linked_customer_id='${customer}' where draft_id='${draft}';
      insert into deqs_data.opening_claims
        (store_id,cutover_id,customer_id,command_key,entry_id,origin_entry_id,origin_draft_id,claim_kind,paper_ref)
      values (1,'${cutover}','${customer}','${id(10)}','${id(11)}','${id(11)}','${draft}','source','p01-r01');
      ${commit(10, 11)} commit;`);
    assert.equal(await sql(`select d.state || ':' || l.delta_fils from deqs_data.opening_drafts d
      join deqs_data.ledger_entries l on l.command_key=d.approval_command_key;`), "approved:0");
    await rejects("update deqs_data.opening_drafts set proposed_fils=9;", "55000");
    await rejects(`begin; ${prepare(12, "opening")}; ${entry(12, 13, 0, "opening")}
      insert into deqs_data.opening_claims
        (store_id,cutover_id,customer_id,command_key,entry_id,origin_entry_id,origin_draft_id,claim_kind,paper_ref)
      values (1,'${cutover}','${customer}','${id(12)}','${id(13)}','${id(13)}','${draft}','source','p01-r02');
      rollback;`, "23505");
    await rejects(`begin; ${prepare(12, "opening")}; ${entry(12, 13, 0, "opening", "original", 1, otherCustomer)}
      insert into deqs_data.opening_claims
        (store_id,cutover_id,customer_id,command_key,entry_id,origin_entry_id,origin_draft_id,claim_kind,paper_ref)
      values (1,'${cutover}','${otherCustomer}','${id(12)}','${id(13)}','${id(13)}','${draft}','source','p01-r01');
      rollback;`, "23505");
  });

  await t.test("concurrent key reservation has one winner and fingerprints track canonical intent", async () => {
    const payload = '{"amount_fils":"9007199254740993","note":"synthetic"}';
    const contender = `${prepare(20, "purchase", payload)} on conflict do nothing returning idempotency_key;`;
    const results = await Promise.all([sql(contender), sql(contender)]);
    assert.deepEqual(results.sort(), ["", id(20)]);
    await rejects(`${prepare(20, "purchase", '{"amount_fils":"5"}')};`, "23505");
    await sql(`${prepare(21, "purchase", '{"note":"synthetic","amount_fils":"9007199254740993"}')};`);
    assert.equal(await sql(`select count(*) || ':' || count(distinct payload_fingerprint)
      from deqs_data.financial_commands where idempotency_key in ('${id(20)}','${id(21)}');`), "2:1");
    await rejects(`update deqs_data.financial_commands set payload='{}' where idempotency_key='${id(20)}';`, "55000");
  });

  await t.test("exact amounts, signed checks and deferred rollback", async () => {
    await rejects(`begin; ${prepare(30)}; ${entry(30, 31, -1)} rollback;`, "23514");
    await rejects(`begin; ${prepare(30)}; ${commit(30, 31)} commit;`, "23514");
    await rejects(`begin; ${prepare(30)}; ${entry(30, 31, 7)} commit;`, "23514");
    await rejects(`begin; ${prepare(30)}; ${entry(30, 31, 7)} ${commit(30, 32)} commit;`, "23514");
    assert.equal(await sql(`select count(*) from deqs_data.financial_commands where idempotency_key='${id(30)}';`), "0");
    assert.equal(await sql(`select count(*) from deqs_data.ledger_entries where entry_id='${id(31)}';`), "0");
    await sql(`begin; ${prepare(30)}; ${entry(30, 31, "9007199254740993")}
      ${commit(30, 31)} ${prepare(32)}; ${entry(32, 33, "9007199254740993")}
      ${commit(32, 33)} commit;`);
    assert.equal(await sql("select sum(delta_fils) from deqs_data.ledger_entries;"), "18014398509481986");
  });

  await t.test("correction requires complete audited legs and immutable history", async () => {
    const stamp = "transaction_timestamp()";
    function post(key, reversal, replacement, amount) {
      return `begin;
        ${entry(key, reversal, amount, "purchase", "reversal", 1, customer, stamp)}
        ${entry(key, replacement, 500, "purchase", "replacement", 2, otherCustomer, stamp)}
        insert into deqs_data.ledger_corrections (store_id,command_key,target_entry_id,reversal_entry_id,
          replacement_entry_id,previous_delta_fils,corrected_delta_fils,reason,recorded_at)
        values (1,'${id(key)}','${id(31)}','${id(reversal)}','${id(replacement)}',9007199254740993,500,'synthetic',${stamp});
        ${commit(key, reversal, replacement)} commit;`;
    }
    // Prepare durably before the correction transaction, then share one recorded timestamp.
    await sql(`${prepare(40, "correction", '{"reason":"synthetic test"}')};`);
    await rejects(post(40, 41, 42, -2), "23514");
    assert.equal(await sql(`select state from deqs_data.financial_commands where idempotency_key='${id(40)}';`), "prepared");
    await sql(post(40, 41, 42, "-9007199254740993"));
    await sql(`${prepare(43, "correction")};`);
    await rejects(post(43, 44, 45, "-9007199254740993"), "23505");
    assert.equal(await sql(`select sum(delta_fils) from deqs_data.ledger_entries where customer_id='${otherCustomer}';`), "500");
    for (const statement of ["update deqs_data.ledger_entries set delta_fils=1",
      "delete from deqs_data.ledger_entries", "truncate deqs_data.ledger_entries cascade",
      "delete from deqs_data.ledger_corrections", "delete from deqs_data.opening_claims",
      "delete from deqs_data.customer_profile_events", "delete from deqs_data.financial_commands"]) {
      await rejects(statement + ";", "55000");
    }
  });
});
