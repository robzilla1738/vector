import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { acquireNativeSlot, withNativeSlot } from '../../../scripts/native-slot.mjs';

const source = resolve(import.meta.dirname, '../native-window.swift');

/** Cache a helper by source digest; every compile and AX session owns the slot. */
export async function nativeWindowExecutable() {
  const hash = createHash('sha256').update(readFileSync(source)).digest('hex').slice(0, 12);
  const directory = join(homedir(), 'Library/Caches/dev.aux.journeys');
  const executable = join(directory, `native-window-${hash}`);
  if (existsSync(executable)) return executable;
  return withNativeSlot(() => {
    if (existsSync(executable)) return executable;
    mkdirSync(directory, { recursive: true });
    const temporary = `${executable}.${process.pid}.tmp`;
    try {
      execFileSync('xcrun', ['swiftc', source, '-o', temporary], { timeout: 120_000, stdio: 'pipe' });
      renameSync(temporary, executable);
    } finally { rmSync(temporary, { force: true }); }
    return executable;
  });
}

export async function preflight() {
  const executable = await nativeWindowExecutable();
  return withNativeSlot(() => JSON.parse(execFileSync(executable, ['trusted'], { encoding: 'utf8', timeout: 10_000 })));
}

export async function createAxClient(pid, { timeoutMs = 65_000 } = {}) {
  if (!Number.isInteger(pid) || pid <= 0) throw new Error('AX client needs a positive PID');
  const executable = await nativeWindowExecutable();
  const slot = await acquireNativeSlot();
  const child = spawn(executable, ['serve', String(pid)], {
    stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, AUX_NATIVE_SLOT_TOKEN: slot.token },
  });
  const pending = new Map();
  let nextId = 0;
  let closed = false;
  let stderr = '';
  child.stderr.on('data', bytes => { stderr = (stderr + bytes.toString()).slice(-4096); });
  const lines = createInterface({ input: child.stdout });
  const fail = error => {
    for (const waiter of pending.values()) { clearTimeout(waiter.timer); waiter.reject(error); }
    pending.clear();
  };
  lines.on('line', line => {
    try {
      const response = JSON.parse(line);
      const waiter = pending.get(response.id);
      if (!waiter) return;
      pending.delete(response.id); clearTimeout(waiter.timer);
      if (response.ok) waiter.resolve(response.result);
      else waiter.reject(new Error(response.error ?? 'AX command failed'));
    } catch (error) { fail(new Error(`Invalid AX response: ${error.message}`)); child.kill(); }
  });
  const exited = new Promise(resolveExit => {
    child.once('error', error => { fail(error); });
    child.once('close', (code, signal) => {
      closed = true;
      fail(new Error(`AX helper exited (${code ?? signal}): ${stderr.trim()}`));
      lines.close(); slot.release(); resolveExit();
    });
  });
  function request(command, args = {}) {
    if (closed) return Promise.reject(new Error('AX client is closed'));
    const id = ++nextId;
    return new Promise((resolveRequest, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id); reject(new Error(`AX ${command} timed out`)); child.kill();
      }, timeoutMs);
      pending.set(id, { resolve: resolveRequest, reject, timer });
      child.stdin.write(`${JSON.stringify({ ...args, id, command })}\n`, error => {
        if (error) { clearTimeout(timer); pending.delete(id); reject(error); }
      });
    });
  }
  const client = {
    get pid() { return pid; },
    get targetPid() { return pid; },
    get helperPid() { return child.pid; },
    get helperSource() { return source; },
    get helperExecutable() { return executable; },
    request,
    async close() { if (!closed) child.stdin.end(); await exited; },
    query: selector => request('query', { selector }),
    dump: (selector = {}) => request('dump', { selector }),
    async press(selector) {
      await request('waitFor', { selector, state: 'visible', timeoutMs: 5000 });
      return request('press', { selector });
    },
    focus: selector => request('focus', { selector }),
    click: (selector, options = {}) => request('click', { selector, ...options }),
    hover: selector => request('hover', { selector }),
    key: (chord, via = 'pid', phase = 'press') => request('key', { chord, via, phase }),
    measureKey: (chord, selector, expectedName, timeoutMs = 500) => request('measureKey', { chord, selector, expectedName, timeoutMs }),
    measureKeyHidden: (chord, selector, timeoutMs = 500) => request('measureKey', { chord, selector, expectedVisible: false, timeoutMs }),
    async type(text, selector) {
      if (selector) await request('waitFor', { selector, state: 'visible', timeoutMs: 5000 });
      return request('type', { text, ...(selector ? { selector } : {}) });
    },
    drag: (from, to, options = {}) => request('drag', { from, to, ...options }),
    scroll: (selector, dy, dx = 0) => request('scroll', { selector, dy, dx }),
    menu: path => request('menu', { path }),
    contextMenu: selector => request('contextMenu', { selector }),
    savePanel: path => request('savePanel', { path }),
    openPanel: (path, { button = 'Open' } = {}) => request('openPanel', { path, button }),
    waitFor: (selector, state = 'present', waitTimeoutMs = 5000) => request('waitFor', { selector, state, timeoutMs: waitTimeoutMs }),
    windows: () => request('windows'),
    trusted: () => request('trusted'),
  };
  return client;
}
