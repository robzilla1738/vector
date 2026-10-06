import { AuxError, OriginPoliciesSnapshotSchema, SetOriginPoliciesSchema } from "@aux/contracts";
import type { Repo } from "../store/repo.js";

/** One synchronous SQLite CAS is the authority shared by every Profile window. */
export class OriginPolicyStore {
  constructor(private readonly repo: Repo) {}
  list() {
    return OriginPoliciesSnapshotSchema.parse({
      revision: this.repo.getSetting("originPoliciesRevision") ?? 0,
      rules: this.repo.getSetting("originPolicies") ?? [],
    });
  }
  set(raw: unknown) {
    const request = SetOriginPoliciesSchema.parse(raw);
    this.repo.db.exec("BEGIN IMMEDIATE");
    try {
      const current = this.list();
      if (request.expectedRevision !== current.revision)
        throw new AuxError(
          "conflict",
          "Agent access changed in another window. Reload the site rules before saving.",
        );
      const next = { rules: request.rules, revision: current.revision + 1 };
      this.repo.setSetting("originPolicies", next.rules);
      this.repo.setSetting("originPoliciesRevision", next.revision);
      this.repo.db.exec("COMMIT");
      return next;
    } catch (error) {
      this.repo.db.exec("ROLLBACK");
      throw error;
    }
  }
}
