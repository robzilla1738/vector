import { Select } from "../ui";
import { AuxPackages } from "./AuxPackages";
import { useFeature } from "../use-feature";
import { lazySection } from "../settings/LazySettingsSection";
import { staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import "./PluginsPanel.css";
import { useEffect, useId, useState } from "react";
import type { MethodResult, Plugin, PluginAsset, PluginSkillGrant, Workspace } from "@aux/contracts";
import { bridge } from "../bridge";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";
import { staticDrawerSectionProps as auxClassDrawerSectionProps } from "../ui/class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

const OutboundMcpSettings = lazySection(
  async () => (await import("./OutboundMcpSettings")).OutboundMcpSettings,
);

type Inspection = MethodResult<"plugins.inspect"> & { path: string };
const messageOf = (reason: unknown) => errorMessage(reason);

/** Imported plugin declarations are inventory only; they have no execution authority. */
export function PluginsPanel({ destination, active = true }: { destination?: string; active?: boolean }) {
  const tabId = useId();
  const [tab, setTab] = useState<"skills" | "mcp">("skills");
  useEffect(() => {
    if (destination) setTab(destination === "MCP servers" ? "mcp" : "skills");
  }, [destination]);
  const outboundMcpAvailable = useFeature("outboundMcp");
  const [spaces, setSpaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [assets, setAssets] = useState<PluginAsset[]>([]);
  const [grants, setGrants] = useState<PluginSkillGrant[]>([]);
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
      setGrants([]);
      return;
    }
    let active = true;
    setAssets([]);
    void Promise.all([
      bridge.invoke("plugins.assets", { pluginId: selected.pluginId }),
      bridge.invoke("plugins.skills.grants", { pluginId: selected.pluginId }),
    ])
      .then(([items, currentGrants]) => {
        if (active) {
          setAssets(items);
          setGrants(currentGrants);
        }
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
    <div className="plugins-settings">
      <div className="settings-page-tabs" role="tablist" aria-label="Skills and MCP">
        {(["skills", ...(outboundMcpAvailable ? ["mcp"] : [])] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`${tabId}-${id}-tab`}
            aria-selected={tab === id}
            aria-controls={`${tabId}-${id}`}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id as "skills" | "mcp")}
            onKeyDown={(event) => {
              if (outboundMcpAvailable && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? "skills"
                    : event.key === "End"
                      ? "mcp"
                      : tab === "skills"
                        ? "mcp"
                        : "skills";
                setTab(next);
                document.getElementById(`${tabId}-${next}-tab`)?.focus();
              }
            }}
          >
            {id === "skills" ? "Skills" : "MCPs"}
          </button>
        ))}
      </div>
      {outboundMcpAvailable && (
        <div
          role="tabpanel"
          id={`${tabId}-mcp`}
          aria-labelledby={`${tabId}-mcp-tab`}
          hidden={tab !== "mcp"}
          data-setting="MCP servers"
          tabIndex={-1}
        >
          <OutboundMcpSettings active={active && tab === "mcp"} />
        </div>
      )}
      <div
        role="tabpanel"
        id={`${tabId}-skills`}
        aria-labelledby={`${tabId}-skills-tab`}
        hidden={tab !== "skills"}
      >
        <AuxPackages />
        <section className="plugin-review field" aria-label="Plugins">
          <div {...auxClassDrawerSectionProps}>Plugins</div>
          <p {...staticHintProps}>
            Review a portable Aux bundle or compatible skill folder before installing it into one Space.
          </p>
          <div className="plugin-review-actions">
            <label>
              Space
              <Select
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
              </Select>
            </label>
            <button {...smallGhostButtonProps} disabled={busy || !workspaceId} onClick={() => choose("file")}>
              Choose Aux bundle…
            </button>
            <button
              {...smallGhostButtonProps}
              disabled={busy || !workspaceId}
              onClick={() => choose("directory")}
            >
              Choose compatible folder…
            </button>
          </div>
          {inspection && (
            <fieldset className="plugin-review-preview">
              <legend>Review import</legend>
              <strong>
                {inspection.name}
                {inspection.version ? ` · ${inspection.version}` : ""}
              </strong>
              {inspection.description && <p {...staticHintProps}>{inspection.description}</p>}
              <p {...staticHintProps}>
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
              <p {...staticHintProps}>
                Reviewed digest {inspection.digest.slice(0, 16)}… · contents must still match when installed.
              </p>
              <div {...staticRowProps}>
                <button {...smallButtonProps} disabled={busy || !workspaceId} onClick={install}>
                  Install into this Space
                </button>
                <button {...smallGhostButtonProps} disabled={busy} onClick={() => setInspection(null)}>
                  Cancel
                </button>
              </div>
            </fieldset>
          )}
          {error && (
            <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
              {error}
            </p>
          )}
          {message && (
            <output {...staticHintProps} data-block>
              {message}
            </output>
          )}
          {visible.length ? (
            <div className="plugin-review-layout">
              <aside className="plugin-review-list" aria-label="Installed plugins">
                {visible.map((plugin) => (
                  <button
                    key={plugin.pluginId}
                    {...auxNativeButtonTypeProps}
                    aria-current={selectedId === plugin.pluginId ? "true" : undefined}
                    onClick={() => setSelectedId(plugin.pluginId)}
                  >
                    <strong>{plugin.name}</strong>
                    <span>
                      {plugin.version || "Plugin"} · {plugin.routineIds.length} Skills
                    </span>
                  </button>
                ))}
              </aside>
              <div className="plugin-review-detail">
                {!selected && (
                  <p {...staticHintProps}>Choose an installed plugin to inspect its components.</p>
                )}
                {selected && (
                  <>
                    <strong>
                      {selected.name}
                      {selected.version ? ` · ${selected.version}` : ""}
                    </strong>
                    {selected.description && <p {...staticHintProps}>{selected.description}</p>}
                    <p {...staticHintProps}>
                      Installed {new Date(selected.installedAt).toLocaleString()} ·{" "}
                      {selected.routineIds.length}
                      {" imported Skills"}
                    </p>
                    {assets.map((asset) => (
                      <div className="plugin-review-asset" key={asset.assetId}>
                        <strong>
                          {asset.kind.replace("_", " ")} · {asset.name}
                        </strong>
                        <span {...staticHintProps}>
                          {grants.some((grant) => grant.assetId === asset.assetId && !grant.revokedAt)
                            ? "Granted in this Space"
                            : "No authority"}{" "}
                          · digest {asset.digest.slice(0, 16)}…
                        </span>
                        {asset.description && <span {...staticHintProps}>{asset.description}</span>}
                        {asset.kind === "skill" &&
                          !grants.some((grant) => grant.assetId === asset.assetId && !grant.revokedAt) && (
                            <button
                              {...smallGhostButtonProps}
                              disabled={busy}
                              onClick={() =>
                                void action(async () => {
                                  const grant = await bridge.invoke("plugins.skills.grant", {
                                    assetId: asset.assetId,
                                    expectedDigest: asset.digest,
                                    scope: { kind: "workspace", workspaceId: selected.workspaceId },
                                  });
                                  setGrants((current) => [grant, ...current]);
                                  setMessage(
                                    `${asset.name} is available in this Space. Its instructions remain untrusted.`,
                                  );
                                })
                              }
                            >
                              Grant Skill to this Space
                            </button>
                          )}
                        {grants
                          .filter((grant) => grant.assetId === asset.assetId && !grant.revokedAt)
                          .map((grant) => (
                            <button
                              key={grant.grantId}
                              {...smallGhostButtonProps}
                              disabled={busy}
                              onClick={() =>
                                void action(async () => {
                                  const revoked = await bridge.invoke("plugins.skills.revoke", {
                                    grantId: grant.grantId,
                                  });
                                  setGrants((current) =>
                                    current.map((item) =>
                                      item.grantId === revoked.grantId ? revoked : item,
                                    ),
                                  );
                                  setMessage(`${asset.name} access revoked.`);
                                })
                              }
                            >
                              Revoke Skill access
                            </button>
                          ))}
                      </div>
                    ))}
                    <button
                      {...smallGhostButtonProps}
                      disabled={busy}
                      onClick={() =>
                        void action(async () => {
                          const result = await bridge.invoke("plugins.uninstall", {
                            pluginId: selected.pluginId,
                          });
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
          ) : (
            <p className="plugin-review-empty hint" role="status">
              No plugins installed in this Space.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
