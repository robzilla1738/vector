import { expect, it } from "vitest";
import { AgentPolicySettingsSchema, policyFor } from "@aux/contracts";

it("defaults to Auto and uses the same ordinary, consequential, device-auth and handoff policy in each mode", () => {
  expect(AgentPolicySettingsSchema.parse({}).agentMode).toBe("auto");
  for (const mode of ["auto", "ask", "full"] as const) {
    expect(policyFor({ mode, category: "click" }).disposition).toBe("allow");
    expect(policyFor({ mode, category: "send" }).disposition).toBe(mode === "ask" ? "ask" : "allow");
    expect(policyFor({ mode, category: "money" }).disposition).toBe(mode === "full" ? "allow" : "touch_id");
    expect(policyFor({ mode, category: "credentials" }).disposition).toBe(mode === "full" ? "allow" : "touch_id");
    expect(policyFor({ mode, category: "account_security", overrides: [{ category: "account_security", access: "allow" }] }).disposition).toBe("handoff");
  }
});

it("honours exact site/category overrides and requires known money amounts within an explicit cap", () => {
  const overrides = [
    { category: "send", access: "block" },
    { category: "send", site: "https://mail.test", access: "allow" },
    { category: "money", site: "https://shop.test", access: "allow", amountLimit: 50 },
  ] as const;
  expect(policyFor({ mode: "ask", category: "send", site: "https://mail.test", overrides }).disposition).toBe("allow");
  expect(policyFor({ mode: "full", category: "send", site: "https://other.test", overrides }).disposition).toBe("block");
  expect(policyFor({ mode: "auto", category: "money", site: "https://shop.test", amount: 50, overrides }).disposition).toBe("allow");
  for (const amount of [undefined, -1, NaN, Infinity, 51]) {
    expect(policyFor({ mode: "auto", category: "money", site: "https://shop.test", amount, overrides }).disposition).toBe("touch_id");
    expect(policyFor({ mode: "ask", category: "money", site: "https://shop.test", amount, overrides }).disposition).toBe("touch_id");
  }
  expect(AgentPolicySettingsSchema.safeParse({ agentPolicies: [{ category: "send", site: "https://mail.test/path", access: "allow" }] }).success).toBe(false);
  expect(AgentPolicySettingsSchema.safeParse({ agentPolicies: [overrides[0], overrides[0]] }).success).toBe(false);
});
