import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { AgentMode, AgentPolicySettings } from "@aux/contracts";
import { bridge } from "../../bridge";
import { AgentModeSchema } from "@aux/contracts/agent-policy";
import { Menu, useConfirm } from "../../ui/dialog";
import { shellIconCheck, shellIconPlay, shellIconShield } from "../../ui/icons";
import { ComposerChevron } from "../../composer/ComposerChevron";
import "./AgentModeControl.css";

/** Setup and Settings share the real mode choice and its explicit Full auto opt-in. */
export function AgentModeControl({
  active,
  compact = false,
  disabled = false,
  policy,
  onSave,
  temporary = false,
}: {
  active: boolean;
  compact?: boolean;
  disabled?: boolean;
  temporary?: boolean;
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
  const trigger = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useLayoutEffect(() => {
    setMenuOpen(false);
  }, [active, disabled, windowId, windowKind, privateMode]);
  const choices = [
    {
      mode: "ask" as const,
      label: "Ask first",
      description: "Review consequential actions before Aux continues.",
    },
    {
      mode: "full" as const,
      label: "Skip confirmation",
      description: "Let Aux complete actions without asking.",
    },
    ...(policy.agentMode === "auto"
      ? [{ mode: "auto" as const, label: "Auto", description: "Ask before payments and credential use." }]
      : []),
  ];
  async function change(mode: AgentMode) {
    const original = owner;
    if (pending.current || !current(original) || mode === policy.agentMode) return;
    if (
      mode === "full" &&
      !(await confirm({
        title: "Skip confirmation?",
        description:
          "Aux can make payments and use credentials without asking or Touch ID. Account security and CAPTCHA still require you to take over.",
        confirmLabel: "Skip confirmation",
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
      {compact ? (
        <>
          <button
            ref={trigger}
            type="button"
            className="composer-control agent-mode-trigger"
            data-mode={policy.agentMode}
            aria-label="Confirmation mode"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title={`${choices.find((choice) => choice.mode === policy.agentMode)?.label} · ${temporary ? "This run only" : "Remembered for future chats"}`}
            disabled={!active || disabled || busy}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {policy.agentMode === "full" ? shellIconPlay : shellIconShield}
            <span className="agent-mode-label">
              {choices.find((choice) => choice.mode === policy.agentMode)?.label}
            </span>
            <ComposerChevron />
          </button>
          {menuOpen && active && !disabled && (
            <Menu
              label="Confirmation mode"
              className="agent-mode-menu"
              anchor={trigger}
              returnFocus={trigger}
              placement="auto-start"
              onClose={() => setMenuOpen(false)}
            >
              <p className="agent-mode-menu-label">
                {temporary ? "This run only" : "For this and future chats"}
              </p>
              {choices.map((choice) => (
                <button
                  key={choice.mode}
                  type="button"
                  role="menuitemradio"
                  aria-checked={policy.agentMode === choice.mode}
                  disabled={busy}
                  onClick={() => {
                    void change(choice.mode).then(() => setMenuOpen(false));
                  }}
                >
                  {choice.mode === "full" ? shellIconPlay : shellIconShield}
                  <span className="agent-mode-copy">
                    <strong>{choice.label}</strong>
                    <small>{choice.description}</small>
                  </span>
                  {policy.agentMode === choice.mode && shellIconCheck}
                </button>
              ))}
            </Menu>
          )}
        </>
      ) : (
        <select
          aria-label="Agent mode"
          value={policy.agentMode}
          disabled={!active || disabled || busy}
          onChange={(event) => void change(AgentModeSchema.parse(event.target.value))}
        >
          <option value="ask">Ask first</option>
          <option value="auto">Auto</option>
          <option value="full">Skip confirmation</option>
        </select>
      )}
      {error && <p role="alert">{error}</p>}
      {confirmation}
    </>
  );
}
