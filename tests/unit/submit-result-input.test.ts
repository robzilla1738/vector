import { expect, it } from "vitest";
import { buildToolManifest, type LoopToolContext } from "@aux/runtime";

const ctx = (submitResult: LoopToolContext["deps"]["submitResult"]): LoopToolContext => ({
  runId: "run-1",
  threadId: "chat-1",
  turnId: "run-1",
  callCount: 1,
  pageId: "p1",
  deps: { submitResult },
});

it("accepts citations the model sent as a JSON string", async () => {
  const seen: unknown[] = [];
  const tool = buildToolManifest().submit_result;
  if (!tool) throw new Error("submit_result is missing from the manifest");
  const result = await tool.execute(
    {
      report: "Jordan Lee",
      citations: JSON.stringify([{ observationId: "art_1", quote: "Jordan Lee" }]),
    },
    ctx(async (input) => {
      seen.push(input);
      return { ok: true, result: { report: input.report, citations: input.citations } };
    }),
  );
  expect(seen).toEqual([{ report: "Jordan Lee", citations: [{ observationId: "art_1", quote: "Jordan Lee" }] }]);
  expect(result).toEqual({
    finish: { result: { report: "Jordan Lee", citations: [{ observationId: "art_1", quote: "Jordan Lee" }] } },
  });
});

it("parses citations whose JSON contains a raw tab", async () => {
  const seen: unknown[] = [];
  const tool = buildToolManifest().submit_result;
  if (!tool) throw new Error("submit_result is missing from the manifest");
  const citations = `[{"observationId": "art_1", "quote": "Jordan\tLee"}]`;
  await tool.execute(
    { report: "Jordan Lee", citations },
    ctx(async (input) => {
      seen.push(input);
      return { ok: true, result: { report: input.report } };
    }),
  );
  expect(seen).toEqual([{ report: "Jordan Lee", citations: [{ observationId: "art_1", quote: "Jordan\tLee" }] }]);
});

it("parses a submit_result payload that arrived as one JSON string", async () => {
  const seen: unknown[] = [];
  const tool = buildToolManifest().submit_result;
  if (!tool) throw new Error("submit_result is missing from the manifest");
  await tool.execute(
    JSON.stringify({ report: "in review", citations: [{ observationId: "art_2", quote: "in review" }] }),
    ctx(async (input) => {
      seen.push(input);
      return { ok: true, result: { report: input.report } };
    }),
  );
  expect(seen).toEqual([{ report: "in review", citations: [{ observationId: "art_2", quote: "in review" }] }]);
});

it("wraps one citation object and numeric revision strings", async () => {
  const seen: unknown[] = [];
  const tool = buildToolManifest().submit_result;
  if (!tool) throw new Error("submit_result is missing from the manifest");
  await tool.execute(
    { report: "approved", citations: { pageId: "p1", revision: "2", quote: "approved" } },
    ctx(async (input) => {
      seen.push(input);
      return { ok: true, result: { report: input.report } };
    }),
  );
  expect(seen).toEqual([{ report: "approved", citations: [{ pageId: "p1", revision: 2, quote: "approved" }] }]);
});
