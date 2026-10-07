import { staticFieldErrorProps, staticFieldProps } from "../../ui/class-props";
import { staticHintProps, staticRowProps } from "../../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { errorMessage } from "../../error-message";
import { useEffect, useState } from "react";
import type { UsageReportResult } from "@aux/contracts";
import { bridge } from "../../bridge";
import { call, errToast, toast } from "../../store";
import { SettingsField, SettingsSection } from "../primitives";
import { usageReportCsv } from "../usage-csv";
import { nativeNumberTypeProps, nativeAlertRoleProps } from "../../ui/native-attribute-props";

type Caps = { runUsd?: number; dayUsd?: number; monthUsd?: number; routineUsd?: number };
const usd = (value: number) => `$${value.toFixed(value < 0.01 && value > 0 ? 4 : 2)}`;

function UsageTable({
  title,
  rows,
}: {
  title: string;
  rows: {
    key: string;
    detail?: string;
    calls: number;
    recordedUsd: number;
    unpricedCalls: number;
    estimatedCalls: number;
  }[];
}) {
  return (
    <section className="usage-group" aria-label={title}>
      <h3>{title}</h3>
      {rows.length ? (
        <table className="usage-table">
          <thead>
            <tr>
              <th scope="col">{title === "By day" ? "Day" : title === "By model" ? "Model" : "Run"}</th>
              <th scope="col">Calls</th>
              <th scope="col">Recorded</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <th scope="row" title={row.detail}>
                  {row.detail || row.key}
                </th>
                <td>
                  {row.calls}
                  {row.unpricedCalls ? ` · ${row.unpricedCalls} unpriced` : ""}
                  {row.estimatedCalls ? ` · ${row.estimatedCalls} estimated` : ""}
                </td>
                <td>{usd(row.recordedUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p {...staticHintProps}>No model calls recorded.</p>
      )}
    </section>
  );
}

export function UsageBudgetsSettings({
  active,
  settings,
  onSave,
}: {
  active: boolean;
  settings: Record<string, unknown>;
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
}) {
  const [report, setReport] = useState<UsageReportResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [capError, setCapError] = useState("");
  const caps = (settings.budgets ?? {}) as Caps;

  useEffect(() => {
    if (!active) return;
    let live = true;
    void call("usage.report", { limit: 50 })
      .then((value) => {
        if (live) {
          setReport(value);
          setError("");
        }
      })
      .catch((reason) => {
        if (live) setError(errorMessage(reason));
      });
    return () => {
      live = false;
    };
  }, [active]);

  const refresh = async () => {
    if (busy) return;
    setBusy(true);
    try {
      setReport(await call("usage.report", { limit: 50 }));
      setError("");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const first = await call("usage.report", { limit: 500 });
      const byRun = [...first.byRun];
      let offset = first.nextOffset;
      while (offset !== null) {
        const page = await call("usage.report", { asOf: first.asOf, offset, limit: 500 });
        byRun.push(...page.byRun);
        if (page.nextOffset !== null && page.nextOffset <= offset)
          throw new Error("Usage export did not advance.");
        offset = page.nextOffset;
      }
      const name = `aux-usage-${new Date(first.asOf).toISOString().slice(0, 10)}.csv`;
      const path = await bridge.saveFile(name, usageReportCsv({ ...first, byRun, nextOffset: null }));
      if (path) toast("Usage CSV exported");
    } catch (reason) {
      errToast(reason);
    } finally {
      setExporting(false);
    }
  };

  const saveCaps = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const next: Caps = {};
    for (const key of ["runUsd", "dayUsd", "monthUsd", "routineUsd"] as const) {
      const text = String(values.get(key) ?? "").trim();
      if (!text) continue;
      const amount = Number(text);
      if (!Number.isFinite(amount) || amount <= 0) {
        setCapError("Enter a positive USD amount, or leave the field empty for no cap.");
        return;
      }
      next[key] = amount;
    }
    setCapError("");
    await onSave({ budgets: next });
  };

  return (
    <SettingsSection name="Usage & Budgets" hidden={!active}>
      <p className="field hint">
        Totals come from this Profile’s model-call ledger. Recorded USD includes estimated prices; unpriced
        calls are shown separately, so the true total may be higher.
      </p>
      <SettingsField
        label="Spending caps"
        hint="Caps stop the next model step after recorded spending reaches the limit. Leave a field empty for no cap."
      >
        <form key={JSON.stringify(caps)} onSubmit={(event) => void saveCaps(event)}>
          <div {...staticRowProps}>
            <label>
              Per run (USD)
              <input
                name="runUsd"
                aria-label="Per run budget"
                {...nativeNumberTypeProps}
                min="0.01"
                step="0.01"
                defaultValue={caps.runUsd ?? ""}
              />
            </label>
            <label>
              Per day (USD)
              <input
                name="dayUsd"
                aria-label="Per day budget"
                {...nativeNumberTypeProps}
                min="0.01"
                step="0.01"
                defaultValue={caps.dayUsd ?? ""}
              />
            </label>
            <label>
              Per month (USD)
              <input
                name="monthUsd"
                aria-label="Per month budget"
                {...nativeNumberTypeProps}
                min="0.01"
                step="0.01"
                defaultValue={caps.monthUsd ?? ""}
              />
            </label>
            <label>
              Per routine (USD)
              <input
                name="routineUsd"
                aria-label="Per routine budget"
                {...nativeNumberTypeProps}
                min="0.01"
                step="0.01"
                defaultValue={caps.routineUsd ?? ""}
              />
            </label>
            <button {...smallButtonProps} type="submit">
              Save caps
            </button>
          </div>
          {capError && (
            <p {...nativeAlertRoleProps} {...staticFieldErrorProps}>
              {capError}
            </p>
          )}
        </form>
      </SettingsField>
      <SettingsField
        label="Usage report"
        hint="Export contains all recorded runs, plus model and local-day totals. Choose the destination in the native save dialog."
      >
        <div {...staticRowProps}>
          <button {...smallGhostButtonProps} disabled={busy} onClick={() => void refresh()}>
            {busy ? "Refreshing…" : "Refresh usage"}
          </button>
          <button {...smallButtonProps} disabled={exporting || !!error} onClick={() => void exportCsv()}>
            {exporting ? "Exporting…" : "Export CSV…"}
          </button>
        </div>
        {error && (
          <p {...nativeAlertRoleProps} {...staticFieldErrorProps}>
            {error}
          </p>
        )}
      </SettingsField>
      {!report && !error && <output className="field hint">Loading usage…</output>}
      {report && (
        <>
          <output {...staticFieldProps} data-block>
            {report.total.calls} model calls · {usd(report.total.recordedUsd)} recorded
            {report.total.unpricedCalls ? ` · ${report.total.unpricedCalls} unpriced` : ""}
            {report.total.estimatedCalls ? ` · ${report.total.estimatedCalls} estimated` : ""}
          </output>
          <UsageTable
            title="By run"
            rows={report.byRun.map((row) => ({ key: row.runId ?? "other", detail: row.title, ...row }))}
          />
          {report.nextOffset !== null && (
            <p className="field hint">Showing the latest 50 runs. Export CSV includes all runs.</p>
          )}
          <UsageTable title="By model" rows={report.byModel.map((row) => ({ key: row.modelId, ...row }))} />
          <UsageTable title="By day" rows={report.byDay.map((row) => ({ key: row.day, ...row }))} />
        </>
      )}
    </SettingsSection>
  );
}
