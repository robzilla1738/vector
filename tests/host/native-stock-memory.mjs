import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { acquireNativeSlot } from '../../scripts/native-slot.mjs';
import { fixturePage } from './lib/fixture.mjs';
import { launchStockMemoryApp } from './lib/stock-memory-app.mjs';

export function stockFixtureUrls(auxTrials) {
  assert.equal(auxTrials.length, 20); const first = auxTrials[0]; assert.equal(first.mode, 'idle');
  assert.ok(first.idleBefore?.length === 10); const urls = first.idleBefore.map(tab => tab.url);
  assert.equal(new Set(urls).size, 10); let port;
  for (let index = 0; index < 10; index++) {
    const url = new URL(urls[index]); assert.equal(url.protocol, 'http:'); assert.equal(url.hostname, '127.0.0.1');
    assert.equal(url.pathname, `/memory/human-${index + 1}`); assert.ok(url.port && !url.search && !url.hash && !url.username && !url.password);
    port ??= url.port; assert.equal(url.port, port); assert.equal(url.href, urls[index]);
  }
  for (const trial of auxTrials) { assert.equal(trial.mode, 'idle'); assert.equal(trial.status, 'sampled'); assert.deepEqual(trial.idleBefore.map(tab => tab.url), urls); assert.deepEqual(trial.idleAfter, trial.idleBefore); }
  return urls;
}
export async function createStockMemoryFixture(urls) {
  assert.equal(urls.length, 10); const port = Number(new URL(urls[0]).port); const routes = new Map();
  urls.forEach((url, index) => routes.set(new URL(url).pathname, fixturePage(`Aux memory source ${index + 1}`, '<p>Disposable memory workload source.</p>')));
  const requests = []; const server = createServer((request, response) => {
    if (request.socket.remoteAddress !== '127.0.0.1' || request.method !== 'GET' || !routes.has(request.url)) { response.writeHead(404); response.end(); return; }
    if (requests.length >= 256) { response.writeHead(429); response.end(); return; }
    requests.push({ method: request.method, path: request.url }); response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); response.end(routes.get(request.url));
  });
  await new Promise((resolveListen, reject) => { server.once('error', reject); server.listen({ host: '127.0.0.1', port, exclusive: true }, resolveListen); });
  return { requests, async close() { server.closeAllConnections(); await new Promise((resolveClose, reject) => server.close(error => error ? reject(error) : resolveClose())); } };
}
export function compactStockMemoryReport(report) {
  const original = structuredClone(report);
  for (const trial of [...(original.setup ?? []), ...(original.trials ?? [])]) {
    if (trial.observation) { delete trial.observation.decoded; delete trial.observation.native; }
  }
  return original;
}
export function persistStockMemoryReport(path, report) {
  const bytes = Buffer.from(`${JSON.stringify(compactStockMemoryReport(report))}\n`);
  assert.ok(bytes.length <= 1024 * 1024, 'Original stock report exceeds unchanged 1MiB bound');
  writeFileSync(path, bytes, { flag: 'wx', mode: 0o600 }); return createHash('sha256').update(bytes).digest('hex');
}
const failureRecord = error => ({ name: error.name, message: error.message, stack: error.stack });

// Error traversal retains actual ChildProcess objects and their original close
// promises. Numeric PIDs are diagnostic only and never become cleanup authority.
export function stockCleanupDebt(errors, slot) {
  const queue = [...errors], seen = new Set(), children = new Map();
  while (queue.length) {
    const error = queue.shift(); if (!error || seen.has(error)) continue; seen.add(error);
    if (error.ownedChild && typeof error.reaped?.then === 'function') {
      const previous = children.get(error.ownedChild);
      assert.ok(!previous || previous === error.reaped, 'Conflicting original child reap receipts');
      children.set(error.ownedChild, error.reaped);
    }
    if (Array.isArray(error.errors)) queue.push(...error.errors);
    if (error.cause) queue.push(error.cause);
  }
  return children.size ? { children: [...children].map(([child, reaped]) => ({ child, reaped })), slot } : undefined;
}
export function stockCollectionFailure(errors, report, reportPath, debt) {
  const failure = new AggregateError(errors, 'Original stock memory collection failed');
  failure.report = report; failure.reportPath = reportPath;
  if (debt) {
    failure.cleanupDebt = debt; failure.retainedSlot = debt.slot;
    if (debt.children.length === 1) { failure.ownedChild = debt.children[0].child; failure.reaped = debt.children[0].reaped; }
  }
  return failure;
}
export function awaitStockCleanupDebt(debt) {
  debt.waiting ??= (async () => {
    // A Promise alone does not retain Node's event loop. Keep the original
    // native-slot owner live until every original close/reap promise resolves.
    const owner = setInterval(() => {}, 60_000);
    try { await Promise.all(debt.children.map(entry => entry.reaped)); }
    catch (error) {
      // Original lifetime.reaped only resolves on close. An unexpected rejected
      // receipt is indeterminate cleanup: keep ownership, never release/retry a
      // discovered PID or advertise success.
      debt.receiptFailure = error;
      await new Promise(() => {});
    }
    clearInterval(owner); debt.slot?.release();
  })(); return debt.waiting;
}

/** Source entry only; native launch is permitted solely by root's authorized
 * builder run. Setup samples are retained and are never counted among 20 trials. */
