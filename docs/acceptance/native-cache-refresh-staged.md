# Staged native parsed-rule cache and refresh

Patch0101 implements the native filtering spec's cache invalidation and
subscription refresh behavior. It remains outside the applied series until the
current full browser build finishes. No compiled/runtime pass is claimed here.

The independent format stores versioned parsed rules plus source identity and a
payload SHA-256. It reconstructs bounded RE2 programs rather than serializing
machine code. It is not a FlatBuffer; diagnostics keep flatbufferSize=0 and
report the actual parsed-cache format, size and hit. Bad/truncated/source-changed
cache falls back to compilation. Writes use private permissions and reject
symlink endpoints; clearing removes only the exact cache file, preserving rules
and subscriptions.

The profile-owned periodic tick considers enabled, due, nonbusy subscriptions,
skips offline/disabled operation, uses the existing conditional HTTPS downloader
and backs off failures from15minutes to24hours. Successful checks retain daily
refresh. Existing generation checks continue to guard engine installation.

The lane authored engine/cache probes for round-trip request/cosmetic
equivalence, corruption/truncation/source invalidation, permissions and selective
clear. Root normalized draft diff paths for the new files. Native compilation,
probe execution and disposable actual filter acceptance remain outstanding.
