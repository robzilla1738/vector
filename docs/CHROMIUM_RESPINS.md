# Chromium security respins

Aux pins a Chromium stable tag and its commit in [chromium/version.txt](../chromium/version.txt). Check the [Chrome Releases desktop stable channel](https://chromereleases.googleblog.com/search/label/Stable%20updates) every week, and on any high or critical Chromium advisory affecting Aux. Record the Mac stable version, release date, affected components, tag commit, patch replay result, compile result, and browser journey results in [EVIDENCE.md](EVIDENCE.md). The target for a critical fix is a reviewed build within 48 hours of the upstream Mac stable respin.

For each newer Mac stable respin:

1. Resolve the exact official upstream tag and commit. Record its SHA and reject a tag whose fetched commit changes. Create a disposable Chromium worktree at that commit and sync its matching dependencies.
2. Replay `chromium/patches/series` in order with `git apply --check` before every patch and `git diff --check` afterward. Record every conflict by patch and file. Rebase the smallest affected patch against the new tag; keep the ordered series reproducible from a clean checkout.
3. Change `chromium/version.txt` only after the new commit is verified. Generate dev and official release GN graphs. Compile the fork, run C++ tests and native browser journeys, then make the official static build and inspect its signature and runtime policy.
4. Run local TypeScript, unit, compatibility and security gates. Require the private `aux-mac` job and hosted CI on the exact proposed SHA when GitHub Actions is available. Record any external CI outage honestly.
5. Deliver a reviewed PR and an updated ad-hoc build for the owner. Developer ID signing, notarization submission, and feed publication remain owner takeover steps.

The first stable Chromium 154 Mac release was `154.0.8037.58` on September 22, 2026, and Aux pins that tag. At the September 25 check, the official channel had not published a **newer Chromium 154 Mac stable respin**, so an N→N+1 security-respin rehearsal on this branch is pending upstream availability. A successful replay on the already pinned tag validates reproducibility but does not count as that rehearsal.
