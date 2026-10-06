import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { AgentMode, AgentPolicySettings } from "@aux/contracts";
import { bridge } from "../../bridge";
import { Segmented } from "../../ui";
import { useConfirm } from "../../ui/dialog";

/** Setup and Settings share the real mode choice and its explicit Full auto opt-in. */
export function AgentModeControl({
  active,
  disabled = false,
  policy,
  onSave,
}: {
  active: boolean;
  disabled?: boolean;
  policy: AgentPolicySettings;
  onSave(patch: { agentMode: AgentMode; agentPolicyRevision: number }): Promise<boolean>;
}) {
  const windowId = bridge.windowId,
    windowKind = bridge.windowKind,
    privateMode = bridge.privateMode;
  const owner = useMemo(
    () => ({ active, disabled, policy, windowId, windowKind, privateMode }),
    [active, disabled, policy, windowId, windowKind, privateMode],
  );
  const ownerRef = useRef<typeof owner | null>(null);
  useLayoutEffect(() => {
    ownerRef.current = owner;
    return () => {
      if (ownerRef.current === owner) ownerRef.current = null;
    };
  }, [owner]);
  const current = (original: typeof owner) =>
    ownerRef.current === original &&
    original.active &&
    !original.disabled &&
    bridge.windowId === original.windowId &&
    bridge.windowKind === original.windowKind &&
    bridge.privateMode === original.privateMode;
  const pending = useRef(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const { confirm, confirmation } = useConfirm();
  async function change(mode: AgentMode) {
    const original = owner;
    if (pending.current || !current(original) || mode === policy.agentMode) return;
    if (
      mode === "full" &&
      !(await confirm({
        title: "Use Full auto?",
        description:
          "Aux can make payments and use credentials without asking or Touch ID. Account security and CAPTCHA still require you to take over.",
        confirmLabel: "Use Full auto",
        cancelLabel: "Keep current mode",
      }))
    )
      return;
    if (pending.current || !current(original)) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const saved = await onSave({
        agentMode: mode,
        agentPolicyRevision: original.policy.agentPolicyRevision,
      });
      if (!saved && current(original))
        setError("Agent mode could not be saved. Refresh Settings before trying again.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <Segmented<AgentMode>
        label="Agent mode"
        value={policy.agentMode}
        onChange={(mode) => void change(mode)}
        items={[
          { value: "auto", label: "Auto", disabled: disabled || busy },
          { value: "ask", label: "Ask first", disabled: disabled || busy },
          { value: "full", label: "Full auto", disabled: disabled || busy },
        ]}
      />
      {error && <p role="alert">{error}</p>}
      {confirmation}
    </>
  );
}
