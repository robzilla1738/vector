# Current utility, atomic-CSK and sealed-v4 compilation

The integrator compiled and linked the current production graph once: 22 Swift and six C++ translation units. This review used its retained `out/aux-runtime-utilities-atomic-v4` output; it did not rebuild that graph or rerun the existing lifecycle fixtures.

`evidence/current-utilities-atomic-v4-compile-only.json` binds all 28 actual translation-unit hashes, the generated recipe and input inventory, current host/worker pins, and static Mach-O inspection. The retained arm64 artifact is 1,406,856 bytes, SHA-256 `65d89da3aa148831a4ace2d22d2a3b335c28aa18e986d08851937515c502a780`, targeting macOS 13.0 with SDK 27.0. Its raw old-product literal count is zero. Linked Security/AppKit references are compilation evidence, not evidence that any protected or OS operation ran.

Current pins include the atomic account-CSK coordinator, both PDF and utility lifetime consumers, the daemon-only finite four-image policy and the actual producer. The worker source verifier requires both consumer closure observations before retained Environment state can be erased. The separate v4 policy receipt records the integrator's 24 captured assertions; this review did not repeat them.

Earlier receipts remain byte-identical historical evidence. The verifiers authenticate their receipt hashes and retain their original source/input inventories; they no longer assert that historical compiled inputs equal today's changed production sources. Current accounting has 63 host pins and 55 worker pins, with all 28 actual translation units checked against the current compile receipt.

This proves current source compilation/linking and source/evidence coherence only. The artifact was not loaded, the signed policy producer and native owner attachment were not invoked, no Security/OS effects or signing ran, and state-v2 activation is not authorized. Genuine scope/custody admission and actual protected runtime integration remain separate requirements. The retained integrator artifact was left untouched.
