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
