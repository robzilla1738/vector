import { CredentialHandoffRequestSchema, type CredentialHandoffResult } from "@aux/contracts";
import { exactOrigin } from "./origin-policy.js";

export type CredentialHost = {
  /** The native password manager resolves the opaque ref; this port never returns a value. */
  fillFromPasswordManager(request: {
    credentialRef: string; pageId: string; expectedOrigin: string; usernameSelector?: string; passwordSelector: string;
  }): Promise<{ status: "filled" | "unavailable" | "target_changed" }>;
};

/** Compare every independently obtained origin before touching the password manager. */
export async function secureCredentialHandoff(raw: unknown, host: CredentialHost): Promise<CredentialHandoffResult> {
  const parsed = CredentialHandoffRequestSchema.safeParse(raw);
  if (!parsed.success) return { status: "denied", reason: "permission_denied" };
  const request = parsed.data;
  const top = exactOrigin(request.topLevelOrigin);
  const frame = exactOrigin(request.frameOrigin);
  const submit = exactOrigin(request.submissionOrigin);
  if (!top || top !== frame || frame !== submit) return { status: "denied", reason: "origin_mismatch" };
  const result = await host.fillFromPasswordManager({
    credentialRef: request.credentialRef,
    pageId: request.pageId,
    expectedOrigin: top,
    usernameSelector: request.usernameSelector,
    passwordSelector: request.passwordSelector,
  });
  if (result.status === "unavailable") return { status: "denied", reason: "credential_unavailable" };
  if (result.status === "target_changed") return { status: "denied", reason: "target_changed" };
  return { status: "filled", pageId: request.pageId, credentialRef: request.credentialRef };
}
