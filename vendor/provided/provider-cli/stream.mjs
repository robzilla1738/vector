/** Map each CLI's own event stream onto one Aux event stream:
 *   {type:'session', id}            provider session/thread id
 *   {type:'text', delta}            assistant text
 *   {type:'reasoning', delta}       visible reasoning/thinking text
 *   {type:'tool', phase:'start'|'end', id, name, input?, output?, isError?}
 *   {type:'done', reason, usage?}   exactly one terminal event: done or error
 *   {type:'error', code, message}
 * Parsers are pure: push(record) and finish({exitCode, stderr}) return arrays of events. */

const text = value => typeof value === 'string' ? value : '';
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
const contentText = content => typeof content === 'string' ? content
  : Array.isArray(content) ? content.map(part => text(part?.text)).join('') : '';

function terminalGuard(parser) {
  let ended = false;
  const gate = events => {
    const out = [];
    for (const event of events) {
      if (ended) break;
      out.push(event);
      if (event.type === 'done' || event.type === 'error') ended = true;
    }
    return out;
  };
  return {
    push: record => gate(parser.push(record)),
    finish: info => gate(ended ? [] : parser.finish(info)),
    get ended() { return ended; },
  };
}

const exitError = ({exitCode, stderr}, fallback) => ({type: 'error', code: exitCode === 0 ? 'incomplete' : 'exit',
  message: (stderr ?? '').trim().split('\n').slice(-3).join(' ').slice(0, 500) || fallback});

/** Claude Code `-p --output-format stream-json --include-partial-messages`; Grok's
 * Claude-compatible records reuse it. */
function claudeRecords() {
  const streamed = new Set();
  let current;
  return {
    push(record) {
      switch (record.type) {
        case 'system':
          return record.subtype === 'init' && record.session_id ? [{type: 'session', id: record.session_id}] : [];
        case 'stream_event': {
          const event = object(record.event) ?? {};
          if (event.type === 'message_start') current = event.message?.id ?? '';
          if (event.type !== 'content_block_delta') return [];
          streamed.add(current ?? '');
          if (event.delta?.type === 'text_delta') return [{type: 'text', delta: text(event.delta.text)}];
          if (event.delta?.type === 'thinking_delta') return [{type: 'reasoning', delta: text(event.delta.thinking)}];
          return [];
        }
        case 'assistant': {
          const message = object(record.message) ?? {};
          const out = [];
          for (const block of Array.isArray(message.content) ? message.content : []) {
            if (block?.type === 'text' && !streamed.has(message.id ?? '')) out.push({type: 'text', delta: text(block.text)});
            if (block?.type === 'tool_use') out.push({type: 'tool', phase: 'start', id: block.id, name: block.name, input: block.input});
          }
          return out;
        }
        case 'user': {
          const content = record.message?.content;
          return (Array.isArray(content) ? content : []).filter(block => block?.type === 'tool_result')
            .map(block => ({type: 'tool', phase: 'end', id: block.tool_use_id, output: contentText(block.content), isError: block.is_error === true}));
        }
        case 'result':
          if (record.is_error || (record.subtype && record.subtype !== 'success'))
            return [{type: 'error', code: record.subtype ?? 'error', message: text(record.result) || text(record.error) || 'The provider reported an error.'}];
          return [{type: 'done', reason: 'end', usage: record.usage, costUsd: record.total_cost_usd}];
      }
      return [];
    },
    finish: info => [exitError(info, 'Claude Code ended without a result.')],
  };
}

export function claudeParser() { return terminalGuard(claudeRecords()); }

