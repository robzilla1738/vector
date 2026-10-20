# Local browser, external password managers, and native navigation

Owner-directed exception on 2026-10-20 removes the built-in Vault product. This patch is based on the v499 native composition.

- Browser visibility and new-tab preloading no longer depend on cloud onboarding or Vault setup/unlock. No account/onboarding/unlocked preference is synthesized; installation authentication is unchanged.
- Bundled extension discovery and daemon startup require Agent only, matching removal of the Vault resource product.
- Chromium's first-party password save/fill client is disabled for Aux builds; external extension content scripts and WebAuthn proxy APIs remain unchanged. Existing saved data is not deleted.
- The hidden new-tab prerender initiator uses a specialized delegate that applies actual preloading preferences, fixing its inherited IsPrerender2Supported NOTREACHED. Preloading stays enabled normally.
- Crash restore bubbles fall back to the real toolbar anchor when no app-menu control exists.
- Native Chat and Settings actions resolve the actual profile account using the supplied authenticated accounts.ensureProfileAccount mutation and its real returned numeric ID. The request duplicates the supplied getProfileContext fields, not a fabricated account. Route navigation checks the browser/profile/authorization lifetime and reuses matching tabs. Profile-menu Settings uses main.html and the same resolver after profile selection, without requiring a Vault unlock or pre-existing cached numeric account.

Verification: patch baseline/output hashes and whitespace reviewed. Native compilation and actual normal-profile startup, new tab, Chat and Settings interaction are integrator acceptance gates. Third-party password-manager desktop integration is not claimed.

The shared FetchProfileSecurity primitive remains unchanged because it protects actual Vault/private operations. Its use by optional getProfiles/openProfileRoute APIs still needs removal from non-Vault product flows if exercised; native navigation no longer depends on it.
