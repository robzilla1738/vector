# Private native API behavior audit

The static provided IDLs and current Aux schemas have matching method inventories and parameter counts across seven namespaces (96 methods). This is an inventory check, not proof of result or behavior compatibility. `vendor/provided/audit-private-api-shapes.py` records complete original/current signatures and input hashes. The Agent/Vault target remains1.26.1016.1852; older IDLs may omit newer optional methods used by that UI.

The actual supplied UI uses typed browser preference methods, not arbitrary `aside.browser.*` native preference paths. Native `aux.browser.*` paths are implementation details behind those methods. UI `aside.browserColorScheme` / `aside.browserTabStyle` are extension-local cache keys, already isolated through the Aux extension identity; changing them to native path names would break the cache contract. No blanket lowercase preference rewrite is appropriate.

## Confirmed result mismatches and staged corrections

`proposed/native-provided-preference-results.patch` changes only the native preference implementation; the original UI remains intact. SourceSHA2567e8da6b8804bea12f7e0c3af155ac760379d67ac0428a457d1ae98d0cd1ed398; proposed outputSHA256be9d40abdad48ebd5abbe8ac2876ad97d2b21f23804787eeba86652fa6497dcb. Exact replacement counts and hashes are in the adjacent JSON. C++ is uncompiled/unrun.

- `getSearchEngines`: native returned `engines`; supplied general settings reads `searchEngines`, then updates that array. Rename the result property; actual TemplateURLService rows/default identity and selection remain unchanged.
- `getSupportedLanguages`: native returned `{code,name}`; supplied settings immediately calls `displayName.toLowerCase()` and `nativeDisplayName.toLowerCase()` during language deduplication. Return real localized/native language display names from Chromium l10n for each actual language code.
- `getLanguageSettings`: native omitted `spellCheckSupported`; supplied UI disables its toggle and announces unavailable when absent. Derive support from the actual platform spellchecker and an exact case-insensitive match between preferred languages and platform-supported Chromium language codes. No fabricated supported flag or OS query in fixtures. Selected unsupported languages remain unavailable.
- `getDefaultBrowserState` / `setAsDefaultBrowser`: native omitted `canSet`; supplied onboarding skips the action and settings disables its button. Return real `CanSetAsDefaultBrowser()` combined with the actual managed disabling preference, plus `policyDisabled`; enforce the same guard before the actual worker setter. Actual OS action still requires the existing explicit user choice. The patch does not invoke it.

## Remaining reviewed boundaries and gaps

- `getDockState`: current native returns `{inDock,known}`; supplied onboarding reads `{isAdded,canAdd}`. This remains a confirmed gap pending a capability derivation for actual platform/Dock eligibility; do not blindly set canAdd true or invoke the Dock action to probe it.
- Account fields/route/security and signing changes are in the earlier staged profile proposal. The supplied current-profile bridge depends on the real registry and original identity carrier. Those remain prerequisites for any loaded API acceptance.
- Mini popup uses scalar booleans/shortcut strings, state strings and two numeric dimensions; current schema and handler agree with the supplied IDL at that boundary. Original entrypoint URL edits are already staged. Actual options-window ownership/communication and layout are not proven by matching method names.
- Notification permission methods accept tabId/origin and return booleans as the real supplied handlers expect; actual permission behavior remains untested.
- Browser import/adblock/omnibox expose several object/any results. The full schema inventory records them without claiming those free-form payloads equivalent. Their actual source consumer/native result field review is still required; existing independent implementations are not automatically accepted merely because names match.
- Newer optional browser shortcut APIs are feature-detected and not present in the supplied older IDL/current native schema; preserve original fallback to the actual mini-popup shortcut API rather than installing no-op methods.

Validation: static IDL inventory and all method arities match, focused staged patch applies to disposable source copies and output hashes match. No native checkout mutation, build, app launch, owner profile/data, Keychain access, OS grant/default browser/Dock action or network occurred. This slice fixes demonstrated core UI result failures in a reviewable proposal; it does not establish full API or visual parity.
