import { useEffect, useRef, useState } from "react";
import {
  CloudConfigureParamsSchema,
  type CloudSettingsStatus,
  type CloudConfigureParams,
} from "@aux/contracts";
import { call } from "../../store";
import { bridge } from "../../bridge";
import { errorMessage } from "../../error-message";
import { SettingsField } from "../primitives";
import { SettingsDialogControl } from "../SettingsDialogControl";
import { SettingsGroup } from "../../ui";

const fields = [
  "vcpus",
  "timeoutMs",
  "cpuUsdPerCoreHour",
  "memoryUsdPerGBHour",
  "outboundUsdPerGB",
  "creationUsd",
] as const;
const labels: Record<(typeof fields)[number], string> = {
  vcpus: "vCPUs",
  timeoutMs: "Maximum session lifetime (ms)",
  cpuUsdPerCoreHour: "CPU (USD per core-hour)",
  memoryUsdPerGBHour: "Memory (USD per GB-hour)",
  outboundUsdPerGB: "Outgoing traffic (USD per GB)",
  creationUsd: "Session creation (USD)",
};
const blankRates = () => ({
  vcpus: "",
  timeoutMs: "",
  cpuUsdPerCoreHour: "",
  memoryUsdPerGBHour: "",
  outboundUsdPerGB: "",
  creationUsd: "",
});

/** Account credentials are an ephemeral human draft, never a composer or run input. */
export function CloudExecution() {
  return (
    <SettingsGroup title="Run in cloud">
      <SettingsField
        compact
        label="Cloud account"
        hint="Connect your Vercel Sandbox account and review its resource rates and session limits."
        searchTerms={[
          "Vercel",
          "Sandbox",
          "Run in cloud",
          "Bash",
          "REPL",
          "Cloud resource rates",
          "billing",
          "region",
        ]}
      >
        <SettingsDialogControl
          active
          size="wide"
          label="Cloud account and resource rates"
          action="Configure…"
          showClose
        >
          {(close) => <CloudExecutionEditor onSaved={close} onCancel={close} />}
        </SettingsDialogControl>
      </SettingsField>
    </SettingsGroup>
  );
}

