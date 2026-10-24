# Actual package attempt a1 — refused before app mutation

Actual browser a4 full build, final 166-anchor source projection, review freezing, input checks and source/native binding passed. `actual-run-a1.json` records the actual failed package attempt. `prepareBase-a1.log` preserves the failure.

The copied wrapper incorrectly indexed the old protected runtime manifest for `runtime-seed.cjs`. That older manifest lists only bootstrap and absent metadata. The original seed is instead an existing protected-baseline leaf with SHA-256 `3051dea5ccc9d74126bf71ddc0bb72a4d3db19c59f890a8f48d572b215f092af`, also recorded as the original successful a4 runtime manifest’s seed `previousSha256`. The publisher input seed is a later intermediate and cannot replace that baseline pin.

The error occurred while constructing the manifest in memory. No runtime manifest, base recipe, feature recipe or app was written. The prepared directory is empty. The v4 review/tool/pair remains immutable historical evidence; a separate v5 must validate the fixed original seed path/hash/provenance, preserving every source/native/resource gate. No signing, product execution, owner data or OS grant occurred.
