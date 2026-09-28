import { randomUUID } from "node:crypto";
import type { PageTarget } from "@aux/contracts";
import type { Repo } from "../store/repo.js";

/** Durable record for browser-local tab effects initiated by a model run. */
export function recordRunTabChange(repo: Repo, runId: string, page: PageTarget,
  op: "tab.open" | "tab.close", status: "ok" | "failed" = "ok"): string {
  const stepId = randomUUID();
  const startedAt = Date.now();
  repo.saveStep({ stepId, runId, pageId: page.pageId, op, startedAt,
    inputs: { url: page.url },
    outcome: { stepId, op, status, startedAt, durationMs: 0, pageUrl: page.url,
      before: op === "tab.open" ? { existed: false } : { url: page.url, documentEpoch: page.documentEpoch },
      after: op === "tab.open" ? { url: page.url, documentEpoch: page.documentEpoch, ownedByRuntime: page.ownedByRuntime }
        : { closed: status === "ok" },
    } });
  return stepId;
}
