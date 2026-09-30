import { createServer } from "node:http";

export const MODEL_ID = "aux-onboarding-local-fixture";
export const PAGE_MARKER = "AUX_ONBOARDING_DISPOSABLE_SOURCE";
// A done claim of eight or more characters must appear in the observed page.
export const ANSWER = "A local page about a small decision. Compare two options, cite this source, and keep the result as a draft.";

/** A held, unpaid OpenAI-compatible reply and a page with no owner data. */
export async function onboardingModelFixture() {
  const calls = [];
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const server = createServer(async (request, response) => {
    if (request.method === "GET" && request.url?.startsWith("/fixture")) {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end(`<!doctype html><title>Aux first task fixture</title><main><h1>First useful question</h1><p>${PAGE_MARKER}: ${ANSWER}</p></main>`);
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
    if (payload.model !== MODEL_ID || !Array.isArray(payload.messages)) {
      response.writeHead(400).end("Unexpected onboarding model request");
      return;
    }
    calls.push({ model: payload.model, stream: payload.stream === true, at: Date.now() });
    await gate;
    if (response.destroyed) return;
    const content = JSON.stringify({ status: "done", message: "Finished the local first task", result: { answer: ANSWER } });
    if (payload.stream === true) {
      response.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store" });
      response.write(`data: ${JSON.stringify({ id: "onboarding-local", object: "chat.completion.chunk", created: 1, model: MODEL_ID, choices: [{ index: 0, delta: { role: "assistant", content }, finish_reason: null }] })}\n\n`);
      response.write(`data: ${JSON.stringify({ id: "onboarding-local", object: "chat.completion.chunk", created: 1, model: MODEL_ID, choices: [{ index: 0, delta: {}, finish_reason: "stop" }], usage: { prompt_tokens: 12, completion_tokens: 12, total_tokens: 24 } })}\n\n`);
      response.end("data: [DONE]\n\n");
      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ id: "onboarding-local", object: "chat.completion", created: 1, model: MODEL_ID, choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content } }], usage: { prompt_tokens: 12, completion_tokens: 12, total_tokens: 24 } }));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  return {
    endpoint: `http://127.0.0.1:${server.address().port}/v1`,
    pageUrl: `http://127.0.0.1:${server.address().port}/fixture`,
    calls,
    release: () => release(),
    async close() {
      release();
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    },
  };
}
