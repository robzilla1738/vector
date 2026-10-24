# Paired renderer cleanup and background-worker stage

Actual supplied UI staging passed at revision31/version1.26.1016.1883. The exact final output agrees with all eight reviewed renderer modules and the reviewed background-worker producer. Only the draft codec, background script and revision manifest differ from revision30. All styles, artwork, fonts, other bytes, modes, permissions and extension identities remain exact.

The cleanup codec now acknowledges the exact retained lease and keeps failed restoration closures for retry. The background producer is composed last, after routing/Remix replacement, only under explicit desktop state identity v2. Its event/reply path still requires the paired native worker owner, schema, registration and controller integration; staged JavaScript alone grants no profile or migration authority.

`check-ui.mjs` checks the complete reviewed candidate syntax and original class strings. `stage-ui.mjs --preflight` records the expected new fingerprint; `review-ui.mjs` appends that fingerprint to the revision ledger. The final `stage-ui.mjs` compares the actual output with the reviewed sources and complete prior inventory. Historical stage30 outputs and receipts remain unchanged.

Actual output: `/private/tmp/aux-ui-worker-integration-stage-20261024-a6`. Manifest SHA256: `08121a99d3ccf18dbe2726f84dc18087c46ed80fc2d3cb485430b641172d997e`.

No app launch, UI observation, provider request, signing or release occurred. This is resource staging, not runtime acceptance or a testable app claim.
