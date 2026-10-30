# release-addons-a2

Replaces the supplied `aux-macos-utilities.node` with Aux's own build in the release. `out/live-inputs/completion-20261026/release-addons-a2` holds the fixed Developer ID copies and `pins.txt`:

| Addon | SHA-256 | Bytes | Built from |
|---|---|---|---|
| `aux-macos-utilities.node` | `10bdcb53…1c5b` | 163344 | `apps/macos-utilities-addon` |
| `aux-pdf.node` | `e94ced74…bdbf` | 9437920 | unchanged from `release-addons-a1` |

`source/` holds the two daemon sources with the new release pin, copied from `../release-state-root-a1/source` with only those constants changed:

- `daemon-policy.swift`: `AuxFreshBootstrapMacUtilitiesIdentity.releaseSha256`, `releaseBytes`.
- `utility-lifetime.cc`: `kRelease` and the two size checks. Built with the recorded `clang++` command into `out/live-inputs/completion-20261026/release-lifetime-a2`; the same command on the a1 source reproduces the a1 object byte for byte.

The daemon was relinked as `out/live-inputs/completion-20261026/release-state-root-a7/Aux Daemon` from the `a6` recipes with those two substitutions. The browser's copy of the constants is in `chrome/browser/aux/native_peer_policy/AuxFreshBootstrapPolicy.swift`. A build needs a2, a7 and that browser together: each refuses the a1 utilities copy.

`docs/spec/native/macos-utilities.md` section 7 lists every pin and what did not need changing.
