# DEQS — DEFINITIVE MASTER IMPLEMENTATION & ENGINEERING STANDARDS

## Complete Product Specification, Financial Integrity, Security, Database Architecture, UI/UX, Testing, Recovery & Delivery

---

# 0. YOUR ROLE AND PRIMARY MISSION

You are the principal software architect, lead full-stack engineer, senior PostgreSQL database engineer, financial systems engineer, application security specialist, senior UI/UX designer, quality assurance lead, and technical owner of the implementation of DEQS.

Your mission is to develop DEQS into an exceptionally reliable, secure, accurate, fast, polished, and comfortable financial debt management application.

DEQS is a real commercial product intended for a neighborhood grocery store in Jordan.

The store owner will rely on the system to manage customer debts, repayments, customer credits, and complete financial histories.

The application must be simple enough for a nontechnical store owner to use comfortably every day.

Internally, it must be engineered with professional financial integrity, security, data durability, maintainability, and recovery standards.

**This is an IMPLEMENTATION assignment, not merely a documentation or planning assignment.**

However, financial correctness and security are more important than completing everything in one uninterrupted execution.

Never sacrifice correctness, security, or reliable recovery for speed.

Your responsibilities are to:

1. Understand the existing application.
2. Preserve previously completed work.
3. Establish permanent engineering and product requirements.
4. Review and improve the existing architecture.
5. Implement all approved product requirements in safe dependency order.
6. Proactively identify worthwhile improvements.
7. Implement improvements within the appropriate milestone.
8. Test every implemented feature.
9. Fix discovered defects.
10. Maintain accurate implementation progress.
11. Prevent regressions.
12. Prepare the application for safe production deployment.
13. Clearly identify any requirements blocked by external access, credentials, costs, or owner decisions.

Do not declare the application production-ready without sufficient verified evidence.

---

# 1. EXISTING PROJECT — CRITICAL CONTEXT

DEQS already exists.

Do not create a new application or overwrite the existing project.

## Existing technology

- Next.js 16 App Router
- React
- TypeScript
- Tailwind CSS
- Arabic RTL interface
- Responsive application shell
- Professional dark-green visual branding

## Completed phases

### Phase 1

Initial project setup.

### Phase 1.1

UI improvements, accessibility, responsive verification, and quality assurance.

### Phase 2

Dashboard, navigation, collapsible right sidebar, mobile drawer, and application routes.

### Phase 2.1

Default-hidden total-debt privacy functionality.

### Phase 3.0

Financial system architecture, PostgreSQL database design, transaction safety, owner authentication architecture, and recovery planning.

## Latest verified Git checkpoint

`74d91bc9f44a57f00ab91fe2f2f8fb96dc7fba2a`

Commit message:

`chore: checkpoint phase 2.1 dashboard and privacy`

Seven Phase 3.0 architecture documents were created under:

`docs/architecture/`

These documents were uncommitted in the most recent report.

Inspect the current Git status before doing anything.

Preserve all existing changes.

## Required initial inspection

Read:

- AGENTS.md
- README.md
- package.json
- Current application source
- Existing tests
- Existing QA reports
- Project progress documentation
- Every document under docs/architecture/

Understand the architecture before modifying it.

Preserve completed features and existing application identity.

Do not reset Git history, discard uncommitted changes, or create another DEQS project.

---

# 2. PERMANENT PROJECT MEMORY AND REQUIREMENTS

This is one of the most important requirements in this assignment.

Create a permanent, structured source of truth for DEQS inside the project.

Use the existing AGENTS.md and appropriate documentation under docs/.

Recommended documents:

- `docs/DEQS-MASTER-SPEC.md`
- `docs/DEQS-IMPLEMENTATION-PLAN.md`
- `docs/DEQS-REQUIREMENTS-MATRIX.md`
- `docs/DEQS-QUALITY-STANDARDS.md`
- `docs/DEQS-PROGRESS.md`

Reuse existing documents where appropriate instead of creating unnecessary duplicates.

## AGENTS.md

Update AGENTS.md with a concise, enforceable set of permanent engineering instructions.

Include references to the master specification, financial rules, security standards, implementation plan, and quality gates.

Do not make AGENTS.md unnecessarily enormous.

The detailed requirements should live in organized documentation.

## Master specification

Record every approved feature and business rule from this prompt.

The specification must remain the authoritative reference for future development.

Do not silently remove an approved requirement.

Do not weaken financial or security requirements.

Do not reinterpret an approved requirement in a way that changes its intended behavior.

## Requirements traceability

Assign stable identifiers to requirements.

For example:

- FIN-001
- SEC-001
- CUS-001
- UX-001
- OPS-001

Maintain a requirements matrix containing:

- Requirement ID
- Description
- Priority
- Implementation milestone
- Implementation status
- Relevant files
- Automated tests
- Verification status
- Known limitations

Use clear statuses:

- Planned
- In progress
- Implemented
- Tested
- Blocked
- Production-ready

Never mark a requirement complete simply because it has been documented.

## Decision records

Document important architecture and business decisions.

Include the reason for each decision and its consequences.

Identify decisions requiring owner approval.

Use sensible, safe defaults for ordinary implementation details.

Do not invent approval for financial policies, paid services, security compromises, or deployment decisions.

---

# 3. NON-NEGOTIABLE ENGINEERING STANDARDS

The following standards apply permanently.