/** Cursor `agent -p --output-format stream-json --stream-partial-output`. */
export function cursorParser() {
  let segment = '';
  return terminalGuard({
    push(record) {
      switch (record.type) {
        case 'system':
          return record.subtype === 'init' && record.session_id ? [{type: 'session', id: record.session_id}] : [];
        case 'assistant': {
          const chunk = contentText(record.message?.content);
          if (!chunk || chunk === segment) return []; // a complete restatement of the streamed segment
          if (segment && chunk.startsWith(segment)) { const delta = chunk.slice(segment.length); segment = chunk; return [{type: 'text', delta}]; }
          segment += chunk;
          return [{type: 'text', delta: chunk}];
        }
        case 'tool_call': {
          segment = '';
          const call = object(record.tool_call) ?? {};
          const [kind] = Object.keys(call);
          const detail = object(call[kind]) ?? {};
          const name = detail.name ?? detail.toolName ?? kind?.replace(/ToolCall$/, '') ?? 'tool';
          if (record.subtype === 'started') return [{type: 'tool', phase: 'start', id: record.call_id, name, input: detail.args}];
          if (record.subtype === 'completed') {
            const result = object(detail.result) ?? {};
            return [{type: 'tool', phase: 'end', id: record.call_id, name, output: result.success ?? result.error ?? detail.result, isError: !!result.error}];
          }
          return [];
        }
        case 'result':
          if (record.is_error || (record.subtype && record.subtype !== 'success'))
            return [{type: 'error', code: record.subtype ?? 'error', message: text(record.result) || 'Cursor reported an error.'}];
          return [{type: 'done', reason: 'end', usage: record.usage}];
      }
      return [];
    },
    finish: info => [exitError(info, 'Cursor ended without a result.')],
  });
}

/** Generic shapes for streams whose schema is not published (Grok streaming-json). */
function genericRecord(record) {
  const kind = text(record.type).toLowerCase();
  const payload = text(record.delta) || text(record.text) || (typeof record.content === 'string' ? record.content : '');
  if (/^(text|text_delta|delta|content_delta|message_delta|assistant_delta)$/.test(kind)) return payload ? [{type: 'text', delta: payload}] : [];
  if (/^(thinking|thinking_delta|reasoning|reasoning_delta)$/.test(kind)) return payload ? [{type: 'reasoning', delta: payload}] : [];
  if (/^(tool_call|tool_use|tool_start|tool_call_start)$/.test(kind)) return [{type: 'tool', phase: 'start', id: record.id ?? record.call_id, name: record.name ?? record.tool, input: record.input ?? record.arguments}];
  if (/^(tool_result|tool_end|tool_call_end|tool_call_result)$/.test(kind)) return [{type: 'tool', phase: 'end', id: record.id ?? record.call_id ?? record.tool_use_id, output: record.output ?? record.result, isError: record.is_error === true || record.isError === true}];
  if (/^(done|end|complete|completed|finish|finished|turn_end)$/.test(kind)) return [{type: 'done', reason: 'end', usage: record.usage}];
  if (kind === 'error') return [{type: 'error', code: 'error', message: text(record.message) || text(record.error?.message) || text(record.error) || 'The provider reported an error.'}];
  if (kind === 'session' && record.id) return [{type: 'session', id: record.id}];
  return [];
}

/** Grok Build `-p --output-format streaming-json --include-partial-messages`. Accepts the
 * Claude-compatible records Grok advertises compat aliases for, then generic shapes. */
export function grokParser() {
  const claude = claudeRecords();
  return terminalGuard({
    push: record => ['system', 'stream_event', 'assistant', 'user', 'result'].includes(record.type) ? claude.push(record) : genericRecord(record),
    finish: info => info.exitCode === 0 ? [{type: 'done', reason: 'end'}] : [exitError(info, 'Grok ended with an error.')],
  });
}

