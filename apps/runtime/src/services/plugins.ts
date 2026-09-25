import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open } from "node:fs/promises";
import { AuxError, AuxPluginManifestSchema, PluginAssetSchema, PluginSchema, PluginSkillGrantParams, PluginSkillGrantSchema, PluginSkillReadParams, PluginSkillReadSchema, type AuxPluginManifest, type Plugin, type PluginAsset, type PluginSkillGrant } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { RoutineService } from "./routines.js";
import { readClaudePlugin, type ImportedPlugin } from "./claude-plugin-import.js";

type Row = {
  plugin_id: string; name: string; version: string | null; description: string | null;
  workspace_id: string; routine_ids: string; created_at: number; uninstalled_at: number | null;
};
type GrantRow = { grant_id: string; asset_id: string; asset_digest: string; scope_kind: "workspace" | "task";
  scope_id: string; task_revision: number | null; created_at: number; revoked_at: number | null };
const grantRecord = (row: GrantRow): PluginSkillGrant => PluginSkillGrantSchema.parse({
  grantId: row.grant_id, assetId: row.asset_id, assetDigest: row.asset_digest,
  scope: row.scope_kind === "workspace" ? { kind: "workspace", workspaceId: row.scope_id }
    : { kind: "task", taskId: row.scope_id, revision: row.task_revision },
  createdAt: row.created_at, revokedAt: row.revoked_at ?? undefined,
});

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