## Financial correctness

- Exact monetary representation.
- No floating-point financial arithmetic.
- Database-enforced idempotency.
- Atomic financial operations.
- Authoritative financial ledger.
- Complete financial history.
- Auditable corrections.
- Reliable balance calculations.
- Consistent reporting.
- Strict authorization.
- Clear financial operation outcomes.

## Reliability

- Database-confirmed saves.
- Explicit failure handling.
- Safe retry behavior.
- No misleading success messages.
- Recovery from uncertain network outcomes.
- Verified transaction rollback.
- Safe concurrency handling.
- Tested backup and recovery procedures.

## Security

- Owner-only access.
- No public registration.
- Strong authentication.
- MFA enforcement.
- Server-side authorization.
- Database-level access restrictions.
- Least-privilege credentials.
- Secure session management.
- No public financial data exposure.
- No exposed privileged database secrets.
- No unauthorized financial modifications.

## User experience

- Arabic-first RTL.
- Clean professional design.
- Fast common operations.
- Minimal unnecessary clicks.
- Comfortable desktop and mobile usage.
- Clear financial terminology.
- Accessible controls.
- Clear feedback.
- Appropriate confirmation dialogs.
- Consistent layouts.
- No dead buttons.
- No fabricated financial information.

## Code quality

- Readable TypeScript.
- Appropriate separation of concerns.
- Reusable components.
- Maintainable architecture.
- Secure database access.
- Strong validation.
- Minimal dependencies.
- Proper error handling.
- Automated verification.
- No unnecessary abstractions.
- No unnecessary infrastructure.

## Implementation policy

When a genuine improvement is necessary for the current milestone, implement it and test it.

When an improvement belongs to a future milestone, record it in the requirements matrix and prioritized backlog.

Do not silently expand scope.

Do not claim an improvement is implemented until it is verified.

---

# 4. IMPLEMENTATION STRATEGY AND EXECUTION CONTROL

This prompt defines the complete DEQS product.

Do not attempt to implement everything as one uncontrolled change.

Organize the work into small, independently testable milestones.

## Required sequence

### Milestone A
Database foundation, migrations, and initial security boundaries.

### Milestone B
Owner authentication, MFA, and authorization.

### Milestone C
Customer management and customer profile auditing.

### Milestone D
Financial posting engine, exact accounting, and duplicate prevention.

### Milestone E
Paper-ledger migration and opening balances.

### Milestone F
Purchases, repayments, customer credits, and automatic credit deduction.

### Milestone G
Customer archiving, restoration, and financial corrections.

### Milestone H
Dashboard integration and financial reporting.

### Milestone I
Printable customer statements, exports, and final workflow improvements.

### Milestone J
Backup, monitoring, recovery, and operational safeguards.

### Milestone K
Complete security, financial, UI/UX, and regression acceptance testing.

### Milestone L
Production-readiness review and deployment preparation.

Adjust the internal dependency order when technically justified.

Do not omit any approved requirement.

## Execution rules

For every milestone:

1. Inspect existing implementation.
2. Identify dependencies.
3. Design the smallest reliable solution.
4. Implement the functionality.
5. Add relevant tests.
6. Run the tests.
7. Fix discovered defects.
8. Review security implications.
9. Verify financial integrity where relevant.
10. Check existing functionality for regressions.
11. Update the requirements matrix.
12. Update progress documentation.
13. Report actual results.

Continue through safe, testable local milestones when resources and prerequisites permit.

Before progressing beyond a critical security or financial boundary, ensure the prerequisite verification has passed.

Do not move ahead by bypassing security or financial integrity requirements.

If a required external service, credential, payment decision, or owner action blocks safe implementation:

- Complete all independent safe work.
- Preserve the current implementation.
- Clearly explain the blocker.
- Provide the exact next required action.
- Stop without pretending the blocked feature works.

Do not deploy automatically.

Do not purchase services.

Do not create automatic Git commits.

Do not push to remote repositories.

---

# 5. ONLINE-ONLY SYSTEM ARCHITECTURE

DEQS must operate as an online web application.

The store owner must be able to access the same account and current financial records from supported computers and phones.

Use centralized server-backed storage.

The browser must never be the authoritative financial database.

Do not use localStorage, sessionStorage, or IndexedDB as the primary financial data store.

Do not implement offline financial posting or offline synchronization.

## Internet failure behavior

When connectivity is unavailable:

- Display a clear Arabic warning.
- Do not falsely confirm saved financial operations.
- Preserve unsaved form contents where safely possible.
- Provide understandable retry guidance.
- Reconcile uncertain operations safely.

A confirmed save means the database committed the operation.

A lost network response does not automatically mean the operation failed.

When the result is uncertain, retain the original operation identifier and provide a safe status check or retry mechanism.

Never automatically create a different operation identifier for an uncertain retry.

---

# 6. DATABASE AND STORAGE ARCHITECTURE

Use PostgreSQL with Supabase as the preferred managed database platform.

Preserve compatibility with the existing Next.js application.

Use version-controlled database migrations.

The schema must support:

- Owner identity and authorization metadata.
- Customers.
- Customer profile audit history.
- Customer archival state.
- Paper-ledger migration batches.
- Opening-balance claims.
- Financial commands.
- Idempotency records.
- Append-only financial ledger entries.
- Financial corrections.
- Linked reversals and replacements.
- Audit records.
- Reporting and reconciliation.
- Operational metadata where needed.

