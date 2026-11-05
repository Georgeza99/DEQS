# DEQS

An Arabic, RTL web application foundation for a neighborhood grocery store in Jordan.
Phase 1 contains only a responsive welcome page. No financial operations, mock records,
authentication, database, or persistence are implemented.

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
    page.tsx        Welcome page (server component)
  components/
    brand-mark.tsx  Reusable decorative brand mark
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

