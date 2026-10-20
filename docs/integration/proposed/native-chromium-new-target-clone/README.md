# Supplied Chromium new-target clone: recursive files and preferences

Substantial new-files-only proposal for the original native WebUI's **new-target** worker. This is not the extension API's current-profile mode1 and does not reroute that API. It implements the real recursive copy and preference reconciliation instead of adding a per-row autofill parser. Generic top-level `Web Data` and its source sidecars are copied by the original mechanism.

Original source: copy425d438; worker4255868; copied-preference helper425e608; Comet URL helper425ee14. Full worker/copy decompilations, bounded raw LLVM, the retained bounded REA preference snapshot and exact constants are pinned to framework64c6c8a3…f4b31c. REA is closed. Platform adaptations use actual155 FileEnumerator, FilePath, CopyFile, JSON dictionary and real chrome_prefs initializer APIs.

## Exact callable phases and original ordering

New header: `chrome/browser/extensions/api/aux_browser_import/chromium_profile_clone.h`, namespace `aux_import`.

```cpp
ChromiumCloneFilesResult PrepareChromiumCloneFiles(
    const base::FilePath& source_profile,
    const base::FilePath& target_profile,
    const std::string& source_id,
    const std::u16string& profile_name);
// Result: bool success; base::ListValue extensions;

bool InitializeChromiumCloneTrackedPreferences(
    const base::FilePath& target_profile);
```

These functions run only on the actual MayBlock worker. Target must be the genuine **reserved, unloaded new ProfileManager path**, not a current/loaded profile. The real selection/lifecycle owner is L4's disjoint port. That owner must preserve the original source-key admission, post-initialization metadata/theme/model handling, real secret restore, completion barriers, cancellation and explicit switching behavior. A successful file phase is not initialized Profile or overall import success.

Preserve this exact worker order: source selection/admission → PrepareChromiumCloneFiles → actual Arc bookmark augmentation for source Arc → InitializeChromiumCloneTrackedPreferences → source encrypted readers/results → reply/CreateProfileAsync → actual native destination restoration/settlement. The tracked phase is separate specifically to retain the **real Arc augmentation slot** between source preference rewrite and tracked preference initialization. There is no fake callback or successful Arc substitute here. Source errors must continue into the actual owner's failure path; the caller deletes its reserved target if tracked initialization fails, matching4255868.

Prepare checks actual source directory existence, discovers original themes/update descriptors, deletes the reserved target before copying, copies and rewrites both preference files. Any copy/rewrite failure deletes that target best-effort and returns false. Native FileEnumerator completion/error behavior, CreateDirectory and CopyFile are retained; no independent file count, byte budget, recursion-depth limit, backup API, permissions imitation, link policy or rollback-success claim is introduced. The source is not written. Existing target cleanup belongs only to the real reserved new-path caller.

## Recursive copy fidelity

The original helper enumerates each directory nonrecursively using FILES|DIRECTORIES and recurses itself. The original root remains fixed for every relative filter. A failed AppendRelativePath or empty relative path bypasses those filters; copying still uses the current source basename. It creates actual destination directories, creates a file's parent before CopyFile, returns false immediately on actual failure, and does not turn file-enumerator EOF into an invented stronger error classification.

Directory basenames excluded, at every depth: Cache, GPUCache, DawnCache, Code Cache, ShaderCache, GrShaderCache, DawnGraphiteCache. The exact source comparisons are independently pinned; there is no generic cache-name classifier.

For discovered themes, any valid UTF8 relative component equal to a theme ID or beginning `chrome-extension_` plus that ID is excluded (directory or file). Non-UTF8 components are not converted into invented IDs. Source4259adc discovers theme IDs from actual unpacked manifests;4259ef0 supplies eligible update descriptors from Secure Preferences, excluding themes by persisted manifest too. Actual valid explicit update_url or from_webstore admission is retained. Their native descriptors are returned for the real destination owner, not reported as installed here.

For update descriptors, **files** under Extensions/<reinstall-ID>/… are skipped while original directories may remain; this is not a blanket extension-directory deletion. The preferences use the original theme-set minus reinstall-set for settings/commands pruning, with theme-set matching for toolbar lists under the same source condition.

The eight encrypted filenames are excluded only at profile root or immediately under Network: Cookies, Cookies-journal, Extension Cookies, Extension Cookies-journal, Login Data, Login Data-journal, Login Data For Account, Login Data For Account-journal. No arbitrary matching at deeper paths, no `Web Data` exclusion, and no added `-wal`/`-shm` exclusion are introduced. These are the exact eight-pointer table bytes0xe8a72b0..72f0, not an independently chosen SQLite safety list. Encrypted restoration remains a separate required original phase.

## Copied preference mutation

The source helper treats an absent Preferences/Secure Preferences file as a successful no-op, but a present unreadable/invalid JSON dictionary fails. JSON read/write retains original flag0 and max depth200, without inherited32MiB/file/text caps. Main Preferences receives actual UTF16 name converted to UTF8; Secure Preferences receives no name override. Both remove dotted extensions.theme.id and extensions.theme.pack.

Original source-kind4 is Comet (raw UTF16 label and enum branch pinned). Only for that source: remove newtab_page_location_override when it is the original Comet home; remove matching string entries from session.startup_urls; if the resulting actual list is empty and restore_on_startup is4, set5; if matching homepage, remove it and set homepage_is_newtabpage=true. The URL predicate is exact valid **cryptographic scheme** (original helper tests https/wss, not all HTTP-family URLs), host perplexity.ai or www.perplexity.ai, path /b/home or /b/home/. Other hosts/paths, malformed/nonstring entries and other sources remain unchanged.

Theme settings/commands are removed by literal extension-ID keys in their actual dictionaries. Original extensions.pinned_extensions and extensions.toolbar lists remove only matching string IDs under the recovered theme condition. No extension ID validation or ownership-by-URL inference is invented.

## Real tracked preferences

Original4255868 rereads actual copied Preferences. If Secure Preferences exists it must read successfully, its real dictionary recursively merges into main Preferences, and its file is deleted (original ignored deletion result is retained). The original then removes dotted protection.macs and protection.super_mac. It removes **literal** dictionary keys prefs.tracked_preferences_reset, prefs.preference_reset_time and schedule_to_flush_to_disk: raw01ae39c0 is the literal sorted-dictionary key removal, not a dotted-path walker. Changing those to nested removals would change the supplied implementation.

The port calls actual `chrome_prefs::InitializePrefsFromMasterPrefs(target, merged_dict, nullptr)`, matching original7a1f094 and its explicit zero third argument. This uses genuine155 tracked-pref metadata/seed/write behavior; no manufactured MACs, secret key reuse, preference validation bypass or claimed successful initialization is added. Its true/false result is returned to the actual owner.

## Root integration and checks

Register these two new files with the actual native importer target; existing //base and //url are used, plus the real chrome_prefs factory implementation dependency/header. Root owns exact GN registration and focused object compilation. The profile owner may call these only in its genuine new-target WebUI flow; public extension mode1 stays unchanged. Encrypted gate/read/restore, original Arc augmentation, profile image/metadata and activation are not replaced by this module.

`python3 verify.py` checks raw original ranges/literals/retained REA/source hashes, exact155 API pins, output hashes and one two-new-file disposable patch replay. No worker, directory-copy fixture, JSON/profile operation, database, browser, credential/key provider, Keychain, OS grant, build or shared-native edit was performed. This proposal is uncompiled/unmounted until root integrates it; source checks are not import acceptance.
