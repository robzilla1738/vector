/** Owner-operated checks. Dry runs expose every precondition without touching accounts or Profiles. */
export const cases = {
  keychain: {
    title: "Keychain continuity across two Developer ID builds",
    inputs: ["version N Aux.app", "version N+1 Aux.app", "disposable macOS user and login fixture"],
    steps: [
      "Verify both app bundles have dev.aux.browser and the same Developer ID Team ID.",
      "In version N, save a fixture password through the Aux password manager and confirm it fills.",
      "Quit N, install N+1 without deleting its Profile, unlock the same macOS user session, and confirm the fixture fills.",
      "Record the app signatures, OS version, and redacted save/fill results. Do not export the password.",
    ],
    evidence: ["N and N+1 signature reports", "fixture save/fill observations", "same Profile path"],
  },
  onepassword: {
    title: "1Password additional-browser save, fill and unlock",
    inputs: [
      "Developer ID signed Aux.app",
      "1Password desktop app and a test account",
      "disposable login fixture",
    ],
    steps: [
      "Install the signed Aux build and 1Password extension in a fresh test Profile.",
      "Confirm 1Password recognizes Aux's signed browser identity and unlocks through the desktop app.",
      "Save a fixture login, close the tab, reopen it, fill it, and confirm the submitted test account identity.",
      "Lock 1Password, retry fill, then unlock and confirm fill resumes without exposing the secret in logs.",
    ],
    evidence: [
      "app and extension versions",
      "save/fill/unlock observations",
      "redacted extension diagnostics",
    ],
  },
  passkey: {
    title: "Platform passkey registration and sign-in",
    inputs: [
      "Developer ID signed Aux.app",
      "approved Aux Team ID and passkey provisioning profile",
      "test relying party",
    ],
    steps: [
      "Build with enable_aux_passkey_entitlements=true and the approved aux_passkey_team_id, then supply --passkey-profile and --team-id to chromium-sign.mjs.",
      "Verify the signed browser has the Aux application identifier, Aux-only passkey Keychain and application groups, the browser passkey entitlement, and the embedded approved profile. Verify ad-hoc builds omit all of these passkey entitlements.",
      "Register a platform passkey on the test relying party in Aux, then sign out.",
      "Sign in with the passkey after a cold Aux restart and confirm the same account identity.",
      "Repeat in a second Profile and check the site/account isolation expected by the relying party.",
    ],
    evidence: [
      "redacted signed entitlement and provisioning reports",
      "registration/sign-in results",
      "Profile and relying-party identifiers",
    ],
  },
  sparkle: {
    title: "Signed Sparkle N to N+1 and rollback",
    inputs: ["signed Aux version N", "signed Aux version N+1", "local test appcast", "test EdDSA public key"],
    steps: [
      "Serve a test appcast on loopback with N+1 and matching Sparkle EdDSA signature; record exact feed and hashes.",
      "Run N with a disposable Profile, download N+1, cancel a dirty-work quit, then complete an orderly quit/install.",
      "Confirm N+1 launches with the Profile intact and the schema downgrade guard rejects unsupported older readers.",
      "Republish the prior signed version in the local feed, rehearse rollback, and verify Profile recovery.",
    ],
    evidence: [
      "N/N+1 app signatures and hashes",
      "appcast and update logs",
      "cancel/install/rollback observations",
    ],
  },
  notarization: {
    title: "Developer ID notarization and Gatekeeper",
    inputs: [
      "Developer ID signed Aux.app and DMG",
      "notarytool keychain profile",
      "Apple submission authorization",
    ],
    steps: [
      "Run scripts/chromium-notarize.mjs with app, DMG and keychain profile to review the exact commands.",
      "After the owner authorizes submission, submit the DMG with notarytool and retain its request ID and log.",
      "Staple and validate app and DMG, then run Gatekeeper assessment on a clean macOS installation.",
    ],
    evidence: ["notarytool request ID and acceptance log", "stapler validation", "Gatekeeper result"],
  },
};
