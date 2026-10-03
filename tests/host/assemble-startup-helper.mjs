import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
/** Assemble the five fixed original inputs into one main.swift. The builder
 * retains the source/assembly/compiler/binary manifest; this digest alone is
 * not an assertion that any particular executable was compiled from it. */
export function assembleStartupHelper(writer, launcher, assembler, lifetime, cold) {
  for (const bytes of [writer, launcher, assembler, lifetime, cold])
    if (!Buffer.isBuffer(bytes) || bytes.length === 0 || bytes.length > 262144 ||
        bytes.includes(0) || Buffer.from(bytes.toString('utf8')).compare(bytes) !== 0)
      throw new Error('Invalid fixed helper source bytes');
  const inputs = [
    ['startup-receipt-writer.swift', writer], ['startup-launch.swift', launcher],
    ['assemble-startup-helper.mjs', assembler], ['startup-child-lifetime.swift', lifetime],
    ['startup-cold-process-audit.swift', cold],
  ];
  const hash = createHash('sha256').update('aux-startup-helper-source-v1\0');
  for (const [name, bytes] of inputs) {
    const size = Buffer.alloc(8); size.writeBigUInt64BE(BigInt(bytes.length));
    hash.update(name).update('\0').update(size).update(bytes);
  }
  const sourceSha256 = hash.digest('hex');
  const source = Buffer.concat([
    Buffer.from('// Fixed assembled startup helper; retain original input pins.\n' +
      'let startupHelperSourceSha256 = "' + sourceSha256 + '"\n'),
    writer, Buffer.from('\n'), lifetime, Buffer.from('\n'), cold, Buffer.from('\n'), launcher, Buffer.from('\n'),
  ]);
  return { source, manifest: {
    producer: 'aux-startup-helper-assembly', version: 1, sourceSha256,
    assembledSha256: digest(source), inputs: inputs.map(([name, bytes]) => ({
      name, sha256: digest(bytes), bytes: bytes.length,
    })),
  } };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length > 3 || (process.argv[2] && process.argv[2] !== '--manifest'))
    throw new Error('No source/path/compiler selectors supported');
  const assembled = assembleStartupHelper(
    readFileSync(new URL('./startup-receipt-writer.swift', import.meta.url)),
    readFileSync(new URL('./startup-launch.swift', import.meta.url)),
    readFileSync(fileURLToPath(import.meta.url)),
    readFileSync(new URL('./startup-child-lifetime.swift', import.meta.url)),
    readFileSync(new URL('./startup-cold-process-audit.swift', import.meta.url)),
  );
  process.stdout.write(process.argv[2] === '--manifest'
    ? JSON.stringify(assembled.manifest) + '\n' : assembled.source);
}
