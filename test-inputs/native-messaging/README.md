# Disposable native messaging and extension-fill check

Prepared only; no extension installed, host/server launched, manifest registered in an existing browser directory, or owner data accessed. Fixed public extension keys provide stable IDs (private generation keys were immediately discarded). Neither extension is signed or distributed.

## Isolation mechanism verified in local Chromium source

There is no native-host-directory override among the current Chromium native messaging switches. Use the genuine `--user-data-dir` switch: `chrome/common/chrome_paths.cc` resolves `DIR_USER_NATIVE_MESSAGING` to `DIR_USER_DATA/NativeMessagingHosts`. `LaunchContext::FindManifest` checks that directory first when user-level hosts are allowed. The prepared manifest allows ONLY the exact `allowed` extension ID; `denied` has a separate key/ID and identical nativeMessaging permission.

This tests the real native messaging boundary, **not** the Chrome fallback path changed by562. Testing that fallback against the owner's Chrome registration is deliberately excluded. The active buildflag correction has separate source evidence.

## Root-operated runbook

1. With a chosen absolute Python3 interpreter, run `python3 test-inputs/native-messaging/prepare.py /tmp/aux-native-roundtrip-UNIQUE`. Destination must not exist; preparation refuses overwrite. It stages a new user-data directory, exact-origin manifest, executable launcher using that Python interpreter, two unpacked extensions and dummy page. No host runs during preparation.
2. Launch the actual candidate Aux app using the normal approved disposable startup recipe, with `--user-data-dir=/tmp/aux-native-roundtrip-UNIQUE/user-data` and `--use-mock-keychain`. Preserve required isolated daemon/home/port flags from the root recipe. Do not substitute this path into an owner profile or reuse a running browser instance bound to another profile.
3. At `chrome://extensions`, enable Developer mode in this disposable profile and Load unpacked `allowed` and `denied` from the staging directory. Record actual IDs; require exact agreement with `extension-ids.json`. Use UI loading rather than inventing extension-load flags. If this is blocked, record the blocker rather than changing policy.
4. Open `chrome-extension://<allowed-id>/check.html`. Click Run native roundtrip. Expect error null and response `{"pong":"aux-dummy-only"}`. Open the denied equivalent and click. Expect a forbidden/access error with response null, **not** host-not-found or generic disconnected; those do not prove origin rejection. Both use the same host name and payload. The allowed success plus denied access error proves discovery and origin enforcement.
5. Start the dummy server separately: `python3 -m http.server 38765 --bind 127.0.0.1 --directory /tmp/aux-native-roundtrip-UNIQUE/page`. If that port is occupied, stop and choose a reviewed fixture update; do not stop another process. Visit `http://127.0.0.1:38765/aux-dummy.html`. Click the extension-inserted button. Expect username `aux-dummy-user`, password `NOT-A-REAL-PASSWORD` and the filled status. Reload and repeat. No real login, secret, submit or network destination is involved. This is basic content-script fill plumbing, not vendor autofill acceptance.
6. Record candidate version, IDs, allowed/denied results and local form result. Quit only the isolated Aux instance, stop only the server started here, then remove only the newly created staging tree. No external registration needs cleanup.

## Vendor boundary: 1Password

Official docs checked2026-10-20 distinguish the extension's own encrypted browser runtime from its optional desktop connection. Native messaging plus code-signature validation protects the companion link; a successful dummy host cannot prove that trust check. [Browser security](https://support.1password.com/1password-browser-security/).

For an additional Mac browser, 1Password documents adding a trusted Apple-code-signed browser from Applications through Settings → Browser → Add Browser; store installation of the extension is required. This is an explicit user trust change and can expose unlocked vault contents to that browser. Do not perform it as part of this fixture. The current temporary Aux development package is not proven eligible. [Additional browsers](https://support.1password.com/additional-browsers/).

The extension can manage browser-side encrypted data separately; companion integration adds shared unlock/biometrics and account transfer. Neither standalone store installation/account use nor companion pairing has been accepted for Aux. A later real-manager check needs a disposable test account and explicit consent for any vendor trust setting, not owner vault access.