Use appropriate:

- Primary keys.
- Foreign keys.
- Unique constraints.
- CHECK constraints.
- NOT NULL constraints.
- Indexes.
- Timestamp fields.
- Database permissions.
- Row Level Security.

Avoid redundant editable financial totals.

The authoritative financial state must be derived from committed ledger entries.

If a cached or materialized balance is eventually introduced for performance, it must be transactionally consistent, verifiable against the ledger, and never become an independent editable source of truth.

## Database security

Default to denying access.

Never expose financial tables publicly.

Never grant direct unrestricted posting privileges to ordinary browser clients.

Enforce authorization at the database and trusted server boundary.

Protect privileged database credentials.

Avoid unrestricted service-role access in application handlers.

Use least-privilege database functions or roles where justified.

Never enable public financial operations before owner authentication and authorization are fully implemented.

---

# 7. EXACT FINANCIAL ACCOUNTING — JORDANIAN DINAR

All amounts are denominated in Jordanian Dinar.

1 JOD = 1000 fils.

Use exact integer fils for authoritative monetary amounts.

PostgreSQL BIGINT is appropriate when supported by strict range validation.

Do not use JavaScript floating-point numbers for financial calculations.

Represent BIGINT financial values safely across JavaScript and JSON boundaries, for example using validated decimal strings where appropriate.

Do not silently convert large financial values to imprecise JavaScript numbers.

## Signed ledger convention

Positive customer balance:

The customer owes the store money.

Negative customer balance:

The store holds credit belonging to the customer.

Zero:

The customer account is settled.

Example:

Opening debt: +20.000 JOD

Purchase: +5.000 JOD

Repayment: -10.000 JOD

Current balance: +15.000 JOD

## Display rules

For positive balances:

Display outstanding customer debt.

For negative balances:

Display customer credit as a positive amount in a separate field.

For zero:

Display a genuine zero balance.

Never show confusing negative debt values to the owner.

## Validation

- Reject malformed amounts.
- Reject unauthorized negative input.
- Reject invalid precision.
- Reject zero where the operation requires a positive amount.
- Reject out-of-range values.
- Detect arithmetic overflow.
- Avoid silent rounding.
- Avoid silent truncation.
- Reject ambiguous numeric formats.
- Support convenient Arabic input where safe.
- Format displayed JOD amounts using three decimal places.

Financial calculations must remain exact from input validation through database posting and reporting.

---

# 8. ZERO-DUPLICATE FINANCIAL POSTING

This requirement has the highest implementation priority.

If the owner presses Save once, twice, or ten times for the same action, only one financial operation may be committed.

Do not rely only on frontend button disabling.

## Frontend protection

- Disable repeated submission while saving.
- Show a clear saving state.
- Prevent accidental duplicate clicks.
- Preserve the original operation identifier during retries.
- Keep the form usable after confirmed failure.
- Avoid creating new financial commands during uncertain outcomes.

## Server protection

- Validate the operation.
- Validate the authenticated owner.
- Validate the amount.
- Validate the customer.
- Validate the operation type.
- Require an idempotency key.
- Compute a canonical request fingerprint.
- Reject conflicting reuse of keys.

## Database protection

- Unique operation identifiers.
- Unique idempotency keys within the appropriate scope.
- Atomic transaction processing.
- Concurrency-safe handling.
- Persisted command outcomes.
- Durable replay receipts.
- Appropriate database constraints.

## Required behavior

Same key + identical command:

Return the original committed outcome.

Same key + different command:

Reject with a clear conflict.

Different keys + same amount:

Allow separate intentional transactions.

Ten repeated clicks:

One operation.

Concurrent identical requests:

One operation.

Lost response after successful commit:

Return the original result when safely checked or retried.

Failed transaction:

No partial financial posting.

Do not claim complete duplicate protection until real database integration and concurrency tests have passed.

---

# 9. TRANSACTION ATOMICITY AND CONSISTENCY

Financial posting must be atomic.

The system must not partially write:

- A financial command.
- Ledger entries.
- Idempotency outcome.
- Required audit records.
- Related correction records.

Implement critical operations using PostgreSQL transactions.

Use appropriate locking and isolation behavior.

Prevent:

- Lost updates.
- Duplicate posting.
- Conflicting corrections.
- Partial customer transfers.
- Inconsistent opening balances.
- Unauthorized concurrent changes.

Concurrent operations involving the same customer must produce correct final balances.

Use safe transactional locking or equivalent proven consistency controls.

Document the consistency strategy.

Write tests for concurrent operations.

---

# 10. FINANCIAL SAVE EXPERIENCE

Provide clear states:

1. Ready.
2. Validating.
3. Saving.
4. Successfully committed.
5. Failed.
6. Outcome uncertain.

The message:

"تم الحفظ بنجاح"

must appear only after a confirmed successful database commit.

On success, show:

- Customer name.
- Transaction type.
- Amount.
- Timestamp.
- Updated balance.
- Transaction reference.

On failure:

Explain the problem without exposing secrets.

On uncertain outcome:

Do not incorrectly report failure or success.

Provide a safe way to check the original operation.

Preserve form state appropriately.

Avoid duplicate submission during retries.

---

# 11. OWNER-ONLY AUTHENTICATION AND AUTHORIZATION

