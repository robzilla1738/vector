import { expect, it } from "vitest";
import {
  LocalMemoryEmbeddings,
  cosineSimilarity,
} from "../../apps/runtime/src/services/local-memory-embeddings.js";

function fixture() {
  let digest = "a".repeat(64);
  const calls: Array<{ path: string; body?: Record<string, unknown> }> = [];
  let afterEmbed = () => {};
  const request: typeof fetch = async (input, init) => {
    const path = new URL(String(input)).pathname;
    const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : undefined;
    calls.push({ path, body });
    expect(new URL(String(input)).origin).toBe("http://127.0.0.1:11434");
    expect(init?.redirect).toBe("error");
    if (init?.signal?.aborted) throw init.signal.reason;
    let result: unknown;
    if (path === "/api/tags")
      result = {
        models: [
          { name: "installed-embed:latest", digest },
          { name: "chat:latest", digest },
        ],
      };
    else if (path === "/api/show")
      result = { capabilities: body?.model === "installed-embed:latest" ? ["embedding"] : ["completion"] };
    else if (path === "/api/embed") {
      result = { embeddings: [[0.8, 0.2]] };
      afterEmbed();
    } else throw new Error("Unexpected local API");
    return Response.json(result);
  };
  return {
    service: new LocalMemoryEmbeddings(request),
    calls,
    mutateDuringEmbed: () => {
      afterEmbed = () => {
        digest = "b".repeat(64);
      };
    },
  };
}

it("discovers only installed embedding-capable models and uses the actual embed protocol", async () => {
  const f = fixture(),
    signal = new AbortController().signal;
  const models = await f.service.discover(signal);
  expect(models).toEqual([{ modelId: "installed-embed:latest", digest: "a".repeat(64) }]);
  expect(await f.service.embed(models[0]!, "vehicle", signal)).toEqual([0.8, 0.2]);
  expect(f.calls.find((call) => call.path === "/api/embed")?.body).toEqual({
    model: "installed-embed:latest",
    input: "vehicle",
    truncate: true,
  });
  expect(f.calls.some((call) => call.path === "/api/pull")).toBe(false);
  expect(cosineSimilarity([1e308, 1e308], [1e-300, 1e-300])).toBeCloseTo(1);
  expect(cosineSimilarity([1, 0], [0.8, 0.2])).toBeGreaterThan(cosineSimilarity([1, 0], [0, 1]));
});

it("refuses a model digest changed during embedding before its vector can be cached", async () => {
  const f = fixture(),
    signal = new AbortController().signal;
  const [model] = await f.service.discover(signal);
  f.mutateDuringEmbed();
  await expect(f.service.embed(model!, "original article", signal)).rejects.toMatchObject({
    code: "cancelled",
  });
});

it("rejects malformed embeddings and aborted operations without remote fallback", async () => {
  const invalid = new LocalMemoryEmbeddings(async (input) =>
    Response.json(
      new URL(String(input)).pathname === "/api/tags"
        ? { models: [{ name: "installed", digest: "a".repeat(64) }] }
        : { embeddings: [[0, 0]] },
    ),
  );
  await expect(
    invalid.embed({ modelId: "installed", digest: "a".repeat(64) }, "text", new AbortController().signal),
  ).rejects.toMatchObject({ code: "backend_unavailable" });
  const f = fixture(),
    controller = new AbortController();
  controller.abort();
  await expect(
    f.service.embed({ modelId: "installed", digest: "a".repeat(64) }, "text", controller.signal),
  ).rejects.toThrow();
  expect(f.calls).toEqual([]);
});
