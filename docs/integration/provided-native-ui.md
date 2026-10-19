# Supplied UI / native binding contract

2026-10-19. Static compatibility audit, not runtime or visual acceptance. Reuse policy: `docs/plans/2026-10-19-supplied-implementation-reuse.md`.

The source roots are the static installed `AsideAgentManager/1.26.1016.1852` and `AsidePasswordManager/1.26.1016.1852` packages under `~/Library/Application Support/Aside/`. No account, profile or credential files were read. `provided-native-ui-anchors.json` pins each altered input and resulting identity transform with SHA-256 and replayable exact-count anchors. The Agent/Vault manifest hashes are respectively `afa06a5fc5b0ca836413f8b7b8eae20d440dff502b1871b0cdb489a04d244570` and `440e83e27c6576af3c19877ddcff224b731c09bd4069399832215e25074f804b`.

## Staging hook

Import `transformProvidedNativeUi` from `vendor/provided/native-ui-compat.mjs` and pass it as `stageProvidedUi({transformText})`. It returns `{text,anchors}`. Each anchor is `{kind,find,replace,count}` and is replayed sequentially against the pinned source by the UI stager. It performs no I/O, adds no browser API shim, changes no style declarations or layout/rendering implementation, and must run **before** the stager's normal product branding/extension-identity pass.

`node --test vendor/provided/native-ui-compat.test.mjs` checks exact replay and preservation of HTML/CSS geometry, unrelated numeric literals, wire fields and third-party identities. `node vendor/provided/audit-native-ui.mjs <pinned-agent-root> <pinned-vault-root>` reproduces the static inventory. Current result: Agent40 / Vault9 changed text files; Agent114 / Vault30 sequential anchors. This excludes the separate default product-branding/assets/peer-ID pass. No UI/browser launch was performed for this slice.

## Real API mappings

| Supplied namespace | Existing Aux namespace | Current native permission |
| --- | --- | --- |
| chrome.asideAccount | chrome.auxAccount | dev.aux.ext.private.account |
| chrome.asideAdblock | chrome.auxAdblock | dev.aux.ext.private.adblock |
| chrome.asideBrowserImport | chrome.auxBrowserImport | dev.aux.ext.private.browserImport |
| chrome.asideBrowserPreferences | chrome.auxBrowserPreferences | dev.aux.ext.private.browserPreferences |
| chrome.asideMiniPopup | chrome.auxMiniPopup | dev.aux.ext.private.miniPopup |
| chrome.asideNotification | chrome.auxNotification | dev.aux.ext.private.notification |
| chrome.asideOmnibox | chrome.auxOmnibox | dev.aux.ext.private.omnibox |

Inventories were compared with supplied `native-fork/idl/idl-aside*.json` and current `chrome/common/extensions/api/aux_*.json`. Exported function/event **names** match these seven namespaces, but Aux schemas frequently use `any` where supplied IDLs define structures. Matching names do not establish behavioral compatibility.

The original manifest's `pref-get-set` and `browser-import` permission suffixes are not the current native names; exact suffix adaptations are required. The supplied Agent calls MiniPopup methods but has no distinct MiniPopup permission; the hook adds the actual current native permission to Agent's manifest only. Vault gets no new capability.

`chrome.asideAccount.setProfileAccount` is only a `typeof ... === 'function'` strict-binding feature detector in both backgrounds. There is no invocation. `onProfileContextChanged` listeners are optional-chained. Neither appears in the provided Account IDL or current Aux schema. Do not add a no-op method/event. Real context payload/invalidation must be integrated instead.

## Isolated identities and preserved internal wires

- `AsideDaemonSessionToken` becomes `AuxDaemonSessionToken`; CDP `AsideSessionToken` becomes `AuxSessionToken`. Exact quoted `Aside.<method>` protocol literals become `Aux.<method>`. The matching supplied-runtime lane confirms corresponding capitalized wire changes. This is not evidence that every native custom CDP method exists.
- Production loopback daemon URL21420 becomes21520. Original21421 is a **DEV-only daemon fallback**, mapped21521; it is not a discovered production bridge service. Unrelated OAuth1455, Ollama11434, LM Studio1234, Figma3845 and devserver5175 remain unchanged. Native CDP is isolated45203 separately.
- Page-realm Google Docs/passkey event names, `data-aside-*`, matching actor globals and UI-only `@browser-aside/` pubsub names receive explicit Aux identities. The supplied daemon has no `@browser-aside/` namespace (runtime-lane static audit).
- Lowercase `asideUserId`, `asideAuthCallback`, `asideModelCatalog`, `asideComponentVersion`, `aside:task`, `#aside-file:`/`#aside-routine:` and other schema/markdown wires remain compatible with the supplied runtime. Extension localStorage/IndexedDB are already isolated by new Aux extension origins. Custom element tag names such as `aside-inline-menu` remain unchanged with their matching query selectors. Do not blanket-replace lowercase `aside`, which is also real HTML vocabulary and shipped asset filenames.
- Agent old peer `clcdgiameigmljcbkkcbjiljinmfkncl` maps to Aux Vault through the UI stager; Agent old ID is `fjdhphbdlfjogobdofoaagnlnkoibdge`. `eiaeiblijfjekdanodkjadfinkhbfgcd` is **NordPass**, evidenced by `assets/password-import-menu-BuTmw0rs.js` and `assets/external-manager-DlstsZ6u.js`; leave it unchanged.

