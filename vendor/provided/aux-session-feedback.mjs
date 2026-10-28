import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export async function auxSubmitSessionFeedback(accountId, session, comment) {
  const identity = auxCloudTransferIdentity(accountId);
  if (!identity) throw Error('Feedback needs an Aux cloud account. You can email hello@getaux.co instead.');
  if (session.incognito || session.ephemeral) throw Error('Session feedback is unavailable for private or ephemeral sessions.');
  const check = () => {
    auxCloudCheckTransferIdentity(accountId, identity);
    const current = SessionStore.get(accountId, session.id);
    if (!current || +new Date(current.createdAt) !== +new Date(session.createdAt) || current.incognito || current.ephemeral)
      throw Error('The original feedback session changed.');
  };
  return auxBrokerBoundary().awaited(async () => {
    check();
    const dump = await buildSessionFeedbackDump(accountId, session);
    check();
    const bytes = Buffer.from(JSON.stringify({ format: 'aux.session-feedback.v1', auxComponentVersion: DAEMON_VERSION,
      submittedAt: new Date().toISOString(), comment, sessionId: session.id, sessionDump: dump }));
    if (bytes.length > 8 * 1024 * 1024) throw Error('Session feedback exceeds the 8 MiB private report limit.');
    const name = 'session-feedback-' + randomUUID() + '.json';
    const committed = await auxCloudUploadBytes(accountId, bytes, name, 'application/json', 'feedback', identity);
    check();
    if (committed.state !== 'ready' || committed.purpose !== 'feedback' || committed.name !== name ||
        committed.mimeType !== 'application/json' || committed.contentUrl !== '/attachments/' + committed.id + '/content')
      throw Error('Private feedback receipt was not confirmed; no delivery is claimed.');
    return { ok: true };
  });
}

const pins = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/integration/feedback/source-pins.json', import.meta.url), 'utf8'));
export function transformAuxSessionFeedback({ text, source }) {
  if (!pins.originalPair.includes(createHash('sha256').update(source).digest('hex')) || text.includes('function auxSubmitSessionFeedback('))
    throw Error('Feedback requires the exact A51 pair and one fresh composition.');
  const anchors = [];
  for (const rule of pins.rules) {
    if (source.split(rule.sourceFind ?? rule.find).length - 1 !== 1 || text.split(rule.find).length - 1 !== 1)
      throw Error('Feedback source/consumer count drift.');
    const offset = text.indexOf(rule.find);
    text = text.slice(0, offset) + rule.replace + text.slice(offset + rule.find.length);
    anchors.push({ kind: 'integration', ...rule, count: 1, offsetAtApplication: offset });
  }
  const append = '\n' + auxSubmitSessionFeedback.toString() + '\n';
  return { text: text + append, anchors: [...anchors, { kind: 'integration', scope: 'authenticated bounded private feedback adapter', append, count: 1 }] };
}
export function transformAuxFeedbackCopy({ path, text, source }) {
  if (path !== 'assets/session-feedback-dialog-BjDg0W8m.js') return { text, anchors: [] };
  if (createHash('sha256').update(source).digest('hex') !== pins.uiOriginalSha256) throw Error('Feedback UI source changed.');
  const anchors = [];
  for (const [find, replacement] of [['Feedback submitted.', 'Saved privately for review.'], ['Your feedback and session data will only be used to review and improve Aux.', 'This saves your feedback and session data privately for Aux review.']]) {
    if (text.split(find).length - 1 !== 1) throw Error('Feedback UI copy drift.');
    text = text.replace(find, () => replacement); anchors.push({ kind: 'integration', find, replace: replacement, count: 1 });
  }
  return { text, anchors };
}
