# Exact1852 UI input recovery

The original Agent1852 installed directory disappeared during an Aside auto-update. The target version and canonical pins remain unchanged. Complete project-owned original UI inputs now exist at:

`/Users/rcourson/Documents/Vibe/web/out/provided-ui-original-1.26.1016.1852/agent`

`/Users/rcourson/Documents/Vibe/web/out/provided-ui-original-1.26.1016.1852/vault`

The snapshot has exactly1215 Agent and46 Vault files, 52,320,602 bytes. Every path, size and original SHA256 matches `docs/source/provided-ui-inputs.json`. Component directories contain no extra leaves. Recovered files are read-only; their immutable identity is the canonical per-file source hashes, which the resolver must rehash at use. `recovery-inventory.json` lives outside the component roots; its SHA256 is `e6dc5ed93a51a0d6c605120c190c65c9d565ec081115571016159b76a5c61fbd`, duplicated here as `inventory.json`.

Recovery methods are1138 byte-unchanged stage files,114 exact inverse transformations from the verified v241 stage, and9 static PNG hash matches. Five Agent logos came from the current installed static Agent1855 package solely because their bytes match the1852 original pins. Four Vault logos came from the authorized Blueprint historical package solely by that same equality rule. No updated implementation file or version was adopted.

Four text inverses needed explicit handling: the registry contains four preexisting `Aux` substrings, bridge identifier inverses overlap, manifest identity inverses share a prefix, and content.js removed one authorized-origin array entry. The recorded recipes recover candidates only when SHA256 equals the original canonical pin; all forward anchors then pass their original exact counts and reproduce the staged output hash. This does not add a source origin or otherwise modify the final Aux build. Across the complete recovered inputs, all116 text transformation records replay with exact counts/output hashes. Replaced PNG source hashes and renamed unchanged font bytes are also verified.

The scripts under `evidence/` record the actual local recovery steps, including the exact task workspace and source paths. They are historical recovery procedures, not a fallback that accepts unknown/new package versions. The reusable source resolver/checker integration belongs to the L4 lane; the all-component frozen snapshot assembly belongs to L2/root. Neither step may weaken canonical pin, inventory or transformation checks.

Only authorized static implementation packages and project outputs were read. No installed Aside file was written; no account/profile/credential data, runtime process, Keychain or OS operation was accessed. Snapshot recovery is source availability evidence, not product runtime or UI acceptance.
