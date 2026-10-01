import assert from 'node:assert/strict';

/** OpenAI-compatible transport fixture. The journey supplies the actual model decisions. */
export function createModelFixture(fixture, { respond = () => ({ content: 'Loopback fixture response' }) } = {}) {
  const calls = [];
  let responseFor = respond;
  const remove = fixture.route('/v1/chat/completions', async (request, response) => {
    let body = '';
    for await (const chunk of request) {
      body += chunk.toString();
      assert.ok(Buffer.byteLength(body) <= 1024 * 1024, 'Model fixture request too large');
    }
    const payload = JSON.parse(body);
    assert.ok(Array.isArray(payload.messages) && payload.messages.length, 'Model fixture needs messages');
    calls.push(payload);
    const result = await responseFor(payload, calls.length);
    const message = { role: 'assistant', content: result.content ?? null, ...(result.tool_calls ? { tool_calls: result.tool_calls } : {}) };
    const base = { id: `aux-loopback-${calls.length}`, created: 1, model: payload.model,
      usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 } };
    const finish = result.tool_calls?.length ? 'tool_calls' : 'stop';
    if (payload.stream) {
      response.setHeader('content-type', 'text/event-stream');
      response.write(`data: ${JSON.stringify({ ...base, object: 'chat.completion.chunk', choices: [{ index: 0, delta: message, finish_reason: null }] })}\n\n`);
      response.end(`data: ${JSON.stringify({ ...base, object: 'chat.completion.chunk', choices: [{ index: 0, delta: {}, finish_reason: finish }] })}\n\ndata: [DONE]\n\n`);
      return;
    }
    return { ...base, object: 'chat.completion', choices: [{ index: 0, message, finish_reason: finish }] };
  }, { method: 'POST', headers: { 'content-type': 'application/json' } });
  return { endpoint: `${fixture.url}/v1`, model: 'fixture-model', calls,
    respond(handler) { assert.equal(typeof handler, 'function'); responseFor = handler; }, close: remove };
}
