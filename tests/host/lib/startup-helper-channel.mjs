import { createHash } from 'node:crypto';
import { parseStartupLaunchReceipt } from './startup-launch-receipt.mjs';

const prefix = 'AUX_STARTUP_LAUNCH_V1 ';
const exitFields = ['browserPid', 'cleanupRequested', 'launcherPid', 'producer', 'trial', 'version', 'waitStatus'];
const digest = raw => createHash('sha256').update(raw).digest('hex');
function parseExit(raw, launch) {
  const bytes = raw.slice(prefix.length, -1);
  const record = JSON.parse(bytes);
  if (!raw.startsWith(prefix) || !raw.endsWith('\n') ||
      JSON.stringify(Object.keys(record).sort()) !== JSON.stringify(exitFields) ||
      JSON.stringify(Object.fromEntries(exitFields.map(key => [key, record[key]]))) !== bytes ||
      record.producer !== 'aux-native-startup-exit' || record.version !== 1 ||
      record.trial !== launch.trial || record.launcherPid !== launch.launcherPid ||
      record.browserPid !== launch.browserPid || typeof record.cleanupRequested !== 'boolean' || !Number.isInteger(record.waitStatus) ||
      record.waitStatus < 0 || record.waitStatus > 65535)
    throw new Error('Invalid original child exit receipt');
  return Object.freeze({ record: Object.freeze(record), raw, rawSha256: digest(raw) });
}

/** Own only the original direct helper child. A parsed receipt grants no native
 * measurement authority. Browser PID is never used as a signal target. Failed
 * cleanup retains debt so the caller must retain its native-slot lease. */
export function ownStartupHelperChannel(child, expected, { cleanupMs = 5000, onNativeStderr } = {}) {
  if (!child || !Number.isSafeInteger(child.pid) || child.pid <= 0 ||
      child.pid !== expected.launcherPid || !child.stdout || !child.stderr ||
      typeof child.kill !== 'function' || (onNativeStderr !== undefined && typeof onNativeStderr !== 'function') || !Number.isSafeInteger(cleanupMs) || cleanupMs < 1 || cleanupMs > 10000)
    throw new Error('Missing original direct helper identity');
  expected = Object.freeze({ ...expected });
  const originalHelperPid = child.pid;
  let bytes = '', stdoutBytes = 0, stderrBytes = 0, launch, exit, closed = false;
  let primary, cleanup, stopping = false;
  let resolveLaunch, rejectLaunch, resolveClose;
  const launched = new Promise((resolve, reject) => { resolveLaunch = resolve; rejectLaunch = reject; });
  // Refusal may precede the consumer installing its await.
  launched.catch(() => {});
  const close = new Promise(resolve => { resolveClose = resolve; });
  const nativeStderr = [];
  const fail = error => {
    primary ??= error instanceof Error ? error : new Error(String(error));
    if (!launch) rejectLaunch(primary);
    if (!closed && !stopping) { stopping = true; if (!child.kill('SIGTERM')) cleanup ??= new Error('Original helper TERM refused'); }
  };
  child.stdout.on('data', chunk => {
    if (primary && !launch) return;
    try {
      const data = Buffer.from(chunk);
      stdoutBytes += data.length;
      if (stdoutBytes > 4096 || data.includes(0)) throw new Error('Startup helper stdout overflow');
      bytes += data.toString('utf8');
      for (;;) {
        const end = bytes.indexOf('\n'); if (end < 0) break;
        const raw = bytes.slice(0, end + 1); bytes = bytes.slice(end + 1);
        if (!launch) { launch = parseStartupLaunchReceipt(raw, expected); resolveLaunch(launch); }
        else if (!exit) {
          exit = parseExit(raw, launch.record);
          if (exit.record.cleanupRequested && !stopping) primary ??= new Error('Unsolicited startup helper cancellation');
          if (exit.record.waitStatus !== 0 && !exit.record.cleanupRequested) primary ??= new Error('Original browser exited unsuccessfully');
        }
        else throw new Error('Replayed startup helper receipt');
      }
    } catch (error) { fail(error); }
  });
  child.stderr.on('data', chunk => {
    const data = Buffer.from(chunk); stderrBytes += data.length;
    if (stderrBytes > 4 * 1024 * 1024) { fail(new Error('Startup native stderr overflow')); return; }
    // Retain original bounded bytes; a separate strict native decoder must pair
    // launch, native identity and actual first-HW scope before counting results.
    nativeStderr.push(data);
    try { onNativeStderr?.(Buffer.from(data)); } catch (error) { fail(error); }
  });
  child.on('error', fail);
  child.once('close', (code, signal) => {
    closed = true;
    if (bytes.length) primary ??= new Error('Truncated startup helper receipt');
    if (!launch) primary ??= new Error('Startup helper closed without original launch');
    if (code !== 0 || signal || !exit) cleanup ??= new Error('Original browser reaping was not proved by helper');
    if (!launch) rejectLaunch(primary);
    resolveClose(Object.freeze({ code, signal, launch, exit, primary, cleanup, cleanupDebt: Boolean(cleanup) }));
  });
  return Object.freeze({
    launched,
    get originalHelperPid() { return originalHelperPid; },
    get originalBrowserReceipt() { return launch; },
    get nativeStderr() { return Buffer.concat(nativeStderr); },
    async stop(error) {
      if (error) primary ??= error;
      if (primary && !launch) rejectLaunch(primary);
      if (!closed && !stopping) {
        stopping = true;
        if (!child.kill('SIGTERM')) cleanup ??= new Error('Original helper TERM refused');
      }
      let timer;
      const result = await Promise.race([close, new Promise(resolve => {
        timer = setTimeout(() => resolve(Object.freeze({ launch, exit, primary,
          cleanup: cleanup ?? new Error('Original helper close deadline; browser cleanup debt retained'),
          cleanupDebt: true, helperMayBeLive: !closed })), cleanupMs);
      })]);
      clearTimeout(timer);
      return result;
    },
    closed: close,
  });
}
