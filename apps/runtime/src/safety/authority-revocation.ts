import type { OriginRule, SafetyAction, StandingGrant } from "@aux/contracts";
import { preapprovableCategory } from "./confirmation.js";

export type AuthorityMatcher = (runId: string, origins: readonly string[]) => boolean;

/** Owner mutations retire transport authority without changing approved task resources or turn selection. */
export class SafetyAuthorityRevocation {
  constructor(
    private readonly deps: {
      profileId: string;
      runScope(runId: string): SafetyAction["scope"] | undefined;
      invalidate(matches: AuthorityMatcher): Promise<void>;
    },
  ) {}

  policies(before: readonly OriginRule[], after: readonly OriginRule[]): Promise<void> {
    const changed = new Set(
      [...before, ...after]
        .map((rule) => rule.origin)
        .filter(
          (origin) =>
            JSON.stringify(before.filter((rule) => rule.origin === origin)) !==
            JSON.stringify(after.filter((rule) => rule.origin === origin)),
        ),
    );
    const normalized = new Set([...changed].map((origin) => new URL(origin).origin));
    return this.deps.invalidate((_runId, origins) => origins.some((origin) => normalized.has(origin)));
  }

  grants(grants: readonly StandingGrant[]): Promise<void> {
    return this.deps.invalidate((runId, origins) => {
      const scope = this.deps.runScope(runId);
      return grants.some((grant) => {
        if (grant.profileId !== this.deps.profileId) return false;
        const sameScope = scope?.kind === grant.scope.kind && scope.id === grant.scope.id;
        const acrossScopes =
          grant.lifetime === "always" &&
          !grant.sessionId &&
          !grant.recipient &&
          !!grant.origin &&
          preapprovableCategory(grant.category);
        if (!sameScope && !acrossScopes) return false;
        return !grant.origin || origins.includes(new URL(grant.origin).origin);
      });
    });
  }
}
