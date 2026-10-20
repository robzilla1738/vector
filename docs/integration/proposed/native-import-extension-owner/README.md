# Supplied current-profile extension import owner

Five-file incremental proposal against the actual importer sources captured in `manifest.json`: three existing files and two new destination-owner files. Root owns GN changes; the manifest lists the exact source/dependency additions. This does not change discovery, password/cookie readers, secret-store availability, bookmarks or the separate mode0 clone.

## Source selection

Original live worker `04253e58` calls `04259adc` then `04259ef0` and carries144-byte `{id,GURL}` rows to reply `04255660`. The first helper scans each immediate `Extensions/<id>/<version>/manifest.json` and collects IDs with a theme dictionary. The second reads **Secure Preferences**, iterates `extensions.settings` dictionaries and excludes those theme IDs plus entries whose embedded manifest has a theme dictionary. It does not require the source extension to be enabled.

For each remaining entry, a string `manifest.update_url` must parse as a valid GURL. If the field is absent or not a string, `from_webstore:true` admits an empty default GURL instead. An invalid explicit URL does not fall back to the webstore flag. No independent URL scheme filter, source state filter, invented extension format or copied CRX is added. The existing32MiB read/symlink boundary for native JSON is retained; it is an integration bound, not claimed original parsing behavior.

The parser runs within the existing all-source preparation transaction and returns only native memory. No extension installation happens until all selected source categories have prepared successfully. The destination queue starts before the existing destination category writes, matching the original reply's extension-owner-before-store-owner ordering.

## Destination and lifetime

Original `04258108` obtains PendingExtensionManager and calls `AddFromExtensionImport(id, update_url, predicate)` for each row. `002f29c0` is the exact always-true policy callback; it is not an installation result. Original `06ca04c8` independently contains the pending-manager source path and installed-extension rejection text and matches155's existing API. Policy/source priority and real download/installation remain the actual manager's responsibility.

Only accepted rows enter the imported-ID observer. If none are accepted, no observer or update request is created. Otherwise the observer subscribes to the real ExtensionRegistry and `ExtensionsBrowserClient::UpdateCheckIfEnabled` triggers the normal updater only when enabled. The proposed code defines this flow; this lane has not executed it.

The original observer's virtual slots and callbacks are pinned:

- `OnExtensionInstalled` (`0425f5a8`): for a matching imported ID/context, check `DISABLE_PERMISSIONS_INCREASE` (bit2), then use the actual registrar's `GrantPermissionsAndEnableExtension`. Other disable reasons are not cleared by this code.
- `OnExtensionReady` (`0425f2c0`): post `ReloadExtension` through the registrar's real WeakPtr, erase that ID, detach/delete the observer when every accepted ID has become ready. Native callback `0425f77c` calls `06c89848`; the latter passes mode1 to its reload owner, matching155's ordinary/noisy `ReloadExtension`, not quiet failure.
- `OnShutdown` (`0425f6cc`): detach and delete the observer. No invented timeout, cancellation success or failure completion is added.

**This observer is not an import-job completion barrier.** Original reply `04255660` invokes the extension owner and then the bookmark/history/secret owner without joining this observer. The proposal preserves that separation; a successful import job must not be described as proof that queued extensions installed successfully.

## Public full/partial scope

An explicit public `dataKinds:["bookmarks"]` skips this extension owner. Omitted dataKinds invokes it even if the currently available category list happens to contain only bookmarks; this is tracked as the actual request distinction, not inferred from category count. Firefox/Safari and the independently authored recovery WebUI keep their existing paths. Public mode1 remains the current profile; no new-target clone substitution occurs.

The added worker parameter defaults false for other existing call sites. Native helper data is not returned to extension RPC. The two source helpers, observer and original pending-manager/reload/grant callees are pinned by bounded instruction extracts; the three REA sessions are closed with retained snapshots.

## Integration and evidence

Apply the immutable patch with its exact source hashes or rebase its anchored hunks atop later L2/L4 importer changes without overwriting them. Add `extension_import.cc/.h` to the existing `aux_browser_import` source set; its already present `//extensions/browser` dependency owns the manager, registrar and registry headers. The manifest also records explicit `//extensions/common` for the extension header and `//url` for worker GURL parsing. No root/shared GN file was edited here.

Disposable `git apply --check` plus apply passed and all five resulting hashes matched. New-source quoted includes were checked against actual155 headers. Compilation, GN/dependency checking, actual updater/installation, source profile operations and UI acceptance remain pending. No owner source data, credentials, Keychain, OS grants, browser/helper runtime, build, signing or shared native write occurred.
