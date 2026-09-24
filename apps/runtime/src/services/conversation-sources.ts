import { ObservationSchema, type Artifact, type ConversationSource } from "@aux/contracts";

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

/** Keep the latest observation of each tab and URL per turn. */
export function dedupeConversationSources(sources: ConversationSource[]): ConversationSource[] {
  const latest = new Map<string, ConversationSource>();
  for (const source of sources) {
    const key = `${source.runId}\0${source.profileId ?? ""}\0${source.pageId}\0${source.url}`;
    const prior = latest.get(key);
    if (!prior || source.observedAt > prior.observedAt || (source.observedAt === prior.observedAt && source.revision > prior.revision)) latest.set(key, source);
  }
  return [...latest.values()].sort((a, b) => a.observedAt - b.observedAt || a.sourceId.localeCompare(b.sourceId)).slice(-200);
}