const bundleDigest = (bundle: AuxPluginManifest | ImportedPlugin): string =>
  createHash("sha256").update(JSON.stringify(bundle)).digest("hex");

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
    if (info.size > 8_000_000) throw new AuxError("invalid_params", "Plugin bundle exceeds 8 MB.");
    let raw: unknown;
    try {
      const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
      try {
        const current = await file.stat();
        if (!current.isFile() || current.size > 8_000_000)
          throw new AuxError("invalid_params", "Plugin bundle exceeds 8 MB or changed while opening.");
        raw = JSON.parse(await file.readFile("utf8"));
      } finally { await file.close(); }
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

  inspect(path: string): Promise<{ name: string; version?: string; description?: string; routineCount: number; routineTitles: string[]; format: string; assets: { kind: PluginAsset["kind"]; name: string }[]; digest: string }> {
    return this.manifest(path).then(bundle => ({
      name: bundle.name,
      version: bundle.version,
      description: bundle.description,
      routineCount: bundle.format === "aux-plugin@1" ? bundle.routines.length : 0,
      routineTitles: bundle.format === "aux-plugin@1" ? bundle.routines.map(routine => routine.title) : [],
      format: bundle.format,
      assets: bundle.format === "claude-code" ? bundle.assets.map(({ kind, name }) => ({ kind, name })) : [],
      digest: bundleDigest(bundle),
    }));
  }

  async install(path: string, workspaceId: string, expectedDigest?: string): Promise<{ plugin: Plugin; imported: number; skipped: number }> {
    const bundle = await this.manifest(path);
    if (expectedDigest && bundleDigest(bundle) !== expectedDigest)
      throw new AuxError("conflict", "Plugin contents changed after review. Inspect it again.");
    this.requireWorkspace(workspaceId);
    this.repo.db.exec("BEGIN IMMEDIATE");
    try {
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
      return { plugin, imported, skipped };
    } catch (error) {
      this.repo.db.exec("ROLLBACK");
      throw error;
    }
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

  /** Imported instructions are untrusted text. Grant only one reviewed digest to one task revision or Space. */
  grantSkill(raw: unknown): PluginSkillGrant {
    const input = PluginSkillGrantParams.parse(raw);
    const asset = this.repo.db.prepare(`SELECT a.*,p.workspace_id,p.uninstalled_at FROM plugin_assets a
      JOIN plugins p ON p.plugin_id=a.plugin_id WHERE a.asset_id=?`).get(input.assetId) as
      { kind: string; content: string | null; digest: string; workspace_id: string; uninstalled_at: number | null } | undefined;
    if (!asset || asset.uninstalled_at !== null || asset.kind !== "skill" || asset.content === null)
      throw new AuxError("not_found", "Imported Skill does not exist");
    if (asset.digest !== input.expectedDigest || createHash("sha256").update(asset.content).digest("hex") !== asset.digest)
      throw new AuxError("conflict", "Imported Skill changed after review. Inspect it again.");
    if (input.scope.kind === "workspace") {
      if (input.scope.workspaceId !== asset.workspace_id) throw new AuxError("permission_denied", "Skill belongs to another Space.");
    } else {
      const task = this.repo.db.prepare("SELECT workspace_id,revision FROM tasks WHERE task_id=?").get(input.scope.taskId) as
        { workspace_id: string; revision: number } | undefined;
      if (!task || task.workspace_id !== asset.workspace_id || task.revision !== input.scope.revision)
        throw new AuxError("permission_denied", "Grant must name a current task revision in this Space.");
    }
    const scopeId = input.scope.kind === "workspace" ? input.scope.workspaceId : input.scope.taskId;
    const revision = input.scope.kind === "task" ? input.scope.revision : null;
    const existing = this.repo.db.prepare(`SELECT * FROM plugin_skill_grants WHERE asset_id=? AND asset_digest=?
      AND scope_kind=? AND scope_id=? AND task_revision IS ? AND revoked_at IS NULL LIMIT 1`)
      .get(input.assetId, asset.digest, input.scope.kind, scopeId, revision) as GrantRow | undefined;
    if (existing) return grantRecord(existing);
    const now = Date.now();
    const grant = PluginSkillGrantSchema.parse({ grantId: randomUUID(), assetId: input.assetId,
      assetDigest: asset.digest, scope: input.scope, createdAt: now });
    this.repo.db.prepare(`INSERT INTO plugin_skill_grants(grant_id,asset_id,asset_digest,scope_kind,scope_id,task_revision,created_at)
      VALUES(?,?,?,?,?,?,?)`).run(grant.grantId, grant.assetId, grant.assetDigest, grant.scope.kind,
      scopeId, revision, now);
    return grant;
  }

  skillGrants(pluginId: string): PluginSkillGrant[] {
    if (!this.repo.db.prepare("SELECT 1 FROM plugins WHERE plugin_id=? AND uninstalled_at IS NULL").get(pluginId))
      throw new AuxError("not_found", "Installed plugin does not exist");
    return (this.repo.db.prepare(`SELECT g.* FROM plugin_skill_grants g JOIN plugin_assets a ON a.asset_id=g.asset_id
      WHERE a.plugin_id=? ORDER BY g.created_at DESC,g.grant_id`).all(pluginId) as GrantRow[]).map(grantRecord);
  }

  revokeSkill(grantId: string): PluginSkillGrant {
    const row = this.repo.db.prepare("SELECT * FROM plugin_skill_grants WHERE grant_id=?").get(grantId) as GrantRow | undefined;
    if (!row) throw new AuxError("not_found", "Skill grant does not exist");
    this.repo.db.prepare("UPDATE plugin_skill_grants SET revoked_at=? WHERE grant_id=? AND revoked_at IS NULL")
      .run(Date.now(), grantId);
    return grantRecord(this.repo.db.prepare("SELECT * FROM plugin_skill_grants WHERE grant_id=?").get(grantId) as GrantRow);
  }

  readSkill(raw: unknown) {
    const input = PluginSkillReadParams.parse(raw);
    const row = this.repo.db.prepare(`SELECT g.*,a.kind,a.name,a.content,a.digest,p.workspace_id,p.uninstalled_at
      FROM plugin_skill_grants g JOIN plugin_assets a ON a.asset_id=g.asset_id
      JOIN plugins p ON p.plugin_id=a.plugin_id WHERE g.grant_id=?`).get(input.grantId) as
      (GrantRow & { kind: string; name: string; content: string | null; digest: string; workspace_id: string; uninstalled_at: number | null }) | undefined;
    if (!row || row.revoked_at !== null || row.uninstalled_at !== null || row.kind !== "skill" || row.content === null)
      throw new AuxError("permission_denied", "Skill grant is not active.");
    const task = this.repo.db.prepare("SELECT workspace_id,revision FROM tasks WHERE task_id=?").get(input.taskId) as
      { workspace_id: string; revision: number } | undefined;
    if (!task || task.workspace_id !== row.workspace_id || task.revision !== input.expectedRevision ||
      (row.scope_kind === "workspace" ? row.scope_id !== task.workspace_id
        : row.scope_id !== input.taskId || row.task_revision !== task.revision))
      throw new AuxError("permission_denied", "Skill grant does not cover this task and revision.");
    if (row.asset_digest !== row.digest || createHash("sha256").update(row.content).digest("hex") !== row.digest)
      throw new AuxError("conflict", "Imported Skill content changed. Review and grant it again.");
    return PluginSkillReadSchema.parse({ grant: grantRecord(row), name: row.name, content: row.content, digest: row.digest });
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
