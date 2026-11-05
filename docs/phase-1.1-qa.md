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
