# DEQS

An Arabic, RTL application interface for a neighborhood grocery store in Jordan.
Phase 2 includes a responsive dashboard, reusable application shell, and placeholder
pages for customers, archive, reports, and settings. No financial operations, mock
records, authentication, database, or persistence are implemented.

Financial summaries explicitly show unavailable data. The total debt card displays
“لا توجد بيانات بعد” and omits its eye button until real data is available.
Future real amounts, including zero, start masked; the eye button changes only their
display. Navigation, refresh, history restoration, and tab hiding reset the mask.
Visibility is never persisted. The current application supplies no financial values.

## Requirements

Node.js 22.13+ (22.x) or 24+ and npm. Use a supported Node.js LTS release for deployment.
On Windows PowerShell, use `npm.cmd` to avoid the npm.ps1 execution policy restriction.

## Run locally

```powershell
cd C:\Users\ASUS\OneDrive\Desktop\DEQS
npm.cmd ci
npm.cmd run dev
```

Open http://localhost:3000. Stop the server with Ctrl+C.
If Node.js is installed but missing from the current PowerShell PATH, first run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
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

## Structure

```text
src/
  app/
    globals.css     Global styling and Tailwind CSS
    icon.svg        Application icon
    layout.tsx      Arabic metadata, language, and RTL document
    page.tsx        Dashboard (server component)
    customers/      Customers placeholder route
    archive/        Archive placeholder route
    reports/        Reports placeholder route
    settings/       Settings placeholder route
  components/
    app-shell.tsx         Shared header, sidebar, and modal mobile navigation
    brand-mark.tsx        Existing decorative brand mark
    debt-summary.tsx      Display-only privacy control and amount states
    empty-state.tsx       Reusable empty state
    icon.tsx              Consistent inline SVG icons
    placeholder-page.tsx  Shared layout for future feature pages
    section-intro.tsx     Page introduction
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

