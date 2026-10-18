import { useEffect, useRef, useState } from "react";
import {
  MODEL_PROVIDER_NAMES,
  ModelProviderSchema,
  ModelConnectionStatusSchema,
  type ModelProvider,
} from "@aux/contracts";
import {
  MODEL_REGISTRY,
  agentModelRoute,
  isTextModelCandidate,
  type AgentModelCategory,
  type AgentModelRoute,
  type AgentModelRouteChain,
} from "@aux/contracts/model-registry";
import { call } from "../../store";
import { staticMenuItemProps } from "../../ui/class-props";
import { errorMessage } from "../../error-message";
import { Dialog } from "../../ui/dialog";
import { Popover } from "../../ui/popover";
import { Check, Plus, Search } from "../../ui/icons";
import "../../composer/ComposerModelPicker.css";
import { moveListFocus } from "../../keyboard-list";
import { SettingsSection } from "../primitives";
import { ModelConnections } from "./ModelConnections";
import { ModelsSettings } from "./Models";
import { useModelControlOwner } from "./models-command-controls";
import "./ModelsOverview.css";
import { focusSettingsDestination } from "../search-focus";
import type { SettingsSearchItem } from "../search";

import { ProviderSignIn, type SignInProvider } from "./ProviderSignIn";
import { ModelProviderMark } from "../../ui/model-provider";
import { CopilotSignIn } from "./CopilotSignIn";

const accountOptions = [
  { id: "chatgpt", label: "ChatGPT", group: "Subscription" },
  { id: "openrouter", label: "OpenRouter", group: "Account" },
  { id: "vercel", label: "Vercel AI Gateway", group: "Account" },
  { id: "copilot", label: "GitHub Copilot · catalog setup", group: "Catalog" },
] as const;
type AccountProvider = SignInProvider | "copilot";

import { ModelChoice, type ModelOption } from "../../ui/model-choice";
const roles: { id: AgentModelCategory; label: string; hint: string }[] = [
  { id: "fast", label: "Fast", hint: "Quick chats and lightweight tasks." },
  { id: "standard", label: "Standard", hint: "Balanced reasoning and everyday work." },
  { id: "deep", label: "Deep", hint: "Longer reasoning and complex work." },
  { id: "visual", label: "Visual", hint: "Screenshots, images and visual tasks." },
];