DEQS is exclusively for the store owner.

There will be no public customer accounts and no employee management.

Use Supabase Auth or another justified secure solution compatible with the approved architecture.

## Requirements

- One provisioned owner account.
- No public signup.
- No ordinary user self-registration.
- Strong password handling.
- MFA enforcement for sensitive access.
- Secure login.
- Secure logout.
- Protected application routes.
- Secure session expiration.
- Session validation on protected requests.
- Server-side authorization.
- Database-level authorization.
- Safe owner recovery.
- Appropriate brute-force protections.
- Proper handling of expired and invalid sessions.

## MFA

Support a secure authenticator-based second factor where available.

Enforce the required authentication assurance level before allowing financial access.

Do not rely on a visual MFA screen without server verification.

## Owner provisioning

Do not create a public route that allows arbitrary visitors to become the owner.

Do not hardcode owner credentials.

Document a secure provisioning procedure.

## Recovery

Provide a safe recovery design.

A forgotten password must not permanently destroy access to legitimate financial records.

However, recovery must not provide a simple authentication bypass.

Use verified recovery methods and appropriate identity checks.

Never store plaintext passwords or recovery secrets.

## Authorization testing

Test:

- Anonymous users.
- Unauthorized authenticated users.
- Authorized owner.
- Expired sessions.
- Invalid MFA state.
- Unauthorized customer IDs.
- Direct financial endpoint access.

Never confuse frontend route hiding with actual authorization.

---

# 12. CUSTOMER MANAGEMENT

Implement a complete customer management system.

## Customer creation

Required:

- Customer name.

Optional:

- Phone number.
- Opening debt through the controlled opening-balance workflow.

Use stable customer IDs.

## Two independent actions

This behavior was explicitly approved and must be preserved.

### Save — حفظ

Save the current customer.

Remain on the same customer record.

Do not automatically clear the form.

Do not create duplicate customer accounts through repeated Save clicks.

### Add New Customer — إضافة زبون جديد

Open a blank customer form.

If unsaved changes exist, warn before discarding them.

Never silently lose entered data.

## Customer list

Include:

- Customer name.
- Optional phone.
- Current debt.
- Available customer credit.
- Account status.
- Account access.

## Search

Provide responsive search.

Support Arabic names appropriately.

Search by name and phone where available.

Avoid unnecessary page reloads.

Use appropriate indexing and pagination.

## Duplicate warnings

Warn about matching or similar customer information.

Do not automatically merge customers based on name alone.

Two different people may legitimately share the same name.

Avoid duplicate customer creation from repeated requests.

## Editing

Allow editing:

- Name.
- Phone.

Preserve audit history for meaningful profile changes.

Do not modify posted financial records when editing customer information.

---

# 13. PAPER-LEDGER MIGRATION

The store currently has approximately 100 or more customers recorded in a paper debt ledger.

Implement a dedicated fast-entry workflow.

The owner must be able to enter:

- Customer name.
- Existing debt amount.
- Optional phone number.

The purpose is to migrate the current outstanding balance for each person, not every historical paper purchase.

## Workflow

1. Define the paper-ledger cutover date.
2. Create or select a migration batch.
3. Enter customers.
4. Save each successfully entered record immediately.
5. Continue adding customers.
6. Review entered balances.
7. Detect potential duplicates.
8. Compare totals with the paper ledger.
9. Correct mistakes.
10. Approve opening balances.
11. Post approved opening balances exactly once.

## Critical distinction

Saving a migration draft must persist that draft immediately.

It must not silently post an unapproved financial opening balance.

Opening balances become authoritative only through the controlled approval and posting workflow.

Clearly explain the distinction in the UI.

## Cutover safety

Prevent new financial posting workflows from conflicting with incomplete opening-balance approval.

Define and enforce a safe cutover policy.

Never double-count an opening balance.

## Duplicate prevention

Use database constraints to prevent duplicate approved opening-balance claims for the same customer and cutover.

## Reconciliation

Display:

- Customers entered.
- Opening-balance total.
- Approved records.
- Pending records.
- Reconciliation differences.

Preserve source references and audit history.

No real customer information may be imported automatically without explicit owner action.

---

# 14. CUSTOMER ACCOUNT PAGE

Create a complete customer account page.

Display:

- Customer name.
- Phone.
- Account status.
- Outstanding debt.
- Available credit.
- Opening balance.
- Recent movements.
- Complete transaction history.
- Notes.
- Dates.
- Financial corrections.

## Primary actions

- Add purchase.
- Record repayment.
- Edit customer.
- View history.
- Print statement.
- Archive customer.
- Restore archived customer.

The page must remain simple.

Avoid excessive buttons and complex forms.

The owner should understand the customer's financial situation immediately.

Use clear terminology and consistent JOD formatting.

---

# 15. PURCHASE RECORDING

Purchases are recorded by monetary amount only.

Do not require product selection or detailed item entry.

Fields:

- Purchase amount: required.
- Note: optional.

Before saving, show:

- Current balance.
- Purchase amount.
- Expected resulting balance.

After a successful save:

- Confirm the operation.
- Display the recorded amount.
- Display the updated balance.
- Display the transaction time.
- Update related summaries.

Preserve the original full purchase amount.

Do not rewrite it when customer credit is applied.

Use the authoritative financial posting engine.

---

# 16. REPAYMENTS AND CUSTOMER CREDIT

