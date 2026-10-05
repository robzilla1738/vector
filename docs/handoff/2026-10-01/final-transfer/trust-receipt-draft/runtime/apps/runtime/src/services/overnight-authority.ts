import { AuxError } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { NativePermissionController } from "../safety/native-permission.js";

const controllers = new WeakMap<Repo, NativePermissionController>();
/** Actual authenticated native controller; no standalone permission authority is manufactured. */
export function installOvernightAuthority(repo: Repo, controller: NativePermissionController): void {
  if (controllers.has(repo)) throw new AuxError("conflict", "Overnight native authority is already installed.");
  controllers.set(repo, controller);
}

/** Settings, lifecycle and cost changes retire queued native effect tickets first. */
export async function withOvernightAuthorityMutation<T>(repo: Repo, mutation: () => Promise<T>, runId?: string): Promise<T> {
  const matches = (id: string) => (!runId || id === runId) && !!repo.getRun(id)?.config?.nightShiftItemId;
  const active = runId ? matches(runId) : (repo.db.prepare("SELECT run_id FROM runs").all() as { run_id: string }[]).some(row => matches(row.run_id));
  // No matching run has overnight authority: there is no effect ticket to retire.
  if (!active) return mutation();
  const controller = controllers.get(repo);
  if (!controller) throw new AuxError("permission_denied", "Native overnight authority retirement is unavailable.");
  return controller.withAuthorityMutation(matches, mutation);
}
