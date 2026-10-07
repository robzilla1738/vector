import type { FeatureBoot } from "../registry.js";
import { liveFolderServices, stopLiveFolderServices } from "../../services/live-folder-services.js";
import { buildMethodDeps } from "../../api/methods/context.js";
import { deferRuntimeWork, isRuntimeIdle } from "../../services/idle.js";

export const feature = "liveFolders";
export const boot: FeatureBoot["boot"] = (services, invoke) => {
  let fallback: ReturnType<typeof buildMethodDeps> | undefined;
  const context = {
    s: services,
    get outboundMcp() {
      return services.outboundMcp ?? (fallback ??= buildMethodDeps(services, invoke)).outboundMcp;
    },
    get routines() {
      return services.routines ?? (fallback ??= buildMethodDeps(services, invoke)).routines;
    },
  };
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const tick = async () => {
    try {
      await liveFolderServices(context).folders.refreshDue();
    } catch {
      /* Per-source errors remain in each folder's durable cache. */
    }
    if (!stopped) {
      timer = setTimeout(() => void tick(), 60_000);
      timer.unref();
    }
  };
  const cancelIdle = deferRuntimeWork(() => isRuntimeIdle(services.repo), tick);
  return async () => {
    stopped = true;
    cancelIdle();
    clearTimeout(timer);
    stopLiveFolderServices(services);
    await fallback?.dispose();
  };
};
