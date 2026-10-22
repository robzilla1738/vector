# Actual delivered-byte identity inventory — 2026-10-22

The read-only `scripts/audit-aux-package-identity.mjs` now scans an explicit generated supplied `.app`, including regular native binaries and resource files. It streams fixed ASCII, UTF-16LE and UTF-16BE tokens across chunk boundaries, records file hashes/counts and records links without following them. It does not execute the app or emit source snippets. Three focused checks cover split binary tokens, HTML semantics and linked-file/marker handling.

Actual input: `out/provided-candidate-aux-native-fence/Aux.app`. Report: `out/aux-native-fence-delivered-identity.json`, SHA-256 `c42c0702bace978e3039fef651215dc5c05e7548abf981bf161af4997c538907`.

The scan read 11,158 files / 1,593,976,066 bytes and recorded 15 unfollowed links. There are 1,539 paths with a raw token or product-pattern filename. These are **unclassified findings**, not 1,539 confirmed product defects: counts overlap and include upstream attribution, debug/compiler strings, provenance and original runtime paths. The report does not authorize deleting those inputs or replacing arbitrary binary strings.

Concrete remaining delivered boundaries include both original native addon copies (1,228 combined `AsideNativeSwift` occurrences), signed memory/runtime metadata and runtime paths, legacy cryptographic readers, and UI service/help links. The native framework contains four raw `Aside` occurrences, but each still requires contextual classification before claiming a product reference. The newer runtime-envelope slice is not in this scanned candidate; its four exact rules must be checked against its own final packaged output.

This extends the earlier generated-stage inventory; it is not a complete no-trace proof. Compressed payloads, synthesized native constants, image pixels, reachability and actual behavior still need their own evidence. No UI, accepted app, owner state, credential, Keychain, provider service or signing operation changed.
