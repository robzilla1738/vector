# Full-owner gate and profile discovery integration

V425 replays the original corrective patch unchanged after registry424. V426 applies the profile proposal’s two behavioral anchors exactly once after that correction. Its only omitted anchor would add `<set>`, which the composed reader already includes exactly once. Both original proposals’ source evidence and baseline replay are verified independently by their verifiers. The rebased manifests pin complete inputs and outputs; the derived profile patch is independently replayed.

This restores source-key refusal after the earlier low-level optional-key inference, preserving dual password stores, blocked forms and partial-decode behavior. Native compilation and actual runtime behavior remain separate evidence. No source profile, credentials, Keychain or OS operation is executed here.
