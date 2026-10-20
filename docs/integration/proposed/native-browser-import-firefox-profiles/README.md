# Supplied Firefox profiles.ini discovery

One-file incremental proposal after `c3f2f883d`, with five counted anchors. This replaces the independent directory scan with the genuine Chromium155 Firefox importer helper used by the supplied native API.

## Source behavior retained

Original `427641c` calls `71f0cc8` with an empty install ID. The latter reads profiles.ini, parses it through DictionaryValueINIParser and invokes `71f0d68`, the retained GetFirefoxDetailsFromDictionary implementation. It enumerates contiguous Profile0, Profile1… sections, stops at the first missing section, skips missing Path entries, honors IsRelative, replaces name dashes with spaces, and clears the name when its complete result contains one profile.

The public API then checks each result with DirectoryExists (`4276300` → `21239c0`, stat mode equals S_IFDIR). It uses the full profile path as ID, preserves a nonempty helper name and substitutes `Default` only for an empty name. The installed application registry controls whether Firefox is offered; an absent Firefox/Profiles directory does not suppress valid custom INI paths. No places.sqlite, 128-profile cap, link rejection or basename-name substitution appears on this path.

The proposal calls the actual retained155 `GetFirefoxDetailsFromDictionary`, rather than reproducing its selection/name rules. `evidence/upstream` pins its implementation, declaration, Mac INI path helper and common parser. Original bounded binary ranges and literals independently pin the supplied API/helper behavior.

## Explicit source-home adaptation

The common helper's IsRelative=1 branch normally calls global GetProfilesINI. Before invoking it, this adapter resolves only those relative Path values against the explicit `SourceHome/Library/Application Support/Firefox/profiles.ini` directory and rewrites that temporary dictionary entry to IsRelative=0. The helper therefore performs its real ordering/name/default behavior without consulting the owner's global INI when a disposable source home is selected. Missing IsRelative/Path retains the helper's original empty-path result. No source file or original dictionary is changed.

Production follows the original directory admission without new path policy. The existing explicit fixture boundary remains deliberate: the INI's resolved path must stay inside the disposable home, and custom profile paths must be absolute, free of parent traversal and resolve inside that home before profile discovery. These checks apply only to fixture mode; they are not a narrower production import policy.

## Integration and verification

Root must add direct dependencies `//chrome/common:ini_parser` and `//chrome/common/importer` to the migrator target. This proposal does not edit GN. Other reader changes below discovery and Safari changes can be rebased as disjoint anchors.

`verify.py` passes original binary/listing/literal hashes, retained helper copy hashes, parent/output hashes, all five anchor counts and patch replay. No native build, profiles.ini read, owner data, browser execution or OS operation occurred. This establishes source reuse and replay only; disposable native discovery execution remains for integration.

This corrects Firefox discovery, not the complete migration backend. The original declared capability set remains the completion target; passwords/autofill and other category behavior must not be declared complete based on these discovery changes.
