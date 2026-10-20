# Supplied installed-browser registry admission

Incremental proposal after `1b5cff0cb`. It changes only chooser discovery/admission; no UI, crypto selector, key derivation, snapshot or migration reader changes. The original registry, resolved Objective-C selectors and profile-reader ranges are pinned in `source-evidence.json`.

## Positive source and correction

`getImportSources` helper4275b40 calls42653d0 at4275b70 and iterates the returned IDs. Registry42653d0 walks exactly `[e8a7320,e8a7440)` at32bytes/record. Its order is Chrome, Brave, Safari, Firefox, Arc, Atlas, Comet, Dia, Helium. Edge has a friendly-name/parser mapping elsewhere but **no enumeration record** here. There is no second manual registry append in4275b40..4276580. This correction removes Edge from the chooser, retaining its existing internal migrator identity.

For each registry record,42654bc reads its application name and appends `.app` only when absent.4265524..5584 builds the exact ordered roots `/Applications`, `NSHomeDirectory()/Applications`, `/System/Applications`.4265664..5680 requires an existing directory.42656ac..56d8 reads `NSBundle.bundleWithPath.bundleIdentifier`; if empty,42656e0..5784 reads `Contents/Info.plist` and accepts CFBundleIdentifier only when NSString.4265794..5804 compares that value to the registry's exact primary/alternative IDs. All nine pinned alternative IDs are null. An absent/wrongly identified app is skipped; a matching app appends its source ID once. It does not use LaunchServices' arbitrary-location bundle search.

Current Aux instead enumerates every family, appends absent families with empty metadata, always adds Safari, uses LaunchServices, and orders Arc ahead of Safari/Firefox. The proposal replaces the installed-app predicate with the actual named-directory+bundle check, filters production discovery through it, and projects the exact surviving registry order. Safari is subject to the same real installation check. Internal source directories, aliases and existing419 selection validation are untouched. The private disposable fixture boundary continues using its own confined inventory and never probes real applications; it uses the same source order and omits the non-registry Edge chooser entry.

The obsolete LaunchServices-only Bundle mapping is removed because it becomes unused; crypto Service/SuppliedSelectors are byte-identical. This is not a Keychain operation. Discovery helper remains in the already built source_crypto_mac.mm; there are no registration/GN changes.

## Profile fallback: positive bounded finding, not falsely completed

Pinned4266e60 first reads `Local State`, then `profile.info_cache`. It also honors `profile.profiles_order` (4267040..7090) before remaining cache keys. At4266f0c/6fcc/6ff0 it calls4267508 after file/parse/member failures; at4267118..7124 it also falls back if no valid result survives.4267508 enumerates actual root directory entries and admits exact `Default`, prefix `Profile `, plus Atlas-only prefix `user-` (enum2), then calls426793c before creating each profile record with4267a88. Current Aux lacks both ordered-cache processing and this fallback. This remains a concrete required follow-up; no invented `Default` row or guessed profile display name is added in this registry correction. Next bounded source owners are426793c (actual directory/status admission) and4267a88 (Preferences/cache name/avatar projection).

## Autofill remains required unfinished parity

The original common Chromium descriptor still declares history/bookmarks/passwords/cookies/**autofill** at4276460..64dc. The previous proposal's backed subset is temporary truthful availability, not the completion target. This registry patch does not add the missing autofill reader/store consumer or claim full import. The bounded importer-range literal sweep alone did not establish a dedicated Web Data/category reader; full Chromium migration/copy-plan ownership must be recovered, rather than inventing SQL/schema or marking an unsupported category successful. L2 owns the full migration readers; no overlapping lower reader edits are included here.

## Verification and integration limits

`python3 verify.py` checks whole-image and raw range/literal/registry pins, four count-one anchors, exact two-file output hashes and temporary patch replay. It performs no native discovery, application/profile reads, native build, browser launch, Keychain, migration or OS permission operation. No shared native checkout changes. Native compile and actual chooser observation remain integrator work; no runtime or normal-profile parity acceptance is asserted.

`migrator.cc` parent is the exact discovery output93bf82fb; L2 password-store reader adds disjoint includes/lower reader blocks against its earlier parent. Integrator must compose those verified hunks, not replace either whole file. `source_crypto_mac.mm` parent b07f68d2 includes the already applied six-selector crypto patch; this proposal does not change those selectors.
