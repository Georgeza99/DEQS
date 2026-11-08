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
