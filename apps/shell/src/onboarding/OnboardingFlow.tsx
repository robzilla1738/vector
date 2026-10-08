import { staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { ModelDataDisclosure } from "./ModelDataDisclosure";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AgentPolicySettingsSchema,
  ONBOARDING_STEPS,
  type OnboardingState,
  type OnboardingUpdate,
} from "@aux/contracts";
import { inNativeHost } from "../bridge";
import { call, useStore } from "../store";
import { Dialog } from "../ui";
import { ImportDataSetting } from "../components/ImportDataSetting";
import { LayoutChoice } from "../components/LayoutChoice";
import { ModelsSettings } from "../settings/sections/Models";
import { RecoveryPackage } from "../settings/sections/RecoveryPackage";
import { SPACE_COLORS, type SpaceColor } from "../workspace";
import "./onboarding.css";
import { PastedMemorySetup } from "./PastedMemorySetup";
import { AgentModeControl } from "../features/permissions/AgentModeControl";
import {
  staticGhostButtonProps as auxClassGhostButtonProps,
  staticButtonProps as auxClassButtonProps,
} from "../ui/class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

const TITLES = {
  welcome: "Welcome to Aux",
  import: "Bring your bookmarks and history",
  model: "Choose your AI model",
  appearance: "Make Aux feel like yours",
};
export function OnboardingFlow({
  initialState,
  onClose,
}: {
  initialState: OnboardingState;
  onClose(): void;
}) {
  const [state, setState] = useState(initialState);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const busyRef = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const connected = useStore((s) => s.connected);
  const settings = useStore((s) => s.settings);
  const activeSpace = useStore((s) => s.layout.spaces.find((space) => space.id === s.layout.activeSpaceId));
  const [recovery, setRecovery] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<"checking" | "ready" | "pending" | "unavailable">(
    "checking",
  );
  const restorePending = restoreStatus === "pending";
  const restoreGeneration = useRef(0);
  const [showMemoryImport, setShowMemoryImport] = useState(false);
  const step = state.step;
  const index = ONBOARDING_STEPS.indexOf(step);
  const agentPolicy = useMemo(
    () =>
      AgentPolicySettingsSchema.parse({
        agentMode: settings.agentMode,
        agentPolicies: settings.agentPolicies,
        agentPolicyRevision: settings.agentPolicyRevision,
      }),
    [settings.agentMode, settings.agentPolicies, settings.agentPolicyRevision],
  );
  useEffect(() => {
    // The dialog used to scroll this heading into view. On a long step that
    // parked the step rail on the backdrop, and a click there dismissed setup.
    const region = scroller.current;
    if (region) region.scrollTop = 0;
    heading.current?.focus({ preventScroll: true });
  }, [step]);
  const checkRecovery = useCallback(async () => {
    const attempt = ++restoreGeneration.current;
    if (!inNativeHost || !connected) {
      setRestoreStatus("unavailable");
      return false;
    }
    setRestoreStatus("checking");
    try {
      const value = await call("installation.restoreStatus", {});
      if (restoreGeneration.current !== attempt) return false;
      setRestoreStatus(value.pending ? "pending" : "ready");
      return !value.pending;
    } catch {
      if (restoreGeneration.current === attempt) setRestoreStatus("unavailable");
      return false;
    }
  }, [connected]);
  const invalidateRecovery = useCallback(() => {
    restoreGeneration.current++;
  }, []);
  useEffect(() => {
    if (!recovery || step !== "welcome") return;
    let live = true;
    void Promise.resolve().then(() => {
      if (live) return checkRecovery();
    });
    const refresh = () => {
      void checkRecovery();
    };
    window.addEventListener("focus", refresh);
    return () => {
      live = false;
      invalidateRecovery();
      window.removeEventListener("focus", refresh);
    };
  }, [recovery, step, checkRecovery, invalidateRecovery]);
  async function work(action: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Setup could not be saved. Check progress before trying again.",
      );
      try {
        setState(await call("onboarding.get"));
      } catch {
        /* Keep visible progress while disconnected. */
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  async function update(action: OnboardingUpdate["action"], next?: OnboardingUpdate["step"]) {
    const value = await call("onboarding.update", {
      revision: state.revision,
      action,
      ...(next ? { step: next } : {}),
    });
    setState(value);
    return value;
  }
  const later = () => {
    if (!connected) {
      onClose();
      return;
    }
    void work(async () => {
      await update("later");
      onClose();
    });
  };
  async function saveSettings(patch: Record<string, unknown>) {
    try {
      await call("settings.set", patch);
      const next = await call("settings.get");
      useStore.setState({ settings: next });
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this setting.");
      return false;
    }
  }
  return (
    <Dialog
      label="Set up Aux"
      onClose={later}
      className="aux-dialog-surface onboarding-dialog"
      initialFocusRef={heading}
    >
      <div
        role="presentation"
        className="onboarding-flow"
        onKeyDown={(event) => {
          if (
            step === "welcome" &&
            event.metaKey &&
            event.key === "Enter" &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            event.stopPropagation();
            later();
          }
        }}
      >
        <header>
          <span className="eyebrow">{`AUX · SETUP ${index + 1} OF ${ONBOARDING_STEPS.length}`}</span>
          <button {...smallGhostButtonProps} disabled={busy} onClick={later}>
            Finish later
          </button>
        </header>
        <nav aria-label="Setup steps">
          {ONBOARDING_STEPS.map((item, position) => (
            <button
              key={item}
              {...smallGhostButtonProps}
              disabled={busy || !connected}
              aria-current={step === item ? "step" : undefined}
              aria-label={`${position + 1}. ${item}${state.skipped.includes(item) ? ", skipped" : ""}`}
              onClick={() =>
                void work(async () => {
                  await update("visit", item);
                })
              }
            >
              {position + 1}
            </button>
          ))}
        </nav>
        <div className="onboarding-scroll" ref={scroller}>
          <h1 ref={heading} tabIndex={-1}>
            {TITLES[step]}
          </h1>
          {!connected && (
            <output>
              Aux is disconnected. Saved setup progress is safe; reconnect to continue, or finish later to
              browse.
            </output>
          )}
          <fieldset className="onboarding-content" disabled={!connected} aria-label="Setup choices">
            {step === "welcome" && (
              <>
                <p>
                  Bring your browsing with you, choose a model, and turn a question into a useful first chat.
                </p>
                <p>Every step is optional. Start with what you need.</p>
                <details className="onboarding-details">
                  <summary>Setup tips</summary>
                  <p>
                    Your progress stays with this Profile. Replay setup in Settings → General at any time.
                    Press ⌘↩ to finish later.
                  </p>
                </details>
                <button
                  {...auxClassGhostButtonProps}
                  aria-expanded={recovery}
                  onClick={() => setRecovery(!recovery)}
                >
                  Recover an existing Aux Profile
                </button>
                {recovery && (
                  <fieldset disabled={restoreStatus !== "ready"}>
                    <RecoveryPackage
                      active={connected && restoreStatus === "ready"}
                      refreshVersion={0}
                      pending={restorePending}
                      onStaged={() => setRestoreStatus("pending")}
                    />
                  </fieldset>
                )}
              </>
            )}
            {step === "import" && (
              <>
                <ImportDataSetting />
                <p {...staticHintProps}>
                  Imports continue if you leave. Check progress here before retrying.
                </p>
              </>
            )}
            {step === "model" && (
              <>
                <ModelsSettings active settings={settings} onSave={saveSettings} />
                <ModelDataDisclosure />
                <details className="onboarding-details">
                  <summary>How Aux acts</summary>
                  <p>
                    Ask first is the default. Choose Skip confirmation in the composer when you want Aux to
                    continue without pausing. You can stop or take over at any time.
                  </p>
                  <AgentModeControl
                    active={connected}
                    disabled={busy}
                    policy={agentPolicy}
                    onSave={saveSettings}
                  />
                  <p {...staticHintProps}>
                    Change categories, site rules, and file access in Settings → Permissions.
                  </p>
                </details>
                <button
                  {...auxClassGhostButtonProps}
                  aria-expanded={showMemoryImport}
                  onClick={() => setShowMemoryImport(!showMemoryImport)}
                >
                  Import notes from another assistant
                </button>
                {showMemoryImport && <PastedMemorySetup />}
              </>
            )}
            {step === "appearance" && (
              <>
                <p>
                  Changes apply immediately to this Profile. Try both tab layouts and choose a color for the
                  current Space.
                </p>
                <fieldset disabled={busy}>
                  <legend>Theme</legend>
                  {(["system", "dark", "light"] as const).map((theme) => (
                    <label key={theme}>
                      <input
                        type="radio"
                        name="onboarding-theme"
                        checked={(settings.theme ?? "dark") === theme}
                        onChange={() =>
                          void work(async () => {
                            await saveSettings({ theme });
                          })
                        }
                      />
                      {theme}
                    </label>
                  ))}
                </fieldset>
                <LayoutChoice
                  value={String(settings.tabLayout ?? "vertical")}
                  onChange={(tabLayout) =>
                    void work(async () => {
                      await saveSettings({ tabLayout });
                    })
                  }
                />
                {activeSpace && (
                  <label>
                    Space color
                    <select
                      value={activeSpace.color}
                      disabled={busy}
                      onChange={(event) => {
                        const color = event.target.value as SpaceColor;
                        void work(async () => {
                          await useStore
                            .getState()
                            .editSpace(activeSpace.id, activeSpace.name, color, activeSpace.grain, null);
                        });
                      }}
                    >
                      {SPACE_COLORS.map((color) => (
                        <option key={color}>{color}</option>
                      ))}
                    </select>
                  </label>
                )}
                <p {...staticHintProps}>Your system’s reduced motion and contrast preferences still apply.</p>
              </>
            )}
          </fieldset>
          {error && (
            <div {...nativeAlertRoleProps}>
              <p>{error}</p>
              <button
                {...smallButtonProps}
                disabled={busy}
                onClick={() =>
                  void work(async () => {
                    setState(await call("onboarding.get"));
                  })
                }
              >
                Reload setup progress
              </button>
            </div>
          )}
          {step === "welcome" && recovery && restoreStatus === "unavailable" && (
            <p {...nativeAlertRoleProps}>
              Recovery status is unavailable.{" "}
              <button
                {...smallGhostButtonProps}
                disabled={busy || !connected}
                onClick={() => void checkRecovery()}
              >
                Retry recovery
              </button>
            </p>
          )}
          {restorePending && (
            <output>
              Recovery is staged. Quit Aux normally and reopen to apply it before starting new work.
            </output>
          )}
        </div>
        <footer>
          <button
            {...auxClassGhostButtonProps}
            disabled={busy || !connected}
            onClick={() =>
              void work(async () => {
                const next = await update("skip");
                if (next.status === "complete") onClose();
              })
            }
          >
            Skip this step
          </button>
          {index > 0 && (
            <button
              {...auxClassGhostButtonProps}
              disabled={busy || !connected}
              onClick={() =>
                void work(async () => {
                  await update("visit", ONBOARDING_STEPS[index - 1]);
                })
              }
            >
              Back
            </button>
          )}
          <button
            {...auxClassButtonProps}
            disabled={busy || !connected}
            onClick={() =>
              void work(async () => {
                if (index === ONBOARDING_STEPS.length - 1) {
                  await update("finish");
                  onClose();
                } else await update("visit", ONBOARDING_STEPS[index + 1]);
              })
            }
          >
            {step === "appearance" ? "Finish setup" : "Continue"}
          </button>
        </footer>
      </div>
    </Dialog>
  );
}
