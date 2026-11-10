This file is a merged representation of the entire codebase, combined into a single document by Repomix.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
backend/
  migrations/
    _create_test_user.js
    20261110000100_create_customers.js
  .dockerignore
  .env.example
  .gitattributes
  .gitignore
  controller.js
  db.js
  Dockerfile
  knexfile.js
  package.json
  router.js
  server.js
docs/
  architecture/
    database-schema.md
    decisions.md
    ledger-and-reporting.md
    README.md
    recovery.md
    roadmap.md
    security.md
    transaction-safety.md
  DEQS-IMPLEMENTATION-PLAN.md
  DEQS-MASTER-SPEC.md
  DEQS-PROGRESS.md
  DEQS-QUALITY-STANDARDS.md
  DEQS-REQUIREMENTS-MATRIX.md
  phase-1.1-qa.md
  phase-2-qa.md
  phase-2.1-qa.md
frontend/
  app/
    api/
      api.js
    dashboard/
      page.tsx
    layout.tsx
  public/
    file.svg
    globe.svg
    next.svg
    vercel.svg
    window.svg
  .dockerignore
  .gitignore
  AGENTS.md
  Dockerfile
  eslint.config.mjs
  next.config.ts
  package.json
  README.md
  tsconfig.json
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path="backend/migrations/_create_test_user.js">
// Test User
exports.up = async (knex) => {
  await knex('customers').insert({
    user: 'test_user',
    loan: 10,
    phone_number: '0790000000'
  });
};

//del Test User 
exports.down = async (knex) => {
  await knex('customers')
    .where({ user: 'test_user' })
    .del();
};
</file>

<file path="backend/migrations/20261110000100_create_customers.js">
// loan is in JOD with 3 decimals (1 JOD = 1000 fils). DECIMAL is exact, unlike float.
// With the pg driver it is returned as a string such as "15.000", so keep it a string.
// "user" is a reserved word in PostgreSQL. Knex quotes it automatically, but raw SQL must write "user".
exports.up = (knex) =>
  knex.schema.createTable("customers", (table) => {
    table.increments("id");
    table.string("user", 160).notNullable();
    table.decimal("loan", 12, 3).notNullable().defaultTo(0);
    table.string("phone_number", 20);
  });

exports.down = (knex) => knex.schema.dropTable("customers");
</file>

<file path="backend/.dockerignore">
node_modules
.env
.env.*
!.env.example
Dockerfile
</file>

<file path="backend/.gitattributes">
* text=auto eol=lf
</file>

<file path="backend/.gitignore">
.env
node_modules
</file>

<file path="backend/controller.js">
const db = require('./db');

