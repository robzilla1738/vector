import { staticFieldProps } from "../../ui/class-props";
import { staticRowProps, staticHintProps } from "../../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { errorMessage } from "../../error-message";
import { useEffect, useLayoutEffect, useId, useRef, useState } from "react";
import {
  MODEL_PROVIDER_NAMES,
  type ModelConnectionStatus,
  type ModelProvider,
  type LocalModelServer,
} from "@aux/contracts";
import { ProviderSignIn } from "./ProviderSignIn";
import { ModelConnections } from "./ModelConnections";
import { PreferenceAction, usePreferenceCommand } from "./preference-command";
import {
  useModelControlOwner,
  useModelDraftCommand,
  type ModelControlOwner,
} from "./models-command-controls";
import "./ModelProbeStatus.css";
import {
  DEFAULT_AGENT_MODEL_ROUTES,
  MODEL_REGISTRY,
  agentModelRoute,
  modelPickerEntries,
  isTextModelCandidate,
  type AgentModelCategory,
  type AgentModelRoute,
  type AgentModelRouteChain,
} from "@aux/contracts/model-registry";
import { call } from "../../store";
import { SettingsField as IndexedField, SettingsSection } from "../primitives";
import {
  staticGrowProps as auxReuseStaticGrowProps,
  staticDrawerSectionProps as auxReuseStaticDrawerSectionProps,
} from "../../ui/class-props";
import {
  nativeAutocompleteOffProps as auxReuseNativeAutocompleteOffProps,
  nativeNumberTypeProps as auxReuseNativeNumberTypeProps,
} from "../../ui/native-attribute-props";

/** what settings.get returns in place of the real key */
const KEY_MASK = "••••••••";

interface ModelEntry {
  id: string;
  name?: string;
  textGeneration?: boolean;
}

const KNOWN_PLANNER_MODELS: ModelEntry[] = modelPickerEntries(MODEL_REGISTRY);

const TURN_OPTIONS = [8, 16, 32, 64, 128, 0];
const MODEL_ROLES: readonly { id: AgentModelCategory; label: string; hint: string }[] = [
  { id: "fast", label: "Fast", hint: "Short tasks and lightweight decisions." },
  { id: "standard", label: "Standard", hint: "The default route for everyday runs." },
  { id: "deep", label: "Deep", hint: "Longer reasoning and recovery." },
  { id: "visual", label: "Visual", hint: "Screenshot-based recovery and visual work." },
];

function ModelRoleField({
  role,
  route,
  override,
  overrides,
  options,
  disabled,
  active,
  onSave,
}: {
  active: boolean;
  role: (typeof MODEL_ROLES)[number];
  route: AgentModelRoute;
  override?: AgentModelRouteChain;
  overrides: Partial<Record<AgentModelCategory, AgentModelRouteChain>>;
  options: readonly ModelEntry[];
  disabled: boolean;
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
}) {
  const [modelId, setModelId] = useState(route.modelId);
  const [reasoning, setReasoning] = useState<AgentModelRoute["reasoning"]>(route.reasoning);
  const [pending, setPending] = useState<ModelControlOwner | null>(null);
  const roleOwner = useModelControlOwner(active, `${role.id}:${route.modelId}:${route.reasoning}`);
  const busy = pending === roleOwner;
  const roleScope = useId();
  const selectedOverride = Array.isArray(override) ? override[0] : override;
  const save = (automatic: boolean) =>
    roleOwner.completion(async () => {
      if (busy || disabled || (!automatic && !modelId.trim()) || !roleOwner.reserve("route"))
        throw new Error("Choose the current model route.");
      const next = { ...overrides };
      if (automatic) delete next[role.id];
      else next[role.id] = { modelId: modelId.trim(), reasoning };
      setPending(roleOwner);
      try {
        return await onSave({ agentModelRoutes: next });
      } finally {
        roleOwner.finish("route");
        if (roleOwner.current()) setPending(null);
      }
    });
  return (
    <IndexedField label={`${role.label} model`} hint={role.hint}>
      <div {...staticRowProps}>
        <input
          {...auxReuseStaticGrowProps}
          aria-label={`${role.label} model ID`}
          list={`model-options-${role.id}`}
          value={modelId}
          disabled={busy || disabled}
          onChange={(event) => setModelId(event.target.value)}
        />
        <datalist id={`model-options-${role.id}`}>
          {options.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name ?? model.id}
            </option>
          ))}
        </datalist>
        <select
          aria-label={`${role.label} reasoning`}
          value={reasoning}
          disabled={busy || disabled}
          onChange={(event) => setReasoning(event.target.value as AgentModelRoute["reasoning"])}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="xhigh">Extra high</option>
        </select>
        <PreferenceAction
          command="save-model-role"
          scopeId={roleScope}
          invoke={() => save(false)}
          {...smallButtonProps}
          disabled={
            busy ||
            disabled ||
            !modelId.trim() ||
            (!!selectedOverride &&
              modelId.trim() === selectedOverride.modelId &&
              reasoning === selectedOverride.reasoning)
          }
        >
          Save route
        </PreferenceAction>
        {override && (
          <PreferenceAction
            command="use-automatic-model-role"
            scopeId={roleScope}
            invoke={() => save(true)}
            {...smallGhostButtonProps}
            disabled={busy || disabled}
          >
            Automatic
          </PreferenceAction>
        )}
      </div>
      <span {...staticHintProps}>
        {override ? "Custom route" : "Automatic · follows the configured default for this role"}
      </span>
    </IndexedField>
  );
}

