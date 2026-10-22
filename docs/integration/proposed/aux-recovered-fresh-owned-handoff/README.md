# Recovered fresh terminal → owned dispatcher → real Node-API

This inactive paired composition closes a source-level handoff gap: restarted fresh recovery has no original `PreparedFreshAuxCohort`, while the original owned dispatcher constructor required `CapturedTerminalCommandContext` built with that cohort. It now accepts the fresh coordinator's concrete `RecoveredFreshTerminalCommandContext` directly, after that type validates ready journal, current secure-stage restore, exact target capture and real Aux-v2 crypto. It does **not** fabricate the lost cohort, expose an arbitrary core constructor or accept a provenance Boolean.

The owned registry and owner gain only the narrow overload `init(recoveredFreshTerminal:)` and its concrete private entry constructor. Existing instance lifecycle remains unchanged. `AUX_RECOVERED_FRESH_DISPATCH` is a declaration/source-composition Swift flag so unrelated default builds do not require the fresh-coordinator type graph. It does not grant permission, choose a scope, enable startup or bypass an admission check. The real sealed terminal type must be compiled into that composition.

## Actual fixture chain

`tests/SyntheticRecoveredOwner.swift` is fixture-only native production of a **genuine** software core:

1. Creates fixed synthetic P256 material and a prepared fresh cohort inside `initializeAndDiscardCohort`.
2. Uses the actual fresh coordinator with real private disposable journal/binding stores and a captured in-memory Security boundary. The boundary asserts the journal/binding precedes its one simulated stage Add and each of its four simulated target Adds.
3. Returns only the captured boundary. No original material/cohort or first coordinator is available to the next API call. Sensitive stage/target bytes remain in the simulated Security storage, which is the intended recovery input.
4. Constructs a new coordinator and invokes `advanceOne()` with no cohort argument. Its typed recovered terminal is checked against the reloaded actual ready journal SHA and exact security-review digest.
5. Creates `AuxOwnedCommandDispatcher(recoveredFreshTerminal:)`, transfers its native retained owner to the existing real Node-API8 attach adapter, then discards the fixture journal directory after owner construction. The core's existing imported authority handles remain usable without that fixture state.

No physical Security read/Add, owner profile, signing, OS grant, enclave or PQ operation occurs. The fake boundary provides captured rows; it does not fake signing or root unwrap. Reused `.node` tests perform real software crypto through the actual Node-API/C/Swift path.

## Lean check and evidence

```
sh docs/integration/proposed/aux-recovered-fresh-owned-handoff/check.sh
```

Apple SDK C++/Swift compilation runs through `scripts/native-build.py` and `/tmp/aux-build.lock`, using frozen Node headers. The actual linked addon runs in frozen Node with disposable HOME/TMPDIR and sanitized environment. All **18 existing real-addon checks pass** with this alternate recovered owner producer: exact synthetic root, DER signature verified in Node against the same public key, JSON-string/original missing-command behavior, strict input handling, failed attach ownership, GC, worker cleanup and new worker instances. Each native owner creation additionally asserts the real restarted ready journal/digest and exactly one/four stage/target simulated Adds. Repeated worker environments exercise the full restarted producer again. Existing Security no-authentication-UI deprecation warnings compile unchanged; no Security API executes.

The earlier fresh-coordinator commit supplies the sealed recovered type and its tests; this commit only adds owner/registry pairing plus this real integration fixture. It does not change the Node-API adapter, C ABI or original PDF/OS route. Source pins record this exact combined declaration/dependency composition instead of silently rewriting historical upstream evidence.

## Remaining activation gaps

A typed recovered terminal establishes captured evidence/crypto consistency, not current signer/group/provisioning validity, historical ownership or all-writer custody. Real trusted host admission and exact Security execution remain unapproved/unimplemented activation boundaries. No production module initializer, runtime enable switch, automatic fresh creation, selected global scope or package edit is added. Current app and UI remain untouched.
