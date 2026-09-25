# Chromium content blocking contract

Patch `0028-content-blocking.patch` applies after the ordered Aux native stack
through `0027`. It adds a Profile-owned URL loader throttle and keeps the
existing liquid-glass Settings and Site Controls surfaces. The worker owns
downloaded source definitions and cached text under `Aux Runtime Data/filters`;
Chromium owns the active network policy and its atomic snapshot under
`Profile/Aux Blocking/snapshot.json`.

The trusted `chrome://aux/` shell can review and select HTTPS hosts-format
lists. Downloads reject redirects, credentials, local literal targets and
responses over 16 MB. A worker thread parses only host lines and verifies each
cached file against its recorded SHA-256 before use. An offline or invalid
download leaves the last valid cache in place. The 88 built-in domains are
generated from `packages/contracts/src/tracker-hosts.ts` by
`scripts/generate-native-blocking-seed.mjs`; Chromium requires them in every
committed snapshot, including when a downloaded list is removed.

The runtime sends an authenticated `native.contentBlockBegin`, ordered
`native.contentBlockAppend` chunks of at most 1,024 hosts, and
`native.contentBlockCommit`. Chromium requires the owning Profile ID, a
strictly increasing generation, sorted and unique canonical hosts, bounded
counts, valid site exceptions, and the SHA-256 of the newline-joined host
sequence. It persists before returning the exact generation, digest and
installed-rule count. The runtime does not report a successful update without
that matching receipt. Corrupt persisted snapshots fall back to the built-in
seed. An interrupted staging sequence never replaces the active rules.

`CreateURLLoaderThrottles` applies the current immutable rules before network
start and again on redirect. `CreateURLLoaderThrottlesForKeepAlive` covers
beacons. Top-level document navigation remains available; subframe documents
and other subresources to blocked domains are canceled with
`ERR_BLOCKED_BY_CLIENT`. Per-site exceptions match the top site and are
captured with the rules used for that request. Chromium keeps only in-memory
total and per-site blocked counts, not request URLs. Private Profiles inherit
the original Profile's rules and maintain their own temporary site and global
overrides without writing preferences.

The shell checks its committed `chrome://aux/` document, owning Profile and
window, page ID and HTTP(S) URL before exposing Site Controls. A site-toggle
snapshot also carries the selected page URL and navigation ID; Chromium
rechecks them at begin and commit and rejects a stale action. Cookie counts
come from that Profile's CookieManager and are rechecked against the same
navigation before display.

Patch `0031-cosmetic-document-start.patch` adds a separate Profile cosmetic
snapshot under `Profile/Aux Blocking/cosmetic.json`. User-selected cookie-banner
lists use the same bounded HTTPS downloader. The runtime parses at most 10,000
declarative selectors off-thread and sends canonical, sorted rules through
authenticated `native.cosmeticBegin`, chunks of at most 128 rules, and
`native.cosmeticCommit`. Chromium independently rejects CSS punctuation,
scriptlets, procedural selectors, malformed domains, oversized rules, stale
generations, mismatched site policy, or an incorrect SHA-256. It persists the
verified snapshot atomically; corrupt startup data is ignored.

The Zap commit gate now composes exact-origin cosmetic rules with a user's Zap
CSS and sends them to the renderer before each HTTP(S) document commit. The
renderer inserts user-origin CSS when the document element is created, also
covering inherited-origin frames through its versioned origin registry. Rules
never enter privileged pages or another frame origin. Network site exceptions
and temporary private-window overrides govern cosmetic hiding too. A cosmetic
update refreshes active regular and private frames, rolls back if a surviving
document rejects the stylesheet, and returns a separate `document_start`
receipt only after successful refresh. The Settings UI offers cookie-banner
lists only when the runtime has attested that backend. The fixture tests cover
reviewed selection, restart replay, revocation, receipt matching and the safe
selector subset; `cosmetic_controller_unittests` checks native parsing and
domain matching. A packaged first-paint journey against a real endpoint remains
a final release qualification gate after the patch is built into Chromium.
