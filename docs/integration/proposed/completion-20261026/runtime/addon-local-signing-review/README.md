# Two-addon local signing exception — prepared, unapproved

The current local candidate cannot pass its existing image-signature gate: the preserved PDF and macOS utility modules are linker-ad-hoc signed, with no TeamIdentifier. The strict v10 loader already requires genuine signatures from team `9F2JXY8TCK`, with identifiers `dev.aux.browser.pdf` and `dev.aux.browser.macos-utilities`. This proposal satisfies that gate; it does not relax it.

Approval requested is limited to signing **two derivative copies** with the same existing Apple Development identity `47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90`, without entitlements, and coherently rebuilding/resealing the existing daemon, browser framework and outer Aux app. This is an explicit exception to preserving original addon bytes. Their original A38 and current raw files remain untouched. No release, notarization, credentials, owner profiles, new OS grants or installation-state adoption are included.

| Input | Exact raw bytes | SHA-256 |
| --- | ---: | --- |
| aux-pdf.node | 9,474,752 | ed5b4faec15d3fc3c29a97f0dd304b388844cf0bf16fad5a69a62b357a52dcc0 |
| aux-macos-utilities.node | 393,720 | 7aff7611505145a5629cf42496be506200e7c1026087b2e397057e646d220e5e |

The exact original paths, A38 equality, observed signature metadata, raw Mach-O section inventories, two signing commands and literal `identifier =` verification requirements are in `review.json`. Both source files were read from the current candidate; no owner manifests or state were accessed. No derivative copies have been signed or created by this proposal.

After explicit approval, root creates a fresh `/private/tmp/aux-two-addon-local-signing-20261026-a1/` with `raw/` and `signed/`, copies each exact input into both directories, checks the raw hashes, then runs only these two new-object signing commands:

```sh
/usr/bin/codesign --force --sign 47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90 --options runtime --timestamp=none --identifier dev.aux.browser.pdf /private/tmp/aux-two-addon-local-signing-20261026-a1/signed/aux-pdf.node
/usr/bin/codesign --force --sign 47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90 --options runtime --timestamp=none --identifier dev.aux.browser.macos-utilities /private/tmp/aux-two-addon-local-signing-20261026-a1/signed/aux-macos-utilities.node
```

`prepare-signed-successor.py --output /private/tmp/aux-two-addon-local-signing-20261026-a1/successor` then reads the actual signed outputs. It verifies strict Apple/team/identifier requirements, refuses ad-hoc signatures and entitlements, measures actual hashes/sizes, and requires unchanged native sections and the entire pre-signature file prefix except the existing code-signature command and `__LINKEDIT` size fields. The signature offset must remain unchanged. Any other native/load-command change fails preparation; it is not automatically permitted. No post-sign hashes are fabricated in this review.

The generator emits exactly four source successors and one daemon descriptor:

- Daemon `AuxFreshBootstrapPolicy.swift`: two hash/byte pairs.
- Browser `chrome/browser/aux/native_peer_policy/AuxFreshBootstrapPolicy.swift`: the same two hash/byte pairs.
- `AuxLoadedPdfLifetime.cc`: current-image hash and both current-size checks; preserves legacy handling, native-symbol ownership and lifetime census.
- `AuxLoadedUtilityLifetime.cc`: current-image hash and both current-size checks; preserves native-symbol ownership and lifetime census.
- Daemon `AuxFreshBootstrapPolicy.json`: actual signed addon hash/byte fields only, preserving v10 format and all other policy fields.

Its ordered build proposal compiles only the two lifetime objects, then runs the existing **54-source** Swift link with the ACL-repaired loader preserved. WorkerHost, computer-use and all other native objects remain inherited from the pinned successful inputs. Generated `inheritedLinkInputPins` describe the predecessor inputs; root must supersede the daemon policy and two lifetime-object pins with the actual generated/build outputs before replay validation. New objects/executable do not have hashes until actual compilation. No compile or signing runner is included.

Root projects only the browser Swift successor into its pinned native preimage, incrementally rebuilds the existing `aux_parent_sealed_policy` dependency and linked Aux framework using `scripts/native-build.py`, and records the real browser/daemon outputs. There is no GN registration change, new reader API or change to `AuxAuthenticatedChildParentPolicyReader.swift`; that reader consumes the shared policy type. Actual GN evidence is pinned in `review.json`: `native_cli_open` depends only on SDK-only `native_cli_ingress`, with no `platform` or Swift policy dependency. It needs no addon-refresh relink or reseal. CLI resources contain no addon descriptor and do not gain addon authority. The two lifetime headers are copied as pinned unchanged compilation inputs beside their generated sources.

Root stages the two signed addons, actual rebuilt daemon/framework and updated descriptor as one finite candidate repair, verifies the complete inventory delta, and reseals the daemon, framework and outer app using their existing reviewed identities/entitlements and parent order. Existing unrelated signed objects stay unchanged. The outer seal changes because nested content changes; the outer browser executable itself needs no source edit. Actual parent signatures/inventory must be measured after this operation.

The v10 format stays strict. Old raw-image descriptor/compiled-identity combinations are rejected, rather than interpreted as the new signed delivery. No private home is read or migrated by this preparation. Actual startup must establish success; current failed startup is not runtime acceptance and no initialized-state claim is made here.

Checks performed here: current/A38 raw-byte equality, actual raw signature display, exact active-source/recipe pins, actual raw section/prefix inventory extraction, and Python AST parsing only. Signing, compiling, staging, launching and runtime acceptance remain unperformed.