export function ModelsOverview({
  active,
  settings,
  onSave,
  destination,
  onDestinationHandled,
}: {
  destination?: SettingsSearchItem | null;
  onDestinationHandled?(): void;
  active: boolean;
  settings: Record<string, unknown>;
  onSave(patch: Record<string, unknown>): Promise<boolean>;
}) {
  const [editor, setEditor] = useState(false);
  const [account, setAccount] = useState<AccountProvider>();
  const [editorTarget, setEditorTarget] = useState<string>();
  const editorReturn = useRef<HTMLElement | null>(null);
  const openEditor = (target?: string) => {
    editorReturn.current = document.activeElement as HTMLElement | null;
    setEditorTarget(target);
    setEditor(true);
  };
  const container = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!editor || !editorTarget) return;
    if (editorTarget === "API key") {
      dialog.current?.querySelector<HTMLInputElement>('[aria-label="Provider API key"]')?.focus();
      return;
    }
    const controller = new AbortController();
    void focusSettingsDestination(
      dialog.current,
      {
        category: "Models",
        target: editorTarget,
        label: editorTarget,
        description: "",
      },
      controller.signal,
    );
    return () => controller.abort();
  }, [editor, editorTarget]);
  const handled = useRef(onDestinationHandled);
  handled.current = onDestinationHandled;
  useEffect(() => {
    if (!active || !destination) return;
    const target = destination.target;
    const onPage =
      !target ||
      [...(container.current?.querySelectorAll<HTMLElement>("[data-setting]") ?? [])].some(
        (node) => node.dataset.setting === target,
      );
    if (!onPage && !editor) {
      setEditor(true);
      return;
    }
    const controller = new AbortController();
    void focusSettingsDestination(
      onPage ? container.current : dialog.current,
      destination,
      controller.signal,
    ).then(() => {
      if (!controller.signal.aborted) handled.current?.();
    });
    return () => controller.abort();
  }, [active, destination, editor]);
  const trigger = useRef<HTMLButtonElement>(null);
  const [catalog, setCatalog] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const owner = useModelControlOwner(
    active,
    JSON.stringify([settings.modelProvider, settings.modelConnectionRevision]),
  );
  const windowOwner = useModelControlOwner(active, "model-overview-window");
  const provider = (settings.modelProvider as ModelProvider) ?? "gateway";
  useEffect(() => {
    if (!active) setEditor(false);
    if (!active || settings.localModelsOnly === true) setAccount(undefined);
  }, [active, settings.localModelsOnly]);
  useEffect(() => {
    if (!active) return;
    let live = true;
    setLoading(true);
    setCatalog([]);
    setError("");
    void call("models.list", {})
      .then((result) => {
        if (live) setCatalog(result.models.filter(isTextModelCandidate));
      })
      .catch((reason) => {
        if (live) setError(errorMessage(reason));
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [active, provider, settings.modelConnectionRevision]);
  async function save(patch: Record<string, unknown>) {
    if (!owner.current() || !owner.reserve("overview")) return false;
    setBusy(true);
    setError("");
    try {
      const saved = await onSave(patch);
      if (!saved && owner.current()) setError("The change could not be saved. Try again.");
      return saved;
    } catch (reason) {
      if (owner.current()) setError(errorMessage(reason));
      return false;
    } finally {
      owner.finish("overview");
      if (owner.current()) setBusy(false);
    }
  }
  useEffect(() => {
    setBusy(false);
  }, [owner]);
  const parsed = ModelConnectionStatusSchema.array().safeParse(settings.modelConnections);
  const connected = parsed.success
    ? parsed.data.filter(
        (item) =>
          item.selected ||
          item.credentialSource !== "none" ||
          item.credentialUnavailable ||
          item.localEndpoint,
      )
    : undefined;
  const options = [
    ...new Map(
      [...(provider === "gateway" ? MODEL_REGISTRY.filter(isTextModelCandidate) : []), ...catalog].map(
        (model) => [
          model.id,
          {
            ...model,
            provider: model.provider ?? MODEL_REGISTRY.find((entry) => entry.id === model.id)?.provider,
          },
        ],
      ),
    ).values(),
  ];
  const routes = (settings.agentModelRoutes ?? {}) as Partial<Record<AgentModelCategory, AgentModelRoute>>;
  const overrides = (settings.agentModelRouteOverrides ?? {}) as Partial<
    Record<AgentModelCategory, AgentModelRouteChain>
  >;
  return (
    <div ref={container} hidden={!active}>
      <SettingsSection name="Models" hidden={!active} className="models-overview">
        <ModelConnections
          concise
          settings={{ ...settings, modelConnections: connected }}
          active={active && !editor && !account}
          disabled={busy}
          onSave={save}
          onEdit={async (target, focus) => {
            if (!owner.current()) return;
            if ((target === provider || (await save({ modelProvider: target }))) && windowOwner.current())
              openEditor(focus === "key" ? "API key" : "Model provider");
          }}
        >
          <ConnectModels
            disabled={busy}
            triggerRef={trigger}
            allowAccounts={settings.localModelsOnly !== true}
            onAccount={(next) => {
              editorReturn.current = trigger.current;
              setAccount(next);
            }}
            onSelect={async (target) => {
              if (!windowOwner.current()) return;
              if ((target === provider || (await save({ modelProvider: target }))) && windowOwner.current())
                openEditor("Model provider");
            }}
          />
          <h3>Task models</h3>
          <ModelChoice
            label="Default model"
            hint="The model used by default for new chats."
            value={String(settings.plannerModel ?? "")}
            options={options}
            disabled={!active}
            pending={busy}
            loading={loading}
            onChange={(id) => save({ plannerModel: id })}
            actions={[
              { label: "Model options…", disabled: busy, onSelect: () => openEditor("Planner model") },
            ]}
          />
          <div className="model-task-roles">
            {roles.map((role) => {
              const route = routes[role.id] ?? agentModelRoute(role.id);
              return (
                <ModelChoice
                  key={role.id}
                  label={role.label}
                  hint={role.hint}
                  value={route.modelId}
                  automatic={!overrides[role.id]}
                  options={options}
                  disabled={!active}
                  pending={busy}
                  loading={loading}
                  actions={[
                    ...(["low", "medium", "high", "xhigh"] as const).map((reasoning) => ({
                      label: `${reasoning === "xhigh" ? "Extra high" : reasoning.charAt(0).toUpperCase() + reasoning.slice(1)} reasoning`,
                      icon: route.reasoning === reasoning ? <Check /> : undefined,
                      disabled: busy,
                      onSelect: () => {
                        void save({
                          agentModelRoutes: {
                            ...overrides,
                            [role.id]: { modelId: route.modelId, reasoning },
                          },
                        });
                      },
                    })),
                    {
                      label: "Use automatic route",
                      disabled: busy || !overrides[role.id],
                      onSelect: () => {
                        const next = { ...overrides };
                        delete next[role.id];
                        void save({ agentModelRoutes: next });
                      },
                    },
                    {
                      label: "Model options…",
                      disabled: busy,
                      onSelect: () => openEditor(`${role.label} model`),
                    },
                  ]}
                  onChange={(id) => {
                    const next = { ...overrides };
                    if (id === undefined) delete next[role.id];
                    else next[role.id] = { modelId: id, reasoning: route.reasoning };
                    return save({ agentModelRoutes: next });
                  }}
                />
              );
            })}
          </div>
        </ModelConnections>
        {error && <p role="alert">{error}</p>}
        <button type="button" className="btn ghost model-advanced" onClick={() => openEditor()}>
          Model settings…
        </button>
        {active && settings.localModelsOnly !== true && account && (
          <Dialog
            label={`Connect ${accountOptions.find((option) => option.id === account)!.label}`}
            className="aux-dialog-surface model-account-dialog"
            returnFocus={editorReturn}
            onClose={() => setAccount(undefined)}
          >
            <header>
              <h3>{accountOptions.find((option) => option.id === account)!.label}</h3>
              <button type="button" className="btn" onClick={() => setAccount(undefined)}>
                Done
              </button>
            </header>
            {account === "copilot" ? (
              <CopilotSignIn />
            ) : (
              <ProviderSignIn only={account} onConnected={() => onSave({})} />
            )}
          </Dialog>
        )}
        {active && editor && (
          <Dialog
            dialogRef={dialog}
            label="Model settings"
            className="aux-dialog-surface model-settings-dialog"
            returnFocus={editorReturn}
            onClose={() => setEditor(false)}
          >
            <header>
              <h3>Model settings</h3>
              <button type="button" className="btn" onClick={() => setEditor(false)}>
                Done
              </button>
            </header>
            <ModelsSettings active settings={settings} onSave={onSave} />
          </Dialog>
        )}
      </SettingsSection>
    </div>
  );
}

function ConnectModels({
  disabled,
  triggerRef,
  onSelect,
  onAccount,
  allowAccounts,
}: {
  disabled: boolean;
  triggerRef: import("react").RefObject<HTMLButtonElement | null>;
  onSelect(provider: ModelProvider): Promise<void>;
  onAccount(provider: AccountProvider): void;
  allowAccounts: boolean;
}) {
  const [query, setQuery] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const accounts = allowAccounts
    ? accountOptions.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))
    : [];
  const providers = ModelProviderSchema.options.filter((provider) =>
    MODEL_PROVIDER_NAMES[provider].toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <Popover
      label="Connect model provider"
      className="model-connect-row"
      disabled={disabled}
      initialFocusRef={search}
      trigger={
        <>
          <Plus />
          Connect
        </>
      }
      triggerControl={(node) => {
        triggerRef.current = node;
      }}
    >
      {(close) => (
        <div
          className="settings-model-picker settings-provider-picker"
          onKeyDown={(event) => {
            if (event.target === search.current) {
              if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
              event.preventDefault();
              const choices =
                event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
              (event.key === "ArrowDown" ? choices[0] : choices[choices.length - 1])?.focus();
              return;
            }
            moveListFocus(event, "button:not(:disabled)");
          }}
        >
          <label className="settings-model-search" data-input-surface>
            <Search />
            <input
              ref={search}
              aria-label="Search providers"
              placeholder="Search providers"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="settings-model-options">
            {["Subscription", "Account", "Catalog"].map((group) => {
              const matches = accounts.filter((option) => option.group === group);
              return matches.length ? (
                <div key={group}>
                  <p className="menu-label">{group}</p>
                  {matches.map((option) => (
                    <button
                      key={option.id}
                      {...staticMenuItemProps}
                      type="button"
                      onClick={() => {
                        close();
                        onAccount(option.id);
                      }}
                    >
                      <ModelProviderMark provider={option.id} />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              ) : null;
            })}
            {providers.length > 0 && <p className="menu-label">API</p>}
            {!providers.length && !accounts.length && <p>No matching providers</p>}
            {providers.map((provider) => (
              <button
                type="button"
                key={provider}
                {...staticMenuItemProps}
                onClick={() => {
                  close();
                  void onSelect(provider);
                }}
              >
                <ModelProviderMark provider={provider} />
                <span>{MODEL_PROVIDER_NAMES[provider]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Popover>
  );
}
