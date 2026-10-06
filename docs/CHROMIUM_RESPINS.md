# Chromium security updates

Aux’s upstream tag and commit are recorded in [chromium/version.txt](../chromium/version.txt). Use the official [Chrome Releases stable announcements](https://chromereleases.googleblog.com/search/label/Stable%20updates) to select the latest released Mac version in the pinned Chromium major. Internal tags alone do not establish release availability.

Prepare each update in a disposable checkout with matching dependencies. Replay the ordered area patches, resolve product conflicts, compile with the single dev lock, and launch with a disposable Profile to inspect affected behavior. Preserve the working stable checkout and its build cache. Commit the version and patch changes together only after replay succeeds; record build and launch results in [STATUS.md](STATUS.md). Hosted CI, signing and releases are outside local development.

The v3 reset is preparing Chromium `154.0.8037.98` at upstream commit `b859317bf11f6be47f9b7799ec690a0a42a1fb33`, the released Mac stable point update identified during the native audit. Patch consolidation and its build remain in progress. The existing app still uses the earlier pin; the update is not yet verified or delivered. Historical respin instructions and results are [archived](archive/2026-10-05-v2/CHROMIUM_RESPINS.md).
