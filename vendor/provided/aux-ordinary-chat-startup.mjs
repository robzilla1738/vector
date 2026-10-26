import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export function auxCreateLazyDesktopRepl(factory) {
  let repl, disposal, disposed = false;
  return {
    run(...args) {
      if (disposed) throw Error('The desktop tool session has closed.');
      return (repl ??= factory()).run(...args);
    },
    dispose() { if (!disposed) { disposed = true; disposal = repl?.dispose(); } return disposal; },
  };
}
export function auxReportAgentStartFailure(accountId, sessionId, owner, error) {
  const current = AccountRegistry.getAccount(accountId);
  if (owner && current?.createdAt === owner.createdAt && current?.incarnationId === owner.incarnationId) {
    const session = SessionStore.get(accountId, sessionId);
    if (session && session.status !== 'running' && session.status !== 'suspended')
      SessionStore.update(accountId, sessionId, { status: 'errored' });
  }
  const disabled = error?.code === 'AUX_SUPERVISED_TASKS_DISABLED';
  throw new TRPCError({ code: 'PRECONDITION_FAILED', message: disabled
    ? 'This task could not start because a required tool needs supervised execution, which is disabled in this build. Your draft is preserved.'
    : 'This task could not initialize. Your draft is preserved; check model and tool availability, then try again.' });
}
const pins = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/integration/ordinary-chat/source-pins.json', import.meta.url), 'utf8'));
export function transformAuxOrdinaryChatStartup({ text, source = text }) {
  if (typeof source !== 'string' || !pins.inputSha256.includes(createHash('sha256').update(source).digest('hex')))
    throw Error('Ordinary chat startup requires a pinned A51 source or reviewed successor.');
  if (typeof text !== 'string' || text.includes('function auxCreateLazyDesktopRepl(')) throw Error('Unknown or repeated ordinary chat startup source.');
  for (const rule of pins.rules) if (source.split(rule.find).length - 1 !== rule.count || text.split(rule.find).length - 1 !== rule.count)
    throw Error(`Ordinary chat startup source drift: ${rule.scope}`);
  const anchors = [];
  for (const rule of pins.rules) { text = text.replace(rule.find, () => rule.replace); anchors.push({ ...rule, kind: 'integration' }); }
  const append = '\n' + [auxCreateLazyDesktopRepl, auxReportAgentStartFailure].map(fn => fn.toString()).join('\n') + '\n';
  return { text: text + append, anchors: [...anchors, { kind: 'integration', scope: 'ordinary chat construction and startup error helpers', append, count: 1 }] };
}
