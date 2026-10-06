import { expect, it } from "vitest";
import { runtimeShutdown } from "../../apps/runtime/src/services/runtime-shutdown.js";

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
