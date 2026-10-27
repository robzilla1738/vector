// Mechanism check for the REPL event-loop guard, using the same QuickJS build the daemon bundles.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire('/Users/rcourson/Documents/Vibe/web/node_modules/.pnpm/quickjs-emscripten@0.31.0/node_modules/quickjs-emscripten/package.json');
const { newQuickJSWASMModule } = require('quickjs-emscripten');
const QJS = await newQuickJSWASMModule();
const BLOCK_LIMIT_MS = 1000, HEARTBEAT_MS = 250, PUMP_BATCH = 64, PUMP_SLICE_MS = 50;

async function run(code, { abortAfterMs, deadlineMs = 10000 }) {
  const rt = QJS.newRuntime(); rt.setMaxStackSize(1048576); const ctx = rt.newContext();
  const controller = new AbortController(); if (abortAfterMs) setTimeout(() => controller.abort(new Error('aborted')), abortAfterMs);
  let last = Date.now(), maxGap = 0; const probe = setInterval(() => { const n = Date.now(); maxGap = Math.max(maxGap, n - last); last = n; }, 20);
  const deadline = Date.now() + deadlineMs; let ri = false, bi = false, hb = Date.now();
  const hi = setInterval(() => { hb = Date.now(); }, HEARTBEAT_MS); hi.unref();
  rt.setInterruptHandler(() => { const now = Date.now(); ri = controller.signal.aborted || now > deadline; bi ||= now - hb > BLOCK_LIMIT_MS; return ri || bi; });
  let scheduled = false;
  const pump = () => { if (scheduled) return; const start = Date.now();
    while (ctx.alive && rt.hasPendingJob()) { const r = rt.executePendingJobs(PUMP_BATCH); r.error ? r.error.dispose() : r.dispose();
      if (ctx.alive && rt.hasPendingJob() && Date.now() - start >= PUMP_SLICE_MS) { scheduled = true; setImmediate(() => { scheduled = false; pump(); }); return; } } };
  const abortP = new Promise((_, rej) => controller.signal.addEventListener('abort', () => rej(controller.signal.reason), { once: true }));
  const t0 = Date.now(); let outcome;
  try { const r = ctx.evalCode(code, 'repl.js'); if (r.error) { r.error.dispose(); throw new Error('evalError'); }
    const p = ctx.resolvePromise(r.value); r.value.dispose(); pump();
    const res = await Promise.race([p, abortP]); outcome = res.error ? (res.error.dispose(), 'rejected') : (res.value.dispose(), 'ok');
  } catch (e) { outcome = e.message === 'aborted' ? 'aborted' : 'threw'; }
  const elapsed = Date.now() - t0;
  clearInterval(hi); rt.setInterruptHandler(() => true);
  for (let i = 0; i < 2000 && rt.hasPendingJob(); i++) await new Promise(r => setImmediate(r));
  clearInterval(probe);
  return { outcome, blocked: bi, elapsed, maxGap, drained: !rt.hasPendingJob() };
}

const sync = await run('(async()=>{ while(true){} })()', {});
assert.equal(sync.outcome, 'rejected'); assert.equal(sync.blocked, true); assert.ok(sync.elapsed < BLOCK_LIMIT_MS + 1500, JSON.stringify(sync));
const asyncRec = await run('(async()=>{ async function f(n){ await 0; return f(n+1) } return f(0) })()', { abortAfterMs: 2000 });
assert.equal(asyncRec.outcome, 'aborted'); assert.ok(asyncRec.maxGap < 500, JSON.stringify(asyncRec)); assert.ok(asyncRec.drained, JSON.stringify(asyncRec));
const normal = await run('(async()=>{ let s=0; for(let i=0;i<1e5;i++){ s+=i; if(i%1e4===0) await 0 } return s })()', {});
assert.equal(normal.outcome, 'ok'); assert.equal(normal.blocked, false);
console.log(JSON.stringify({ sync, asyncRec, normal }));
console.log('repl-event-loop-guard check passed');
process.exit(0);
