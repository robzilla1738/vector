/* Aux-owned source, composer pass 8: the transcript row model (assets/session-composer-Dc0LRfZA.js,
 * from the hidden system kinds to the session transcript). Persisted messages become rows (user
 * messages, assistant runs with their content, thinking and tool steps, system, compaction and
 * branch rows), the stream adds the live run and the compaction, retry, reconnect and error rows,
 * steering messages are anchored inside the run they interrupted, bash_interact output joins its
 * bash step, unchanged rows keep their identity between renders, finished runs gain their changed
 * files, memory updates and created routines, and rows are grouped into chat turns for the list.
 * This block starts inside the chunk's `var` list.
 * Names the chunk uses elsewhere keep their chunk names: g0 the hidden system kinds, nn
 * isInterruptAbort, b0 dropTrailingAbort, rn trailingRuns, rp SessionTranscript (Ro).
 * Chunk names used: a JSX runtime, g React, Y cn, me useSession, ge useApp, Ce useTRPC, Fe/Jo
 * queries, Nt/ht the session store, ot the session client, Fs interrupt errors, Ds/dr/ci visible
 * messages and parts, ea tool output text, ur storage errors, $e/pt row and step keys, Jn citation
 * sources, xh handoff runs, hh the run's items, t0/So/h0/mo turn labels and segments, Km/Gm/Om/Um
 * the rows, zh the row frame, Zm live activity, n0/r0 separators and folds, Dr turn pages,
 * AuxAgentEmptyState the empty transcript. */
g0 = new Set([
  'routine_trigger',
  'memory_signal',
  'agent_message',
]); /** System messages other than routine triggers, memory signals and agent messages stay hidden. */
function isShownSystemKind(e) {
  return !g0.has(e.kind ?? '');
} /** An empty assistant message the user interrupted. */
function nn(e) {
  return (
    e.role === 'assistant' &&
    e.stopReason === 'aborted' &&
    Array.isArray(e.content) &&
    e.content.length === 0 &&
    typeof e.errorMessage == 'string' &&
    Fs(e.errorMessage)
  );
}
function isInterruptAborted(e) {
  return (
    e.role === 'assistant' && e.stopReason === 'aborted' && typeof e.errorMessage == 'string' && Fs(e.errorMessage)
  );
}
function isInterruptSteer(e) {
  return e.role === 'user' && e.metadata?.interruptSteer === true;
}
function isQuestionInterrupt({message, previousMessage}) {
  return nn(message) && previousMessage?.role === 'toolResult' && previousMessage.toolName === 'ask_user_question';
}
function pushRunMessages(e, t) {
  const n = e.findLastIndex(({message}) => !nn(message));
  t.push(...e.filter((r, s) => s >= n || !nn(r.message)));
}
function b0(e, t, n) {
  const r = e.at(-1);
  pushRunMessages(
    (isInterruptSteer(n) ? r && isInterruptAborted(r.message) : r && nn(r.message)) ? e.slice(0, -1) : e,
    t,
  );
} /** The messages that become rows, without interrupted empties, replaced steers or hidden system rows. */
function visibleMessages({messageOrder, messageStartTimestamp, snapshot}) {
  const r = [],
    s = new Set(
      messageOrder.flatMap(u => {
        const h = snapshot.messagesByKey[u];
        return h?.role === 'steering' && (!messageStartTimestamp || h.timestamp >= messageStartTimestamp) ? [h.id] : [];
      }),
    );
  let o = [],
    i;
  const c = () => {
      (pushRunMessages(o, r), (o = []));
    },
    l = () => {
      i && (r.push(i), (i = void 0));
    };
  for (const [u, h] of messageOrder.entries()) {
    const d = snapshot.messagesByKey[h];
    if (
      !d ||
      d.role === 'toolResult' ||
      (messageStartTimestamp && d.timestamp < messageStartTimestamp) ||
      d.role === 'steering' ||
      d.role === 'turn-lifecycle'
    )
      continue;
    if (d.role === 'user' && d.metadata?.steer && d.metadata.steeringMessageId && s.has(d.metadata.steeringMessageId)) {
      i = void 0;
      continue;
    }
    const m = messageOrder[u - 1];
    if (!isQuestionInterrupt({message: d, previousMessage: m ? snapshot.messagesByKey[m] : void 0})) {
      if (d.role === 'assistant') {
        o.push({index: u, key: h, message: d});
        continue;
      }
      if (d.role === 'user-message-metadata') {
        i = {index: u, key: h, message: d};
        continue;
      }
      if (!(d.role === 'system-message' && isShownSystemKind(d))) {
        if (d.role === 'system-message' || d.role === 'compaction' || d.role === 'session-branch') {
          (c(), l(), r.push({index: u, key: h, message: d}));
          continue;
        }
        if (d.role === 'user' && Ds(d) && dr(d)) {
          const p = {index: u, key: h, message: d},
            f = i ? [i, p] : [p];
          ((i = void 0), b0(o, r, d), (o = []), r.push(...f));
          continue;
        }
        (l(), r.push({index: u, key: h, message: d}));
      }
    }
  }
  return (c(), l(), r);
}
function anchorSteering(e, t, n, r) {
  return insertAnchors(
    e,
    t.flatMap((s, o) => {
      const i = n.messagesByKey[s];
      if (i?.role !== 'steering' || (r && i.timestamp < r)) return [];
      const c = {type: 'message', role: 'user', key: s, messageKey: s, messageIndex: o, isSteer: true};
      return [{id: i.id, messageIndex: o, after: i.after, value: c}];
    }),
  ).map(s => (s.type === 'activity-anchor' ? s.value : s));
} /** Steering messages anchored where they landed: inside the run they interrupted, split around them. */
function insertAnchors(e, t) {
  const n = [...e];
  for (const {id, messageIndex, after, value} of t.toReversed()) {
    const c = {type: 'activity-anchor', key: id, messageIndex, value},
      l = after
        ? n.findLastIndex(
            d =>
              d.type === 'assistant-activity' &&
              d.items.some(m =>
                (m.type === 'content' ? [m.part.source] : m.type === 'steps' ? m.steps.map(p => p.source) : []).some(
                  p => p?.timestamp === after.timestamp && p.contentIndex <= after.contentIndex,
                ),
              ),
          )
        : -1,
      u = n[l];
    if (u?.type === 'assistant-activity' && after) {
      const d = Math.max(
          ...u.items.flatMap(f =>
            (f.type === 'content' ? [f.part] : f.type === 'steps' ? f.steps : [])
              .filter(x => x.source?.timestamp === after.timestamp && x.source.contentIndex <= after.contentIndex)
              .map(x => x.index),
          ),
        ),
        m = [],
        p = [];
      for (const f of u.items)
        if (f.type === 'steps') {
          const x = f.steps.filter(v => v.index <= d),
            b = f.steps.filter(v => v.index > d);
          (x.length && m.push({...f, steps: x}), b.length && p.push({...f, key: `${f.key}/after:${id}`, steps: b}));
        } else (f.type === 'content' && f.part.index <= d ? m : p).push(f);
      n.splice(
        l,
        1,
        ...(m.length ? [{...u, items: m}] : []),
        c,
        ...(p.length ? [{...u, renderKey: `${$e(u)}/after:${id}`, items: p}] : []),
      );
      continue;
    }
    const h = n.findIndex(
      d =>
        (d.type === 'activity-anchor' && d.messageIndex >= messageIndex) ||
        ('messageIndex' in d && d.messageIndex !== void 0 && d.messageIndex > messageIndex) ||
        (d.type === 'assistant-activity' && d.messageIndex === void 0) ||
        d.type === 'reconnecting' ||
        d.type === 'retrying' ||
        d.type === 'thinking' ||
        d.type === 'error',
    );
    n.splice(h < 0 ? n.length : h, 0, c);
  }
  return n;
}
function isFinishedStop(e) {
  return e.stopReason === 'stop' || e.stopReason === 'length' || e.stopReason === 'toolUse';
}
var cleanText = e =>
  e
    .replace('<has_function_call>', '')
    .replace(/<system-message>[\s\S]*?<\/system-message>/gi, '')
    .trim();
