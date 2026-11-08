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
