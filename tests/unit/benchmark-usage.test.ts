import { expect, it, vi } from "vitest";
import { readRunMetrics } from "../benchmarks/tasks/report-integrity.mjs";

const call = (cachedInputTokens?: number) => ({
  seq: 1,
  type: "model.call",
  payload: {
    modelId: "test/model",
    inputTokens: 100,
    outputTokens: 20,
    ...(cachedInputTokens === undefined ? {} : { providerMetadata: { usage: { cachedInputTokens } } }),
  },
});
const read = (events: ReturnType<typeof call>[]) => {
  const rpc = vi.fn(async (_method, { sinceSeq }) => ({
    streamId: "stream",
    events: sinceSeq ? [] : events.map((event, index) => ({ ...event, seq: index + 1 })),
    lastSeq: events.length,
  }));
  return readRunMetrics(rpc, "run");
};

it("counts cached tokens from the actual model-call metadata across all event pages", async () => {
  const rpc = vi
    .fn()
    .mockResolvedValueOnce({ streamId: "stream", events: [call(80)], lastSeq: 2000 })
    .mockResolvedValueOnce({ streamId: "stream", events: [{ ...call(0), seq: 2001 }], lastSeq: 2001 })
    .mockResolvedValueOnce({ streamId: "stream", events: [], lastSeq: 2001 });
  expect(await readRunMetrics(rpc, "run")).toMatchObject({
    tokens: 240,
    inputTokens: 200,
    cachedInputTokens: 80,
    cachedInputRatio: 0.4,
    modelCallEvents: 2,
    runtimeModel: "test/model",
  });
  expect(rpc.mock.calls[1]).toEqual([
    "runs.events",
    { runId: "run", sinceSeq: 2000, limit: 2000, streamId: "stream" },
  ]);
});

it("distinguishes explicit zero cache use from absent or invalid provider counts", async () => {
  expect(await read([call(0)])).toMatchObject({ cachedInputTokens: 0, cachedInputRatio: 0 });
  expect(await read([call(80), call()])).toMatchObject({
    inputTokens: 200,
    cachedInputTokens: null,
    cachedInputRatio: null,
  });
  expect(await read([call(101)])).toMatchObject({ cachedInputTokens: null, cachedInputRatio: null });
  expect(await read([])).toMatchObject({
    tokens: null,
    inputTokens: null,
    cachedInputTokens: null,
    cachedInputRatio: null,
  });
});

it("does not report complete usage after the event stream requires resynchronization", async () => {
  const rpc = vi
    .fn()
    .mockResolvedValueOnce({ streamId: "stream", events: [call(80)], lastSeq: 2000 })
    .mockResolvedValueOnce({ streamId: "stream", events: [], lastSeq: 3000, resync: true });
  await expect(readRunMetrics(rpc, "run")).rejects.toThrow("history is incomplete");
});
