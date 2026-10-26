# Bounded shutdown stage diagnostics

Source review did not establish a self-deadlock: A49 native memory close precedes pending request waits; the broker keeps finite operations separate from database/watcher/stream lifetimes and closes database connections before awaiting their resource lifetimes. The actual last Quit needs stage evidence before any behavioral change.

This diagnostic-only paired successor prints fixed stage labels and broker set sizes directly to stderr. Direct console output avoids the file logger reopening or waiting on the broker being diagnosed. It never prints account/profile/path/URL/credential/request/error contents. The only extra facts are pending set counts and whether an earlier broker operation/resource failure already exists.

Labels cover the existing daemon start; start/settled/failed of the ten producer stops, bootstrap, websocket/HTTP closure, telemetry and broker close; HTTP request wait count; final exit; and the actual native memory close promise during shutdown. The broker reports before/after its existing producer, watcher, finite-operation, database, stream, resource-lifetime and admission-close stages.

Every original callback, wait, failure, guard and exit remains. No timeout, forced completion, authority change, resource release, new endpoint, UI change or native build is added. Diagnostic failures alone cannot alter cleanup; each stderr call is isolated. The native memory promise still returns its original value or throws its original error after reporting the finite label.

`prepare.py` pins the exact actual A49 leaves, applies seven single-count anchors per leaf, creates paired outputs in a fresh private temporary directory, and verifies exact reverse replay. Both output leaves passed `node --check` without evaluation. `source-plan.json` contains exact paths, hashes and replacements. Real Quit diagnosis remains parent-owned; no app or process was executed here.
