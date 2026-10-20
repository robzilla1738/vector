# Supplied Glic scope: compiled defaults, not runtime eligibility

The pinned supplied arm64 framework contains enabled-by-default feature records for `Glic`, `GlicActor`, and `GlicActorUi`. The JSON records exact addresses, 16-byte data records and SHA. The original FeatureList helper at `0x1192e4..0x119300` itself loads feature+8 and returns true for value 1 when no override applies; this conclusion does not rely on Chromium155 defaults. Original `0x3007e58..0x3007e74` checks Actor then ActorUi through that helper before its real owner path.

The apparent `GlicActor,GlicActorUi` disable string is **not** a startup-disable proof: the table at `0xe847fa0` is the `glic-actor` flags menu entry, with both `enable-features` and `disable-features` alternatives pointing to that same CSV. A bounded static string and direct ADRP-reference audit did not establish an unconditional original startup disable. It cannot rule out dynamic command-line/flags/Finch/policy overrides or establish a real profile's eligibility. No target or owner profile was launched.

Accordingly the Chromium155 integration must preserve its actual service/feature/profile eligibility and real pending-state guards. Removing Glic owners based only on an assumed original disable would lack evidence. Source-level lifecycle adapters remain platform adaptations, not claims that current155's entire Glic feature graph exactly matches Aside153.

Static tooling: Mach-O section/record parsing plus bounded llvm-objdump; REA open verified the pinned binary identity. A provider read request was slow and is not used as evidence here. No runtime, network or OS authority operations.
