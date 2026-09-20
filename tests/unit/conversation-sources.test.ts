import { expect, it } from "vitest";
import { conversationSourceFromArtifact, dedupeConversationSources, isObservationArtifactContent } from "@vector/runtime";

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
  expect(JSON.stringify(conversationSourceFromArtifact(artifact, observation()))).not.toContain("not/exposed");
  expect(conversationSourceFromArtifact(artifact, observation({ content: { ...JSON.parse(observation()).content, url: "file:///Users/example/private.txt" } }))).toBeUndefined();
  expect(conversationSourceFromArtifact({ ...artifact, pageId: "other" }, observation())).toBeUndefined();
  expect(conversationSourceFromArtifact({ ...artifact, mediaType: "text/plain" }, observation())).toBeUndefined();
  expect(conversationSourceFromArtifact(artifact, "not-json")).toBeUndefined();
  expect(isObservationArtifactContent(observation())).toBe(true);
  expect(isObservationArtifactContent('{"report":true}')).toBe(false);
});

it("keeps the latest exact observation for each URL in a turn", () => {
  const base = conversationSourceFromArtifact(artifact, observation())!;
  const newer = { ...base, sourceId: "observation-new", observedAt: 20, revision: 5 };
  const otherTurn = { ...base, sourceId: "observation-other", runId: "run-2", observedAt: 15 };
  expect(dedupeConversationSources([newer, base, otherTurn])).toEqual([otherTurn, newer]);
});
