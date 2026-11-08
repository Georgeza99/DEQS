import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/server/owner-context.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const configured = { DEQS_SUPABASE_URL: "https://synthetic.example", DEQS_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fixture" };
const token = "test.header.signature";

function load(env, fetch) {
  const exports = {};
  // Isolate the transport. Next.js enforces the server-only import in an app build.
  new Function("exports", "require", "process", "fetch", outputText)(exports, id => {
    assert.equal(id, "server-only");
  }, { env }, fetch);
  return exports.readOwnerContext;
}

test("missing, privileged or unsafe configuration makes no request", async () => {
  for (const env of [{}, { ...configured, DEQS_SUPABASE_PUBLISHABLE_KEY: "sb_secret_fixture" },
    { ...configured, DEQS_SUPABASE_URL: "http://synthetic.example" },
    { ...configured, DEQS_SUPABASE_URL: "https://synthetic.example/path" }]) {
    assert.deepEqual(await load(env, () => assert.fail("request attempted"))(token), { status: "unconfigured" });
  }
});

test("only the private owner context is returned through the fixed no-store RPC", async () => {
  const principal = "11111111-1111-4111-8111-111111111111";
  const epoch = "22222222-2222-4222-8222-222222222222";
  const read = load(configured, async (url, options) => {
    assert.equal(url.href, "https://synthetic.example/rest/v1/rpc/owner_context");
    assert.equal(options.headers.Authorization, `Bearer ${token}`);
    assert.equal(options.headers["Accept-Profile"], "deqs_api");
    assert.equal(options.cache, "no-store");
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ store_id: 1, owner_principal_id: principal, write_epoch: epoch, writes_enabled: false, extra: "omit" });
  });
  assert.deepEqual(await read(token), { status: "ok", context: {
    storeId: 1, ownerPrincipalId: principal, writeEpoch: epoch, writesEnabled: false,
  } });
  assert.deepEqual(await read("bad token"), { status: "denied" });
});

test("denials and transport or payload failures never become owner context", async () => {
  for (const status of [401, 403]) {
    assert.deepEqual(await load(configured, async () => new Response("private provider error", { status }))(token), { status: "denied" });
  }
  for (const fetch of [async () => { throw new Error("private transport error"); },
    async () => new Response("unparseable"), async () => Response.json({ store_id: 2 }),
    async () => new Response("provider error", { status: 500 })]) {
    assert.deepEqual(await load(configured, fetch)(token), { status: "unavailable" });
  }
});
