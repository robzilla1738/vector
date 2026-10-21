# Await the genuine search-engine owner before replying

Two-file incremental proposal against actual native563, preserving the Bookmarks key correction. No UI/resources, schema, GN or root manifest changes.

Supplied1852 general-3dgRbrRk.js calls getSearchEngines and disables its genuine selector when the returned searchEngines list is empty. Current Aux API invokes TemplateURLService::Load then immediately enumerates GetTemplateURLs. Actual155 Load starts asynchronous KeywordWebDataService loading; GetTemplateURLs simply enumerates current template_urls_, while GetDefaultSearchProvider can separately return pre-loading defaults. Therefore a cold service can produce an incomplete empty chooser response despite real engines being available when loading completes.

This is a necessary155 lifecycle adaptation, not a recovered original153 handler claim. Call the existing Load, preserve immediate response when already loaded (including synchronous loading), otherwise retain the extension request with RegisterOnLoadedCallback and reply only from the genuine loaded state. Existing engine replacement filtering, order, IDs, names, keywords and default selection are unchanged. The setter still operates on the actual loaded service and retains its errors.

The registration callback contract at template_url_service.h570..576 explicitly does not invoke a callback if already loaded; all checks and registration run on the UI sequence. No pending navigation, timeout, invented inventory or successful placeholder is introduced. OnBrowserContextShutdown removes the owned subscription and settles the pending request with an error before the actual context becomes null. Existing ExtensionFunction::Shutdown keeps this instance alive through cleanup; successful callback consumption releases the subscription before Respond. No observer survives into a retired profile.

Focused compile target: `//chrome/browser/extensions/api/aux_browser_preferences:aux_browser_preferences` (changed API object; header also exposed through existing headers target). Existing base/search-engine dependencies already provide CallbackListSubscription and the service callback; no new GN dependency.

`python3 verify.py` checks hashes, five exact counted anchors and disposable patch replay. Current155 callback/loading/shutdown contracts are hash-pinned in source-evidence.json. No shared native edits/build, browser/provider/AI/profile/credential/Keychain/signing operations occurred. Integrator should compile and observe the normal Settings search selector; no broad tests are requested.