## Actual entrypoints and staged native patch

Original Agent entrypoints include `main.html`, `newtab.html`, `sidepanel.html`, `minipopup.html`, `minipopup-options.html`, `account-password.html`, `tabsearch.html`, `notification.html`, `iframe.html`, `visual-frame.html` and `tab-preview-player.html`. Vault uses `popup.html`, `iframe.html`, `offscreen.html`. Agent's manifest already routes new tabs to `newtab.html` and side panel to `sidepanel.html`; Vault action is `popup.html`. Preserve these HTML and boot modules.

`assets/extension-main-Dz1-AsCT.js` mounts the hash router. It has `/auth/sign-in`, `/auth/sign-up`, `/auth/recovery`, `/onboarding/splash`, `/onboarding/ai`, etc.; **no `/unlock` route**. Root `/` resolves minipopup/sidepanel filename context or redirects to real auth. Account workspace routes use `/u/$userId/...`, including `/u/$userId/minipopup`.

`proposed/native-provided-entrypoints.patch` is staged only, with exact original file hashes/counts in the adjacent JSON. It changes native newtab preload to `newtab.html`, bootstrap to `main.html#/` (letting the original router decide flow), mini popup to actual entrypoints, and fixes the remaining original Agent ID in `chrome/browser/ui/aux_ntp_url.h`. It changes no window geometry. Root owns application/build of the patch after the current native build.

`minipopup-options.html` is static markup/CSS without a boot script; original native menu/interaction support still needs observation. Merely loading that file does not prove a functioning options menu. The independent native passkey broker's `Vault/index.html#/passkeys/<id>` is absent from the supplied Vault and must not be reported as supported by redirecting to popup.html.

## Unresolved required manifest capabilities

All three are in Agent's **required `permissions`**, not `optional_permissions`. Their consumers remain intact and use Aux identifiers. Current native `_permission_features.json`, `_api_features.json`, permission registration and seven Aux API implementations have no equivalent registration. They are explicit parity blockers, not permission-removal candidates.

| Aux permission | Pinned consumer / actual contract | Current equivalent / gap |
| --- | --- | --- |
| dev.aux.blink.expose-wv | assets/experimental-Xq3YsEPK.js creates `document.createElement("webview")`, appends it, calls `attachTab(tabId):Promise`, handles `detached`, removes it on cleanup. Internal/canary Experimental settings surface. | No current Aux Blink webview expose/attachTab implementation found in targeted native sources. Ordinary extension webview permission is not proof of this custom tab-attachment API. |
| dev.aux.ext.private.capture-tab-without-userinteraction | background.js `Fg(windowId?)` calls `chrome.tabs.captureVisibleTab(windowId?,{format:"png"})`, retries only MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND. | Standard capture API exists; custom bypass of user-interaction gating is unregistered. Preserve normal Chromium authorization; do not claim background capture parity. |
| dev.aux.ext.private.launch-extension | assets/tabsearch-3k_2hgil.js extension selection: apps use management.launchApp(id); other extensions feature-detect management.launchExtension(id), otherwise open chrome-extension://id/. | Custom launchExtension absent. Existing source fallback stays; registering a permission alone cannot implement launching the supplied extension surface. |

Provided `native-fork/NATIVE-FORK.md:79` confirms these original private permissions; supplied named-functions/string-xref indexes did not expose a directly reusable implementation under these exact strings. Further static native reconstruction can use authorized supplied material; no patch inventing the implementation is included here.

## Account / gate integration blocker

Current independent native `profile_state.cc` reads list-shaped `profileBindings` and `u/<id>/security-state.json`; supplied daemon does not use those shapes. Required real supplied state:

- `accounts.json` has `profileAccountBindings` object for local profile→account binding, separate cloud `profileBindings` object, `localBootstraps` plural, and account `onboardingCompletedAt:string|null`.
- Native context must consistently identify actual Chromium profile/path/index and mode. Supplied UI chooses `chromiumProfileId ?? profileId`; bindingVersion>=1 with localOnly/no bound user resolves a local account through actual `accounts.ensureProfileAccount`, which returns the account row directly.
- Supplied Vault registry is `password-manager/accounts.json`; encrypted DB is per PWM UUID. Unlocked state must come from authenticated `passwordManager.auth.status`, not masterkey-file presence or synthetic security-state JSON. API accepts numeric accountId and optional PWM UUID/profileId; status reports isInitialized/isLocked/requiresPasswordVerification/expiry.
- Original hosted onboarding completion calls a cloud endpoint. Local anonymous account creation is real, but a successful cloud completion cannot be fabricated or used as the sole independent local gate. The original native local-mode gating requires investigation and must remain an explicit readiness gap.

No owner profile read, owner daemon connection, Keychain/grant access, native edit/build or real notification/capture was performed. The compatibility hook and static anchors are ready for integration; packaged UI fidelity/native behavior remain unverified.
