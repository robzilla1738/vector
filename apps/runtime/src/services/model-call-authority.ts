import type { ModelCall } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import { withRunAuthorityMutation } from "./overnight-authority.js";

/** Retire queued native receipts before the actual shared cost ledger changes. */
export async function saveAuthorizedModelCall(repo: Repo, call: ModelCall): Promise<void> {
  await withRunAuthorityMutation(repo, async () => {
    repo.saveModelCall(call);
  });
}
