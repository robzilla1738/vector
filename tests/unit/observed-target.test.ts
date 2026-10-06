import { describe, expect, it } from "vitest";
import { openDb, ApprovalStore, DecisionJournal, SafetyDispatchGate } from "@aux/runtime";
import { observedCategory } from "../../apps/runtime/src/safety/observed-target.js";

const click = { id: "click", op: "click" as const, target: "e1" };
const login = {
  origin: "https://example.test",
  tag: "button",
  type: "submit",
  autocomplete: "",
  name: "Sign in",
  form: {
    action: "https://example.test/login",
    method: "post",
    fields: [{ type: "password", autocomplete: "current-password" }],
  },
};
describe("live target classification", () => {
  it("recognizes a resolved login submit, without treating arbitrary password forms or labels as login", () => {
    expect(observedCategory(click, login)).toBe("login");
    expect(
      observedCategory(click, { ...login, form: { ...login.form, action: "https://other.test/login" } }),
    ).toBeUndefined();
    expect(observedCategory(click, { ...login, name: "Save" })).toBeUndefined();
    expect(observedCategory(click, { ...login, form: { ...login.form, method: "get" } })).toBeUndefined();
    expect(observedCategory(click, { ...login, type: "button" })).toBeUndefined();
  });
  it("escalates protected and consequential targets even when a login label is present", () => {
    expect(
      observedCategory(click, {
        ...login,
        form: { ...login.form, fields: [{ type: "password", autocomplete: "new-password" }] },
      }),
    ).toBe("password_change");
    expect(
      observedCategory(
        { id: "fill", op: "fill", target: "e1", value: "synthetic" },
        { ...login, tag: "input", type: "password", autocomplete: "current-password" },
      ),
    ).toBe("credential");
    expect(observedCategory(click, { ...login, autocomplete: "one-time-code" })).toBe("two_factor");
    expect(observedCategory(click, { ...login, autocomplete: "cc-number" })).toBe("payment");
    expect(observedCategory(click, { ...login, name: "Send message" })).toBe("send");
    expect(observedCategory(click, { ...login, name: "Delete account" })).toBe("delete");
    expect(observedCategory(click, { ...login, challenge: "captcha" })).toBe("captcha");
    expect(
      observedCategory({ id: "fill", op: "fillCredential", passwordSelector: "input[type=password]" }, login),
    ).toBe("credential");
  });
  it("parks the actual observed login producer, grants only that origin/category, and refuses credential preapproval", async () => {
    const db = openDb(":memory:");
    try {
      const approvals = new ApprovalStore(db);
      const gate = new SafetyDispatchGate({
        approvals,
        journal: new DecisionJournal(db),
        managedRules: () => [],
        userRules: () => [],
        localCeiling: () => "always",
        audit: () => {},
      });
      const context = {
        profileId: "profile",
        scope: { kind: "workspace" as const, id: "workspace" },
        turnId: "turn",
        threadId: "thread",
        observedTarget: login,
      };
      await expect(
        gate.check({ step: click, origin: "https://example.test", context, phase: "dispatch" }),
      ).rejects.toMatchObject({ code: "needs_input" });
      const request = approvals.pending("thread")[0]!;
      expect(request.action).toMatchObject({ category: "login", confirmation: "preapprovable" });
      approvals.decideLocal({ decision: "acceptForOrigin", approvalId: request.approvalId }, "turn");
      await expect(
        gate.check({
          step: click,
          origin: "https://example.test",
          context: { ...context, turnId: "next" },
          phase: "dispatch",
        }),
      ).resolves.toMatchObject({ authorizedBy: "standing" });
      await expect(
        gate.check({
          step: { id: "fill", op: "fill", target: "e1", value: "synthetic" },
          origin: "https://example.test",
          context: {
            ...context,
            turnId: "credential",
            observedTarget: { ...login, tag: "input", type: "password", autocomplete: "current-password" },
          },
          phase: "dispatch",
        }),
      ).rejects.toMatchObject({ code: "needs_input" });
      const credential = approvals.pending("thread").find((value) => value.action.turnId === "credential")!;
      expect(credential.action).toMatchObject({
        effect: "credential",
        category: "credential",
        confirmation: "action",
      });
      expect(() =>
        approvals.decideLocal(
          { decision: "acceptForOrigin", approvalId: credential.approvalId },
          "credential",
        ),
      ).toThrow();
    } finally {
      db.close();
    }
  });
});
