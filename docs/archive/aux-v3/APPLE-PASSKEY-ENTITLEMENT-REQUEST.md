# Apple browser passkey entitlement request

Use this text when the Aux owner requests the restricted browser passkey entitlement from Apple. Replace bracketed fields with the owner’s facts; do not put account credentials in the request or this repository.

> We are developing Aux, an independent Chromium-based macOS browser with bundle identifier `dev.aux.browser`, distributed under Apple Developer Team ID `[TEAM ID]`. We request the `com.apple.developer.web-browser.public-key-credential` entitlement so websites can register and authenticate platform passkeys through the browser’s WebAuthn implementation. Aux exposes ordinary user-initiated registration and sign-in in regular Profiles, with private-Profile separation. The entitlement will be present only in Developer ID builds covered by the approved provisioning profile. We will test registration, authentication, Profile separation and Keychain continuity across two versions before distribution. Please advise which bundle identifiers and helper processes require the entitlement and which provisioning profile capabilities Apple expects.

Aux’s entitlement template must use Aux-owned application and Keychain groups. Do not copy Google Chrome’s restricted group identifiers. Before signing, confirm the approved provisioning profile, Team ID, bundle identifier and helper entitlement set agree. Ad-hoc builds omit this restricted entitlement and cannot qualify platform passkeys.

The key name above is the one Chromium uses in `chrome/app/app-entitlements-chrome.plist` at the pinned Aux source revision. The actual Apple approval and provisioning profile are an owner takeover item.