Support:

- Partial repayments.
- Full repayments.
- Overpayments.
- Customer credit.
- Automatic credit use.

## Example 1

Customer owes:

20.000 JOD

Customer pays:

25.000 JOD

Result:

Debt: 0.000 JOD

Customer credit: 5.000 JOD

## Example 2

Customer credit:

5.000 JOD

New purchase:

3.000 JOD

Result:

Remaining credit: 2.000 JOD

## Example 3

Customer credit:

5.000 JOD

New purchase:

8.000 JOD

Result:

New debt: 3.000 JOD

## Implementation rule

Use the signed authoritative ledger balance.

Customer credit is consumed automatically through the resulting net balance.

Do not create an additional financial deduction that counts the same credit twice.

Preserve the original purchase and repayment entries.

The UI should explain debt and available credit clearly without showing confusing negative balances.

---

# 17. IMMUTABLE FINANCIAL HISTORY

Never permanently delete posted financial transactions through ordinary application workflows.

Every financial operation must remain auditable.

Maintain:

- Stable operation identifier.
- Customer identifier.
- Operation type.
- Original amount.
- Timestamp.
- Authorized owner.
- Optional note.
- Relevant correction links.
- Relevant audit metadata.

Posted ledger entries must not be silently modified.

Historical financial movements must remain traceable.

---

# 18. FINANCIAL CORRECTIONS AND REVERSALS

Support correction of:

- Incorrect purchase amount.
- Incorrect repayment amount.
- Incorrect opening balance.
- Operation posted to the wrong customer.
- Accidental operation that should be canceled.

## Required approach

Use linked reversal and replacement records.

Never silently overwrite the original financial entry.

Every correction must record:

- Original transaction.
- Previous amount.
- Corrected amount when applicable.
- Correction reason.
- Correction timestamp.
- Owner identity.
- Related reversal and replacement operations.

## Concurrency

Prevent duplicate corrections and conflicting simultaneous corrections.

## Wrong customer

Reversing the incorrect customer's operation and posting the correct customer's operation must be atomic.

## User interface

Before confirming, show:

- Original amount.
- Corrected amount.
- Reason.
- Balance before correction.
- Expected balance after correction.

Keep technical ledger details available for audit without overwhelming the owner.

Allow authorized correction of historical operations without losing their history.

---

# 19. CUSTOMER ARCHIVING

Archiving must never delete financial history.

Archived customers retain:

- Profile information.
- Opening balances.
- Purchases.
- Repayments.
- Customer credits.
- Corrections.
- Audit history.

Provide:

- Archive page.
- Search.
- Customer account viewing.
- Restoration.

Archived outstanding debts must remain included in the store's total outstanding debt.

Archived customer credits must remain included in total customer credit.

Archive and restore operations must not create financial transactions or alter balances.

Require confirmation before archiving.

For safety, archived accounts should be read-only for new financial posting until restored, unless a separately reviewed workflow justifies otherwise.

---

# 20. DASHBOARD — COMPLETE INTEGRATION

Preserve the existing approved DEQS dashboard.

Connect it to real authorized database queries.

Required summaries:

1. إجمالي ديون المحل
2. عدد الزبائن النشطين
3. أرصدة لصالح الزبائن
4. مشتريات اليوم
5. تسديدات اليوم

Also include:

- Recent financial activity.
- Quick customer access.
- Helpful empty states.
- Loading indicators.
- Meaningful error states.

## Total debt calculation

For each customer, derive the signed ledger balance.

Total outstanding debt equals the sum of positive customer balances.

Total customer credit equals the absolute sum of negative customer balances.

Do not incorrectly offset one customer's debt using another customer's credit.

Include archived customers in financial totals.

Count active customers separately.

## Privacy control

Preserve the existing Phase 2.1 behavior.

Total outstanding debt must be hidden by default.

Reveal using the eye button.

Automatically hide after:

- Refresh.
- Navigation away and back.
- Browser history return.
- Browser tab hiding.

Do not persist the revealed state.

Keep unavailable, hidden, and zero states distinct.

Do not expose sensitive amounts through unnecessary tooltips, attributes, logs, or analytics.

Remember that visual masking is not a substitute for actual authorization.

---

# 21. FINANCIAL REPORTING

Implement accurate reporting.

Required periods:

- Daily.
- Weekly.
- Monthly.
- Yearly.
- Custom date range.

Required report categories:

- Outstanding debts.
- Customer credits.
- Purchases.
- Repayments.
- Opening balances.
- Correction history.
- Customer statements.

## Accounting rules

Opening balances must not be counted as new purchases.

Customer credits must not be subtracted from other customers' outstanding debts.

Archived customer balances must remain included in financial aggregates.

Corrections must not produce misleading double counting.

Distinguish gross activity from net corrected activity.

Document reporting treatment of corrections clearly.

## Reconciliation

Report totals must reconcile with the authoritative financial ledger.

Add automated reconciliation tests.

---

# 22. TIME AND DATE ACCURACY

Store authoritative timestamps in UTC.

Display times in:

`Asia/Amman`

Use Jordan-local calendar boundaries for financial reports.

Do not assume browser-local dates represent the correct financial reporting day.

Distinguish:

- Original posting timestamp.
- Correction timestamp.
- Opening-balance cutover date.
- Reporting period.

Use a documented, consistent reporting policy.

