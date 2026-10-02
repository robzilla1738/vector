import type { FeatureMount } from "../registry";
import { call, useStore } from "../../store";
import { setSiteAccess, deleteSiteRule, decideSiteAction, setEffectGrants } from "./actions";

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
    "approve-agent-action": (_state, { payload }) => {
      if (!payload || !("approvalId" in payload) || !("turnId" in payload))
        throw new Error("This approval is unavailable.");
      return decideSiteAction(payload, "accept");
    },
    "allow-agent-action-for-origin": (_state, { payload }) => {
      if (!payload || !("approvalId" in payload) || !("turnId" in payload))
        throw new Error("This approval is unavailable.");
      return decideSiteAction(payload, "acceptForOrigin");
    },
    "deny-agent-action": (_state, { payload }) => {
      if (!payload || !("turnId" in payload)) throw new Error("This approval is unavailable.");
      if ("approvalId" in payload) return decideSiteAction(payload, "decline");
      const current = useStore.getState().confirmation;
      if (!current || current.turnId !== payload.turnId || current.confirmation !== "handoff")
        throw new Error("This handoff has ended or changed.");
      useStore.setState({ confirmation: null });
    },
    "take-over-agent-action": async (state, { payload }) => {
      if (!payload || !("pageId" in payload) || !("turnId" in payload))
        throw new Error("The requested page is unavailable.");
      const current = useStore.getState().confirmation;
      if (
        !current ||
        current.turnId !== payload.turnId ||
        current.pageId !== payload.pageId ||
        current.confirmation !== "handoff"
      )
        throw new Error("This handoff has ended or changed.");
      await call("pages.takeover", { pageId: payload.pageId });
      await state.activate(payload.pageId);
      if (useStore.getState().confirmation === current) useStore.setState({ confirmation: null });
    },
    "set-agent-effect-grants": (_state, { payload }) => {
      if (!payload || !("effectGrants" in payload)) throw new Error("Choose agent effect permissions.");
      return setEffectGrants(payload);
    },
  },
};
