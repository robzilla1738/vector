# Supplied Chromium profile ordering and admitted fallback

Incremental, discovery-only proposal after registry `f0b394c80`, against migrator output039ba611. Lower migration/snapshot/crypto readers remain unchanged; integrator composes their disjoint hunks. No UI, source registry, GN or shared native modifications.

## Original behavior and implementation

Original4266e60 reads Local State and requires `profile.info_cache` to be a dictionary.4267044..7090 reads optional `profile.profiles_order`;42672ac..73a0 visits string entries first, looks up their actual cache metadata, admits only real profile directories via426793c and records IDs only after successful append. The subsequent cache walk skips those successful IDs. Importantly, the first loop does **not** deduplicate the supplied order list itself; this port preserves that behavior. A malformed order entry/missing cache key cannot create a profile. Remaining cache keys use the existing lexicographic dictionary order.

After open/read/parse/cache failures, or when no valid cache profile survives, original calls4267508. Its real opendir/readdir loop recognizes exact `Default`, prefix `Profile ` (including arbitrary suffix, no numeric parser), and **Atlas-only** prefix `user-` (enum2). Every candidate must pass426793c, the actual directory-status predicate. The fallback constructs metadata-free records via4267a88 then sorts by record+8, its UTF8 profile ID. The comparator is directly pinned at4269a04..a88: bytewise memcmp of the profile-ID strings, then length. This port sorts IDs lexicographically rather than display names or numeric suffixes. It does not synthesize Default or append fallback rows when a valid cache result already exists.

4267a88 initializes name to the actual profile ID, replaces it only with nonempty cache `name`, and derives subtitle from nonempty `user_name`, then nonempty `gaia_name`. If both are absent and name differs from ID, subtitle becomes ID; otherwise subtitle stays empty.4267a88 receives null metadata in fallback; it does not read Preferences or guess an account name. Original public serializer4276114..6264 writes `id`, `name` and nonempty `subtitle`. The correction now carries that actual subtitle into the existing profile objects, which PublicSources already preserves while removing nativePath. Empty cache name therefore correctly falls back to ID, rather than producing a blank chooser label.

## Necessary Aux boundary retained

Existing Aux external-path checks remain: valid UTF8 single-component ID, no slash/NUL/`..`, reject symlink, require actual directory, and128-profile bound. Original status follows filesystem links and has no proven128 cap; these retained limits are explicit existing integration policy, not mislabeled original behavior. Fallback accepts only discovered directories and applies the same checks. Existing permission/access handling and public descriptor fields are not replaced by guessed successful access states. No owner application/profile directory was inspected or enumerated during this work.

The current temporary import capability subset remains **unfinished parity**: this proposal does not implement autofill, secret migration, full-profile copy or other readers. Autofill is owned by the separate source-recovery lane. Public source/Atlas alias and source installation fixes from preceding proposals remain byte-identical.

## Evidence and validation

The exact original thin image SHA64c6c8a… is checked. Full LLVM listings pin cache/fallback, directory/record, sorting comparison and public serialization. The bounded4266e60..4267ef0 raw slice is byte-identical to that image; four derived Ghidra procedures are retained with evidence ID for review. External callees in raw analysis are unresolved, so original decoded LLVM/register flow controls interpretation; the decompiler is not treated as recovered original source text. REA was snapshotted and closed after the four procedures.

`python3 verify.py` passes raw/function/literal pins plus three count-one anchors and exact one-file patch replay in a temporary tree. No native build, migrator/discovery execution, browser launch, real profile access, Keychain, grants or signing occurred. Actual native compile and chooser acceptance remain integrator work; no native/runtime/full-parity acceptance is claimed.
