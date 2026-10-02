import { lineageRuns, runRoot } from "./run-lineage.js";
import { AuxError } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { BrowserEgress } from "../safety/browser-egress.js";
import type { NativePermissionController } from "../safety/native-permission.js";

const controllers = new WeakMap<Repo, NativePermissionController>();
/** Actual authenticated native controller; no standalone permission authority is manufactured. */
export function installOvernightAuthority(repo: Repo, controller: NativePermissionController): void {
  if (controllers.has(repo)) throw new AuxError("conflict", "Overnight native authority is already installed.");
  controllers.set(repo, controller);
}

/** Settings, lifecycle and cost changes retire queued native effect tickets first. */
export async function withOvernightAuthorityMutation<T>(repo: Repo, mutation: () => Promise<T>, runId?: string): Promise<T> {
  const matches = (id: string) => (!runId || lineageRuns(repo, runId).includes(id)) && !!repo.getRun(runRoot(repo, id))?.config?.nightShiftItemId;
  const active = runId ? matches(runId) : (repo.db.prepare("SELECT run_id FROM runs").all() as { run_id: string }[]).some(row => matches(row.run_id));
  // No matching run has overnight authority: there is no effect ticket to retire.
  if (!active) return mutation();
  const controller = controllers.get(repo);
  if (!controller) throw new AuxError("permission_denied", "Native overnight authority retirement is unavailable.");
  return controller.withAuthorityMutation(matches, mutation);
}

/** Actual controller-owned lifecycle and Profile budget mutation boundary. */
export async function withRunAuthorityMutation<T>(repo: Repo, mutation: () => Promise<T>, runId?: string): Promise<T> {
  const controller = controllers.get(repo);
  if (!controller) {
    // Ordinary nonnative tasks have no native permission producer or receipt.
    // Overnight authority still requires its actual controller, never a fallback.
    return withOvernightAuthorityMutation(repo, mutation, runId);
  }
  return controller.withAuthorityMutation(id => !runId || lineageRuns(repo, runId).includes(id), mutation);
}

/** Task mutations retire only that actual source's parent family, after caller scope checks. */
export async function withTaskAuthorityMutation<T>(repo: Repo, taskId: string, mutation: () => Promise<T>): Promise<T> {
  const matches = (id: string) => repo.getRun(runRoot(repo, id))?.config?.taskId === taskId;
  const controller = controllers.get(repo);
  if (controller) return controller.withAuthorityMutation(matches, mutation);
  const rows = repo.db.prepare("SELECT run_id FROM runs").all() as { run_id: string }[];
  if (rows.some(row => matches(row.run_id) && repo.getRun(runRoot(repo, row.run_id))?.config?.nightShiftItemId))
    throw new AuxError("permission_denied", "Native overnight authority retirement is unavailable.");
  return mutation();
}

const browserControllers = new WeakMap<Repo, BrowserEgress>();

export function installBrowserAuthority(repo: Repo, controller: BrowserEgress): void {
  if (browserControllers.has(repo)) throw new AuxError("conflict", "Browser authority is already installed.");
  browserControllers.set(repo, controller);
}

/** Terminal/pause/takeover writers retire CDP/network leases before state mutation.
 * Approval parking and cost ledger writes use their existing permission receipt
 * boundary: they must not abort a genuine held browser transmission approval.
 */
export function withRunDispatchMutation<T>(repo: Repo, mutation: () => Promise<T>, runId?: string): Promise<T> {
  const matches = (id: string) => !runId || lineageRuns(repo, runId).includes(id);
  if (browserControllers.has(repo) && !controllers.has(repo))
    throw new AuxError("permission_denied", "Native browser mutation serialization is unavailable.");
  return withRunAuthorityMutation(repo, async () => {
    const browser = browserControllers.get(repo);
    return browser ? browser.withAuthorityMutation(matches, mutation) : mutation();
  }, runId);
}
