import { AuxError } from "@aux/contracts";
import type { Services } from "../../api/methods/context.js";
import type { NightShiftService } from "../../services/night-shift.js";
const byRepo = new WeakMap<Services["repo"], NightShiftService>();
const instances = new WeakMap<Services, NightShiftService>();
export function installNightShift(s: Services, service: NightShiftService) {
  if (instances.has(s)) throw new AuxError("conflict", "This Profile already has Night shift.");
  instances.set(s, service); byRepo.set(s.repo, service);
  return async () => { instances.delete(s); byRepo.delete(s.repo); await service.close(); };
}
export function nightShift(s: Services) {
  const service = instances.get(s);
  if (!service) throw new AuxError("feature_unavailable", "Night shift is unavailable in this Profile.");
  return service;
}

export async function checkNightShiftDispatch(repo: Services["repo"], runId: string) {
  const service = byRepo.get(repo);
  const run = repo.getRun(runId);
  if (!run?.config?.nightShiftItemId) return;
  if (!service) throw new AuxError("permission_denied", "This Profile's overnight authority is unavailable.");
  const item = service.get(run.config.nightShiftItemId);
  if (item.runId !== runId || item.createdBy !== "person") throw new AuxError("permission_denied", "This run is outside its person-queued overnight item.");
  await service.assertDispatch(runId);
}

/** Runtime-owned exact queue authority for a native effect receipt. */
export function nightShiftEffectAuthority(repo: Services["repo"], runId: string) {
  if (!repo.getRun(runId)?.config?.nightShiftItemId) return null;
  const service = byRepo.get(repo);
  if (!service) throw new AuxError("permission_denied", "This Profile's overnight authority is unavailable.");
  return service.effectAuthority(runId);
}
