import { parentPort, workerData } from "node:worker_threads";
import { DatabaseSync } from "node:sqlite";

// A separate connection keeps checkpoint lock waits off the browser's runtime loop.
const db = new DatabaseSync(workerData.path as string);
try {
  db.exec("PRAGMA busy_timeout = 50");
  const row = db.prepare("PRAGMA wal_checkpoint(TRUNCATE)").get() as { busy: number };
  parentPort?.postMessage({ complete: row.busy === 0 });
} finally {
  db.close();
}
