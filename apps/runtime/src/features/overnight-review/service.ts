import { overnightRoot } from "../../services/run-lineage.js";
import { AuxError } from "@aux/contracts";
import type { Services } from "../../api/methods/context.js";
import type { NightShiftService } from "../../services/night-shift.js";
const byRepo = new WeakMap<Services["repo"], NightShiftService>();
const instances = new WeakMap<Services, NightShiftService>();
export function installNightShift(s: Services, service: NightShiftService) {
  if (instances.has(s)) throw new AuxError("conflict", "This Profile already has Night shift.");
  instances.set(s, service); byRepo.set(s.repo, service);
  return async () => { await service.close(); instances.delete(s); byRepo.delete(s.repo); };
}
export function nightShift(s: Services) {
  const service = instances.get(s);
  if (!service) throw new AuxError("feature_unavailable", "Night shift is unavailable in this Profile.");
  return service;
}

export async function checkNightShiftDispatch(repo: Services["repo"], runId: string) {
  const service = byRepo.get(repo);
  const rootId = overnightRoot(repo, runId);
  if (!rootId) return;
  const run = repo.getRun(rootId)!;
  if (!service) throw new AuxError("permission_denied", "This Profile's overnight authority is unavailable.");
  const itemId = run.config?.nightShiftItemId;
  if (!itemId) throw new AuxError("permission_denied", "The overnight queue authority changed.");
  const item = service.get(itemId);
  if (item.runId !== rootId || item.createdBy !== "person") throw new AuxError("permission_denied", "This run is outside its person-queued overnight item.");
  await service.assertDispatch(rootId);
  if (overnightRoot(repo, runId) !== rootId) throw new AuxError("permission_denied", "Run lineage changed during dispatch authorization.");
}

/** Runtime-owned exact queue authority for a native effect receipt. */
export function nightShiftEffectAuthority(repo: Services["repo"], runId: string) {
  const rootId = overnightRoot(repo, runId);
  if (!rootId) return null;
  const service = byRepo.get(repo);
  if (!service) throw new AuxError("permission_denied", "This Profile's overnight authority is unavailable.");
  return service.effectAuthority(rootId);
}