//get controller
exports.getData = async (req, res) => {
  try {
    const data = await db('customers').select('*');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// add controller
exports.addUser = async (req, res) => {
  try {
    const { name, loan, phone_number } = req.body;
    
    
    if (!name || !loan || !phone_number) {
      return res.status(400).json({ error: 'اكمل ادخال البيانات ناقصة' });
    }

   
    const [newUser] = await db('customers')
      .insert({
        user: name,        
        loan: loan,
        phone_number: phone_number
      })
      .returning('*');

    res.status(201).json({ message: 'تم إضافة المستخدم بنجاح', user: newUser });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// edit controller
exports.editUser = async (req, res) => {
  try {
    const userName = req.params.name;
    const { name, loan, phone_number } = req.body;

    const updateData = {};
    if (name) updateData.user = name; 
    if (loan) updateData.loan = loan;
    if (phone_number) updateData.phone_number = phone_number;


    const updatedRows = await db('customers')
      .where({ user: userName }) 
      .update(updateData)
      .returning('*');

    if (updatedRows.length === 0) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    res.json({ message: 'تم تعديل المستخدم بنجاح', user: updatedRows[0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete controller 
exports.deleteUser = async (req, res) => {
  try {
    const userName = req.params.name; 

    const deletedRows = await db('customers').where({ user: userName }).del();
    
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    res.json({ message: 'تم حذف المستخدم بنجاح' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
</file>

<file path="backend/db.js">
const knex = require('knex');
const config = require('./knexfile');

module.exports = knex(config);
</file>

<file path="backend/Dockerfile">
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
EXPOSE 4000
CMD ["sh", "-c", "npm run migrate && npm start"]
</file>

<file path="backend/knexfile.js">
// Knex configuration, used by the knex CLI (npm run migrate) and by db.js.
try {
  process.loadEnvFile('./.env');
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

module.exports = {
  client: "pg",
  connection: process.env.DATABASE_URL || "postgresql://postgres:YOUR_PASSWORD@localhost:5432/YOUR_DB_NAME",
  migrations: { directory: "./migrations" },
};
</file>

<file path="backend/package.json">
{
  "name": "deqs-backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start": "node server.js",
    "migrate": "knex migrate:latest",
    "migrate:rollback": "knex migrate:rollback",
    "migrate:status": "knex migrate:status",
    "migrate:make": "knex migrate:make",
    "typecheck": "tsc --noEmit",
    "test:server-db": "node --test server-db.test.mjs"
  },
  "dependencies": {
    "express": "^5.3.0",
    "knex": "^3.1.0",
    "pg": "^8.13.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": "^22.13.0 || >=24.0.0"
  }
}
</file>

<file path="backend/router.js">
const express = require('express');
const router = express.Router();
const userController = require('./controller');


//get user
router.get('/users', userController.getData);

// add user
router.post('/users', userController.addUser);

// edit user
router.put('/users/:name', userController.editUser);


// delete user
router.delete('/users/:name', userController.deleteUser);

module.exports = router;
</file>

<file path="backend/server.js">
const express = require("express");
//db.js
const db = require("./db");
//router.js
const userRoutes = require("./router");

const PORT = Number(process.env.PORT) || 4000;

//speical permissions
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000"; 

const app = express();

//cors
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

//   JSON body
app.use(express.json());

//router.js
app.use("/api", userRoutes);

app.listen(PORT, () => {
  console.log(`we are running at port ${PORT}`);
});
</file>

<file path="docs/architecture/database-schema.md">
# PostgreSQL schema and planned write boundaries

The [Milestone A migrations](../../supabase/migrations) are the executable source for the foundational schema and grants. The tables and constraints below describe the design. Posting, reconciliation, recovery and other write routines remain later milestones.

## Conventions and ownership

Store tables in unexposed `deqs_data`. Use `store_id smallint` fixed to `1` to enforce a single store in this release. Use UUIDs for customer, cutover, entry, correction, operation and recovery-epoch identifiers. Primary keys and foreign keys below carry `store_id` so a future expansion cannot silently create cross-store references. Actor references use a stable owner principal ID and retain the Auth user ID that actually authorized each command. The stable principal survives a reviewed Auth rebind after recovery.

Use `timestamptz` for instants and set server/report serialization to UTC. Use `date` for named local dates such as the paper-ledger cutover day. DB-managed insertion times and actor IDs come from trusted database context. Use `bigint` for signed individual ledger deltas in fils. Set a much smaller application limit per entry than the signed 64-bit range so a reversal is representable. Review the limit with the owner. PostgreSQL `SUM(bigint)` returns exact `numeric`, so avoid downcasting aggregates without an explicit bound. Return amounts, totals and sequence numbers as decimal strings at the API boundary. [PostgreSQL numeric types](https://www.postgresql.org/docs/current/datatype-numeric.html) · [PostgreSQL aggregates](https://www.postgresql.org/docs/current/functions-aggregate.html)

## Tables and constraints

| Table | Proposed fields and rules |
| --- | --- |
| `stores` | `store_id` PK and singleton check, `owner_principal_id` UUID with `UNIQUE (store_id, owner_principal_id)`, nullable unique `owner_auth_uid`, `access_enabled`, `writes_enabled`, `write_epoch` UUID, `created_at`. Check that enabled access has an Auth binding and enabled writes imply enabled access. The binding is verified by an operator against Supabase Auth and checked against signed JWTs. Keep it separate from historical actor IDs so a portable restore can disable access and rebind safely. Only a restricted operator provisions or changes it. |
| `customers` | PK `(store_id, customer_id)`, `display_name`, normalized `name_search`, nullable `phone_normalized`, `created_at`, `updated_at`, nullable `archived_at` and `archived_by`. Require a nonblank bounded name, valid optional phone text and paired archive fields. `store_id` and the optional archive actor reference the store/principal. Names and phone numbers can be shared. They drive duplicate warnings rather than identity constraints. Archive and restore retain the ID and all references. |
| `customer_profile_events` | Append-only events for creation, edits, archive and restore, with store, customer, stable principal and Auth IDs, before/after profiles and recorded time. Customer mutation routines must append their events in the same transaction. |
| `ledger_cutovers` | PK `(store_id, cutover_id)`, `local_cutover_date`, `effective_at`, `paper_ledger_ref`, expected reviewed paper-account count and exact opening total, `state` (`draft`, `reconciling`, `closed`), `created_at`, nullable `closed_at`, closure snapshot/watermark and owner. Count accounts after grouping split source lines. Unique `(store_id, local_cutover_date)`. A partial unique key on `store_id` for draft/reconciling states permits at most one active cutover. The posting and close routines check migration mode. Closed snapshots are read-only to application writers. |
| `financial_commands` | PK `(store_id, idempotency_key)`, `write_epoch`, `kind`, `payload_version`, canonical `payload jsonb`, stable `actor_principal_id`, `actor_auth_uid`, `state` (`prepared`, `committed`, `cancelled`), `prepared_at`, nullable `terminal_at`, nullable `receipt jsonb`. FK actor to the store principal. Constrain timestamp/receipt combinations by state. A committed receipt is required and a cancellation retains its own terminal result if exposed. The original command details and terminal outcome are immutable. The journal remains available for replay checks and recovery. |
| `ledger_entries` | PK `(store_id, entry_id)`, `ledger_seq bigint` identity and unique, `command_key`, `ordinal`, `customer_id`, `economic_kind` (`opening`, `purchase`, `repayment`), `entry_role` (`original`, `reversal`, `replacement`), `delta_fils`, optional bounded note, `effective_at`, `recorded_at`. FK to command and customer. Unique `(store_id, command_key, ordinal)`. Check sign/range for originals and replacements. Reversals are checked against their targets. The command provides the owner identity and request provenance. Ledger rows are insert-only. |
| `opening_drafts` | Editable source row scoped to cutover and unique paper reference, with reviewed customer details, exact proposed fils, optional linked customer and monotonically increasing revision. Approval binds a single command to the reviewed revision and makes the draft immutable. |
| `opening_claims` | PK `(store_id, cutover_id, customer_id)`, `entry_id`, `origin_entry_id`, `claim_kind` (`source`, `transfer`), optional normalized `paper_ref`, `recorded_at`. FK to cutover, customer and entries. Unique `(store_id, entry_id)`. Require `paper_ref` only for a source claim and use a partial unique index on `(store_id, cutover_id, paper_ref)` for source claims. The source claim points to its original opening as both entry and origin. A transfer claim points to a replacement entry and retains the source origin. Claims are permanent reservations. |
| `ledger_corrections` | PK `(store_id, correction_id)`, `command_key`, `target_entry_id`, `reversal_entry_id`, optional `replacement_entry_id`, signed `previous_delta_fils` and `corrected_delta_fils` (zero for a void), required bounded `reason`, `recorded_at`. FK to command and all linked entries. Unique command, target, reversal and non-null replacement per store. Require distinct link IDs. The command identifies the authorized owner. The target/replacement chain preserves history and can be followed to the original entry. |

`opening_claims` is the uniqueness fence for posting an opening or transferring one to a different customer. A correction that changes an opening amount on the same account uses the existing claim. The source reference is reserved even after a void or transfer. Initial migration completion requires one approved source opening per included paper account, with an explicit zero for a reviewed settled row if included. A duplicate amount by itself is irrelevant.

Commands store a required SHA-256 fingerprint alongside versioned JSONB. Opening claims also link the approving command and original draft. The only Milestone A application RPC is `deqs_api.owner_context()`. Its restricted `deqs_context_reader` helper can select only the store through forced RLS for the bound owner with AAL2. The migrations seed no owner and grant no application table writes.

### Indexes beyond keys and uniqueness constraints

| Lookup | Proposed index |
| --- | --- |
| Customer selector and duplicate hints | `(store_id, archived_at, name_search, customer_id)` and partial `(store_id, phone_normalized)` for non-null phones. Use normalized prefix search initially. |
| Account statement and balance | `ledger_entries (store_id, customer_id, effective_at, ledger_seq)` with deterministic keyset paging for statements. |
| Store period reporting | `ledger_entries (store_id, effective_at, ledger_seq)`. Use the sequence key for knowledge cutoffs. |
| Recovery queue | Partial `financial_commands (store_id, prepared_at)` for `state = 'prepared'`. Committed receipts can be found by key or by `terminal_at` when needed. |
| Opening reconciliation | `opening_claims (store_id, cutover_id, origin_entry_id)` alongside the claim PK and the unique source reference. |

Do not index every JSON field. Maintain one authoritative ledger and query it directly at this store's scale. Measure statement and report plans on representative volumes before adding a projection. A later projection would need a rebuild and exact reconciliation from the same ledger.

```mermaid
erDiagram
    STORES ||--o{ CUSTOMERS : owns
    STORES ||--o{ LEDGER_CUTOVERS : defines
    STORES ||--o{ FINANCIAL_COMMANDS : accepts
    CUSTOMERS ||--o{ LEDGER_ENTRIES : has
    FINANCIAL_COMMANDS ||--o{ LEDGER_ENTRIES : posts
    FINANCIAL_COMMANDS ||--o| LEDGER_CORRECTIONS : records
    LEDGER_ENTRIES ||--o| LEDGER_CORRECTIONS : is_target_of
    LEDGER_CUTOVERS ||--o{ OPENING_CLAIMS : scopes
    CUSTOMERS ||--o{ OPENING_CLAIMS : reserves
    LEDGER_ENTRIES ||--o| OPENING_CLAIMS : creates
```

## Which layer enforces each invariant

- **Keys and row checks:** enforce command, ordinal, claim, source and reversal uniqueness, parent existence, required fields, sign/range and state shape. Use explicit `NOT NULL` on required fields so nulls do not pass checks. FK deletion defaults to restrictive behavior. Never cascade-delete financial history.
- **Cross-row invariants:** the posting routine validates the expected number and roles of entries per command, correction linkage, negated reversal, amount equality with correction metadata, original effective date, opening claim lineage, and cutover/archival state. A deferred constraint trigger or equivalent commit-time guard in the first financial milestone must reject a committed command missing required entries or audit/claim rows, as well as ledger entries tied to an uncommitted command state. These rules cannot be expressed by ordinary row `CHECK` constraints alone. Test a forced violation that happens at commit.
- **Immutability:** grant the posting role ledger, claim and correction `INSERT` and required `SELECT` only. Prohibit row mutation/deletion and truncation in runtime privileges and add explicit update/delete guards to immutable tables. Constrain journal updates to the defined transitions. Corrections append entries. A privileged database operator can still alter a database, which is why access separation, restore drills and independent backups matter.
- **Ownership and RLS:** authorize the current bound owner with verified MFA assurance, then resolve store and actor within the routine. Use forced RLS and narrow policies for the limited runtime roles. The store ID and acting principal do not come from a writable browser field. See [security](security.md).

Example declarations to translate during implementation, with full FKs and grants still to be specified in migration code:

```sql
-- Keys on the proposed tables
PRIMARY KEY (store_id, idempotency_key)                 -- financial_commands
UNIQUE (store_id, command_key, ordinal)                -- ledger_entries
PRIMARY KEY (store_id, cutover_id, customer_id)         -- opening_claims
UNIQUE (store_id, target_entry_id)                     -- ledger_corrections

CREATE UNIQUE INDEX opening_source_once
  ON deqs_data.opening_claims (store_id, cutover_id, paper_ref)
  WHERE claim_kind = 'source';
```

Database semantics: [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) · [PostgreSQL triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html).
</file>

<file path="docs/architecture/decisions.md">
# DEQS architecture decisions

| ID | Status | Decision and consequence |
| --- | --- | --- |
| ADR-001 | Adopted | Save an opening as an editable, versioned draft. Approve explicitly in a separate transaction. Approval must use the reviewed draft revision and atomically write the ledger entry, source claim and receipt. This supersedes the Phase 3.0 direct-opening Save design. |
| ADR-002 | Adopted | Represent each ledger delta with signed integer fils and return amounts as strings at the API boundary. PostgreSQL sums use exact numeric arithmetic. Maintain positive debt and negative customer credit. The owner still sets the business per-entry cap and accepted input conventions. |
| ADR-003 | Adopted | Keep one command journal across financial operations. Store a SHA-256 fingerprint of versioned intent alongside canonical JSONB and compare the full canonical payload for replay. Defer group checks to commit. Product replay, serialization and failure recovery remain Milestone D gates. |
| ADR-004 | Adopted | Start with no provisioned owner and no runtime write surface. Keep data and helper schemas private. The AAL2 read helper runs with a limited non-login role under forced RLS. Expose only reviewed wrappers through the Data API after platform verification. |
| ADR-005 | Adopted | Keep archived history and balances intact. Default to read-only for archived accounts and require restoration before new postings. A correction exception requires a separately approved policy, explicit authorization and dedicated tests. |
| ADR-006 | Adopted | Store effective and recorded instants, derive calendar periods using `Asia/Amman`, and reproduce reports against a committed watermark. Keep private financial drafts and pending writes server-side and keep writes online-only. |
| ADR-007 | Adopted | Preserve the stable owner principal separately from the Supabase Auth binding. Restore into isolation, reconcile, rebind the owner under supervision, rotate the write epoch, then reopen access and writes deliberately. No unattended replay follows a restore. |
| ADR-008 | Pending owner review | Choose staging and production environments, owner recovery/custody, retention, recovery objectives and budget. Also confirm the paper-ledger cutover, exceptions, opening totals, amount cap and overpayment confirmation. The relevant milestones stay gated until the required decisions are recorded. |
</file>

<file path="docs/architecture/ledger-and-reporting.md">
# Ledger rules, paper cutover and reporting

## Money and balance

All financial amounts are JOD. One dinar is 1,000 fils. Convert a validated decimal input to an integer using string operations and exact integer arithmetic. Normalize supported Arabic and Western digits deliberately. Reject ambiguous separators, signs where the form accepts a positive amount, excess decimal places and out-of-range amounts. Format the result to three decimals. Never convert a monetary string to a JavaScript `Number` or SQL floating-point type. The UI receives decimal strings and explicit availability. `0.000` is a known settled balance.

An account balance is the sum of its committed ledger deltas. Positive means the customer owes the store. Negative means the store owes credit to the customer. Zero means settled. Purchases add a positive delta. Repayments subtract their full amount. A repayment beyond the debt creates credit after a clear confirmation of the resulting credit. Purchase notes are optional, bounded, displayed as text and included in the command's canonical details.

Applying credit is inherent in the signed balance. For a purchase of `p` fils and a prior balance `b`, the credit applied is `min(p, max(0, -b))` and the new balance is `b + p`. Store the full purchase once. The credit applied is a derived explanation at posting time in the receipt, with no separate credit spend or mutable credit balance. Show before and after balances on the committed receipt. An owner-approved business rule can reject or request confirmation for overpayments. The default proposal allows them with confirmation based on the current account at posting time. If a concurrent write changes the classification the owner accepted, return a fresh preview and require explicit confirmation for a new command after safely cancelling the prepared one.

| Operation | Delta | Balance after operation | Display |
| --- | ---: | ---: | --- |
| Opening debt | +15,000 | +15,000 | Debt 15.000 JOD |
| Repayment of 20.000 | −20,000 | −5,000 | Credit 5.000 JOD |
| Purchase of 3.000 | +3,000 | −2,000 | Credit 2.000 JOD, 3.000 applied |
| Purchase of 4.000 | +4,000 | +2,000 | Debt 2.000 JOD, 2.000 applied |
| Repayment of 2.000 | −2,000 | 0 | Settled 0.000 JOD |

Openings start with nonnegative debt, including an explicit zero if the row is reviewed as settled. If paper records show prepaid credit, route those rows to exception review and approve the sign policy before import. An archived account retains its balance and history. Allow archive with a clear nonzero-balance warning and require restoration before new postings by default. A correction exception requires separately approved policy and authorization. Restoration reuses the same account and openings.

## Corrections and wrong-customer postings

Target the latest effective original or replacement entry. Reversal entries and already reversed targets are ineligible. Preview the impact and require a reason. The posting transaction verifies the target is still current and appends a reversal equal to its exact negation. A correction adds a replacement with the original economic kind, the corrected signed amount and the original effective time. A void appends only the reversal. Each correction links target, reversal and optional replacement, stores the previous and corrected signed amounts, and records the owner, reason and insertion time through its correction and command records. A replacement may later be corrected through a new link. The original rows remain readable.

For a wrong-customer posting, reverse on the original account and add the replacement to the correct account in the same transaction. Validate both accounts and the target before writing, apply the same store-wide write lock, and return both balances on commit. An opening transfer reserves the destination's cutover claim in that transaction, preserves its paper origin and keeps the original slot and source consumed. If the destination already has a claim, reject the transfer for manual reconciliation. Complex cases where an erroneous opening consumed the only slot for another legitimate paper row require an approved, audited exception design before live import. Never clear a claim to force the import through.

Example: a 15.000 purchase on customer A should be 12.000 on customer B. A keeps the original +15,000 and receives a −15,000 reversal. B receives +12,000. The correction records both accounts and `previous=15000`, `corrected=12000`. The net ledger change is −3,000 and the revised purchase total is 12.000, while the audit view shows every leg.

## Paper-ledger cutover for approximately 100 customers

1. **Freeze the source.** The owner records the paper ledger identity, a local cutover date and instant, source account count, and independently tallied total. Give each reviewed account a stable paper reference such as book, page and line. Aggregate split source lines for one customer to one opening with its documented source reference. Review ambiguous names, shared phones, negative entries, missing pages and duplicate references first. Retain the paper original and a controlled reconciliation copy according to owner-approved retention.
2. **Prepare the migration.** Open one cutover in a migration-only state. Plan a freeze between paper closing and electronic opening, and pause ordinary electronic purchases and repayments until reconciliation. If trading must continue, keep post-cutover paper activity separate with source references and approve a controlled, ordered catch-up procedure before live posting. That procedure must specify deduplication and effective-time rules. The same transaction never lands in both opening and post-cutover activity.
3. **Enter each customer manually.** Capture name, optional normalized phone, paper reference and opening debt. Show name/phone duplicate warnings and candidate customers. The owner confirms linking to an existing stable ID or creating a separate customer. Similar names or identical phone numbers are warnings. Existing claims and source references are hard duplicate blocks.
4. **Save each draft immediately.** Separate **Save** and **Add New Customer** controls. Save persists the editable paper draft and keeps it visible after refresh. Add New Customer opens a blank form after the prior result is known or an unsaved edit is explicitly discarded.

   **Review and approve separately.** Use the reviewed draft revision and explicit owner confirmation. Approval atomically posts the opening, any new customer, the source claim and the committed receipt. Reconcile an uncertain approval by its original command key before attempting another approval.
5. **Reconcile before close.** Compare the reviewed source list, distinct source count and independently tallied amount against the active approved opening heads and the full opening ledger as of cutover. Check each source-to-account mapping, reviewed zero rows, voids, transfers and amount differences. Resolve discrepancies with linked corrections. Once balanced, the owner approves the close. The close routine records counts, exact totals, time, owner and report watermark in one transaction and enables ordinary writes. Freeze original input metadata and the closing snapshot.
6. **Handle later discoveries through corrections.** Show the original opening, linked adjustment and revised balance. Keep the signed-off reconciliation snapshot available alongside its revised view. A genuinely omitted source after close needs an explicitly approved late-opening exception flow before it can be posted. A second cutover may not reload an existing balance. No bulk replay or automatic re-import is part of initial migration.

## Time and report semantics

Record both `effective_at`, the financial event time, and `recorded_at`, the server instant captured once for the posting transaction after acquiring the write lock. Store both as `timestamptz` and serialize UTC. `recorded_at` is an audit insertion time, not a promise of the exact commit clock reading. New purchases and repayments default to server time. An optional paper catch-up workflow needs explicit rules for past effective times and prohibits future-effective postings. Openings use the approved cutover instant and corrections inherit the target's effective time. Set the cutover instant from the agreed Amman local time and store the original local day for audit.

Display instants in `Asia/Amman`. For a day or month, derive local start and next local start separately and convert each to UTC with the IANA zone, then filter the half-open interval `[start, end)`. Never hardcode an offset or add a fixed number of hours to get the next day. [PostgreSQL time zones](https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-ZONECONVERT)

| Report | Rule |
| --- | --- |
| Outstanding debt and customer credits | First sum ledger entries by customer as of the effective cutoff. Debt is `SUM(GREATEST(balance, 0))` and credit is `SUM(GREATEST(-balance, 0))`. Never net one customer's credit against another customer's debt. Both active and archived accounts contribute to store totals. |
| Purchases and repayments | Sum effective, unreversed purchase and repayment heads by local period. Repayments are displayed as positive magnitudes. Gross purchase amount stays intact when it uses existing credit. |
| Opening balances | Report separately by cutover, source and account using the effective heads. Include original reconciliation totals, later corrections and revised totals. Never count openings as ordinary purchases. |
| Archived accounts | Statements and store totals still include them. Offer separate active/archived views. The proposed filter uses current archive status and is labelled accordingly. Historical archive-status reporting would need a separate history design. |
| Corrections | Provide recorded-time audit activity showing original, reversal, replacement and operator reason. Financial period reports restate the target's effective period. Label restated results and link the correction audit. |

Use one consistent snapshot for each report. When saving a reconciliation or reproducible report, record the local/effective boundaries and the maximum visible committed `ledger_seq` from the same snapshot. Sequence gaps from rollbacks are harmless. Only use a captured report watermark from a committed snapshot so no correction is split. Apply the watermark to originals, reversals and replacements before identifying effective heads. For a revised report use a new watermark. For an as-recorded report reuse the old watermark. Compute balances by summing all eligible signed entries, including reversals. The effective-head view is for categorizing economic activity and must reconcile to the ledger.
</file>

<file path="docs/architecture/README.md">
# DEQS Phase 3.0 architecture

Design proposal for one grocery store and one authorized owner in Jordan. Reviewed on 8 November 2026 against checkpoint `74d91bc9f44a57f00ab91fe2f2f8fb96dc7fba2a`. The design assumes an online connection and a hosted deployment. The owner decisions in the roadmap govern any later implementation.

The [master implementation plan](../DEQS-IMPLEMENTATION-PLAN.md) governs milestone order. See the [decision record](decisions.md) for corrections to the original design and [progress](../DEQS-PROGRESS.md) for implementation and verification status.

## Recommended system

Keep Next.js App Router as the application and add Supabase Auth and managed PostgreSQL. Use one server-only data access layer for owner checks and calls to a small set of database routines. PostgreSQL is the source of truth for posted financial entries and operation receipts. The browser handles forms, pending states and explicit recovery. A private reporting query derives balances from the ledger each time at this scale.

```mermaid
flowchart LR
    UI[Owner browser and Arabic RTL interface] -->|HTTPS and same-origin session| APP[Next.js server and data access layer]
    APP -->|Provisioned owner session and MFA| AUTH[Supabase Auth]
    APP -->|Owner JWT and minimal requests| RPC[Supabase Data API and guarded RPCs]
    RPC --> DB[(Private PostgreSQL schema)]
    DB -->|Committed receipt or authorized report| RPC
    DB -->|Scheduled encrypted exports| BACKUP[(Independent backup storage)]
```

Use separate development/staging and production data. Staging uses synthetic customers and amounts. A single serialized write path is sufficient for one owner and simplifies concurrency, opening-balance approval and audit. Database access is server-authorized, transactions are short, and generated reports avoid mutable duplicate totals. DEQS has no offline financial queue. A network interruption pauses posting until the owner can verify or resume the same server-side command.

## Current checkpoint review

| Area | Observed at review |
| --- | --- |
| Git | `main` was clean at `74d91bc9f44a57f00ab91fe2f2f8fb96dc7fba2a`, descended from `eb43b6243319ae38620a4f894779636a93574b25`. |
| Configuration | Next.js 16.4.5 from the lockfile, App Router, strict TypeScript with the `@/*` alias, and Tailwind. Next config disables the powered-by header. |
| Routes | `/` dashboard, plus `/customers`, `/archive`, `/reports`, and `/settings` placeholders. The root layout provides Arabic/RTL and the shared app shell. |
| Components | The collapsible navigation and mobile drawer live in `AppShell`. `DebtSummary` distinguishes unavailable, masked and revealed states. The current dashboard supplies unavailable data. Fixtures exercise the available and zero states. |
| Verification | Phase 1.1 verified the welcome interface. Phase 2 verified the dashboard and navigation. Phase 2.1 recorded 88 passing production browser assertions across six viewports. The checkpoint run independently passed TypeScript, ESLint and 17 reported privacy tests, and built all five routes on Node 24.22.1. |
| Remaining scope | The existing application is an interface foundation. Owner authentication, data storage, customer operations and ledger posting are future work. |

Sources: [Project README](../../README.md), [handover snapshot](../DEQS-PROGRESS.md), [Phase 1.1 QA](../phase-1.1-qa.md), [Phase 2 QA](../phase-2-qa.md), [Phase 2.1 QA](../phase-2.1-qa.md).

## Reproducible runtime policy

Both Node 26.13.0 and Node 24.22.1 were confirmed available on the workstation. During the checkpoint, the default Turbopack production build on Node 26.13.0 failed at CSS worker startup both in and outside the sandbox. A sandboxed Webpack diagnostic hit a filesystem permission error. The unchanged production script passed with the installed Node 24.22.1 runtime. This isolates a working configuration for this workspace. The underlying Node 26 worker failure remains undiagnosed.

Milestone A pins Node **24.22.1** in `.node-version` and documents npm **11.20.0**. The existing `engines` range remains a compatibility declaration. Use the lockfile with `npm ci` and print versions when recording checks. Verify the hosting runtime can honor the pin. Review supported Node 24 security patches and promote them after a full check. [Node.js release and LTS policy](https://nodejs.org/en/about/previous-releases)

## Reading order

1. [Proposed database schema](database-schema.md) defines tables, keys, indexes, ownership and invariants.
2. [Ledger, opening balances and reports](ledger-and-reporting.md) defines money, corrections, migration and time.
3. [Transaction safety and online saves](transaction-safety.md) defines the full request lifecycle and duplicate protection.
4. [Owner authentication and data security](security.md) defines the authorization boundary and account recovery.
5. [Backups and disaster recovery](recovery.md) defines plan dependencies, targets and restore verification.
6. [Roadmap and owner decisions](roadmap.md) defines the acceptance gates, tradeoffs and Phase 3.1 boundary.
</file>

<file path="docs/architecture/recovery.md">
# Backup and disaster recovery

## Protection layers and proposed targets

Use the managed PostgreSQL backup feature plus independently stored, encrypted logical exports. Create automatic schedules, measure usable recovery points and monitor backup age, failure and restore results. Retain a manifest with schema version, export timestamp, committed watermark, and reconciliation counts/totals from the same snapshot. Treat that manifest as financial data. Keep encryption keys and recovery credentials separately retrievable by the authorized operator.

| Layer | Proposal | Capability or cost dependency |
| --- | --- | --- |
| Managed recovery | Prefer a paid production plan with point-in-time recovery (PITR), initially seven days of fine-grained retention. Confirm the earliest/latest available recovery points, usable restore procedure and selected compute/plan conditions. | Supabase documents daily backups for Pro, Team and Enterprise, with 7, 14 and up to 30 days of daily retention respectively. PITR is a paid add-on for eligible plans with retention-based charges. PITR replaces managed daily backups when enabled. Verify features and cost before purchase. |
| Separate backup | Export DEQS data and required schema/configuration references nightly using a consistent snapshot. Store at least 30 daily copies and six month-end copies in a separate account or provider with encryption, restricted roles, versioning and retention protection. Review retention with the owner. | Export scheduling, storage, retention, access controls, outbound traffic and restore capacity may add cost. Managed physical backups may not be directly downloadable. Validate the logical export and its restore procedure. |
| Deletion protection | Separate backup credentials from Supabase project administration and daily app access. Restrict project deletion and destructive SQL, require explicit operator review, and use immutable retention where supported. Verify independent copies survive project deletion. | Supabase documents that project deletion removes associated provider backups. Separate storage is a distinct recovery dependency. |
| Restore drills | Test an isolated restore before real data entry, quarterly, and after material schema/identity changes. Record elapsed time, recovered point, errors and reconciliation results. | An isolated restore project and operator time may incur additional cost. Some restore/clone paths depend on project and plan capabilities. |

Provider backup terms checked on 8 November 2026. Confirm them again at provisioning. [Supabase backup and PITR documentation](https://supabase.com/docs/guides/platform/backups) · [PostgreSQL PITR](https://www.postgresql.org/docs/current/continuous-archiving.html)

**Proposed approval targets** (not service guarantees):

| Scenario | RPO, maximum tolerated lost history | RTO, target time to verified service |
| --- | --- | --- |
| Recoverable production incident with healthy verified PITR | 15 minutes | 4 hours |
| Project/provider loss requiring separate nightly export, or approved daily-only fallback | 24 hours | One business day, target 8 working hours |

RPO measures recoverable data age at the failure, including export failures or WAL lag. RTO includes detection, operator access, restoration, security checks and reconciliation before reopening writes. Alert if recovery point age threatens either target. If no proven backup meets the approved limits, escalate to the owner before accepting real balances. A durable commit on the running primary cannot guarantee zero loss in a later disaster.

## Export contents and restore prerequisites

- Export the full authoritative DEQS schema and data, including command states/receipts, openings, corrections, ledger, customers, epoch and ownership metadata. Use a consistent database snapshot for data and control totals. Keep versioned migration source and an inventory of grants, routines, RLS, provider settings, secrets references and runtime version. Use a dedicated authorized backup identity for read access and no app write privileges.
- Verify schema, grants and sequences after restoration. A generic Supabase logical dump may omit managed Auth/Storage schemas and data depending on flags. Test the supported Auth restore path or re-provision the owner, retain stable principal/history and rebind the verified Auth UID while disabled. Restore secrets/settings via a separate runbook and re-enroll MFA when required. Historical Auth UID snapshots remain evidence after a rebind. Storage objects are outside ordinary database backups. If paper scans or other objects are ever approved, design and test their separate encrypted backups before adoption. [Supabase CLI backup and restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
- Keep exports in independent storage with retention controls that a compromised daily app credential cannot delete. Ensure backup/recovery access can work if the original project is unavailable. Keep an independent encrypted copy of cutover reconciliation evidence. Avoid logs or support exports containing owner session data or financial detail. Monitor and periodically test readability, integrity and decryptability. [Supabase backup limitations](https://supabase.com/docs/guides/platform/backups)

## Recovery procedure

1. **Freeze.** Declare a read-only incident or maintenance outage. Disable writes on the old primary if available and stop application routing to it. Fence old credentials/endpoints so recovery cannot create two writable primaries. Preserve the original state, recoverable WAL and backup evidence. Record the last known receipts, report watermark and incident time. Stop operators from retrying uncertain commands until reconciliation.
2. **Choose and restore.** Select a verified recovery point before corruption, or the newest valid one for infrastructure loss. Restore to an isolated project if supported. Keep app access/writes disabled from the first connection, use scoped recovery credentials, and apply the corresponding app/schema version. Confirm no staging connection points to the original production writer.
3. **Validate integrity.** Check schema versions, keys, sequences, role grants, RLS and default function privileges. Verify that every committed command has the expected entries and receipt, each reversal matches its target, and opening source/slot counts match claims. Recompute balances, debt and credit totals from the ledger, compare per-customer data and totals with the manifest and cutover evidence, and check the report watermark. Prove unauthorized reads/writes are denied. Verify the owner UID, MFA and approved session settings before granting access.
4. **Reconcile the gap.** Rotate `write_epoch` while still in maintenance, and invalidate old sessions and endpoints as appropriate. Compare the recovered receipt journal against any owner receipts, available original database evidence and paper records after the chosen point. A known committed receipt that is absent after restoration represents a possible lost transaction. Mark it for owner review. Preserve existing terminal receipts and never automatically replay old prepared or unknown keys. Stale keys cannot post under the new epoch. If approved evidence proves a real-world transaction was lost, deliberately post it under a new current-epoch command and link it to the incident/old evidence through authorized audit notes. Retain a review list of unresolved cases and avoid speculative amounts.
5. **Reopen deliberately.** Obtain owner sign-off on totals, any unresolved gap and actual RPO/RTO. Confirm the old endpoint is fenced. Enable the new production writer and update application routing under controlled access. Observe first real receipts and backups. Record the restore point, recovered totals, approval and incident decisions. If the reconciliation fails, keep writes disabled and investigate or try another validated recovery point.

Idempotency guarantees apply to history that survives in the active database. A restore can roll back both entries and replay receipts together. Independent evidence, epoch fencing and owner reconciliation are essential to recover safely without duplicate posting.
</file>

<file path="docs/architecture/roadmap.md">
# Phase 3 roadmap and owner decisions

The [master implementation plan](../DEQS-IMPLEMENTATION-PLAN.md) governs the A–L delivery sequence. The earlier 3.x milestones below retain technical context and owner decisions.

## Proposed milestones

These milestones are future work. Use synthetic records in local and staging verification. Keep the Phase 2.1 dashboard and privacy behavior covered by its existing checks. Each milestone needs a reviewable result and its own acceptance evidence before advancing.

### 3.1 — Reproducible infrastructure and schema foundation

- **Scope:** pin the approved Node/npm baseline and record deployment assumptions. Plan separate environments, versioned migrations and a disposable PostgreSQL/Supabase-compatible verification target. Create the base schema, constraints and role boundaries there once authorized.
- **Prerequisites:** owner acceptance of the design and explicit permission for environment setup. Decide whether local-only or hosted staging is appropriate before provisioning or spending.
- **Boundary:** infrastructure and synthetic schema checks only. Application pages remain on their existing data-unavailable states. Live provisioning requires separate authorization.
- **Security:** least-privilege database roles, schema exposure allowlist, RLS enabled and initially fail-closed, operator secrets separate from runtime.
- **Tests and acceptance:** clean install/build on the pinned runtime, reproducible schema application on an empty test database, rejection of duplicate claims and invalid signs/references, no direct anonymous or authenticated table access, and successful recreation of the disposable environment from versioned files.

### 3.2 — Owner identity and authorization

- **Scope:** provision a single test owner, integrate server-managed sessions and TOTP, and expose minimal status/read routines for boundary tests.
- **Prerequisites:** 3.1 environment, verified owner account and recovery-factor policy.
- **Boundary:** authentication and permission checks with synthetic reads. Financial posting remains disabled.
- **Security:** sign-up/anonymous disabled, verified UID plus `aal2` for private data, protected refresh, logout, write CSRF controls, and no shared private caching.
- **Tests and acceptance:** allow the bound `aal2` owner. Reject anonymous, unbound, `aal1`, invalid and revoked-access cases through both Next.js and direct RPC. Complete a recovery drill and confirm no elevated key reaches client bundles or payloads.

### 3.3 — Customer records and archival

- **Scope:** create/search/view/edit customers, optional phone, duplicate warnings, archive and restore stable IDs.
- **Prerequisites:** 3.2 authorization and agreed archive/duplicate-review policy.
- **Boundary:** customer metadata only. No balances, payments or ledger history editing.
- **Security:** validate user input, derive ownership server-side, serialize lifecycle changes through guarded routines, protect contact details and preserve account references.
- **Tests and acceptance:** create/update distinct customers with shared names or phones, warn on likely duplicates, reject unauthorized operations, and archive/restore the same identifier without losing history or allowing duplicate IDs.

### 3.4 — Financial command and purchase core

- **Scope:** implement prepare/post/status/cancel, immutable journal, authoritative ledger and one purchase command, including optional note and committed receipt.
- **Prerequisites:** 3.1–3.3, approved amount limits and save-state wording, and tested host transaction-end semantics.
- **Boundary:** synthetic purchase posting and test UI only. No production ledger use.
- **Security:** exact-string validation, current owner/MFA and epoch checks, writer lock, read-only status, limited database grants and no amounts in logs or shared caches.
- **Tests and acceptance:** reproduce duplicate, conflicting, parallel, interrupted and cancelled requests. Prove an identical retry returns the original receipt, a fresh key can post an identical purchase, and deferred commit failure never produces success or ledger rows.

### 3.5 — Opening-balance migration rehearsal

- **Scope:** cutover setup, manual customer + opening save, duplicate warnings, source/slot claims, review and close workflow. Rehearse at least 100 synthetic paper accounts.
- **Prerequisites:** 3.3 customer workflows, 3.4 command core, approved cutover and source-reference convention.
- **Boundary:** synthetic import and review only. Live cutover waits for correction, recovery and end-to-end gates.
- **Security:** owner-only approvals, minimal personal data, controlled access to source evidence, stable key across interrupted saves and guarded cutover state.
- **Tests and acceptance:** Save persists an editable draft without posting. Explicit approval commits one opening and any new customer per reviewed source. Check atomic rollback, duplicate slot/source denial, explicit zero, separate Save and Add New Customer, and exact reconciliation before close.

### 3.6 — Repayments and automatic credit

- **Scope:** repayments, overpayment confirmation, signed balances, and credit consumption by later purchases.
- **Prerequisites:** 3.4 command core and approved overpayment/archived-account policy.
- **Boundary:** ledger math and committed receipts. No second credit balance or separate credit-spend write.
- **Security:** server validation, fresh before/after calculation under the write lock, exact values at every boundary and no unauthorized reads or writes.
- **Tests and acceptance:** partial repayment, exact payoff, overpayment, credit smaller/equal/larger than a purchase, zero, upper bound, and conflicting concurrent confirmations. Each displayed before/after value and receipt agrees with the recomputed ledger.

### 3.7 — Corrections, voids and account transfers

- **Scope:** linked reversal/replacement, required reason, wrong-account move and opening transfer with destination claims.
- **Prerequisites:** 3.4–3.6, approved correction/exception policy.
- **Boundary:** current-head corrections and audited moves. Original rows and approved source history remain available.
- **Security:** owner `aal2`, unchanged target check, atomic correction legs, unique reversal, and least-privilege immutable storage.
- **Tests and acceptance:** correct a purchase, repayment and opening, correct a replacement, void and move, reject repeated target reversal, reject a claimed destination, and force a failure between legs. Audit links, before/after amounts, owner, time and reason are complete and both accounts reconcile.

### 3.8 — Dashboard and reporting integration

- **Scope:** bind protected dashboard DTOs, activity/statement views, time-bounded totals, archived-account views and revised versus as-recorded reporting.
- **Prerequisites:** 3.6–3.7, accepted cutover and reporting semantics.
- **Boundary:** report from committed entries. Preserve the current Arabic RTL navigation and display masking.
- **Security:** authorization before reads and serialization, no shared cache, minimal DTOs and no private data in public shell/static output.
- **Tests and acceptance:** check Amman day/month boundaries and recorded watermarks, account-level debt and credit aggregation, corrected-period reports and archived balances. Run dashboard privacy and route regressions. Report totals reconcile to the ledger and a logged-out caller obtains no owner data.

### 3.9 — Operational backup and recovery readiness

- **Scope:** automate managed and independent backups, alerts, operator runbook and isolated restore. Plan controls from 3.1 and verify them with the completed schema here.
- **Prerequisites:** chosen hosting/retention, authorized isolated restore target, completed financial and security schema.
- **Boundary:** rehearsal with synthetic data and protected operational configuration. A real destructive restore is a separate incident decision.
- **Security:** independent credentials/storage, encrypted retention, verified owner rebind/MFA and old writer fencing.
- **Tests and acceptance:** demonstrate project-loss restore from independent storage, replay protection after epoch rotation, ledger and receipt reconciliation, and owner-only access. Measure recovered point and elapsed time against approved RPO/RTO and record owner sign-off.

### 3.10 — End-to-end acceptance and live cutover

- **Scope:** run the full workflow rehearsal, confirm operational support, then schedule the separately approved paper cutover.
- **Prerequisites:** 3.1–3.9 accepted, owner-approved costs, recovery exercise, signed source checklist and go-live criteria.
- **Boundary:** staging rehearsal first. Real customer data and ledger entries begin only with explicit authorization after the owner reviews the rehearsal.
- **Security:** confirm production settings, owner MFA, privacy, write gates, backup access and incident contacts.
- **Tests and acceptance:** owner successfully rehearses customer entry, individual openings, reconciliation, purchase, repayment, credit, correction, uncertain save recovery and reporting. Reconcile all test totals and demonstrate a restored backup. At real cutover, require reconciled source/DB totals and explicit owner approval before ordinary electronic posting.

## Decisions for owner approval

| Decision | Proposed default and why it matters |
| --- | --- |
| Hosting, region and budget | Online Supabase production with private app routes, separate staging and independent backup storage. Approve region, plan, PITR cost and who operates it before creating projects. |
| Runtime | Adopt the verified Node 24.22.1 baseline and pin npm after choosing the hosting/CI tooling. Approve later tested patch upgrades. |
| Account and recovery | Confirm the one owner identity, MFA devices, recovery mailbox, named recovery operator and offline identity-verification procedure. |
| Money and account policies | Confirm per-entry limit, allowed input digit/separator conventions, overpayment confirmation and any paper credit exceptions. Archived accounts require restoration before new postings unless a separately reviewed exception is approved. |
| Paper cutover | Choose date/time in `Asia/Amman`, ledger reference format, source counts/totals, downtime or separate catch-up policy, and how to approve omitted or ambiguously assigned rows. Default to a freeze between paper closing and electronic opening. |
| Corrections and reports | Approve effective-period restatement with a separately visible recorded-time audit, and manual review for conflicting opening claims. Confirm whether past effective dates are needed for post-cutover paper activity. |
| Recovery and retention | Approve backup spend, retention, RPO/RTO targets, restore responsibility and who can reopen writes. Decide whether to retain only paper references or separately protect scans. Review any customer contact details retained in canonical opening commands and backup copies. |

## Risks and tradeoffs

| Risk | Design response and verification |
| --- | --- |
| Database commits but the owner loses the response | Reuse the prepared command and committed receipt, reconcile uncertain state and fence cancellation. Test injected failures around transaction end. |
| Duplicate intent entered with two new keys | Database keys deduplicate retries of one intent. Paper source claims add a business uniqueness fence. For ordinary purchases use clear receipts and owner reconciliation. Identical independent purchases remain valid. |
| Restore loses previously committed history | Independent backups, restore drills, an epoch fence and evidence-based gap reconciliation. A newer backup or PITR can reduce loss, subject to actual recovery points. |
| Incorrect owner or private data cached publicly | Provider settings plus server and DB authorization, minimal DTOs and private/no-store responses. Test unauthorized direct access and inspect actual cache behavior. |
| A privilege grant undermines the append-only ledger | Non-login, limited executor, RLS, guards, explicit routine grants and staging permission tests. Keep operator access separated and auditable. |
| Paper mappings or exact totals disagree | Preserve source references, warn on similar customers, block reused approvals, preview and independently reconcile. Keep the cutover closed to ordinary posting until sign-off. |
| One write lock adds latency | It simplifies correctness for one owner. Keep transactions short, test lock waits and record timeouts. Reconsider only if measured contention justifies a more complex protocol. |
| Build/runtime or provider features drift | Pin and verify the known-good runtime, validate hosted transaction and backup behavior, and rerun regression and advisory checks before upgrades. |
| UI masking is mistaken for data security | Authorization precedes data delivery. Keep the display mask for shoulder-surfing and document authorized browser exposure. |

The proposed first implementation scope is **3.1 only**. Start after approval with a reproducible runtime baseline, reviewed migrations in a disposable test environment, deny-by-default privilege tests, and evidence that the schema can be recreated. That gives later authentication and financial work a controlled foundation.
</file>

<file path="docs/architecture/security.md">
# Owner authentication and data security

## Provision and verify one owner

Use Supabase Auth with a single administratively provisioned and verified owner identity. Disable public sign-up, anonymous sign-ins and unused identity providers in the provider settings. The operator binds the verified Auth UID to the one store and stable owner principal. Email, editable profile metadata, customer identifiers and client parameters cannot grant access. A signed-in user with another UID has no data permissions. Set the store access flag to deny until provisioning and MFA tests pass. [Supabase Auth configuration](https://supabase.com/docs/guides/auth/general-configuration)

Recommend a strong unique password stored in the owner's password manager and TOTP MFA. Require a verified `aal2` session for every private read, status lookup and mutation. An `aal1` owner can reach only the sign-in/MFA enrollment and challenge flow, with no financial data. Verify factor enrollment and step-up on a fresh device and after session refresh. Apply login throttling, generic failure messages, safe redirect allowlists and HTTPS. Protect the Supabase control-plane account separately with MFA and keep it out of the daily application. [Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa)

## Session and application boundary

Use a server-only Supabase Auth client through Next.js. The browser posts sign-in and challenge responses to same-origin handlers. Auth tokens stay in a server-managed cookie flow. Prefer `HttpOnly`, `Secure`, host-only cookies with `SameSite=Lax` and limited lifetime, and test the chosen login and recovery redirects. Cookie mutation and token refresh happen in the server paths allowed to set response cookies, with refresh rotation/concurrency handled by the selected integration. Avoid a browser Supabase client that needs to read refresh cookies. The server-only choice differs from mixed server/browser SSR examples, so prove the end-to-end session flow in staging before adopting it. [Supabase SSR guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide)

1. Verify the request's user/session using the supported server-side Supabase validation path, then require the signed assurance claim and the active owner binding. Validate token issuer, audience, expiry and authenticity. A decoded token or client-supplied user object is insufficient. Use a fresh authorization check for sensitive operations. Redirects and proxy checks are convenience gates. The server data access layer and database routines enforce the actual boundary.
2. Enforce same-origin checks and CSRF protection for cookie-authenticated writes. Keep GET requests read-only. Validate command and read parameters at the server boundary, rate-limit abusive requests, and recheck authorization within every database routine. Opaque IDs and idempotency keys are selectors, never credentials.
3. Forward the verified owner JWT from the Next.js data access layer with a project publishable key. Use the same authorization checks for direct Data API calls with that JWT, since an authorized caller might reach exposed routines independently of the browser UI. Every mutation validates financial rules and canonical payload in the database.
4. Return minimal DTOs. Serve private pages, responses, reports and status data with `Cache-Control: private, no-store` and uncached data access. Verify CDN, proxy, auth refresh, App Router prefetch and service-worker behavior. Public shell content may be static if it contains no owner data. Keep secrets and tokens out of RSC payloads, URLs, console output and logs. Limit client exposure of financial values to the fields the owner requested. The eye toggle remains display masking, since a value already delivered to an authorized browser can be inspected there.
5. Expire and revoke sessions using the provider-supported lifecycle. Use short access token lifetimes and sign-out cleanup. Plan for issued JWTs to remain valid until expiry even after refresh revocation. For immediate app isolation, disable the database owner binding/access under the write lock. Future routines check the binding on each request.

References: [Next.js authentication](https://nextjs.org/docs/app/guides/authentication), [Next.js data security](https://nextjs.org/docs/app/guides/data-security), [Supabase sessions](https://supabase.com/docs/guides/auth/sessions), [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

## Database defense in depth

| Boundary | Proposed control |
| --- | --- |
| Data API schemas | Expose `deqs_api` wrappers only for this application. Keep `deqs_data` and `deqs_internal` outside the exposed schema list. No app-owned base table or view in `public`. Review default grants and all exposed objects. |
| API roles | `anon` receives no access to DEQS routines or data. `authenticated` receives explicit usage on wrapper/function schemas as needed and `EXECUTE` on the allowlisted entry routines only. It receives no base table grants and no role memberships that allow `SET ROLE` to a privileged executor. Revoke `PUBLIC` default execute, including on future functions created by the migration role. |
| RPC routines | Exposed wrappers use `SECURITY INVOKER`. Narrow internal `SECURITY DEFINER` routines run under a non-login role distinct from the table owner and without `BYPASSRLS`. Use a fixed empty `search_path`, schema-qualified objects, explicit grants and bounded typed inputs. `authenticated` gets execute only on the internal entrypoints the invoker wrappers need. Every granted routine independently checks the UID, assurance and store flags. Keep helpers and any elevated operator routines inaccessible. |
| RLS | Enable and force RLS on DEQS tables. Permit runtime rows only when the signed `auth.uid()` matches `stores.owner_auth_uid`, `auth.jwt()->>'aal'` is `aal2`, and access is enabled. On `stores` evaluate those fields directly. On other tables use the matching store row to avoid recursive policies. Grant only required command-specific `USING` and `WITH CHECK` rules for executor operations. Ownership and store assignment are immutable to runtime. Do not introduce broad permissive policies that weaken the MFA condition. |
| Write privileges | The executor can insert immutable ledger, correction and claim rows, and transition permitted journal fields. It has limited customer and cutover writes. It cannot update owner binding, access gates or recovery epoch, bypass triggers, mutate posted financial rows, truncate, or grant privileges. The store-wide write gate is checked inside each write entrypoint, including authenticated direct calls. |
| Operations | Keep migrations, backup jobs and emergency operator access separately credentialed and logged. Use narrowly scoped credentials. Elevated database passwords, service keys and management tokens belong in server/operator secret storage and are absent from client code and the ordinary request path. A deployment secret leak is an incident even with RLS. |

Milestone A implements the read-only owner context boundary and starts without a provisioned owner. Verify the managed platform permits the proposed roles, grants and API exposure before enabling application access. Use a production-like staging test matrix covering anonymous calls, non-owner JWT, `aal1`, malformed/expired JWT, owner `aal2`, forbidden cross-store identifiers, direct table operations, direct RPC, RLS query results, and default function grants. Inspect browser caches and private payloads after logout, then verify owner revocation during a pending write when write routines exist. Review security-advisory and supported-runtime status before launch. [Supabase RLS and definer guidance](https://supabase.com/docs/guides/database/postgres/row-level-security) · [Custom API schemas](https://supabase.com/docs/guides/api/using-custom-schemas)

## Account recovery

Keep a verified recovery mailbox with its own MFA, a separately enrolled spare factor if supported and tested, and access to the operator account in a secure recovery procedure. Owner password recovery alone must never unlock financial data without the second factor. Test token rotation and expiry, stolen-device isolation and backup factor availability in staging. Provider features for factor limits and recovery vary, so verify the chosen policy rather than assuming recovery codes exist.

If all factors are lost or the owner identity is compromised, an authorized operator first disables store access and writes, records the incident, verifies the owner's identity through the agreed offline procedure, revokes refresh sessions and handles provider-side factor reset or replacement. Keep the store disabled until a newly authenticated MFA session is proven. If binding a new UID, preserve the stable owner principal and historical Auth UID snapshots, record the old/new binding and approver in a restricted operator audit trail, and rotate the write epoch before resuming. A data restore follows the same fail-closed identity check. [Recovery runbook](recovery.md)
</file>

<file path="docs/architecture/transaction-safety.md">
# Financial transaction safety and online saves

## Commit and durability contract

A successful financial response means PostgreSQL has committed the complete operation and its replay receipt. A UI click, local validation, transport delivery, or a successful command preparation is insufficient to show **تم الحفظ بنجاح**. Use one read-write RPC transaction for posting. Persist entries, any new customer/claim or correction, and the terminal receipt atomically. Treat a receipt returned by an RPC as committed only after the Data API confirms transaction success and the response validates against the requested command and schema. A committed status read on the primary can also confirm success. Confirm transaction-end behavior on the actual hosted configuration before enabling writes. [PostgREST transactions](https://docs.postgrest.org/en/stable/references/transactions.html)

Use WAL-backed permanent tables and synchronous commit for financial transactions, including preparation. Verify the production setting persists through the transaction boundary and confirm the platform durability configuration. The request path must commit on success with rollback override disabled. Next.js sends no client-controlled `Prefer: tx=rollback` header to the Data API. Acceptance tests must prove that direct RPC callers cannot get a success receipt from a transaction deliberately rolled back at the end. For example, test a forced deferred constraint failure in staging and check the primary for missing entries and a noncommitted command. Synchronous commit provides database durability at the configured PostgreSQL boundary. Disaster recovery still depends on replication, retained backups and tested recovery points. [PostgreSQL WAL settings](https://www.postgresql.org/docs/current/runtime-config-wal.html#GUC-SYNCHRONOUS-COMMIT)

## Identity and canonical command

- Generate one random UUID per confirmed financial intent. Capture it before any network request. Disable repeat submit while saving and guard keyboard submit and double clicks with the same in-flight key. An intentional next purchase gets a fresh key even if every detail matches.
- A key is unique per store across all financial command kinds. Canonical payload includes command kind and schema version, recovery epoch, target IDs, exact signed or positive fils strings as specified per operation, normalized optional text, effective-time mode, and required approval/reason/source fields. Validate sizes, allowed keys and semantics on the server and at the database boundary. A server-assigned posting time is an output, so retries never recalculate it as an input.
- Store a SHA-256 fingerprint of the canonical intent and compare canonical JSONB and kind/version exactly after normalization. Canonicalization rules are versioned and stable for existing commands. Full equality governs replay. Reject the same key with changed details using a conflict response. Use the verified owner identity and store context for scope. Retain terminal receipts and keys alongside ledger history.

## Request lifecycle

1. **Ready.** The owner reviews the entered intent and submits. The browser holds the intent and key while online. The authorized screen obtains the current write epoch from the server. No browser persistence of financial amounts, pending drafts or transaction queues. On reload, authorized recovery reads find server-prepared commands and recent receipts. Server-side preparation is intentional so a lost browser response does not force re-entry of uncertain data.
2. **Prepare.** A short transaction checks owner, MFA, write epoch and command shape, then records the canonical intent in `financial_commands` as `prepared`. Repeat preparation with an identical key/details returns the same state or terminal receipt. Mismatched details are rejected even for cancelled or committed keys. Preparation creates no ledger entry or customer. A failure or missing response never causes automatic posting. Verify or retry preparation with the same key if available. If it was lost on reload, refresh the pending list before creating another intent. A late preparation can leave an orphan draft, which can only post through a later explicit owner action.
3. **Post.** Send the key and epoch using the already prepared command, with no replacement financial details. Database loads the stored payload, rechecks current authority and eligibility, and locks writes as described below. A previously committed command returns its original receipt even if balances have since changed. A cancelled command returns its terminal cancellation and cannot post. For a prepared command, run the appropriate business operation, store its receipt and set state to `committed` in one transaction. Capture the before/after balances, entry IDs, exact amounts, effective and recorded times, and result version in that receipt. Never reconstruct a replay receipt from today's balance.
4. **Resolve.** A verified receipt is success. A clearly rolled-back attempt or rejected validation is failed for that attempt. The prepared command can still be retried unchanged if eligible. With concurrent attempts, reconcile the command state before offering replacement. A timeout, aborted fetch, disconnect, gateway error with unknown DB outcome, or unreadable receipt is **outcome uncertain**. Keep the current intent and recover by key or through the authenticated pending/recent list. A `prepared` or missing observation can race with a request still in flight. Neither justifies sending a new key for the same intent.
5. **Recover or abandon.** A committed result displays the stored receipt. For a prepared result, explicitly retry the same key or request cancellation. Cancellation takes the same write lock as posting and durably marks a still-prepared command `cancelled`, or returns the existing committed receipt if posting won. Only after confirmed cancellation may the owner prepare a changed replacement. Post never creates a missing command. With an uncertain preparation and a known key, retry it or fence it by durably recording a cancelled reservation with the original canonical intent under the same key, so a late prepare cannot resurrect it. If the key was lost before any posting could start, wait for the pending list to settle and cancel any orphan. If posting could have started, match recent/pending receipts and ledger entries before taking further action. No auto-submit from the recovery screen.

On an ordinary known failure, distinguish field errors, a business-state conflict, session expiration and maintenance. Reauthorize before lookup or retry, preserving the existing command. A new key always means an explicit new or safely replaced intent. The current write epoch is required for creating or posting a command. An authorized status read can return retained terminal receipts from a prior epoch during maintenance when private reads are enabled. Following restore, an unknown or prepared old-epoch key needs manual reconciliation and cannot post under the new epoch.

```mermaid
sequenceDiagram
    actor O as Owner browser
    participant N as Next.js server
    participant D as PostgreSQL via guarded RPC
    O->>N: Save with one key and canonical intent
    N->>D: Authorize and prepare
    D-->>N: Prepared after commit
    N-->>O: Prepared key, still saving
    O->>N: Post prepared key and epoch
    N->>D: Lock, validate, write entries and receipt
    D-->>N: Receipt after transaction commits
    alt Response received and validated
        N-->>O: Successfully committed
    else Response lost or ambiguous
        O->>N: Check the same key after reconnecting
        N->>D: Read authorized command state on primary
        D-->>N: Committed receipt, prepared, cancelled or unknown
        N-->>O: Display the verified state
    end
```

## Concurrency and consistency

For this single-store workload use one reserved, documented transaction-scoped advisory lock per store, acquired by all DEQS write routines. Acquire it before reading mutable state or calculating balances, including prepare, post, cancellation, archive/restore, migration close and operator mode/binding changes. Verify owner binding and current epoch again after acquiring the lock. Use read committed with separate statements after lock acquisition inside the volatile write routine, so checks see committed changes from preceding writers. Do not perform network calls or wait for owner confirmation inside a transaction. Set bounded lock/statement timeouts and treat ambiguous transport failures as uncertain. Guard state transitions and uniqueness in the database even with serialized writers. [PostgreSQL advisory locks](https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS) · [Read Committed](https://www.postgresql.org/docs/current/transaction-iso.html#XACT-READ-COMMITTED)

Read reports from one consistent committed snapshot. Read recovery status from the writer/primary, without shared caches or lagging replicas. The lock solves concurrency within the authorized write boundary, including posting versus cancelling, archive versus purchase, concurrent openings, and two corrections targeting one entry. A privileged operator must follow the same maintenance discipline. Unique keys stop duplicate retries of one command. They cannot identify two separately confirmed commands that happen to represent the same real-world purchase. Use confirmation, visible receipts and reconciliation for that case.

## Owner-facing save states

| State | Suggested Arabic text | Behavior |
| --- | --- | --- |
| Ready to save | `جاهز للحفظ` | Editable form, clear preview, Save enabled online when valid. |
| Validating | `جارٍ التحقق…` | Validate fields and confirmed intent, hold repeat submissions and surface actionable errors. |
| Saving | `جارٍ الحفظ…` | Lock submit and form identity, announce status politely, keep the existing key. Preparation alone stays in this state. |
| Successfully committed | `تم الحفظ بنجاح` | Show committed receipt and refreshed authoritative balance. Enable a separate new entry action. |
| Failed | `تعذّر الحفظ` | Show a precise actionable reason for a known rejection or rollback. Offer retry unchanged, or explicit cancellation before changing a prepared intent. |
| Outcome uncertain | `تعذّر تأكيد الحفظ. تحقّق من العملية.` | Offer **Check status** first, then same-key retry or safe cancellation if eligible. Do not clear the form, show success, queue an offline retry, or enable a replacement before reconciliation. |

Offline status disables financial submission and reports missing connectivity. A server-authorized check after reconnecting resolves pending work. Keep financial responses, session material and full payloads out of application logs. Use request IDs, result codes and timing for troubleshooting.

## Verification gates for later implementation

Simulate double clicks, parallel identical and conflicting payloads, two genuinely distinct equal purchases, timeouts before/after DB commit, server restart, refresh, tab/device loss, stale epoch after restore, and posting versus cancellation. Exercise failed customer creation during opening, duplicate paper references, parallel corrections and cross-customer moves with one leg forced to fail. Assert exact entry counts, receipt replay, balance reconciliation and a truthful UI state. Confirm that committed rows are immediately visible to authorized status reads and that cancelled or stale keys cannot post.
</file>

<file path="docs/DEQS-IMPLEMENTATION-PLAN.md">
# DEQS implementation plan

The [master specification](DEQS-MASTER-SPEC.md) sets the milestone order. The [Phase 3.0 roadmap](architecture/roadmap.md) provides earlier technical detail. Use the [decision record](architecture/decisions.md) when the two differ. Each milestone carries its own evidence and promotion gate.

| Milestone | Scope | Gate before proceeding |
| --- | --- | --- |
| A · Database foundation | Versioned schema and migrations, forced RLS, restricted read boundary, environment contract, isolated verification. | Fresh PostgreSQL install, role/claim denial tests, ledger and uniqueness checks, adapter tests and application regression checks. Verify managed-platform assumptions in staging before opening access. |
| B · Owner Auth and MFA | Invite-only owner provisioning, password and TOTP, MFA challenge, session refresh/sign-out, guarded pages and recovery. | Authorized staging or a real local Supabase stack. Signed JWTs, session cookies, AAL2, owner/non-owner, expired sessions, direct RPC attempts and recovery tested. |
| C · Customers | Create/edit, Arabic search, duplicate hints and immutable profile events. | Owner-authorized writes, atomic profile audit and tested Save/Add New separation. |
| D · Financial engine | Exact fils domain, command preparation, posting, cancellation, replay and read status, locking and validated receipts. | Concurrent and failure injection tests across separate sessions, Data API rollback checks, stale epoch fencing and exact reconciliation. |
| E · Paper ledger | Save editable drafts, independently approve and post opening balances, reconcile and close cutover. | Duplicate source/slot, interrupted Save, atomic create-and-post, explicit zero, independent ledger totals and no live purchases during migration. |
| F · Purchases and repayments | Customer account, debt repayment, overpayment and automatic credit usage. | Master scenarios B–K, no precision loss, exact balance and credit outcomes and uncertain retry UI. |
| G · Archive and corrections | Archive/restore, reversal, replacement, wrong-customer corrections and immutable audit views. | Archive lock/race, correction concurrency, source reservation, paired rollback and visible history. |
| H · Dashboard and reports | Owner-only data, debt/credit and activity, Amman periods, reconciliation, export/print privacy behavior. | Exact reports vs ledger and preserved dashboard privacy behavior across navigation, refresh and tab hiding. |
| I · Statements and application polish | Account history and filters, Arabic A4 statements, safe export, responsive and accessible final UI. | Print/export content and security, viewport/browser matrix, keyboard and assistive technology checks. |
| J · Backup and recovery | Managed recovery plus encrypted portable exports, documented isolated restore and owner recovery process. | Verified drill, checksums and reconciliation, no live write traffic, approved retention and recovery objectives. |
| K · Full QA | Financial scenarios A–T, security, end-to-end, responsiveness, performance and restart/multi-device tests. | Evidence for every mandatory requirement and no unresolved release-blocking failures. |
| L · Production readiness | Deployment checklist, owner approval, operations and migration rehearsal. | Approved environment and costs, launch and rollback plan, backup drill, owner acceptance and monitoring. |

The existing UI remains usable during A. No owner identity is seeded, database writes are disabled by default and no write RPC is granted. Move to B after an authorized Supabase environment and synthetic owner/test identities are available. Use development-only configuration and complete the MFA and session gates before connecting any production UI to financial records.
</file>

<file path="docs/DEQS-MASTER-SPEC.md">
# DEQS — DEFINITIVE MASTER IMPLEMENTATION & ENGINEERING STANDARDS

## Complete Product Specification, Financial Integrity, Security, Database Architecture, UI/UX, Testing, Recovery & Delivery

---

# 0. YOUR ROLE AND PRIMARY MISSION

You are the principal software architect, lead full-stack engineer, senior PostgreSQL database engineer, financial systems engineer, application security specialist, senior UI/UX designer, quality assurance lead, and technical owner of the implementation of DEQS.

Your mission is to develop DEQS into an exceptionally reliable, secure, accurate, fast, polished, and comfortable financial debt management application.

DEQS is a real commercial product intended for a neighborhood grocery store in Jordan.

The store owner will rely on the system to manage customer debts, repayments, customer credits, and complete financial histories.

The application must be simple enough for a nontechnical store owner to use comfortably every day.

Internally, it must be engineered with professional financial integrity, security, data durability, maintainability, and recovery standards.

**This is an IMPLEMENTATION assignment, not merely a documentation or planning assignment.**

However, financial correctness and security are more important than completing everything in one uninterrupted execution.

Never sacrifice correctness, security, or reliable recovery for speed.

Your responsibilities are to:

1. Understand the existing application.
2. Preserve previously completed work.
3. Establish permanent engineering and product requirements.
4. Review and improve the existing architecture.
5. Implement all approved product requirements in safe dependency order.
6. Proactively identify worthwhile improvements.
7. Implement improvements within the appropriate milestone.
8. Test every implemented feature.
9. Fix discovered defects.
10. Maintain accurate implementation progress.
11. Prevent regressions.
12. Prepare the application for safe production deployment.
13. Clearly identify any requirements blocked by external access, credentials, costs, or owner decisions.

Do not declare the application production-ready without sufficient verified evidence.

---

# 1. EXISTING PROJECT — CRITICAL CONTEXT

DEQS already exists.

Do not create a new application or overwrite the existing project.

## Existing technology

- Next.js 16 App Router
- React
- TypeScript
- Tailwind CSS
- Arabic RTL interface
- Responsive application shell
- Professional dark-green visual branding

## Completed phases

### Phase 1

Initial project setup.

### Phase 1.1

UI improvements, accessibility, responsive verification, and quality assurance.

### Phase 2

Dashboard, navigation, collapsible right sidebar, mobile drawer, and application routes.

### Phase 2.1

Default-hidden total-debt privacy functionality.

### Phase 3.0

Financial system architecture, PostgreSQL database design, transaction safety, owner authentication architecture, and recovery planning.

## Latest verified Git checkpoint

`74d91bc9f44a57f00ab91fe2f2f8fb96dc7fba2a`

Commit message:

`chore: checkpoint phase 2.1 dashboard and privacy`

Seven Phase 3.0 architecture documents were created under:

`docs/architecture/`

These documents were uncommitted in the most recent report.

Inspect the current Git status before doing anything.

Preserve all existing changes.

## Required initial inspection

Read:

- AGENTS.md
- README.md
- package.json
- Current application source
- Existing tests
- Existing QA reports
- Project progress documentation
- Every document under docs/architecture/

Understand the architecture before modifying it.

Preserve completed features and existing application identity.

Do not reset Git history, discard uncommitted changes, or create another DEQS project.

---

# 2. PERMANENT PROJECT MEMORY AND REQUIREMENTS

This is one of the most important requirements in this assignment.

Create a permanent, structured source of truth for DEQS inside the project.

Use the existing AGENTS.md and appropriate documentation under docs/.

Recommended documents:

- `docs/DEQS-MASTER-SPEC.md`
- `docs/DEQS-IMPLEMENTATION-PLAN.md`
- `docs/DEQS-REQUIREMENTS-MATRIX.md`
- `docs/DEQS-QUALITY-STANDARDS.md`
- `docs/DEQS-PROGRESS.md`

Reuse existing documents where appropriate instead of creating unnecessary duplicates.

## AGENTS.md

Update AGENTS.md with a concise, enforceable set of permanent engineering instructions.

Include references to the master specification, financial rules, security standards, implementation plan, and quality gates.

Do not make AGENTS.md unnecessarily enormous.

The detailed requirements should live in organized documentation.

## Master specification

Record every approved feature and business rule from this prompt.

The specification must remain the authoritative reference for future development.

Do not silently remove an approved requirement.

Do not weaken financial or security requirements.

Do not reinterpret an approved requirement in a way that changes its intended behavior.

## Requirements traceability

Assign stable identifiers to requirements.

For example:

- FIN-001
- SEC-001
- CUS-001
- UX-001
- OPS-001

Maintain a requirements matrix containing:

- Requirement ID
- Description
- Priority
- Implementation milestone
- Implementation status
- Relevant files
- Automated tests
- Verification status
- Known limitations

Use clear statuses:

- Planned
- In progress
- Implemented
- Tested
- Blocked
- Production-ready

Never mark a requirement complete simply because it has been documented.

## Decision records

Document important architecture and business decisions.

Include the reason for each decision and its consequences.

Identify decisions requiring owner approval.

Use sensible, safe defaults for ordinary implementation details.

Do not invent approval for financial policies, paid services, security compromises, or deployment decisions.

---

# 3. NON-NEGOTIABLE ENGINEERING STANDARDS

The following standards apply permanently.

## Financial correctness

- Exact monetary representation.
- No floating-point financial arithmetic.
- Database-enforced idempotency.
- Atomic financial operations.
- Authoritative financial ledger.
- Complete financial history.
- Auditable corrections.
- Reliable balance calculations.
- Consistent reporting.
- Strict authorization.
- Clear financial operation outcomes.

## Reliability

- Database-confirmed saves.
- Explicit failure handling.
- Safe retry behavior.
- No misleading success messages.
- Recovery from uncertain network outcomes.
- Verified transaction rollback.
- Safe concurrency handling.
- Tested backup and recovery procedures.

## Security

- Owner-only access.
- No public registration.
- Strong authentication.
- MFA enforcement.
- Server-side authorization.
- Database-level access restrictions.
- Least-privilege credentials.
- Secure session management.
- No public financial data exposure.
- No exposed privileged database secrets.
- No unauthorized financial modifications.

## User experience

- Arabic-first RTL.
- Clean professional design.
- Fast common operations.
- Minimal unnecessary clicks.
- Comfortable desktop and mobile usage.
- Clear financial terminology.
- Accessible controls.
- Clear feedback.
- Appropriate confirmation dialogs.
- Consistent layouts.
- No dead buttons.
- No fabricated financial information.

## Code quality

- Readable TypeScript.
- Appropriate separation of concerns.
- Reusable components.
- Maintainable architecture.
- Secure database access.
- Strong validation.
- Minimal dependencies.
- Proper error handling.
- Automated verification.
- No unnecessary abstractions.
- No unnecessary infrastructure.

## Implementation policy

When a genuine improvement is necessary for the current milestone, implement it and test it.

When an improvement belongs to a future milestone, record it in the requirements matrix and prioritized backlog.

Do not silently expand scope.

Do not claim an improvement is implemented until it is verified.

---

# 4. IMPLEMENTATION STRATEGY AND EXECUTION CONTROL

This prompt defines the complete DEQS product.

Do not attempt to implement everything as one uncontrolled change.

Organize the work into small, independently testable milestones.

## Required sequence

### Milestone A
Database foundation, migrations, and initial security boundaries.

### Milestone B
Owner authentication, MFA, and authorization.

### Milestone C
Customer management and customer profile auditing.

### Milestone D
Financial posting engine, exact accounting, and duplicate prevention.

### Milestone E
Paper-ledger migration and opening balances.

### Milestone F
Purchases, repayments, customer credits, and automatic credit deduction.

### Milestone G
Customer archiving, restoration, and financial corrections.

### Milestone H
Dashboard integration and financial reporting.

### Milestone I
Printable customer statements, exports, and final workflow improvements.

### Milestone J
Backup, monitoring, recovery, and operational safeguards.

### Milestone K
Complete security, financial, UI/UX, and regression acceptance testing.

### Milestone L
Production-readiness review and deployment preparation.

Adjust the internal dependency order when technically justified.

Do not omit any approved requirement.

## Execution rules

For every milestone:

1. Inspect existing implementation.
2. Identify dependencies.
3. Design the smallest reliable solution.
4. Implement the functionality.
5. Add relevant tests.
6. Run the tests.
7. Fix discovered defects.
8. Review security implications.
9. Verify financial integrity where relevant.
10. Check existing functionality for regressions.
11. Update the requirements matrix.
12. Update progress documentation.
13. Report actual results.

Continue through safe, testable local milestones when resources and prerequisites permit.

Before progressing beyond a critical security or financial boundary, ensure the prerequisite verification has passed.

Do not move ahead by bypassing security or financial integrity requirements.

If a required external service, credential, payment decision, or owner action blocks safe implementation:

- Complete all independent safe work.
- Preserve the current implementation.
- Clearly explain the blocker.
- Provide the exact next required action.
- Stop without pretending the blocked feature works.

Do not deploy automatically.

Do not purchase services.

Do not create automatic Git commits.

Do not push to remote repositories.

---

# 5. ONLINE-ONLY SYSTEM ARCHITECTURE

DEQS must operate as an online web application.

The store owner must be able to access the same account and current financial records from supported computers and phones.

Use centralized server-backed storage.

The browser must never be the authoritative financial database.

Do not use localStorage, sessionStorage, or IndexedDB as the primary financial data store.

Do not implement offline financial posting or offline synchronization.

## Internet failure behavior

When connectivity is unavailable:

- Display a clear Arabic warning.
- Do not falsely confirm saved financial operations.
- Preserve unsaved form contents where safely possible.
- Provide understandable retry guidance.
- Reconcile uncertain operations safely.

A confirmed save means the database committed the operation.

A lost network response does not automatically mean the operation failed.

When the result is uncertain, retain the original operation identifier and provide a safe status check or retry mechanism.

Never automatically create a different operation identifier for an uncertain retry.

---

# 6. DATABASE AND STORAGE ARCHITECTURE

Use PostgreSQL with Supabase as the preferred managed database platform.

Preserve compatibility with the existing Next.js application.

Use version-controlled database migrations.

The schema must support:

- Owner identity and authorization metadata.
- Customers.
- Customer profile audit history.
- Customer archival state.
- Paper-ledger migration batches.
- Opening-balance claims.
- Financial commands.
- Idempotency records.
- Append-only financial ledger entries.
- Financial corrections.
- Linked reversals and replacements.
- Audit records.
- Reporting and reconciliation.
- Operational metadata where needed.

Use appropriate:

- Primary keys.
- Foreign keys.
- Unique constraints.
- CHECK constraints.
- NOT NULL constraints.
- Indexes.
- Timestamp fields.
- Database permissions.
- Row Level Security.

Avoid redundant editable financial totals.

The authoritative financial state must be derived from committed ledger entries.

If a cached or materialized balance is eventually introduced for performance, it must be transactionally consistent, verifiable against the ledger, and never become an independent editable source of truth.

## Database security

Default to denying access.

Never expose financial tables publicly.

Never grant direct unrestricted posting privileges to ordinary browser clients.

Enforce authorization at the database and trusted server boundary.

Protect privileged database credentials.

Avoid unrestricted service-role access in application handlers.

Use least-privilege database functions or roles where justified.

Never enable public financial operations before owner authentication and authorization are fully implemented.

---

# 7. EXACT FINANCIAL ACCOUNTING — JORDANIAN DINAR

All amounts are denominated in Jordanian Dinar.

1 JOD = 1000 fils.

Use exact integer fils for authoritative monetary amounts.

PostgreSQL BIGINT is appropriate when supported by strict range validation.

Do not use JavaScript floating-point numbers for financial calculations.

Represent BIGINT financial values safely across JavaScript and JSON boundaries, for example using validated decimal strings where appropriate.

Do not silently convert large financial values to imprecise JavaScript numbers.

## Signed ledger convention

Positive customer balance:

The customer owes the store money.

Negative customer balance:

The store holds credit belonging to the customer.

Zero:

The customer account is settled.

Example:

Opening debt: +20.000 JOD

Purchase: +5.000 JOD

Repayment: -10.000 JOD

Current balance: +15.000 JOD

## Display rules

For positive balances:

Display outstanding customer debt.

For negative balances:

Display customer credit as a positive amount in a separate field.

For zero:

Display a genuine zero balance.

Never show confusing negative debt values to the owner.

## Validation

- Reject malformed amounts.
- Reject unauthorized negative input.
- Reject invalid precision.
- Reject zero where the operation requires a positive amount.
- Reject out-of-range values.
- Detect arithmetic overflow.
- Avoid silent rounding.
- Avoid silent truncation.
- Reject ambiguous numeric formats.
- Support convenient Arabic input where safe.
- Format displayed JOD amounts using three decimal places.

Financial calculations must remain exact from input validation through database posting and reporting.

---

# 8. ZERO-DUPLICATE FINANCIAL POSTING

This requirement has the highest implementation priority.

If the owner presses Save once, twice, or ten times for the same action, only one financial operation may be committed.

Do not rely only on frontend button disabling.

## Frontend protection

- Disable repeated submission while saving.
- Show a clear saving state.
- Prevent accidental duplicate clicks.
- Preserve the original operation identifier during retries.
- Keep the form usable after confirmed failure.
- Avoid creating new financial commands during uncertain outcomes.

## Server protection

- Validate the operation.
- Validate the authenticated owner.
- Validate the amount.
- Validate the customer.
- Validate the operation type.
- Require an idempotency key.
- Compute a canonical request fingerprint.
- Reject conflicting reuse of keys.

## Database protection

- Unique operation identifiers.
- Unique idempotency keys within the appropriate scope.
- Atomic transaction processing.
- Concurrency-safe handling.
- Persisted command outcomes.
- Durable replay receipts.
- Appropriate database constraints.

## Required behavior

Same key + identical command:

Return the original committed outcome.

Same key + different command:

Reject with a clear conflict.

Different keys + same amount:

Allow separate intentional transactions.

Ten repeated clicks:

One operation.

Concurrent identical requests:

One operation.

Lost response after successful commit:

Return the original result when safely checked or retried.

Failed transaction:

No partial financial posting.

Do not claim complete duplicate protection until real database integration and concurrency tests have passed.

---

# 9. TRANSACTION ATOMICITY AND CONSISTENCY

Financial posting must be atomic.

The system must not partially write:

- A financial command.
- Ledger entries.
- Idempotency outcome.
- Required audit records.
- Related correction records.

Implement critical operations using PostgreSQL transactions.

Use appropriate locking and isolation behavior.

Prevent:

- Lost updates.
- Duplicate posting.
- Conflicting corrections.
- Partial customer transfers.
- Inconsistent opening balances.
- Unauthorized concurrent changes.

Concurrent operations involving the same customer must produce correct final balances.

Use safe transactional locking or equivalent proven consistency controls.

Document the consistency strategy.

Write tests for concurrent operations.

---

# 10. FINANCIAL SAVE EXPERIENCE

Provide clear states:

1. Ready.
2. Validating.
3. Saving.
4. Successfully committed.
5. Failed.
6. Outcome uncertain.

The message:

"تم الحفظ بنجاح"

must appear only after a confirmed successful database commit.

On success, show:

- Customer name.
- Transaction type.
- Amount.
- Timestamp.
- Updated balance.
- Transaction reference.

On failure:

Explain the problem without exposing secrets.

On uncertain outcome:

Do not incorrectly report failure or success.

Provide a safe way to check the original operation.

Preserve form state appropriately.

Avoid duplicate submission during retries.

---

# 11. OWNER-ONLY AUTHENTICATION AND AUTHORIZATION

DEQS is exclusively for the store owner.

There will be no public customer accounts and no employee management.

Use Supabase Auth or another justified secure solution compatible with the approved architecture.

## Requirements

- One provisioned owner account.
- No public signup.
- No ordinary user self-registration.
- Strong password handling.
- MFA enforcement for sensitive access.
- Secure login.
- Secure logout.
- Protected application routes.
- Secure session expiration.
- Session validation on protected requests.
- Server-side authorization.
- Database-level authorization.
- Safe owner recovery.
- Appropriate brute-force protections.
- Proper handling of expired and invalid sessions.

## MFA

Support a secure authenticator-based second factor where available.

Enforce the required authentication assurance level before allowing financial access.

Do not rely on a visual MFA screen without server verification.

## Owner provisioning

Do not create a public route that allows arbitrary visitors to become the owner.

Do not hardcode owner credentials.

Document a secure provisioning procedure.

## Recovery

Provide a safe recovery design.

A forgotten password must not permanently destroy access to legitimate financial records.

However, recovery must not provide a simple authentication bypass.

Use verified recovery methods and appropriate identity checks.

Never store plaintext passwords or recovery secrets.

## Authorization testing

Test:

- Anonymous users.
- Unauthorized authenticated users.
- Authorized owner.
- Expired sessions.
- Invalid MFA state.
- Unauthorized customer IDs.
- Direct financial endpoint access.

Never confuse frontend route hiding with actual authorization.

---

# 12. CUSTOMER MANAGEMENT

Implement a complete customer management system.

## Customer creation

Required:

- Customer name.

Optional:

- Phone number.
- Opening debt through the controlled opening-balance workflow.

Use stable customer IDs.

## Two independent actions

This behavior was explicitly approved and must be preserved.

### Save — حفظ

Save the current customer.

Remain on the same customer record.

Do not automatically clear the form.

Do not create duplicate customer accounts through repeated Save clicks.

### Add New Customer — إضافة زبون جديد

Open a blank customer form.

If unsaved changes exist, warn before discarding them.

Never silently lose entered data.

## Customer list

Include:

- Customer name.
- Optional phone.
- Current debt.
- Available customer credit.
- Account status.
- Account access.

## Search

Provide responsive search.

Support Arabic names appropriately.

Search by name and phone where available.

Avoid unnecessary page reloads.

Use appropriate indexing and pagination.

## Duplicate warnings

Warn about matching or similar customer information.

Do not automatically merge customers based on name alone.

Two different people may legitimately share the same name.

Avoid duplicate customer creation from repeated requests.

## Editing

Allow editing:

- Name.
- Phone.

Preserve audit history for meaningful profile changes.

Do not modify posted financial records when editing customer information.

---

# 13. PAPER-LEDGER MIGRATION

The store currently has approximately 100 or more customers recorded in a paper debt ledger.

Implement a dedicated fast-entry workflow.

The owner must be able to enter:

- Customer name.
- Existing debt amount.
- Optional phone number.

The purpose is to migrate the current outstanding balance for each person, not every historical paper purchase.

## Workflow

1. Define the paper-ledger cutover date.
2. Create or select a migration batch.
3. Enter customers.
4. Save each successfully entered record immediately.
5. Continue adding customers.
6. Review entered balances.
7. Detect potential duplicates.
8. Compare totals with the paper ledger.
9. Correct mistakes.
10. Approve opening balances.
11. Post approved opening balances exactly once.

## Critical distinction

Saving a migration draft must persist that draft immediately.

It must not silently post an unapproved financial opening balance.

Opening balances become authoritative only through the controlled approval and posting workflow.

Clearly explain the distinction in the UI.

## Cutover safety

Prevent new financial posting workflows from conflicting with incomplete opening-balance approval.

Define and enforce a safe cutover policy.

Never double-count an opening balance.

## Duplicate prevention

Use database constraints to prevent duplicate approved opening-balance claims for the same customer and cutover.

## Reconciliation

Display:

- Customers entered.
- Opening-balance total.
- Approved records.
- Pending records.
- Reconciliation differences.

Preserve source references and audit history.

No real customer information may be imported automatically without explicit owner action.

---

# 14. CUSTOMER ACCOUNT PAGE

Create a complete customer account page.

Display:

- Customer name.
- Phone.
- Account status.
- Outstanding debt.
- Available credit.
- Opening balance.
- Recent movements.
- Complete transaction history.
- Notes.
- Dates.
- Financial corrections.

## Primary actions

- Add purchase.
- Record repayment.
- Edit customer.
- View history.
- Print statement.
- Archive customer.
- Restore archived customer.

The page must remain simple.

Avoid excessive buttons and complex forms.

The owner should understand the customer's financial situation immediately.

Use clear terminology and consistent JOD formatting.

---

# 15. PURCHASE RECORDING

Purchases are recorded by monetary amount only.

Do not require product selection or detailed item entry.

Fields:

- Purchase amount: required.
- Note: optional.

Before saving, show:

- Current balance.
- Purchase amount.
- Expected resulting balance.

After a successful save:

- Confirm the operation.
- Display the recorded amount.
- Display the updated balance.
- Display the transaction time.
- Update related summaries.

Preserve the original full purchase amount.

Do not rewrite it when customer credit is applied.

Use the authoritative financial posting engine.

---

# 16. REPAYMENTS AND CUSTOMER CREDIT

Support:

- Partial repayments.
- Full repayments.
- Overpayments.
- Customer credit.
- Automatic credit use.

## Example 1

Customer owes:

20.000 JOD

Customer pays:

25.000 JOD

Result:

Debt: 0.000 JOD

Customer credit: 5.000 JOD

## Example 2

Customer credit:

5.000 JOD

New purchase:

3.000 JOD

Result:

Remaining credit: 2.000 JOD

## Example 3

Customer credit:

5.000 JOD

New purchase:

8.000 JOD

Result:

New debt: 3.000 JOD

## Implementation rule

Use the signed authoritative ledger balance.

Customer credit is consumed automatically through the resulting net balance.

Do not create an additional financial deduction that counts the same credit twice.

Preserve the original purchase and repayment entries.

The UI should explain debt and available credit clearly without showing confusing negative balances.

---

# 17. IMMUTABLE FINANCIAL HISTORY

Never permanently delete posted financial transactions through ordinary application workflows.

Every financial operation must remain auditable.

Maintain:

- Stable operation identifier.
- Customer identifier.
- Operation type.
- Original amount.
- Timestamp.
- Authorized owner.
- Optional note.
- Relevant correction links.
- Relevant audit metadata.

Posted ledger entries must not be silently modified.

Historical financial movements must remain traceable.

---

# 18. FINANCIAL CORRECTIONS AND REVERSALS

Support correction of:

- Incorrect purchase amount.
- Incorrect repayment amount.
- Incorrect opening balance.
- Operation posted to the wrong customer.
- Accidental operation that should be canceled.

## Required approach

Use linked reversal and replacement records.

Never silently overwrite the original financial entry.

Every correction must record:

- Original transaction.
- Previous amount.
- Corrected amount when applicable.
- Correction reason.
- Correction timestamp.
- Owner identity.
- Related reversal and replacement operations.

## Concurrency

Prevent duplicate corrections and conflicting simultaneous corrections.

## Wrong customer

Reversing the incorrect customer's operation and posting the correct customer's operation must be atomic.

## User interface

Before confirming, show:

- Original amount.
- Corrected amount.
- Reason.
- Balance before correction.
- Expected balance after correction.

Keep technical ledger details available for audit without overwhelming the owner.

Allow authorized correction of historical operations without losing their history.

---

# 19. CUSTOMER ARCHIVING

Archiving must never delete financial history.

Archived customers retain:

- Profile information.
- Opening balances.
- Purchases.
- Repayments.
- Customer credits.
- Corrections.
- Audit history.

Provide:

- Archive page.
- Search.
- Customer account viewing.
- Restoration.

Archived outstanding debts must remain included in the store's total outstanding debt.

Archived customer credits must remain included in total customer credit.

Archive and restore operations must not create financial transactions or alter balances.

Require confirmation before archiving.

For safety, archived accounts should be read-only for new financial posting until restored, unless a separately reviewed workflow justifies otherwise.

---

# 20. DASHBOARD — COMPLETE INTEGRATION

Preserve the existing approved DEQS dashboard.

Connect it to real authorized database queries.

Required summaries:

1. إجمالي ديون المحل
2. عدد الزبائن النشطين
3. أرصدة لصالح الزبائن
4. مشتريات اليوم
5. تسديدات اليوم

Also include:

- Recent financial activity.
- Quick customer access.
- Helpful empty states.
- Loading indicators.
- Meaningful error states.

## Total debt calculation

For each customer, derive the signed ledger balance.

Total outstanding debt equals the sum of positive customer balances.

Total customer credit equals the absolute sum of negative customer balances.

Do not incorrectly offset one customer's debt using another customer's credit.

Include archived customers in financial totals.

Count active customers separately.

## Privacy control

Preserve the existing Phase 2.1 behavior.

Total outstanding debt must be hidden by default.

Reveal using the eye button.

Automatically hide after:

- Refresh.
- Navigation away and back.
- Browser history return.
- Browser tab hiding.

Do not persist the revealed state.

Keep unavailable, hidden, and zero states distinct.

Do not expose sensitive amounts through unnecessary tooltips, attributes, logs, or analytics.

Remember that visual masking is not a substitute for actual authorization.

---

# 21. FINANCIAL REPORTING

Implement accurate reporting.

Required periods:

- Daily.
- Weekly.
- Monthly.
- Yearly.
- Custom date range.

Required report categories:

- Outstanding debts.
- Customer credits.
- Purchases.
- Repayments.
- Opening balances.
- Correction history.
- Customer statements.

## Accounting rules

Opening balances must not be counted as new purchases.

Customer credits must not be subtracted from other customers' outstanding debts.

Archived customer balances must remain included in financial aggregates.

Corrections must not produce misleading double counting.

Distinguish gross activity from net corrected activity.

Document reporting treatment of corrections clearly.

## Reconciliation

Report totals must reconcile with the authoritative financial ledger.

Add automated reconciliation tests.

---

# 22. TIME AND DATE ACCURACY

Store authoritative timestamps in UTC.

Display times in:

`Asia/Amman`

Use Jordan-local calendar boundaries for financial reports.

Do not assume browser-local dates represent the correct financial reporting day.

Distinguish:

- Original posting timestamp.
- Correction timestamp.
- Opening-balance cutover date.
- Reporting period.

Use a documented, consistent reporting policy.

Preserve historical audit timestamps.

Do not silently rewrite old financial dates.

---

# 23. CUSTOMER STATEMENTS AND PRINTING

Provide professional printable customer statements.

Include:

- DEQS branding.
- Customer identity.
- Statement date.
- Selected period.
- Opening balance.
- Purchases.
- Repayments.
- Corrections.
- Closing balance.

Requirements:

- Arabic RTL.
- A4-friendly.
- Clear typography.
- Consistent financial formatting.
- Correct page breaks.
- No clipped numbers.
- No unnecessary technical metadata.

Include print-friendly styling.

Support appropriate CSV export when useful.

Prevent spreadsheet formula injection in CSV output.

Protect exported financial data with the same authorization requirements as the application.

---

# 24. PREMIUM USER EXPERIENCE

DEQS must feel like a polished commercial product.

Preserve the existing professional green identity.

## Visual standards

- Elegant typography.
- Consistent spacing.
- Comfortable cards.
- Appropriate contrast.
- Clean backgrounds.
- Restrained shadows.
- Consistent buttons.
- Clear hierarchy.
- Accessible dialogs.
- Responsive tables.
- Proper Arabic alignment.

## Interaction standards

- Minimal clicks.
- Fast customer search.
- Comfortable amount entry.
- Immediate feedback.
- Clear save confirmation.
- Clear errors.
- Helpful empty states.
- No misleading controls.
- No unnecessary animations.
- No excessive desktop scrolling.

## Useful improvements

Implement appropriate improvements such as:

- Quick access to recently used customers.
- Quick access to frequent customers where useful.
- Keyboard shortcuts for safe, common actions.
- Clear last-transaction confirmation.
- Better transaction previews.
- Intelligent duplicate warnings.
- Unsaved-change protection.
- Convenient search filters.
- Consistent modal close buttons.
- Visible focus indicators.
- Comfortable mobile touch targets.

Implement a polished light theme.

A coherent dark theme may be added if it can be implemented and verified without degrading the existing visual consistency.

Non-sensitive display preferences may be stored locally.

Never store authoritative financial records in browser storage.

Avoid visual complexity that does not help the store owner.

---

# 25. RESPONSIVE DESIGN AND ACCESSIBILITY

Verify the application at:

- 1920×1080
- 1366×768
- 1280×720
- 768×1024
- 390×844
- 375×667

Also account for smaller mobile widths.

Requirements:

- No horizontal page overflow.
- No clipped Arabic labels.
- No overlapping cards.
- Responsive tables.
- Appropriate touch targets.
- Keyboard-accessible controls.
- Visible focus.
- Correct heading hierarchy.
- Semantic HTML.
- Sufficient contrast.
- Proper dialog focus management.
- Reduced-motion support.
- Correct RTL alignment.

Do not claim actual-device testing unless performed.

Preserve the current accessible sidebar and mobile navigation behavior.

---

# 26. BACKUP, RECOVERY, AND DATA PRESERVATION

Financial data preservation is a critical requirement.

The owner considers data loss unacceptable as a normal operating outcome.

Design for the smallest practical recovery data-loss window and clearly disclose the remaining risk.

## Required capabilities

- Managed database backups.
- Point-in-time recovery where available.
- Independent encrypted backups.
- Appropriate retention.
- Backup integrity checks.
- Periodic restore testing.
- Financial reconciliation after restore.
- Recovery documentation.
- Backup failure monitoring.
- Safe reopening after recovery.

## Critical distinction

A successful database commit is not equivalent to having a fully recoverable independent backup.

Do not claim that backups guarantee zero data loss.

Do not claim an RPO or RTO target has been achieved until the infrastructure supports it and recovery drills verify it.

The Phase 3.0 architecture proposed:

- RPO target: 15 minutes.
- RTO target: 4 hours.

Treat these as proposals, not approved or verified guarantees.

Evaluate whether stronger protection is justified and practical.

Identify the financial cost and operational implications of each recovery option.

Do not purchase services or enable paid features without owner authorization.

## Recovery safety

Document how to:

1. Stop financial writes.
2. Identify the recovery point.
3. Restore to an isolated environment.
4. Verify backup integrity.
5. Reconcile ledger totals.
6. Reconcile operation identifiers.
7. Identify potentially lost committed operations.
8. Prevent accidental duplicate replay.
9. Obtain owner approval before reopening financial writes.

Do not rely on Git or OneDrive synchronization as the database backup strategy.

---

# 27. SECURITY HARDENING

Apply appropriate security controls throughout DEQS.

Include:

- Authentication.
- Authorization.
- MFA enforcement.
- Database RLS.
- Least-privilege permissions.
- Secure environment variables.
- Input validation.
- CSRF protection where relevant.
- XSS protection.
- Safe database queries.
- IDOR protection.
- Rate limiting.
- Secure session management.
- Appropriate caching rules.
- Secure error responses.
- Secret redaction.
- Safe logging.
- Audit trails.
- Protected exports.
- Secure recovery procedures.

Ensure customer and financial data cannot be accessed by unauthorized visitors.

Avoid privileged financial reads in unrestricted server handlers.

Protected financial responses must not be publicly cached.

Do not expose database credentials, secret keys, or recovery codes.

---

# 28. PERFORMANCE AND RELIABILITY

Optimize for a grocery store with approximately 100 or more customer accounts.

The architecture should scale comfortably beyond the initial customer count.

Prioritize:

- Fast customer lookup.
- Fast account opening.
- Efficient financial queries.
- Efficient summaries.
- Appropriate indexing.
- Safe pagination.
- Low unnecessary client-side JavaScript.
- Responsive interactions.
- Clear loading states.
- Safe timeouts.
- Graceful failure handling.
- No unnecessary polling.
- No memory leaks.
- Stable production builds.

Avoid unnecessary microservices, event brokers, or distributed infrastructure.

Use the simplest architecture that safely fulfills the business requirements.

---

# 29. DEVELOPMENT ENVIRONMENT

The previously verified production build succeeded using:

Node.js 24.22.1

Node.js 26 experienced Turbopack-related build failures in an earlier environment.

Document a reproducible project-scoped Node.js version policy.

Do not modify the owner's global Windows environment unnecessarily.

Do not blindly change dependency versions.

Use official supported development tools.

Inspect whether required tooling exists before installation.

Do not install Docker Desktop or other system-wide applications without permission.

Use Supabase CLI and isolated development databases where appropriate.

Use secure environment templates.

Never invent Supabase credentials.

Never pretend a remote database is connected.

If external provisioning is necessary, explain the exact owner action required.

---

# 30. AUTOMATED FINANCIAL TESTING

Financial behavior must be verified with meaningful automated tests.

## Required scenarios

### Scenario A — Opening debt

Create a customer.

Approve an opening debt.

Verify the exact balance.

### Scenario B — Purchase

Add a purchase.

Verify the posted amount and updated balance.

### Scenario C — Partial repayment

Record a partial repayment.

Verify the resulting debt.

### Scenario D — Full repayment

Repay the entire outstanding debt.

Verify zero balance.

### Scenario E — Overpayment

Repay more than the outstanding debt.

Verify customer credit.

### Scenario F — Automatic credit use

Make a purchase using available credit.

Verify correct remaining debt or credit.

Ensure credit is not consumed twice.

### Scenario G — Repeated Save

Submit the same financial command ten times.

Verify exactly one financial posting.

### Scenario H — Concurrent requests

Submit identical commands concurrently.

Verify one committed operation.

### Scenario I — Lost response

Commit an operation.

Simulate a lost response.

Retry with the same idempotency key.

Verify the original result is recovered without duplication.

### Scenario J — Conflicting key

Reuse an idempotency key with a different payload.

Verify rejection.

### Scenario K — Intentional identical amounts

Post two legitimate purchases with identical amounts but different operation identifiers.

Verify both are accepted.

### Scenario L — Correction

Correct an incorrect amount.

Verify current balance and immutable audit history.

### Scenario M — Wrong customer

Correct a transaction assigned to the wrong customer.

Verify atomic reversal and replacement.

### Scenario N — Archive

Archive a customer with debt.

Verify the debt remains in financial totals.

Restore the customer.

Verify no duplication.

### Scenario O — Opening-balance duplication

Attempt to approve the same opening balance twice.

Verify database rejection or idempotent recovery.

### Scenario P — Reconciliation

Verify dashboard and report totals reconcile with ledger balances.

### Scenario Q — Failed posting

Force a database failure during posting.

Verify no partial financial operation remains.

### Scenario R — Unauthorized access

Verify unauthorized requests cannot read or post financial data.

### Scenario S — Backup restoration

Restore a disposable backup.

Verify customer records, financial entries, balances, and command identities.

### Scenario T — Multiple devices

Use the application from desktop and mobile sessions.

Verify both reflect the same authoritative server-backed records.

Use synthetic data in isolated test environments.

Never run destructive testing against real shop data.

---

# 31. COMPLETE SECURITY AND UI TESTING

Verify:

- Anonymous access restrictions.
- Invalid login behavior.
- MFA enforcement.
- Expired sessions.
- Unauthorized account access.
- Direct financial endpoint protection.
- Invalid customer identifiers.
- Malformed financial amounts.
- Database permission boundaries.
- Financial transaction immutability.
- Navigation.
- Search.
- Customer creation.
- Editing.
- Archiving.
- Printing.
- Dashboard privacy.
- Arabic RTL.
- Responsive layouts.
- Keyboard accessibility.
- Form error states.
- Loading states.
- Network failures.
- Recovery states.

Run appropriate regression tests after each milestone.

Never claim a test passed if it was not executed.

Clearly distinguish simulated tests from tests using a real PostgreSQL database.

---

# 32. FINAL APPLICATION POLISH

After implementing the core system, perform a full UI/UX review from the perspective of the actual store owner.

Evaluate the complete workflow:

Login → Dashboard → Search customer → Open customer → Add debt → Save → Verify → Record repayment → View history → Print statement → Logout.

Also evaluate:

Paper-ledger migration → Reconciliation → Approval.

And:

Incorrect operation → Correction → Audit review.

Remove:

- Confusing buttons.
- Redundant actions.
- Broken layouts.
- Unnecessary dialogs.
- Excessive scrolling.
- Poorly formatted numbers.
- Inconsistent terminology.
- Misleading statuses.
- Incomplete workflows.
- Placeholder content pretending to be functional.

Proactively implement justified improvements.

Avoid adding unnecessary complexity.

---

# 33. PRODUCTION DEPLOYMENT READINESS

Prepare DEQS for secure online deployment.

Required areas:

- Production hosting.
- HTTPS.
- Environment separation.
- Secure credentials.
- Owner account provisioning.
- MFA enrollment.
- Database access restrictions.
- Production migrations.
- Backup configuration.
- Recovery verification.
- Application monitoring.
- Appropriate logging.
- Release procedures.
- Rollback procedures.
- Operational documentation.

Do not deploy automatically.

Do not connect real customer data without explicit approval.

Do not activate paid services without authorization.

Do not claim production readiness until the relevant checks and real infrastructure verification are complete.

---

# 34. QUALITY GATES

A milestone may be accepted only when:

1. Its required functionality is implemented.
2. Relevant code is maintainable.
3. Relevant validation is implemented.
4. Required authorization is enforced.
5. Financial invariants are preserved.
6. Automated tests pass.
7. Error cases are handled.
8. Existing functionality remains working.
9. Documentation is updated.
10. Known limitations are reported.

A financial feature is not production-ready merely because its UI works.

A database feature is not verified merely because migration SQL exists.

A backup system is not verified merely because backups are configured.

A security feature is not verified merely because the login page exists.

Require appropriate evidence.

---

# 35. FINAL PRODUCT ACCEPTANCE CRITERIA

DEQS must ultimately provide all of the following:

- Secure owner login.
- Proper owner-only authorization.
- Centralized database storage.
- Reliable server-confirmed saves.
- Duplicate financial request protection.
- Customer creation.
- Customer editing.
- Customer search.
- Paper-ledger migration.
- Opening-balance reconciliation.
- Purchase recording.
- Partial repayments.
- Full repayments.
- Overpayments.
- Automatic credit use.
- Customer account histories.
- Auditable corrections.
- Customer archiving.
- Customer restoration.
- Accurate dashboard totals.
- Default-hidden total debt.
- Financial reports.
- Printable statements.
- Secure backups.
- Verified restoration procedures.
- Responsive Arabic UI.
- Mobile usability.
- Appropriate accessibility.
- Passing financial integration tests.
- Passing authorization tests.
- Passing regression tests.
- Accurate documentation.

No requirement may be silently dropped.

---

# 36. FINAL REPORTING REQUIREMENTS

Maintain accurate progress documentation throughout development.

After each implementation milestone, report:

## Completed Work

List implemented functionality.

## Files Changed

List relevant files.

## Database Changes

List migrations, tables, constraints, and functions.

## Security

Explain implemented security controls.

## Financial Integrity

Explain verified financial guarantees and limitations.

## Testing

Provide executed commands and actual results.

## UI/UX

Explain improvements and responsive verification.

## Known Issues

List unresolved issues.

## External Dependencies

List required owner actions, credentials, hosting choices, or costs.

## Requirements Progress

Update the requirements matrix.

## Recommended Next Milestone

Identify the next safe implementation step.

## Git Status

Report current branch, checkpoint, and uncommitted changes.

Do not automatically commit.

---

# 37. WHAT TO DO IN THIS EXECUTION

This is the definitive master instruction for DEQS.

Begin with these steps:

### Step 1 — Inspect

Inspect the current project, Git status, existing code, tests, and the seven Phase 3.0 architecture documents.

### Step 2 — Establish permanent standards

Update AGENTS.md and create or update the permanent master specification, quality standards, requirements matrix, implementation plan, and progress tracking.

Ensure every approved requirement in this prompt is represented.

### Step 3 — Validate architecture

Review the Phase 3.0 design for contradictions, financial integrity problems, security gaps, and missing constraints.

Correct genuine design defects before implementation.

### Step 4 — Begin actual implementation

Start with the safe Phase 3.1 database foundation:

- Reproducible development environment.
- Versioned PostgreSQL migrations.
- Foundational schema.
- Exact integer-fils model.
- Append-only ledger protections.
- Database-enforced idempotency foundation.
- Opening-balance constraints.
- Default-deny authorization.
- Safe server-only database integration.
- Environment templates.
- Automated schema and security tests.

### Step 5 — Verify

Run available tests.

Use an isolated disposable database where possible.

If external tooling is unavailable, clearly distinguish implemented-but-unverified work from verified work.

Do not pretend that missing infrastructure exists.

### Step 6 — Continue safely

Continue into later independently testable implementation milestones only when their prerequisites are satisfied and the current milestone passes its quality gates.

Do not bypass external approvals or security requirements.

Do not initiate paid services or production deployment.

If a milestone is blocked, complete independent safe work and provide an accurate handover.

If execution time or context becomes limited, finish at a clean milestone boundary, preserve progress, and provide precise continuation instructions.

Do not silently abandon requirements.

---

# FINAL ABSOLUTE RULES

Financial correctness is more important than speed.

Data preservation is more important than convenience.

Security is more important than appearance.

Simplicity is more important than unnecessary features.

Verified implementation is more important than optimistic reporting.

Preserve the existing DEQS application.

Never fabricate functionality, tests, credentials, or guarantees.

Never discard previous work without explicit authorization.

Never modify files outside the project without approval.

Never automatically push or deploy.

Never connect real customer records before production-readiness approval.

Keep the entire approved product specification available permanently for future development.

Implement, test, refine, document, and preserve progress.

The ultimate objective is a beautiful, fast, exceptionally comfortable, financially accurate, secure, reliable, and professionally engineered DEQS application that its owner can confidently use every day.
</file>

<file path="docs/DEQS-PROGRESS.md">
# DEQS progress

## 8 November 2026 · Milestone A

| Phase | Evidence |
| --- | --- |
| 1 and 1.1 | The Arabic RTL Next.js foundation and welcome page passed the recorded [Phase 1.1 QA](phase-1.1-qa.md). |
| 2 and 2.1 | The dashboard shell, placeholder routes and debt privacy behavior are preserved at Git checkpoint `74d91bc9f44a57f00ab91fe2f2f8fb96dc7fba2a`. See [Phase 2 QA](phase-2-qa.md) and [Phase 2.1 QA](phase-2.1-qa.md). |
| 3.0 | The architecture review is recorded in [architecture](architecture/README.md). The [decision record](architecture/decisions.md) resolves conflicts with the master brief. |
| 3.1 / A | Three versioned migrations define nine tables in private PostgreSQL schemas, force RLS, reserve command and opening identities, and defer validation of posting groups to commit. The server-only owner context adapter is available for later wiring. No owner is seeded and no runtime write routine is granted. |

The dashboard still shows unavailable data. No Supabase project or test owner has been configured. No real customer data was accessed. Final verification started on `main` at `74d91bc9f44a57f00ab91fe2f2f8fb96dc7fba2a`. The local Milestone A checkpoint includes the Phase 3.0 architecture documents and preserves the dependency lockfile.

### Verification

| Check | Result |
| --- | --- |
| Master attachment hash | The retained [master specification](DEQS-MASTER-SPEC.md) matches the supplied attachment byte-for-byte. SHA-256 `06EE357B0FE49F4F2D5CBE8A77FF4B0D7206C4BD635178D85105B3449143171A`. Git excludes this file from line-ending conversion. |
| `npm.cmd run test:db` | Passed on a fresh isolated PostgreSQL 18.6 cluster with 5 subtests and their parent. Verified forced RLS and owner/AAL2 claims, draft and zero opening, uniqueness under concurrent key reservation, exact amounts, deferred rollback, and immutable correction/history rules. The harness shut down the cluster. |
| `npm.cmd run test:server-db` | 3 passed. Mocked HTTP covers missing or unsafe settings, the read-only owner DTO, denial and sanitized transport failures. |
| `npm.cmd run lint` and `npm.cmd run typecheck` | Passed with Node 24.22.1. |
| `npm.cmd run build` and production smoke | The final workspace-root rerun reproduced the Turbopack CSS-worker startup failure on Node 24.22.1. All 21 runtime source and configuration files matched the successful Milestone A clean copy byte-for-byte, including the lockfile. The clean-copy production smoke returned HTTP 200 and Arabic RTL HTML on all five routes. The comparison points to a workspace-specific build issue. The exact cause remains unconfirmed. |
| `npm.cmd run build -- --webpack` | Passed again in the original workspace on Node 24.22.1 and produced all five application routes. |
| `npm.cmd run test:privacy` | 17 passed in Edge, including viewport, zero, unavailable, and refresh/navigation/tab reset checks. The first Chrome run stalled in the DevTools refresh/new-tab check. The test now uses a fresh profile and waits for route transitions. |

PostgreSQL verification used synthetic Supabase roles and request claims. The ledger suite uses the disposable cluster's test admin to exercise storage constraints. The application role has no posting privileges. Real JWT verification, Data API schema exposure and grants, session refresh, MFA and hosted transaction behavior remain pending.

### Continue from here

1. Identify an authorized development/staging Supabase project or approve an isolated real Supabase stack. Use synthetic test identities, with self-signup off. Keep production and real data out of the exercise.
2. In Milestone B, verify the signed Auth JWT and owner binding, MFA challenge and refresh, session and recovery flows, and denial matrix through the actual Data API. See the [implementation plan](DEQS-IMPLEMENTATION-PLAN.md) and [traceability matrix](DEQS-REQUIREMENTS-MATRIX.md).
3. Track the workspace-root Turbopack failure separately. The verified workspace build fallback is documented in [README](../README.md).

### Start the existing application

```powershell
Set-Location 'C:\Users\ASUS\OneDrive\Desktop\DEQS'
node --version
npm.cmd --version
npm.cmd run dev -- --hostname 127.0.0.1
```

Use Node 24.22.1 and npm 11.20.0. With dependencies already installed, the server opens at [http://127.0.0.1:3000](http://127.0.0.1:3000).

---

## Historical handover · 6 November 2026

Last updated: 6 November 2026, Asia/Amman.
Development is paused. Do not start another phase without the owner's instructions.

## Completed phases

| Phase | Delivered and verified |
| --- | --- |
| 1 | Next.js App Router, TypeScript, Tailwind, Arabic/RTL foundation, responsive welcome page, and setup documentation |
| 1.1 | Welcome-page refinement, accessibility fixes, dependency review, and six-viewport browser verification |
| Local checkpoint | Commit `eb43b6243319ae38620a4f894779636a93574b25`, message `chore: baseline phase 1.1 verified` |
| 2 | Reusable application shell, right sidebar with collapse, accessible mobile drawer, dashboard, and five working routes |
| 2.1 | Focused total-debt privacy behavior, explicit unavailable/available states, automatic privacy resets, stable amount layout, and automated tests |

Phase 2.1 implementation and verification are complete within the documented scope.
Its changes are saved on disk and have not been committed. Phase 3 has not started.

## Current application

- `/`: dashboard with five summaries, recent-activity empty state, and customers link.
- `/customers`, `/archive`, `/reports`, `/settings`: consistent placeholder pages;
  business functionality is explicitly unavailable.
- Total debt currently displays “لا توجد بيانات بعد” with no reveal button because
  real financial data is not connected. Other metrics retain their unavailable state.
- Available future debt amounts, including verified zero, start hidden. Mouse,
  touch, Enter, and Space can reveal/hide them. Refresh, new tabs, route navigation,
  history return, and tab hiding reset privacy. Visibility is never persisted.
- Amount strings use three JOD decimal places without financial arithmetic.
- No database, authentication, customer operations, transactions, repayments, opening
  balances, corrections, or report calculations are implemented. No financial mock
  records are present in the actual application UI. Test-only fixtures are isolated.

## Tests already performed

These checks passed before this handover. They were not rerun for the safe stop.
Only lightweight status, saved-result, and HTTP checks were performed today at handover.

| Check | Recorded result |
| --- | --- |
| Phase 1.1 clean lockfile installation | Passed; existing ESLint deprecation warning documented |
| `npm.cmd run typecheck` | Passed, exit 0 after final Phase 2.1 implementation |
| `npm.cmd run lint` | Passed, zero warnings |
| `npm.cmd run build` | Passed; all five application routes statically prerendered |
| `npm.cmd ls --all --offline` | Passed, exit 0; no new dependency conflicts |
| `npm.cmd run test:privacy` | 17 reported tests passed, zero failures (16 subtests and their parent) |
| Production browser regression | 88 assertions passed, zero failures; saved JSON rechecked during handover |
| Production HTTP route checks | All five routes returned HTTP 200 with Arabic/RTL attributes |
| Console/hydration | No captured browser errors in the completed fixture/production runs |

Privacy tests covered hidden SSR/hydration, no initial numeric flash, show/hide,
accessible labels/tree, refresh, new tab, client navigation, back/forward and
full-document history return, actual tab hiding, persisted lifecycle handlers,
unavailable data, zero, keyboard/touch input, and absence of visibility persistence.

Chrome checks used 1920×1080, 1366×768, 1280×720, 768×1024, 390×844, and 375×667.
Long-value fixture tests confirmed identical card/neighbor geometry when toggling,
44px touch targets, intact decimal groups, and no horizontal amount overflow.
Production regression retested routes, active links, RTL/sidebar placement,
collapse/expand, drawer focus/scroll locking, Escape/backdrop/navigation dismissal,
resize dismissal, and the customers link. Phones retain normal vertical scrolling.

See [Phase 1.1 QA](phase-1.1-qa.md), [Phase 2 QA](phase-2-qa.md), and
[Phase 2.1 QA](phase-2.1-qa.md) for scope and detailed evidence.
Ignored local artifacts remain preserved in `.qa/`, including
`phase21-tests/` and `phase21-regression/results.json`.

## End-of-day operations check

- Development server at `http://127.0.0.1:3000` returned HTTP 200 and was left running.
- Port 3001 refused connections: the temporary production verification server is stopped.
- No `.git/index.lock`, `.git/HEAD.lock`, or `.git/config.lock` was present.
- No agent-started build, test, installation, or commit operation is known to be pending.
  Completed test runs stopped their own fixture servers and browsers.
- Windows denied process-command-line enumeration. Some Node processes are present,
  so their identities could not all be independently confirmed during handover.
  No process was terminated or changed for this task.
- No tests, installations, application edits, staging, commits, pushes, resets,
  cleanup, or file deletion were performed as part of this handover.
  This progress document is the only new handover file.

## Git status

Branch: `main`.

Latest commit remains `eb43b6243319ae38620a4f894779636a93574b25`
(`chore: baseline phase 1.1 verified`). Phases 2 and 2.1 are not in that checkpoint.
The working tree is intentionally dirty. Nothing was staged or committed by this
handover, and no uncommitted work was reverted.

Tracked modifications at handover:

- `README.md`
- `package.json`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `tsconfig.json`

Untracked additions include:

- `docs/phase-2-qa.md`, `docs/phase-2.1-qa.md`, and this progress document.
- Route pages under `src/app/archive/`, `customers/`, `reports/`, and `settings/`.
- Components: `app-shell.tsx`, `debt-summary.tsx`, `empty-state.tsx`, `icon.tsx`,
  `placeholder-page.tsx`, and `section-intro.tsx` under `src/components/`.
- `tests/privacy.test.mjs`, `tests/helpers/browser.mjs`, and
  `tests/helpers/privacy-fixture.mjs`.

Dependencies, build output, environment files, and QA/browser artifacts remain
ignored. The existing package lockfile has no changes. Closing the editor does not
discard these saved files, but the latest implementation has no new Git checkpoint.

## Known limitations and unfinished work

- No known blocking implementation task remains within Phase 2.1. Reviewing and
  authorizing a new local Git checkpoint is still outstanding.
- ESLint 9 is end-of-life but compatible with the installed lint plugins. Its
  support limitation remains documented; no dependency updates were made.
- Available-value tests use an isolated Next.js development fixture; the real
  production app remains unavailable-data-only.
- Safari, Firefox, physical phones, screen-reader speech, high zoom, and deployed
  performance remain unverified. A specific real back-forward-cache hit was not
  forced; full-document history and persisted lifecycle handlers were tested.
- Visual masking is not authentication, authorization, encryption, or protection
  against inspecting client memory/network payloads. Server-side access controls
  are needed before future real-data integration.
- Later business phases remain intentionally unimplemented and require instructions.

## First steps tomorrow

1. Read this handover and inspect `git status --short --branch` before editing.
   Preserve all existing modified and untracked files.
2. Open the running site, or restart it with the commands below if needed.
3. Review the completed Phase 2.1 implementation and QA report. Ask the owner whether
   to create a local checkpoint; do not commit automatically.
4. Confirm the owner's next requested scope before beginning any new phase.
   Rerun targeted checks if code changes; no dependency reinstall is needed simply
   to resume the current setup.

## Exact development startup commands

First try `http://127.0.0.1:3000` in the browser. If the server is still running,
there is no need to start another instance. If it has stopped, use PowerShell:

```powershell
cd 'C:\Users\ASUS\OneDrive\Desktop\DEQS'
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
$env:NEXT_TELEMETRY_DISABLED = '1'
npm.cmd run dev -- --hostname 127.0.0.1
```

Then open `http://127.0.0.1:3000`. Use Ctrl+C in the server terminal when you choose
to stop it. These environment changes apply only to that PowerShell session.
Closing the app or restarting Windows may stop the server; restart it as above.

Development is safely paused. Wait for the owner's next instructions.
</file>

<file path="docs/DEQS-QUALITY-STANDARDS.md">
# DEQS quality standards

The [master specification](DEQS-MASTER-SPEC.md) defines product acceptance. Use the [requirements matrix](DEQS-REQUIREMENTS-MATRIX.md) and [implementation plan](DEQS-IMPLEMENTATION-PLAN.md) to record evidence and decide when to advance.

## Engineering and release gates

1. Preserve baseline behavior. Inspect Git and existing QA before changing a feature. Review migration and permission diffs, verify that no secrets or personal data are included, and document unresolved decisions.
2. Use the pinned Node runtime and committed lockfile. Run `npm.cmd run lint`, `npm.cmd run typecheck` and `npm.cmd run build`. Run `npm.cmd run test:privacy` when testing the current dashboard or delivering a milestone. Record command, runtime, scope, outcome and blocked checks.
3. For database changes, apply the versioned migrations from empty on isolated PostgreSQL and exercise negative and concurrent cases using independent connections. Before enabling access, repeat migration, grant and RLS tests on the target Supabase configuration, including the Data API, verified JWTs, owner binding and AAL2. Before enabling writes, prove transaction-end rollback, committed receipt visibility and restore behavior against that configuration.
4. Every financial command uses integer fils, an explicit confirmed intent, a stable key and versioned canonical payload. Replays verify full payload equality. Post immutable ledger entries, related audit rows and the terminal receipt atomically. Test actual committed state after duplicates, cancellation, faults and uncertain responses. Reconcile ledger, statements and reports before accepting money workflows.
5. Gate owner data server-side and inside PostgreSQL. Deny anonymous, non-owner and AAL1 access by default. Keep sessions, pending financial information, personal details and service credentials out of client storage, caches, logs, test output and source control. Use synthetic fixtures and privileged accounts only for isolated setup or authorized maintenance.
6. Exercise Arabic RTL, keyboard and focus behavior, screen-reader names, text and money legibility, loading, empty, offline and error states. Test the viewport matrix and representative desktop and mobile browsers. Verify privacy reset and avoid using placeholders that imply financial data exists.
7. Treat a recovery drill as a release gate. Verify checksums and reconciliation in isolation, keep writes disabled until owner approval, rotate the write epoch, and check uncertain commands before traffic resumes. The owner approves paid resources, production activation, and use of real data.

Record the evidence level explicitly. Native PostgreSQL tests with synthetic claims cover database policies and constraints. Mocked transport tests cover adapter behavior. Real authentication, platform grants and hosted transaction semantics require separate tests. Keep any failed or skipped gate visible in progress and traceability.
</file>

<file path="docs/DEQS-REQUIREMENTS-MATRIX.md">
# DEQS requirements traceability

The [master specification](DEQS-MASTER-SPEC.md) is the full acceptance contract. Section numbers below refer to that document. **Local** evidence is limited to the test environment named in [progress](DEQS-PROGRESS.md). **Partial** means a named layer exists with later acceptance still required. **Pending** means scheduled. **Gated** means a prerequisite must be satisfied first. Existing design files are linked even when the corresponding implementation is pending.

| ID | Requirement and master reference | Priority | Milestone | Status | Files | Automated tests or acceptance gate | Verification and limits |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ENG-01 | Preserve checkpoint, application, specification, work and Git history (§0–2, 36–37) | Required | A–L | Local | [Spec](DEQS-MASTER-SPEC.md), [progress](DEQS-PROGRESS.md), [rules](../AGENTS.md) | Git diff and attachment hash | No commit or release implied |
| ENG-02 | Maintain decisions, requirements, milestones, reproducible checks and evidence (§2–4, 29, 34) | Required | A–L | Local | [Plan](DEQS-IMPLEMENTATION-PLAN.md), [standards](DEQS-QUALITY-STANDARDS.md), [decisions](architecture/decisions.md) | Lint, type check, build and milestone tests | Use recorded evidence per milestone |
| DB-01 | Versioned PostgreSQL/Supabase schema, isolation, constraints, indexes and default deny (§6) | Required | A | Local | [Migrations](../supabase/migrations) | [Native PostgreSQL](../tests/database.test.mjs) | Hosted roles, schema exposure and grants pending |
| DB-02 | Safe server-only access, environment template, no privileged runtime key (§6, 27, 29) | Required | A–B | Partial | [Adapter](../src/server/owner-context.ts), [template](../.env.example) | [Adapter tests](../tests/server-db.test.mjs) | Mock HTTP. Adapter is not wired to a route |
| SEC-01 | Enforce owner identity and AAL2 independently on server and DB, test anonymous/non-owner/AAL1 (§11, 27, R) | Critical | A–B | Partial | [Boundary](../supabase/migrations/20261108000300_owner_context_boundary.sql), [security](architecture/security.md) | Native role/claim tests and staged signed-session E2E | Native claims simulated. Actual sessions pending |
| SEC-02 | No signup, owner-only provisioning, login/logout, challenge, expiry and session refresh (§11) | Critical | B | Gated | [Security](architecture/security.md) | Real Auth, TOTP and session-cookie tests | Authorized Supabase and synthetic identities required |
| SEC-03 | Secure recovery, restricted operator, expiry, rate limits, tamper, CSRF, XSS, private caching/logging (§11, 26–27, 31) | Critical | B, J–L | Pending | [Security](architecture/security.md), [recovery](architecture/recovery.md) | Recovery drill and full security suite | Operational policies and real platform evidence required |
| CUS-01 | Validated create/edit, bounded name, optional normalized contact and immutable profile audit (§12) | Required | C | Partial | [Schema](architecture/database-schema.md) | Native immutability plus future CRUD/audit tests | Schema only. Atomic mutations pending |
| CUS-02 | Customer list, Arabic search, duplicate hints, pagination and independent Save/Add New (§12) | Required | C | Pending | [Plan](DEQS-IMPLEMENTATION-PLAN.md) | RTL forms, search and duplicate-intent E2E | Customer page is a placeholder |
| FIN-01 | Exact JOD integer fils and decimal-string API, sign rules, input limits and zero/credit states (§7, A–F) | Critical | A, D–F | Partial | [Schema](architecture/database-schema.md), [ledger](architecture/ledger-and-reporting.md) | Native exact sums and sign checks plus parser/formatter tests | Business input limits and end-to-end representation pending |
| FIN-02 | Durable prepare/post/status/cancel, canonical payload, same-key replay and differing-payload conflict (§8–9, G–K, Q, T) | Critical | A, D | Partial | [Guards](../supabase/migrations/20261108000200_ledger_guards.sql), [protocol](architecture/transaction-safety.md) | Native key race, fingerprint and rollback plus replay/fault tests | API, concurrent posting and stale epoch pending |
| FIN-03 | Exact atomic receipt, transaction lock, pending recovery and fail-safe retry across devices (§8–9, H–J, Q, T) | Critical | D | Partial | [Protocol](architecture/transaction-safety.md) | Deferred native rollback plus commit-end Data API and multi-session tests | No financial posting endpoint or durability claim |
| FIN-04 | Online-only, no local financial queue or offline submit, validate on reconnect (§5, 10) | Critical | D–F | Pending | [Protocol](architecture/transaction-safety.md) | Browser/network loss, pending recovery and no offline writes | UI is not connected to money workflows |
| FIN-05 | Ready, validating, saving, success, failed and uncertain UI, keep receipt and key (§10) | Critical | D–F | Pending | [Protocol](architecture/transaction-safety.md) | Submit/keyboard, lost response and Arabic accessibility tests | Success requires a verified commit |
| MIG-01 | Independent Save and Add New, durable drafts, separate review and explicit approval (§12–13, A) | Critical | A, E | Partial | [Draft model](architecture/database-schema.md), [ledger](architecture/ledger-and-reporting.md) | Native draft/approval transaction plus future form and reload tests | Draft storage and commit guard. Workflow pending |
| MIG-02 | Openings once per reviewed source/customer slot, explicit zero, immutable linkage (§13, A, O) | Critical | A, E | Partial | [Migrations](../supabase/migrations) | Native duplicate source/slot and incomplete approval plus E2E | No real imports. Owner cutover decisions pending |
| MIG-03 | Reconcile count and sum to independent paper totals, close cutover, gate live purchases (§13, P) | Critical | E | Pending | [Ledger](architecture/ledger-and-reporting.md) | Unmatched totals, explicit exceptions, closed-state and concurrent tests | Closure routine and reviewed totals pending |
| ACC-01 | Customer account, clear balances and history, useful primary actions (§14) | Required | F, I | Pending | [Plan](DEQS-IMPLEMENTATION-PLAN.md) | Account navigation, pagination and statement reconciliation | No account page yet |
| ACC-02 | Confirm and post purchases, partial/full repayments and overpayments, consume credit automatically (§15–16, B–F, K) | Critical | F | Pending | [Ledger](architecture/ledger-and-reporting.md) | Exact post-transaction balances and two identical intentional purchases | Business routines and owner confirmation policy pending |
| AUD-01 | Append-only financial history with effective and recorded timestamps (§17, 22) | Critical | A, D | Partial | [Guards](../supabase/migrations/20261108000200_ledger_guards.sql) | Native immutable DML and truncation denial | Runtime posting roles pending |
| AUD-02 | Reasoned reversal/replacement, wrong-customer move, preserve original and show audit links (§18, L–M) | Critical | A, G | Partial | [Guards](../supabase/migrations/20261108000200_ledger_guards.sql), [ledger](architecture/ledger-and-reporting.md) | Native complete correction, bad reversal and duplicate target plus race/move E2E | Authorized correction workflow and audit views pending |
| AUD-03 | Archive with balance warning, preserve history, restore same identity, block writes by default (§19, N) | Critical | G | Pending | [Decisions](architecture/decisions.md), [ledger](architecture/ledger-and-reporting.md) | Archive/restore E2E and race with posting | UI and authorization policy pending |
| DSH-01 | Integrate overview, live totals per customer, recent activity and quick navigation (§20) | Required | H | Partial | [Dashboard](../src/app/page.tsx), [ledger](architecture/ledger-and-reporting.md) | Phase 2 shell QA and future reconciliation | Existing mock-free shell only |
| DSH-02 | Hide total debt initially, explicit toggle, reset on refresh/navigation/tab, zero vs unavailable (§20) | Critical | H | Partial | [Privacy test](../tests/privacy.test.mjs), [Phase 2.1 QA](phase-2.1-qa.md) | Browser privacy regression | Available-value scenarios use isolated fixtures. Production data integration pending |
| RPT-01 | Daily, weekly, monthly, yearly and custom reports for debt, credit, purchases, repayments, openings, corrections and statements (§21–22, P) | Required | H | Pending | [Ledger](architecture/ledger-and-reporting.md) | Amman boundaries, archived balances, gross and corrected activity, watermarks and reconciliation | Report surface is a placeholder |
| RPT-02 | Customer statements, opening/closing totals, Arabic A4 print, safe optional export and privacy (§23) | Required | I | Pending | [Ledger](architecture/ledger-and-reporting.md), [security](architecture/security.md) | Print layout, export authorization, CSV formula injection and total checks | Business printing/export pending |
| UX-01 | Premium Arabic RTL, light theme, useful empty/loading/offline states, controls and final polish (§24, 32) | Required | I, K | Partial | [Phase 2 QA](phase-2-qa.md) | Existing shell QA plus final task-flow QA | Review optional dark mode only after mandatory flows |
| UX-02 | Specified desktop/laptop/tablet/mobile viewports, keyboard, focus, contrast, targets and assistive tech (§25, 31) | Required | I, K | Partial | [Phase 2 QA](phase-2-qa.md), [Phase 2.1 QA](phase-2.1-qa.md) | Existing browser checks plus final viewport and device matrix | Final product and real device QA pending |
| UX-03 | Evaluate recent/frequent customers, shortcuts, previews, last receipt, duplicate warnings, unsaved changes and filters (§24, 32) | Recommended | C, F, I, K | Pending | [Plan](DEQS-IMPLEMENTATION-PLAN.md) | Owner task review for applicable improvements | Apply where it improves the required workflows |
| OPS-01 | Provider recovery plus encrypted portable export, Auth distinction, checksum, retention and isolated restore (§26, S) | Critical | J | Pending | [Recovery](architecture/recovery.md) | Restore drill and ledger/receipts/identity checks | Operator, policy, tools and storage approval needed |
| OPS-02 | Safe recovery read/write switches, new epoch and uncertain command reconciliation (§26, S–T) | Critical | A, J | Partial | [Schema](architecture/database-schema.md), [recovery](architecture/recovery.md) | Native disabled defaults plus future stale-epoch and recovery tests | Write epoch storage only. Operational controls pending |
| OPS-03 | Query performance, consistent snapshots, bounded retries, monitoring and useful failures (§28, 31) | Required | H, K–L | Pending | [Schema](architecture/database-schema.md), [plan](DEQS-IMPLEMENTATION-PLAN.md) | Representative-volume plans, browser timing and restart tests | Production volume and platform testing pending |
| QA-01 | Financial A–T, security, responsiveness and release-quality automation (§30–32, 34–35) | Critical | K | Partial | [Native tests](../tests/database.test.mjs), [privacy tests](../tests/privacy.test.mjs), [standards](DEQS-QUALITY-STANDARDS.md) | Full acceptance matrix | A/G/H/J/K/L/M/O/Q/R foundation coverage only where described above |
| REL-01 | Production access/cost approval, environment isolation, migration rehearsal, rollback, backup, acceptance and reporting (§33–37) | Critical | L | Gated | [Plan](DEQS-IMPLEMENTATION-PLAN.md), [recovery](architecture/recovery.md), [progress](DEQS-PROGRESS.md) | Full release and owner checklist | No deployment or real data approval assumed |
</file>

<file path="docs/phase-1.1-qa.md">
# DEQS Phase 1.1 quality report

Verified on 5 November 2026 using Windows, Node.js 26.13.0, npm 11.20.0,
and installed Google Chrome in headless mode. Scope remains the Phase 1 welcome page.

## Review and findings

Reviewed the source tree, App Router layout and page, branding SVG, metadata,
global CSS, Tailwind/PostCSS setup, strict TypeScript configuration, Next.js
configuration, ESLint configuration, package manifest, lockfile, and npm scripts.
The existing structure is appropriate for this phase. No unused direct dependencies,
broken imports, application client components, database integrations, or financial
records were found. No framework configuration rewrite was necessary.

The original page had avoidable vertical scrolling at five requested sizes:

| Viewport | Original document height | Final document height |
| --- | ---: | ---: |
| 1920 × 1080 | 1080 | 1080 |
| 1366 × 768 | 1037 | 768 |
| 1280 × 720 | 1037 | 720 |
| 768 × 1024 | 1037 | 1024 |
| 390 × 844 | 868 | 844 |
| 375 × 667 | 868 | 667 |

The original skip link changed the fragment but did not move focus to main content.
The original footer's stone-500 text had approximately 4.48:1 contrast against
the neutral base background, marginally below 4.5:1 for normal text.

## Changes

- Reduced header, card, and outer padding; reduced card maximum width from 896px
  to 768px. All content fits the six requested viewports at default scale.
- Reduced the heading from 48px to 40px on larger screens and from 30px to 28px
  on phones; preserved natural Arabic letter spacing and comfortable line heights.
- Balanced the brand mark with the wordmark and scaled the central mark down.
- Removed the decorative divider and tightened gaps without removing any wording.
- Increased small badge/footer text to 14px and darkened supporting/footer text.
  Measured normal text contrast is above 4.5:1 against its intended background.
- Added `tabIndex={-1}` and a keyboard focus outline to main content. Chrome
  verified that Tab reveals the skip link and Enter focuses `main-content`.
- Removed an unnecessary accessible label from a generic branding container;
  visible DEQS text supplies the name. Decorative SVGs remain hidden from AT.
- Ignored temporary browser profile and QA output in Git and ESLint.

Arabic wording, identity, light palette, dark green accents, and server components
are preserved. No new runtime or development dependencies were added.

## Dependency compatibility

Installed versions: Next.js/eslint-config-next 16.4.5, React/react-dom 19.3.1,
TypeScript 5.9.3, Tailwind/PostCSS plugin 4.3.4, ESLint 9.39.5.

`npm view eslint@9.39.5 deprecated --offline` reproduces the exact registry metadata:
“This version is no longer supported. Please see https://eslint.org/version-support for other options.”
This is a lifecycle/deprecation warning, not an installed peer-dependency conflict.
ESLint's official support page lists version 9 as end-of-life.

The actual installed peer ranges explain why simply upgrading ESLint is unsuitable:

| Package | Installed version | ESLint peer range |
| --- | --- | --- |
| eslint-config-next | 16.4.5 | >=9.0.0 |
| eslint-plugin-react | 7.37.5 | ^3 through ^8, or ^9.7 |
| eslint-plugin-import | 2.32.0 | ^2 through ^8, or ^9 |
| eslint-plugin-jsx-a11y | 6.10.2 | ^3 through ^8, or ^9 |

ESLint 9.39.5 satisfies these ranges; ESLint 10 does not. The complete installed
dependency tree passes `npm ls --all --offline` with exit 0. Versions and lockfile
were preserved. No `--force`, `--legacy-peer-deps`, overrides, experimental packages,
or disabled lint rules were introduced. Fully supported lint tooling remains an
upstream compatibility follow-up; this phase does not claim to have resolved EOL.

References: [ESLint version support](https://eslint.org/version-support/),
[React ESLint plugin's ESLint 10 compatibility issue](https://github.com/jsx-eslint/eslint-plugin-react/issues/3984).

## Executed checks

| Check | Actual result |
| --- | --- |
| `npm.cmd ci --offline --no-audit --no-fund` | Exit 0; 369 packages installed from project cache; ESLint deprecation warning remains |
| `npm.cmd ls --all --offline` | Exit 0; no invalid peers or missing dependencies |
| `npm.cmd run typecheck` | Exit 0; route generation and strict TypeScript validation passed |
| `npm.cmd run lint` | Exit 0; zero errors and zero warnings |
| `npm.cmd run build` | Exit 0; no build warnings; `/` statically prerendered |
| Development server | Started successfully on 127.0.0.1:3000; HTTP 200 |
| Production server | Started successfully on 127.0.0.1:3001; HTTP 200 |
| Arabic and RTL | Both servers return `lang="ar"`, `dir="rtl"`, required title and subtitle |
| Application icon | Production `/icon.svg` returns HTTP 200 |
| Keyboard navigation | Skip link visible on focus; activation moves focus to main |

## Browser verification

Used Chrome DevTools Protocol through Node's built-in WebSocket support; no browser
automation dependency was installed. Captured and visually inspected all six refined
development viewports, and repeated layout, console, focus, and screenshot checks
against the production server at all six sizes above.

All six final sizes showed no horizontal overflow, no unnecessary vertical scrolling,
no clipped text, no header/card/footer overlap, and readable RTL content. The document
has one h1 and semantic header, main, section, and footer landmarks. Chrome reported
no captured console errors or uncaught runtime exceptions during these checks.
The layout-shift observer recorded 0 in these short, local page-load runs.
These measurements are not a Lighthouse score, field Core Web Vitals assessment,
performance guarantee, or full accessibility certification.

Local, Git-ignored evidence:

- `.qa/baseline/`: original viewport screenshots and measurements.
- `.qa/refined/`: refined development screenshots and measurements.
- `.qa/production/`: production screenshots and measurements.
- `.qa/check.mjs`: temporary browser verification script.
- `.dependency-tree.log`: complete installed dependency tree.

## Modified files and limits

Modified: `src/app/page.tsx`, `.gitignore`, `eslint.config.mjs`, and `README.md`.
Added: this report. Temporary QA artifacts are ignored and are not app features.

No system-wide Windows settings or files outside DEQS were intentionally changed.
The existing system font stack and lightweight SVG assets remain unchanged.

Firefox, Safari/WebKit, physical mobile devices, screen-reader speech output,
high-zoom/reflow scenarios, and sustained performance under deployment conditions
were not tested. Mobile checks use Chromium viewport emulation, not actual phones.
No package vulnerability audit was performed; the installation check explicitly
used `--no-audit` and does not establish the absence of vulnerabilities.

The Phase 1 interface is ready for review at the specified viewports. The remaining
ESLint lifecycle issue is documented. No Phase 2 functionality was started.
</file>

<file path="docs/phase-2-qa.md">
# Phase 2 — dashboard and application interface

Verified on 6 November 2026. The repository started clean at the existing Phase 1.1
checkpoint. Git history was preserved; changes are left uncommitted for review.

## Delivered interface

- Shared right-hand desktop sidebar with five routes, active links using
  `aria-current`, accessible collapsed labels, and a compact page header.
- Modal mobile navigation drawer with explicit keyboard focus wrapping, native
  background inertness, scroll locking, focus return, and Escape/backdrop/button/
  navigation dismissal. Resizing to desktop also dismisses the drawer.
- Dashboard with all five requested financial summaries, an honest recent-activity
  empty state, and a working link to customers.
- Customers, archive, reports, and settings routes with consistent, clearly stated
  unavailable functionality. No nonfunctional add/payment/report/settings controls.
- Debt privacy control with accessible action labels, pressed state, and a polite
  live announcement. It changes local display state only. Preferences are session
  component state and are not persisted across reloads.

The existing DEQS mark, deep green branding, off-white background, system font stack,
Arabic document language, and RTL direction remain. Semantic credit/debt color tokens
are reserved for future states; no numeric financial states are invented.

## Financial display states

All five current summaries show “غير متاح”. No numeric values or mock records are
supplied by the application. A nearby note explains that unavailable is not zero.
Hiding total debt replaces its display with masked dots and accessible hidden-state
text. Showing it restores the unavailable state. The debt component checks `null`
explicitly, so a future supplied formatted zero is displayed rather than treated
as missing. An isolated render assertion checked this distinction without adding
financial records or values to the application.

## Implementation and scope

Routes and their content remain server components. `AppShell` and `DebtSummary`
contain the necessary client interaction. Empty states, page introductions,
placeholder layouts, and icons are reusable components. No additional packages,
remote fonts, authentication, database, persistence, financial calculations,
transaction APIs, or customer management functionality were added.

Modified: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `README.md`.
Added four route pages under `src/app/{customers,archive,reports,settings}/`, plus
`app-shell.tsx`, `debt-summary.tsx`, `empty-state.tsx`, `icon.tsx`,
`placeholder-page.tsx`, and `section-intro.tsx` in `src/components`, and this report.
Existing package manifest, lockfile, TypeScript, Next.js, and lint configuration are
unchanged. All source and temporary QA artifacts are inside DEQS.

## Verification results

| Check | Actual result |
| --- | --- |
| `npm.cmd run typecheck` | Passed, exit 0 |
| `npm.cmd run lint` | Passed, exit 0; zero warnings |
| `npm.cmd run build` | Passed, exit 0; all five application routes statically prerendered |
| Production startup | Passed on 127.0.0.1:3001 |
| Development application | Accessible on 127.0.0.1:3000 during verification |
| Production HTTP | HTTP 200 and Arabic/RTL document attributes for all five routes |
| Browser suite | 88 assertions passed, zero failures |
| Extra interaction checks | Touch drawer opening, reverse-Tab wrapping, and close-button focus return passed |
| Amount state render assertions | Unavailable and explicit zero render differently; passed |
| Text contrast samples | 15 computed-color samples passed 4.5:1; minimum 4.73:1 |
| Browser console/runtime | No captured console errors or uncaught exceptions in the main production suite |

The browser suite covered all five routes at all six viewport sizes, active
navigation, document language/direction, one h1, horizontal overflow, text clipping,
and right sidebar geometry. Interaction assertions covered privacy hide/show,
desktop collapse/expand, modal opening/right alignment/scroll lock, forward-Tab
wrapping, Escape and backdrop dismissal, focus return, navigation dismissal
(including selecting the current route), resize dismissal, and the customers link.

Initial browser checks caught unreliable event-based scroll locking and a focus
cycle that briefly reached the document body; explicit locking and Tab wrapping
resolved both before final production verification.

## Responsive visual checks

Used installed Chrome 157 in headless mode, controlled through DevTools Protocol
and Node's built-in WebSocket support. No automation package was installed.
Final viewport screenshots were inspected, including expanded/collapsed desktop
navigation and the mobile drawer. All five routes were measured at all six sizes.

| Viewport | Dashboard result |
| --- | --- |
| 1920 × 1080 | Fits viewport; expanded sidebar on right |
| 1366 × 768 | Fits viewport; compact spacing, no page overflow |
| 1280 × 720 | Fits viewport; compact spacing, no page overflow |
| 768 × 1024 | Fits viewport; drawer navigation |
| 390 × 844 | Stacked dashboard with normal vertical scrolling; no horizontal overflow |
| 375 × 667 | Stacked dashboard with normal vertical scrolling; no horizontal overflow |

No clipped text or broken layouts were detected. Phone content remains scrollable
to the recent-activity section; the drawer locks background scrolling only while
open. Native modal behavior prevents background pointer/keyboard interaction.
Subtle transitions respect `prefers-reduced-motion`.

The headless full-page screenshot option produced an incorrect horizontal crop for
some RTL desktop captures despite correct DOM geometry. Final desktop evidence was
recaptured using viewport screenshots and visually checked; this required no app
workaround. Mobile full-page captures from the main run and viewport captures from
the additional run provide complementary evidence.

Local Git-ignored QA artifacts are under `.qa/phase2-production/`, including
`results.json`, `additional-checks.json`, and screenshots. Scripts used are
`.qa/phase2.mjs`, `.qa/phase2-extra.mjs`, and `.qa/value-check.cjs`.

## Remaining limitations

Mobile results use Chrome emulation, not physical devices. Safari/WebKit, Firefox,
screen-reader speech output, high zoom, and deployed performance were not tested.
Contrast sampling and keyboard tests do not constitute full accessibility certification.
No performance score, security audit, or connected financial accuracy is claimed.
The existing ESLint 9 end-of-life limitation remains as documented in Phase 1.1;
dependencies were not changed for this interface task.

This completes the requested Phase 2 interface. Business functionality remains for
future explicitly requested phases.
</file>

<file path="docs/phase-2.1-qa.md">
# Phase 2.1 — financial display privacy

Verified on 6 November 2026. This report supersedes the total-debt privacy behavior
described in the historical Phase 2 report. No Git commit was created.

## Implementation

`DebtSummary` now accepts an explicit `DebtData` union:

- `{ status: "unavailable" }`: renders “لا توجد بيانات بعد” and no eye button.
- `{ status: "available", amount: string }`: starts masked, including a real zero.
  The amount must be a canonical non-negative decimal JOD string with exactly three
  fractional digits. Formatting adds grouping separators without floating-point
  conversion or financial arithmetic.

The production dashboard still supplies no financial data; it uses the unavailable
default. Other summary metrics retain their existing display and behavior.

Available amounts use temporary component state initialized to hidden on both the
server and client. No visibility preference is written to storage, cookies, URL
parameters, or settings. Lifecycle listeners mask on tab hiding, pagehide, pageshow,
and popstate; layout-effect cleanup resets state when a route is left/deactivated.
Listeners are removed on cleanup. Lifecycle resets commit synchronously before
browser page suspension/history capture; returning to a hidden tab does not reveal.

The available-data eye button sits beside the amount with a 44 × 44px target,
action-based Arabic labels, `aria-pressed`, `aria-controls`, hover/active/focus
feedback, and reduced-motion support. Masked amounts are omitted from rendered
number elements, labels, titles, and data attributes. Live-region text announces
the masked state without announcing its value.

The amount area reserves equal space for hidden/revealed states. Large values wrap
only between comma-separated groups; the decimal group remains intact. Three
fractional digits and the JOD label are retained. Caption text is stable while
toggling so neighboring cards and the activity panel do not move.

Tailwind explicitly scans `src/` so the same utilities apply when the actual
components are imported into the isolated test app. TypeScript excludes generated
`.qa/` output. No runtime or development dependencies were added or upgraded.

## Files changed for Phase 2.1

Modified:

- `src/components/debt-summary.tsx`: explicit data state, hidden defaults, lifecycle
  resets, accessible eye control, and decimal-string display formatting.
- `src/app/globals.css`: scoped debt-card spacing, stable amount area, 44px control,
  numeric group wrapping, and explicit Tailwind source discovery.
- `package.json`: added `test:privacy` script only.
- `tsconfig.json`: excluded generated `.qa/` artifacts.
- `README.md`: documented new behavior, input contract, tests, and limitations.

Added:

- `tests/privacy.test.mjs`: focused browser privacy tests.
- `tests/helpers/browser.mjs`: dependency-free local Chromium/CDP helpers.
- `tests/helpers/privacy-fixture.mjs`: isolated Next.js fixture setup.
- `docs/phase-2.1-qa.md`: this report.

The existing Phase 2 changes were already uncommitted when work began. Dashboard
route content, shell/navigation logic, unrelated metric behavior, lockfile, framework
configuration, and Git history were preserved by this phase.

## Automated privacy results

Run `npm.cmd run test:privacy`. This uses Node's built-in test runner, an installed
Chromium browser, and a temporary isolated Next.js development app under `.qa/`.
Its pages import the actual application components and styles. Available/zero/long
amount fixtures are test-only; they do not create actual application routes or
financial records. The runner starts/stops its own browser and fixture server.

Final result: **17 reported tests passed, zero failures** (16 focused subtests plus
the parent test). Covered:

| Requirement | Actual verification |
| --- | --- |
| Hidden initial render | Server article markup masked; initial client DOM masked |
| No initial flash | Mutation observer from document parsing through hydration recorded no unrequested numeric value |
| Reveal/hide | Available amount appears on first activation and is removed on second |
| Labels and semantics | Exact Arabic show/hide labels and pressed state checked |
| Hidden accessibility | Accessibility tree and masked card markup contain no amount |
| Refresh | Revealed fixture becomes masked after real browser reload |
| New tab | New browser target opens masked |
| Client navigation | Customers navigation and return reset privacy |
| Browser history | Back/forward navigation and full-document history return are masked |
| Actual tab hiding | Opening/activating another tab produced `visibilityState === "hidden"`; amount reset before returning |
| Page lifecycle | Persisted pagehide/pageshow event handlers reset state |
| Unavailable | Honest empty state; no mask pretending data exists; no reveal button |
| Zero | Masked initially; reveals `0.000` with JOD unit |
| Keyboard | Real Enter and Space browser events toggle correctly |
| Touch | Real touch input activates the control |
| Persistence | No local/session storage, cookies, or visibility URL parameter |
| Console/hydration | Zero captured browser errors; no fixture amount logged to browser console |

Full-document history was exercised with actual navigation. A specific browser
back-forward-cache hit was not forced; persisted lifecycle handlers were also
exercised directly. This is not a guarantee about every browser's cache policy.

## Responsive verification

Actual Chrome viewport tests and screenshot inspection were performed at:

| Viewport | Available long-amount fixture |
| --- | --- |
| 1920 × 1080 | Hidden/revealed/hidden geometry identical |
| 1366 × 768 | Hidden/revealed/hidden geometry identical |
| 1280 × 720 | Hidden/revealed/hidden geometry identical |
| 768 × 1024 | Hidden/revealed/hidden geometry identical |
| 390 × 844 | Hidden/revealed/hidden geometry identical |
| 375 × 667 | Hidden/revealed/hidden geometry identical |

Tests compare exact debt-card, neighboring metric-grid, and activity-panel bounding
rectangles, verify no horizontal overflow or clipped number text, check the 44px
touch target and Arabic/RTL document, and assert that the decimal group stays on a
single line. Test long amounts contain 15 whole digits plus three decimal digits.
Screenshots are in `.qa/phase21-tests/`; these are fixture screenshots, not production
financial data. Arbitrarily unbounded numeric strings are not a promised layout size.

## Production and regression verification

| Check | Result |
| --- | --- |
| `npm.cmd run typecheck` | Passed, exit 0 |
| `npm.cmd run lint` | Passed, zero warnings |
| `npm.cmd run build` | Passed; all five application routes statically prerendered |
| `npm.cmd ls --all --offline` | Passed, exit 0; no new dependency conflicts |
| Production startup | Passed on 127.0.0.1:3001 |
| Production route HTTP checks | All five routes return HTTP 200 with Arabic and RTL attributes |
| Phase 2 production browser regression | 88 assertions passed, zero failures |

The regression browser suite checks all five routes at all six sizes, active
navigation, a single h1, RTL/sidebar placement, text clipping and horizontal overflow,
the new unavailable state, desktop collapse/expand, mobile modal opening, focus
wrapping/return, scroll lock, Escape/backdrop dismissal, navigation dismissal,
current-page dismissal, desktop resize dismissal, and customers quick navigation.
No captured production console errors or uncaught exceptions occurred.

## Limits and useful next step

Available-value SSR/hydration and lifecycle checks use the isolated Next.js fixture
(development mode); the actual production app remains unavailable-data-only and was
checked separately. Safari, Firefox, physical mobile devices, screen-reader speech,
and deployed performance were not tested. Tested browser geometry is not a general
Core Web Vitals performance claim or full accessibility certification.

This is visual privacy. Future real amounts passed to a client component will still
exist in client memory/network payloads even while masked; they are not encrypted or
protected from developer tools by this feature. Implement server-side authentication
and authorization before connecting real financial data in the appropriate future
phase. No such functionality was added here.

The previously documented ESLint 9 lifecycle limitation remains unchanged. Phase 2.1
is complete; no Phase 3 work or automatic commit was performed.
</file>

<file path="frontend/app/api/api.js">
const API_URL = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/users`;

// Get data 
async function getData() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('فشل في جلب البيانات');
    return await res.json();
  } catch (err) {
    console.error('Error fetching data:', err);
    return [];
  }
}

// Add User 
async function addItem(name, loan, phone_number) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, loan, phone_number })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

// Edit User 
async function updateUser(oldName, name, loan, phone_number) {
  try {
    const res = await fetch(`${API_URL}/${oldName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, loan, phone_number })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

// Delete User
async function deleteUserApi(name) {
  try {
    const res = await fetch(`${API_URL}/${name}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}
</file>

<file path="frontend/app/dashboard/page.tsx">
'use client';

import React, { useEffect, useState } from 'react';

interface User {
  id: number;
  user: string;
  loan: number | string;
  phone_number: string;
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [loan, setLoan] = useState('');
  const [phone_number, setPhone_number] = useState('');
  const [editingOldName, setEditingOldName] = useState<string | null>(null);

  const API_URL = 'http://localhost:4000/api/users';

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('فشل في جلب البيانات');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingOldName) {
      await fetch(`${API_URL}/${encodeURIComponent(editingOldName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, loan, phone_number }),
      });
      setEditingOldName(null);
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, loan, phone_number }),
      });
    }

    setName('');
    setLoan('');
    setPhone_number('');
    fetchUsers();
  };

  const handleEditSetup = (u: User) => {
    setEditingOldName(u.user);
    setName(u.user);
    setLoan(u.loan.toString());
    setPhone_number(u.phone_number || '');
  };

  const handleDelete = async (userName: string) => {
    if (!confirm(`هل أنت متأكد من حذف الزبون: ${userName}؟`)) return;
    
    await fetch(`${API_URL}/${encodeURIComponent(userName)}`, {
      method: 'DELETE',
    });
    fetchUsers();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at top right, #1a1a1a, #0d0d0d)', 
      color: '#fff', 
      padding: '40px 20px', 
      direction: 'rtl',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header Title */}
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '15px' }}>
          <h1 style={{ color: '#f7a01c', fontSize: '28px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
            ⚡ لوحة التحكم الرئيسية (Dashboard)
          </h1>
          <p style={{ color: '#888', fontSize: '14px', margin: '5px 0 0 0' }}>
           دفتر  الكتروني
          </p>
        </div>

        {/* Form Box (Glassmorphism Style) */}
        <form onSubmit={handleSubmit} style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 150px', 
          gap: '15px', 
          marginBottom: '35px', 
          background: 'rgba(20, 20, 20, 0.75)', 
          backdropFilter: 'blur(10px)',
          padding: '25px', 
          borderRadius: '16px', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <input 
            type="text" 
            placeholder="اسم الزبون..." 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={inputStyle}
          />
          <input 
            type="number" 
            step="0.001" 
            placeholder="المبلغ / القرض (JOD)" 
            value={loan} 
            onChange={(e) => setLoan(e.target.value)} 
            required 
            style={inputStyle}
          />
          <input 
            type="text" 
            placeholder="رقم الهاتف" 
            value={phone_number} 
            onChange={(e) => setPhone_number(e.target.value)} 
            required 
            style={inputStyle}
          />
          
          <div style={{ display: 'flex', gap: '8px', gridColumn: '1 / -1' }}>
            <button 
              type="submit" 
              style={{ 
                flex: 1,
                padding: '12px', 
                background: editingOldName ? '#4caf50' : '#f7a01c', 
                color: editingOldName ? '#fff' : '#000', 
                fontWeight: 'bold', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: editingOldName ? '0 4px 12px rgba(76, 175, 80, 0.3)' : '0 4px 12px rgba(247, 160, 28, 0.3)'
              }}
            >
              {editingOldName ? '💾 حفظ التعديلات' : '➕ إضافة زبون جديد'}
            </button>
            
            {editingOldName && (
              <button 
                type="button" 
                onClick={() => { setEditingOldName(null); setName(''); setLoan(''); setPhone_number(''); }}
                style={{ padding: '12px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                إلغاء
              </button>
            )}
          </div>
        </form>

        {/* Table Container */}
        <div style={{ 
          background: '#121212', 
          borderRadius: '16px', 
          border: '1px solid #222', 
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ background: '#181818', color: '#f7a01c', fontSize: '14px', borderBottom: '1px solid #262626' }}>
                <th style={thStyle}># ID</th>
                <th style={thStyle}>اسم الزبون</th>
                <th style={thStyle}>المبلغ (JOD)</th>
                <th style={thStyle}>رقم الهاتف</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u, idx) => (
                  <tr key={u.id} style={{ 
                    borderBottom: '1px solid #1a1a1a', 
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    transition: 'background 0.2s'
                  }}>
                    <td style={tdStyle}>{u.id}</td>
                    <td style={{ ...tdStyle, fontWeight: '600', color: '#fff' }}>{u.user}</td>
                    <td style={{ ...tdStyle, color: '#4caf50', fontWeight: 'bold' }}>{u.loan} د.أ</td>
                    <td style={{ ...tdStyle, color: '#aaa' }}>{u.phone_number || 'غير متوفر'}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button 
                        onClick={() => handleEditSetup(u)} 
                        style={editBtnStyle}
                      >
                        تعديل
                      </button>
                      <button 
                        onClick={() => handleDelete(u.user)} 
                        style={deleteBtnStyle}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '15px' }}>
                    لا توجد بيانات مسجلة حالياً في قاعدة البيانات.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

// Styles Helper
const inputStyle: React.CSSProperties = {
  padding: '12px 15px', 
  borderRadius: '8px', 
  border: '1px solid #333', 
  background: '#181818', 
  color: '#fff', 
  outline: 'none',
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box'
};

const thStyle: React.CSSProperties = {
  padding: '15px 20px', 
  fontWeight: '600'
};

const tdStyle: React.CSSProperties = {
  padding: '15px 20px', 
  fontSize: '14px',
  color: '#ddd'
};

const editBtnStyle: React.CSSProperties = {
  background: 'rgba(76, 175, 80, 0.15)', 
  color: '#4caf50', 
  border: '1px solid rgba(76, 175, 80, 0.3)', 
  padding: '6px 14px', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  fontWeight: '600',
  marginLeft: '8px',
  transition: 'all 0.2s'
};

const deleteBtnStyle: React.CSSProperties = {
  background: 'rgba(229, 9, 20, 0.15)', 
  color: '#e50914', 
  border: '1px solid rgba(229, 9, 20, 0.3)', 
  padding: '6px 14px', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  fontWeight: '600',
  transition: 'all 0.2s'
};
</file>

<file path="frontend/app/layout.tsx">
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
</file>

<file path="frontend/public/file.svg">
<svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clip-rule="evenodd" fill="#666" fill-rule="evenodd"/></svg>
</file>

<file path="frontend/public/globe.svg">
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1" fill="#666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
</file>

<file path="frontend/public/next.svg">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 394 80"><path fill="#000" d="M262 0h68.5v12.7h-27.2v66.6h-13.6V12.7H262V0ZM149 0v12.7H94v20.4h44.3v12.6H94v21h55v12.6H80.5V0h68.7zm34.3 0h-17.8l63.8 79.4h17.9l-32-39.7 32-39.6h-17.9l-23 28.6-23-28.6zm18.3 56.7-9-11-27.1 33.7h17.8l18.3-22.7z"/><path fill="#000" d="M81 79.3 17 0H0v79.3h13.6V17l50.2 62.3H81Zm252.6-.4c-1 0-1.8-.4-2.5-1s-1.1-1.6-1.1-2.6.3-1.8 1-2.5 1.6-1 2.6-1 1.8.3 2.5 1a3.4 3.4 0 0 1 .6 4.3 3.7 3.7 0 0 1-3 1.8zm23.2-33.5h6v23.3c0 2.1-.4 4-1.3 5.5a9.1 9.1 0 0 1-3.8 3.5c-1.6.8-3.5 1.3-5.7 1.3-2 0-3.7-.4-5.3-1s-2.8-1.8-3.7-3.2c-.9-1.3-1.4-3-1.4-5h6c.1.8.3 1.6.7 2.2s1 1.2 1.6 1.5c.7.4 1.5.5 2.4.5 1 0 1.8-.2 2.4-.6a4 4 0 0 0 1.6-1.8c.3-.8.5-1.8.5-3V45.5zm30.9 9.1a4.4 4.4 0 0 0-2-3.3 7.5 7.5 0 0 0-4.3-1.1c-1.3 0-2.4.2-3.3.5-.9.4-1.6 1-2 1.6a3.5 3.5 0 0 0-.3 4c.3.5.7.9 1.3 1.2l1.8 1 2 .5 3.2.8c1.3.3 2.5.7 3.7 1.2a13 13 0 0 1 3.2 1.8 8.1 8.1 0 0 1 3 6.5c0 2-.5 3.7-1.5 5.1a10 10 0 0 1-4.4 3.5c-1.8.8-4.1 1.2-6.8 1.2-2.6 0-4.9-.4-6.8-1.2-2-.8-3.4-2-4.5-3.5a10 10 0 0 1-1.7-5.6h6a5 5 0 0 0 3.5 4.6c1 .4 2.2.6 3.4.6 1.3 0 2.5-.2 3.5-.6 1-.4 1.8-1 2.4-1.7a4 4 0 0 0 .8-2.4c0-.9-.2-1.6-.7-2.2a11 11 0 0 0-2.1-1.4l-3.2-1-3.8-1c-2.8-.7-5-1.7-6.6-3.2a7.2 7.2 0 0 1-2.4-5.7 8 8 0 0 1 1.7-5 10 10 0 0 1 4.3-3.5c2-.8 4-1.2 6.4-1.2 2.3 0 4.4.4 6.2 1.2 1.8.8 3.2 2 4.3 3.4 1 1.4 1.5 3 1.5 5h-5.8z"/></svg>
</file>

<file path="frontend/public/vercel.svg">
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1155 1000"><path d="m577.3 0 577.4 1000H0z" fill="#fff"/></svg>
</file>

<file path="frontend/public/window.svg">
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" fill="#666"/></svg>
</file>

<file path="frontend/.dockerignore">
node_modules
.next
.env
.env.*
!.env.example
Dockerfile
</file>

<file path="frontend/.gitignore">
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
</file>

<file path="frontend/AGENTS.md">
<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
</file>

<file path="frontend/Dockerfile">
FROM node:22-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-slim AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
</file>

<file path="frontend/eslint.config.mjs">
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
</file>

<file path="frontend/next.config.ts">
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
</file>

<file path="frontend/package.json">
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "next": "16.4.6",
    "react": "19.3.0",
    "react-dom": "19.3.0"
  },
  "devDependencies": {
    "@tailwindcss/turbopack": "4.3.3",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.4.6",
    "tailwindcss": "4.3.3",
    "typescript": "^5"
  }
}
</file>

<file path="frontend/README.md">
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
</file>

<file path="frontend/tsconfig.json">
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
</file>

</files>
