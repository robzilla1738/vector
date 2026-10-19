# Supplied omnibox and adblock object contracts

Pinned Agent1.26.1016.1852 source anchors/hashes are in provided-omnibox-adblock-consumers.json. The supplied renderer and styles are preserved. Matching JSON method names alone did not establish compatibility.

## Omnibox corrections staged

`proposed/native-provided-omnibox-results.patch` adapts actual owned AutocompleteController/session results and input fields:

- Original rows use contents, isSearchType and supportsDeletion. Native emitted title/isSearch/deletable. Add the original fields from actual match contents/type/deletion capability, preserving legacy fields for other native clients.
- Original selection uses line, with optional nested selection for openPopupSelection. Current native required invented revision/index inputs absent from original UI. Accept the actual original shape inside the same owned frame/document session; preserve explicit revision checking when present, reject conflicting index/line, bound the actual current result index and verify a supplied URL equals that result's destination before action. A no-URL keyboard selection refers to the current owned result, as the original contract intends; it cannot provide an untransmitted renderer revision proof.
- The original image actor sends fileName/mimeType/bytesBase64, omits size, and expects ok. Accept those names, derive actual decoded byte size, keep per-file/session bounds and validate a declared legacy size if present. Return ok only after the real native context is stored. No credential/model transcript transport is introduced.
- Return the exact Aux-private-namespace form of the original session-not-owned error, which the original UI recognizes to retire/recreate its session. This is separate from preserved Aside.* daemon command protocol names.

Not completed by this patch: full original action metadata/behavior, image/AI visual-search backend, tool/model mode meanings and remaining optional contextual-search payloads. Current native openLensSearch truthfully errors unavailable; storing a real file context does not claim a Lens search. Current action execution supports URL actions but may reject native non-URL actions. Modifier/mouse navigation and current-result races need original native follow-through and runtime verification. No synthetic action results, fake Lens provider or renderer replacement was added.

## Adblock review

Actual original privacy/recommended-filter consumers use real getState fields (including compiling and activeUpdateJobIds), subscription arrays/statuses, getCustomRules.rules, saveCustomRules({rules}), addSubscription({url,name})->subscription/updateJobId, startSubscriptionUpdate()->jobId and getSubscriptionUpdateProgress(jobId). Current native FilterService provides these shapes and performs actual compile/download work with public HTTPS validation and limits. No shape patch is justified for these reviewed core calls.

This does not establish full original adblock engine/filter semantics or every diagnostics field. The existing replacement engine must not be declared equivalent from UI call agreement. No filter URL was fetched or network API invoked in this audit. The original UI's polling and errors remain intact.

Validation: staged exact-count/source/output-SHA patch applies to disposable native source copies; output matches. No native build or source mutation occurred in the shared checkout; C++ remains uncompiled. No owner tab/history/profile, image, credentials, OS grants, network or actual navigation was accessed/performed. Loaded native UI behavior and fidelity remain unverified.
