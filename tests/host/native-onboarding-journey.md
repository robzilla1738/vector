# S13 native first-run journey handoff

Run `node tests/host/native-onboarding-journey.mjs --list` to inspect the stages, then run `--self-check` to validate the synthetic Chrome source and held local model protocol. The native journey takes an **existing** `Aux.app`:

```bash
node tests/host/native-onboarding-journey.mjs --app /absolute/path/to/Aux.app
```

It creates a disposable Profile and Chrome fixture under `/tmp`, disables dotenv loading and inherited provider API keys, and serves a local model and page on `127.0.0.1`. It compiles the existing AX helper, never starts a native build, opens a debug port, reads the runtime bearer, calls raw RPC, or writes the Aux state database. The operator performs visible setup actions; the harness checks source hashes, imported destination cardinality, visible receipts, a single durable first-run ID, local model attribution, and replay after restart. The output directory contains `report.json` and named window captures. Keep the directory if a stage fails.

This is one Chrome Default Bookmark plus one History visit, following the accepted S7 source shape. The accepted S7 format matrix remains the evidence for Arc, Safari, Firefox, attached tabs, partial import, and retry behavior. This journey checks the S13 handoff across import, disclosure, model selection, reviewed page context, and first useful chat.

The operator must independently inspect the native copy and controls for Keychain, provider data use, optional default browser, permissions, and source review. A double-click check establishes one run and no duplicate imported destinations; it does not count encrypted import job receipts. The changed-page step must leave the postcard disabled or require fresh review; if the native UI cannot change the selected page while the dialog is open, record that stage as unverified and run a focused manual stale-source journey. A lost `onboarding.start` response cannot be deterministically injected through this visible UI harness; the runtime idempotence test remains the focused contract evidence, and a native transport-fault journey remains open if required for S13 qualification. Do not mark S13 accepted from this script's source or offline self-check alone; it needs a passing run against the serially built app and an operator-reviewed manifest.