Preserve historical audit timestamps.

Do not silently rewrite old financial dates.

---

# 23. CUSTOMER STATEMENTS AND PRINTING

Provide professional printable customer statements.

Include:

- DEQS branding.
- Customer identity.
- Statement date.
- Selected period.
- Opening balance.
- Purchases.
- Repayments.
- Corrections.
- Closing balance.

Requirements:

- Arabic RTL.
- A4-friendly.
- Clear typography.
- Consistent financial formatting.
- Correct page breaks.
- No clipped numbers.
- No unnecessary technical metadata.

Include print-friendly styling.

Support appropriate CSV export when useful.

Prevent spreadsheet formula injection in CSV output.

Protect exported financial data with the same authorization requirements as the application.

---

# 24. PREMIUM USER EXPERIENCE

DEQS must feel like a polished commercial product.

Preserve the existing professional green identity.

## Visual standards

- Elegant typography.
- Consistent spacing.
- Comfortable cards.
- Appropriate contrast.
- Clean backgrounds.
- Restrained shadows.
- Consistent buttons.
- Clear hierarchy.
- Accessible dialogs.
- Responsive tables.
- Proper Arabic alignment.

## Interaction standards

- Minimal clicks.
- Fast customer search.
- Comfortable amount entry.
- Immediate feedback.
- Clear save confirmation.
- Clear errors.
- Helpful empty states.
- No misleading controls.
- No unnecessary animations.
- No excessive desktop scrolling.

## Useful improvements

Implement appropriate improvements such as:

- Quick access to recently used customers.
- Quick access to frequent customers where useful.
- Keyboard shortcuts for safe, common actions.
- Clear last-transaction confirmation.
- Better transaction previews.
- Intelligent duplicate warnings.
- Unsaved-change protection.
- Convenient search filters.
- Consistent modal close buttons.
- Visible focus indicators.
- Comfortable mobile touch targets.

Implement a polished light theme.

A coherent dark theme may be added if it can be implemented and verified without degrading the existing visual consistency.

Non-sensitive display preferences may be stored locally.

Never store authoritative financial records in browser storage.

Avoid visual complexity that does not help the store owner.

---

# 25. RESPONSIVE DESIGN AND ACCESSIBILITY

Verify the application at:

- 1920×1080
- 1366×768
- 1280×720
- 768×1024
- 390×844
- 375×667

Also account for smaller mobile widths.

Requirements:

- No horizontal page overflow.
- No clipped Arabic labels.
- No overlapping cards.
- Responsive tables.
- Appropriate touch targets.
- Keyboard-accessible controls.
- Visible focus.
- Correct heading hierarchy.
- Semantic HTML.
- Sufficient contrast.
- Proper dialog focus management.
- Reduced-motion support.
- Correct RTL alignment.

Do not claim actual-device testing unless performed.

Preserve the current accessible sidebar and mobile navigation behavior.

---

# 26. BACKUP, RECOVERY, AND DATA PRESERVATION

Financial data preservation is a critical requirement.

The owner considers data loss unacceptable as a normal operating outcome.

Design for the smallest practical recovery data-loss window and clearly disclose the remaining risk.

## Required capabilities

- Managed database backups.
- Point-in-time recovery where available.
- Independent encrypted backups.
- Appropriate retention.
- Backup integrity checks.
- Periodic restore testing.
- Financial reconciliation after restore.
- Recovery documentation.
- Backup failure monitoring.
- Safe reopening after recovery.

## Critical distinction

A successful database commit is not equivalent to having a fully recoverable independent backup.

Do not claim that backups guarantee zero data loss.

Do not claim an RPO or RTO target has been achieved until the infrastructure supports it and recovery drills verify it.

The Phase 3.0 architecture proposed:

- RPO target: 15 minutes.
- RTO target: 4 hours.

Treat these as proposals, not approved or verified guarantees.

Evaluate whether stronger protection is justified and practical.

Identify the financial cost and operational implications of each recovery option.

Do not purchase services or enable paid features without owner authorization.

## Recovery safety

Document how to:

1. Stop financial writes.
2. Identify the recovery point.
3. Restore to an isolated environment.
4. Verify backup integrity.
5. Reconcile ledger totals.
6. Reconcile operation identifiers.
7. Identify potentially lost committed operations.
8. Prevent accidental duplicate replay.
9. Obtain owner approval before reopening financial writes.

Do not rely on Git or OneDrive synchronization as the database backup strategy.

---

# 27. SECURITY HARDENING

Apply appropriate security controls throughout DEQS.

Include:

- Authentication.
- Authorization.
- MFA enforcement.
- Database RLS.
- Least-privilege permissions.
- Secure environment variables.
- Input validation.
- CSRF protection where relevant.
- XSS protection.
- Safe database queries.
- IDOR protection.
- Rate limiting.
- Secure session management.
- Appropriate caching rules.
- Secure error responses.
- Secret redaction.
- Safe logging.
- Audit trails.
- Protected exports.
- Secure recovery procedures.

Ensure customer and financial data cannot be accessed by unauthorized visitors.

Avoid privileged financial reads in unrestricted server handlers.

Protected financial responses must not be publicly cached.

Do not expose database credentials, secret keys, or recovery codes.

---

# 28. PERFORMANCE AND RELIABILITY

Optimize for a grocery store with approximately 100 or more customer accounts.

