import type { DriverPageEvents } from "@vector/browser-driver";
import type { Repo } from "../store/repo.js";
import type { ArtifactStore } from "./artifacts.js";
import type { EventBus } from "../events.js";

export interface ResponseRecord {
  requestId: string;
  pageId: string;
  url: string;
  method: string;
  status?: number;
  contentType?: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  bodyArtifactId?: string;
  bodyBytes?: number;
  truncated?: boolean;
  runId?: string;
}

type OnResponse = NonNullable<DriverPageEvents["onResponse"]>;

/**
 * Passive response capture (§8): every HTTP response landing in a page is
 * persisted — metadata always, bodies as artifacts for machine-readable
 * types. `state.query` and datasets read from this store, so no work ever
 * re-derives data the page already fetched.
 */
export class ResponseStore {
  constructor(
    private deps: { repo: Repo; events: EventBus; artifacts?: ArtifactStore },
  ) {}

  /** Driver event handler — bound per page in PageService.wireDriverEvents. */
  record(pageId: string): OnResponse {
    return (info) => {
      try {
        let bodyArtifactId: string | undefined;
        if (info.body?.length) {
          const a = this.deps.artifacts?.save({
            pageId,
            label: `response:${info.method} ${info.url.slice(0, 120)}`,
            buffer: info.body,
            mediaType: info.contentType?.split(";")[0] ?? "application/octet-stream",
          });
          bodyArtifactId = a?.artifactId;
        }
        this.deps.repo.saveResponse({
          requestId: info.requestId,
          pageId,
          url: info.url,
          method: info.method,
          status: info.status,
          contentType: info.contentType,
          startedAt: info.startedAt,
          endedAt: info.endedAt,
          durationMs: info.endedAt - info.startedAt,
          bodyArtifactId,
          bodyBytes: info.bodyBytes ?? info.body?.length,
          truncated: info.truncated ? 1 : 0,
        });
      } catch {
        /* capture is observational — never break the page */
      }
    };
  }

  list(pageId: string, opts?: { since?: number; urlIncludes?: string; limit?: number }): ResponseRecord[] {
    return this.deps.repo.listResponses(pageId, opts);
  }

  /** Body of a captured response, when one was stored. */
  body(requestId: string): { buffer: Buffer; mediaType: string } | undefined {
    const rec = this.deps.repo.getResponse(requestId);
    if (!rec?.bodyArtifactId) return undefined;
    const a = this.deps.artifacts?.read(rec.bodyArtifactId);
    return a ? { buffer: Buffer.from(a.dataBase64, "base64"), mediaType: a.artifact.mediaType } : undefined;
  }
}
