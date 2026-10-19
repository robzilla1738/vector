# Populated protected Profile startup

The disposable fixture creates 10,000 encrypted model-call records and 10,000 encrypted settings, closes SQLite, and starts the runtime against a filesystem copy. Its authenticated Unix-socket host supplies synthetic capabilities and ephemeral secrets; it does not open a real Profile, contact a provider, read the Keychain, or run a native build.

`result.json` records runtime-ready notification delivery at 106.49 ms. The real managed Chromium driver connects through the native CDP broker only after readiness. The fixture holds its native version response while checking `/health`, which returned 200 before the driver handshake finished. The runtime's internal phase log reached ready at 87.35 ms; notification delivery includes socket scheduling.

Reproduce once when startup changes warrant it:

```bash
npx tsc -b
node docs/evidence/populated-startup-2026-10-05/reproduce.mjs
```

Focused protection tests cover matching markers causing zero decrypt calls and zero database writes, inventory mismatch refusal, initial atomic conversion, authenticated reads, restart and missing factor refusal. The fixture demonstrates the populated database startup target with a synthetic native host; it does not establish real Keychain unlock or actual-window startup latency. Compaction remains an explicit maintenance operation and is absent from boot.
