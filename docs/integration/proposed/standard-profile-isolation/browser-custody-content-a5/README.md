# Custody integration on the actual a5 content lifetime header

This is the one overlapping-file replacement for custody a1 when applied to the actual a5 browser source. All other seven custody a1 baseline hashes still match a5. Do **not** overwrite the a5 content header with the historical a1 copy. Apply this eight-anchor overlay directly to the pinned a5 header instead. It already incorporates the content-specific definite pre-spawn refusal fix from `browser-native-host-reservation-refusal-a1`; do not apply that row twice.

`ObserveAppliedPolicy`, its native generation/birth/owner validation and review getter remain byte-identical to a5. The required fresh browser ES observer owns all real content descendant cohorts, including normal renderer launches. A live known ES cohort is pending, not an unobserved cohort. Therefore old unobserved-counter increment/no-fork decrement are replaced by single ES ticket ownership; no-fork policy is retained independently and cannot decrement the same cohort twice.

The original sole reaper publishes its exact terminal result once. Only the real observer's settled fence releases the retained registry entry. Actual uncertainty stays sticky; native admission failure after a successful reservation calls the exact no-child failure callback, never pretends a child completed.

The source-only check replays eight anchors, confirms the complete policy-method block is byte-identical and confirms there is only one completion owner. Native compilation, ES capability and actual behavior remain unverified. No tree/build/stage/app/signing changes were performed here.
