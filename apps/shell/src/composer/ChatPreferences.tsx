import { useMemo, useState, type ReactNode } from "react";
import { AgentPolicySettingsSchema } from "@aux/contracts/agent-policy";
import { call, errToast, useStore } from "../store";
import { AgentModeControl } from "../features/permissions/AgentModeControl";
import { ComposerProjectControl } from "./ComposerProjectControl";
import { ComposerModelControls } from "./ComposerModelControls";
import { errorMessage } from "../error-message";
import { bridge } from "../bridge";
import { Switch } from "../ui";
import "./ChatPreferences.css";

export function ChatPreferences({
  children,
  actions,
  draftKey,
  workspaceId,
  activeRunId,
  disabled,
}: {
  children: ReactNode;
  actions(options: ReactNode): ReactNode;
  draftKey: string;
  workspaceId?: string;
  activeRunId?: string;
  disabled: boolean;
}) {
  const activeMode = useStore(
    (state) => state.runs.find((run) => run.runId === activeRunId)?.config?.agentMode,
  );
  const preferences = useStore((state) => state.composerPreferences[draftKey]);
  const [thisRunOnly, setThisRunOnly] = useState(false);
  const temporary = thisRunOnly || preferences?.agentMode !== undefined;
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
  const effectiveMode = activeMode ?? preferences?.agentMode ?? policy.agentMode;
  const temporaryMode = temporary || (activeMode !== undefined && activeMode !== policy.agentMode);
  return (
    <div className="chat-preferences">
      <div className="chat-preferences-context">
        <AgentModeControl
          compact
          active={connected}
          disabled={disabled || !connected}
          temporary={temporaryMode}
          policy={{ ...policy, agentMode: effectiveMode }}
          onSave={async (patch) => {
            if (temporary) {
              useStore.getState().setComposerPreferences(draftKey, {
                ...(preferences ?? { privateTask: false }),
                agentMode: patch.agentMode,
              });
              return true;
            }
            try {
              await call("settings.set", patch);
              return true;
            } catch {
              return false;
            }
          }}
        />
        <ComposerProjectControl
          draftKey={draftKey}
          workspaceId={workspaceId}
          disabled={disabled || !connected}
        />
      </div>
      <div className="chat-preferences-model">
        <ComposerModelControls draftKey={draftKey} disabled={disabled || !connected} />
        {actions(
          <div className="chat-run-menu-section">
            <header>Run options</header>
            {children}
            <div className="chat-run-menu-section">
              <label className="chat-run-scope">
                <span>This run only</span>
                <Switch
                  checked={temporary}
                  disabled={disabled}
                  onChange={(event) => {
                    setThisRunOnly(event.target.checked);
                    if (!event.target.checked && preferences?.agentMode !== undefined)
                      useStore
                        .getState()
                        .setComposerPreferences(draftKey, { ...preferences, agentMode: undefined });
                  }}
                />
              </label>
              {temporaryMode && <span className="chat-run-menu-note">Temporary confirmation mode</span>}
              {activeRunId && (
                <button
                  type="button"
                  disabled={!connected}
                  onClick={() => {
                    const original = useStore.getState().confirmation;
                    void call("safety.grants.revokeRun", { runId: activeRunId })
                      .then(() => {
                        if (
                          original?.turnId === activeRunId &&
                          ["approval", "touch-id"].includes(original.kind) &&
                          useStore.getState().confirmation === original
                        )
                          useStore.setState({ confirmation: null });
                      })
                      .catch((error) => errToast(errorMessage(error)));
                  }}
                >
                  Reset permissions for this run
                </button>
              )}
            </div>
          </div>,
        )}
      </div>
      {bridge.privateMode && (
        <span
          className="private-ai-disclosure"
          title={
            "Chats disappear when the last private window closes." +
            (settings.localModelsOnly === true
              ? " AI requests use local models only."
              : " Cloud providers handle requests under their own retention policies.")
          }
        >
          {settings.localModelsOnly === true
            ? "Private · Local models only. Chats stay in this private session."
            : "Cloud models send requests to their provider; chats stay in this private session."}
        </span>
      )}
    </div>
  );
}
