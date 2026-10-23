# Proposed exception: local build tools only

**Review only. Not authorized or activated.** Product signing and release remain separate.

The first real unsigned build compiled 106 actions before a Rust host build script was killed with SIGKILL. The second compiled 371 actions, then rebuilt that same host executable from its normal dependencies and failed again. Inspection confirms the newly linked host executable has no signature; the previously existing equivalent tool has a code-signature load command. Kernel log inspection was denied, so kernel enforcement remains the supported explanation rather than a captured kernel verdict.

A separate, source-checked map now reuses 23 existing Rust build scripts without creating signatures. This cannot cover the whole coherent build: native generators link against newly compiled libraries, including changed base process interfaces. Substituting old generator binaries does not prove the resulting generated artifacts correspond to the new source graph.

The proposed exception would permit the local linker to emit its ordinary **ad-hoc signature only for the exact 48 host executable outputs and 20 host procedural-macro libraries** listed in the adjacent inventories. These are build tools run by the local compiler; they are not Aux application outputs. The current commands are pinned from the actual complete graph, including output names. A new or changed output would require a review update, not a wildcard allowance.

No developer identity, private key, Keychain access, provisioning, notarization, application signing, release, or owner profile is involved. Every one of the 20 product link outputs in `excluded-product-outputs.json` keeps `-no_adhoc_codesign`; the final native app inventory still refuses signature load commands. No product objects would be substituted. Final packaging still retains the accepted UI separately and remains inactive.

Implementation after authorization: use an exact-output allowlist at the isolated linker-driver boundary to omit only `-Wl,-no_adhoc_codesign` for these outputs; preserve all other compiler/linker arguments. Regenerate and review the actual command graph, rebuild affected host executables normally, and continue the full graph. The current static Rust runner override would be removed so all tools use the new coherent graph. The original shared checkout and accepted app stay untouched.

The cost is local CPU/disk only; no purchased service or recurring charge. The full graph contains roughly 57,000 remaining actions, so elapsed time is uncertain and may be hours. This exception does not establish protected runtime readiness or clean admitted-root recovery.

`linker-driver.patch` and `aux_host_link_filter.py` are the concrete review-only implementation. Copying the helper and its three inventories alongside the isolated linker driver and applying the exact pinned patch would activate it; none of that has been done. The pure fixture exercises all 68 host and 20 product outputs in relative and absolute form plus six refusal cases. It invokes no compiler, linker or signing tool. Unknown outputs, unexpected working directories, traversal, absent/duplicate baseline flags, conflicting signing flags and duplicate output arguments refuse.

Actual broader blocker subsequently reproduced: `unsigned-children-static-tools-build` passed the three mapped Rust scripts, linked the new unsigned `protoc`, then its first Perfetto generation returned `-9` at action 7 of 57,391. This is no longer only a predicted future tooling limitation. The full native app has not linked. The 15 child/messaging sources and two GN header registrations are now projected into the isolated source graph; no accepted app or shared Chromium files changed.

After authorization, the first filtered build reached 649 actions. Native host
generators executed successfully. The Rust macro `cxxbridge_macro` was compiled
through a direct clang linker path and remained unsigned, causing rustc E0463
when loading it. The same approved 20 macro outputs now use the identical
allowlist filter at `rustc_wrapper.py`'s LDFLAGS boundary before expansion. All
other Rust output flags remain unchanged. `rustc-wrapper.patch` records the exact
adaptation; pure checks cover each approved macro and unknown-output refusal.
