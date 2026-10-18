import { z } from "zod";

/**
 * Compact event rows with a monotonically increasing sequence number
 * inside a durable stream (D9). `streamId` identifies the stream
 * generation — a recreated store mints a new one, so a stale cursor can
 * never silently resume against reset sequence numbers. Subscribers
 * reconnect with `events.since(lastSeq, streamId)`; a gap below the
 * retained floor or a stream mismatch answers `resync` so the client
 * refetches a snapshot instead of applying a hole.
 */
export const EventSchema = z.object({
  seq: z.number().int().positive(),
  streamId: z.string(),
  runId: z.string().optional(),
  type: z.string(),
  payload: z.record(z.string(), z.unknown()),
  ts: z.number(),
});
export type AuxEvent = z.infer<typeof EventSchema>;

export const EventTypes = {
  PageUpdated: "page.updated",
  PageAdded: "page.added",
  PageRemoved: "page.removed",
  PageLoading: "page.loading",
  PageCrashed: "page.crashed",
  PageTakeover: "page.takeover",
  Observation: "observation.new",
  RunUpdated: "run.updated",
  RunStatus: "run.status",
  StepFinished: "step.finished",
  /** Throttled streaming text of the run's answer/status message: { runId, text (so far), seq }. */
  RunAnswerDelta: "run.answer.delta",
  RunContextChanged: "run.context.changed",
  SetUpdated: "set.updated",
  MemberUpdated: "member.updated",
  ResultAdded: "result.added",
  ArtifactAdded: "artifact.added",
  ModelCall: "model.call",
  DownloadStarted: "download.started",
  DownloadFinished: "download.finished",
  DownloadsRemoved: "downloads.removed",
  SessionChanged: "session.changed",
  /** A model-posted durable notice on a run — the `notification` loop tool. */
  RunNotice: "run.notice",
  SettingsChanged: "settings.changed",
  Preview: "page.preview",
  RoutineUpdated: "routine.updated",
} as const;
