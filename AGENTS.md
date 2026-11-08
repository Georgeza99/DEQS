<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## DEQS engineering rules

- Read the [master specification](docs/DEQS-MASTER-SPEC.md), [implementation plan](docs/DEQS-IMPLEMENTATION-PLAN.md), [requirements matrix](docs/DEQS-REQUIREMENTS-MATRIX.md), [quality gates](docs/DEQS-QUALITY-STANDARDS.md), and [current progress](docs/DEQS-PROGRESS.md). Preserve the existing Arabic RTL application and deliver one verified milestone at a time.
- Apply the [ledger rules](docs/architecture/ledger-and-reporting.md) and [transaction protocol](docs/architecture/transaction-safety.md). Use exact integer fils, committed append-only entries, atomic outcomes, immutable correction links, and database-enforced idempotency. Persist paper drafts separately from approved postings. Announce financial success only after a verified commit and reconcile uncertain retries with the original key.
- Follow the [security model](docs/architecture/security.md) and [recovery design](docs/architecture/recovery.md). Require verified owner MFA at the server and database boundaries, default-deny permissions, private uncached data, least privilege, and synthetic data in isolated tests. Keep secrets and financial data out of logs, browser storage, fixtures committed with real data, and client bundles.
- Use the pinned project runtime and versioned migrations. Test financial and permission behavior on real isolated PostgreSQL before claiming it. Record commands, results, gaps and requirement status. Preserve existing work. Keep paid provisioning, production deployments, real data and Git commits subject to explicit owner authorization.
