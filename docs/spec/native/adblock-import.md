# Native filtering and browser import

Status: ready for filtering contracts/limits and importer lifecycle; import source/progress payloads are new Aux contracts as identified below. Sources N1, N6, N7 in `provenance-sp3.md`. Static evidence only; no source-profile access or runtime import was performed.

## F1. Filtering architecture and constraints

Filtering occurs in the native request path and a renderer observer, not an extension declarative rule approximation. The service evaluates resource and document requests, exceptions, redirect/rewrite actions and cosmetic/procedural rules. Native document blocking displays an Aux-authored interstitial with back and single-navigation bypass actions. Bypass applies only to that pending navigation in that tab; it must not disable filtering globally or persist a general site exception.

Use at most 64 subscriptions. User rules are UTF-8, at most 4 MiB and contain no NUL bytes. Subscription URLs must use HTTPS, have no embedded credentials or fragment and must not resolve to loopback/private/reserved addresses. Recheck redirects and resolution before each fetch, including IPv6. Persist subscriptions, enabled state, user rules and cached source data under the Aux profile. Conditional requests use ETag and Last-Modified. Failed updates retain the previous working engine and surface an error. Compile into a new generation, activate only the latest requested generation, and never install a superseded compile result. Expose requested/active generation separately.

A subscription moves through idle → queued → downloading → compiling, ending idle or error. Each update-job item moves through queued/downloading/compiling to updated/unchanged/failed. The job ends succeeded, partiallyFailed or failed according to item outcomes. An unchanged response updates the successful-check timestamp without pretending content changed. Download/parse/compile errors include source diagnostics and invalid lines without discarding valid installed state.

## F2. All 14 filtering methods

Namespace `chrome.auxAdblock`. All methods are asynchronous; no events are declared, so update screens poll job state.

| Method | Inputs | Output/effect |
| --- | --- | --- |
| `getState` | none | filtering state |
| `setEnabled` | enabled boolean | resulting filtering state; updates native request path |
| `getSubscriptions` | none | subscription array |
| `addSubscription` | `{url: string, name?: string}` | `{subscription, updateJobId}`; validate limits/URL before insertion |
| `setSubscriptionEnabled` | id string, enabled boolean | resulting subscription, schedule engine generation |
| `removeSubscription` | id string | void; remove persistent source and rebuild |
| `startSubscriptionUpdate` | optional `{ids?: string[]}` | update job; omitted IDs mean all sources |
| `getSubscriptionUpdateProgress` | jobId string | current update job |
| `getCustomRules` | none | custom-rule state |
| `saveCustomRules` | `{rules: string}` | custom-rule state including pending text during compile |
| `testRequest` | `{url, initiator, requestType, method?, thirdParty}` | decision, rule/exception and source details; no real network request |
| `getDiagnostics` | none | detailed state, sources, paths, caches and engines |
| `reloadManualFilters` | none | diagnostics after rereading the manual-filter directory |
| `clearEngineCache` | none | void; invalidate compiled cache without deleting subscriptions/rules |

## F3. Data shapes

- Filtering state: booleans `available`, `enabled`, `stateLoaded`, `compiling`, `networkAvailable`, `manualFiltersAvailable`; numeric `requestedGeneration`, `activeGeneration`; string `lastCompileError`; string-array `activeUpdateJobIds`.
- Subscription: strings `id`, `name`, `url`, `status`, `etag`, `lastModifiedHeader`, `digest`, `lastError`; boolean `enabled`; integer counts `networkRuleCount`, `cosmeticRuleCount`, `parseErrorCount`, `consecutiveFailures`; `invalidLines: string[]`; numeric `contentSize`, `lastAttemptMs`, `lastSuccessfulCheckMs`, `lastContentChangeMs`, `lastEngineActivationMs`, `nextUpdateMs`.
- Custom rules: text `rules`, optional `pendingRules`; numeric byte `contentSize`; integer network/cosmetic/parse-error counts and invalid-line array.
- Update job: `jobId`, job `status`, numeric `createdAtMs`, `completedAtMs`, integer `total`, `completed`; `items` containing `subscriptionId`, item `status`, string `error`.
- Test decision: booleans `shouldBlock`, `important`, `hasFilter`, `hasException`; strings `filter`, `exception`, `redirect`, `rewrittenUrl`, `sourceId`; integer `sourceLine`.
- Request types: script, image, stylesheet, xmlhttprequest, document, subdocument, websocket, font, media, object, ping, other. Optional method is a standard HTTP method; absent means native default request semantics.
- Diagnostics add numeric `lastCompileDurationMs`, `lastEngineInstallTime`, string `dataDirectory`, `cacheDirectory`, `manualFilterDirectory`, `manualFilterError`, subscription array, custom rules and engine array. Engine fields: kind (`default`/`additional`), `cacheHit`, `flatbufferSize`, `compiledRegexCount`, `regexesTruncated`, source summaries and regex diagnostics. Source summaries contain title/homepage and rule counts/errors. Regex entries have numeric id/usageCount, string regex and boolean compiled.

