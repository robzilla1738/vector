import { AuxError } from "@aux/contracts";

async function h_agent_site_permissions(): Promise<never> {
  throw new AuxError("feature_unavailable", "Agent site permissions are not implemented.");
}

export const agentSitePermissionMethods = {
  "safety.originPolicies.list": h_agent_site_permissions,
  "safety.originPolicies.set": h_agent_site_permissions,
};
