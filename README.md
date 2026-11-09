# DEQS

An Arabic, RTL application interface for a neighborhood grocery store in Jordan.
Phase 2 includes a responsive dashboard, reusable application shell, and placeholder
pages for customers, archive, reports, and settings. Milestone A provides the
PostgreSQL foundation. Milestone B protects the workspace with owner login and
TOTP MFA. The dashboard still uses the Phase 2.1 unavailable-data state.
See [current progress](docs/DEQS-PROGRESS.md).

Financial summaries explicitly show unavailable data. The total debt card displays
“لا توجد بيانات بعد” and omits its eye button until real data is available.
Future real amounts, including zero, start masked; the eye button changes only their
display. Navigation, refresh, history restoration, and tab hiding reset the mask.
Visibility is never persisted. The current application supplies no financial values.

## Requirements

Use Node.js `24.22.1` from [.node-version](.node-version) and npm `11.20.0` for
repeatable local checks. Verify the active versions with `node --version` and
`npm.cmd --version`.
On Windows PowerShell, use `npm.cmd` to avoid the npm.ps1 execution policy restriction.

## Run locally

```powershell
cd C:\Users\ASUS\OneDrive\Desktop\DEQS
npm.cmd ci
npm.cmd run dev -- --hostname localhost
```

Open [http://localhost:3000/login](http://localhost:3000/login). The app denies
workspace access until the local configuration and owner session are valid.
Follow the [DEQS-DEV setup guide](docs/DEQS-AUTH-SETUP.md) for environment values,
redirects, invitation, MFA, and recovery. Stop the server with Ctrl+C.
If the workstation's global Node differs from the pin, this checkout was verified
with the installed Node 24 runtime selected in the current PowerShell session:

```powershell
$node24 = 'C:\Users\ASUS\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
$env:Path = "$node24;C:\Program Files\nodejs;" + $env:Path
node --version
```

## Checks and production build

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
npm.cmd start
```

`typecheck` generates Next.js route types before running TypeScript. `start` requires
a successful production build. The lockfile pins the resolved dependency versions.
The project-local npm cache is ignored by Git.
If Turbopack's CSS worker exits in this Windows workspace, the verified fallback
is `npm.cmd run build -- --webpack`. See [progress](docs/DEQS-PROGRESS.md) for results.

## Database foundation and local tests

Install the PostgreSQL command-line programs separately for local database testing.
On Windows the harness defaults to `C:\Program Files\PostgreSQL\18\bin`. Set
`DEQS_PG_BIN` to an alternate bin directory if needed.

```powershell
npm.cmd run test:db
npm.cmd run test:server-db
npm.cmd run test:privacy
npm.cmd run build -- --webpack
npm.cmd run test:auth
```

The database suite starts a fresh password-protected loopback cluster under ignored
`.qa`, applies the versioned migrations and shuts down that cluster after testing. It
uses synthetic records and a database-facing shim for Supabase roles and claims.
The adapter suite mocks HTTP. The authentication suite starts the built application
against a synthetic local Auth and Data API and drives the browser flow. It supplies
its own environment. The privacy fixture exercises the actual dashboard view
separately from the route-authorization tests. Hosted checks require authorized
DEQS-DEV setup. [.env.example](.env.example) lists the server settings.

See the [master brief](docs/DEQS-MASTER-SPEC.md), [implementation plan](docs/DEQS-IMPLEMENTATION-PLAN.md),
[requirements matrix](docs/DEQS-REQUIREMENTS-MATRIX.md) and [quality gates](docs/DEQS-QUALITY-STANDARDS.md).

## Structure

```text
src/
  app/
    globals.css     Global styling and Tailwind CSS
    icon.svg        Application icon
    layout.tsx      Arabic metadata, language, and RTL document
    (auth)/         Arabic login, invitation, MFA, and recovery
    (owner)/        Protected dashboard, customers, archive, reports, and settings
    api/owner/      Private session status
  components/
    auth/                 Authentication forms and session UI
    app-shell.tsx         Shared header, sidebar, and modal mobile navigation
    brand-mark.tsx        Existing decorative brand mark
    dashboard.tsx        Dashboard view used by the privacy regression fixture
    debt-summary.tsx      Display-only privacy control and amount states
    empty-state.tsx       Reusable empty state
    icon.tsx              Consistent inline SVG icons
    placeholder-page.tsx  Shared layout for future feature pages
    section-intro.tsx     Page introduction
  server/auth/     Supabase SSR client, authorization, and authentication actions
  proxy.ts         Request-scoped session refresh and private response headers
```

Routes and layouts belong in `src/app`; shared UI belongs in `src/components`.
Add feature modules and server integrations only when a later phase requires them.
The `@/*` alias maps to `src/*`. Typography uses local system fonts without external
font requests. Layout uses responsive spacing and logical positioning for RTL.

## Phase 1.1 quality review

See [the quality report](docs/phase-1.1-qa.md) for the actual checks, six-viewport
Chrome verification, accessibility fixes, and remaining test limitations.
ESLint 9.39.5 is compatible with the installed Next.js lint plugins but is end-of-life;
the report explains why forcing ESLint 10 would introduce peer conflicts.

## Phase 2 verification

See [the Phase 2 report](docs/phase-2-qa.md) for route verification, six-viewport
production Chrome checks, privacy and drawer interactions, and remaining limitations.
The mobile drawer uses a native modal dialog to make background content inert,
locks background scrolling, wraps keyboard focus, and supports Escape, backdrop,
close-button, and navigation dismissal. Desktop navigation can be collapsed.
Only the application shell and debt privacy control require client components.

## Phase 2.1 privacy tests

```powershell
npm.cmd run test:privacy
```

The focused tests use Node's built-in test runner, installed Chrome (or Edge), and
an isolated local Next.js fixture. No extra dependencies or browser downloads are
needed. Set `CHROME_PATH` if your Chromium executable is elsewhere. All generated
fixtures, browser profiles, logs, and screenshots stay under Git-ignored `.qa/`.
The test runner starts and stops its own fixture server and browser; financial
fixture values never enter the actual application routes.

The debt component accepts an explicit `DebtData` union. Available values use a
canonical decimal string with exactly three fractional digits (including `0.000`).
Formatting inserts grouping separators without floating-point conversion or
financial arithmetic. Unavailable data uses `{ status: "unavailable" }`.

See [the Phase 2.1 report](docs/phase-2.1-qa.md) for exact verification and limits.
This is visual screen privacy; future server-side access controls remain necessary
when connecting financial data.

