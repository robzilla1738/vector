# Explicit browser research — inactive source successor

This supplies an explicit **Research** toggle in the existing new-tab Ask toolbar. Choosing it checks the selected account/model/browser configuration; only submitting the existing editable composer starts search or inference. Default Search/Ask behavior and all CSS/assets stay unchanged. Missing configuration disables Research with the actual availability reason. This is a bounded browser-search excerpt summary, not autonomous multi-query/full-page research.

## Integration

- Apply `source/aux-research-ui.mjs::transformAuxResearchUi(text,path)` after the current feature/UI adaptations (including Remix/Ask as applicable). Two original Agent leaves change: `assets/session-composer-Dc0LRfZA.js` and `assets/ask-omnibox-panel-DkxXbN8c.js`.
- Apply `source/aux-research-daemon.mjs::transformAuxResearchDaemon(text)` **after the immutable async cache inspection transform**, separately to the ordinary source and independently projected dormant entry. Return is `{text,changes:[{find,replace,count:1}]}`; replay every counted edit and match `manifest.json` final hashes.
- Pin both adapter modules and their fixed sibling `research-runtime.js` / `research-ui.js` dependencies. `manifest.json.sourceFiles` records these dependencies. The resulting product bundles inline helper code and do not load a new external module.
- `manifest.json.daemonInputs` has exactly `source` and `entry` entries with `inputSha256` / `outputSha256`. The selected source base is `/private/tmp/aux-browser-features-async-daemon-20261023-a1/index.mjs` and its `projected-entry/aux-native-entry.mjs`. Do not apply this to the stage's older `apps/daemon` source or alter historical feature-base/async receipts. Root must reproduce the dormant projector equality and create a fresh coupled pair/package receipt.
- No native/schema/GN edits are required. The daemon router adds authenticated `sessions.researchCapability` and an optional strict `{kind:'web-search',query}` research field to the existing `sessions.createAndPrompt` input. Existing calls without that field retain their original path.

## Actual owners and source contracts

The original `sessions.createAndPrompt` creates the session through `createSession$1` and starts it through `GlobalAgentSessionServer.startRun`. The new explicit branch uses that same run owner. `Agent.runWithLifecycle` creates the actual abort signal, invokes `prepareRequest` before provider dispatch, delivers `processEvents` to the session's persistence/event listeners, and settles the run after its callback.

The research helper temporarily wraps **only this Agent instance's** `prepareRequest` and `processEvents`. The first preparation performs one `GoogleSearchClient.search(query,{limit:6})`; retries/repeated preparation reuse the same pending/result promise. It uses the actual session browser's `fetch`, including its `ensureNetworkAccess` hook, bound profile cookies and User-Agent. `withReplContext` carries the actual abort signal and tool-call ID through browser permission/CDP operations. Abort reaches the physical fetch/body reader. Shutdown/account changes cancel; callbacks and producer tracking are restored only after physical reader settlement. No global Agent method is changed.

The authenticated account guard is the already integrated `auxCreateProductivityAccountGuard`: account incarnation, owner epoch, profile/account binding, native owner assertion and auth-change cancellation. The session's actual browser bridge account/profile, browser window/anchor binding and selected model are checked before dispatch and publication. Existing explicit tab references retain the original `auxValidateReferenceMessages` boundary; Research does not attach another tab or upload a page implicitly.

Availability is based on actual `models(accountId).resolve(modelId,provider)` plus the original browser search implementation. The selected and resolved model must agree, and the Aux-funded provider refuses. This confirms configuration, not live network success: original site permissions, Google challenge/HTML parsing errors and provider errors remain actual failures, not fallback chat presented as research.

The supplied `createCoreToolset` also contains a legacy `createWebSearchTool` which uses `fetchAuxAPI('/search')`. This explicit research turn does **not** execute it. The returned request context contains only a clone of its original typed declaration; its executor can return the already observed records for the exact explicit query, and refuses changed queries. System tool declaration deltas remove other tools for that bounded research turn. Normal subsequent Ask turns retain the original toolset. No Aux-hosted search credit or fallback provider is selected by this implementation.

## Sources are observed records

The original `GoogleSearchClient` parses results with `parseGoogleSearchHtml`: actual URL/title/snippet/publication-text records. The helper accepts at most six safe HTTP(S) results, rejects embedded URL credentials and unsafe schemes, bounds text, and assigns fresh run-local source IDs. No usable records means no model request.

The actual invoked browser search is persisted using the original assistant tool-call / `toolResult` event schema, with `toolName:'websearch'` and `details.sources`. Both the original daemon `getCitationSources` and Agent `lm`/`Jn` functions read that exact field; the supplied `hm`/`mm` citation components link only IDs present in those observed records. The original Markdown and citation components/classes are unchanged. A successful final assistant message receives a deterministic **“Searched sources”** footer with those IDs. It does not claim every statement is verified or that snippets are full-page evidence. Model-authored unknown citation IDs do not become observed source links.

## Focused evidence and remaining gates

`check.mjs` replays counted transformations against the actual selected ordinary/dormant/UI sources and syntax-checks the composed JavaScript. Its tiny synthetic helper fixture checks one search across request retries, cached exact-query tool behavior, observed URL filtering/source footer, Aux-hosted refusal, physical reader settlement on cancellation, no late result persistence, and per-instance callback restoration. It imports no product module and makes no provider/network calls. `check-result.json` records the result.

This overlay is inactive. Actual native/profile admission, app interaction, Google challenge/network permissions, configured-provider request/citation quality and account-switch acceptance remain unverified. No app launch, provider call, signing, native build, accepted-app replacement or authority-policy change occurred.

Adjacent original scope: supplied `lasso-shortcuts-BVNCEenS.js` already provides the text-selection Summarize action using the original prompt dispatch. Existing Ask and @ tab/Space components provide explicit page/tab context. A dedicated page-summary/selected-tabs shortcut was not established by this bounded check; this slice does not claim those separate entry points complete.
