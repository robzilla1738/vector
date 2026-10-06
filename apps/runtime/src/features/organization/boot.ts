import type { FeatureBoot } from "../registry.js";
import { liveFolderServices, stopLiveFolderServices } from "../../services/live-folder-services.js";
import { buildMethodDeps } from "../../api/methods/context.js";

export const feature = "liveFolders";
export const boot: FeatureBoot["boot"] = (services, invoke) => {
  const { routines } = buildMethodDeps(services, invoke);
  const { folders } = liveFolderServices({ s: services, routines });
  let stopped = false;
  let timer: ReturnType<typeof setTimeout>;
  const tick = async () => {
    try {
      await folders.refreshDue();
    } catch {
      /* Per-source errors remain in each folder's durable cache. */
    }
    if (!stopped) timer = setTimeout(() => void tick(), 60_000);
  };
  void tick();
  return () => {
    stopped = true;
    clearTimeout(timer);
    stopLiveFolderServices(services);
  };
};
