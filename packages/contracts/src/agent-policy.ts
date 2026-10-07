import { z } from "zod";
import { exactOrigin } from "./util/exact-origin.js";

export const AgentModeSchema = z.enum(["auto", "ask", "full"]);
export const AgentPolicyCategorySchema = z.enum([
  "read",
  "navigate",
  "input",
  "click",
  "scroll",
  "dialog",
  "download",
  "tabs",
  "submit",
  "send",
  "post",
  "delete",
  "install",
  "upload",
  "bash",
  "mcp",
  "external_tool",
  "money",
  "credentials",
  "account_security",
  "captcha",
  "file_write",
  "file_delete",
]);
export type AgentMode = z.infer<typeof AgentModeSchema>;
export type AgentPolicyCategory = z.infer<typeof AgentPolicyCategorySchema>;
export const AgentPolicyOverrideSchema = z
  .object({
    category: AgentPolicyCategorySchema,
    access: z.enum(["allow", "ask", "block"]),
    site: z
      .string()
      .refine((value) => exactOrigin(value) === value, "Use an exact HTTP(S) origin.")
      .optional(),
    amountLimit: z.number().finite().nonnegative().optional(),
  })
  .strict()
  .refine(
    (rule) => rule.amountLimit === undefined || rule.category === "money",
    "Amount limits apply only to money.",
  );
export const AgentPolicySettingsSchema = z
  .object({
    agentMode: AgentModeSchema.default("ask"),
    agentPolicyRevision: z.number().int().nonnegative().default(0),
    agentPolicies: z.array(AgentPolicyOverrideSchema).max(1000).default([]),
  })
  .strict()
  .superRefine((settings, context) => {
    const keys = new Set<string>();
    settings.agentPolicies.forEach((rule, index) => {
      const key = `${rule.category}|${rule.site ?? ""}`;
      if (keys.has(key))
        context.addIssue({
          code: "custom",
          path: ["agentPolicies", index],
          message: "Duplicate category/site policy.",
        });
      keys.add(key);
    });
  });
export type AgentPolicySettings = z.infer<typeof AgentPolicySettingsSchema>;
export type AgentPolicyDisposition = "allow" | "ask" | "block" | "touch_id" | "handoff";
export interface AgentPolicyDecision {
  disposition: AgentPolicyDisposition;
  source: "default" | "user";
  reason: string;
  category: AgentPolicyCategory;
}
const ORDINARY = new Set<AgentPolicyCategory>([
  "read",
  "navigate",
  "input",
  "click",
  "scroll",
  "dialog",
  "download",
  "tabs",
]);

/** Pure mode policy. Runtime authority and hard denies are checked separately at dispatch. */
export function policyFor(input: {
  mode: AgentMode;
  category: AgentPolicyCategory;
  site?: string;
  amount?: number;
  overrides?: readonly z.infer<typeof AgentPolicyOverrideSchema>[];
}): AgentPolicyDecision {
  const { category, mode } = input;
  const result = (
    disposition: AgentPolicyDisposition,
    source: AgentPolicyDecision["source"],
    reason: string,
  ): AgentPolicyDecision => ({ disposition, source, reason, category });
  if (category === "account_security" || category === "captcha")
    return result("handoff", "default", "person_only");
  const site = input.site ? exactOrigin(input.site) : undefined;
  const candidates =
    input.overrides?.filter((rule) => rule.category === category && (!rule.site || rule.site === site)) ?? [];
  const override = candidates.find((rule) => rule.site) ?? candidates.find((rule) => !rule.site);
  if (override) {
    if (override.access === "block") return result("block", "user", "category_blocked");
    if (override.access === "ask")
      return result(
        category === "money" || category === "credentials" ? "touch_id" : "ask",
        "user",
        "category_asks",
      );
    if (
      category !== "money" ||
      override.amountLimit === undefined ||
      (typeof input.amount === "number" &&
        Number.isFinite(input.amount) &&
        input.amount >= 0 &&
        input.amount <= override.amountLimit)
    )
      return result("allow", "user", "category_allowed");
    return result("touch_id", "user", "amount_limit_unproven");
  }
  if (ORDINARY.has(category)) return result("allow", "default", "ordinary_action");
  if (mode === "ask")
    return result(
      category === "money" || category === "credentials" ? "touch_id" : "ask",
      "default",
      "ask_mode",
    );
  if (mode === "auto" && (category === "money" || category === "credentials"))
    return result("touch_id", "default", "device_confirmation_required");
  return result("allow", "default", "mode_allows");
}

/** Existing effect producers use a finer browser taxonomy; normalize it once. */
export function agentPolicyCategoryFor(category: string, action = ""): AgentPolicyCategory {
  if (category === "file_write" || category === "file_delete") return category;
  const operation = action.split(".").at(-1)?.replace(/[-_]/g, "").toLowerCase();
  if (["passwordchange", "twofactor", "recovery", "security"].includes(operation ?? ""))
    return "account_security";
  if (["captcha", "botblock", "paywallbypass"].includes(operation ?? "")) return "captcha";
  if (["purchase", "payment", "subscription", "pay"].includes(operation ?? "")) return "money";
  if (["writefile", "editfile", "applychanges", "createfile", "movefile", "undo"].includes(operation ?? ""))
    return "file_write";
  if (operation === "deletefile") return "file_delete";
  if (operation === "bash") return "bash";
  if (operation === "scroll" || operation === "hover" || operation === "stop") return "scroll";
  if (action.startsWith("mcp.")) return "mcp";
  if (action.startsWith("tabs.") || action.startsWith("chrome.tabs.")) return "tabs";
  switch (category) {
    case "purchase":
    case "payment":
      return "money";
    case "credential":
    case "login":
      return "credentials";
    case "account":
    case "security":
    case "password_change":
    case "two_factor":
      return "account_security";
    case "captcha":
    case "bot_block":
    case "paywall_bypass":
      return "captcha";
    case "interact":
    case "cookie":
    case "permission":
      return "click";
    case "file_write":
    case "file_delete":
    case "read":
    case "navigate":
    case "input":
    case "submit":
    case "send":
    case "post":
    case "delete":
    case "install":
    case "upload":
    case "download":
    case "dialog":
    case "external_tool":
      return category;
    default:
      return "external_tool";
  }
}

/** A reviewed batch is authorized only when every included category permits it. */
export function policyForCategories(
  input: Omit<Parameters<typeof policyFor>[0], "category"> & { categories: readonly AgentPolicyCategory[] },
): AgentPolicyDecision {
  const priorities = { allow: 0, ask: 1, touch_id: 2, handoff: 3, block: 4 };
  const decisions = input.categories.map((category) => policyFor({ ...input, category }));
  return decisions.reduce((strictest, next) =>
    priorities[next.disposition] > priorities[strictest.disposition] ? next : strictest,
  );
}
