/* Aux-owned source, composer pass 11: pasted files in a message and the queued items
 * (assets/session-composer-Dc0LRfZA.js, from the inline-file test to the queue list). A message's
 * pasted files carry their bytes until they are uploaded; the queue lists queued and steering user
 * messages, each with the metadata row before it.
 * Names the chunk uses elsewhere keep their chunk names: Oh hasInlineFiles, Hh withoutInlineData,
 * oo uploadInlineFiles, io queuedItems. Chunk names used: Er isFileAttachment. */
/** hasInlineFiles: whether a message carries pasted files that still hold their bytes. */
function Oh(e) {
  return (Array.isArray(e) ? e : [e]).some(
    t => t.role === 'user-message-metadata' && t.attachments.some(n => Er(n) && !!n.data),
  );
} /** withoutInlineData: the message without pasted files’ bytes (files with a path keep their path). */
function Hh(e) {
  const t = Array.isArray(e) ? e : [e],
    n = [];
  let r = false;
  for (const s of t) {
    if (s.role !== 'user-message-metadata') {
      n.push(s);
      continue;
    }
    let o = false;
    const i = [];
    for (const c of s.attachments) {
      if (!Er(c) || !c.data) {
        i.push(c);
        continue;
      }
      ((o = true), c.path && i.push({...c, data: void 0}));
    }
    if (!o) {
      n.push(s);
      continue;
    }
    ((r = true), i.length > 0 && n.push({...s, attachments: i}));
  }
  return r ? (Array.isArray(e) ? n : (n[0] ?? n)) : e;
} /** uploadInlineFiles: the message with each pasted file uploaded through `upload`. */
async function oo(e, t) {
  const n = Array.isArray(e) ? e : [e];
  let r = false;
  const s = await Promise.all(
    n.map(async o => {
      if (o.role !== 'user-message-metadata') return o;
      let i = false;
      const c = await Promise.all(
        o.attachments.map(async l =>
          !Er(l) || !l.data ? l : ((i = true), {...(await t(l)), pastedText: l.pastedText}),
        ),
      );
      return i ? ((r = true), {...o, attachments: c}) : o;
    }),
  );
  return r ? (Array.isArray(e) ? s : s[0]) : e;
}
function metadataBefore(e, t) {
  const n = e[t - 1];
  return n?.role === 'user-message-metadata' ? n : void 0;
} /** The user messages in a list, each with the metadata row just before it. */
function userMessagesOf(e) {
  const t = [],
    n = e ?? [];
  for (const [r, s] of n.entries())
    s.role === 'user' && t.push({message: s, metadata: metadataBefore(n, r), messageIndex: r});
  return t;
} /** queuedItems: a session’s queued messages, then its steering messages. */
function io(e) {
  return [
    ...userMessagesOf(e.queuedMessages ?? []).map(t => ({...t, deliveryMode: 'queued'})),
    ...userMessagesOf(e.steeringMessages ?? []).map(t => ({...t, deliveryMode: 'steering'})),
  ];
}
