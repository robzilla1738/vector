import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AgentPolicySettingsSchema } from "@aux/contracts/agent-policy";
import type { AgentPolicySettings } from "@aux/contracts";
import { useStore, call } from "../../store";
import { PolicyTable } from "../permissions/PolicyTable";
import { errorMessage } from "../../error-message";
import { bridge } from "../../bridge";
import "../../settings/sections/Permissions.css";

/** Page controls and Settings use the same policy, never an independent grant system. */
export function SiteAgentAccess({ origin }: { origin: string }) {
  const site = new URL(origin).origin;
  const settings = useStore((state) => state.settings);
  const policy = useMemo(
    () =>
      AgentPolicySettingsSchema.parse({
        agentMode: settings.agentMode,
        agentPolicies: settings.agentPolicies,
        agentPolicyRevision: settings.agentPolicyRevision,
      }),
    [settings.agentMode, settings.agentPolicies, settings.agentPolicyRevision],
  );
  const windowId = bridge.windowId,
    kind = bridge.windowKind,
    privateMode = bridge.privateMode;
  const owner = useMemo(() => ({ site, windowId, kind, privateMode }), [site, windowId, kind, privateMode]);
  const ownerRef = useRef<typeof owner | null>(null);
  useLayoutEffect(() => {
    ownerRef.current = owner;
    return () => {
      if (ownerRef.current === owner) ownerRef.current = null;
    };
  }, [owner]);
  const pending = useRef(new Set<typeof owner>());
  const [busyOwner, setBusyOwner] = useState<typeof owner | null>(null);
  const [failure, setFailure] = useState<{ owner: typeof owner; message: string } | null>(null);
  const busy = busyOwner === owner,
    error = failure?.owner === owner ? failure.message : "";
  async function save(rules: AgentPolicySettings["agentPolicies"]) {
    if (pending.current.has(owner)) return;
    const original = owner;
    const current = () =>
      ownerRef.current === original &&
      bridge.windowId === original.windowId &&
      bridge.windowKind === original.kind &&
      bridge.privateMode === original.privateMode;
    if (!current()) return;
    pending.current.add(owner);
    setBusyOwner(owner);
    setFailure(null);
    try {
      await call("settings.set", { agentPolicies: rules, agentPolicyRevision: policy.agentPolicyRevision });
    } catch (reason) {
      if (current()) setFailure({ owner, message: errorMessage(reason) });
    } finally {
      pending.current.delete(owner);
      setBusyOwner((value) => (value === owner ? null : value));
    }
  }
  return (
    <section aria-label={`Aux permissions on ${site}`}>
      <h3>Aux permissions</h3>
      <p>Site rules override the current mode and category settings.</p>
      {error && <p role="alert">{error}</p>}
      <PolicyTable policy={policy} site={site} busy={busy} save={(rules) => void save(rules)} />
    </section>
  );
}