## F4. Cosmetics, procedural rules and internals

For each top-level/subframe document, request applicable cosmetic resources from the browser. Inject Aux-authored renderer logic for static hide selectors and procedural matching. Apply hide styles with sufficient priority to hide matched elements, observe DOM changes and retry bounded procedural work. Suspend mutation work on pagehide/frozen state and resume when shown. Isolate script state from page-defined globals and validate messages crossing renderer/browser boundaries.

Supported procedural behavior includes selector/text/attribute/computed-style matching and safe bounded traversal. Exact full operator whitelist and scriptlet inventory remain draft: source map establishes these categories but this lane did not verify every operator. Builders must choose an independently licensed filtering engine and document supported syntax; cannot claim full procedural parity from simple CSS hiding.

`aux://adblock-internals` is an independently authored native WebUI. It displays enabled/load/compile/generation state, subscription rows and progress/errors, custom-rule editor, manual-filter reload, cache clear, diagnostics and request test. Actions call the same native service as extension APIs. Invalid input stays editable; failures do not falsely show success.

## I1. Import API: four methods and one event

Namespace `chrome.auxBrowserImport`:

- `getImportSources()` resolves an array of source objects.
- `startImport(options)` resolves a job object after validating the selected source/profile and requested categories.
- `getImportProgress(jobId: string)` resolves a progress object.
- `cancelImport(jobId: string)` resolves void and stops future work at a safe boundary.
- Event `onImportProgress(progress)` reports state changes to the initiating profile/extension.

Source IDL leaves all these objects open. Aux chooses these explicit new contracts: source `{id, name, installed, profiles: [{id, name}]}`; options `{sourceId, sourceProfileId?, categories: string[], safariArchive?}`; job/progress `{jobId, sourceId, status, completed, total, category?, error?}` with status queued/running/succeeded/failed/cancelled. Safari archive carries optional `fileName` and binary `data`; enforce size/type limits independently. These are Aux decisions, not recovered exact reference payloads. Category names are `bookmarks`, `history`, `passwords`, `cookies`, `extensions`, `preferences`.

## I2. Native migrators and WebUI

Provide `aux://import-data` with installed browser selection, profile chooser, category selection, progress and result/retry. Source families: Chrome, Brave, Arc, Dia, Atlas, Comet, Helium, Edge, Firefox and Safari export ZIP. Installed detection uses application identity and known data locations; display names alone do not authorize arbitrary filesystem access.

Chromium-family import reads a safe snapshot of source databases/preferences. It imports bookmark roots (bar/other/mobile), URL/title/visit/typed counts and actual historical visit times, supported preferences, extension install metadata and profile identity. Arc pinned/bookmark data is merged into the corresponding Aux sections. Never copy a whole source browser profile as a substitute for a migrator. Do not overwrite target credential state or profile lock files.

Passwords and cookies use the source browser's Safe Storage credential with the platform's real permission flow; missing or denied key access reports that category failure. Do not silently claim encrypted values imported, bypass the system prompt or log decrypted values. Firefox import handles places and cookies SQLite schemas, validates required columns and preserves cookie expiry/host/security attributes. Safari imports from an explicitly selected export ZIP after safe archive-path validation, shows a useful invalid-file state, and uses user-granted file access.

Cancellation prevents new category work and leaves an honest partial-result summary. Unsupported categories and unavailable profiles are visible before starting. Input snapshots are read-only; rollback of a newly created target profile must verify it is the importer-owned new target. Real source profiles require owner permission; acceptance uses fixtures/disposable profiles.

## Acceptance

Filtering: block/allow exception, top-level interstitial single-use bypass, resource blocking, cosmetics after DOM mutation, procedural fixture, cache restart, failed update preserving active engine, invalid subscription URL rejection, custom-rule size rejection and diagnostics source attribution. Import: fixture profiles for every source family; verify bookmark hierarchy, titles and visit timestamps, encrypted-category refusal on denied key access, successful authorized secret import without logs, cancellation and malformed Safari archive. These checks are requirements, not completed tests.
