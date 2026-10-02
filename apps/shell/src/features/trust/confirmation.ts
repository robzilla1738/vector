import type { ConfirmationLevel, EffectCategory } from "@aux/contracts";
export interface TrustConfirmation {
  approvalId?: string;
  turnId: string;
  threadId: string;
  instruction: string;
  action: string;
  origin: string;
  category: EffectCategory;
  confirmation: ConfirmationLevel;
  pageId?: string;
}
