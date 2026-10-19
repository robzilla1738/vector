# About, preferences and experimental eligibility audit

2026-10-19. Static pinned Agent/Vault1.26.1016.1852 and supplied daemon source audit, with current Aux native proposals. No UI changes, source execution, browser launch, network, owner profile, Keychain or OS-grant access. `provided-preferences-inputs.json` records all33 declared preference methods, literal-reference counts across both pinned UI packages, ten referenced files and seven targeted flow-source records with exact offsets/counts/hashes. This is source compatibility evidence, not native acceptance.

## Real versions and update results

There is no `getAppInfo`/`AppInfo` method in this native preference schema or its current handler. Do not introduce one to manufacture a product version.

`general-3dgRbrRk.js` About component `ag` queries `getBrowserVersion()` as a **string**. Formatter `Sl` adds a leading `v` unless already present (or `dev`); it imposes no `1.0.x` version schema. The native `version_info::GetVersionNumber()` result is therefore correct: actual build version, currently `chrome/VERSION`155.0.8059.85. No shipped source-product version should be substituted. `strip-markdown-DRcmtuJc.js` also uses this value as `appVersion` in its actual application context. No additional channel field is consumed here.

About's `ig` formatter reads an optional update `message`, otherwise switches on `status`. It understands `disabled`, `disabled_by_admin`, `updated`, `nearly_updated`, several failure states, permission required and updating states. Native currently returns `status:"local"`, which silently falls through to the version alone. The narrow proposal at `docs/integration/proposed/native-about-results/` changes that to **disabled** with a message containing the actual Chromium version and explaining that updates are disabled for this local build. It performs no update request and does not invent an up-to-date success. The existing `version` property remains actual native version data; the current consumer does not require it in the update object.

About separately queries `/health` every30 seconds with a two-second timeout, reading only string `version` and `startedAt`. It compares that daemon version with the extension manifest's actual `version_name ?? version`; a real mismatch produces the original restart warning. The pinned supplied daemon adapter declares1.26.1016.1852, matching the pinned UI version. The separately staged runtime distribution1.26.1019.335 is **not** the daemon or browser version and must not be returned by these APIs to make values agree. Keep any actual mismatch visible.

`update-banner-C_z-hMCt.js` uses the same browser-version string against release metadata's `minVersion`, plus the actual extension version against `minBackgroundServiceVersion`. It does not require the old product version shape. The existing local hosted-service boundary remains in force; this audit neither enables releases nor changes the banner's source behavior.

## Preference results and first-launch checks

| Actual native result | Pinned UI expectation / finding |
| --- | --- |
| `getBrowserVersion` string | Correct actual-build scalar. No invented app/channel metadata needed. |
| `checkForUpdates` object | Corrected by this proposal to supported `disabled` status and truthful message. |
| `getDefaultBrowserState` / `setAsDefaultBrowser` | Onboarding `done` reads `isDefault` and `canSet` before requesting a change. Existing preference-results proposal supplies actual eligibility/policy state. |
| `getDockState` / `addToDock` | Same actor reads `isAdded` and `canAdd`. Existing separate Dock proposal provides observed/read-error eligibility; this audit does not invoke the OS action. |
| `getSearchEngines` | Existing proposal fixes `searchEngines` and actual default ID, preserving real TemplateURLService data. |
| `getLanguageSettings` / `getSupportedLanguages` | Existing proposal supplies actual `spellCheckSupported`, localized `displayName` and `nativeDisplayName`; no new correction from this audit. |
| `getKeepTasksRunningState`, `setKeepTasksRunningEnabled`, `getSyncStatus` | No literal consumer in either pinned UI package, including backgrounds. Do not invent UI flows or extra result fields on that basis. This is bounded literal evidence, not proof against future/dynamic callers. |
| Appearance/zoom/AutoPiP/bookmark methods | Existing scalar enum/boolean/factor calls match current handlers at the result-shape boundary. Runtime appearance, policy and native effects remain separate acceptance work. |

The complete method inventory is retained in the JSON rather than claiming all33 methods are behaviorally accepted. Earlier search/language/default/Dock proposals are prerequisites; matching properties alone do not prove their OS effects.

## Actual experimental/canary checks

The settings experimental route's `beforeLoad` queries `analytics.isExperimentalEligible({accountId: actual route ID})`; a false result redirects to general settings. It does not ask a native AppInfo/channel API. The supplied daemon's actual account helper passes `isCanary:false`, checks the account email's internal suffix and otherwise asks its real experimental feature flag. The generic helper can accept a canary flag, but this account caller explicitly does not use one. The packaged variant remains the real stable variant. Do not label Aux canary or fake an internal email/feature flag to expose this route. The root adapter disables telemetry; that is not evidence that remote experimental flags are available or true.

Inside `experimental-Xq3YsEPK.js`, the live-tab pane additionally requires the account email's internal suffix. Its query availability check is the actual presence of `chrome.tabs.query` and `customElements.get("webview")`. The actor creates the real `webview`, calls `attachTab(tabId)` and handles attach failure/detach/removal; there is no native `supportsWebview:true` field to fabricate. Root's separate experimental webview proposal leaves Chromium `AttachUnownedInnerWebContents` disabled and reports unavailability while disabled. A registered element alone cannot establish successful attachment. Keep these gates and original fallback intact.

The original experimental warning mentions internal users/canary builds, but the actual pinned account caller above is the effective eligibility contract. Changing that warning or granting eligibility would be a product behavior change, not a version compatibility fix.

## Verification and integration

The one-file About patch has one counted replacement against the output of `native-provided-preference-results`. `git apply --check` and isolated replay pass; replay bytes match the declared output hash. All literal consumer files and flow anchors were checked against the UI source hash inventory before reading. No supplied JavaScript was imported or executed. Native compilation and disposable About/onboarding/eligibility observation remain pending. Apply only this proposal after the existing preference-results patch; no schema, registration, GN, UI layout or capability enablement edits are required.