The architecture should scale comfortably beyond the initial customer count.

Prioritize:

- Fast customer lookup.
- Fast account opening.
- Efficient financial queries.
- Efficient summaries.
- Appropriate indexing.
- Safe pagination.
- Low unnecessary client-side JavaScript.
- Responsive interactions.
- Clear loading states.
- Safe timeouts.
- Graceful failure handling.
- No unnecessary polling.
- No memory leaks.
- Stable production builds.

Avoid unnecessary microservices, event brokers, or distributed infrastructure.

Use the simplest architecture that safely fulfills the business requirements.

---

# 29. DEVELOPMENT ENVIRONMENT

The previously verified production build succeeded using:

Node.js 24.22.1

Node.js 26 experienced Turbopack-related build failures in an earlier environment.

Document a reproducible project-scoped Node.js version policy.

Do not modify the owner's global Windows environment unnecessarily.

Do not blindly change dependency versions.

Use official supported development tools.

Inspect whether required tooling exists before installation.

Do not install Docker Desktop or other system-wide applications without permission.

Use Supabase CLI and isolated development databases where appropriate.

Use secure environment templates.

Never invent Supabase credentials.

Never pretend a remote database is connected.

If external provisioning is necessary, explain the exact owner action required.

---

# 30. AUTOMATED FINANCIAL TESTING

Financial behavior must be verified with meaningful automated tests.

## Required scenarios

### Scenario A — Opening debt

Create a customer.

Approve an opening debt.

Verify the exact balance.

### Scenario B — Purchase

Add a purchase.

Verify the posted amount and updated balance.

### Scenario C — Partial repayment

Record a partial repayment.

Verify the resulting debt.

### Scenario D — Full repayment

Repay the entire outstanding debt.

Verify zero balance.

### Scenario E — Overpayment

Repay more than the outstanding debt.

Verify customer credit.

### Scenario F — Automatic credit use

Make a purchase using available credit.

Verify correct remaining debt or credit.

Ensure credit is not consumed twice.

### Scenario G — Repeated Save

Submit the same financial command ten times.

Verify exactly one financial posting.

### Scenario H — Concurrent requests

Submit identical commands concurrently.

Verify one committed operation.

### Scenario I — Lost response

Commit an operation.

Simulate a lost response.

Retry with the same idempotency key.

Verify the original result is recovered without duplication.

### Scenario J — Conflicting key

Reuse an idempotency key with a different payload.

Verify rejection.

### Scenario K — Intentional identical amounts

Post two legitimate purchases with identical amounts but different operation identifiers.

Verify both are accepted.

### Scenario L — Correction

Correct an incorrect amount.

Verify current balance and immutable audit history.

### Scenario M — Wrong customer

Correct a transaction assigned to the wrong customer.

Verify atomic reversal and replacement.

### Scenario N — Archive

Archive a customer with debt.

Verify the debt remains in financial totals.

Restore the customer.

Verify no duplication.

### Scenario O — Opening-balance duplication

Attempt to approve the same opening balance twice.

Verify database rejection or idempotent recovery.

### Scenario P — Reconciliation

Verify dashboard and report totals reconcile with ledger balances.

### Scenario Q — Failed posting

Force a database failure during posting.

Verify no partial financial operation remains.

### Scenario R — Unauthorized access

Verify unauthorized requests cannot read or post financial data.

### Scenario S — Backup restoration

Restore a disposable backup.

Verify customer records, financial entries, balances, and command identities.

### Scenario T — Multiple devices

Use the application from desktop and mobile sessions.

Verify both reflect the same authoritative server-backed records.

Use synthetic data in isolated test environments.

Never run destructive testing against real shop data.

---

# 31. COMPLETE SECURITY AND UI TESTING

Verify:

- Anonymous access restrictions.
- Invalid login behavior.
- MFA enforcement.
- Expired sessions.
- Unauthorized account access.
- Direct financial endpoint protection.
- Invalid customer identifiers.
- Malformed financial amounts.
- Database permission boundaries.
- Financial transaction immutability.
- Navigation.
- Search.
- Customer creation.
- Editing.
- Archiving.
- Printing.
- Dashboard privacy.
- Arabic RTL.
- Responsive layouts.
- Keyboard accessibility.
- Form error states.
- Loading states.
- Network failures.
- Recovery states.

Run appropriate regression tests after each milestone.

Never claim a test passed if it was not executed.

Clearly distinguish simulated tests from tests using a real PostgreSQL database.

---

# 32. FINAL APPLICATION POLISH

After implementing the core system, perform a full UI/UX review from the perspective of the actual store owner.

Evaluate the complete workflow:

Login → Dashboard → Search customer → Open customer → Add debt → Save → Verify → Record repayment → View history → Print statement → Logout.

Also evaluate:

Paper-ledger migration → Reconciliation → Approval.

And:

Incorrect operation → Correction → Audit review.

Remove:

- Confusing buttons.
- Redundant actions.
- Broken layouts.
- Unnecessary dialogs.
- Excessive scrolling.
- Poorly formatted numbers.
- Inconsistent terminology.
- Misleading statuses.
- Incomplete workflows.
- Placeholder content pretending to be functional.

Proactively implement justified improvements.

Avoid adding unnecessary complexity.

---

# 33. PRODUCTION DEPLOYMENT READINESS

Prepare DEQS for secure online deployment.

Required areas:

