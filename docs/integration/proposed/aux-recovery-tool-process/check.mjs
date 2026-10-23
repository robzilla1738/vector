import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runPostgresTool } from '../../../../services/aux-cloud/scripts/recovery-tool-process.mjs';

const directory = await mkdtemp(join(tmpdir(), 'aux-recovery-process-check-'));
try {
  const marker = join(directory, 'still-alive');
  const child = join(directory, 'writer.mjs');
  await writeFile(child, `import { writeFileSync } from 'node:fs';
process.on('SIGTERM', () => {});
process.stdout.write(Buffer.alloc(8192));
setTimeout(() => writeFileSync(process.argv[2], 'writer remained alive after budget failure'), 100);
setTimeout(() => process.exit(0), 300);
`, { mode: 0o600 });
  const started = Date.now();
  await assert.rejects(runPostgresTool(process.execPath, [child, marker], {}, {
    path: join(directory, 'database.dump'), limit: 1,
  }), /archive stream failed/);
  assert.equal(await readFile(marker, 'utf8'), 'writer remained alive after budget failure');
  assert(Date.now() - started >= 300, 'failure settled before the actual writer exit');
  console.log('Actual archive budget failure retained the SIGTERM-ignoring child until exit; exit 0 did not turn failure into success. No provider access.');
} finally {
  await rm(directory, { recursive: true, force: true });
}
