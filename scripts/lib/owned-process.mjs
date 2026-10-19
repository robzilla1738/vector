// Launcher-only POSIX ownership boundary; never discovers targets via ports/names.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function ownGroupMembers(groupId) {
  return new Promise((resolve, reject) => {
    // Select only the guardian's group; never enumerate owner commands/env.
    const query = spawn('/bin/ps', ['-o', 'pid=,pgid=', '-g', String(groupId)], { stdio: ['ignore', 'pipe', 'ignore'] });
    let output = '';
    const timeout = setTimeout(() => { query.kill('SIGKILL'); reject(Error('Group query timed out')); }, 1000);
    query.stdout.on('data', chunk => { output += chunk; if (output.length > 65536) query.kill('SIGKILL'); });
    query.once('error', reject);
    query.once('close', code => {
      clearTimeout(timeout);
      if (code !== 0 || output.length > 65536) return reject(Error('Group query failed'));
      const members = [];
      for (const line of output.trim().split('\n')) {
        const match = /^\s*(\d+)\s+(\d+)\s*$/.exec(line);
        if (!match) return reject(Error('Invalid group metadata'));
        const pid = Number(match[1]);
        if (Number(match[2]) === groupId && pid !== groupId && pid !== query.pid) members.push(pid);
      }
      resolve(members);
    });
  });
}
export async function launchOwnedProcess(command, args, { cwd, env }) {
  if (process.platform === 'win32') throw Error('POSIX launcher ownership required.');
  const guardianEnv = { ...env };
  for (const key of Object.keys(guardianEnv)) if (key.startsWith('DYLD_') || ['NODE_OPTIONS', 'NODE_PATH'].includes(key)) delete guardianEnv[key];
  const guardian = spawn(process.execPath, [fileURLToPath(new URL('./owned-process-guardian.mjs', import.meta.url))],
    { cwd, env: guardianEnv, detached: true, stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });
  let finish;
  let ready;
  let pid;
  let outcome = { childExitCode: null, childSignal: null, groupStopped: false, forced: false };
  let watchdog;
  let settled = false;
  let startupTimeout;
  const started = new Promise(resolve => { ready = resolve; });
  const done = new Promise(resolve => { finish = resolve; });
  const settle = () => {
    if (settled) return;
    settled = true;
    clearTimeout(watchdog);
    clearTimeout(startupTimeout);
    ready();
    finish(outcome);
  };
  guardian.on('message', message => {
    if (message?.event === 'started') { pid = message.pid; clearTimeout(startupTimeout); ready(); }
    if (message?.event === 'finished' || message?.event === 'escalating') outcome = message.outcome;
  });
  guardian.once('error', () => { outcome.error = 'Private guardian transport failed'; guardian.kill('SIGKILL'); });
  guardian.once('close', (code, signal) => {
    if (!outcome.groupStopped && !outcome.forced) outcome.error ??= 'Guardian exited without verified group cleanup';
    outcome.guardianExitCode = code;
    outcome.guardianSignal = signal;
    settle();
  });
  const stop = () => {
    if (!settled && !watchdog) {
      if (guardian.connected) guardian.send({ event: 'stop' });
      watchdog = setTimeout(() => {
        outcome.error = 'Private guardian exceeded its shutdown deadline';
        // Direct ChildProcess only; never kill a process group without its live
        // guardian executing that action itself. State remains preserved.
        guardian.kill('SIGKILL');
      }, 11000);
    }
    return done;
  };
  guardian.once('spawn', () => guardian.send({ event: 'launch', command, args, cwd, env }, error => { if (error) void stop(); }));
  startupTimeout = setTimeout(() => {
    outcome.error = 'Private guardian did not acknowledge launch';
    guardian.kill('SIGKILL');
  }, 11000);
  await started;
  return { pid, done, stop };
}
