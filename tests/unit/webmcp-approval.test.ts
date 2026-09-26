import { afterEach, describe, expect, it } from "vitest";
import { AuxError } from "@aux/contracts";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { DecisionJournal, type DecideDeps } from "../../apps/runtime/src/safety/decide.js";
import { runWebmcp, webmcpTurn, type WebmcpNative } from "../../apps/runtime/src/agent/webmcp.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});

const tools = [
  { name: "read_count", description: "Read", readOnly: true, consequential: false },
  { name: "add_write", description: "Write", readOnly: false, consequential: true },
  { name: "flagged_read", description: "Consequential read", readOnly: true, consequential: true },
];

function harness() {
  const db = openDb(":memory:");
  databases.push(db);
  const approvals = new ApprovalStore(db);
  const deps: DecideDeps = {
    approvals,
    journal: new DecisionJournal(db),
    managedRules: () => [],
    userRules: () => [],
    localCeiling: () => "ask",
    settingsGrants: () => ["effect:write"],
    audit: () => {},
  };
  const calls: { name: string; input: string }[] = [];
  const native: WebmcpNative = {
    webmcpList: async () => ({ tools }),
    webmcpCall: async (_pageId, name, input) => {
      calls.push({ name, input });
      return { result: name === "read_count" ? "0" : "1", success: true };
    },
  };
  const actor = {
    profileId: "default",
    scope: { kind: "workspace" as const, id: "default" },
    actor: "user" as const,
    runId: undefined,
  };
  const call = (name: string) =>
    runWebmcp(
      native,
      { pageId: "page-1", op: "call", name, input: "{}" },
      { ...actor, ...webmcpTurn("page-1", name) },
      deps,
      "http://127.0.0.1:9",
    );
  return { approvals, calls, call };
}

describe("runWebmcp", () => {
  it("runs a read tool without asking and asks before a write", async () => {
    const { approvals, calls, call } = harness();
    const read = await call("read_count");
    expect(read).toEqual({ status: "called", result: "0", success: true });
    expect(calls).toEqual([{ name: "read_count", input: "{}" }]);

    const asked = await call("add_write");
    expect(asked.status).toBe("ask");
    expect(calls).toHaveLength(1);
    if (asked.status !== "ask") throw new Error("expected an approval");
    approvals.decideLocal({ decision: "accept", approvalId: asked.approvalId }, asked.turnId);

    const ran = await call("add_write");
    expect(ran).toEqual({ status: "called", result: "1", success: true });
    expect(calls.filter((entry) => entry.name === "add_write")).toEqual([{ name: "add_write", input: "{}" }]);

    const again = await call("add_write");
    expect(again.status).toBe("ask");
    expect(calls.filter((entry) => entry.name === "add_write")).toHaveLength(1);

    const flagged = await call("flagged_read");
    expect(flagged.status).toBe("ask");
    expect(calls.some((entry) => entry.name === "flagged_read")).toBe(false);
  });

  it("does not call a tool the page did not register", async () => {
    const { calls, call } = harness();
    await expect(call("missing")).rejects.toMatchObject({ code: "not_found" } satisfies Partial<AuxError>);
    expect(calls).toEqual([]);
  });
});
