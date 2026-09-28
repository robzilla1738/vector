import { useEffect, useRef, useState } from "react";
import type { ModelProvider } from "@aux/contracts";
import {
  DEFAULT_PLANNER_MODEL_ID,
  MODEL_REGISTRY,
  agentModelRoute,
  modelPickerEntries,
  type AgentModelCategory,
  type AgentModelRoute,
  type AgentModelRouteChain,
} from "@aux/contracts/model-registry";
import { call, toast } from "../../store";
import { SettingsField as IndexedField, SettingsSection } from "../primitives";

/** what settings.get returns in place of the real key */
const KEY_MASK = "••••••••";

interface ModelEntry {
  id: string;
  name?: string;
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
  onSave,
}: {
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
  const [busy, setBusy] = useState(false);
  const selectedOverride = Array.isArray(override) ? override[0] : override;
  const save = async (automatic: boolean) => {
    if (busy || disabled || (!automatic && !modelId.trim())) return;
    const next = { ...overrides };
    if (automatic) delete next[role.id];
    else next[role.id] = { modelId: modelId.trim(), reasoning };
    setBusy(true);
    try {
      await onSave({ agentModelRoutes: next });
    } finally {
      setBusy(false);
    }
  };
  return (
    <IndexedField label={`${role.label} model`} hint={role.hint}>
      <div className="row">
        <input
          className="grow"
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
          <option value="xhigh">Extra high</option>
        </select>
        <button
          className="btn sm"
          disabled={
            busy ||
            disabled ||
            !modelId.trim() ||
            (!!selectedOverride &&
              modelId.trim() === selectedOverride.modelId &&
              reasoning === selectedOverride.reasoning)
          }
          onClick={() => void save(false)}
        >
          Save route
        </button>
        {override && (
          <button className="btn sm ghost" disabled={busy || disabled} onClick={() => void save(true)}>
            Automatic
          </button>
        )}
      </div>
      <span className="hint">
        {override ? "Custom route" : "Automatic · follows the configured default for this role"}
      </span>
    </IndexedField>
  );
}

function plannerModelSelection(settings: Record<string, unknown>, provider: ModelProvider): string {
  return typeof settings.plannerModel === "string"
    ? settings.plannerModel
    : provider === "gateway"
      ? DEFAULT_PLANNER_MODEL_ID
      : "";
}

