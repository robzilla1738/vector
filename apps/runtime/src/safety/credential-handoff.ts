import { CredentialHandoffRequestSchema, CredentialHandoffResultSchema, type CredentialHandoffRequest, type CredentialHandoffResult } from "@aux/contracts";

export type CredentialHost = {
  /** The native host alone reads the owning Profile password store. */
  fillSavedPassword(request: CredentialHandoffRequest): Promise<CredentialHandoffResult>;
};

/** Only bounded selectors and an exact URL may cross the runtime boundary. */
export async function secureCredentialHandoff(raw: unknown, host: CredentialHost): Promise<CredentialHandoffResult> {
  const parsed = CredentialHandoffRequestSchema.safeParse(raw);
  if (!parsed.success) return { status: "permission_denied" };
  return CredentialHandoffResultSchema.parse(await host.fillSavedPassword(parsed.data));
}
