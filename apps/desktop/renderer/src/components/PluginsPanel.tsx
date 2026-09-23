import { useEffect, useState } from "react";
import type { Plugin, Workspace } from "@aux/contracts";
import { bridge } from "../bridge";

type Inspection = { name: string; version?: string; description?: string; routineCount: number; routineTitles: string[] };

export function PluginsPanel() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [inspection, setInspection] = useState<{ path: string } & Inspection | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refresh = async () => {
    const [nextWorkspaces, nextPlugins] = await Promise.all([
      bridge.invoke("workspaces.list", {}) as Promise<Workspace[]>,
      bridge.invoke("plugins.list", {}) as Promise<Plugin[]>,
    ]);
    setWorkspaces(nextWorkspaces);
    setPlugins(nextPlugins);
    setWorkspaceId(current => (current && nextWorkspaces.some(item => item.workspaceId === current) ? current : nextWorkspaces[0]?.workspaceId ?? ""));
  };
  useEffect(() => { void refresh().catch(reason => setError(String(reason))); }, []);

  const action = async (work: () => Promise<void>) => {
    setBusy(true); setError(""); setMessage("");
    try { await work(); } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); } finally { setBusy(false); }
  };

  const workspaceName = (plugin: Plugin) => workspaces.find(item => item.workspaceId === plugin.workspaceId)?.name ?? "Space";

  return <section className="field" aria-label="Plugins">
    <p className="hint">Thin plugins bundle existing Aux capabilities into one installable file (<code>aux-plugin@1</code>). Installing recreates its routines in a space you choose; uninstalling archives them.</p>
    <div className="row">
      <label>Space
        <select aria-label="Plugin space" value={workspaceId} onChange={event => setWorkspaceId(event.target.value)}>
          {workspaces.map(workspace => <option key={workspace.workspaceId} value={workspace.workspaceId}>{workspace.name}</option>)}
        </select>
      </label>
      <button className="btn sm" disabled={busy || !workspaceId} onClick={() => void action(async () => {
        const path = await bridge.openFile();
        if (!path) return;
        const result = await bridge.invoke("plugins.inspect", { path }) as Inspection;
        setInspection({ path, ...result });
      })}>Choose plugin file…</button>
    </div>
    {inspection && <fieldset className="field" aria-label="Plugin preview">
      <strong>{inspection.name}{inspection.version ? ` · ${inspection.version}` : ""}</strong>
      {inspection.description && <p className="hint">{inspection.description}</p>}
      <span className="hint">Installs {inspection.routineCount} routine{inspection.routineCount === 1 ? "" : "s"}{inspection.routineTitles.length ? ` — ${inspection.routineTitles.slice(0, 4).join(", ")}${inspection.routineTitles.length > 4 ? ", …" : ""}` : ""}.</span>
      <div className="row">
        <button className="btn sm" disabled={busy || !workspaceId} onClick={() => void action(async () => {
          const result = await bridge.invoke("plugins.install", { path: inspection.path, workspaceId }) as { plugin: Plugin; imported: number; skipped: number };
          setInspection(null);
          setMessage(`Installed ${result.plugin.name} — ${result.imported} routine${result.imported === 1 ? "" : "s"} added${result.skipped ? ` · ${result.skipped} already present` : ""}.`);
          await refresh();
        })}>Install into {workspaces.find(item => item.workspaceId === workspaceId)?.name ?? "space"}</button>
        <button className="btn sm ghost" disabled={busy} onClick={() => setInspection(null)}>Cancel</button>
      </div>
    </fieldset>}
    {error && <p className="field-error" role="alert">{error}</p>}
    {message && <p className="hint" aria-live="polite">{message}</p>}
    {plugins.length === 0 && !inspection && <p className="hint">No plugins installed.</p>}
    {plugins.map(plugin => <div className="field" key={plugin.pluginId}>
      <strong>{plugin.name}{plugin.version ? ` · ${plugin.version}` : ""}</strong>
      <span className="hint">{plugin.routineIds.length} routine{plugin.routineIds.length === 1 ? "" : "s"} in {workspaceName(plugin)} · installed {new Date(plugin.installedAt).toLocaleString()}{plugin.uninstalledAt ? " · uninstalled" : ""}</span>
      {!plugin.uninstalledAt && <div className="row"><button className="btn sm ghost" disabled={busy} onClick={() => void action(async () => {
        const result = await bridge.invoke("plugins.uninstall", { pluginId: plugin.pluginId }) as { archivedRoutines: number };
        setMessage(`Uninstalled ${plugin.name} — archived ${result.archivedRoutines} routine${result.archivedRoutines === 1 ? "" : "s"}.`);
        await refresh();
      })}>Uninstall</button></div>}
    </div>)}
  </section>;
}
