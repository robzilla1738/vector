# Lean actual app-session acceptance

Run only in the already approved disposable Aux user-data root/profile, with the integrated native build and accepted startup record. This document does not start a server, install anything, or operate the browser.

## Public localhost fixture

Use one dedicated temporary directory, an unused loopback-only port (example41973), and no owner files. Prepare:

- `index.html`: title `Aux Local PWA Fixture`, `<link rel="manifest" href="/manifest.json">`, a visible fixed marker `APP-RESTORE-ONE`, and a link to `/second.html`. Register `/sw.js`.
- `second.html`: same manifest, title `Aux Local PWA Fixture Two`, fixed marker `APP-RESTORE-TWO`, link back to `/index.html`. No inputs, cookies, uploads, external requests or credentials.
- `manifest.json`: `{"id":"/aux-local-pwa","name":"Aux Local PWA Fixture","short_name":"Aux Fixture","start_url":"/index.html","scope":"/","display":"standalone","background_color":"#ffffff","theme_color":"#3268a8","icons":[{"src":"/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"/icon-512.png","sizes":"512x512","type":"image/png"}]}`.
- `sw.js`: cache only these exact local fixture resources on install; a fetch handler returns a matching cached resource or the original request. No periodic work, push, notifications or permissions.
- Opaque PNG icons192/512, e.g. a plain blue square generated locally. They are test assets, not Aux production branding.

Serve only that directory: `python3 -m http.server 41973 --bind 127.0.0.1 --directory <fixture-directory>`. Confirm the port is unused first. Keep the server running through restart so this tests session/app ownership, not offline failure. This is ordinary localhost HTTP; no TLS, hosted deployment or network tunnel is required.

## One real end-to-end check

1. Open the fixture in an existing disposable target profile whose startup setting is Continue where you left off. Use the genuine app-install action exposed by the actual Aux menu/address UI; inspect its real label rather than assuming a shortcut. Complete the native installation. If no install action is available, record that boundary instead of substituting a generic popup.
2. In the installed standalone app window navigate its link to `second.html`; confirm marker `APP-RESTORE-TWO`. Keep one normal target-profile fixture tab open as well. Record only fixture title/marker, native app-window type/standalone chrome, target profile and window count. Keep the original source profile's existing fixture tabs unchanged.
3. Normal Quit while the app and target normal window remain open. Reopen Aux normally with its accepted record. From the original source window select the target profile. Expect the native app and normal window to restore separately; app marker/selection and app chrome retained; source window/profile unchanged. Verify the app is actually an installed app window, not merely a popup with minimal chrome.
4. Select the target again from the source. It should focus an existing recovered target window and not create another app or empty NTP. One normal Quit/reopen suffices; do not repeat broad tests.
5. If installed-app recovery succeeds, close only the explicitly identified fixture windows and uninstall only `Aux Local PWA Fixture` via its actual browser app controls. Stop the fixture server and remove only the generated fixture directory. Preserve all unrelated windows/profiles, including legitimate NTP windows.

Optional narrow negative case only if needed to validate the new guard: create a disposable saved app-session snapshot then uninstall that exact fixture through real app UI before admission. Expect missing-owner refusal with existing recovery guidance and no synthetic app window. Do not edit registry/session files or repeatedly rebuild to manufacture this case.

Success means actual installed-app restoration; source replay alone does not satisfy this check. No AI request, credential, permission grant or manual signing is part of the fixture.
