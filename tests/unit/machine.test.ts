import { describe, expect, it } from "vitest";
import { initialMachine, reduce, type MachineEvent } from "../../apps/runtime/src/agent/machine.js";

const table: Array<{ ev: MachineEvent; state: string }> = [
  { ev: { type: "start" }, state: "observing" },
  { ev: { type: "observed" }, state: "planning" },
  { ev: { type: "plan", status: "continue" }, state: "authorizing" },
  { ev: { type: "authorized", ok: true }, state: "dispatching" },
  { ev: { type: "dispatched", failed: false }, state: "observing" },
];

describe("coordinator machine", () => {
  it("walks the happy path", () => {
    let m = initialMachine();
    for (const row of table) {
      m = reduce(m, row.ev);
      expect(m.state).toBe(row.state);
    }
  });

  it("verifies done into completed", () => {
    let m = initialMachine();
    m = reduce(m, { type: "start" });
    m = reduce(m, { type: "observed" });
    m = reduce(m, { type: "plan", status: "done" });
    m = reduce(m, { type: "verified", ok: true });
    expect(m.state).toBe("completed");
  });

  it("ungrounded done goes to repair then fail", () => {
    let m = initialMachine();
    m = reduce(m, { type: "start" });
    m = reduce(m, { type: "observed" });
    m = reduce(m, { type: "plan", status: "done" });
    m = reduce(m, { type: "verified", ok: false });
    expect(m.state).toBe("repairing");
    m = reduce(m, { type: "give_up" });
    expect(m.state).toBe("failed");
  });

  it("needs_input returns to observing after answer", () => {
    let m = initialMachine();
    m = reduce(m, { type: "start" });
    m = reduce(m, { type: "observed" });
    m = reduce(m, { type: "plan", status: "needs_input" });
    m = reduce(m, { type: "answer" });
    expect(m.state).toBe("observing");
  });

  it("permission denial fails the run", () => {
    let m = initialMachine();
    m = reduce(m, { type: "start" });
    m = reduce(m, { type: "observed" });
    m = reduce(m, { type: "plan", status: "continue" });
    m = reduce(m, { type: "authorized", ok: false });
    expect(m.state).toBe("failed");
  });
});
