import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { basename } from 'node:path';

const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const hex = (value, size) => typeof value === 'string' && new RegExp(`^[a-f0-9]{${size}}$`).test(value);
const power = () => execFileSync('/usr/bin/pmset', ['-g', 'batt'], { encoding: 'utf8', timeout: 5000 });
const ac = text => { assert.equal(typeof text, 'string'); assert.match(text, /Now drawing from 'AC Power'/, 'Actual AC power required'); return text; };
export function rawPercentile(samples, percentile) {
  assert.ok(Array.isArray(samples) && samples.length && samples.every(value => Number.isFinite(value) && value >= 0), 'Invalid raw samples');
  assert.ok(Number.isFinite(percentile) && percentile >= 0 && percentile <= 1, 'Invalid percentile');
  const sorted = [...samples].sort((a, b) => a - b), position = (sorted.length - 1) * percentile;
  return sorted[Math.floor(position)] + (sorted[Math.ceil(position)] - sorted[Math.floor(position)]) * (position - Math.floor(position));
}

/** Existing native HID→AX producer only. No presentation or feature qualification. */
export async function collectNativeKeyEffects({ ax, candidate, readIdentity, prepareTrial, chord, selector, effect, metric = 'shortcut', additionalHiddenSelectors = [], trials = 20, readPower = power }) {
  const report = { schema: 1, status: 'running', metric, endpoint: 'actual HID post → confirmed AX notification; not presentation',
    candidate: structuredClone(candidate), trials, startedAt: new Date().toISOString(), attempts: [], measurements: [], identities: [] };
  try {
    candidate = structuredClone(candidate); selector = structuredClone(selector); effect = structuredClone(effect); additionalHiddenSelectors = structuredClone(additionalHiddenSelectors);
    assert.ok(['shortcut', 'minimal-toggle'].includes(metric), 'Unsupported AX metric');
    assert.ok(Number.isInteger(trials) && trials >= 20 && trials <= 100, '20–100 actual trials required');
    const product = candidate?.productIdentity;
    assert.ok(product?.dirty === false && hex(product.commit, 40) && hex(product.tree, 40) && product.label === product.commit, 'Clean candidate required');
    assert.equal(candidate.native?.sourceCommit, product.commit);
    assert.ok(hex(candidate.native?.manifestHash, 64) && typeof candidate.native?.buildId === 'string' && candidate.native.buildId && hex(candidate.shellDigest, 64) && hex(candidate.harnessCommit, 40) && hex(candidate.moduleSha256, 64), 'Missing paired candidate');
    assert.ok(Number.isInteger(ax?.pid) && ax.pid > 0 && typeof ax.measureKey === 'function' && typeof prepareTrial === 'function' && typeof readIdentity === 'function' && typeof readPower === 'function', 'Missing genuine helper/identity access');
    assert.ok(typeof chord === 'string' && chord && selector && typeof selector === 'object', 'Missing physical input target');
    assert.ok(effect && Object.keys(effect).length === 1 && ((typeof effect.expectedName === 'string' && effect.expectedName.length > 0) || effect.expectedVisible === false), 'One confirmed effect required');
    if (metric === 'minimal-toggle') {
      assert.equal(effect.expectedVisible, false, 'Minimal AX instrument requires disappearance effect');
      assert.ok(Array.isArray(additionalHiddenSelectors) && additionalHiddenSelectors.length >= 1 && additionalHiddenSelectors.length <= 7, 'Minimal requires both address and tab controls');
    } else assert.deepEqual(additionalHiddenSelectors, [], 'Additional hidden selectors are only for Minimal');
    if (effect.expectedVisible === false) assert.equal(typeof ax.request, 'function', 'Missing existing helper request access');
    const pins = { pid: ax.pid, helperSource: realpathSync(ax.helperSource), helperExecutable: realpathSync(ax.helperExecutable),
      helperSourceSha256: digest(ax.helperSource), helperSha256: digest(ax.helperExecutable) };
    assert.equal(basename(ax.helperSource), 'native-window.swift');
    assert.equal(basename(ax.helperExecutable), `native-window-${pins.helperSourceSha256.slice(0, 12)}`);
    report.producer = pins;
    const verify = async () => {
      assert.equal(ax.pid, pins.pid, 'Helper target changed');
      for (const [path, canonical, expected] of [[ax.helperSource, pins.helperSource, pins.helperSourceSha256], [ax.helperExecutable, pins.helperExecutable, pins.helperSha256]]) {
        assert.ok(lstatSync(path).isFile() && !lstatSync(path).isSymbolicLink(), 'Helper producer file changed');
        assert.equal(realpathSync(path), canonical); assert.equal(digest(path), expected, 'Helper bytes changed');
      }
      const actual = await readIdentity();
      report.identities.push(structuredClone(actual));
      assert.deepEqual(actual.runtime, product, 'Runtime candidate changed');
      for (const key of ['sourceCommit', 'buildId', 'manifestHash']) assert.equal(actual.native?.[key], candidate.native[key], `Native ${key} changed`);
    };
    report.powerBefore = await readPower(); ac(report.powerBefore); await verify();
    const request = { selector: structuredClone(selector), ...effect, ...(metric === 'minimal-toggle' ? { additionalHiddenSelectors } : {}), timeoutMs: metric === 'shortcut' ? 500 : 250 };
    const observed = new Set(); let previousEnd = 0n;
    for (let index = 0; index < trials; index++) {
      const attempt = { trial: index + 1, stage: 'setup', status: 'running' }; report.attempts.push(attempt);
      try {
        await prepareTrial(index); await verify(); attempt.stage = 'physical-input';
        const raw = structuredClone(await (effect.expectedName
          ? ax.measureKey(chord, request.selector, effect.expectedName, request.timeoutMs)
          : ax.request('measureKey', { chord, ...request })));
        attempt.raw = raw; // Preserve even a malformed actual reply.
        assert.equal(raw.via, 'hid');
        assert.ok(typeof raw.postedAtNs === 'string' && typeof raw.observedAtNs === 'string' && /^[0-9]+$/.test(raw.postedAtNs) && /^[0-9]+$/.test(raw.observedAtNs), 'Missing monotonic endpoints');
        let endpoint = raw.observedAtNs;
        if (metric === 'minimal-toggle') {
          assert.match(raw.effectConfirmedAtNs ?? '', /^[0-9]+$/, 'Missing combined effect endpoint');
          assert.deepEqual(raw.hiddenSelectors, [selector, ...additionalHiddenSelectors]);
          assert.ok(BigInt(raw.effectConfirmedAtNs) >= BigInt(raw.observedAtNs), 'Combined effect precedes notification');
          endpoint = raw.effectConfirmedAtNs;
        }
        const posted = BigInt(raw.postedAtNs), ended = BigInt(endpoint);
        assert.ok(posted > 0n && ended >= posted, 'Reversed monotonic interval');
        assert.ok(!observed.has(raw.postedAtNs), 'Replayed native interval'); observed.add(raw.postedAtNs);
        assert.ok(posted > previousEnd, 'Overlapping or reversed trial order'); previousEnd = ended;
        const elapsedMs = Number(ended - posted) / 1_000_000;
        assert.equal(raw.elapsedMs, elapsedMs, 'Elapsed value does not match raw native endpoints');
        assert.ok(['AXTitleChanged', 'AXValueChanged', 'AXLayoutChanged', 'AXUIElementDestroyed'].includes(raw.notification), 'Missing confirmed AX notification');
        if (effect.expectedName) {
          assert.equal(raw.expectedName, effect.expectedName);
          assert.ok(raw.element?.name === effect.expectedName || raw.element?.names?.includes(effect.expectedName), 'Expected AX name not observed');
        } else {
          assert.equal(raw.expectedVisible, false); assert.deepEqual(raw.selector, selector); assert.deepEqual(raw.visibleElements, []);
        }
        await verify(); report.measurements.push(raw); attempt.status = 'passed';
      } catch (error) { attempt.status = 'failed'; attempt.error = error.message; throw error; }
    }
    report.powerAfter = await readPower(); ac(report.powerAfter); await verify();
    const samples = report.measurements.map(row => row.elapsedMs);
    report.samplesMs = samples; report.p95Ms = rawPercentile(samples, 0.95);
    report.maxMs = Math.max(...samples); report.budgetMs = metric === 'shortcut' ? 50 : 250;
    report.gatedMs = report.maxMs;
    assert.ok(report.gatedMs <= report.budgetMs, `Raw AX effect interval ${report.gatedMs} exceeds ${report.budgetMs}ms`);
    report.status = 'measured'; return report;
  } catch (error) {
    report.status = 'failed'; report.error = error.message;
    try { report.powerAfter ??= await readPower(); } catch (powerError) { report.powerError = powerError.message; }
    const failure = new Error(`Native AX performance refused: ${error.message}`, { cause: error }); failure.report = report; throw failure;
  } finally { report.completedAt = new Date().toISOString(); }
}
