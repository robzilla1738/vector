import { describe, expect, it } from "vitest";
import { initialMachine, reduce, type Machine, type MachineEvent } from "../../apps/runtime/src/agent/machine.js";

function walk(events: MachineEvent[]): Machine {
  return events.reduce((m, ev) => reduce(m, ev), initialMachine());
}

describe("coordinator machine", () => {
  it("1 idle start → observing", () => {
    expect(reduce(initialMachine(), { type: "start" }).state).toBe("observing");
  });
  it("2 observing → planning", () => {
    expect(walk([{ type: "start" }, { type: "observed" }]).state).toBe("planning");
  });
  it("3 plan continue → authorizing", () => {
    expect(walk([{ type: "start" }, { type: "observed" }, { type: "plan", status: "continue" }]).state).toBe("authorizing");
  });
  it("4 authorized ok → dispatching", () => {
    expect(
      walk([
        { type: "start" },
        { type: "observed" },
        { type: "plan", status: "continue" },
        { type: "authorized", ok: true },
      ]).state,
    ).toBe("dispatching");
  });
  it("5 dispatched ok → observing", () => {
    expect(
      walk([
        { type: "start" },
        { type: "observed" },
        { type: "plan", status: "continue" },
        { type: "authorized", ok: true },
        { type: "dispatched", failed: false },
      ]).state,
    ).toBe("observing");
  });
  it("6 dispatched fail → repairing", () => {
    const m = walk([
      { type: "start" },
      { type: "observed" },
      { type: "plan", status: "continue" },
      { type: "authorized", ok: true },
      { type: "dispatched", failed: true },
    ]);
    expect(m.state).toBe("repairing");
    expect(m.repairs).toBe(1);
  });
  it("7 plan done → verifying", () => {
    expect(walk([{ type: "start" }, { type: "observed" }, { type: "plan", status: "done" }]).state).toBe("verifying");
  });
  it("8 verified ok → completed", () => {
    expect(
      walk([
        { type: "start" },
        { type: "observed" },
        { type: "plan", status: "done" },
        { type: "verified", ok: true },
      ]).state,
    ).toBe("completed");
  });
  it("9 verified fail → repairing", () => {
    expect(
      walk([
        { type: "start" },
        { type: "observed" },
        { type: "plan", status: "done" },
        { type: "verified", ok: false },
      ]).state,
    ).toBe("repairing");
  });
  it("10 needs_input", () => {
    expect(walk([{ type: "start" }, { type: "observed" }, { type: "plan", status: "needs_input" }]).state).toBe(
      "needs_input",
    );
  });
  it("11 answer → observing", () => {
    expect(
      walk([
        { type: "start" },
        { type: "observed" },
        { type: "plan", status: "needs_input" },
        { type: "answer" },
      ]).state,
    ).toBe("observing");
  });
  it("12 permission deny → failed", () => {
    expect(
      walk([
        { type: "start" },
        { type: "observed" },
        { type: "plan", status: "continue" },
        { type: "authorized", ok: false },
      ]).state,
    ).toBe("failed");
  });
  it("13 repair → planning", () => {
    expect(
      walk([
        { type: "start" },
        { type: "observed" },
        { type: "plan", status: "done" },
        { type: "verified", ok: false },
        { type: "repair" },
      ]).state,
    ).toBe("planning");
  });
  it("14 give_up → failed", () => {
    expect(
      walk([
        { type: "start" },
        { type: "observed" },
        { type: "plan", status: "done" },
        { type: "verified", ok: false },
        { type: "give_up" },
      ]).state,
    ).toBe("failed");
  });
  it("15 unknown event is a no-op", () => {
    const m = walk([{ type: "start" }]);
    expect(reduce(m, { type: "answer" }).state).toBe("observing");
  });
  it("16 idle ignores observed", () => {
    expect(reduce(initialMachine(), { type: "observed" }).state).toBe("idle");
  });
  it("17 completed ignores start", () => {
    const done = walk([
      { type: "start" },
      { type: "observed" },
      { type: "plan", status: "done" },
      { type: "verified", ok: true },
    ]);
    expect(reduce(done, { type: "start" }).state).toBe("completed");
  });
  it("18 failed ignores repair", () => {
    const failed = walk([
      { type: "start" },
      { type: "observed" },
      { type: "plan", status: "continue" },
      { type: "authorized", ok: false },
    ]);
    expect(reduce(failed, { type: "repair" }).state).toBe("failed");
  });
  it("19 authorizing ignores dispatched", () => {
    const m = walk([
      { type: "start" },
      { type: "observed" },
      { type: "plan", status: "continue" },
    ]);
    expect(reduce(m, { type: "dispatched", failed: false }).state).toBe("authorizing");
  });
  it("20 planning ignores verified", () => {
    const m = walk([{ type: "start" }, { type: "observed" }]);
    expect(reduce(m, { type: "verified", ok: true }).state).toBe("planning");
  });
  it("21 two repairs increment", () => {
    const m = walk([
      { type: "start" },
      { type: "observed" },
      { type: "plan", status: "continue" },
      { type: "authorized", ok: true },
      { type: "dispatched", failed: true },
      { type: "repair" },
      { type: "plan", status: "continue" },
      { type: "authorized", ok: true },
      { type: "dispatched", failed: true },
    ]);
    expect(m.repairs).toBe(2);
    expect(m.state).toBe("repairing");
  });
  it("22 happy path loop twice", () => {
    const m = walk([
      { type: "start" },
      { type: "observed" },
      { type: "plan", status: "continue" },
      { type: "authorized", ok: true },
      { type: "dispatched", failed: false },
      { type: "observed" },
      { type: "plan", status: "done" },
      { type: "verified", ok: true },
    ]);
    expect(m.state).toBe("completed");
    expect(m.repairs).toBe(0);
  });
  it("23 needs_input ignores verified", () => {
    const m = walk([{ type: "start" }, { type: "observed" }, { type: "plan", status: "needs_input" }]);
    expect(reduce(m, { type: "verified", ok: true }).state).toBe("needs_input");
  });
  it("24 dispatching ignores authorized", () => {
    const m = walk([
      { type: "start" },
      { type: "observed" },
      { type: "plan", status: "continue" },
      { type: "authorized", ok: true },
    ]);
    expect(reduce(m, { type: "authorized", ok: false }).state).toBe("dispatching");
  });
  it("25 observing ignores start", () => {
    const m = walk([{ type: "start" }]);
    expect(reduce(m, { type: "start" }).state).toBe("observing");
  });
  it("26 repair then done completes", () => {
    const m = walk([
      { type: "start" },
      { type: "observed" },
      { type: "plan", status: "done" },
      { type: "verified", ok: false },
      { type: "repair" },
      { type: "plan", status: "done" },
      { type: "verified", ok: true },
    ]);
    expect(m.state).toBe("completed");
    expect(m.repairs).toBe(1);
  });
});
