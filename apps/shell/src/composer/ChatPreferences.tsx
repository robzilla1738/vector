import { useMemo, type ReactNode } from "react";
import { AgentPolicySettingsSchema } from "@aux/contracts/agent-policy";
import { call, useStore } from "../store";
import { AgentModeControl } from "../features/permissions/AgentModeControl";
import { shellIconDown } from "../ui/icons";
import { Popover } from "../ui/popover";

export function ChatPreferences({
  children,
  disabled,
  modelId,
  reasoning,
}: {
  children: ReactNode;
  disabled: boolean;
  modelId?: string;
  reasoning?: string;
}) {
  const settings = useStore((state) => state.settings);
  const connected = useStore((state) => state.connected);
  const policy = useMemo(
    () =>
      AgentPolicySettingsSchema.parse({
        agentMode: settings.agentMode,
        agentPolicies: settings.agentPolicies,
        agentPolicyRevision: settings.agentPolicyRevision,
      }),
    [settings.agentMode, settings.agentPolicies, settings.agentPolicyRevision],
  );
  return (
    <div className="chat-preferences">
      <AgentModeControl
        compact
        active={connected}
        disabled={disabled || !connected}
        policy={policy}
        onSave={async (patch) => {
          try {
            await call("settings.set", patch);
            return true;
          } catch {
            return false;
          }
        }}
      />
      <Popover
        label="Model and run options"
        trigger={
          <>
            <span>
              {modelId ?? "Automatic"}
              {reasoning ? ` · ${reasoning}` : ""}
            </span>
            {shellIconDown}
          </>
        }
      >
        {() => <div className="chat-run-menu">{children}</div>}
      </Popover>
    </div>
  );
}
