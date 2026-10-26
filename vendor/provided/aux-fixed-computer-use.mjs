import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export function auxFixedComputerUseFactory() {
  if (process.platform !== 'darwin') return null;
  const binding = process._linkedBinding('aux_owned_native');
  const mode = Object.getOwnPropertyDescriptor(binding, 'supervisedTasksEnabled');
  const factory = Object.getOwnPropertyDescriptor(binding, 'createAccountComputerUseProcess');
  if (!mode || mode.get || mode.set || mode.writable || mode.configurable || mode.value !== false ||
      !factory || factory.get || factory.set || factory.writable || factory.configurable || typeof factory.value !== 'function') return null;
  return { binding, create: factory.value };
}
export function auxComputerUseProcessState() {
  return auxComputerUseProcessState.state ??= { closing: false, children: new Set() };
}
export function auxComputerUseActorIdentity(owner) {
  const account = AccountRegistry.getAccount(owner?.id);
  if (!account || account.createdAt !== owner.createdAt || isExternalOwnerSuspended(account.id))
    throw Error('The originating Computer Use account changed.');
  const bindings = Object.values(AccountRegistry.getAll().profileAccountBindings).filter(binding => binding.accountId === account.id);
  if (bindings.length !== 1) throw Error('Computer Use requires one explicit account profile binding.');
  const profileId = bindings[0].profileId, expected = Buffer.from(JSON.stringify(auxSelectedAccountIdentity(account, profileId)));
  return { id: account.id, createdAt: account.createdAt, profileId, expected,
    identity: JSON.stringify([expected.toString('utf8'), externalOwnerEpoch(account.id)]) };
}
export function auxAccountComputerUseProcess(owner) {
  const factory = auxFixedComputerUseFactory(), state = auxComputerUseProcessState();
  const current = auxComputerUseActorIdentity(owner);
  if (!factory || state.closing || owner.identity !== current.identity)
    throw Error('The native Computer Use account owner is unavailable or closing.');
  const controller = new AbortController();
  const guard = auxCreateProductivityAccountGuard(owner.id, AccountRegistry.getAccount(owner.id), owner.profileId, controller, auxBrokerBoundary());
  const { EventEmitter } = require$2('node:events'), { Readable, Writable } = require$2('node:stream');
  const child = new EventEmitter();
  let native;
  child.stdout = new Readable({ read() {} });
  child.stderr = new Readable({ read() {} });
  child.stdin = new Writable({
    write(bytes, encoding, done) {
      try { guard.assertCurrent(); Promise.resolve(native.write(Buffer.from(bytes))).then(() => done(), done); } catch (error) { done(error); }
    },
    final(done) {
      try { Promise.resolve(native.endInput()).then(() => done(), done); } catch (error) { done(error); }
    },
  });
  const abort = () => native.kill('SIGTERM');
  controller.signal.addEventListener('abort', abort, { once: true });
  try {
    guard.assertCurrent();
    native = Reflect.apply(factory.create, factory.binding, [owner.id, current.expected, (kind, value) => {
      if (kind === 'stdout' || kind === 'stderr') {
        if (child[kind].readableLength + value.length > 8 * 1024 * 1024) { native.kill('SIGTERM'); child.emit('error', Error('Computer Use output exceeded its bounded pipe buffer.')); return; }
        child[kind].push(value);
      }
      else if (kind === 'stdoutEnd' || kind === 'stderrEnd') child[kind === 'stdoutEnd' ? 'stdout' : 'stderr'].push(null);
      else if (kind === 'spawn') { child.pid = value; child.emit('spawn'); }
      else if (kind === 'error') child.emit('error', Error(value));
      else if (kind === 'close') {
        state.children.delete(child); guard.dispose(); controller.signal.removeEventListener('abort', abort);
        child.stdout.push(null); child.stderr.push(null);
        child.emit('exit', value.code, value.signal);
        child.emit('close', value.code, value.signal);
      }
    }]);
  } catch (error) { guard.dispose(); controller.signal.removeEventListener('abort', abort); throw error; }
  child.auxAssertOwner = expected => {
    if (expected.id !== owner.id || expected.createdAt !== owner.createdAt) throw Error('The Computer Use actor belongs to another account.');
    guard.assertCurrent();
  };
  child.kill = (signal = 'SIGTERM') => native.kill(signal);
  child.auxClose = () => native.close();
  state.children.add(child);
  return child;
}
export async function auxCloseComputerUseProcesses() {
  const state = auxComputerUseProcessState();
  state.closing = true;
  await Promise.all([...state.children].map(child => child.auxClose()));
}

const pins = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/integration/computer-use/source-pins.json', import.meta.url), 'utf8'));
export function transformAuxFixedComputerUse({ text, source = text }) {
  if (typeof source !== 'string' || !pins.inputSha256.includes(createHash('sha256').update(source).digest('hex')))
    throw Error('Fixed Computer Use requires a pinned A51 source or reviewed successor.');
  if (typeof text !== 'string' || text.includes('function auxFixedComputerUseFactory(')) throw Error('Unknown or repeated fixed Computer Use source.');
  for (const rule of pins.rules) if (source.split(rule.find).length - 1 !== rule.count || text.split(rule.find).length - 1 !== rule.count)
    throw Error(`Fixed Computer Use source drift: ${rule.scope}`);
  const anchors = [];
  for (const rule of pins.rules) { text = text.replace(rule.find, () => rule.replace); anchors.push({ ...rule, kind: 'integration' }); }
  const append = '\n' + [auxFixedComputerUseFactory, auxComputerUseProcessState, auxComputerUseActorIdentity, auxAccountComputerUseProcess, auxCloseComputerUseProcesses].map(fn => fn.toString()).join('\n') + '\n';
  return { text: text + append, anchors: [...anchors, { kind: 'integration', scope: 'fixed native Computer Use process bridge', append, count: 1 }] };
}
