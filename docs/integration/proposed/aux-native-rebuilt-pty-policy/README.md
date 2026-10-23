# Rebuilt PTY policy v4 successor

This is a separate, inactive parser and loader successor. It does not modify the original v1/v2/v3 parser, original loader, accepted app, policy resources or signing plan.

`source/AuxFreshBootstrapPolicy.swift` preserves pure v1/v2/v3 decoding and v3's original module source hash `a8b049…`. The distinct `aux.fresh.bootstrap.policy.v4` format pins the actual retained rebuilt unsigned module SHA-256 `5b703ca2ae0901cc2b8e8e1064aaf4b78a386f402578a995834a8024de433726` (168040 bytes). Its artifact/build provenance is the unchanged receipt under `../aux-pty-module-artifact/evidence/artifact-receipt.json`, pinned by `inputs.json`. The helper still pins the original supplied static helper source SHA-256 `b9cf27…`; it has not been rebuilt.

The policy retains exact artifact paths, Aux identifiers, arm64 architecture, finite key sets, signed-output byte counts/hashes and strict signature validation. The unsigned module's hash cannot stand in for future signed output. There is no manufactured signed-policy resource, changed key format, signature bypass, active startup or authority here.

The companion `source/AuxSignedFreshBootstrapPolicyLoader.swift` comes from `aux-native-authenticated-pty-helper`. After authenticating the sealed policy, both current-process and authenticated-guest daemon paths require the v4 marker. The current-process guard runs **before** image preparation or any PTY `dlopen`; rejecting only at helper capture would be too late. CLI legacy policy decoding is unchanged. The complete original signature, sealed-resource, FD custody, helper capability and revalidation checks remain intact. `change.patch` and `loader-change.patch` are the exact bounded diffs.

The integrator must replace **both** parser and loader operands together in a new coherent daemon link. Historical coherent executable `d76ef82…` does not contain these changes. Do not use this new loader with the old parser, or infer readiness from the source marker alone.

Run `python3 docs/integration/proposed/aux-native-rebuilt-pty-policy/check.py` for one lean pure Swift-interpreter fixture. It checks actual v1–v4 decoding, version/source separation, successor-route rejection of v1/v2/v3 daemon policies, malformed/CLI/unchanged-source refusal, and captured ad-hoc signature refusal. It never calls live Security, loads the module/helper, reads owner state, signs or changes an active policy. `evidence/pure-check.json` records the actual result and exact source pins. Full loader/coherent-build type checking belongs to the integrator's next native link.

Remaining acceptance requires a new exact-byte signing review and authorization, actual signed module/helper/output policy, reviewed immutable root-owned installation, and real protected startup/PTY/lifecycle validation. No such acceptance is established here. Direct-child custody still does not prove descendant/subtree drain. Accepted UI is unchanged.
