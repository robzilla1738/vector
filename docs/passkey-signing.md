# Aux platform passkey signing

The ordinary Aux build uses Chromium's unbranded app entitlements. The Aux passkey template is included only when `enable_aux_passkey_entitlements=true` is set for an Aux shell build with bundle ID `dev.aux.browser`. Ad-hoc signing rejects that build. No provisioning profile or Team ID is committed to this repository.

After Apple approves the browser passkey entitlement and issues a matching provisioning profile, configure the static release build with:

```gn
enable_aux_passkey_entitlements = true
aux_passkey_team_id = "YOUR10CHARTEAMID"
```

The generated app entitlement includes the browser public-key credential capability, `TEAMID.dev.aux.browser` application identifier, `TEAMID.dev.aux.browser.webauthn` and `.webauthn-uvk` Keychain groups, and `group.dev.aux.browser.passkeys` application group. These are Aux-owned groups; they do not claim Chrome's Keychain namespace.

Review the exact signing plan before execution:

```sh
node scripts/chromium-sign.mjs --input /path/to/out/AuxRelease \
  --output /path/to/clean/release --identity 'Developer ID Application: …' \
  --team-id YOUR10CHARTEAMID --passkey-profile /secure/path/Aux.provisionprofile
```

The signer decodes the profile locally and requires an unexpired profile whose Team ID, application identifier, passkey entitlement, Keychain groups, and application group cover the generated Aux entitlement. It also requires the GN Team ID to match. `--execute` signs only after the plan reports no blockers, embeds the reviewed profile, and checks the signed app's entitlement and embedded profile before creating the DMG. Keep the provisioning profile outside the repository and do not include its contents in logs or handoff evidence.

An ad-hoc build must leave both GN arguments at their defaults. Its signing plan rejects a passkey profile or packaged passkey entitlement. Existing virtual-authenticator results prove WebAuthn protocol compatibility only; the signed platform path still needs the owner-operated registration and cold-restart sign-in steps in `tests/takeover/passkey.mjs`.
