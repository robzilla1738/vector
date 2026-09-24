// Samples the complete local compile process tree and disk headroom.
// Process RSS is summed and therefore includes shared pages more than once.
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, statfsSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const rootPid = Number(process.argv[2]);
const sourceDir = resolve(process.argv[3] ?? '');
if (!Number.isInteger(rootPid) || rootPid <= 0 || !existsSync(sourceDir)) {
  throw new Error('Usage: node monitor-build.mjs <siso-pid> <existing-chromium-src>');
}
const outputDir = join(sourceDir, 'out/AuxProof');
mkdirSync(outputDir, { recursive: true });
const output = join(outputDir, 'aux-build-resources.ndjson');
writeFileSync(output, '');
let peakSummedRssBytes = 0;
let lowestAvailableBytes = Number.POSITIVE_INFINITY;
let samples = 0;
for (;;) {
  const table = spawnSync('ps', ['-axo', 'pid=,ppid=,rss='], { encoding: 'utf8' });
  if (table.status !== 0) throw new Error(`ps failed: ${table.stderr}`);
  const rows = table.stdout.trim().split('\n').map(line => line.trim().split(/\s+/).map(Number));
  const byParent = new Map();
  for (const [pid, ppid, rssKiB] of rows) {
    const list = byParent.get(ppid) ?? [];
    list.push({ pid, rssKiB });
    byParent.set(ppid, list);
  }
  if (!rows.some(([pid]) => pid === rootPid)) break;
  const descendants = [];
  const queue = [rootPid];
  while (queue.length) {
    const pid = queue.pop();
    const row = rows.find(item => item[0] === pid);
    if (row) descendants.push({ pid, rssKiB: row[2] });
    for (const child of byParent.get(pid) ?? []) queue.push(child.pid);
  }
  const summedRssBytes = descendants.reduce((sum, item) => sum + item.rssKiB * 1024, 0);
  const fs = statfsSync(sourceDir);
  const availableBytes = fs.bavail * fs.bsize;
  peakSummedRssBytes = Math.max(peakSummedRssBytes, summedRssBytes);
  lowestAvailableBytes = Math.min(lowestAvailableBytes, availableBytes);
  const record = { at: new Date().toISOString(), processCount: descendants.length,
    summedRssBytes, availableBytes };
  appendFileSync(output, `${JSON.stringify(record)}\n`);
  samples++;
  await delay(5000);
}
const summary = { at: new Date().toISOString(), rootPid, samples, peakSummedRssBytes,
  lowestAvailableBytes, caveat: 'Summed process RSS double-counts shared pages; sampled every five seconds.' };
writeFileSync(join(outputDir, 'aux-build-resources-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
