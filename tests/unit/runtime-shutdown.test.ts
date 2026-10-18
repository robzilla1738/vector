import { afterEach, expect, it, vi } from "vitest";
import { runtimeShutdown } from "../../apps/runtime/src/services/runtime-shutdown.js";
import { NightShiftService, type NightShiftRuntime } from "../../apps/runtime/src/services/night-shift.js";
import { openDb, Repo, BudgetsService } from "@aux/runtime";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});
function nightShift() {
  const db = openDb(":memory:");
  databases.push(db);
  const runtime: NightShiftRuntime = {
    backgroundEnabled: () => false,
    onAC: async () => false,
    releaseActivity: vi.fn(async () => {
      throw new Error("Native owner channel unavailable");
    }),
    powerActivity: async () => ({ active: false }),
    start: async () => "run",
    cancel: async () => {},
    resume: async () => {},
    consolidate: async () => ({}),
    reindex: async () => ({}),
  };
  const budgets = new BudgetsService(db, () => ({}), {
    root: (id) => id,
    descendants: () => [],
    runLimitUsd: () => undefined,
  });
  return { runtime, service: new NightShiftService(new Repo(db), runtime, budgets) };
}

function shutdownWithNightShift(
  service: NightShiftService,
  beforeFeatures: () => Promise<void> = async () => {},
) {
  const reportFailure = vi.fn(),
    cleanup = vi.fn();
  const shutdown = runtimeShutdown({
    quiesce: () => {},
    retireAuthority: async () => {},
    closeEgress: () => {},
    disconnectAuthority: () => {},
    stopMessages: async () => {},
    markInterrupted: async () => {},
    stopFeatures: async (reason) => {
      await beforeFeatures();
      await service.close(reason);
    },
    cleanup: [{ stage: "database", run: cleanup }],
    reportFailure,
  });
  return { shutdown, reportFailure, cleanup };
}

it("does not call an impossible power-release RPC after the native owner disconnects", async () => {
  const { service, runtime } = nightShift();
  const { shutdown, reportFailure, cleanup } = shutdownWithNightShift(service);
  await expect(shutdown("native-owner-disconnected")).resolves.toBeUndefined();
  expect(runtime.releaseActivity).not.toHaveBeenCalled();
  expect(reportFailure).not.toHaveBeenCalled();
  expect(cleanup).toHaveBeenCalledTimes(1);
});

it("retains a live-owner power release failure and still completes the other shutdown stages", async () => {
  const { service, runtime } = nightShift();
  const { shutdown, reportFailure, cleanup } = shutdownWithNightShift(service);
  await expect(shutdown()).rejects.toThrow("Runtime shutdown did not complete every authority boundary");
  expect(runtime.releaseActivity).toHaveBeenCalledTimes(1);
  expect(reportFailure).toHaveBeenCalledWith(
    "feature-stop",
    expect.objectContaining({ message: "Native owner channel unavailable" }),
  );
  expect(cleanup).toHaveBeenCalledTimes(1);
});

it("observes owner disconnect during an already-running local shutdown without creating another cleanup", async () => {
  const { service, runtime } = nightShift();
  let arrived!: () => void, finish!: () => void;
  const ready = new Promise<void>((resolve) => {
    arrived = resolve;
  });
  const held = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const { shutdown, reportFailure, cleanup } = shutdownWithNightShift(service, async () => {
    arrived();
    await held;
  });
  const first = shutdown();
  await ready;
  expect(shutdown("native-owner-disconnected")).toBe(first);
  finish();
  await first;
  expect(runtime.releaseActivity).not.toHaveBeenCalled();
  expect(reportFailure).not.toHaveBeenCalled();
  expect(cleanup).toHaveBeenCalledTimes(1);
});

it("refused native retirement disconnects its owner, retains refusal and performs every cleanup without claiming interruption", async () => {
  const stages: string[] = [],
    failures: string[] = [];
  const shutdown = runtimeShutdown({
    quiesce: () => {
      stages.push("quiesce");
    },
    retireAuthority: async () => {
      throw new Error("No exact native ACK");
    },
    disconnectAuthority: () => {
      stages.push("disconnect");
    },
    closeEgress: () => {
      stages.push("egress");
    },
    stopMessages: async () => {
      stages.push("messages");
      throw new Error("Message retirement refused");
    },
    markInterrupted: async () => {
      stages.push("interrupted");
    },
    stopFeatures: async () => {
      stages.push("features");
    },
    cleanup: [
      {
        stage: "failed-resource",
        run: async () => {
          stages.push("resource-one");
          throw new Error("Cleanup refused");
        },
      },
      {
        stage: "last-resource",
        run: () => {
          stages.push("resource-two");
        },
      },
    ],
    reportFailure: (stage) => {
      failures.push(stage);
    },
  });
  const first = shutdown();
  expect(shutdown()).toBe(first);
  await expect(first).rejects.toThrow("Runtime shutdown did not complete every authority boundary");
  expect(stages).toEqual([
    "quiesce",
    "disconnect",
    "egress",
    "messages",
    "features",
    "resource-one",
    "resource-two",
  ]);
  expect(failures).toEqual(["native-authority-retirement", "message-stop", "failed-resource"]);
  expect(shutdown()).toBe(first);
});
