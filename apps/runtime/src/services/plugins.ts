import { randomUUID } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import { AuxError, AuxPluginManifestSchema, PluginAssetSchema, PluginSchema, type AuxPluginManifest, type Plugin, type PluginAsset } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { RoutineService } from "./routines.js";
import { readClaudePlugin, type ImportedPlugin } from "./claude-plugin-import.js";

type Row = {
  plugin_id: string; name: string; version: string | null; description: string | null;
  workspace_id: string; routine_ids: string; created_at: number; uninstalled_at: number | null;
};

const record = (row: Row): Plugin =>
  PluginSchema.parse({
    pluginId: row.plugin_id,
    name: row.name,
    version: row.version ?? undefined,
    description: row.description ?? undefined,
    workspaceId: row.workspace_id,
    routineIds: JSON.parse(row.routine_ids),
    installedAt: row.created_at,
    uninstalledAt: row.uninstalled_at ?? undefined,
  });

/**
 * Thin plugins bundle existing capabilities. aux-plugin@1 carries portable
 * routines; installing recreates them in one Space through the same import
 * path as routine sharing, so plugin installs stay deduplicating and
 * repeatable.
 */
export class PluginService {
  constructor(private repo: Repo, private routines: RoutineService) {}

  private async manifest(path: string): Promise<AuxPluginManifest | ImportedPlugin> {
    const info = await lstat(path).catch(() => undefined);
    if (info?.isDirectory()) return readClaudePlugin(path);
    if (!info?.isFile()) throw new AuxError("invalid_params", "Choose a regular plugin file or directory.");
    let raw: unknown;
    try {
      raw = JSON.parse(await readFile(path, "utf8"));
    } catch (error) {
      throw new AuxError("invalid_params", `Couldn't read the plugin file. ${error instanceof Error ? error.message : String(error)}`);
    }
    const parsed = AuxPluginManifestSchema.safeParse(raw);
    if (!parsed.success) throw new AuxError("invalid_params", "That file isn't an aux-plugin@1 bundle.");
    return parsed.data;
  }

  private requireWorkspace(workspaceId: string): void {
    if (!this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(workspaceId))
      throw new AuxError("not_found", "Space does not exist");
  }

  inspect(path: string): Promise<{ name: string; version?: string; description?: string; routineCount: number; routineTitles: string[]; format: string; assets: { kind: PluginAsset["kind"]; name: string }[] }> {
    return this.manifest(path).then(bundle => ({
      name: bundle.name,
      version: bundle.version,
      description: bundle.description,
      routineCount: bundle.format === "aux-plugin@1" ? bundle.routines.length : 0,
      routineTitles: bundle.format === "aux-plugin@1" ? bundle.routines.map(routine => routine.title) : [],
      format: bundle.format,
      assets: bundle.format === "claude-code" ? bundle.assets.map(({ kind, name }) => ({ kind, name })) : [],
    }));
  }

