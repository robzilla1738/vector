# release-state-root-a1

The release keeps Aux state in `~/Library/Application Support/Aux` and `~/Library/Caches/Aux` (decision 3), not the candidate-only `Aux Browser Completion 20261026`. The browser side is in the Chromium tree. The daemon carries its own copy of the path policy, so `source/daemon-policy.swift` is the sealed daemon policy with only that name changed. The daemon was relinked with `scripts/candidate/relink_daemon.py`:

- compile recipe: `out/live-inputs/completion-20261026/daemon-liveness-census-a1`;
- link recipe: the same folder, the link of the sealed executable;
- substitution: the preserved `daemon-policy.swift` for this one.

Recorded `/private/tmp` inputs resolve to `out/live-inputs/tmp-preserved`, because macOS had purged some of them. Output: `out/live-inputs/completion-20261026/release-state-root-a1/Aux Daemon`, passed to `assemble.py --daemon-executable`.

Chromium's crash database moves from `Application Support/Aux/Crashpad` to `User Data/Crashpad`. The native startup refuses any entry in the support folder other than `User Data`, `Control` and `Tasks`, so with the folder named `Aux` the old location blocked every launch after the first.

## First launch (relink `release-state-root-a2`)

The first launch of a newly assembled build was refused at readiness with `stage=currentCodeReadback error=identity`. The daemon's policy loader binds six of its own files (executable, `Info.plist`, `CodeResources`, the policy resource, `index.mjs`, `aux-native-entry.mjs`) and refuses if any `stat` field changes during the run. On the first execution of new code, macOS updated the daemon's `CodeResources` extended attributes about a minute after signing, which moved ctime and nothing else. A copy reusing the same code hashes started first time. `source/AuxSignedFreshBootstrapPolicyLoader.swift` drops ctime from that long-lived binding only. Device, inode, mode, links, owner, flags, size and mtime still must match, and the signature is re-validated. Short read-stability checks keep ctime. Relinked as `out/live-inputs/completion-20261026/release-state-root-a2/Aux Daemon` with both substitutions.

## Developer ID (relink `release-state-root-a3`)

The browser and daemon pinned the SHA-256 of one signing certificate, the Apple Development leaf, in four places: `AuxNativeParentColdLaunch.cc`, `AuxCliSealedImages.cc`, `AuxFreshBootstrapPolicy.swift` (browser) and `daemon-policy.swift`, plus `AuxSealedOuterBrowserParent.swift` on the daemon side. A Developer ID build was refused before any state was created. Both of Robert's leaves are now accepted, under the same team check:

- Apple Development `ff0293a0…`, for local builds;
- Developer ID Application `f3ee5520…`, for releases.

The daemon was relinked with three substitutions (this folder's `source/`).

`assemble.py` also no longer re-signs a target's own executable in the nested pass. Each helper's launch-policy pin (Computer Use, memory helper) is re-pinned right after that helper is signed, before the daemon bundle seals the policy.