- Production hosting.
- HTTPS.
- Environment separation.
- Secure credentials.
- Owner account provisioning.
- MFA enrollment.
- Database access restrictions.
- Production migrations.
- Backup configuration.
- Recovery verification.
- Application monitoring.
- Appropriate logging.
- Release procedures.
- Rollback procedures.
- Operational documentation.

Do not deploy automatically.

Do not connect real customer data without explicit approval.

Do not activate paid services without authorization.

Do not claim production readiness until the relevant checks and real infrastructure verification are complete.

---

# 34. QUALITY GATES

A milestone may be accepted only when:

1. Its required functionality is implemented.
2. Relevant code is maintainable.
3. Relevant validation is implemented.
4. Required authorization is enforced.
5. Financial invariants are preserved.
6. Automated tests pass.
7. Error cases are handled.
8. Existing functionality remains working.
9. Documentation is updated.
10. Known limitations are reported.

A financial feature is not production-ready merely because its UI works.

A database feature is not verified merely because migration SQL exists.

A backup system is not verified merely because backups are configured.

A security feature is not verified merely because the login page exists.

Require appropriate evidence.

---

# 35. FINAL PRODUCT ACCEPTANCE CRITERIA

DEQS must ultimately provide all of the following:

- Secure owner login.
- Proper owner-only authorization.
- Centralized database storage.
- Reliable server-confirmed saves.
- Duplicate financial request protection.
- Customer creation.
- Customer editing.
- Customer search.
- Paper-ledger migration.
- Opening-balance reconciliation.
- Purchase recording.
- Partial repayments.
- Full repayments.
- Overpayments.
- Automatic credit use.
- Customer account histories.
- Auditable corrections.
- Customer archiving.
- Customer restoration.
- Accurate dashboard totals.
- Default-hidden total debt.
- Financial reports.
- Printable statements.
- Secure backups.
- Verified restoration procedures.
- Responsive Arabic UI.
- Mobile usability.
- Appropriate accessibility.
- Passing financial integration tests.
- Passing authorization tests.
- Passing regression tests.
- Accurate documentation.

No requirement may be silently dropped.

---

# 36. FINAL REPORTING REQUIREMENTS

Maintain accurate progress documentation throughout development.

After each implementation milestone, report:

## Completed Work

List implemented functionality.

## Files Changed

List relevant files.

## Database Changes

List migrations, tables, constraints, and functions.

## Security

Explain implemented security controls.

## Financial Integrity

Explain verified financial guarantees and limitations.

## Testing

Provide executed commands and actual results.

## UI/UX

Explain improvements and responsive verification.

## Known Issues

List unresolved issues.

## External Dependencies

List required owner actions, credentials, hosting choices, or costs.

## Requirements Progress

Update the requirements matrix.

## Recommended Next Milestone

Identify the next safe implementation step.

## Git Status

Report current branch, checkpoint, and uncommitted changes.

Do not automatically commit.

---

# 37. WHAT TO DO IN THIS EXECUTION

This is the definitive master instruction for DEQS.

Begin with these steps:

### Step 1 — Inspect

Inspect the current project, Git status, existing code, tests, and the seven Phase 3.0 architecture documents.

### Step 2 — Establish permanent standards

Update AGENTS.md and create or update the permanent master specification, quality standards, requirements matrix, implementation plan, and progress tracking.

Ensure every approved requirement in this prompt is represented.

### Step 3 — Validate architecture

Review the Phase 3.0 design for contradictions, financial integrity problems, security gaps, and missing constraints.

Correct genuine design defects before implementation.

### Step 4 — Begin actual implementation

Start with the safe Phase 3.1 database foundation:

- Reproducible development environment.
- Versioned PostgreSQL migrations.
- Foundational schema.
- Exact integer-fils model.
- Append-only ledger protections.
- Database-enforced idempotency foundation.
- Opening-balance constraints.
- Default-deny authorization.
- Safe server-only database integration.
- Environment templates.
- Automated schema and security tests.

### Step 5 — Verify

Run available tests.

Use an isolated disposable database where possible.

If external tooling is unavailable, clearly distinguish implemented-but-unverified work from verified work.

Do not pretend that missing infrastructure exists.

### Step 6 — Continue safely

Continue into later independently testable implementation milestones only when their prerequisites are satisfied and the current milestone passes its quality gates.

Do not bypass external approvals or security requirements.

Do not initiate paid services or production deployment.

If a milestone is blocked, complete independent safe work and provide an accurate handover.

If execution time or context becomes limited, finish at a clean milestone boundary, preserve progress, and provide precise continuation instructions.

Do not silently abandon requirements.

---

# FINAL ABSOLUTE RULES

Financial correctness is more important than speed.

Data preservation is more important than convenience.

Security is more important than appearance.

Simplicity is more important than unnecessary features.

Verified implementation is more important than optimistic reporting.

Preserve the existing DEQS application.

Never fabricate functionality, tests, credentials, or guarantees.

Never discard previous work without explicit authorization.

Never modify files outside the project without approval.

Never automatically push or deploy.

Never connect real customer records before production-readiness approval.

Keep the entire approved product specification available permanently for future development.

Implement, test, refine, document, and preserve progress.

The ultimate objective is a beautiful, fast, exceptionally comfortable, financially accurate, secure, reliable, and professionally engineered DEQS application that its owner can confidently use every day.