function execSessionId(e) {
  const t = e?.details;
  return typeof t?.execSessionId == 'string' || typeof t?.execSessionId == 'number' ? String(t.execSessionId) : void 0;
}
function mergeResults(e, t) {
  return {
    ...e,
    content: [...e.content, ...t.content],
    details: t.details ?? e.details,
    isError: t.isError,
    timestamp: t.timestamp,
  };
} /** bash_interact output added to the bash step that started the session. */
function joinBashInteract(e) {
  const t = new Map();
  return e.flatMap(n => {
    if (n.type !== 'assistant-activity') return [n];
    const r = n.items.flatMap(s => {
      if (s.type !== 'steps') return [s];
      const o = [];
      for (const i of s.steps) {
        const c = {...i};
        if (c.part.type !== 'toolCall') {
          o.push(c);
          continue;
        }
        if (c.part.name === 'bash_interact') {
          const l = c.part.arguments.exec_session_id,
            u = typeof l == 'string' || typeof l == 'number' ? String(l) : void 0,
            h = u ? t.get(u) : void 0;
          h?.result && c.result && (h.result = mergeResults(h.result, c.result));
          continue;
        }
        if ((o.push(c), c.part.name === 'bash')) {
          const l = execSessionId(c.result);
          l && t.set(l, c);
        }
      }
      return o.length > 0 ? [{...s, steps: o}] : [];
    });
    return r.length > 0 ? [{...n, items: r}] : [];
  });
}
function runIdFor(e, t) {
  return (
    e.find(({message}) => message.responseId)?.message.responseId ?? t?.responseId ?? e[0]?.key ?? 'streaming-assistant'
  );
} /** An assistant run: its text, thinking and tool steps, their status, and its error. */
function assistantRun(e, t, n, r) {
  if (e.length === 0 && !r) return;
  const s = [...e.map(({message}) => message), r].filter(y => !!y),
    o = s.at(-1);
  if (!o) return;
  const i = runIdFor(e, r),
    c = s
      .flatMap(({content}) => content.filter(k => k.type === 'toolCall'))
      .map(y => t.get(y.id))
      .filter(y => !!y),
    l = [];
  let u = [],
    h = 0;
  const d = () => {
      u.length !== 0 && (l.push({type: 'steps', key: '', status: 'stopped', steps: u}), (u = []));
    },
    m = ({content, timestamp}, M, w) =>
      content.forEach((I, R) => {
        if (ci(I)) {
          if (I.type === 'text') {
            const j = cleanText(I.text);
            if (j.length === 0) return;
            (d(),
              l.push({
                type: 'content',
                key: '',
                part: {
                  type: 'text',
                  index: h++,
                  messageIndex: w?.messageIndex,
                  text: j,
                  source: {timestamp, contentIndex: R},
                },
              }));
            return;
          }
          if (I.type === 'thinking') {
            if (I.thinking.trim().length === 0) return;
            u.push({index: h++, isStreaming: M, part: I, source: {timestamp, contentIndex: R}});
            return;
          }
          if (I.type === 'toolCall') {
            u.push({index: h++, isStreaming: M, part: I, result: t.get(I.id), source: {timestamp, contentIndex: R}});
            return;
          }
        }
      });
  for (const {index, message} of e) (m(message, false, {messageIndex: index}), d());
  r && r.content.length > 0 && (m(r, n), d());
  const p = l.findLastIndex(y => y.type === 'steps'),
    f = p >= 0 && l.slice(p + 1).some(y => y.type === 'content'),
    x = l.map((y, k) => {
      if (y.type === 'content') return {...y, key: `agent-run/${i}/content/${y.part.index}`};
      if (y.type === 'error') return y;
      const M = y.steps[0],
        w = `agent-run/${i}/step/${M ? pt(M) : k}`,
        I = n ? 'streaming' : f || k < p || isFinishedStop(o) ? 'done' : 'stopped';
      return {...y, key: w, status: I};
    }),
    b = (o.stopReason === 'error' || o.stopReason === 'aborted') && o.errorMessage?.trim() ? o.errorMessage : void 0,
    v =
      c
        .filter(y => y.isError)
        .map(ea)
        .find(y => y.includes('database or disk is full')) ?? b,
    C = v && !n ? [{type: 'error', key: `agent-run/${i}/error`, errorMessage: v}] : [],
    S = [...x, ...C];
  if (S.length !== 0)
    return {
      type: 'assistant-activity',
      runId: i,
      messageKey: e.at(-1)?.key,
      messageIndex: e.at(-1)?.index,
      assistantMessages: s,
      items: S,
      metadata: {citationSourcesById: Jn(c)},
      isStreaming: n,
    };
}
function pushIf(e, t) {
  t && e.push(t);
} /** Rows for the persisted messages, and the assistant messages still waiting on more. */
function persistedRows({messageOrder, messageStartTimestamp, snapshot}) {
  const r = new Map();
  for (const l of messageOrder) {
    const u = snapshot.messagesByKey[l];
    u?.role === 'toolResult' &&
      (!messageStartTimestamp || u.timestamp >= messageStartTimestamp) &&
      r.set(u.toolCallId, u);
  }
  const s = [];
  let o,
    i = [];
  const c = () => {
    const l = assistantRun(i, r, false);
    (pushIf(s, l), (i = []));
  };
  for (const {index, key, message} of visibleMessages({messageOrder, messageStartTimestamp, snapshot})) {
    if (message.role === 'system-message') {
      (c(),
        s.push({
          type: 'system-message',
          key,
          content: message.content,
          kind: message.kind,
          metadata: message.metadata ?? {},
        }));
      continue;
    }
    if (message.role === 'user-message-metadata') {
      o = key;
      continue;
    }
    if (message.role === 'compaction') {
      (c(), (o = void 0), s.push({type: 'compacting', key, state: 'done', summary: message.summary}));
      continue;
    }
    if (message.role === 'session-branch') {
      (c(), (o = void 0), s.push({type: 'session-branch', key, parentSession: message.parentSession}));
      continue;
    }
    if (!(!Ds(message) || !dr(message))) {
      if (message.role === 'assistant') {
        ((o = void 0), i.push({index, key, message}));
        continue;
      }
      (c(),
        s.push({
          type: 'message',
          key,
          role: message.role,
          timestamp: message.timestamp,
          messageKey: key,
          metadataKey: message.role === 'user' ? o : void 0,
          messageIndex: index,
          isSteer: message.metadata?.steer === true || message.metadata?.interruptSteer === true,
        }),
        (o = void 0));
    }
  }
  return {snapshot, messageOrder, messageStartTimestamp, rows: s, assistantTailMessages: i, toolResultByToolCallId: r};
} /** The rows to draw: the persisted ones, the live run, and compaction, retry, reconnect and error rows. */
function liveRows({autoCompactionStatus, autoRetry, error, streamingMessage, persistedRowsState, reconnect, status}) {
  const c = streamingMessage?.role === 'assistant' && dr(streamingMessage),
    l = [...persistedRowsState.rows];
  pushIf(
    l,
    assistantRun(
      persistedRowsState.assistantTailMessages,
      persistedRowsState.toolResultByToolCallId,
      status === 'streaming' && autoCompactionStatus === 'idle',
      c && streamingMessage?.role === 'assistant' ? streamingMessage : void 0,
    ),
  );
  const u = l.findLastIndex(d => d.type === 'assistant-activity');
  for (let d = 0; d < l.length; d++) {
    const m = l[d];
    m?.type === 'assistant-activity' &&
      (!(d !== u || status === 'streaming') ||
        !m.items.some(p => p.type === 'error') ||
        (l[d] = {...m, items: m.items.filter(p => p.type !== 'error')}));
  }
  const h = l[l.length - 1];
  return (
    autoCompactionStatus !== 'idle' &&
      h?.type !== 'compacting' &&
      l.push({type: 'compacting', key: `compaction-transient-${autoCompactionStatus}`, state: autoCompactionStatus}),
    autoRetry.phase !== 'idle' && l.push({type: 'retrying', key: `retry-${autoRetry.attempt}`, retry: autoRetry}),
    reconnect.phase !== 'idle' &&
      reconnect.noticeDue &&
      l.push({type: 'reconnecting', key: `reconnect-${reconnect.phase}`, reconnect}),
    status === 'error' && error && reconnect.phase === 'idle' && l.push({type: 'error', key: 'error', message: error}),
    joinBashInteract(
      anchorSteering(
        l,
        persistedRowsState.messageOrder,
        persistedRowsState.snapshot,
        persistedRowsState.messageStartTimestamp,
      ),
    )
  );
}
var STABLE_TAIL = 8;
function sameSource(e, t) {
  return (
    e.id === t.id &&
    e.url === t.url &&
    e.title === t.title &&
    e.publishDate === t.publishDate &&
    e.excerpt === t.excerpt
  );
}
function sameSources(e, t) {
  if (e === t) return true;
  if (e.size !== t.size) return false;
  for (const [n, r] of t) {
    const s = e.get(n);
    if (!s || !sameSource(s, r)) return false;
  }
  return true;
}
function keepSources(e, t) {
  if (e.type !== 'assistant-activity' || t.type !== 'assistant-activity') return t;
  const n = e.metadata.citationSourcesById,
    r = t.metadata.citationSourcesById;
  return n === r || !sameSources(n, r) ? t : {...t, metadata: {...t.metadata, citationSourcesById: n}};
}
function stablePrefix(e) {
  return Math.max(0, e.length - STABLE_TAIL);
} /** Whether a row draws the same as before (assistant runs never do). */
function sameRow(e, t) {
  if (e.type !== t.type || $e(e) !== $e(t)) return false;
  switch (t.type) {
    case 'compacting': {
      const n = e;
      return n.state === t.state && n.summary === t.summary;
    }
    case 'reconnecting': {
      const n = e;
      return n.reconnect.phase === t.reconnect.phase && n.reconnect.error === t.reconnect.error;
    }
    case 'retrying': {
      const n = e;
      return n.retry.attempt === t.retry.attempt && n.retry.maxAttempts === t.retry.maxAttempts;
    }
    case 'system-message': {
      const n = e;
      return n.content === t.content && n.kind === t.kind;
    }
    case 'session-branch': {
      const n = e;
      return n.parentSession.id === t.parentSession.id && n.parentSession.title === t.parentSession.title;
    }
    case 'error':
      return e.message === t.message;
    case 'generated-files': {
      const n = e;
      return n.files.length === t.files.length && n.files.every((r, s) => r.path === t.files[s]?.path);
    }
    case 'message': {
      const n = e;
      return (
        n.role === t.role &&
        n.messageIndex === t.messageIndex &&
        n.metadataKey === t.metadataKey &&
        n.messageKey === t.messageKey
      );
    }
    case 'thinking':
      return true;
    case 'assistant-activity':
      return false;
  }
} /** Rows that did not change keep their identity, so the list does not redraw them. */
function keepRows(e, t) {
  const n = stablePrefix(t),
    r = [...t],
    s = e.slice(n),
    o = new Map(s.map(i => [$e(i), i]));
  for (let i = 0; i < t.length; i += 1) {
    const c = t[i],
      l = e[i],
      u = $e(c),
      h = l ? $e(l) : void 0;
    if (l && i < n && h === u) {
      r[i] = l;
      continue;
    }
    const d = o.get(u);
    if (d && sameRow(d, c)) {
      r[i] = d;
      continue;
    }
    d && (r[i] = keepSources(d, c));
  }
  return r;
}
function rn(e) {
  let t = e.length;
  for (; t > 0 && e[t - 1]?.type === 'assistant-activity';) t -= 1;
  return {rows: e.slice(t).filter(n => n.type === 'assistant-activity'), startIndex: t};
}
function isToolCallStep(e) {
  return e.part.type === 'toolCall';
}
function firstToolName(e) {
  for (const t of e)
    for (const n of t.items) {
      if (n.type !== 'steps') continue;
      const r = n.steps.find(isToolCallStep);
      if (r) return r.part.name;
    }
}
function lastToolName(e) {
  for (let t = e.length - 1; t >= 0; t -= 1) {
    const n = e[t];
    if (n)
      for (let r = n.items.length - 1; r >= 0; r -= 1) {
        const s = n.items[r];
        if (s?.type !== 'steps') continue;
        const o = s.steps.findLast(isToolCallStep);
        if (o) return o.part.name;
      }
  }
}
function uniqueSteps(e) {
  const t = new Set();
  return e.filter(n => {
    const r = pt(n);
    return t.has(r) ? false : (t.add(r), true);
  });
}
function stepGroups(e) {
  return e.flatMap(t => t.items.filter(n => n.type === 'steps'));
}
function isVisibleQuestion(e, t) {
  return e.part.name !== 'ask_user_question' || e.part.id === t;
}
function waitsOnTools(e, t) {
  return e.type === 'thinking'
    ? true
    : e.type !== 'assistant-activity' || !e.isStreaming
      ? false
      : e.items
          .filter(n => n.type === 'steps')
          .flatMap(n => n.steps.filter(isToolCallStep))
          .every(n => isVisibleQuestion(n, t));
}
function isLive(e) {
  return e.type === 'thinking' || (e.type === 'assistant-activity' && e.isStreaming);
}
function keepRenderKeys(e, t) {
  const n = rn(e),
    r = rn(t);
  if (n.rows.length === 0 || r.rows.length === 0) return t;
  const s = e[n.startIndex - 1],
    o = t[r.startIndex - 1];
  if ((s?.type === 'assistant-activity' ? s.runId : s?.key) !== (o?.type === 'assistant-activity' ? o.runId : o?.key))
    return t;
  let i = false;
  return t.map((c, l) => {
    if (l < r.startIndex || c.type !== 'assistant-activity') return c;
    const u = n.rows.find(d => d.runId === c.runId);
    if (u) return u.renderKey === c.renderKey ? c : {...c, renderKey: u.renderKey};
    const h = n.rows.find(d => d.isStreaming);
    return !h || i ? c : ((i = true), {...c, renderKey: $e(h)});
  });
} /** A run handed off mid-stream keeps the tool steps already shown. */
function keepHandoffSteps(e, t, n) {
  const r = rn(e),
    s = rn(t),
    o = r.rows.filter(b => xh(b) || b.isStreaming);
  if (o.length === 0 || s.rows.length === 0) return t;
  const i = e[r.startIndex - 1],
    c = t[s.startIndex - 1];
  if ((i?.type === 'assistant-activity' ? i.runId : i?.key) !== (c?.type === 'assistant-activity' ? c.runId : c?.key))
    return t;
  const l = firstToolName(s.rows) ?? lastToolName(o),
    u = stepGroups(o)
      .flatMap(b => b.steps.filter(isToolCallStep))
      .filter(b => (!l || b.part.name === l) && isVisibleQuestion(b, n));
  if (u.length === 0) return t;
  const h = new Set(stepGroups(s.rows).flatMap(b => b.steps.map(pt))),
    d = u.filter(b => !h.has(pt(b)));
  if (d.length === 0) return t;
  const m = s.rows.find(b => b.items.some(v => v.type === 'steps'));
  if (m)
    return t.map(b => {
      if (b.type !== 'assistant-activity' || b.runId !== m.runId) return b;
      let v = false;
      return {
        ...b,
        items: b.items.map(C =>
          v || C.type !== 'steps' ? C : ((v = true), {...C, steps: uniqueSteps([...d, ...C.steps])}),
        ),
      };
    });
  const p = o[0],
    f = p?.items.find(b => b.type === 'steps');
  if (!p || !f) return t;
  const x = {
    ...p,
    items: [{...f, status: 'done', steps: uniqueSteps(u)}],
    isHandoff: true,
    isStreaming: false,
    metadata: {...p.metadata},
  };
  return [...t.slice(0, s.startIndex), x, ...t.slice(s.startIndex)];
} /** The next rows, kept as they were while the agent only waits on tools. */
function nextRows({
  activeSuspensionToolCallId,
  previousRows,
  nextRows,
  lastVisibleConversationMessageKey,
  reconnect,
  status,
}) {
  const i = keepRenderKeys(previousRows, keepHandoffSteps(previousRows, nextRows, activeSuspensionToolCallId)),
    c = new Set(previousRows.map($e)),
    l = i.some(h => !c.has($e(h))),
    u = previousRows.filter(isLive);
  return previousRows.length > 0 &&
    lastVisibleConversationMessageKey &&
    reconnect.phase === 'idle' &&
    status !== 'error' &&
    !l &&
    u.length > 0 &&
    u.every(h => waitsOnTools(h, activeSuspensionToolCallId)) &&
    !i.some(h => h.type === 'thinking' || h.type === 'assistant-activity')
    ? previousRows
    : keepRows(previousRows, i);
} /** Finished runs gain the files they changed and their memory updates. */
function withRunFiles(e, t, n) {
  if (t.length === 0 || n.length === 0) return e;
  const r = new Map();
  for (const o of t) {
    if (!o.finishedAt || (o.filesChanged.length === 0 && !o.memoryExtraction)) continue;
    const i = o.jsonlReadOffset,
      c = o.jsonlReadOffset + o.jsonlReadSize;
    let l;
    for (const u of e) {
      if (u.type !== 'assistant-activity' || u.isStreaming || u.messageIndex === void 0) continue;
      const h = Number(n[u.messageIndex]?.id);
      !Number.isFinite(h) || h < i || h >= c || (l = u.renderKey ?? u.runId);
    }
    l && r.set(l, o);
  }
  if (r.size === 0) return e;
  const s = [];
  for (const o of e) {
    if (o.type === 'generated-files') continue;
    if (o.type !== 'assistant-activity') {
      s.push(o);
      continue;
    }
    const i = r.get(o.renderKey ?? o.runId);
    (s.push(i?.memoryExtraction ? {...o, memoryExtraction: i.memoryExtraction} : o),
      !(!i || i.filesChanged.length === 0) &&
        s.push({type: 'generated-files', key: `generated-files/${o.runId}`, files: i.filesChanged}));
  }
  return s;
} /** A turn’s final run gains the routines it created and the files its turn changed. */
function withTurnResults(e, t, n) {
  const r = new Map();
  for (const {createdRoutine} of t) {
    if (!createdRoutine?.turnId) continue;
    const c = r.get(createdRoutine.turnId) ?? new Map();
    (c.set(createdRoutine.id, createdRoutine), r.set(createdRoutine.turnId, c));
  }
  const s = new Map(n.map(i => [i.id, i])),
    o = new Map();
  for (const i of e) {
    if (i.type !== 'assistant-activity' || !i.turn?.finishedAt || i.isStreaming) continue;
    const c = i.turn.finalMessage?.at(-1);
    c?.stopReason === 'stop' &&
      c.content.some(l => l.type === 'text' && l.text.trim()) &&
      i.assistantMessages.some(l => l.timestamp === c.timestamp) &&
      o.set(i.turn.id, i);
  }
  return e
    .filter(i => i.type !== 'generated-files')
    .map(i => {
      const c = i.turn,
        l = c && r.get(c.id);
      if (i.type !== 'assistant-activity' || !c || o.get(c.id) !== i) return i;
      const u = s.get(c.ordinal);
      return {...i, createdRoutines: l ? [...l.values()] : void 0, generatedFiles: u?.filesChanged};
    });
} /** useTranscriptRows: the session’s rows from its turns, bodies, stream and runs. */
function useTranscriptRows({isReadonly = false, messageStartTimestamp} = {}) {
  const n = Nt(),
    {client} = ot(),
    s = _e(),
    o = ht(n, V => V.turns),
    i = ht(n, V => V.bodiesByTurnId),
    c = ht(n, V => V.turnBodyPreviews),
    l = ht(n, V => V.transcriptRevision),
    {currentSession} = me(),
    {accountId} = ge(),
    d = Ce(),
    m = pa(),
    p = un(),
    f = dc(),
    x = fc(),
    b = mc(),
    v = Cc(),
    C = xa(),
    S = xc(),
    y = (0, g.useRef)({rows: []}),
    k = (0, g.useRef)(new Map()),
    M = (0, g.useRef)(new Map()),
    w = (0, g.useRef)(null),
    I = kr(currentSession.suspension) ? currentSession.suspension.toolCallId : void 0,
    {data: R = []} = Fe(
      d.sessions.listRuns.queryOptions(
        {sessionId: currentSession.id, accountId},
        {enabled: !!currentSession.id && !isReadonly, staleTime: Number.POSITIVE_INFINITY},
      ),
    ),
    {data} = Fe(
      d.sessions.messageRows.queryOptions(
        {sessionId: currentSession.id, accountId},
        {enabled: !!currentSession.id && !isReadonly, staleTime: Number.POSITIVE_INFINITY},
      ),
    ),
    N = (0, g.useMemo)(() => new Map(o.map(V => [V.id, V])), [o]),
    O = (0, g.useMemo)(() => {
      const {messagesByKey} = n.getState(),
        K = re => re.map((ue, E) => st(ue, E)),
        ne = new Map(
          o.flatMap(re =>
            [
              ...K(re.input),
              ...K(re.steeringMessages),
              ...K(
                re.steeringMessages.map(ue => ({
                  role: 'user',
                  content: ue.content,
                  timestamp: ue.timestamp,
                  metadata: {steeringMessageId: ue.id},
                })),
              ),
            ].map(ue => [ue, re.id]),
          ),
        ),
        he = new Map(o.flatMap(re => K(re.trailingMessages ?? []).map(ue => [ue, re.id])));
      let X;
      return new Map(
        m.map(re => {
          const ue = he.get(re);
          if (ue) return [re, ue];
          const E = messagesByKey[re];
          (E?.role === 'turn-lifecycle' && E.event === 'started'
            ? (X = E.turnId)
            : (E?.role === 'user' || E?.role === 'user-message-metadata') && N.get(X ?? '')?.finishedAt && (X = void 0),
            (X = ne.get(re) ?? X));
          const ee = N.get(X ?? '')?.finishedAt;
          return (ee && E && E.timestamp >= ee + 1e3 && (X = void 0), [re, X]);
        }),
      );
    }, [m, n, o, N]),
    W = (0, g.useMemo)(
      () =>
        persistedRows({
          messageOrder: m.filter(V => !N.get(O.get(V) ?? '')?.finishedAt),
          messageStartTimestamp,
          snapshot: n.getState(),
        }),
      [m, messageStartTimestamp, n, N, O],
    ),
    se = m.at(-1),
    U = O.get(se ?? ''),
    ae = (0, g.useMemo)(() => {
      const V = withRunFiles(
          liveRows({
            autoCompactionStatus: f,
            autoRetry: x,
            error: v,
            streamingMessage: C ?? void 0,
            persistedRowsState: W,
            reconnect: b,
            status: p,
          }),
          R,
          data ?? [],
        ),
        K = O.get(y.current.messageKey ?? ''),
        ne = nextRows({
          activeSuspensionToolCallId: I,
          previousRows: K && U && K !== U ? [] : y.current.rows,
          nextRows: V,
          lastVisibleConversationMessageKey: S,
          reconnect: b,
          status: p,
        });
      return ((y.current = {rows: ne, messageKey: se}), ne);
    }, [f, x, I, v, S, U, se, O, data, C, W, b, R, p]),
    _ = (0, g.useMemo)(() => {
      const V = n.getState();
      return new Map(
        o.map(K => {
          const ne = vc(K, i[K.id]?.messages ?? c[K.id]?.messages).map((F, fe) => st(F, fe)),
            he = {messagesByKey: V.turnMessagesByKey},
            X = persistedRows({messageOrder: ne, snapshot: he}),
            re = liveRows({
              persistedRowsState: X,
              autoCompactionStatus: 'idle',
              autoRetry: {phase: 'idle'},
              reconnect: b,
              status: 'ready',
            }),
            ue = () => {
              if (n.getState().bodiesByTurnId[K.id]) return;
              const F = `${currentSession.id}:${l}:${K.id}:${K.bodyVersion}`,
                fe = k.current.get(F);
              if (fe) return fe;
              const ye = (async () => {
                try {
                  const Te = [];
                  let Le = 0,
                    De = K.bodyVersion;
                  for (; Le !== void 0;) {
                    const Ne = {
                        sessionId: currentSession.id,
                        accountId,
                        turnId: K.id,
                        revision: l,
                        cursor: Le,
                        limit: 500,
                      },
                      H = d.sessions.turns.messages.queryOptions(Ne),
                      L = await s.fetchQuery({
                        ...H,
                        queryKey: [H.queryKey[0], {...H.queryKey[1], input: {...Ne, bodyVersion: K.bodyVersion}}],
                        staleTime: 1 / 0,
                        gcTime: 0,
                      });
                    (Te.push(...L.messages), (Le = L.nextCursor), (De = L.bodyVersion));
                  }
                  (n.getState().turns.some(Ne => Ne.id === K.id && Ne.bodyVersion === De) &&
                    M.current.set(K.id, {bodyVersion: De, sources: Jn(Te.filter(Ne => Ne.role === 'toolResult'))}),
                    client.setTurnBody(K.id, l, De, Te));
                } catch (Te) {
                  throw (
                    s.invalidateQueries(
                      d.sessions.turns.list.infiniteQueryFilter({sessionId: currentSession.id, accountId}),
                    ),
                    Te
                  );
                } finally {
                  k.current.delete(F);
                }
              })();
              return (k.current.set(F, ye), ye);
            },
            E = re.some(
              F => F.type === 'error' || (F.type === 'assistant-activity' && F.items.some(fe => fe.type === 'error')),
            );
          K.error && !E && re.push({type: 'error', key: 'error', message: K.error});
          const ee = new Set((K.trailingMessages ?? []).map((F, fe) => st(F, fe)));
          return [
            K.id,
            re.map(F =>
              F.type === 'system-message' && ee.has(F.key)
                ? F
                : {...F, turn: K, bodyLoaded: !!i[K.id], bodyPreviewLoaded: !!c[K.id], onLoadBody: ue},
            ),
          ];
        }),
      );
    }, [o, i, c, l, b, n, client, s, d, currentSession.id, accountId]),
    ce = (0, g.useMemo)(() => {
      const V = Jn(W.toolResultByToolCallId.values(), data?.flatMap(ne => ne.citationSources ?? []) ?? []);
      for (const [ne, he] of M.current) {
        if (N.get(ne)?.bodyVersion !== he.bodyVersion) {
          M.current.delete(ne);
          continue;
        }
        for (const [X, re] of he.sources) V.set(X, re);
      }
      for (const ne of _.values())
        for (const he of ne)
          if (he.type === 'assistant-activity') for (const [X, re] of he.metadata.citationSourcesById) V.set(X, re);
      const K = w.current;
      return K?.accountId === accountId && K.sessionId === currentSession.id && sameSources(K.sources, V)
        ? K.sources
        : ((w.current = {accountId, sessionId: currentSession.id, sources: V}), V);
    }, [accountId, currentSession.id, data, W, _, N]),
    le = (0, g.useMemo)(
      () =>
        new Map(
          [..._].map(([V, K]) => [
            V,
            K.map(ne =>
              ne.type === 'assistant-activity' ? {...ne, metadata: {...ne.metadata, citationSourcesById: ce}} : ne,
            ),
          ]),
        ),
      [_, ce],
    );
  return {
    rows: (0, g.useMemo)(() => {
      let V = U;
      const K = ae
          .map(X => {
            const re = X.type === 'assistant-activity' ? X.messageKey : X.key;
            return (
              re && O.has(re) && (V = O.get(re)),
              {
                ...X,
                ...(X.type === 'assistant-activity' ? {metadata: {...X.metadata, citationSourcesById: ce}} : {}),
                turn: N.get(V ?? ''),
                bodyLoaded: true,
              }
            );
          })
          .filter(X => !X.turn?.finishedAt),
        ne = new Set(O.values()),
        he = o.filter(X => X.finishedAt || !ne.has(X.id)).flatMap(X => le.get(X.id) ?? []);
      return withTurnResults([...he, ...K], data ?? [], R);
    }, [ae, o, N, O, U, le, ce, data, R]),
  };
}
var LIST_SIZES = {defaultItemHeight: 88, footerHeight: 24},
  itemHeight = () => LIST_SIZES.defaultItemHeight,
  itemKey = e => e.key /** The transcript: a virtual list of chat turns, with earlier turns loaded on scroll. */,
  TranscriptList = ({
    onLoadEarlierTurns,
    isReadonly,
    isSidepanel,
    endRef,
    messageStartTimestamp,
    streamingStartedAt,
  }) => {
    const i = Nt(),
      c = ht(i, L => L.turns),
      {rows} = useTranscriptRows({isReadonly, messageStartTimestamp}),
      {continueConversation, status} = ot(),
      {currentSession} = me(),
      {accountId} = ge(),
      p = _e(),
      {capture} = ir(),
      x = Ce(),
      [b, v] = (0, g.useState)(false),
      [C, S] = (0, g.useState)(false),
      y = (0, g.useRef)(null),
      k = (0, g.useRef)(null),
      [M, w] = (0, g.useState)(false),
      I = currentSession.id,
      {data: R = []} = Fe(
        x.sessions.messageRows.queryOptions(
          {sessionId: I, accountId, turnIds: c.map(L => L.id)},
          {enabled: !!I && !isReadonly},
        ),
      ),
      j = (0, g.useMemo)(() => {
        for (let L = rows.length - 1; L >= 0; L -= 1) {
          const D = rows[L];
          if (D.type === 'message') return;
          if (D.type === 'assistant-activity')
            return D.items.some($ => $.type === 'error' && ur($.errorMessage)) ? D.runId : void 0;
        }
      }, [rows]),
      {data} = Fe(x.billing.getSubscription.queryOptions({accountId, fresh: true}, {enabled: !!j || b || C})),
      {currentPeriod, currentPlan, handleSelectPlan, isPending} = ql({
        subscription: data?.subscription ?? null,
        onOpenChange: v,
      }),
      ae = ve(x.billing.createAddOnCheckout.mutationOptions()),
      _ = currentSession.status === 'aborted',
      ce = currentSession.status === 'interrupted',
      le = _,
      V = kr(currentSession.suspension) ? currentSession.suspension.toolCallId : void 0,
      K = !V && (streamingStartedAt !== void 0 || (!isReadonly && status === 'streaming')),
      ne = !isReadonly && ce && status !== 'streaming',
      he = (0, g.useMemo)(() => rows.filter(L => !isStorageErrorRun(L, j)), [j, rows]),
      X = (0, g.useMemo)(() => {
        const L = chatTurns(he, {
          getMessage: D => {
            const $ = i.getState();
            return $.messagesByKey[D] ?? $.turnMessagesByKey[D];
          },
          hideUserInterruptedAbortMessage: ce,
          isStreaming: status === 'streaming',
          pendingToolCallId: V,
          paymentRequiredRunId: j,
        });
        return (
          K && L.push({key: 'streaming-indicator', type: 'streaming-indicator'}),
          ne && L.push({key: 'interrupted-banner', type: 'interrupted-banner'}),
          L
        );
      }, [i, ce, j, V, ne, K, status, he]),
      re = (0, g.useMemo)(() => {
        for (let L = he.length - 1; L >= 0; L -= 1) {
          const D = he[L];
          if (D.type === 'assistant-activity' && !D.isHandoff) return D.runId;
          if (D.type === 'message' || D.type === 'system-message' || D.type === 'session-branch') return;
        }
      }, [he]),
      ue = (0, g.useCallback)(L => ({messageId: turnIdFor(L, R)}), [R]),
      E = (0, g.useCallback)(
        (L, D) => ({
          messageId: turnIdFor(L, R),
          messageIdByIndex: Object.fromEntries(
            D.items.flatMap($ =>
              $.type === 'content' && $.part.messageIndex !== void 0
                ? [
                    [
                      $.part.messageIndex,
                      R.find(oe => oe.role === 'assistant' && oe.timestamp === $.part.source?.timestamp)?.id,
                    ],
                  ]
                : [],
            ),
          ),
        }),
        [R],
      ),
      ee = (0, g.useCallback)(L => {
        w(L.renderedRange.startIndex === 0 && L.renderedRange.endIndex > 0);
      }, []),
      F = L => y.current?.scrollToKey(L),
      fe = (0, g.useCallback)(() => {
        (currentSession.id &&
          currentSession.status !== 'running' &&
          currentSession.status !== 'suspended' &&
          lo({accountId, currentSessionId: currentSession.id, nextStatus: 'running', queryClient: p, trpc: x}),
          continueConversation().catch(() => {
            co({accountId, currentSessionId: currentSession.id, queryClient: p, trpc: x});
          }));
      }, [accountId, continueConversation, currentSession.id, currentSession.status, p, x]),
      ye = (0, g.useCallback)(
        L => {
          br(`/u/${accountId}/settings/billing${L}`);
        },
        [accountId],
      ),
      Te = (0, g.useCallback)(() => {
        if ((capture('settings.billing.upgrade', {place: 'chat'}), !isSidepanel)) {
          v(true);
          return;
        }
        ye('?change_plan=1');
      }, [capture, isSidepanel, ye]),
      Le = (0, g.useCallback)(() => {
        if ((capture('settings.billing.add-credits', {place: 'chat'}), !isSidepanel)) {
          S(true);
          return;
        }
        ye('?add_credits=1');
      }, [capture, isSidepanel, ye]),
      De = (0, g.useCallback)(
        async L => {
          try {
            const D = await Ql(accountId),
              {url} = await ae.mutateAsync({accountId, cancelUrl: D, creditCents: L, successUrl: D});
            window.location.assign(url);
          } catch (D) {
            (console.error(D), de.error('Could not open add-on credit checkout.'));
          }
        },
        [accountId, ae],
      ),
      Ne = (0, g.useMemo)(
        () => ({
          alwaysVisibleAssistantRunId: re,
          canChangePlan: currentPlan !== 'max',
          hideAssistantActions: le,
          isReadonly,
          onAddCreditsClick: Le,
          onPaymentRequiredClick: Te,
          onRetryAssistant: fe,
          paymentRequiredCreditRefreshAt: data?.credit.refresh_at,
          paymentRequiredPlan: data ? currentPlan : void 0,
          pendingToolCallId: V,
          sessionId: I,
        }),
        [re, data, currentPlan, Le, Te, fe, le, isReadonly, V, I],
      ),
      H = (0, g.useMemo)(() => ({endRef, getAssistantRowState: E, getUserRowState: ue}), [endRef, E, ue]);
    return (
      (0, g.useEffect)(() => {
        (M || X.length === 0) && onLoadEarlierTurns?.();
      }, [M, onLoadEarlierTurns, X.length]),
      (0, a.jsxs)(wh, {
        rows,
        isRunning: K,
        startedAt: streamingStartedAt,
        value: Ne,
        children: [
          (0, a.jsx)(Wl, {
            currentPeriod,
            currentPlan,
            isPending: !data || isPending,
            open: b,
            onOpenChange: v,
            onPlanSelect: handleSelectPlan,
          }),
          data &&
            (0, a.jsx)(Gl, {addOn: data.addOn, isPending: ae.isPending, open: C, onCheckout: De, onOpenChange: S}),
          (0, a.jsxs)('div', {
            className: 'relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col',
            'data-component': 'message-list',
            ref: k,
            children: [
              !isSidepanel &&
                (0, a.jsx)(f0, {items: X.filter(L => L.type === 'chat-turn'), transcriptRef: k, onNavigate: F}),
              (0, a.jsx)(lh, {
                className: 'relative min-h-0 w-full min-w-0 flex-1',
                scrollerClassName: 'scroll-fade-effect-sm-y mr-1 [&::-webkit-scrollbar]:w-1.5',
                contentClassName: isSidepanel
                  ? 'mx-auto w-full min-w-0 px-4 py-4'
                  : 'mx-auto w-full max-w-4xl min-w-0 px-5 py-4 lg:px-8',
                contentProps: {'data-agent-session-ui': 'chat'},
                context: H,
                entries: X,
                estimateHeight: itemHeight,
                Footer: ListFooter,
                getKey: itemKey,
                isStreaming: status === 'streaming',
                ItemContent: TranscriptItem,
                onLocationChange: ee,
                ref: y,
                StickyFooter: Nh,
              }),
            ],
          }),
        ],
      })
    );
  },
  InterruptedBanner = () =>
    (0, a.jsx)('p', {
      className: 'text-muted-foreground pb-4 text-sm',
      children: 'Interrupted - What should Aux do instead?',
    }),
  ListFooter = ({context}) =>
    (0, a.jsx)('div', {ref: context.endRef, className: 'scroll-mb-4', style: {height: LIST_SIZES.footerHeight}}),
  TranscriptItem = (0, g.memo)(({data, context}) => {
    if (data.type === 'streaming-indicator') return (0, a.jsx)(Zm, {});
    if (data.type === 'interrupted-banner') return (0, a.jsx)(InterruptedBanner, {});
    const n = r =>
      r.map(({agentRunItemWindow, key, row}) =>
        (0, a.jsx)(
          TranscriptRow,
          {
            agentRunItemWindow,
            getAssistantRowState: context.getAssistantRowState,
            getUserRowState: context.getUserRowState,
            row,
          },
          key,
        ),
      );
    return (0, a.jsxs)('div', {
      'data-chat-turn-key': data.key,
      children: [
        data.timestamp !== void 0 && (0, a.jsx)(n0, {timestamp: data.timestamp}),
        data.segments.map(r =>
          r.type === 'run-fold'
            ? (0, a.jsx)(r0, {segment: r, renderRows: n}, r.key)
            : (0, a.jsx)(g.Fragment, {children: n(r.rows)}, r.key),
        ),
      ],
    });
  }); /** chatTurns: rows grouped into turns, each with its label, response, day and segments. */