  async install(path: string, workspaceId: string): Promise<{ plugin: Plugin; imported: number; skipped: number }> {
    const bundle = await this.manifest(path);
    this.requireWorkspace(workspaceId);
    const existing = this.repo.db.prepare("SELECT 1 FROM plugins WHERE name=? AND workspace_id=? AND uninstalled_at IS NULL").get(bundle.name, workspaceId);
    if (existing) throw new AuxError("conflict", `"${bundle.name}" is already installed in this space. Uninstall it first.`);
    const { imported, skipped, routineIds } = bundle.format === "aux-plugin@1"
      ? this.routines.importRoutines(bundle.routines, workspaceId)
      : { imported: 0, skipped: 0, routineIds: [] };
    const plugin: Plugin = PluginSchema.parse({
      pluginId: randomUUID(),
      name: bundle.name,
      version: bundle.version,
      description: bundle.description,
      workspaceId,
      routineIds,
      installedAt: Date.now(),
    });
    this.repo.db.exec("BEGIN IMMEDIATE");
    try {
      this.repo.db.prepare(
        "INSERT INTO plugins(plugin_id,name,version,description,workspace_id,routine_ids,created_at) VALUES(?,?,?,?,?,?,?)"
      ).run(plugin.pluginId, plugin.name, plugin.version ?? null, plugin.description ?? null, workspaceId, JSON.stringify(routineIds), plugin.installedAt);
      if (bundle.format === "claude-code") {
        const insert = this.repo.db.prepare("INSERT INTO plugin_assets(asset_id,plugin_id,kind,name,description,content,digest,imported_at) VALUES(?,?,?,?,?,?,?,?)");
        for (const asset of bundle.assets) {
          const item = PluginAssetSchema.parse({ assetId: randomUUID(), pluginId: plugin.pluginId, ...asset, authority: "none", importedAt: plugin.installedAt });
          insert.run(item.assetId, item.pluginId, item.kind, item.name, item.description ?? null, item.content ?? null, item.digest, item.importedAt);
        }
      }
      this.repo.db.exec("COMMIT");
    } catch (error) {
      this.repo.db.exec("ROLLBACK");
      throw error;
    }
    return { plugin, imported, skipped };
  }

  /** Inspect imported components. They have no execution path or grant at import time. */
  assets(pluginId: string): PluginAsset[] {
    const plugin = this.repo.db.prepare("SELECT 1 FROM plugins WHERE plugin_id=? AND uninstalled_at IS NULL").get(pluginId);
    if (!plugin) throw new AuxError("not_found", "Installed plugin does not exist");
    const rows = this.repo.db.prepare("SELECT * FROM plugin_assets WHERE plugin_id=? ORDER BY kind,name").all(pluginId) as {
      asset_id: string; plugin_id: string; kind: string; name: string; description: string | null;
      content: string | null; digest: string; imported_at: number;
    }[];
    return rows.map(row => PluginAssetSchema.parse({ assetId: row.asset_id, pluginId: row.plugin_id, kind: row.kind,
      name: row.name, description: row.description ?? undefined, content: row.content ?? undefined,
      digest: row.digest, authority: "none", importedAt: row.imported_at }));
  }

  list(params: { workspaceId?: string; includeUninstalled?: boolean } = {}): Plugin[] {
    const showAll = params.includeUninstalled ? 1 : 0;
    const rows = (params.workspaceId
      ? this.repo.db.prepare("SELECT * FROM plugins WHERE workspace_id=? AND (?=1 OR uninstalled_at IS NULL) ORDER BY created_at DESC").all(params.workspaceId, showAll)
      : this.repo.db.prepare("SELECT * FROM plugins WHERE (?=1 OR uninstalled_at IS NULL) ORDER BY created_at DESC").all(showAll)) as Row[];
    return rows.map(record);
  }

  uninstall(pluginId: string): { plugin: Plugin; archivedRoutines: number } {
    const row = this.repo.db.prepare("SELECT * FROM plugins WHERE plugin_id=?").get(pluginId) as Row | undefined;
    if (!row || row.uninstalled_at != null) throw new AuxError("not_found", "Installed plugin does not exist");
    const plugin = record(row);
    let archived = 0;
    for (const routineId of plugin.routineIds) {
      try {
        const current = this.routines.get(routineId).routine;
        if (!current.archivedAt) { this.routines.archive(routineId, current.revision, true); archived += 1; }
      } catch { /* The routine was already removed outside this plugin. */ }
    }
    const now = Date.now();
    this.repo.db.prepare("DELETE FROM plugin_assets WHERE plugin_id=?").run(pluginId);
    this.repo.db.prepare("UPDATE plugins SET uninstalled_at=? WHERE plugin_id=?").run(now, pluginId);
    return { plugin: { ...plugin, uninstalledAt: now }, archivedRoutines: archived };
  }
}
