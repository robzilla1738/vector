import type { FeatureMount } from "../registry";
import { call } from "../../store";
import { decideAgentAction } from "../../action-approval";
import { setSiteAccess, deleteSiteRule, setEffectGrants } from "./actions";

export const mount: FeatureMount = {
  feature: "agentSitePermissions",
  commands: {
    "set-site-agent-access": (_state, { payload }) => {
      if (
        !payload ||
        !("origin" in payload) ||
        !("effect" in payload) ||
        !("access" in payload) ||
        !("expectedRevision" in payload)
      )
        throw new Error("Choose a site effect and access level.");
      return setSiteAccess(payload);
    },
    "delete-site-agent-rule": (_state, { payload }) => {
      if (!payload || !("origin" in payload) || !("expectedRevision" in payload))
        throw new Error("Choose a site rule to remove.");
      return deleteSiteRule(payload);
    },
    "revoke-site-agent-grant": (_state, { payload }) => {
      if (!payload || !("grantId" in payload) || !("profileId" in payload))
        throw new Error("Choose a saved site grant.");
      return call("safety.grants.revoke", payload);
    },
    "allow-agent-action-for-origin": (_state, { payload }) => {
      if (!payload || !("approvalId" in payload) || !("turnId" in payload))
        throw new Error("This approval is unavailable.");
      return decideAgentAction(payload, "acceptForOrigin");
    },
    "set-agent-effect-grants": (_state, { payload }) => {
      if (!payload || !("effectGrants" in payload)) throw new Error("Choose agent effect permissions.");
      return setEffectGrants(payload);
    },
  },
};
