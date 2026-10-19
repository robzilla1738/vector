# Native omnibox bridge

Status: ready for lifecycle/signatures and upstream autocomplete behavior; dynamic object field contracts below are Aux design decisions pending target-version runtime confirmation. Source N5 plus N1 in `../provenance.md`. The source declares 29 functions and 19 events. Evidence is static, not a runtime capture.

## O1. Ownership and autocomplete

`chrome.auxOmnibox` owns a per-profile, per-calling-WebContents session around Chromium's real AutocompleteController. A session is opaque, unguessable and invalidated when its owner closes. Never synthesize search results by scraping a search website or replacing native history ranking with extension-local history. The native result list includes search suggestions, navigable URLs, history/bookmarks, open-tab switching and keyword actions as supplied by the upstream controller.

Every session operation checks existence, owner and profile. Query revisions suppress older asynchronous results after a newer query. The UI listens before issuing a query, renders incremental results, and stops the controller on blur/abandonment. A cleared result emits an empty result. Keyboard selection and result activation refer to the current result revision so deleted/stale matches cannot open another row unexpectedly.

Aux contract decisions, required for independently coordinated browser and extension implementations:

- Session creation returns `{sessionId: string}`. Creation options may identify the surface (`newtab` or `sidepanel`) and initial text; unknown options fail validation.
- Autocomplete result event body is `{revision: integer, input: string, done: boolean, matches: Match[]}`. A Match has stable `id`, `index`, `title`, `description`, `destinationUrl`, `fillIntoEdit`, `type`, `isSearch`, `deletable`, optional `tabId`, and optional `faviconUrl`. Display text is plain data, never trusted markup.
- Selection is `{revision, index, actionIndex?}`; opening requests additionally accept `disposition` (`currentTab`, `newForegroundTab`, `newBackgroundTab`, `newWindow`). Reject out-of-range indexes/revisions. Standard navigation modifiers map to disposition.
- Input state contains `text`, `focused`, `selectionStart`, `selectionEnd`, selected keyword when present, active model/tool modes and context chip summaries. File context contains opaque `contextToken`, display `name`, MIME `type`, byte `size`, and loading/ready/error state. Tab context also includes a `tabId`.

These are explicitly new Aux shapes, not claims about exact reference wire property names. They form a ready independent implementation contract. If parity evidence later changes behavior, coordinate contract edits through the integrator.

## O2. All 29 functions

`S` below means the owned `sessionId` string. A missing result means promise<void>.

| Function | Inputs | Result/effect |
| --- | --- | --- |
| `createSession` | optional options object | session object; create controller and subscribe native observers |
| `destroySession` | S | cancel requests, remove observers and release all session contexts |
| `getSearchEngines` | none | engines/current-default object from TemplateURLService |
| `onFocusChanged` | S, focused boolean | update focus, begin/end appropriate native suggestion lifecycle |
| `queryAutocomplete` | S, input string, optional options | start native query; emit results asynchronously; options include `preventInlineAutocomplete` and zero-prefix context as Aux-defined flags |
| `stopAutocomplete` | S, clearResult boolean | stop pending controller work, optionally discard current list |
| `openAutocompleteMatch` | S, request object | activate validated current match with disposition |
| `setPopupSelection` | S, selection object | update selected row/action and emit selection state |
| `openPopupSelection` | S, request object | open current validated selection |
| `onNavigationLikely` | S, request object | notify upstream predictor for likely match; no committed navigation |
| `deleteAutocompleteMatch` | S, request object | invoke provider deletion only if match supports it, then refresh results |
| `activateKeyword` | S, request object | enter the selected provider keyword scope |
| `executeAction` | S, request object | execute a native action associated with the current match |
| `onThumbnailRemoved` | S | clear image thumbnail/context and notify input state |
| `getPlaceholderConfig` | S | placeholder configuration object using original Aux copy and active provider |
| `getRecentTabs` | S | recent tab summary object scoped to accessible profile tabs |
| `getTabPreview` | S, integer tabId | preview metadata/thumbnail object for an accessible tab |
| `getInputState` | S | current input and context state object |
| `notifySessionStarted` | S | record interaction began; local analytics only |
| `notifySessionAbandoned` | S | mark no committed query, stop outstanding suggestion work |
| `addFileContext` | S, request object | new file-context object; validate file access and type/size at boundary |
| `addTabContext` | S, integer tabId, optional delayUpload boolean | tab-context object; no implicit external upload in local mode |
| `deleteContext` | S, contextToken string, optional fromAutomaticChip boolean | remove precisely that attachment and refresh chip state |
| `clearFiles` | S, shouldBlockAutoSuggestedTabs boolean | clear attached file contexts and optionally suppress automatic tab chips |
| `submitQuery` | S, request object | navigate a web search or dispatch Aux agent input according to active mode |
| `openLensSearch` | S | open upstream visual-search flow when eligible; unsupported state returns clear failure |
| `setActiveToolMode` | S, toolMode string | change contextual tool mode; observed categories are image, file and browser-tab context |
| `setActiveModelMode` | S, modelMode string | change available model mode; local provider choice must not invoke hidden cloud services |
| `activateMetricsFunnel` | S, funnelName string | local-only metrics state; no network analytics |

