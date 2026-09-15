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
  resourceType?: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  bodyArtifactId?: string;
  bodyBytes?: number;
  truncated?: boolean;
  runId?: string;
}

type OnResponse = NonNullable<DriverPageEvents["onResponse"]>;
type ResponseInfo = Parameters<OnResponse>[0];

/** Emitted once per page per flush instead of one artifact event per response. */
export const RESPONSES_UPDATED = "responses.updated";

/**
 * Passive response capture (§8): every HTTP response landing in a page is
 * persisted — metadata always, bodies as artifacts for machine-readable
 * types. `state.query` and datasets read from this store, so no work ever
 * re-derives data the page already fetched.
 *
 * Persistence is asynchronous and batched (speed P1-5): the driver callback
 * only queues; a short timer flushes bodies with fs.promises, inserts the
 * metadata rows in one transaction, and emits a single `responses.updated`
 * per page. Readers call `flush()` first so the API never sees a gap.
 */
export class ResponseStore {
  private pending: { pageId: string; info: ResponseInfo }[] = [];
  private timer: NodeJS.Timeout | null = null;
  private flushing: Promise<void> | null = null;
  private readonly flushDelayMs: number;

  constructor(
    private deps: { repo: Repo; events: EventBus; artifacts?: ArtifactStore; flushDelayMs?: number },
  ) {
    this.flushDelayMs = deps.flushDelayMs ?? 50;
  }

  /** Driver event handler — bound per page in PageService.wireDriverEvents. */
  record(pageId: string): OnResponse {
    return (info) => {
      this.pending.push({ pageId, info });
      if (!this.timer) {
        this.timer = setTimeout(() => void this.flush(), this.flushDelayMs);
        this.timer.unref?.();
      }
    };
  }

  /** Number of captured responses not yet persisted (diagnostics/tests). */
  pendingCount(): number {
    return this.pending.length;
  }

  /** Persist everything queued so far. Safe to call concurrently. */
  flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.flushing) return this.flushing.then(() => (this.pending.length ? this.flush() : undefined));
    if (!this.pending.length) return Promise.resolve();
    const batch = this.pending;
    this.pending = [];
    this.flushing = this.persist(batch)
      .catch(() => {
        /* capture is observational — never break the page */
      })
      .finally(() => {
        this.flushing = null;
      });
    return this.flushing;
  }

  private async persist(batch: { pageId: string; info: ResponseInfo }[]) {
    const withBody = batch.filter((b) => b.info.body?.length);
    const artifacts = this.deps.artifacts
      ? await this.deps.artifacts.saveMany(
          withBody.map((b) => ({
            pageId: b.pageId,
            label: `response:${b.info.method} ${b.info.url.slice(0, 120)}`,
            buffer: b.info.body!,
            mediaType: b.info.contentType?.split(";")[0] ?? "application/octet-stream",
          })),
        )
      : [];
    const artifactIdByRequest = new Map<string, string | undefined>();
    withBody.forEach((b, i) => artifactIdByRequest.set(b.info.requestId, artifacts[i]?.artifactId));
    const perPage = new Map<string, number>();
    this.deps.repo.transaction(() => {
      for (const { pageId, info } of batch) {
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
          bodyArtifactId: artifactIdByRequest.get(info.requestId),
          bodyBytes: info.bodyBytes ?? info.body?.length,
          truncated: info.truncated ? 1 : 0,
        });
        perPage.set(pageId, (perPage.get(pageId) ?? 0) + 1);
      }
    });
    for (const [pageId, count] of perPage) {
      this.deps.events.emit(RESPONSES_UPDATED, { pageId, count, bodies: withBody.filter((b) => b.pageId === pageId).length });
    }
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
