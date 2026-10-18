import type { RuntimeShutdownReasonReader } from "../../services/runtime-shutdown.js";
import { deferRuntimeWork, isRuntimeIdle } from "../../services/idle.js";
import { AuxError, createClock } from "@aux/contracts";
import type { Services } from "../../api/methods/context.js";
import { NightShiftService } from "../../services/night-shift.js";
import { overnightRuntime } from "./runtime.js";
import { installNightShift } from "./service.js";
export const feature = "overnightReview" as const;
export function boot(s: Services) {
  if (s.featureHost !== "chromium-fork") return;
  if (
    !s.budgets ||
    !s.native?.powerStatus ||
    !s.native.powerActivity ||
    !s.native.powerRelease ||
    !s.repo.columnCipher
  )
    throw new AuxError(
      "backend_unavailable",
      "Night shift requires this Profile's protected storage, budgets and native power service.",
    );
  const native = s.native;
  const service = new NightShiftService(
    s.repo,
    overnightRuntime(s, {
      status: () => native.powerStatus!(),
      release: async () => {
        await native.powerRelease!();
      },
      activity: (reason, durationSec) => native.powerActivity!({ reason, durationSec }),
    }),
    s.budgets,
    s.clock,
  );
  const removeBudget = s.budgets.configureNightShift((runId) => service.budgetStatus(runId));
  const remove = installNightShift(s, service);
  const tick = () => {
    void service
      .tick()
      .catch((error) =>
        console.error("Night shift failed", error instanceof AuxError ? error.code : "internal"),
      );
  };
  let timer: ReturnType<typeof setInterval> | undefined;
  const cancelIdle = deferRuntimeWork(
    () => isRuntimeIdle(s.repo),
    () => {
      timer = setInterval(tick, (s.clock ?? createClock()).delayMs(60_000));
      timer.unref();
      tick();
    },
  );
  return async (reason?: RuntimeShutdownReasonReader) => {
    cancelIdle();
    clearInterval(timer);
    removeBudget();
    await remove(reason);
  };
}
