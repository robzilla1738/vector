export const PASSKEY_ENTITLEMENT = "com.apple.developer.web-browser.public-key-credential";
export const PASSKEY_APP_GROUP = "group.dev.aux.browser.passkeys";

export function expectedPasskeyEntitlements(teamId) {
  return {
    "com.apple.application-identifier": `${teamId}.dev.aux.browser`,
    "keychain-access-groups": [
      `${teamId}.dev.aux.browser.webauthn`,
      `${teamId}.dev.aux.browser.webauthn-uvk`,
    ],
    "com.apple.security.application-groups": [PASSKEY_APP_GROUP],
    [PASSKEY_ENTITLEMENT]: true,
  };
}

function includesExpected(actual, expected) {
  return Object.entries(expected).every(([key, value]) =>
    Array.isArray(value)
      ? Array.isArray(actual?.[key]) && value.every((item) => actual[key].includes(item))
      : actual?.[key] === value,
  );
}

/** Pure preflight shared by the signer and fixture tests; no profile content is logged. */
export function validatePasskeySigning({ args, entitlements, profile, teamId, adhoc, profileRequested }) {
  const blockers = [];
  const enabled = /^\s*enable_aux_passkey_entitlements\s*=\s*true\s*$/m.test(args);
  const builtTeam = /^\s*aux_passkey_team_id\s*=\s*"([A-Z0-9]{10})"\s*$/m.exec(args)?.[1];
  const hasEntitlement = entitlements?.[PASSKEY_ENTITLEMENT] === true;
  if (adhoc && (enabled || hasEntitlement || profileRequested))
    blockers.push("ad-hoc signing cannot include Aux passkey entitlements or provisioning");
  if (enabled !== hasEntitlement) blockers.push("GN passkey flag and packaged entitlements disagree");
  if (enabled !== profileRequested)
    blockers.push("Aux passkey build requires an approved provisioning profile at signing");
  if (!enabled) return blockers;
  if (!teamId || builtTeam !== teamId) blockers.push("approved Team ID does not match the GN build");
  if (!teamId || !includesExpected(entitlements, expectedPasskeyEntitlements(teamId)))
    blockers.push("packaged Aux passkey entitlements are incomplete or use another Team ID");
  if (!profile || !Array.isArray(profile.TeamIdentifier) || !profile.TeamIdentifier.includes(teamId))
    blockers.push("provisioning profile does not match the approved Team ID");
  if (!teamId || !includesExpected(profile?.Entitlements, expectedPasskeyEntitlements(teamId)))
    blockers.push("provisioning profile does not authorize the Aux passkey app and groups");
  if (
    !profile?.ExpirationDate ||
    !Number.isFinite(Date.parse(profile.ExpirationDate)) ||
    Date.parse(profile.ExpirationDate) <= Date.now()
  )
    blockers.push("provisioning profile is missing an unexpired expiration date");
  return blockers;
}
