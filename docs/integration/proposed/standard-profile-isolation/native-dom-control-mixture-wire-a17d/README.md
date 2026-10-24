# Actual known source/target mixture observation

This three-file/three-anchor append-only successor carries the paired native `6863506bf` snapshot's `known_source_target_mixture` observation through the shared reply and both Local/Session serializers. It composes over metadata wire `f89e3c533`. The service copies the native fact verbatim; it does not infer it from broad status or readiness flags. Existing held/error/aborted/released and `source_ready` semantics are unchanged.

The paired backend only produces this observation after actual synchronized complete per-map source-or-target readback/topology checks when the whole snapshot matches neither all-source nor all-target. It permits the native controller to choose same-token source restoration after a known partial multi-map result; it grants no readiness, publication or release authority. Unknown physical content remains an error.

The source patch replayed and reversed in a disposable mirror; exact inputs/outputs and native dependencies are pinned in source-plan.json. No native projection, generation, compilation, API/product execution, owner state access or runtime acceptance occurred.
