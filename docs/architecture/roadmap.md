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
