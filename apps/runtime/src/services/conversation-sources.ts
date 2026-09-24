import { ObservationSchema, type Artifact, type ConversationSource, type StepRecord } from "@aux/contracts";

export function isObservationArtifactContent(content: string): boolean {
  try { return ObservationSchema.safeParse(JSON.parse(content)).success; }
  catch { return false; }
}

/** Convert a run-owned observation artifact into path-free source provenance. */
export function conversationSourceFromArtifact(artifact: Artifact, content: string): ConversationSource | undefined {
  if (!artifact.runId || artifact.status !== "complete" || artifact.mediaType !== "application/json") return undefined;
  let raw: unknown;
  try { raw = JSON.parse(content); }
  catch { return undefined; }
  const parsed = ObservationSchema.safeParse(raw);
  if (!parsed.success || parsed.data.pageId !== artifact.pageId) return undefined;
  let url: URL;
  try { url = new URL(parsed.data.content.url); }
  catch { return undefined; }
  if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
  return {
    sourceId: artifact.artifactId,
    runId: artifact.runId,
    pageId: parsed.data.pageId,
    ...(parsed.data.profileId ? { profileId: parsed.data.profileId } : {}),
    url: url.href.slice(0, 4000),
    title: parsed.data.content.title.replace(/\s+/g, " ").trim().slice(0, 1000) || url.hostname,
    observedAt: parsed.data.observedAt,
    documentEpoch: parsed.data.documentEpoch,
    revision: parsed.data.revision,
  };
}

/** Provider event links retain account identity without implying a browser Profile. */
export function calendarConversationSourcesFromStep(step: StepRecord): ConversationSource[] {
  if (step.op !== "calendar.events.list" || step.outcome?.status !== "ok" || !Array.isArray(step.outcome.extracted?.events)) return [];
  return step.outcome.extracted.events.flatMap((value, index): ConversationSource[] => {
    if (!value || typeof value !== "object") return [];
    const event = value as Record<string, unknown>;
    const origin = event.source && typeof event.source === "object" ? event.source as Record<string, unknown> : {};
    if (typeof event.title !== "string" || typeof event.start !== "string" || typeof event.end !== "string" ||
      typeof origin.connectionId !== "string" || typeof origin.accountKey !== "string" || typeof origin.fetchedAt !== "number" ||
      typeof event.url !== "string") return [];
    let url: URL;
    try { url = new URL(event.url); } catch { return []; }
    if (url.protocol !== "https:" || url.username || url.password ||
      !(url.hostname === "calendar.google.com" || (url.hostname === "www.google.com" && url.pathname.startsWith("/calendar/")))) return [];
    if (url.href.length > 4000) return [];
    const eventId = typeof event.eventId === "string" && event.eventId ? event.eventId : undefined;
    return [{ kind: "calendar", sourceId: `${step.stepId}:${eventId ?? index}`, runId: step.runId,
      connectionId: origin.connectionId, accountKey: origin.accountKey.slice(0, 1000), ...(eventId ? { eventId } : {}),
      url: url.href, title: event.title.slice(0, 1000), start: event.start.slice(0, 100), end: event.end.slice(0, 100), observedAt: origin.fetchedAt }];
  });
}

/** Keep the latest observation of each tab and URL per turn. */
export function dedupeConversationSources(sources: ConversationSource[]): ConversationSource[] {
  const latest = new Map<string, ConversationSource>();
  for (const source of sources) {
    const key = source.kind === "calendar"
      ? `${source.runId}\0calendar\0${source.connectionId}\0${source.url}`
      : `${source.runId}\0browser\0${source.profileId ?? ""}\0${source.pageId}\0${source.url}`;
    const prior = latest.get(key);
    if (!prior || source.observedAt > prior.observedAt ||
      (source.kind !== "calendar" && prior.kind !== "calendar" && source.observedAt === prior.observedAt && source.revision > prior.revision)) latest.set(key, source);
  }
  return [...latest.values()].sort((a, b) => a.observedAt - b.observedAt || a.sourceId.localeCompare(b.sourceId)).slice(-200);
}
