# Actual two-addon step — completed, then owner pause

Owner approved exact review `5138937e149f3ff805f70ed92e552b7cc444e2d8e697d0d5c82582f20695b037`, then requested stopping after this step and updating local work/docs.

Both derivative copies were signed with the existing identity and no entitlements. Strict genuine Apple/team/identifier verification passed; native sections and the masked pre-signature prefix remained identical to the preserved raw originals. Original A38/raw files remain untouched.

The matching two lifetime objects, 54-source daemon and shared browser parent-policy/framework rebuilt successfully. The initial C++ standard-header failure was corrected with the same installed SDK path in fresh outputs; its failed preflight is retained. No Worker/CU or standalone CLI rebuild occurred. The unchanged requirement expressions were normalized with codesign's required literal `=` prefix; approved review bytes and signing targets remained unchanged.

Five exact package leaves were replaced as one cohort: two signed addons, daemon executable, framework executable and v10 descriptor. The daemon, framework and outer app were resealed. Signatures, entitlements, complete package delta and preservation checks pass. The old app and all preimages remain recoverable.

**Startup smoke does not pass.** Plain scoped launcher returned0 and browser/daemon initially ran; no window or expected services became ready. Browser exited and its orphan daemon ignored SIGTERM. Only that exact owned process, with no children observed, was then stopped with SIGKILL. Interrupted state is retained; no clean Quit/drain or runtime acceptance is claimed. No further repair or feature journey was started.

See [current artifact](../../integrator/current-signed-candidate-a2.json), [exact startup/teardown](../../integrator/final-startup-smoke-a1.json), and [pause handoff](../../PAUSE-HANDOFF.md). Actual signed source/build evidence is retained in `actual-signed-source-a1/`; workspace binaries and logs are in `out/completion-20261026-addon-proof-a1/`. Later repairs restored startup; [docs/STATUS.md](../../../../../STATUS.md) is the live summary. This file records the 2026-10-26 step. The goal is paused, not complete.
