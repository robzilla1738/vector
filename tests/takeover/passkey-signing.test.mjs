import assert from "node:assert/strict";
import test from "node:test";
import { expectedPasskeyEntitlements, validatePasskeySigning } from "../../scripts/lib/passkey-signing.mjs";

const teamId = "ABCDEFGHIJ";
const entitlements = expectedPasskeyEntitlements(teamId);
const profile = {
  TeamIdentifier: [teamId],
  Entitlements: entitlements,
  ExpirationDate: "2099-01-01T00:00:00Z",
};
const args = `is_debug = false\nenable_aux_passkey_entitlements = true\naux_passkey_team_id = "${teamId}"\n`;
const review = (changes = {}) =>
  validatePasskeySigning({
    args,
    entitlements,
    profile,
    teamId,
    adhoc: false,
    profileRequested: true,
    ...changes,
  });

test("approved Aux passkey build requires matching Team ID, profile, and groups", () => {
  assert.deepEqual(review(), []);
  assert.match(review({ teamId: "ZYXWVUTSRQ" }).join(" "), /Team ID|entitlements/i);
  assert.match(
    review({
      profile: {
        ...profile,
        Entitlements: {
          ...entitlements,
          "keychain-access-groups": [entitlements["keychain-access-groups"][0]],
        },
      },
    }).join(" "),
    /profile does not authorize/i,
  );
  assert.match(
    review({ profile: { ...profile, ExpirationDate: "2000-01-01T00:00:00Z" } }).join(" "),
    /expired/i,
  );
});

test("ad-hoc or unprovisioned signing cannot carry the capability", () => {
  assert.match(review({ adhoc: true }).join(" "), /ad-hoc signing cannot include/i);
  assert.match(
    review({ profileRequested: false, profile: undefined }).join(" "),
    /requires an approved provisioning profile/i,
  );
  assert.match(review({ entitlements: {} }).join(" "), /disagree|incomplete/i);
  assert.deepEqual(
    review({
      args: "is_debug = false\n",
      entitlements: {},
      profile: undefined,
      profileRequested: false,
      adhoc: true,
    }),
    [],
  );
});
