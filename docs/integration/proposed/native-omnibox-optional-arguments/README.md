# Supplied omnibox optional arguments

The actual supplied new-tab asset calls `chrome.auxOmnibox.createSession()` without options. Both original supplied IDL and current Aux schema declare `options` optional. Chromium155 extension bindings normalize omitted optional positional arguments into `base::Value()` (NONE/null); they do not remove those positions. The upstream bindings test explicitly verifies `[]` becomes `[null]` for optional object/callback signatures.

The current native implementation rejects `[null]` as `Invalid session options`, explaining the observed new-tab retry loop before real native session initialization. This patch accepts NONE as absence and accesses options only when a dictionary is present. It makes the same correction for `queryAutocomplete` optional options and the two optional context booleans (`addTabContext.delayUpload`, `deleteContext.fromAutomaticChip`). Wrong concrete types still fail. Absent booleans retain their existing false default; omitted options retain the existing empty-object behavior.

All real `OwnedContextualSession` creation, frame/document/extension ownership, invalidation, query dispatch, native tab identity and context-token validation remain unchanged. The patch neither creates a fallback session nor claims the backend or auth will succeed after this parser error is removed. Original session options not already implemented remain outside this parsing correction.

Apply `native.patch` pinned to actual257 (the staged261 changes are disjoint). No GN changes or new native sources. Parent should compile the single existing aux_omnibox_api.cc object after composition; real disposable new-tab behavior still requires observation.

`python3 verify.py` checks exact source pins, original/current optional signatures, actual supplied no-options call, upstream binding normalization, and independently replays the exact patch. No native build, browser/daemon request, network or private-state access was performed.
