import { createServer } from "node:http";

export const MODEL_ID = "aux-attention-fixture";
export const RUN_A = "AUX_ATTENTION_RUNNING_A";
export const RUN_B = "AUX_ATTENTION_QUESTION_B";
export const RUN_C = "AUX_ATTENTION_FOCUS_C";
export const RUN_D = "AUX_ATTENTION_SYSTEM_D";
export const PRIVATE_QUESTION = "PRIVATE_FIXTURE_DO_NOT_NOTIFY: which local option?";

/** A local, unpaid model with two release gates so the operator controls event timing. */
export async function attentionModelFixture() {
  const seen = new Set();
  const calls = new Map();
  const held = new Map();
  const released = new Set();
  const server = createServer(async (request, response) => {
    if (request.method === "GET" && request.url?.startsWith("/fixture")) {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end("<!doctype html><title>Aux attention fixture</title><main><h1>Local attention fixture</h1><p>Disposable page for two concurrent Aux tasks.</p></main>");
      return;
    }
    if (request.method === "GET" && request.url === "/v1/models") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ object: "list", data: [{ id: MODEL_ID, object: "model" }] }));
      return;
    }
    if (request.method !== "POST" || request.url !== "/v1/chat/completions") {
      response.writeHead(404).end();
      return;
    }
    let body = "";
    for await (const chunk of request) {
      body += chunk;
      if (body.length > 2_000_000) { response.writeHead(413).end(); return; }
    }
    let payload;
    try { payload = JSON.parse(body); }
    catch { response.writeHead(400).end(); return; }
    const serialized = JSON.stringify(payload.messages ?? []);
    const marker = [RUN_B, RUN_A, RUN_C, RUN_D].find(value => serialized.includes(value)) ?? null;
    if (!marker) { response.writeHead(400).end("Unexpected fixture goal"); return; }
    const call = (calls.get(marker) ?? 0) + 1;
    calls.set(marker, call);
    const gate = marker === RUN_B && call > 1 ? `${RUN_B}:2` : marker;
    seen.add(gate);
    // Keep the model step pending until the native UI is viewing the other run.
    if (!released.has(gate)) await new Promise(resolve => held.set(gate, resolve));
    if (response.destroyed) return;
    const content = marker === RUN_B && call === 1
      ? { status: "needs_input", message: "Waiting for your choice", question: PRIVATE_QUESTION }
      : { status: "done", message: "Finished the local fixture", result: { answer: "Disposable page for two concurrent Aux tasks." } };
    const answer = JSON.stringify(content);
    if (payload.stream === true) {
      response.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store" });
      response.write(`data: ${JSON.stringify({ id: `attention-${marker}`, object: "chat.completion.chunk", created: 1,
        model: MODEL_ID, choices: [{ index: 0, delta: { role: "assistant", content: answer }, finish_reason: null }] })}\n\n`);
      response.write(`data: ${JSON.stringify({ id: `attention-${marker}`, object: "chat.completion.chunk", created: 1,
        model: MODEL_ID, choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
        usage: { prompt_tokens: 12, completion_tokens: 12, total_tokens: 24 } })}\n\n`);
      response.end("data: [DONE]\n\n");
      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ id: `attention-${marker}`, object: "chat.completion", created: 1,
      model: MODEL_ID, choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: answer } }],
      usage: { prompt_tokens: 12, completion_tokens: 12, total_tokens: 24 } }));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  return {
    endpoint: `http://127.0.0.1:${server.address().port}/v1`,
    seen: marker => seen.has(marker),
    release(marker) { released.add(marker); held.get(marker)?.(); held.delete(marker); },
    async close() {
      for (const marker of held.keys()) this.release(marker);
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    },
  };
}