export async function collectStockMemory({ manifestPath, manifestSha256, auxReportPath, reportPath, signal }) {
  assert.ok(signal instanceof AbortSignal); signal.throwIfAborted();
  const report = { producer: 'aux-stock-memory-collection', version: 1, qualification: false, status: 'running', setup: [], trials: [] };
  let slot, app, fixture, primary; const cleanup = [];
  try {
    const { validateNativeProcessMemory } = await import('./lib/native-process-memory.mjs');
    const { createNativeStockMemoryReader, collectNativeStockMemoryTrials, assertMatchedStockMemoryOverhead } = await import('./lib/native-stock-process-memory.mjs');
    const auxBytes = readFileSync(auxReportPath); assert.ok(auxBytes.length <= 1024 * 1024);
    report.auxOriginal = { path: resolve(auxReportPath), sha256: createHash('sha256').update(auxBytes).digest('hex') };
    const auxReport = JSON.parse(auxBytes), auxTrials = auxReport.trials; const urls = stockFixtureUrls(auxTrials);
    const first = auxTrials[0].observation;
    const aux = validateNativeProcessMemory(first.raw, first.receipt.pid); assert.equal(aux.row.status, 'sampled');
    assert.match(aux.row.chromiumLastChange, /^(?!0{40}(?:-|$))[a-f0-9]{40}(?:-[A-Za-z0-9_./@{}#:-]+)?$/, 'Original Aux compiled revision cannot be dummy');
    const expectedChromium = { version: aux.row.chromiumVersion, lastChange: aux.row.chromiumLastChange };
    report.urls = urls;
    slot = await acquireNativeSlot({ signal }); signal.throwIfAborted();
    fixture = await createStockMemoryFixture(urls);
    const root = mkdtempSync('/private/tmp/aux-native-journey-stock-memory-'); chmodSync(root, 0o700);
    const userDataDir = join(root, 'profile'); mkdirSync(userDataDir, { mode: 0o700 }); report.fixtureRoot = root;
    app = await launchStockMemoryApp({ manifestPath, manifestSha256, userDataDir, urls, signal }); report.child = { pid: app.browserPid, generation: app.generation, argv: app.argv, identity: app.identity };
    assert.equal(app.identity.chromiumVersion, expectedChromium.version); assert.equal(app.identity.chromiumLastChange, expectedChromium.lastChange);
    const reader = createNativeStockMemoryReader({ transport: app.transport, browserPid: app.browserPid,
      expectedIdentity: app.identity, expectedChromium, expectedUrls: urls, readIdentity: () => app.readIdentity() });
    let ready = false;
    for (let attempt = 1; attempt <= 30; attempt++) {
      signal.throwIfAborted(); const evidence = { attempt, status: 'running' }; report.setup.push(evidence);
      try { evidence.observation = await reader.sample(); } catch (error) { evidence.observation = error.observation; evidence.status = 'failed'; throw error; }
      evidence.status = evidence.observation.status;
      if (evidence.status === 'sampled') { ready = true; break; }
      assert.equal(evidence.status, 'refused'); await delay(100, undefined, { signal });
    }
    assert.ok(ready, 'Ten current native stock tabs never became ready');
    try { report.trials = await collectNativeStockMemoryTrials({ reader, signal }); }
    catch (error) { report.trials = error.trials ?? []; throw error; }
    assert.deepEqual(readFileSync(auxReportPath), auxBytes, 'Original paired Aux report changed');
    const comparison = assertMatchedStockMemoryOverhead(auxTrials, report.trials, 250_000_000n);
    report.comparison = Object.fromEntries(Object.entries(comparison).map(([key, value]) => [key, String(value)])); report.status = 'sampled';
  } catch (error) { primary = error; report.status = 'failed'; report.primaryFailure = failureRecord(error); }
  if (app) {
    try { report.child.exit = await app.close(); } catch (error) { cleanup.push(error); }
    report.child.stderrRawBase64 = app.stderrRawBase64; report.child.stderrSha256 = app.stderrSha256;
  }
  if (fixture) { report.fixtureRequests = fixture.requests; try { await fixture.close(); } catch (error) { cleanup.push(error); } }
  // Keep the lease if the original child could not be reaped. Its ownership is
  // retained on the cleanup failure; unrelated native work must not proceed.
  const cleanupDebt = stockCleanupDebt([primary, ...cleanup], slot);
  if (cleanupDebt) { report.status = 'failed'; report.cleanupDebt = { status: 'pending', originalChildPids: cleanupDebt.children.map(entry => entry.child.pid) }; }
  if (slot && !cleanupDebt) { try { slot.release(); } catch (error) { cleanup.push(error); } }
  if (cleanup.length) { report.status = 'failed'; report.cleanupFailures = cleanup.map(failureRecord); }
  let persistedFailure;
  try { report.reportSha256 = persistStockMemoryReport(reportPath, report); } catch (error) { persistedFailure = error; }
  if (primary || cleanup.length || persistedFailure) {
    throw stockCollectionFailure([primary, ...cleanup, persistedFailure].filter(Boolean), report, reportPath, cleanupDebt);
  }
  return report;
}
if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])) {
  const [manifestPath, manifestSha256, auxReportPath, reportPath] = process.argv.slice(2); assert.ok(manifestPath && manifestSha256 && auxReportPath && reportPath && process.argv.length === 6);
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(new Error('Original 600s stock memory deadline')), 600_000);
  const stop = () => controller.abort(new Error('Original caller termination')); process.once('SIGINT', stop); process.once('SIGTERM', stop);
  try { await collectStockMemory({ manifestPath, manifestSha256, auxReportPath, reportPath, signal: controller.signal }); }
  catch (error) {
    process.exitCode = 1;
    if (error.cleanupDebt) {
      console.error(`Stock memory failed; retaining original cleanup debt and native lease: ${error.reportPath}`);
      try { await awaitStockCleanupDebt(error.cleanupDebt); }
      catch (cleanup) { throw new AggregateError([error, cleanup], 'Original collection and retained-slot cleanup failed'); }
    }
    throw error;
  }
  finally { clearTimeout(timer); process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop); }
}
