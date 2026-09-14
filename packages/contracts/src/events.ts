import { z } from "zod";

/**
 * Compact event rows with a monotonically increasing sequence number.
 * Subscribers reconnect and request `events.since(lastSeq)`.
 */
export const EventSchema = z.object({
  seq: z.number().int().positive(),
  runId: z.string().optional(),
  type: z.string(),
  payload: z.record(z.string(), z.unknown()),
  ts: z.number(),
});
export type VectorEvent = z.infer<typeof EventSchema>;

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
  SetUpdated: "set.updated",
  MemberUpdated: "member.updated",
  ResultAdded: "result.added",
  ArtifactAdded: "artifact.added",
  ModelCall: "model.call",
  DownloadStarted: "download.started",
  DownloadFinished: "download.finished",
  SessionChanged: "session.changed",
  SettingsChanged: "settings.changed",
  Preview: "page.preview",
} as const;