function chatTurns(e, t) {
  const n = [];
  let r = [],
    s;
  const o = () => {
    !s || r.length === 0 || (n.push({key: s, turnRows: r}), (r = []));
  };
  for (const c of e) {
    const l = $e(c);
    if (
      (((c.turn ? c.turn.id !== r[0]?.row.turn?.id : c.type === 'message' && !c.isSteer) || !s) &&
        (o(), (s = c.turn ? `turn:${c.turn.id}` : c.type === 'message' ? `turn:${l}` : `turnless:${l}`)),
      c.type === 'assistant-activity')
    ) {
      const u = hh({
          hideUserInterruptedAbortMessage: t.hideUserInterruptedAbortMessage,
          paymentRequiredRunId: t.paymentRequiredRunId,
          row: c,
        }),
        h = u.length === 0 ? emptyWindow() : {hasNextStepsRow: false, items: u, showActions: true, start: 0};
      r.push({agentRunItemWindow: h, key: `${l}/items:${h.start}`, row: c});
      continue;
    }
    r.push({key: l, row: c});
  }
  o();
  const i = t0(n.map(c => c.turnRows));
  return n.map(({key, turnRows}, u) => {
    const h = turnRows.flatMap(({row}) => {
        if (row.type !== 'message') return [];
        const S = t.getMessage(row.messageKey);
        return S?.role === 'user' ? [S] : [];
      }),
      d = turnRows.flatMap(({row}) => row.turn?.input ?? []),
      m = [...h, ...d]
        .filter(C => C.role === 'user')
        .flatMap(C => mo(C).textBlocks)
        .find(C => C.trim()),
      p = turnRows.find(({row}) => row.turn)?.row.turn,
      f = turnRows.findLast(({row}) => row.type === 'assistant-activity')?.row,
      x =
        p?.finalMessage?.flatMap(C => C.content.flatMap(S => (S.type === 'text' ? [S.text] : []))).join(`
`) ||
        (f?.type === 'assistant-activity'
          ? f.items.flatMap(C => (C.type === 'content' ? [C.part.text] : [])).join(`
`)
          : ''),
      b =
        p?.startedAt ??
        h[0]?.timestamp ??
        (f?.type === 'assistant-activity' ? f.assistantMessages[0]?.timestamp : void 0),
      v = b === void 0 ? void 0 : So(b);
    return {
      key,
      label: m?.trim() || (v ? `${v.day}${v.separator}${v.time}` : 'Unknown time'),
      response: hr(x).trim(),
      timestamp: i[u],
      segments: h0(turnRows, {
        isTrailingTurnStreaming: t.isStreaming && u === n.length - 1,
        pendingToolCallId: t.pendingToolCallId,
      }),
      type: 'chat-turn',
    };
  });
}
function emptyWindow() {
  return {hasNextStepsRow: false, items: [], showActions: true, start: 0};
}
function turnIdFor(e, t) {
  const n = e.messageKey ? t.find(r => r.messageKey === e.messageKey) : void 0;
  if (n) return n.id;
}
function isStorageErrorRun(e, t) {
  return (
    e.type === 'assistant-activity' &&
    e.runId !== t &&
    e.items.length > 0 &&
    e.items.every(n => n.type === 'error' && ur(n.errorMessage))
  );
}
var TranscriptRow = (0, g.memo)(({agentRunItemWindow, getAssistantRowState, getUserRowState, row}) => {
  let s;
  if (row.type === 'system-message') s = (0, a.jsx)(Km, {row});
  else if (row.type === 'message') {
    const o = getUserRowState(row);
    s = (0, a.jsx)(Gm, {row, state: o});
  } else if (row.type === 'assistant-activity') {
    if (!agentRunItemWindow) return null;
    const o = getAssistantRowState(row, agentRunItemWindow);
    s = (0, a.jsx)(Om, {itemWindow: agentRunItemWindow, row, state: o});
  } else s = (0, a.jsx)(Um, {row});
  return (0, a.jsx)(zh, {row, children: s});
}); /** SessionTranscript: the transcript, or the empty state before the first message. */
function rp({isReadonly = false, isSidepanel = false, className, messageStartTimestamp, streamingStartedAt}) {
  const {currentSession} = me(),
    i = un(),
    {accountId} = ge(),
    l = Ce(),
    {client} = ot(),
    {data, fetchNextPage, hasNextPage, isFetching, isFetchNextPageError} = Jo(
      l.sessions.turns.list.infiniteQueryOptions(
        {sessionId: currentSession.id, accountId},
        {
          enabled: !!currentSession.id,
          getNextPageParam: k => k.nextCursor,
          refetchInterval: i === 'streaming' ? 1500 : false,
        },
      ),
    ),
    x = (0, g.useCallback)(() => {
      hasNextPage && !isFetching && !isFetchNextPageError && fetchNextPage({cancelRefetch: false});
    }, [fetchNextPage, hasNextPage, isFetching, isFetchNextPageError]),
    b = (0, g.useMemo)(() => (data ? {...data.pages[0], turns: Dr(data.pages)} : void 0), [data]);
  (0, g.useEffect)(() => {
    b && client.setTurns(b.turns, b.transcriptRevision);
  }, [client, b]);
  const {reconnect, lastConversationMessageKey} = ht(
      Nt(),
      hc(k => ({reconnect: k.reconnect, lastConversationMessageKey: k.lastVisibleConversationMessageKey})),
    ),
    S = (0, g.useRef)(null),
    y = (0, g.useMemo)(
      () =>
        !!b?.turns.length ||
        streamingStartedAt !== void 0 ||
        i === 'streaming' ||
        i === 'error' ||
        reconnect.phase !== 'idle' ||
        !!lastConversationMessageKey,
      [b, lastConversationMessageKey, reconnect.phase, i, streamingStartedAt],
    );
  return (0, a.jsxs)('div', {
    className: Y('relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden', className),
    'data-chat-transcript': currentSession.id,
    children: [
      (0, a.jsx)(
        TranscriptList,
        {
          endRef: S,
          onLoadEarlierTurns: hasNextPage ? x : void 0,
          isReadonly,
          isSidepanel,
          messageStartTimestamp,
          streamingStartedAt,
        },
        currentSession.id,
      ),
      !y &&
        (0, a.jsx)('div', {
          className:
            'pointer-events-none absolute inset-0 mx-auto flex min-w-0 items-center justify-center px-4 py-4 md:px-4 lg:px-8',
          'data-agent-session-ui': 'chat',
          children: (0, a.jsx)('div', {
            className: 'flex w-full justify-center',
            children: (0, a.jsx)(AuxAgentEmptyState, {}),
          }),
        }),
    ],
  });
}
