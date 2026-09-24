import { expect, it } from "vitest";
import { calendarConversationSourcesFromStep, conversationSourceFromArtifact, dedupeConversationSources, isObservationArtifactContent } from "@aux/runtime";

const artifact = { artifactId: "artifact-observation", runId: "run-1", pageId: "page-1", path: "/not/exposed.json", mediaType: "application/json", size: 100, status: "complete" as const, createdAt: 1 };
const observation = (overrides: Record<string, unknown> = {}) => JSON.stringify({
  observationId: "observation-1", pageId: "page-1", documentEpoch: 2, revision: 4, observedAt: 10, scope: "full",
  content: { url: "https://example.test/report", title: "  Source   report  ", viewport: { width: 100, height: 100, scale: 1 }, scroll: { x: 0, y: 0, maxY: 0 }, frames: [], text: "Report", headings: [], elements: [], formFields: [], tables: [], links: [], dialogs: [], truncated: false, stats: { elementsTotal: 0, elementsShown: 0, textChars: 6, approxTokens: 2 } },
  ...overrides,
});

it("extracts bounded path-free source provenance only from web observations", () => {
  expect(conversationSourceFromArtifact(artifact, observation())).toEqual({
    sourceId: "artifact-observation", runId: "run-1", pageId: "page-1", url: "https://example.test/report", title: "Source report", observedAt: 10, documentEpoch: 2, revision: 4,
  });
  const profiled = conversationSourceFromArtifact(artifact, observation({ profileId: "profile-work" }));
  expect(profiled?.kind === "calendar" ? undefined : profiled?.profileId).toBe("profile-work");
  expect(JSON.stringify(conversationSourceFromArtifact(artifact, observation()))).not.toContain("not/exposed");
  expect(conversationSourceFromArtifact(artifact, observation({ content: { ...JSON.parse(observation()).content, url: "file:///Users/example/private.txt" } }))).toBeUndefined();
  expect(conversationSourceFromArtifact({ ...artifact, pageId: "other" }, observation())).toBeUndefined();
  expect(conversationSourceFromArtifact({ ...artifact, mediaType: "text/plain" }, observation())).toBeUndefined();
  expect(conversationSourceFromArtifact(artifact, "not-json")).toBeUndefined();
  expect(isObservationArtifactContent(observation())).toBe(true);
  expect(isObservationArtifactContent('{"report":true}')).toBe(false);
});

it("keeps the latest observation per page and URL in each turn", () => {
  const base = conversationSourceFromArtifact(artifact, observation())!;
  const newer = { ...base, sourceId: "observation-new", observedAt: 20, revision: 5 };
  const otherPage = { ...base, sourceId: "observation-second-account", pageId: "page-2", observedAt: 12 };
  const otherProfile = { ...base, sourceId: "observation-other-profile", profileId: "work-profile", observedAt: 13 };
  const otherTurn = { ...base, sourceId: "observation-other", runId: "run-2", observedAt: 15 };
  expect(dedupeConversationSources([newer, base, otherPage, otherProfile, otherTurn])).toEqual([otherPage, otherProfile, otherTurn, newer]);
});

it("keeps Calendar event and account provenance separate from browser pages", () => {
  const step = { stepId: "source-1", runId: "run-1", op: "calendar.events.list", startedAt: 20, outcome: {
    stepId: "source-1", op: "calendar.events.list", status: "ok" as const, startedAt: 20, durationMs: 3,
    extracted: { events: [
      { eventId: "event-1", title: "Meeting", start: "2026-09-25T10:00:00Z", end: "2026-09-25T11:00:00Z",
        url: "https://calendar.google.com/calendar/event?eid=one", source: { connectionId: "account-1", profileId: "profile-fixture", accountKey: "alice@example.test", fetchedAt: 21 } },
      { eventId: "event-2", title: "Wrong link", start: "2026-09-25T12:00:00Z", end: "2026-09-25T13:00:00Z",
        url: "https://outside.example.test/event", source: { connectionId: "account-2", accountKey: "bob@example.test", fetchedAt: 21 } },
    ] },
  } };
  const sources = calendarConversationSourcesFromStep(step);
  expect(sources).toEqual([{ kind: "calendar", sourceId: "source-1:event-1", runId: "run-1", connectionId: "account-1", profileId: "profile-fixture",
    accountKey: "alice@example.test", eventId: "event-1", url: "https://calendar.google.com/calendar/event?eid=one",
    title: "Meeting", start: "2026-09-25T10:00:00Z", end: "2026-09-25T11:00:00Z", observedAt: 21 }]);
  expect(dedupeConversationSources([...sources, conversationSourceFromArtifact(artifact, observation())!])).toHaveLength(2);
  const priorRun = structuredClone(step);
  delete (priorRun.outcome.extracted.events[0] as { eventId?: string }).eventId;
  expect(calendarConversationSourcesFromStep(priorRun)[0]).toMatchObject({ kind: "calendar", accountKey: "alice@example.test", sourceId: "source-1:0" });
});