export function CloudExecutionEditor({
  onSaved,
  onCancel,
}: { onSaved?: () => void; onCancel?: () => void } = {}) {
  const [status, setStatus] = useState<CloudSettingsStatus | null>(null);
  const [token, setToken] = useState(""),
    [teamId, setTeam] = useState(""),
    [projectId, setProject] = useState("");
  const [region, setRegion] = useState(""),
    [rateSource, setSource] = useState("");
  const [rateBasis, setBasis] = useState<"" | "public-estimate" | "account-contract">("");
  const [rates, setRates] = useState(blankRates),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [retry, setRetry] = useState(0);
  const epoch = useRef(0),
    pending = useRef(false);
  const windowId = bridge.windowId,
    windowKind = bridge.windowKind,
    privateMode = bridge.privateMode;
  function install(result: CloudSettingsStatus) {
    setStatus(result);
    setTeam(result.teamId ?? "");
    setProject(result.projectId ?? "");
    const quote = result.quote;
    setRegion(quote?.region ?? "");
    setSource(quote?.rateSource ?? "");
    setBasis(quote?.rateBasis ?? "");
    setReviewed(false);
    setRates(
      quote
        ? {
            vcpus: String(quote.vcpus),
            timeoutMs: String(quote.timeoutMs),
            cpuUsdPerCoreHour: String(quote.rates.cpuUsdPerCoreHour),
            memoryUsdPerGBHour: String(quote.rates.memoryUsdPerGBHour),
            outboundUsdPerGB: String(quote.rates.outboundUsdPerGB),
            creationUsd: String(quote.rates.creationUsd),
          }
        : blankRates(),
    );
  }
  const sameWindow = () =>
    bridge.windowId === windowId && bridge.windowKind === windowKind && bridge.privateMode === privateMode;
  useEffect(() => {
    const generation = ++epoch.current;
    setStatus(null);
    setToken("");
    setError("");
    pending.current = false;
    setBusy(false);
    void call("settings.cloud.status")
      .then((result) => {
        if (epoch.current === generation && sameWindow()) install(result);
      })
      .catch((reason) => {
        if (epoch.current === generation && sameWindow()) setError(errorMessage(reason));
      });
    return () => {
      ++epoch.current;
    };
  }, [windowId, windowKind, privateMode, retry]);
  async function update(clear = false) {
    if (!status || pending.current || !sameWindow()) return;
    const generation = epoch.current;
    const current = () => epoch.current === generation && sameWindow();
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      let result: CloudSettingsStatus;
      if (clear)
        result = await call("settings.cloud.clear", {
          expectedRevision: status.revision,
        });
      else {
        if (!reviewed || !rateBasis)
          throw new Error(
            "Select the rate basis and confirm you reviewed your account rates and resource charges.",
          );
        if (fields.some((field) => !rates[field].trim()))
          throw new Error(
            "Enter every resource rate and session limit. Enter zero only for a rate your account says is free.",
          );
        const quote: CloudConfigureParams["quote"] = {
          region,
          vcpus: Number(rates.vcpus),
          timeoutMs: Number(rates.timeoutMs),
          rateSource,
          rateBasis,
          rates: {
            cpuUsdPerCoreHour: Number(rates.cpuUsdPerCoreHour),
            memoryUsdPerGBHour: Number(rates.memoryUsdPerGBHour),
            outboundUsdPerGB: Number(rates.outboundUsdPerGB),
            creationUsd: Number(rates.creationUsd),
          },
        };
        const params = CloudConfigureParamsSchema.parse({
          expectedRevision: status.revision,
          teamId,
          projectId,
          quote,
          ...(token ? { token } : {}),
        });
        result = await call("settings.cloud.configure", params);
      }
      if (current()) {
        install(result);
        setToken("");
        if (!clear) onSaved?.();
      }
    } catch (reason) {
      if (current()) setError(errorMessage(reason));
    } finally {
      if (current()) {
        pending.current = false;
        setBusy(false);
      }
    }
  }
  const disabled = busy || !status;
  return (
    <section aria-label="Cloud execution" className="settings-editor-fields">
      <p className="hint">
        Run Bash and the persistent code REPL in your Vercel Sandbox account. Your Profile, saved credentials
        and local files stay on this Mac. No ports are exposed.
      </p>
      <p className="hint">
        Resource charges are separate from model charges. Finite spending limits currently require local
        execution because an enforceable cloud traffic envelope is unavailable. Public estimates remain
        uncertain billing receipts.
      </p>
      <div className="settings-editor-fields" role="group" aria-label="Cloud account credentials">
        <label>
          Vercel access token
          <input
            type="password"
            autoComplete="off"
            value={token}
            disabled={disabled}
            onChange={(event) => setToken(event.target.value)}
            placeholder={status?.configured ? "Keep current credential" : "Access token"}
          />
        </label>
        <label>
          Team ID
          <input value={teamId} disabled={disabled} onChange={(event) => setTeam(event.target.value)} />
        </label>
        <label>
          Project ID
          <input value={projectId} disabled={disabled} onChange={(event) => setProject(event.target.value)} />
        </label>
      </div>
      <div className="settings-editor-fields" role="group" aria-label="Cloud resource rates">
        <p className="hint">Review the rates and session limits for your own Vercel account before saving.</p>
        <label>
          Region
          <input value={region} disabled={disabled} onChange={(event) => setRegion(event.target.value)} />
        </label>
        {fields.map((field) => (
          <label key={field}>
            {labels[field]}
            <input
              type="number"
              min="0"
              step="any"
              value={rates[field]}
              disabled={disabled}
              onChange={(event) => setRates({ ...rates, [field]: event.target.value })}
            />
          </label>
        ))}
        <label>
          Rate documentation
          <input
            type="url"
            value={rateSource}
            disabled={disabled}
            onChange={(event) => setSource(event.target.value)}
          />
        </label>
        <label>
          Rate basis
          <select
            value={rateBasis}
            disabled={disabled}
            onChange={(event) => {
              if (event.target.value === "public-estimate" || event.target.value === "account-contract")
                setBasis(event.target.value);
            }}
          >
            <option value="">Choose a rate basis</option>
            <option value="public-estimate">Public estimate</option>
            <option value="account-contract">My account contract</option>
          </select>
        </label>
      </div>
      <label className="settings-editor-checkbox">
        <input
          type="checkbox"
          checked={reviewed}
          disabled={disabled}
          onChange={(event) => setReviewed(event.target.checked)}
        />
        I reviewed these account rates and understand that Cloud resource charges are separate from model
        charges.
      </label>
      <button className="btn sm primary" disabled={disabled} onClick={() => void update()}>
        Save cloud account and rates
      </button>
      {status?.configured && (
        <button className="btn sm" disabled={disabled} onClick={() => void update(true)}>
          Disconnect cloud account
        </button>
      )}
      {onCancel && (
        <button className="btn sm ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
      {status && (
        <p role="status">
          {status.configured
            ? "Cloud account configured. After setup, return to the original run and choose Retry Cloud setup."
            : "Cloud account not configured."}
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {!status && error && (
        <button className="btn sm" type="button" onClick={() => setRetry((value) => value + 1)}>
          Retry loading cloud account
        </button>
      )}
      {!status && !error && <p role="status">Loading cloud account…</p>}
    </section>
  );
}
