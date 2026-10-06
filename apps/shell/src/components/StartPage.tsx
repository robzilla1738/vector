import { smallButtonProps } from "../ui/button-props";
import { FeatureSlots } from "../features/registry";
import "./StartPage.css";
import { SessionRecovery } from "./SessionRecovery";
import { AuxMark } from "./AuxMark";
import { useEffect } from "react";
import { useStore } from "../store";
import { useShallow } from "zustand/react/shallow";
import { CommandBar } from "./CommandBar";
import { runCommand } from "../commands";
import { bridge } from "../bridge";
import { RecentWork } from "./RecentWork";
import { RunAttentionFeed, selectAttentionRuns } from "../agent/RunAttentionFeed";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";
import { nativeStatusRoleProps } from "../ui/native-attribute-props";

/** Home shares the Search/Ask entry; Ask retains the durable page-free composer. */
export function StartPage() {
  const focus = useStore((s) => s.focusCommandBar);
  const connected = useStore((s) => s.connected);
  const needsModel = useStore((s) => s.settings.modelConfigured === false);
  const runs = useStore(useShallow((s) => selectAttentionRuns(s.runs)));
  useEffect(() => {
    if (bridge.privateMode) focus("hero");
  }, [focus]);
  return (
    <div className="start aux-home">
      <div className="start-inner">
        {bridge.privateMode ? (
          <>
            <AuxMark />
            <CommandBar hero />
            <section className="private-home" aria-label="Private browsing">
              <strong>Private browsing</strong>
              <span>
                Aux won’t save this window’s tabs, history, site data, or permissions. Files you download
                remain on your Mac.
              </span>
            </section>
          </>
        ) : (
          <>
            <header className="home-welcome" aria-label="Aux">
              <AuxMark />
            </header>
            {needsModel && (
              <div className="home-model-setup">
                <p>Connect an AI model to start chatting. Your draft stays here.</p>
                <button
                  {...auxNativeButtonTypeProps}
                  {...smallButtonProps}
                  data-command-id="settings"
                  onClick={() => {
                    useStore.setState({ settingsCategory: "Models" });
                    runCommand("settings");
                  }}
                >
                  Connect an AI model
                </button>
              </div>
            )}
            <CommandBar hero />
            <SessionRecovery compact />
            {connected && (
              <RunAttentionFeed
                runs={runs}
                onOpenRun={(runId) => useStore.getState().openConversation(runId)}
              />
            )}
            <FeatureSlots slot="startItems" />
            {connected ? (
              <RecentWork />
            ) : (
              <output className="hint home-connection" {...nativeStatusRoleProps}>
                Connecting to Aux… You can keep writing or browse.
              </output>
            )}
          </>
        )}
      </div>
    </div>
  );
}
