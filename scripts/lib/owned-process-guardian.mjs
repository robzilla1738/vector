// Private POSIX launch guardian. Its live PID anchors its exclusive process group.
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { ownGroupMembers } from './owned-process.mjs';

if (!process.send || process.platform === 'win32') throw Error('Private POSIX IPC guardian required.');
let child;
let launched = false;
let stopping = false;
let groupSignal = false;
let cleaning;
let childDeadline;
let outcome = { childExitCode: null, childSignal: null, groupStopped: false, forced: false };
const send = message => new Promise(resolve => {
  if (!process.connected) return resolve();
  process.send(message, () => resolve());
});
async function cleanup() {
  if (cleaning) return cleaning;
  cleaning = (async () => {
    clearTimeout(childDeadline);
    // The caller of kill is the still-live group leader itself: this group ID
    // cannot have been recycled to an unrelated owner process.
    groupSignal = true;
    process.kill(-process.pid, 'SIGTERM');
    const deadline = Date.now() + 2500;
    while (Date.now() < deadline) {
      try {
        if ((await ownGroupMembers(process.pid)).length === 0) {
          outcome.groupStopped = true;
          await send({ event: 'finished', outcome });
          process.exit(outcome.childExitCode ?? (outcome.childSignal ? 1 : 0));
        }
      } catch {
        outcome.error = 'Owned process-group verification failed';
        break;
      }
      await delay(50);
    }
    outcome.forced = true;
    await send({ event: 'escalating', outcome });
    // No group signal is ever issued by the launcher after this leader exits.
    process.kill(-process.pid, 'SIGKILL');
  })();
  return cleaning;
}
function stop() {
  if (stopping) return;
  stopping = true;
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    void cleanup();
    return;
  }
  child.kill('SIGTERM');
  childDeadline = setTimeout(() => void cleanup(), 5000);
}
process.on('SIGTERM', () => { if (!groupSignal) stop(); });
process.on('SIGINT', stop);
process.on('disconnect', stop);
process.on('message', message => {
  if (message?.event === 'stop') return stop();
  if (message?.event !== 'launch' || launched) return;
  launched = true;
  child = spawn(message.command, message.args, { cwd: message.cwd, env: message.env, stdio: 'inherit' });
  child.once('spawn', () => void send({ event: 'started', pid: child.pid }));
  child.once('error', () => {
    outcome.childExitCode = 1;
    outcome.error = 'Owned executable could not be started';
    void send({ event: 'started', pid: null });
    void cleanup();
  });
  child.once('exit', (code, signal) => {
    outcome.childExitCode = code;
    outcome.childSignal = signal;
    void cleanup();
  });
});