Exact upstream visual/model mode strings are not copied into Aux APIs. Use Aux-owned enums `image`, `file`, `tab` for tool modes and provider/model IDs from daemon contracts for agent modes. Search-only mode uses the native default engine. Reference-only cloud generation modes remain hidden; calls return unsupported rather than pretending success.

## O3. All 19 events

Every event carries S first; all except `onTabStripChanged` carry a second JSON object. Dispatch only to the session's owner. Aux event payloads use typed objects from O1 rather than unrestricted arbitrary objects.

| Event | Trigger and payload meaning |
| --- | --- |
| `onAutocompleteResultChanged` | native matches/revision/done state changed |
| `onSelectionUpdated` | selected row/action updated |
| `onStepSelection` | native keyboard handler requests a selection move; direction/step count |
| `onOpenCurrentSelection` | native keyboard handler requests activation with disposition |
| `onAimButtonVisibilityChanged` | AI-action affordance visibility changed; boolean visible |
| `onKeywordSelectedChanged` | keyword scope entered/exited |
| `onInputTextChanged` | native input text or selection changed |
| `onThumbnailChanged` | thumbnail URL/state changed |
| `onContextualInputStatusChanged` | context preparation/loading/error state changed |
| `onTabStripChanged` | accessible tab list changed; caller may refresh |
| `onInputStateChanged` | complete input-state snapshot changed |
| `onFileContextAdded` | a file context was accepted; new context summary |
| `onAutoSuggestedTabContextChanged` | automatic tab-chip recommendations changed |
| `onLensSearchEligibilityChanged` | upstream visual search availability changed |
| `onContentSharingPolicyChanged` | effective profile sharing policy changed |
| `onAimEligibilityChanged` | AI search affordance eligibility changed |
| `onShowAiModePrefChanged` | AI mode visibility preference changed |
| `onSmartTabSharingActiveChanged` | automatic tab context mode changed |
| `onSessionInvalidated` | owning session no longer usable; reason code; UI destroys stale controller state |

AI-affordance event method spellings are retained as generic public API descriptions; do not reproduce reference internal constants or remote services. Local unsupported capabilities emit disabled state consistently. No fake external upload, cloud completion or eligibility success is allowed.

## O4. Failures and verification

Bad session/profile, stale revision, unavailable tab, deleted match, unsupported action, disallowed file and denied sharing policy fail without navigation or attachment changes. A fresh query after a rejected query remains usable. Omnibox UI must recover from invalidation by creating a new session. Verify native history/bookmark/open-tab results, keyboard arrows/Enter/Escape, tab switching, search engine changes, stale-result rejection, deletion and attachment clear. No runtime acceptance was performed here.
