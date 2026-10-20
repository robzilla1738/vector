# Chromium profile discovery admission

Incremental, source-backed correction after `7ded08322` (Arc). This changes one file through three counted anchors; root can rebase unrelated reader hunks independently.

The supplied `426793c` appends cache IDs with the actual FilePath append helper and admits actual directories. It does not impose the inherited 128-profile cap, single-component/UTF-8 ID blacklist or symlink rejection. This proposal removes those extra policies. The existing complete source name/subtitle precedence is retained without truncation.

The supplied `4266e60` reads Local State with ReadFileToString and parses JSON options 0 / depth 200. Discovery now uses that path rather than the inherited generic reader's 32 MiB cap and link rejection. Actual read/parse failure still selects the genuine fallback; there is no fabricated metadata.

The fallback has its own positive source restriction: `103eb5c` tests ASCII high bits. It applies only to directory enumeration before the exact Default / Profile-space / Atlas user- prefixes. It is not a cache-ID whitelist. Original FilePath append semantics, directory status, full metadata values and existing profile order remain authoritative.

`source-evidence.json` pins the original thin binary and six bounded byte/disassembly ranges. `verify.py` checks those pins, the single parent/output hashes, all three anchor counts and patch replay. Verification passes; no native build, profile read, runtime or OS operation was performed.

Scope limits: this is Chromium-family discovery. The independent Firefox directory enumeration still has a 128 cap, link/places.sqlite gate and basename metadata; the supplied API instead calls its genuine profiles.ini helper (`71f0cc8`). That separate positive owner must be ported before claiming complete discovery parity. Safari is owned by the separate Safari lane. Other inherited generic JSON/file limits in category readers are not justified or removed by this discovery-only proof. The declared original import capabilities remain the target; the currently backed categories are not a smaller completion target.
