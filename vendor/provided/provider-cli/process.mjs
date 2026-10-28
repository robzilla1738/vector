/** Child-process lifetime for provider CLIs. Every child leads its own process
 * group so Stop and Quit reach the CLI's own descendants (MCP bridges, shells). */
import {spawn} from 'node:child_process';

const live = new Set();
const KILL_GRACE_MS = 2000;

function signalGroup(child, signal) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  try { process.kill(-child.pid, signal); } catch { try { child.kill(signal); } catch {} }
}

/** SIGTERM the group, then SIGKILL after the grace period. Resolves once the child exited. */
export function terminate(child, graceMs = KILL_GRACE_MS) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return Promise.resolve();
  return new Promise(resolve => {
    const timer = setTimeout(() => signalGroup(child, 'SIGKILL'), graceMs);
    child.once('exit', () => { clearTimeout(timer); signalGroup(child, 'SIGKILL'); resolve(); });
    signalGroup(child, 'SIGTERM');
  });
}

/** Stop every provider child (daemon Quit). */
export const terminateAll = graceMs => Promise.all([...live].map(child => terminate(child, graceMs)));
export const liveChildren = () => [...live].map(child => child.pid);

let exitHook = false;
/** Last-resort cleanup if the daemon exits without awaiting terminateAll(). */
export function installExitCleanup() {
  if (exitHook) return;
  exitHook = true;
  process.once('exit', () => { for (const child of live) signalGroup(child, 'SIGKILL'); });
}

export function launch(file, args, {cwd, env, stdin = 'ignore'} = {}) {
  const child = spawn(file, args, {cwd, env, detached: true, stdio: [stdin, 'pipe', 'pipe']});
  live.add(child);
  child.once('exit', () => live.delete(child));
  child.once('error', () => live.delete(child));
  return child;
}

/** Run a short command to completion (version and status probes). Never throws. */
export function capture(file, args, {cwd, env, timeoutMs = 10000, maxBytes = 256 * 1024} = {}) {
  return new Promise(resolve => {
    let child;
    try { child = launch(file, args, {cwd, env}); } catch (error) { resolve({exitCode: -1, stdout: '', stderr: '', error}); return; }
    const out = [], err = [];
    let size = 0, timedOut = false;
    const collect = sink => chunk => { if ((size += chunk.length) <= maxBytes) sink.push(chunk); };
    child.stdout.on('data', collect(out));
    child.stderr.on('data', collect(err));
    const timer = setTimeout(() => { timedOut = true; terminate(child, 500); }, timeoutMs);
    const finish = (exitCode, error) => {
      clearTimeout(timer);
      resolve({exitCode, stdout: Buffer.concat(out).toString('utf8'), stderr: Buffer.concat(err).toString('utf8'), timedOut, ...(error ? {error} : {})});
    };
    child.once('error', error => finish(-1, error));
    child.once('close', code => finish(code ?? -1));
  });
}

/** Async iterator over newline-delimited lines of a stream. */
export async function* lines(stream) {
  let buffer = '';
  stream.setEncoding('utf8');
  for await (const chunk of stream) {
    buffer += chunk;
    let index;
    while ((index = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, index).replace(/\r$/, '');
      buffer = buffer.slice(index + 1);
      if (line.trim()) yield line;
    }
  }
  if (buffer.trim()) yield buffer;
}
