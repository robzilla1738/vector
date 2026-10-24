# Post-custody constructor variant

Apply this one measured header anchor after `browser-custody-content-a5`, instead of the older a6 header row from `content-policy-ack-v4`. All other custody content bytes remain exact. Reuse the v4 Mac launcher include and `aux_child_process_drain.cc` out-of-line definition rows unchanged. The constructor remains private and defaulted; no field/lifetime behavior changes.

Baseline and output hashes and the count-one replacement are recorded in the manifest. This is a new additive proposal; neither predecessor nor selected native source was edited. Only literal replay/hash validation was performed. No compile, GN, execution or acceptance claim.
