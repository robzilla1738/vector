import type { AgentPolicyCategory, ConfirmationLevel, EffectCategory } from "@aux/contracts";
export interface TrustConfirmation {
  reviewedBatch?: boolean;
  approvalId?: string;
  kind: "approval" | "touch-id" | "handoff";
  policyCategory: AgentPolicyCategory;
  site: string;
  amount?: number;
  turnId: string;
  threadId: string;
  instruction: string;
  action: string;
  origin: string;
  category: EffectCategory;
  confirmation: ConfirmationLevel;
  pageId?: string;
}
