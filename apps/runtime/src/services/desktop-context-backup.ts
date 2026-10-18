import type { DatabaseSync, SQLInputValue } from "node:sqlite";
import { desktopTablesForDatabase, withSecureDelete } from "../store/db.js";

const tables = [
  "desktop_context_generations",
  "desktop_context_captures",
  "desktop_context_retired_keys",
] as const;
export function currentDesktopContext(db: DatabaseSync) {
  const present = desktopTablesForDatabase(db);
  if (present.length) {
    const size = db
      .prepare(
        "SELECT count(*) AS count,coalesce(sum(length(CAST(content AS BLOB))),0) AS bytes FROM desktop_context_captures",
      )
      .get() as { count: number; bytes: number };
    if (size.count > 10000 || size.bytes > 32 * 1024 * 1024)
      throw new Error("Desktop context exceeds the reviewed recovery size limit.");
  }
  const result = {
    generations: present.length
      ? db.prepare("SELECT * FROM desktop_context_generations ORDER BY workspace_id,app_key").all()
      : [],
    captures: present.length
      ? db.prepare("SELECT * FROM desktop_context_captures ORDER BY workspace_id,capture_id").all()
      : [],
    retired: present.length
      ? db.prepare("SELECT * FROM desktop_context_retired_keys ORDER BY key_name").all()
      : [],
    settings: db.prepare("SELECT * FROM kv WHERE key='setting:desktopContext'").all(),
  };
  if (
    result.captures.length > 10000 ||
    result.captures.reduce((sum, row) => sum + Buffer.byteLength(String(row.content)), 0) > 32 * 1024 * 1024
  )
    throw new Error("Desktop context exceeds the reviewed recovery size limit.");
  return result;
}
export type DesktopContextBackup = ReturnType<typeof currentDesktopContext>;
export function omitDesktopContext(db: DatabaseSync) {
  if (desktopTablesForDatabase(db).length)
    withSecureDelete(db, () => {
      for (const table of tables) db.prepare(`DELETE FROM ${table}`).run();
    });
  db.prepare("DELETE FROM kv WHERE key='setting:desktopContext'").run();
}
/** Ordinary restore keeps current ciphertext and never reactivates a backup's capture consent. */
export function retainDesktopContext(db: DatabaseSync, snapshot: DesktopContextBackup) {
  omitDesktopContext(db);
  for (const row of snapshot.settings)
    db.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run(row.key!, row.value!);
  if (!desktopTablesForDatabase(db).length) {
    if (snapshot.generations.length || snapshot.captures.length)
      throw new Error("Upgrade this backup before restoring current desktop context.");
    return;
  }
  const restore = (table: string, rows: Record<string, SQLInputValue>[]) => {
    for (const row of rows) {
      const columns = Object.keys(row);
      db.prepare(
        `INSERT INTO ${table}(${columns.join(",")}) VALUES(${columns.map(() => "?").join(",")})`,
      ).run(...Object.values(row));
    }
  };
  restore(tables[0], snapshot.generations);
  restore(tables[1], snapshot.captures);
  restore(tables[2], snapshot.retired);
}
