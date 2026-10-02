import assert from 'node:assert/strict';

/** OpenAI-compatible transport fixture. The journey supplies the actual model decisions.
 * @param {any} fixture
 * @param {{ respond?: (payload: any, callIndex: number) => any, signal?: AbortSignal }} options
 */
export function createModelFixture(fixture, { respond = () => ({ content: 'Loopback fixture response' }), signal } = {}) {
  const calls = [];
  const errors = [];
  let responseFor = respond;
  const holds = new Map();
  let nextHold = 0;
  function holdText(prefix, suffix) {
    assert.ok(signal instanceof AbortSignal && !signal.aborted, 'Held SSE requires the journey global abort signal');
    assert.ok(typeof prefix === 'string' && prefix.length && typeof suffix === 'string' && suffix.length);
    assert.ok(Buffer.byteLength(prefix + suffix) <= 64 * 1024 && holds.size < 8, 'Held SSE fixture must be bounded');
    const id = ++nextHold;
    let settle;
    const gate = new Promise(resolve => { settle = resolve; });
    const hold = { prefix, suffix, gate, used: false, released: false, cancelled: false,
      release() { hold.released = true; settle(); },
      cancel() { hold.cancelled = true; settle(); holds.delete(id); signal.removeEventListener('abort', onAbort); },
    };
    const onAbort = () => hold.cancel();
    hold.cleanup = () => { holds.delete(id); signal.removeEventListener('abort', onAbort); };
    signal.addEventListener('abort', onAbort, { once: true });
    holds.set(id, hold);
    return { response: { content: prefix + suffix, streamHold: id },
      release: () => hold.release(), cancel: () => hold.cancel() };
  }
  const remove = fixture.route('/v1/chat/completions', async (request, response) => {
    let body = '';
    for await (const chunk of request) {
      body += chunk.toString();
      assert.ok(Buffer.byteLength(body) <= 1024 * 1024, 'Model fixture request too large');
    }
    const payload = JSON.parse(body);
    assert.ok(Array.isArray(payload.messages) && payload.messages.length, 'Model fixture needs messages');
    calls.push(payload);
    const callIndex = calls.length;
    let result;
    try { result = await responseFor(payload, callIndex); }
    catch (error) {
      errors.push({ call: callIndex, message: String(error?.message ?? error).slice(0, 512),
        hasTools: Array.isArray(payload.tools), stream: payload.stream === true });
      if (errors.length > 16) errors.shift();
      throw error;
    }
    const message = { role: 'assistant', content: result.content ?? null, ...(result.tool_calls ? { tool_calls: result.tool_calls } : {}) };
    const usage = result.usage ?? { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 };
    assert.ok([usage.prompt_tokens, usage.completion_tokens, usage.total_tokens].every(value => Number.isSafeInteger(value) && value >= 0 && value <= 10_000_000), 'Synthetic transport usage must be bounded integers');
    assert.equal(usage.total_tokens, usage.prompt_tokens + usage.completion_tokens, 'Synthetic transport usage must balance');
    const base = { id: `aux-loopback-${callIndex}`, created: 1, model: payload.model,
      usage };
    const finish = result.tool_calls?.length ? 'tool_calls' : 'stop';
    if (result.streamHold !== undefined) {
      const hold = holds.get(result.streamHold);
      assert.ok(hold && !hold.used && payload.stream === true && !result.tool_calls, 'Held SSE is one-use text-only streaming');
      hold.used = true;
      const disconnect = () => hold.cancel();
      response.once('close', disconnect);
      const chunk = (delta, finish_reason = null, final = false) =>
        `data: ${JSON.stringify({ ...base, ...(final ? { usage } : { usage: undefined }), object: 'chat.completion.chunk', choices: [{ index: 0, delta, finish_reason }] })}\n\n`;
      try {
        response.setHeader('content-type', 'text/event-stream');
        response.flushHeaders();
        response.write(chunk({ role: 'assistant', content: hold.prefix }));
        await hold.gate;
        if (hold.cancelled || signal.aborted || response.destroyed) { response.destroy(); return; }
        response.write(chunk({ content: hold.suffix }));
        response.end(chunk({}, finish, true) + 'data: [DONE]\n\n');
      } finally { response.removeListener('close', disconnect); hold.cleanup(); }
      return;
    }
    if (payload.stream) {
      response.setHeader('content-type', 'text/event-stream');
      response.write(`data: ${JSON.stringify({ ...base, object: 'chat.completion.chunk', choices: [{ index: 0, delta: { ...message, ...(message.tool_calls ? { tool_calls: message.tool_calls.map((call, index) => ({ index, ...call })) } : {}) }, finish_reason: null }] })}\n\n`);
      response.end(`data: ${JSON.stringify({ ...base, object: 'chat.completion.chunk', choices: [{ index: 0, delta: {}, finish_reason: finish }] })}\n\ndata: [DONE]\n\n`);
      return;
    }
    return { ...base, object: 'chat.completion', choices: [{ index: 0, message, finish_reason: finish }] };
  }, { method: 'POST', headers: { 'content-type': 'application/json' } });
  return { endpoint: `${fixture.url}/v1`, model: 'fixture-model', calls, errors,
    respond(handler) { assert.equal(typeof handler, 'function'); responseFor = handler; }, holdText,
    get pendingHolds() { return holds.size; },
    close() { for (const hold of holds.values()) hold.cancel(); remove(); } };
}
