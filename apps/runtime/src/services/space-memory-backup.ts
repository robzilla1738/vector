import { withSecureDelete } from "../store/db.js";
import type { DatabaseSync } from "node:sqlite";
import { digest } from "@aux/contracts/util/digest";

export function omitSpaceMemory(db: DatabaseSync) {
  withSecureDelete(db, () => {
    db.prepare("DELETE FROM memory_files").run();
    db.prepare("DELETE FROM memory_history").run();
  });
}

/** Independent Space revision history, not an earlier ordinary backup's memory. */
export function currentSpaceMemory(db: DatabaseSync) {
  const files = db.prepare("SELECT * FROM memory_files ORDER BY workspace_id,name").all();
  const history = db.prepare("SELECT * FROM memory_history ORDER BY workspace_id,revision_id").all();
  const watermarks = db
    .prepare("SELECT * FROM memory_pipeline_watermarks ORDER BY workspace_id,run_id")
    .all();
  const rawSettings = db
    .prepare(
      "SELECT * FROM kv WHERE key LIKE 'setting:memoryPipelinePolicy:%' OR key LIKE 'setting:workspaceMemory:%' OR key='setting:browserSpaces' ORDER BY key",
    )
    .all();
  const owners = new Set([...files, ...history, ...watermarks].map((row) => String(row.workspace_id)));
  for (const row of rawSettings)
    if (String(row.key).startsWith("setting:memoryPipelinePolicy:"))
      owners.add(String(row.key).slice("setting:memoryPipelinePolicy:".length));
  const settings = rawSettings.filter(
    (row) =>
      String(row.key).startsWith("setting:memoryPipelinePolicy:") ||
      (String(row.key).startsWith("setting:workspaceMemory:") &&
        owners.has(String(row.key).slice("setting:workspaceMemory:".length))),
  );
  const browserSetting = rawSettings.find((row) => row.key === "setting:browserSpaces");
  const browserSpaces = browserSetting
    ? (JSON.parse(String(browserSetting.value)) as { workspaceId: string }[]).filter((space) =>
        owners.has(space.workspaceId),
      )
    : [];
  const workspaces = db
    .prepare("SELECT * FROM workspaces ORDER BY workspace_id")
    .all()
    .filter((row) => owners.has(String(row.workspace_id)));
  return { files, history, watermarks, settings, workspaces, owners: [...owners].sort(), browserSpaces };
}
export type SpaceMemorySnapshot = ReturnType<typeof currentSpaceMemory>;
export function spaceMemoryDigest(snapshot: SpaceMemorySnapshot) {
  return digest(JSON.stringify(snapshot));
}
export function retainSpaceMemory(db: DatabaseSync, snapshot: SpaceMemorySnapshot) {
  omitSpaceMemory(db);
  db.prepare("DELETE FROM memory_pipeline_watermarks").run();
  db.prepare("DELETE FROM memory_pipeline_leases").run();
  const clearSetting = db.prepare("DELETE FROM kv WHERE key=?");
  for (const id of snapshot.owners) {
    clearSetting.run(`setting:memoryPipelinePolicy:${id}`);
    clearSetting.run(`setting:workspaceMemory:${id}`);
  }
  const workspace = db.prepare(
    "INSERT INTO workspaces(workspace_id,name,created_at) VALUES(?,?,?) ON CONFLICT(workspace_id) DO UPDATE SET name=excluded.name,created_at=excluded.created_at",
  );
  for (const row of snapshot.workspaces) workspace.run(row.workspace_id!, row.name!, row.created_at!);
  const file = db.prepare(
    "INSERT INTO memory_files(workspace_id,name,generation,key_name,content) VALUES(?,?,?,?,?)",
  );
  for (const row of snapshot.files)
    file.run(row.workspace_id!, row.name!, row.generation!, row.key_name!, row.content!);
  const revision = db.prepare(
    "INSERT INTO memory_history(workspace_id,revision_id,captured_at,generation,key_name,content) VALUES(?,?,?,?,?,?)",
  );
  for (const row of snapshot.history)
    revision.run(
      row.workspace_id!,
      row.revision_id!,
      row.captured_at!,
      row.generation!,
      row.key_name!,
      row.content!,
    );
  const mark = db.prepare(
    "INSERT INTO memory_pipeline_watermarks(workspace_id,run_id,captured_at) VALUES(?,?,?)",
  );
  for (const row of snapshot.watermarks) mark.run(row.workspace_id!, row.run_id!, row.captured_at!);
  const setting = db.prepare("INSERT OR REPLACE INTO kv(key,value) VALUES(?,?)");
  for (const row of snapshot.settings) setting.run(row.key!, row.value!);
  if (snapshot.owners.length) {
    const previous = db.prepare("SELECT value FROM kv WHERE key='setting:browserSpaces'").get();
    const spaces = previous ? (JSON.parse(String(previous.value)) as { workspaceId: string }[]) : [];
    setting.run(
      "setting:browserSpaces",
      JSON.stringify([
        ...spaces.filter((space) => !snapshot.owners.includes(space.workspaceId)),
        ...snapshot.browserSpaces,
      ]),
    );
  }
}
