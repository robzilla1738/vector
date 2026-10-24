# Extension and external password-manager readiness

This is a static implementation inventory, not a new live acceptance claim.

| Boundary | Actual selected implementation | Current evidence / remaining work |
| --- | --- | --- |
| Extension manager and unpacked extensions | `chrome/browser/ui/chrome_pages.cc::ShowExtensions`; standard `chrome://extensions`; `prefs::kExtensionsUIDeveloperMode` | This slice exposes the real native manager and modifiable native preference through supplied Settings/commands. Actual disposable installation/reload/permissions UI still needs checking on the integrated successor. |
| Chrome Web Store URLs and trust | `extensions/common/extension_urls.cc` and existing Chromium install owners | Existing sources remain. Store installation/update on the new Aux artifact is not established by a command opening the manager. Preserve normal origin, signature and permission checks. |
| Native host discovery | `chrome/browser/extensions/api/messaging/launch_context_posix.cc::FindManifest` | Actual Aux source checks its own native-host paths, then the selected Chrome compatibility paths. This slice does not copy manifests, install hosts, broaden host discovery or run a companion. |
| Host origin restriction | `native_messaging_host_manifest.cc` and `launch_context.cc` | Existing parsed `allowed_origins` are checked against the requesting extension origin before launch. Do not replace this with an allow-all or brand-derived guess. |
| Generic content-script/autofill and native messaging | Historical `docs/STATUS.md` record near the disposable extension fixture acceptance | Historical allowed-origin native ping, denied other origin and dummy form fill/reload passed. This is useful baseline evidence, not proof for this rebuilt artifact or a vendor desktop companion. |
| 1Password companion | `docs/integration/external-password-manager-vendor-readiness.md` | Previous audit separates generic protocol support from vendor browser identity/trust. Exact final browser signature/install path, owner-approved companion trust, official extension pairing and one dummy login remain separate acceptance. No owner vault or trust setting was read/changed in this batch. Recheck vendor requirements when that authorized acceptance is scheduled. |
| Built-in password manager | Owner exclusion in `docs/design/aside-contract.md` | Remains excluded. This slice does not restore Vault, stored passwords, first-party autofill, credential import, or onboarding. |

Local checks that can be done after the successor builds: an owned dummy unpacked
extension with separate profile storage/cookies; reload after navigation; the
existing allowed/denied native fixture if the actual messaging boundary changed;
normal permission prompting and extension disable/remove behavior. Vendor account,
vault trust, signing and real password tests are deliberately separate.
