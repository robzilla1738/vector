# Native messaging and 1Password readiness

The extension matrix includes a focused native-messaging check. It launches a synthetic framed JSON echo host from a disposable Chromium user-data directory, calls it through `chrome.runtime.sendNativeMessage`, and verifies that the same extension is rejected by a second manifest whose `allowed_origins` lists a different extension ID. It never launches an installed password manager or opens an account.

## Run

```sh
node --test tests/smoke/native-messaging-manifests.test.mjs

# Reference browser, then the compiled Aux candidate with separate disposable Profiles.
node tests/smoke/chromium-extension-compat.mjs
AUX_CANDIDATE_BIN='/absolute/path/to/out/AuxProof/Aux Host Proof.app/Contents/MacOS/Aux Host Proof' \
  node tests/smoke/chromium-extension-compat.mjs
```

The inventory checks the active disposable user-data directory, Chrome, Chrome for Testing, and Chromium default user directories, plus their macOS global host directories. These locations follow Chromium's `DIR_USER_NATIVE_MESSAGING` and `DIR_NATIVE_MESSAGING` lookup in `chrome/common/chrome_paths.cc`; user-level lookup wins when allowed. The default user-data directory comes from `chrome/common/chrome_paths_mac.mm`, with `CrProductDirName` able to override it. The active Aux candidate may have a different product directory, so its actual user-data path must be checked on the final build. The inventory is read-only and records only location labels, validity counts, and whether the known `com.1password.1password` manifest is present. It does not retain other host names, paths, allowed extension IDs or manifest contents.

The validator applies a bounded subset of Chromium's `native_messaging_host_manifest.cc` and `launch_context.cc` requirements: a matching lower-case host name and filename, nonempty description, `stdio` type, absolute executable path, exact Chrome-extension origin grants, and optional boolean native-initiated-connection flag. A malformed or overbroad manifest is reported invalid. The browser remains authoritative: a valid local scan is only a preflight, while the live extension call proves discovery and origin enforcement.

## September 25 result

| Probe | Chrome for Testing 153 | AuxProof 156 |
| --- | --- | --- |
| Synthetic host manifest in disposable user-data directory | Valid | Valid |
| Framed `sendNativeMessage` echo | Pass | Pass |
| Host with an unlisted extension origin | Rejected | Rejected |
| Known 1Password host manifest in seven scanned locations | Absent | Absent |

The exact per-browser records are local, ignored JSON artifacts under `release/test-artifacts/`. The scanner found other Chrome-compatible manifests on this Mac but did not capture their identities. A missing known 1Password manifest agrees with the current prerequisite gap: no 1Password app or test account has been qualified here. This synthetic pass does **not** prove that the 1Password extension can connect to its desktop app.

## Real 1Password takeover checklist

1. Build and install the exact release candidate as a signed app in `/Applications`, then verify its code signature, notarization, bundle identity and unchanged identity across restart/update. 1Password's [additional-browser instructions](https://support.1password.com/additional-browsers/) require a code-signed browser in `/Applications` on Mac; its [connection security description](https://support.1password.com/1password-browser-connection-security/) says the desktop app authenticates the browser by its code signature.
2. With an owner-controlled **test** 1Password account, install the real browser extension from the Chrome Web Store into a disposable Aux Profile. Review its permission prompt and action popup. In 1Password's Browser settings, enable browser integration and add the signed Aux app as an additional browser; enable desktop-app integration in the extension. Follow the vendor's [connection settings guide](https://support.1password.com/connect-1password-browser-app/). Do not use a personal vault for qualification.
3. Inspect where the 1Password installer put its native host manifest. Confirm the final Aux user-data directory or a compatible global directory is searched by the fork, the manifest grants the real Store extension ID, and its host executable exists and is executable. A manifest found only under Chrome's default user-data directory does not automatically make it discoverable from Aux's user-data directory. Implement a reviewed native lookup or installer integration if this gate fails; do not copy user files silently.
4. Prove save, fill, unlock, lock, account switching and action-popup behavior on controlled test sites. Exercise Work and Personal persistent Aux Profiles and a private window, checking that items and unlock state follow the intended 1Password policy. Verify restart and signed update. Record only result metadata, browser/extension/app versions and signatures, never vault items or secrets.
5. Confirm fail-closed behavior: an unlisted extension cannot launch the host; a removed permission or manifest cannot connect; an unsigned, moved or changed Aux app does not inherit the trusted browser connection. Use the vendor's [code-signature troubleshooting guidance](https://support.1password.com/code-signature/) when identity checks fail.

This checklist is a release gate for 1Password integration, not a claim of current compatibility. 1Password warns that connecting an additional browser grants that browser access to unlocked vault information; the owner must review the exact signed candidate before enabling it.
