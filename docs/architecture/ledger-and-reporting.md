# Ledger rules, paper cutover and reporting

## Money and balance

All financial amounts are JOD. One dinar is 1,000 fils. Convert a validated decimal input to an integer using string operations and exact integer arithmetic. Normalize supported Arabic and Western digits deliberately. Reject ambiguous separators, signs where the form accepts a positive amount, excess decimal places and out-of-range amounts. Format the result to three decimals. Never convert a monetary string to a JavaScript `Number` or SQL floating-point type. The UI receives decimal strings and explicit availability. `0.000` is a known settled balance.

An account balance is the sum of its committed ledger deltas. Positive means the customer owes the store. Negative means the store owes credit to the customer. Zero means settled. Purchases add a positive delta. Repayments subtract their full amount. A repayment beyond the debt creates credit after a clear confirmation of the resulting credit. Purchase notes are optional, bounded, displayed as text and included in the command's canonical details.

Applying credit is inherent in the signed balance. For a purchase of `p` fils and a prior balance `b`, the credit applied is `min(p, max(0, -b))` and the new balance is `b + p`. Store the full purchase once. The credit applied is a derived explanation at posting time in the receipt, with no separate credit spend or mutable credit balance. Show before and after balances on the committed receipt. An owner-approved business rule can reject or request confirmation for overpayments. The default proposal allows them with confirmation based on the current account at posting time. If a concurrent write changes the classification the owner accepted, return a fresh preview and require explicit confirmation for a new command after safely cancelling the prepared one.

| Operation | Delta | Balance after operation | Display |
| --- | ---: | ---: | --- |
| Opening debt | +15,000 | +15,000 | Debt 15.000 JOD |
| Repayment of 20.000 | −20,000 | −5,000 | Credit 5.000 JOD |
| Purchase of 3.000 | +3,000 | −2,000 | Credit 2.000 JOD, 3.000 applied |
| Purchase of 4.000 | +4,000 | +2,000 | Debt 2.000 JOD, 2.000 applied |
| Repayment of 2.000 | −2,000 | 0 | Settled 0.000 JOD |

Openings start with nonnegative debt, including an explicit zero if the row is reviewed as settled. If paper records show prepaid credit, route those rows to exception review and approve the sign policy before import. An archived account retains its balance and history. Allow archive with a clear nonzero-balance warning and require restoration before new postings by default. A correction exception requires separately approved policy and authorization. Restoration reuses the same account and openings.

## Corrections and wrong-customer postings

Target the latest effective original or replacement entry. Reversal entries and already reversed targets are ineligible. Preview the impact and require a reason. The posting transaction verifies the target is still current and appends a reversal equal to its exact negation. A correction adds a replacement with the original economic kind, the corrected signed amount and the original effective time. A void appends only the reversal. Each correction links target, reversal and optional replacement, stores the previous and corrected signed amounts, and records the owner, reason and insertion time through its correction and command records. A replacement may later be corrected through a new link. The original rows remain readable.

For a wrong-customer posting, reverse on the original account and add the replacement to the correct account in the same transaction. Validate both accounts and the target before writing, apply the same store-wide write lock, and return both balances on commit. An opening transfer reserves the destination's cutover claim in that transaction, preserves its paper origin and keeps the original slot and source consumed. If the destination already has a claim, reject the transfer for manual reconciliation. Complex cases where an erroneous opening consumed the only slot for another legitimate paper row require an approved, audited exception design before live import. Never clear a claim to force the import through.

Example: a 15.000 purchase on customer A should be 12.000 on customer B. A keeps the original +15,000 and receives a −15,000 reversal. B receives +12,000. The correction records both accounts and `previous=15000`, `corrected=12000`. The net ledger change is −3,000 and the revised purchase total is 12.000, while the audit view shows every leg.

## Paper-ledger cutover for approximately 100 customers

