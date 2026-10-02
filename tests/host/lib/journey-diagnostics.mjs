/** Bounded source evidence from synthetic loopback journeys, never permission authority. */
export function boundedJson(value, maxBytes = 16384) {
  const json = JSON.stringify(value);
  const bytes = Buffer.from(json ?? 'null');
  return { json: bytes.subarray(0, maxBytes).toString('utf8'), bytes: bytes.length, truncated: bytes.length > maxBytes };
}
export async function withFailureEvidence(t, name, action, snapshot) {
  try { return await action(); }
  catch (error) {
    const calls = (t.model?.calls ?? []).slice(-2).map(payload => ({
      model: String(payload.model ?? '').slice(0, 128), stream: payload.stream === true,
      tools: (payload.messages ?? []).filter(message => message.role === 'tool').slice(-4).map(message => ({
        role: 'tool', tool_call_id: String(message.tool_call_id ?? '').slice(0, 128),
        content: boundedJson(message.content, 768),
      })),
    }));
    let actual;
    try { actual = boundedJson(await snapshot()); }
    catch (cause) { actual = { error: String(cause?.message ?? cause).slice(0, 512) }; }
    try { t.diagnostic(name, { originalError: String(error?.message ?? error).slice(0, 512), calls,
      modelErrors: (t.model?.errors ?? []).slice(-8).map(row => ({ call: row.call, stream: row.stream,
        message: String(row.message ?? '').slice(0, 256) })), actual }); }
    catch { /* Diagnostic I/O must never replace the original failing assertion. */ }
    throw error;
  }
}