/** OpenCode `run --format json`. Text parts arrive whole or as deltas; tools carry state. */
export function opencodeParser() {
  let session;
  const parts = new Map(), tools = new Set();
  const partText = (part, kind) => {
    if (!part) return [];
    if (typeof part.delta === 'string') { parts.set(part.id, (parts.get(part.id) ?? '') + part.delta); return [{type: kind, delta: part.delta}]; }
    const full = text(part.text), seen = parts.get(part.id) ?? '';
    parts.set(part.id, full);
    if (!full || full === seen) return [];
    return [{type: kind, delta: full.startsWith(seen) ? full.slice(seen.length) : full}];
  };
  return terminalGuard({
    push(record) {
      const out = [];
      const id = record.sessionID ?? record.part?.sessionID;
      if (id && id !== session) { session = id; out.push({type: 'session', id}); }
      const part = object(record.part);
      switch (record.type) {
        case 'text': return [...out, ...partText(part, 'text')];
        case 'reasoning': return [...out, ...partText(part, 'reasoning')];
        case 'tool_use': {
          const state = object(part?.state) ?? {};
          const callId = part?.callID ?? part?.id;
          if (!tools.has(callId)) { tools.add(callId); out.push({type: 'tool', phase: 'start', id: callId, name: part?.tool, input: state.input}); }
          if (state.status === 'completed' || state.status === 'error')
            out.push({type: 'tool', phase: 'end', id: callId, name: part?.tool, output: state.output ?? state.error, isError: state.status === 'error'});
          return out;
        }
        case 'step_finish':
          return part?.reason === 'stop' ? [...out, {type: 'done', reason: 'end', usage: part.tokens}] : out;
        case 'error': {
          const error = object(record.error) ?? {};
          return [...out, {type: 'error', code: error.name ?? 'error', message: text(error.data?.message) || text(error.message) || text(error.name) || 'OpenCode reported an error.'}];
        }
      }
      return [...out, ...genericRecord(record)];
    },
    finish: info => info.exitCode === 0 ? [{type: 'done', reason: 'end'}] : [exitError(info, 'OpenCode ended with an error.')],
  });
}

/** Codex `app-server` notifications (JSON-RPC, protocol v2 generated by codex 0.164.0). */
export function codexParser() {
  return terminalGuard({
    push(message) {
      const params = object(message.params) ?? {};
      switch (message.method) {
        case 'thread/started': return params.thread?.id ? [{type: 'session', id: params.thread.id}] : [];
        case 'item/agentMessage/delta': return [{type: 'text', delta: text(params.delta)}];
        case 'item/reasoning/textDelta':
        case 'item/reasoning/summaryTextDelta': return [{type: 'reasoning', delta: text(params.delta)}];
        case 'item/started':
        case 'item/completed': {
          const item = object(params.item) ?? {};
          if (!['mcpToolCall', 'dynamicToolCall', 'commandExecution', 'webSearch'].includes(item.type)) return [];
          const name = item.type === 'mcpToolCall' ? `${item.server}.${item.tool}` : item.tool ?? item.type;
          if (message.method === 'item/started') return [{type: 'tool', phase: 'start', id: item.id, name, input: item.arguments ?? item.command ?? item.query}];
          return [{type: 'tool', phase: 'end', id: item.id, name, output: item.result ?? item.aggregatedOutput ?? item.error, isError: item.status === 'failed' || !!item.error}];
        }
        case 'error':
          return params.willRetry ? [] : [{type: 'error', code: params.error?.codexErrorInfo ? 'codex' : 'error', message: text(params.error?.message) || 'Codex reported an error.'}];
        case 'turn/completed': {
          const turn = object(params.turn) ?? {};
          if (turn.status === 'failed') return [{type: 'error', code: 'failed', message: text(turn.error?.message) || 'The Codex turn failed.'}];
          return [{type: 'done', reason: turn.status === 'interrupted' ? 'cancelled' : 'end'}];
        }
      }
      return [];
    },
    finish: info => [exitError(info, 'Codex ended before the turn completed.')],
  });
}

export const PARSERS = Object.freeze({
  'claude-stream-json': claudeParser, 'cursor-stream-json': cursorParser,
  'grok-streaming-json': grokParser, 'opencode-json': opencodeParser, 'codex-app-server': codexParser,
});