1. **Freeze the source.** The owner records the paper ledger identity, a local cutover date and instant, source account count, and independently tallied total. Give each reviewed account a stable paper reference such as book, page and line. Aggregate split source lines for one customer to one opening with its documented source reference. Review ambiguous names, shared phones, negative entries, missing pages and duplicate references first. Retain the paper original and a controlled reconciliation copy according to owner-approved retention.
2. **Prepare the migration.** Open one cutover in a migration-only state. Plan a freeze between paper closing and electronic opening, and pause ordinary electronic purchases and repayments until reconciliation. If trading must continue, keep post-cutover paper activity separate with source references and approve a controlled, ordered catch-up procedure before live posting. That procedure must specify deduplication and effective-time rules. The same transaction never lands in both opening and post-cutover activity.
3. **Enter each customer manually.** Capture name, optional normalized phone, paper reference and opening debt. Show name/phone duplicate warnings and candidate customers. The owner confirms linking to an existing stable ID or creating a separate customer. Similar names or identical phone numbers are warnings. Existing claims and source references are hard duplicate blocks.
4. **Save each draft immediately.** Separate **Save** and **Add New Customer** controls. Save persists the editable paper draft and keeps it visible after refresh. Add New Customer opens a blank form after the prior result is known or an unsaved edit is explicitly discarded.

   **Review and approve separately.** Use the reviewed draft revision and explicit owner confirmation. Approval atomically posts the opening, any new customer, the source claim and the committed receipt. Reconcile an uncertain approval by its original command key before attempting another approval.
5. **Reconcile before close.** Compare the reviewed source list, distinct source count and independently tallied amount against the active approved opening heads and the full opening ledger as of cutover. Check each source-to-account mapping, reviewed zero rows, voids, transfers and amount differences. Resolve discrepancies with linked corrections. Once balanced, the owner approves the close. The close routine records counts, exact totals, time, owner and report watermark in one transaction and enables ordinary writes. Freeze original input metadata and the closing snapshot.
6. **Handle later discoveries through corrections.** Show the original opening, linked adjustment and revised balance. Keep the signed-off reconciliation snapshot available alongside its revised view. A genuinely omitted source after close needs an explicitly approved late-opening exception flow before it can be posted. A second cutover may not reload an existing balance. No bulk replay or automatic re-import is part of initial migration.

## Time and report semantics

Record both `effective_at`, the financial event time, and `recorded_at`, the server instant captured once for the posting transaction after acquiring the write lock. Store both as `timestamptz` and serialize UTC. `recorded_at` is an audit insertion time, not a promise of the exact commit clock reading. New purchases and repayments default to server time. An optional paper catch-up workflow needs explicit rules for past effective times and prohibits future-effective postings. Openings use the approved cutover instant and corrections inherit the target's effective time. Set the cutover instant from the agreed Amman local time and store the original local day for audit.

Display instants in `Asia/Amman`. For a day or month, derive local start and next local start separately and convert each to UTC with the IANA zone, then filter the half-open interval `[start, end)`. Never hardcode an offset or add a fixed number of hours to get the next day. [PostgreSQL time zones](https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-ZONECONVERT)

| Report | Rule |
| --- | --- |
| Outstanding debt and customer credits | First sum ledger entries by customer as of the effective cutoff. Debt is `SUM(GREATEST(balance, 0))` and credit is `SUM(GREATEST(-balance, 0))`. Never net one customer's credit against another customer's debt. Both active and archived accounts contribute to store totals. |
| Purchases and repayments | Sum effective, unreversed purchase and repayment heads by local period. Repayments are displayed as positive magnitudes. Gross purchase amount stays intact when it uses existing credit. |
| Opening balances | Report separately by cutover, source and account using the effective heads. Include original reconciliation totals, later corrections and revised totals. Never count openings as ordinary purchases. |
| Archived accounts | Statements and store totals still include them. Offer separate active/archived views. The proposed filter uses current archive status and is labelled accordingly. Historical archive-status reporting would need a separate history design. |
| Corrections | Provide recorded-time audit activity showing original, reversal, replacement and operator reason. Financial period reports restate the target's effective period. Label restated results and link the correction audit. |

Use one consistent snapshot for each report. When saving a reconciliation or reproducible report, record the local/effective boundaries and the maximum visible committed `ledger_seq` from the same snapshot. Sequence gaps from rollbacks are harmless. Only use a captured report watermark from a committed snapshot so no correction is split. Apply the watermark to originals, reversals and replacements before identifying effective heads. For a revised report use a new watermark. For an as-recorded report reuse the old watermark. Compute balances by summing all eligible signed entries, including reversals. The effective-head view is for categorizing economic activity and must reconcile to the ledger.
