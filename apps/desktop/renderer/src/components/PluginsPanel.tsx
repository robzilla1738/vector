import "./PluginsPanel.css";
import { useEffect, useState } from "react";
import type { MethodResult, Plugin, PluginAsset, Workspace } from "@aux/contracts";
import { bridge } from "../bridge";

type Inspection = MethodResult<"plugins.inspect"> & { path: string };
const messageOf = (reason: unknown) => (reason instanceof Error ? reason.message : String(reason));

/** Imported plugin declarations are inventory only; they have no execution authority. */
export function PluginsPanel() {
  const [spaces, setSpaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [assets, setAssets] = useState<PluginAsset[]>([]);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selected = plugins.find(
    (plugin) => plugin.pluginId === selectedId && plugin.workspaceId === workspaceId,
  );
  const visible = plugins.filter((plugin) => plugin.workspaceId === workspaceId);

  const refresh = async () => {
    const [nextSpaces, nextPlugins] = await Promise.all([
      bridge.invoke("workspaces.list", {}),
      bridge.invoke("plugins.list", {}),
    ]);
    setSpaces(nextSpaces);
    setPlugins(nextPlugins);
    setWorkspaceId((current) =>
      nextSpaces.some((space) => space.workspaceId === current)
        ? current
        : (nextSpaces[0]?.workspaceId ?? ""),
    );
  };
  useEffect(() => {
    void refresh().catch((reason) => setError(messageOf(reason)));
  }, []);
  useEffect(() => {
    if (!selected || selected.workspaceId !== workspaceId) {
      setAssets([]);
      return;
    }
    let active = true;
    setAssets([]);
    void bridge
      .invoke("plugins.assets", { pluginId: selected.pluginId })
      .then((items) => {
        if (active) setAssets(items);
      })
      .catch((reason) => {
        if (active) setError(messageOf(reason));
      });
    return () => {
      active = false;
    };
  }, [selectedId, selected?.workspaceId, workspaceId]);

  const action = async (work: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await work();
    } catch (reason) {
      setError(messageOf(reason));
    } finally {
      setBusy(false);
    }
  };
  const choose = (kind: "file" | "directory") =>
    void action(async () => {
      const path = kind === "directory" ? await bridge.openPluginDirectory() : await bridge.openFile();
      if (path) setInspection({ ...(await bridge.invoke("plugins.inspect", { path })), path });
    });
  const install = () =>
    void action(async () => {
      if (!inspection || !workspaceId) return;
      const result = await bridge.invoke("plugins.install", {
        path: inspection.path,
        workspaceId,
        expectedDigest: inspection.digest,
      });
      setMessage(
        `Installed ${result.plugin.name}. ${
          inspection.format === "claude-code"
            ? "Imported components have no authority."
            : `${result.imported} inactive Skills added.`
        }`,
      );
      setInspection(null);
      await refresh();
      setSelectedId(result.plugin.pluginId);
    });

  return (
    <section className="plugin-review field" aria-label="Plugins">
      <div className="drawer-section">Plugins</div>
      <p className="hint">
        Review a portable Aux bundle or Claude Code plugin folder before installing it into one Space.
      </p>
      <div className="plugin-review-actions">
        <label>
          Space
          <select
            aria-label="Plugin space"
            value={workspaceId}
            onChange={(event) => {
              setWorkspaceId(event.target.value);
              setSelectedId("");
              setInspection(null);
            }}
          >
            {spaces.map((space) => (
              <option key={space.workspaceId} value={space.workspaceId}>
                {space.name}
              </option>
            ))}
          </select>
        </label>
        <button className="btn sm ghost" disabled={busy || !workspaceId} onClick={() => choose("file")}>
          Choose Aux bundle…
        </button>
        <button className="btn sm ghost" disabled={busy || !workspaceId} onClick={() => choose("directory")}>
          Choose Claude Code folder…
        </button>
      </div>
      {inspection && (
        <fieldset className="plugin-review-preview">
          <legend>Review import</legend>
          <strong>
            {inspection.name}
            {inspection.version ? ` · ${inspection.version}` : ""}
          </strong>
          {inspection.description && <p className="hint">{inspection.description}</p>}
          <p className="hint">
            {inspection.format === "claude-code"
              ? "Skills, MCP servers, and hooks have zero authority. Nothing runs or connects on import."
              : `${inspection.routineCount} portable Skills will be imported paused and unbound.`}
          </p>
          {!!inspection.routineTitles.length && (
            <ul>
              {inspection.routineTitles.map((title, i) => (
                <li key={i}>{title}</li>
              ))}
            </ul>
          )}
          {!!inspection.assets.length && (
            <ul>
              {inspection.assets.map((asset, i) => (
                <li key={i}>
                  {asset.kind.replace("_", " ")} · {asset.name}
                </li>
              ))}
            </ul>
          )}
          <p className="hint">
            Reviewed digest {inspection.digest.slice(0, 16)}… · contents must still match when installed.
          </p>
          <div className="row">
            <button className="btn sm" disabled={busy || !workspaceId} onClick={install}>
              Install into this Space
            </button>
            <button className="btn sm ghost" disabled={busy} onClick={() => setInspection(null)}>
              Cancel
            </button>
          </div>
        </fieldset>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <output className="hint" data-block>
          {message}
        </output>
      )}
      <div className="plugin-review-layout">
        <aside className="plugin-review-list" aria-label="Installed plugins">
          {visible.map((plugin) => (
            <button
              key={plugin.pluginId}
              type="button"
              aria-current={selectedId === plugin.pluginId ? "true" : undefined}
              onClick={() => setSelectedId(plugin.pluginId)}
            >
              <strong>{plugin.name}</strong>
              <span>
                {plugin.version || "Plugin"} · {plugin.routineIds.length} Skills
              </span>
            </button>
          ))}
          {!visible.length && <p className="hint">No plugins installed in this Space.</p>}
        </aside>
        <div className="plugin-review-detail">
          {!selected && <p className="hint">Choose an installed plugin to inspect its components.</p>}
          {selected && (
            <>
              <strong>
                {selected.name}
                {selected.version ? ` · ${selected.version}` : ""}
              </strong>
              {selected.description && <p className="hint">{selected.description}</p>}
              <p className="hint">
                Installed {new Date(selected.installedAt).toLocaleString()} · {selected.routineIds.length}
                {" imported Skills"}
              </p>
              {assets.map((asset) => (
                <div className="plugin-review-asset" key={asset.assetId}>
                  <strong>
                    {asset.kind.replace("_", " ")} · {asset.name}
                  </strong>
                  <span className="hint">No authority · digest {asset.digest.slice(0, 16)}…</span>
                  {asset.description && <span className="hint">{asset.description}</span>}
                </div>
              ))}
              <button
                className="btn sm ghost"
                disabled={busy}
                onClick={() =>
                  void action(async () => {
                    const result = await bridge.invoke("plugins.uninstall", { pluginId: selected.pluginId });
                    setMessage(
                      `Uninstalled ${selected.name}. Archived ${result.archivedRoutines} imported Skills.`,
                    );
                    setSelectedId("");
                    await refresh();
                  })
                }
              >
                Uninstall plugin
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
