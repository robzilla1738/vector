# Supplied site-notification permission contract

Source-only followup against actual native v409. Not applied or compiled by this lane. No browser/daemon, permission prompt, notification, OS grant, Keychain or owner-state operation was performed.

## Concrete active mismatch

The current supplied Agent `background.js` handles `Aside.grantNotificationPermission` by resolving the scoped debugger target to a tab and asynchronously calling `chrome.auxNotification.requestPermission(tabId)`. It does not produce a transient Chromium extension user gesture. The existing Aux handler rejects this call without `user_gesture()` and otherwise starts a browser permission prompt. Neither behavior matches the supplied native API. The original IDL is a tab-ID request returning a boolean, with a matching origin-string revoke operation.

The pinned native registration factories `0x46ae71c` / `0x46ae76c` install vtables `0xe1afe60` / `0xe1afed0`; their function pointers at byte offset8 resolve to original request `0x4104d10` and revoke `0x41052a8`.

- Request validates its integer tab ID and private entitlement, uses `GetTabById` with the function browser context and its genuine include-incognito-information flag, and reads the tab's last committed navigation URL. The URL must be valid HTTP(S), proven by the original scheme predicate `0x23b024` comparing the literal `http` / `https` bytes. It canonicalizes the origin, writes dictionary key `origin.spec()` to integer1, then calls `0x77d8500(profile, origin, 1)` and synchronously returns true. It never reads the extension user-gesture flag or requests a prompt.
- Revoke accepts a valid HTTP(S) URL and canonicalizes it to its origin; it does not require the input string already equal that origin. It calls the same helper with setting0, removes that canonical origin from the dictionary, writes the dictionary only when removal changed it, and returns true.
- Original helper `0x77d8500` obtains `HostContentSettingsMap`, constructs an empty secondary URL and default constraints, and calls the default-scope setter with original notification type6 and the passed setting. The current155 semantic equivalent is the real existing `NotificationPermissionContext::UpdatePermission`, whose unchanged implementation performs exactly that operation for `ContentSettingsType::NOTIFICATIONS`, `CONTENT_SETTING_ALLOW` / `CONTENT_SETTING_DEFAULT`.
- Dictionary key is exactly `persistent_notifications.ai_delivery_mode_by_origin`. Original registration at `0x2d8cc9c..0x2d8ccdc` constructs an empty dictionary and registers it with flags0. This proposal adds that registration in the already invoked Aux profile-pref hook; the internal pref key is preserved.

## Delta and preserved boundaries

`native.patch` changes only the notification API h/cc and the existing Aux profile-pref hook. It removes the incompatible prompt/callback and uses the current native permission update implementation. `AuxFunction::Run`, the actual extension allowlist, API feature/manifest permissions and dispatcher are unchanged. The browser context and include-incognito flag are the supplied native lookup contract; no URL inference or cross-profile target search is introduced. Required argument types remain required. HTTP(S) validation and original error strings are retained.

The API result means the original native permission-setting operation completed. It does not assert OS notification authorization or delivery, and no notification is enqueued by this API. The original AI-delivery preference bytes are persisted, but this slice does not establish parity of every persistent-notification delivery consumer. That would require its own source-backed integration and observation.

## Integration

Root owns GN/application/compilation. Add direct `//chrome/browser/notifications` and `//components/prefs` dependencies to the existing `aux_notification` source set (or the equivalent exact existing target exposure); `notification_permission_context.h` is public in the notifications target. No source registration/new source file is needed. Focused targets are the actual `aux_notification_api.o` in the existing notification API source set and `profile_gate_prefs.o`; the notifications helper implementation is already part of the browser. The header no longer requires permission_result or async callback dependencies; existing broader deps may remain for this bounded followup.

`manifest.json` pins the exact native v409 inputs and proposed outputs. `source-evidence.json` pins the actual staged v241-brand supplied consumer (preserved `Aside.*` wires), original IDL, original native binary/ranges/strings, and current155 read-only API references. The original factory registration, helper call and enum/registration operands are independently checked by `verify.py`.

Run only the static check:

```sh
python3 docs/integration/proposed/native-notification-permission-contract/verify.py \
  --native-root /Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src
```

The verifier reads pinned static inputs and applies/checks the patch in a temporary filesystem tree. Passing it proves byte pins and replay, not compilation, permission behavior, normal-profile account readiness, Vault/CLI acceptance or the20 Muse tasks. Those remain unaccepted at the known native authentication boundary; this correction is an independent source-proven private-API behavior gap.
