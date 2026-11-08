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
