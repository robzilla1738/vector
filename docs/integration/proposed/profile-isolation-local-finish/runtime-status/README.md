# Offline bundled runtime status

After successful bundled seeding, supplied `performInstall` fetched optional release metadata before inspecting the installed runtime. With the isolated unavailable release endpoint, it marked the runtime job failed even though the supplied status helper and acquire-use path accepted that same local runtime. This is a source-proven false failure, not a missing installation.

The one-count successor handles only release-metadata failure: a non-forced call with a valid installed runtime and no macOS quarantine returns `installed:true`, its actual version, `latestVersion:null`, and `updateAvailable:false`. This matches the original offline status representation; it never claims the runtime is newest or a network update succeeded. Forced updates, missing/incomplete runtimes, quarantine, native owner refusal, bootstrap errors and all subsequent installation errors retain failure behavior.

API `applyAuxOfflineRuntimeStatus(source)` pins input `156c9361fc37848175c920d2fab53b89526870a2358803ef01f147af5ecb1ed6`; output `ecff19ddbc7fa76529c50111152f8324ef0ba6b87de11e7ecf872f76270a7484`. No native ABI, UI layout, runtime executable or ordinary cold-refusal change.

Focused fixture executes the actual extracted function, replacing only its dynamic module-loading seam with a controlled bootstrap adapter. It reproduces baseline failure after successful seed, checks truthful offline success, and verifies force/missing/quarantine still reject. Status and network dependencies are controlled; no product, provider or owner state runs. Complete transformed syntax passes. This is not runtime execution acceptance or a proof of every runtime cache state.

Other audited paths use `Cn.runtimeDir ?? AUX_RUNTIME_DIR`; the default is native taskHome/runtime. The corrected bootstrap refuses alternative destination authority before any seed. Cached native task roots already enforce owner-generation consistency. `startAgentRuntimeInstall` records actual caught errors rather than silently succeeding. No further source change is asserted for those paths in this bounded pass.
