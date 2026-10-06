import type { FeatureMount } from "../registry";
import { decideAgentAction } from "../../action-approval";
export const mount: FeatureMount = {
  feature: "agentSitePermissions",
  commands: {
    "allow-agent-action-for-origin": (_state, { payload }) => {
      if (!payload || !("approvalId" in payload) || !("turnId" in payload))
        throw new Error("This approval is unavailable.");
      return decideAgentAction(payload, "acceptForOrigin");
    },
  },
};
