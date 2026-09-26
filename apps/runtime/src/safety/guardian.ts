import type { SafetyAction } from "@aux/contracts";

export type GuardianCategory = "data_exfiltration" | "destructive_action" | "privilege_escalation" | "workflow_hijack";
export type GuardianSeverity = "low" | "medium" | "high" | "critical";
export type GuardianFinding = { category: GuardianCategory; severity: GuardianSeverity; reason: string };
export type GuardianDecision =
  | { status: "allow"; findings: GuardianFinding[] }
  | { status: "authorization_required"; findings: GuardianFinding[]; guidance: string }
  | { status: "deny"; findings: GuardianFinding[]; guidance: string };

const RANK = { none: 0, low: 1, medium: 2, high: 3 } as const;

/** Text from pages and tools is data. This envelope must be preserved through every model hop. */
export type UntrustedOutput = { trust: "untrusted"; source: "page" | "tool" | "mcp"; content: string; sourceId?: string };

export type GuardianJudge = (input: { action: SafetyAction; untrusted: readonly UntrustedOutput[] }) => Promise<GuardianFinding[]>;

/** Deterministic policy leads; a judge may only add findings, never relax a denial. */
export async function reviewGuardian(input: {
  action: SafetyAction;
  authorization: "none" | "low" | "medium" | "high";
  restrictedRetry?: boolean;
  untrusted?: readonly UntrustedOutput[];
  judge?: GuardianJudge;
  policyDenied?: boolean;
}): Promise<GuardianDecision> {
  const findings: GuardianFinding[] = [];
  if (input.policyDenied) findings.push({ category: "privilege_escalation", severity: "critical", reason: "deterministic_policy_denied" });
  if (input.restrictedRetry) findings.push({ category: "privilege_escalation", severity: "high", reason: "retry_of_restricted_action" });
  if (input.action.effect === "credential" && input.action.recipient) findings.push({ category: "data_exfiltration", severity: "critical", reason: "credential_to_external_recipient" });
  if (input.action.effect === "destructive") findings.push({ category: "destructive_action", severity: "high", reason: "destructive_effect" });
  if (input.action.effect === "egress" && input.untrusted?.length) findings.push({ category: "workflow_hijack", severity: "medium", reason: "egress_in_untrusted_context" });
  if (findings.some(f => f.severity === "critical")) {
    return { status: "deny", findings, guidance: "Do not retry this critical action. Explain the refusal and ask the user for a safe alternative." };
  }
  const needsJudge = findings.some(f => f.severity === "high") || input.action.effect === "external_tool";
  if (needsJudge && !input.judge) findings.push({ category: "privilege_escalation", severity: "critical", reason: "guardian_unavailable" });
  if (needsJudge && input.judge) {
    try { findings.push(...await input.judge({ action: input.action, untrusted: input.untrusted ?? [] })); }
    catch { findings.push({ category: "privilege_escalation", severity: "critical", reason: "guardian_unavailable" }); }
  }
  if (findings.some(f => f.severity === "critical")) {
    return { status: "deny", findings, guidance: "Do not retry this critical action. Explain the refusal and ask the user for a safe alternative." };
  }
  if (findings.some(f => f.severity === "high") && RANK[input.authorization] < RANK.medium) {
    return { status: "authorization_required", findings, guidance: "Pause; this high-risk action needs an explicit medium-or-higher authorization." };
  }
  return { status: "allow", findings };
}
