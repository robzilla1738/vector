# Actual unresolved overnight spending

Apply after47148dd5. Exact six-leaf runtime/shared contract/UI patch SHA25645df4eebb8de3a3e858045d46fbb7a554f5236179d3680d7a57555fa1aed3972; all manifest baseline/result pins supplied.

Reproduced actual gap before correction: modelCallCost returns no cost when provider metadata and usage are absent; actual saveAuthorizedModelCall preserves that undefined bill in model_calls. Budgets.spentRunUsd's SQL SUM ignores NULL, so NightShift.assertDispatch allowed the next effect. Gateway's separate program SpendLedger conservatively settles its own projected reservation, but it has no run_id and cannot authorize a fabricated nightly bill.

Budgets.runCostComplete queries this original ledger. NightShift checks scoped historical descendant/window completeness before model/browser dispatch and before scheduler launch. Unresolved cost refuses dispatch and pauses active work for review; another queued item cannot bypass the current night's unresolved cost. All known costs and prior cost rows stay intact. No guessed token bill, duplicate ledger, fake projected charge or waived budget.

nightShift.summary's strict actual RPC result gains required costComplete:boolean. The shell uses authoritative MethodResult typing and shows known subtotal + cost pending/work paused, so $0 known is not advertised as a complete bill. Existing remappable review action remains.

Validation: rebuilt runtime PASS, three focused suites68PASS (autonomy20/native44/budgets4), renderer typecheck PASS, focused oxlint PASS. Prior fail-closed regression is preserved in before.log, corrected suite in tests.log. gen-host-bindings generated209methods26events d5266489d1ff unchanged: this is the authenticated runtime RPC result, not a native host method contract.

Native build/journey/qualification remains solely builder/root work. No production ledger read outside synthetic fixtures was performed.