function mergeModelOptions(models: ModelEntry[], current?: string): ModelEntry[] {
  const out: ModelEntry[] = [];
  const seen = new Set<string>();
  for (const m of [...KNOWN_PLANNER_MODELS, ...models, ...(current ? [{ id: current }] : [])]) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    out.push(m);
  }
  return out;
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
  const providerNames: Record<ModelProvider, string> = {
    gateway: "Vercel AI Gateway",
    openai: "OpenAI",
    anthropic: "Anthropic",
    google: "Google",
    "openai-compatible": "OpenAI-compatible",
  };
  const [connectionError, setConnectionError] = useState("");
  const [modelDraft, setModelDraft] = useState(() => plannerModelSelection(settings, provider));
  const [endpointDraft, setEndpointDraft] = useState(String(settings.compatibleEndpoint ?? ""));
  const probeSequence = useRef(0);
  const [models, setModels] = useState<ModelEntry[]>([]);
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
    if (saved) setProbe({ ...saved, error: saved.ok ? undefined : "Last connection test failed" });
  }, [settings.modelProbe]);
  const [probing, setProbing] = useState(false);
  useEffect(() => {
    if (!active) return;
    const sequence = ++modelsSequence.current;
    setModels([]);
    setModelsBusy(true);
    void call("models.list")
      .then((result) => {
        if (sequence === modelsSequence.current) setModels(result.models);
      })
      .catch(() => {})
      .finally(() => {
        if (sequence === modelsSequence.current) setModelsBusy(false);
      });
    return () => {
      ++modelsSequence.current;
    };
  }, [active, provider, settings.compatibleEndpoint, settings.modelApiKey]);

  useEffect(() => {
    setModelDraft(plannerModelSelection(settings, provider));
  }, [settings.plannerModel, provider]);
  useEffect(() => {
    setEndpointDraft(String(settings.compatibleEndpoint ?? ""));
  }, [settings.compatibleEndpoint, provider]);
  useEffect(
    () => () => {
      probeSequence.current++;
    },
    [],
  );

  const set = async (patch: Record<string, unknown>) => {
    if (
      ["gatewayApiKey", "plannerModel", "modelProvider", "modelCredential", "compatibleEndpoint"].some(
        (key) => key in patch,
      )
    ) {
      probeSequence.current++;
      setProbe(null);
    }
    return onSave(patch);
  };

  const saveKey = async () => {
    if (savingKey || !key.trim() || key === KEY_MASK) return;
    setSavingKey(true);
    setConnectionError("");
    const ok = await set({ modelCredential: { provider, key: key.trim() } });
    if (ok) setKey("");
    else
      setConnectionError(
        "The key was not saved. Your entry is still here; resolve the storage error and try again.",
      );
    setSavingKey(false);
  };

  const runProbe = async () => {
    const sequence = ++probeSequence.current;
    setProbing(true);
    setProbe(null);
    try {
      const result = await call("models.probe", { modelId: (settings.plannerModel as string) || undefined });
      if (sequence === probeSequence.current) setProbe({ ...result, checkedAt: Date.now() });
    } catch (e) {
      if (sequence === probeSequence.current)
        setProbe({ ok: false, modelId: "", error: e instanceof Error ? e.message : String(e) });
    }
    setProbing(false);
  };

  const discoverModels = async () => {
    if (modelsBusy) return;
    const sequence = ++modelsSequence.current;
    setModelsBusy(true);
    setConnectionError("");
    try {
      const result = await call("models.list");
      if (sequence !== modelsSequence.current) return;
      setModels(result.models);
      if (!result.models.length) setConnectionError("The endpoint returned no models.");
    } catch (error) {
      if (sequence === modelsSequence.current)
        setConnectionError(error instanceof Error ? error.message : String(error));
    } finally {
      if (sequence === modelsSequence.current) setModelsBusy(false);
    }
  };

  const plannerModel = plannerModelSelection(settings, provider);
  const plannerOptions: ModelEntry[] =
    provider === "gateway"
      ? mergeModelOptions(models, plannerModel)
      : [
          ...models,
          ...[plannerModel, String(settings.visionModel ?? "")].filter(Boolean).map((id) => ({ id })),
        ].filter((model, index, all) => all.findIndex((item) => item.id === model.id) === index);
  const roleOverrides = (settings.agentModelRouteOverrides ?? {}) as Partial<
    Record<AgentModelCategory, AgentModelRouteChain>
  >;
  const roleRoutes = (settings.agentModelRoutes ?? {}) as Partial<
    Record<AgentModelCategory, AgentModelRoute>
  >;
  const contributorSelected =
    plannerModel === DEFAULT_PLANNER_MODEL_ID ||
    modelDraft.trim() === DEFAULT_PLANNER_MODEL_ID ||
    Object.values(roleRoutes).some((route) => route.modelId === DEFAULT_PLANNER_MODEL_ID);
  const turnValue = (settings.maxModelCalls as number) ?? 8;
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
  const connectionReady = hasKey || localCompatible;

  return (
    <SettingsSection name="Models" title="AI model" hidden={!active}>
      <output className="field" data-block>
        {probe?.ok
          ? `${providerNames[provider]} is ready.`
          : localCompatible
            ? "Local model endpoint configured. Save a model and test the connection before your first run."
            : hasKey
              ? `${providerNames[provider]} key configured. Save a model and test the connection before your first run.`
              : "Agent setup needed. Browsing, saved tasks, and evidence review are available without a model."}
      </output>
      <IndexedField
        label="Model provider"
        hint="Switching providers changes where task context and screenshots are sent. Each provider keeps its own key and model choices; there is no automatic fallback to another provider."
      >
        <select
          aria-label="Model provider"
          value={provider}
          disabled={savingKey || probing || switchingProvider}
          onChange={(event) => {
            setSwitchingProvider(true);
            void set({ modelProvider: event.target.value })
              .then((ok) => {
                if (ok) {
                  setKey("");
                  setModels([]);
                  setConnectionError("");
                }
              })
              .finally(() => setSwitchingProvider(false));
          }}
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
          <div className="row">
            <input
              className="grow"
              aria-label="OpenAI-compatible endpoint"
              inputMode="url"
              autoComplete="url"
              placeholder="https://example.com/v1"
              value={endpointDraft}
              disabled={probing || savingKey || switchingProvider}
              onChange={(event) => {
                setEndpointDraft(event.target.value);
                setProbe(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && endpointDraft.trim()) {
                  event.preventDefault();
                  void set({ compatibleEndpoint: endpointDraft.trim() });
                }
              }}
            />
            <button
              className="btn sm"
              disabled={
                probing ||
                savingKey ||
                switchingProvider ||
                !endpointDraft.trim() ||
                endpointDraft.trim() === String(settings.compatibleEndpoint ?? "")
              }
              onClick={() => void set({ compatibleEndpoint: endpointDraft.trim() })}
            >
              Save endpoint
            </button>
            <button
              className="btn sm"
              disabled={
                probing ||
                savingKey ||
                switchingProvider ||
                modelsBusy ||
                !settings.compatibleEndpoint ||
                !connectionReady ||
                endpointDraft.trim() !== String(settings.compatibleEndpoint ?? "")
              }
              onClick={() => void discoverModels()}
            >
              {modelsBusy ? "Discovering…" : "Discover models"}
            </button>
          </div>
        </IndexedField>
      )}
      {provider !== "openai-compatible" && (
        <span className="hint field">
          Destination: {String(settings.modelEndpoint ?? "Vercel AI Gateway")}. Enter a model ID available to
          your account. Use the Agents tab for Codex or Claude Code.
        </span>
      )}
      <IndexedField
        label={`${providerNames[provider]} API key`}
        hint={
          <>
            {String(
              settings.modelCredentialError ??
                (provider === "gateway" ? settings.gatewayCredentialError : undefined) ??
                (settings.modelCredentialSource === "environment"
                  ? "Using a process environment key. Change it in your launch environment."
                  : hasKey
                    ? "Key saved with OS encryption."
                    : localCompatible
                      ? "Optional for localhost. Add a key only if your local server requires one."
                      : "No key configured. Saved keys require OS encryption."),
            )}
          </>
        }
      >
        <div className="row">
          <input
            type="password"
            aria-label="Provider API key"
            autoComplete="off"
            disabled={savingKey || probing || switchingProvider}
            className="grow"
            value={key}
            placeholder={
              hasKey
                ? "Key saved — enter a new key to replace"
                : localCompatible
                  ? "Optional for this local endpoint"
                  : "Enter this provider’s API key"
            }
            onChange={(e) => {
              setKey(e.target.value);
              setProbe(null);
              setConnectionError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void saveKey();
              }
            }}
          />
          <button
            className="btn sm"
            disabled={savingKey || probing || switchingProvider || !key.trim() || key === KEY_MASK}
            onClick={() => void saveKey()}
          >
            {savingKey ? "Saving…" : "Save key"}
          </button>
          {settings.modelCredentialSource !== "environment" &&
            (hasKey ||
              !!(
                settings.modelCredentialError ??
                (provider === "gateway" ? settings.gatewayCredentialError : undefined)
              )) && (
              <button
                className="btn sm"
                disabled={savingKey || probing || switchingProvider}
                title="Remove this provider’s saved key"
                onClick={() =>
                  void set({ modelCredential: { provider, key: "" } }).then((ok) => {
                    if (ok) toast("Saved provider key removed");
                  })
                }
              >
                Clear
              </button>
            )}
        </div>
      </IndexedField>

      {connectionError && (
        <p className="field" role="alert">
          {connectionError}
        </p>
      )}
      <IndexedField
        label="Planner model"
        hint="Enter the exact model ID for the selected provider. Availability depends on your account."
      >
        <div className="row">
          <input
            className="grow"
            aria-label="Planner model"
            aria-describedby={contributorSelected ? "contributor-data-use" : undefined}
            list="agent-model-options"
            value={modelDraft}
            disabled={probing || savingKey || switchingProvider}
            onChange={(event) => {
              setModelDraft(event.target.value);
              setProbe(null);
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
            className="btn sm"
            disabled={
              probing ||
              savingKey ||
              switchingProvider ||
              !modelDraft.trim() ||
              modelDraft.trim() === plannerModel
            }
            onClick={() => void set({ plannerModel: modelDraft.trim() })}
          >
            Save model
          </button>
          <button
            className="btn sm"
            disabled={
              probing ||
              savingKey ||
              switchingProvider ||
              !modelDraft.trim() ||
              !connectionReady ||
              !!key.trim() ||
              modelDraft.trim() !== plannerModel
            }
            onClick={() => void runProbe()}
          >
            {probing ? "Testing…" : "Test connection"}
          </button>
        </div>
        {contributorSelected && (
          <p className="hint" id="contributor-data-use">
            <strong>Contributor data use.</strong> This tier lets Meta use prompts and completions sent to it
            to improve its models.
          </p>
        )}
        {probe && (
          <output className={`hint model-probe-status ${probe.ok ? "ok" : "err"}`}>
            {probe.ok
              ? `Connection tested${probe.latencyMs == null ? "" : ` · ${probe.latencyMs} ms`}${probe.vision === true ? " · vision" : probe.vision === false ? " · no vision" : ""}`
              : `Failed — ${probe.error}`}
            {probe.checkedAt ? ` · ${new Date(probe.checkedAt).toLocaleString()}` : ""}
          </output>
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
          onBlur={(event) => {
            if (event.target.value !== String(settings.visionModel ?? ""))
              void set({ visionModel: event.target.value.trim() });
          }}
        />
      </IndexedField>

      <h3 className="drawer-section">Model roles</h3>
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
            type="number"
            min={1}
            max={16}
            defaultValue={(settings.maxWorkers as number) ?? 4}
            onBlur={(e) => void set({ maxWorkers: Number(e.target.value) })}
          />
        </IndexedField>
        <IndexedField
          label="Max model turns per run"
          hint="How many planner calls a run may make. No limit keeps going until the goal finishes or you stop it."
        >
          <select
            aria-label="Max model turns per run"
            value={String(turnValue)}
            onChange={(e) => void set({ maxModelCalls: Number(e.target.value) })}
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
