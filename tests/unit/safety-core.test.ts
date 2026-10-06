import { describe, expect, it } from "vitest";
import { AuxError, toErrorPayload } from "@aux/contracts";
import { secureCredentialHandoff } from "../../apps/runtime/src/safety/credential-handoff.js";
import { SendJournal, sendNotice } from "../../apps/runtime/src/safety/send-journal.js";
import { withDeadline } from "../../apps/runtime/src/safety/policies.js";
import { DurableWriteLedger, beginConsequentialWrite } from "../../apps/runtime/src/agent/durable.js";
import { openDb } from "../../apps/runtime/src/store/db.js";

describe("durable safety and credential boundaries", () => {
  it("never passes credential values through the handoff interface or result", async () => {
    const calls: unknown[] = [];
    const host = {
      fillSavedPassword: async (request: unknown) => {
        calls.push(request);
        return { status: "filled" as const };
      },
    };
    const request = {
      pageId: "page",
      expectedUrl: "https://example.test/login",
      passwordSelector: "#password",
    };
    expect(
      await secureCredentialHandoff({ ...request, credentialRef: `cref_${"a".repeat(24)}` }, host),
    ).toEqual({ status: "permission_denied" });
    expect(await secureCredentialHandoff({ ...request, value: "password-value" }, host)).toEqual({
      status: "permission_denied",
    });
    expect(
      await secureCredentialHandoff({ ...request, expectedUrl: "http://example.test/login" }, host),
    ).toEqual({ status: "permission_denied" });
    expect(calls).toHaveLength(0);
    const result = await secureCredentialHandoff(request, host);
    expect(result.status).toBe("filled");
    expect(JSON.stringify([calls, result])).not.toContain("password-value");
    expect(calls).toEqual([request]);
    await expect(
      secureCredentialHandoff(request, {
        fillSavedPassword: async () => ({ status: "filled", value: "password-value" }) as never,
      }),
    ).rejects.toThrow();
  });

  it("parks a crash-interrupted send and never dispatches it twice on unknown acceptance", async () => {
    const db = openDb(":memory:");
    try {
      const journal = new SendJournal(db);
      const message = journal.queue(
        { nonce: "nonce-1", threadId: "thread", turnId: "turn", text: "hello" },
        100,
      );
      expect(
        journal.queue({ nonce: "nonce-1", threadId: "thread", turnId: "turn", text: "hello" }).nonce,
      ).toBe(message.nonce);
      expect(() =>
        journal.queue({ nonce: "nonce-1", threadId: "thread", turnId: "turn", text: "changed" }),
      ).toThrow();
      let sends = 0;
      const transport = {
        online: () => true,
        lookup: async () => ({ status: "unknown" as const }),
        send: async () => {
          sends += 1;
          throw new Error("connection dropped after dispatch");
        },
      };
      expect((await journal.dispatch(message.nonce, transport)).state).toBe("parked");
      expect((await journal.dispatch(message.nonce, transport)).state).toBe("parked");
      expect(sends).toBe(1);
      expect(journal.settleTurn("turn").status).toBe("needs_attention");
      const reopened = new SendJournal(db);
      expect(reopened.messageStatus(message.nonce)?.state).toBe("parked");
      expect(
        (
          await reopened.dispatch(message.nonce, {
            ...transport,
            lookup: async () => ({ status: "accepted" as const, acceptanceId: "ack-1" }),
          })
        ).state,
      ).toBe("accepted");
      expect(sends).toBe(1);
      reopened.acknowledge(message.nonce, "ack-1");
      expect(reopened.settleTurn("turn").status).toBe("settled");
      const concurrent = reopened.queue({
        nonce: "nonce-2",
        threadId: "thread",
        turnId: "turn-2",
        text: "again",
      });
      const success = {
        online: () => true,
        lookup: async () => ({ status: "unknown" as const }),
        send: async () => {
          sends += 1;
          await new Promise((resolve) => setTimeout(resolve, 5));
          return { acceptanceId: "ack-2" };
        },
      };
      const [first, second] = await Promise.all([
        reopened.dispatch(concurrent.nonce, success),
        reopened.dispatch(concurrent.nonce, success),
      ]);
      expect(first.state).toBe("accepted");
      expect(second.state).toBe("accepted");
      expect(sends).toBe(2);
      expect(sendNotice("parked")).toMatch(/uncertain/i);
    } finally {
      db.close();
    }
  });

  it("does not retry a consequential effect after dispatch or an uncertain restart", () => {
    const db = openDb(":memory:");
    try {
      const ledger = new DurableWriteLedger(db);
      const input = {
        runId: "run",
        pageId: "page",
        documentEpoch: 1,
        steps: [{ op: "click", target: "#submit" }],
        taskId: "task",
        taskRevision: 1,
      };
      const first = beginConsequentialWrite(ledger, input);
      expect(first.skip).toBe(false);
      ledger.fail(first.intentId!); // response lost after dispatch
      const restarted = new DurableWriteLedger(db);
      const second = beginConsequentialWrite(restarted, {
        ...input,
        documentEpoch: 2,
        steps: [{ op: "click", target: "#submit-new" }],
      });
      expect(second.skip).toBe(true);
      expect(second.reason).toMatch(/reconcile/i);
      expect(restarted.unresolved("run")).toHaveLength(1);
    } finally {
      db.close();
    }
  });

  it("emits registry errors without leaking raw exception text or unapproved detail", () => {
    expect(toErrorPayload(new Error("secret-value"))).toMatchObject({
      code: "internal",
      errorId: "AUX-E5000",
    });
    expect(JSON.stringify(toErrorPayload(new Error("secret-value")))).not.toContain("secret-value");
    const payload = toErrorPayload(
      new AuxError("permission_denied", "secret-value", { effect: "write", token: "secret-value" }),
    );
    expect(payload).toMatchObject({ code: "permission_denied", detail: { effect: "write" } });
    expect(JSON.stringify(payload)).not.toContain("secret-value");
  });

  it("links resend nonces into an ordered chain and recovers the draft", async () => {
    const db = openDb(":memory:");
    try {
      const journal = new SendJournal(db);
      const first = journal.queue(
        { nonce: "nonce-a", threadId: "thread", turnId: "turn", text: "hello" },
        100,
      );
      expect(first.rootNonce ?? undefined).toBeUndefined();
      const second = journal.resend("nonce-a", 200);
      expect(second.nonce).not.toBe("nonce-a");
      expect(second).toMatchObject({
        supersedes: "nonce-a",
        rootNonce: "nonce-a",
        text: "hello",
        state: "queued",
      });
      const third = journal.resend(second.nonce, 300);
      expect(third).toMatchObject({ supersedes: second.nonce, rootNonce: "nonce-a" });
      expect(journal.chain(third.nonce).map((r) => r.nonce)).toEqual(["nonce-a", second.nonce, third.nonce]);
      expect(journal.chain("nonce-a")).toHaveLength(3);
      expect(journal.draft("nonce-a")).toMatchObject({ nonce: "nonce-a", text: "hello", state: "queued" });
      journal.cancel(third.nonce);
      expect(journal.draft(third.nonce)).toMatchObject({ state: "cancelled" });
      // A delivered send cannot be resent and has no recoverable draft.
      journal.queue({ nonce: "nonce-b", threadId: "thread", turnId: "turn", text: "hi" });
      expect(journal.acceptLocal("nonce-b", "ack-b").state).toBe("accepted");
      expect(() => journal.resend("nonce-b")).toThrow(/delivered/);
      expect(journal.draft("nonce-b")).toBeUndefined();
      // Journal rows keep the chain across reopen.
      const reopened = new SendJournal(db);
      expect(reopened.chain(third.nonce).map((r) => r.nonce)).toEqual(["nonce-a", second.nonce, third.nonce]);
    } finally {
      db.close();
    }
  });

  it("enforces a deadline even when work ignores cancellation", async () => {
    await expect(withDeadline(() => new Promise<never>(() => {}), 5)).rejects.toThrow("deadline_exceeded");
    await expect(
      withDeadline(async (signal) => {
        expect(signal.aborted).toBe(false);
        return "done";
      }, 50),
    ).resolves.toBe("done");
    const parent = new AbortController();
    parent.abort("stop");
    await expect(withDeadline(async () => "never", 50, parent.signal)).rejects.toThrow("stop");
  });
});
