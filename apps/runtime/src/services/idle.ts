import type { Repo } from "../store/repo.js";

export function isRuntimeIdle(repo: Repo): boolean {
  return !repo.db.prepare("SELECT 1 FROM runs WHERE status IN ('queued','planning','running') LIMIT 1").get();
}

/** Start optional background work after startup settles and no run is active. */
export function deferRuntimeWork(
  isIdle: () => boolean,
  work: () => void | Promise<void>,
  delayMs = 5_000,
): () => void {
  let stopped = false;
  let timer: NodeJS.Timeout;
  const schedule = () => {
    timer = setTimeout(() => {
      if (stopped) return;
      if (!isIdle()) {
        schedule();
        return;
      }
      void Promise.resolve()
        .then(() => {
          if (!stopped) return work();
        })
        .catch(() => console.error("Deferred runtime work failed"));
    }, delayMs);
    timer.unref();
  };
  schedule();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}