function plannerModelSelection(settings: Record<string, unknown>, provider: ModelProvider): string {
  return typeof settings.plannerModel === "string"
    ? settings.plannerModel
    : provider === "gateway"
      ? DEFAULT_AGENT_MODEL_ROUTES.standard.modelId
      : "";
}

function mergeModelOptions(models: ModelEntry[], configured: string[]): ModelEntry[] {
  const entries = new Map(models.map((model) => [model.id, model]));
  for (const id of configured) {
    if (id && !entries.has(id)) entries.set(id, { id });
  }
  return [...entries.values()].filter(isTextModelCandidate);
}
interface ProbeResult {
  ok: boolean;
  modelId: string;
  latencyMs?: number;
  vision?: boolean;
  error?: string;
  checkedAt?: number;
}

export function ModelsSettings({
  active,
  settings,
  onSave,
}: {
  active: boolean;
  settings: Record<string, unknown>;
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
}) {
  const [key, setKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [switchingProvider, setSwitchingProvider] = useState(false);
  const provider = (settings.modelProvider as ModelProvider) ?? "gateway";
  const providerNames = MODEL_PROVIDER_NAMES;
  const keyInput = useRef<HTMLInputElement>(null),
    modelInput = useRef<HTMLInputElement>(null);
  const focusRequest = useRef<{
    provider: ModelProvider;
    field: "model" | "key";
    owner: ModelControlOwner;
  } | null>(null);
  const [connectionError, setConnectionError] = useState("");
  const [modelDraft, setModelDraft] = useState(() => plannerModelSelection(settings, provider));
  const [endpointDraft, setEndpointDraft] = useState(String(settings.compatibleEndpoint ?? ""));
  const probeSequence = useRef(0);
  const [catalog, setCatalog] = useState<{
    owner: ModelControlOwner;
    models: ModelEntry[];
    localServers: LocalModelServer[];
  } | null>(null);
  const [modelsBusy, setModelsBusy] = useState(false);
  const modelsSequence = useRef(0);
  const [probe, setProbe] = useState<ProbeResult | null>(() => {
    const saved = settings.modelProbe as ProbeResult | undefined;
    return saved ? { ...saved, error: saved.ok ? undefined : "Last connection test failed" } : null;
  });
  // settings often arrive after the first render — surface the saved probe
  // whenever the fetched record changes.
  useEffect(() => {
    const saved = settings.modelProbe as ProbeResult | undefined;
    setProbe(saved ? { ...saved, error: saved.ok ? undefined : "Last connection test failed" } : null);
  }, [settings.modelProbe, settings.modelConnectionRevision, provider]);
  const [probing, setProbing] = useState(false);
  const owner = useModelControlOwner(active, provider);
  const catalogOwner = useModelControlOwner(
    active,
    JSON.stringify([
      provider,
      settings.compatibleEndpoint,
      settings.modelApiKey,
      settings.modelConnectionRevision,
    ]),
  );
  const models = catalog?.owner === catalogOwner ? catalog.models : [];
  const localServers = catalog?.owner === catalogOwner ? catalog.localServers : [];
  const windowOwner = useModelControlOwner(active, "model-window");
  const probeOwner = useModelControlOwner(
    active,
    JSON.stringify([
      provider,
      settings.plannerModel,
      settings.compatibleEndpoint,
      settings.modelApiKey,
      settings.modelAuthentication,
      settings.modelConfigured,
      settings.modelConnectionRevision,
      settings.modelConnections,
    ]),
  );
  useEffect(() => {
    setProbing(false);
    probeSequence.current++;
  }, [probeOwner]);
  const scopeId = useId();
  const providerCommit = useRef({ provider, epoch: 0 });
  useLayoutEffect(() => {
    providerCommit.current = { provider, epoch: providerCommit.current.epoch + 1 };
  }, [owner]);
  const keyDraft = useRef(key);
  const keyGeneration = useRef(0);
  const connection = (settings.modelConnections as ModelConnectionStatus[] | undefined)?.find(
    (item) => item.provider === provider,
  );
  const connected = connection?.enabled !== false;
  useEffect(() => {
    if (focusRequest.current && !focusRequest.current.owner.current()) {
      focusRequest.current = null;
      return;
    }
    if (switchingProvider || focusRequest.current?.provider !== provider) return;
    const field = focusRequest.current.field;
    focusRequest.current = null;
    (field === "key" ? keyInput.current : modelInput.current)?.focus();
  }, [provider, switchingProvider, windowOwner]);
  useEffect(() => {
    if (!catalogOwner.current()) return;
    const sequence = ++modelsSequence.current;
    setCatalog(null);
    setModelsBusy(true);
    setConnectionError("");
    void call("models.list")
      .then((result) => {
        if (catalogOwner.current() && sequence === modelsSequence.current)
          setCatalog({ owner: catalogOwner, models: result.models, localServers: result.localServers ?? [] });
      })
      .catch((error) => {
        if (catalogOwner.current() && sequence === modelsSequence.current)
          setConnectionError(errorMessage(error));
      })
      .finally(() => {
        if (catalogOwner.current() && sequence === modelsSequence.current) setModelsBusy(false);
      });
    return () => {
      ++modelsSequence.current;
    };
  }, [catalogOwner]);

  const keyProvider = useRef(provider);
  useEffect(() => {
    if (keyProvider.current !== provider) {
      keyProvider.current = provider;
      setKey("");
    }
    setSavingKey(false);
    setProbing(false);
    setConnectionError("");
    probeSequence.current++;
  }, [active, provider, owner]);
  const previousModel = useRef({ provider, value: plannerModelSelection(settings, provider) });
  const previousEndpoint = useRef({ provider, value: String(settings.compatibleEndpoint ?? "") });
  useEffect(() => {
    const previous = previousModel.current,
      next = plannerModelSelection(settings, provider);
    setModelDraft((current) =>
      previous.provider !== provider || current === previous.value ? next : current,
    );
    previousModel.current = { provider, value: next };
  }, [settings.plannerModel, provider]);
  useEffect(() => {
    const previous = previousEndpoint.current,
      next = String(settings.compatibleEndpoint ?? "");
    setEndpointDraft((current) =>
      previous.provider !== provider || current === previous.value ? next : current,
    );
    previousEndpoint.current = { provider, value: next };
  }, [settings.compatibleEndpoint, provider]);
  useEffect(
    () => () => {
      probeSequence.current++;
    },
    [],
  );

  const set = (patch: Record<string, unknown>) =>
    owner.completion(async () => {
      const action = Object.keys(patch).join(":");
      if (!owner.reserve(action)) throw new Error("Choose the current model control.");
      try {
        if (
          [
            "gatewayApiKey",
            "plannerModel",
            "modelProvider",
            "modelCredential",
            "modelConnection",
            "compatibleEndpoint",
          ].some((key) => key in patch)
        ) {
          probeSequence.current++;
          setProbe(null);
        }
        return await onSave(patch);
      } finally {
        owner.finish(action);
      }
    });

  const editConnection = (target: ModelProvider, focus: "model" | "key") => {
    const originalProviderEpoch = providerCommit.current.epoch;
    return windowOwner.completion(
      async () => {
        if (!owner.current() || !windowOwner.reserve("provider-edit"))
          throw new Error("Choose the current provider connection.");
        if (target === provider) {
          if (focus === "key") setKey("");
          (focus === "key" ? keyInput.current : modelInput.current)?.focus();
          windowOwner.finish("provider-edit");
          return;
        }
        setSwitchingProvider(true);
        try {
          if (!(await set({ modelProvider: target })))
            throw new Error(
              "Could not select this provider. Stop active tasks or resolve the Settings error first.",
            );
          const committed = providerCommit.current;
          if (
            !windowOwner.current() ||
            !(
              owner.current() ||
              (committed.provider === target && committed.epoch === originalProviderEpoch + 1)
            )
          )
            return;
          setKey("");
          setConnectionError("");
          focusRequest.current = { provider: target, field: focus, owner: windowOwner };
        } finally {
          windowOwner.finish("provider-edit");
          if (windowOwner.current()) setSwitchingProvider(false);
        }
      },
      () =>
        owner.current() ||
        (providerCommit.current.provider === target &&
          providerCommit.current.epoch === originalProviderEpoch + 1),
    );
  };

  const saveKey = () => {
    const originalGeneration = keyGeneration.current;
    return owner.completion(
      async () => {
        if (!owner.current() || savingKey || !key.trim() || key === KEY_MASK || !owner.reserve("key"))
          throw new Error("Choose the current model key draft.");
        const originalDraft = key;
        setSavingKey(true);
        setConnectionError("");
        try {
          const ok = await set({ modelCredential: { provider, key: key.trim() } });
          if (
            !owner.current() ||
            keyDraft.current !== originalDraft ||
            keyGeneration.current !== originalGeneration
          )
            return ok;
          if (ok) setKey("");
          else
            setConnectionError(
              "The key was not saved. Your entry is still here; resolve the storage error and try again.",
            );
          return ok;
        } catch (reason) {
          if (
            !owner.current() ||
            keyDraft.current !== originalDraft ||
            keyGeneration.current !== originalGeneration
          )
            throw reason;
          setConnectionError(
            "The key was not saved. Your entry is still here; resolve the storage error and try again.",
          );
          throw reason;
        } finally {
          owner.finish("key");
          if (owner.current()) setSavingKey(false);
        }
      },
      () => keyGeneration.current === originalGeneration,
    );
  };

  const runProbe = () => {
    let sequence = 0;
    return probeOwner.completion(
      async () => {
        if (!probeOwner.reserve("probe")) throw new Error("Choose the current model connection test.");
        sequence = ++probeSequence.current;
        setProbing(true);
        setProbe(null);
        try {
          const result = await call("models.probe", {
            modelId: (settings.plannerModel as string) || undefined,
          });
          if (probeOwner.current() && sequence === probeSequence.current)
            setProbe({ ...result, checkedAt: Date.now() });
          return result;
        } catch (e) {
          if (probeOwner.current() && sequence === probeSequence.current)
            setProbe({ ok: false, modelId: "", error: errorMessage(e) });
          throw e;
        } finally {
          probeOwner.finish("probe");
          if (probeOwner.current()) setProbing(false);
        }
      },
      () => sequence === probeSequence.current,
    );
  };

  const [keyInputRef, keyButtonRef, keyControlRef, keyRun] = useModelDraftCommand(
    "save-provider-model-key",
    scopeId,
    owner,
    saveKey,
    key,
  );
  const [endpointInputRef, endpointButtonRef, endpointControlRef, endpointRun] = useModelDraftCommand(
    "save-model-endpoint",
    scopeId,
    owner,
    () => set({ compatibleEndpoint: endpointDraft.trim() }),
    endpointDraft,
  );
  const [plannerInputRef, plannerButtonRef, plannerControlRef, plannerRun] = useModelDraftCommand(
    "save-planner-model",
    scopeId,
    owner,
    () => set({ plannerModel: modelDraft.trim() }),
    modelDraft,
  );
  const discoverModels = () =>
    catalogOwner.completion(async () => {
      if (modelsBusy || !catalogOwner.reserve("discovery"))
        throw new Error("Choose the current provider models.");
      const sequence = ++modelsSequence.current;
      setModelsBusy(true);
      setConnectionError("");
      try {
        const result = await call("models.list");
        if (!catalogOwner.current() || sequence !== modelsSequence.current) return result;
        setCatalog({ owner: catalogOwner, models: result.models, localServers: result.localServers ?? [] });
        if (!result.models.length) setConnectionError("The endpoint returned no models.");
        return result;
      } catch (error) {
        if (catalogOwner.current() && sequence === modelsSequence.current)
          setConnectionError(errorMessage(error));
        throw error;
      } finally {
        catalogOwner.finish("discovery");
        if (catalogOwner.current() && sequence === modelsSequence.current) setModelsBusy(false);
      }
    });

  const [localOnlyRef, setLocalOnly] = usePreferenceCommand<HTMLInputElement>(
    "set-local-models-only",
    scopeId,
    (original) => set({ localModelsOnly: original.checked }),
  );
  const [providerRef, selectProvider] = usePreferenceCommand<HTMLSelectElement>(
    "select-model-provider",
    scopeId,
    (original) => editConnection(original.value as ModelProvider, "model"),
  );
  const [visionRef, saveVision] = usePreferenceCommand<HTMLInputElement>(
    "save-vision-model",
    scopeId,
    (original) => {
      if (original.value === String(settings.visionModel ?? "")) return;
      return set({ visionModel: original.value.trim() });
    },
  );
  const [workerRef, saveWorkers] = usePreferenceCommand<HTMLInputElement>(
    "set-model-worker-limit",
    scopeId,
    (original) => set({ maxWorkers: Number(original.value) }),
  );
  const [turnRef, saveTurns] = usePreferenceCommand<HTMLSelectElement>(
    "set-model-turn-limit",
    scopeId,
    (original) => set({ maxModelCalls: Number(original.value) }),
  );
  const [detailsRef, showDetails] = usePreferenceCommand<HTMLElement>(
    "show-model-probe-details",
    scopeId,
    (original) => {
      if (!owner.current() || !probe || probe.ok || !probe.error || !(original instanceof HTMLDetailsElement))
        throw new Error("Choose the current model test details.");
      original.open = !original.open;
    },
  );
  const plannerModel = plannerModelSelection(settings, provider);
  const plannerOptions = mergeModelOptions(
    [...(provider === "gateway" ? KNOWN_PLANNER_MODELS : []), ...models],
    [plannerModel, String(settings.visionModel ?? "")],
  );
  const roleOverrides = (settings.agentModelRouteOverrides ?? {}) as Partial<
    Record<AgentModelCategory, AgentModelRouteChain>
  >;
  const roleRoutes = (settings.agentModelRoutes ?? {}) as Partial<
    Record<AgentModelCategory, AgentModelRoute>
  >;
  const contributorSelected =
    plannerModel === "meta/muse-spark-1.3-contributor" ||
    modelDraft.trim() === "meta/muse-spark-1.3-contributor" ||
    Object.values(roleRoutes).some((route) => route.modelId === "meta/muse-spark-1.3-contributor");
  const turnValue = (settings.maxModelCalls as number) ?? 0;
  const turnOptions = TURN_OPTIONS.includes(turnValue) ? TURN_OPTIONS : [turnValue, ...TURN_OPTIONS];
  const hasKey =
    settings.modelApiKey === KEY_MASK || (provider === "gateway" && settings.gatewayApiKey === KEY_MASK);
  const localCompatible =
    provider === "openai-compatible" &&
    (() => {
      try {
        return ["localhost", "127.0.0.1", "[::1]"].includes(
          new URL(String(settings.compatibleEndpoint ?? "")).hostname,
        );
      } catch {
        return false;
      }
    })();
  const accountProvider =
    settings.modelAuthentication === "chatgpt"
      ? "ChatGPT"
      : settings.modelAuthentication === "vercel"
        ? "Vercel"
        : settings.modelAuthentication === "copilot"
          ? "GitHub Copilot"
          : undefined;
  const accountReady = !!accountProvider && settings.modelConfigured === true;
  const connectionReady = connected && (accountProvider ? accountReady : hasKey || localCompatible);

  return (
    <SettingsSection name="Models" hidden={!active}>
      <output {...staticFieldProps} data-block>
        {!connected
          ? `${providerNames[provider]} is disconnected. Reconnect explicitly before making requests.`
          : accountProvider
            ? accountReady
              ? `${accountProvider} account configured. You can start chatting or test the connection.`
              : String(
                  settings.modelCredentialError ?? `Finish connecting ${accountProvider} and choose a model.`,
                )
            : probe?.ok
              ? `${providerNames[provider]} is ready.`
              : localCompatible
                ? "Local model endpoint configured. Save a model to start chatting; you can also test the connection."
                : hasKey
                  ? `${providerNames[provider]} key configured. Save a model to start chatting; you can also test the connection.`
                  : "Agent setup needed. Browsing, saved tasks, and evidence review are available without a model."}
      </output>
      <ModelConnections
        settings={settings}
        active={active}
        disabled={savingKey || probing || switchingProvider}
        onSave={set}
        onEdit={editConnection}
      />
      {active && settings.localModelsOnly !== true && <ProviderSignIn onConnected={() => set({})} />}
      <IndexedField
        label="Local models only"
        hint="Cloud model calls and image generation are disabled. Choose an available local model below."
      >
        <input
          type="checkbox"
          aria-label="Local models only"
          checked={settings.localModelsOnly === true}
          disabled={savingKey || probing || switchingProvider}
          ref={localOnlyRef}
          data-command-id="set-local-models-only"
          onChange={setLocalOnly}
        />
      </IndexedField>
      <IndexedField
        label="Local model servers"
        hint="Discovery checks only this computer. No credentials are sent."
      >
        <PreferenceAction
          command="refresh-local-models"
          scopeId={scopeId}
          invoke={discoverModels}
          disabled={modelsBusy || savingKey || probing || switchingProvider}
          {...smallButtonProps}
        >
          {modelsBusy ? "Discovering…" : "Refresh models"}
        </PreferenceAction>
        {!modelsBusy && !localServers.length && (
          <span {...staticHintProps}>No local model server found.</span>
        )}
        {localServers.map((server) => (
          <div key={server.endpoint}>
            <span>
              {server.kind === "ollama"
                ? "Ollama"
                : server.kind === "lm-studio"
                  ? "LM Studio"
                  : "OpenAI-compatible"}{" "}
              · {server.endpoint}
            </span>
            {!server.models.some(isTextModelCandidate) && (
              <span {...staticHintProps}>No text models advertised.</span>
            )}
            {server.models.filter(isTextModelCandidate).map((model) => (
              <PreferenceAction
                key={model.id}
                command="use-local-model"
                scopeId={`${scopeId}:${server.endpoint}:${model.id}`}
                {...smallButtonProps}
                disabled={savingKey || probing || switchingProvider}
                invoke={() =>
                  set({
                    modelProvider: "openai-compatible",
                    compatibleEndpoint: server.endpoint,
                    plannerModel: model.id,
                    modelConnection: { provider: "openai-compatible", enabled: true },
                  })
                }
              >
                Use {model.name ?? model.id}
              </PreferenceAction>
            ))}
          </div>
        ))}
      </IndexedField>
      <IndexedField
        compact
        label="Model provider"
        hint="Switching providers changes where task context and screenshots are sent. Each provider keeps its own key and model choices; there is no automatic fallback to another provider."
      >
        <select
          aria-label="Model provider"
          value={provider}
          disabled={savingKey || probing || switchingProvider}
          ref={providerRef}
          data-command-id="select-model-provider"
          onChange={selectProvider}
        >
          {Object.entries(providerNames).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </IndexedField>
      {provider === "openai-compatible" && (
        <IndexedField
          label="Endpoint"
          hint="Prompts and screenshots are sent here. Remote endpoints must use HTTPS; localhost may use HTTP."
        >
          <div {...staticRowProps} ref={endpointControlRef}>
            <input
              ref={endpointInputRef}
              {...auxReuseStaticGrowProps}
              aria-label="OpenAI-compatible endpoint"
              inputMode="url"
              autoComplete="url"
              placeholder="https://example.com/v1"
              value={endpointDraft}
              disabled={probing || savingKey || switchingProvider}
              onChange={(event) => {
                probeSequence.current++;
                setEndpointDraft(event.target.value);
                setProbe(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && endpointDraft.trim()) {
                  event.preventDefault();
                  endpointRun(event);
                }
              }}
            />
            <button
              {...smallButtonProps}
              disabled={
                probing ||
                savingKey ||
                switchingProvider ||
                !endpointDraft.trim() ||
                endpointDraft.trim() === String(settings.compatibleEndpoint ?? "")
              }
              ref={endpointButtonRef}
              data-command-id="save-model-endpoint"
              onClick={endpointRun}
            >
              Save endpoint
            </button>
            <PreferenceAction
              command="discover-provider-models"
              scopeId={scopeId}
              invoke={discoverModels}
              {...smallButtonProps}
              disabled={
                probing ||
                savingKey ||
                switchingProvider ||
                modelsBusy ||
                !settings.compatibleEndpoint ||
                !connectionReady ||
                endpointDraft.trim() !== String(settings.compatibleEndpoint ?? "")
              }
            >
              {modelsBusy ? "Discovering…" : "Discover models"}
            </PreferenceAction>
          </div>
        </IndexedField>
      )}
      {provider !== "openai-compatible" && (
        <span className="hint field">
          Destination: {String(settings.modelEndpoint ?? "Vercel AI Gateway")}. Enter a model ID available to
          your account. Open Developers settings to connect an external MCP client.
        </span>
      )}
      <IndexedField
        label={`${providerNames[provider]} API key`}
        target="Model provider"
        hint={
          <>
            {settings.modelAuthentication === "chatgpt" && (
              <>
                ChatGPT plan usage is selected. Saving an OpenAI API key switches this provider to separate
                API billing.{" "}
              </>
            )}
            {!connected && <>This provider is disconnected. Saving a key does not reconnect it. </>}
            {String(
              settings.modelCredentialError ??
                (provider === "gateway" ? settings.gatewayCredentialError : undefined) ??
                (settings.modelCredentialSource === "environment"
                  ? "Using a process environment key. Change it in your launch environment."
                  : hasKey
                    ? "Key saved with OS encryption."
                    : accountProvider
                      ? `${accountProvider} account usage is selected. An API key is not required for this route.`
                      : localCompatible
                        ? "Optional for localhost. Add a key only if your local server requires one."
                        : "No key configured. Saved keys require OS encryption."),
            )}
          </>
        }
      >
        <div {...staticRowProps} ref={keyControlRef}>
          <input
            ref={(node) => {
              keyInput.current = node;
              keyInputRef(node);
            }}
            type="password"
            aria-label="Provider API key"
            {...auxReuseNativeAutocompleteOffProps}
            disabled={savingKey || probing || switchingProvider}
            {...auxReuseStaticGrowProps}
            value={key}
            placeholder={
              hasKey
                ? "Key saved — enter a new key to replace"
                : accountProvider
                  ? "Optional — switch to API key billing"
                  : localCompatible
                    ? "Optional for this local endpoint"
                    : "Enter this provider’s API key"
            }
            onChange={(e) => {
              probeSequence.current++;
              keyGeneration.current++;
              keyDraft.current = e.target.value;
              setKey(e.target.value);
              setProbe(null);
              setConnectionError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                keyRun(e);
              }
            }}
          />
          <button
            {...smallButtonProps}
            disabled={savingKey || probing || switchingProvider || !key.trim() || key === KEY_MASK}
            ref={keyButtonRef}
            data-command-id="save-provider-model-key"
            onClick={keyRun}
          >
            {savingKey ? "Saving…" : "Save key"}
          </button>
        </div>
      </IndexedField>

      {connectionError && (
        <p {...staticFieldProps} role="alert">
          {connectionError}
        </p>
      )}
      <IndexedField
        label="Planner model"
        hint="Enter the exact model ID for the selected provider. Availability depends on your account."
      >
        <div {...staticRowProps} ref={plannerControlRef}>
          <input
            {...auxReuseStaticGrowProps}
            ref={(node) => {
              modelInput.current = node;
              plannerInputRef(node);
            }}
            aria-label="Planner model"
            aria-describedby={contributorSelected ? "contributor-data-use" : undefined}
            list="agent-model-options"
            value={modelDraft}
            disabled={probing || savingKey || switchingProvider}
            onChange={(event) => {
              probeSequence.current++;
              setModelDraft(event.target.value);
              setProbe(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                plannerRun(event);
              }
            }}
          />
          <datalist id="agent-model-options">
            {plannerOptions.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name ?? model.id}
              </option>
            ))}
          </datalist>
          <button
            {...smallButtonProps}
            disabled={
              probing ||
              savingKey ||
              switchingProvider ||
              !modelDraft.trim() ||
              modelDraft.trim() === plannerModel
            }
            ref={plannerButtonRef}
            data-command-id="save-planner-model"
            onClick={plannerRun}
          >
            Save model
          </button>
          <PreferenceAction
            command="probe-model-connection"
            scopeId={scopeId}
            invoke={runProbe}
            {...smallButtonProps}
            disabled={
              probing ||
              savingKey ||
              switchingProvider ||
              !modelDraft.trim() ||
              !connectionReady ||
              !!key.trim() ||
              modelDraft.trim() !== plannerModel
            }
          >
            {probing ? "Testing…" : "Test connection"}
          </PreferenceAction>
        </div>
        {contributorSelected && (
          <p {...staticHintProps} id="contributor-data-use">
            <strong>Contributor data use.</strong> This tier lets Meta use prompts and completions sent to it
            to improve its models.
          </p>
        )}
        {probe && (
          <>
            <output className={`hint model-probe-status ${probe.ok ? "ok" : "err"}`}>
              {probe.ok
                ? `Connection tested${probe.latencyMs == null ? "" : ` · ${probe.latencyMs} ms`}${probe.vision === true ? " · vision" : probe.vision === false ? " · no vision" : ""}`
                : "Connection test failed. Check your provider settings, then try again."}
              {probe.checkedAt ? ` · ${new Date(probe.checkedAt).toLocaleString()}` : ""}
            </output>
            {!probe.ok && probe.error && (
              <details className="hint model-probe-details" ref={detailsRef}>
                <summary
                  data-command-id="show-model-probe-details"
                  onClick={(event) => {
                    event.preventDefault();
                    showDetails(event);
                  }}
                >
                  Connection test details
                </summary>
                <p>{probe.error}</p>
              </details>
            )}
          </>
        )}
      </IndexedField>

      <p className="field hint">
        Test connection sends small synthetic model requests and may incur provider charges. It does not send
        your open pages. Save key and model changes before testing.
      </p>
      <IndexedField
        label="Vision model"
        hint="Used for screenshot-based recovery. Select a model that accepts images and confirm its capability with your provider."
      >
        <input
          aria-label="Vision model"
          key={`${provider}:${settings.visionModel}`}
          defaultValue={String(settings.visionModel ?? "")}
          placeholder="Same as planner"
          disabled={switchingProvider || probing || savingKey}
          ref={visionRef}
          data-command-id="save-vision-model"
          onBlur={saveVision}
        />
      </IndexedField>

      <h3 {...auxReuseStaticDrawerSectionProps}>Model roles</h3>
      <p className="field hint">
        Automatic follows the planner model for Fast and Standard, the recovery model for Deep, and the vision
        model for Visual. Save a specific model ID and reasoning level to override one role.
      </p>
      {MODEL_ROLES.map((role) => {
        const route = roleRoutes[role.id] ?? agentModelRoute(role.id);
        const override = roleOverrides[role.id];
        return (
          <ModelRoleField
            key={`${provider}:${role.id}:${route.modelId}:${route.reasoning}:${JSON.stringify(override)}`}
            role={role}
            active={active}
            route={route}
            override={override}
            overrides={roleOverrides}
            options={plannerOptions}
            disabled={probing || savingKey || switchingProvider}
            onSave={set}
          />
        );
      })}

      <div className="row two">
        <IndexedField label="Parallel worker pages">
          <input
            aria-label="Parallel worker pages"
            {...auxReuseNativeNumberTypeProps}
            min={1}
            max={16}
            defaultValue={(settings.maxWorkers as number) ?? 4}
            ref={workerRef}
            data-command-id="set-model-worker-limit"
            onBlur={saveWorkers}
          />
        </IndexedField>
        <IndexedField
          label="Max model turns per run"
          hint="How many planner calls a run may make. No limit keeps going until the goal finishes or you stop it."
        >
          <select
            aria-label="Max model turns per run"
            value={String(turnValue)}
            ref={turnRef}
            data-command-id="set-model-turn-limit"
            onChange={saveTurns}
          >
            {turnOptions.map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "No limit" : String(n)}
              </option>
            ))}
          </select>
        </IndexedField>
      </div>
    </SettingsSection>
  );
}
