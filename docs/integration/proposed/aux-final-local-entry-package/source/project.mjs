/** Exact final-stage projection only; ordinary state2 entry is never modified. */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { AUX_COLD_ENTRY_REFUSAL } from '../../../../../vendor/provided/aux-cold-entry-admission.mjs';
import { findMachOSeaSection, readSeaBlob } from '../../../../../vendor/aside/lib/sea.mjs';
import { fixedPtyLoader } from '../../aux-native-fixed-pty-loading/transform.mjs';
const hash = value => createHash('sha256').update(value).digest('hex');
const routing = JSON.parse(readFileSync(new URL('../../aux-native-owned-entry-routing/edits.json', import.meta.url)));
const pty = JSON.parse(readFileSync(new URL('../../aux-native-fixed-pty-loading/anchor.json', import.meta.url)));
const lifetime = JSON.parse(readFileSync(new URL('../../aux-native-exec-lifetime/edits.json', import.meta.url)));
function edits(source, rows, label) {
  for (const edit of rows) {
    if (source.split(edit.find).length - 1 !== edit.count)
      throw Error(`${label} count mismatch: ${edit.name}`);
    source = source.replace(edit.find, edit.replace);
  }
  return source;
}
export function projectFinalLocalNativeEntry(originalDaemon, index, review) {
  if (!/^[0-9a-f]{64}$/.test(review.inputIndexSha256) || hash(index) !== review.inputIndexSha256 ||
      index.length !== review.inputIndexBytes || hash(originalDaemon) !== review.originalDaemonSha256)
    throw Error('Exact reviewed provider-stage source required');
  const section = findMachOSeaSection(originalDaemon);
  const original = readSeaBlob(originalDaemon.subarray(section.offset, section.offset + section.size)).code;
  if (hash(original) !== pty.originalSha256 || original.split(pty.anchor).length !== 2)
    throw Error('Exact original PTY source required');
  let source = index.toString('utf8');
  if (!source.startsWith(AUX_COLD_ENTRY_REFUSAL) || source.split(AUX_COLD_ENTRY_REFUSAL).length !== 2)
    throw Error('First ordinary state2 refusal required');
  // Same immutable edits as the historical reviewed projection. Their old
  // intermediate input hashes remain truthful; this successor separately pins
  // the new complete stage input and output instead of rewriting that history.
  const sidecarRoute = "new URL('../native/aux-chatgpt.cjs',import.meta.url)";
  if (source.split(sidecarRoute).length !== 2) throw Error('Fixed relative ChatGPT sidecar route required');
  source = edits(source, routing.edits, 'Native routing');
  source = source.replace(AUX_COLD_ENTRY_REFUSAL,
      "/* aux-owned-native-entry-v1 */\nprocess._linkedBinding('aux_owned_native');\n");
  const adapted = pty.anchor.replace('let ei=path.dirname(process.execPath),ti=', 'let ei=__auxDaemonMacOS,ti=');
  if (adapted === pty.anchor || source.split(adapted).length !== 2)
    throw Error('Exact owned PTY anchor required');
  source = source.replace(adapted, fixedPtyLoader);
  source = edits(source, lifetime.edits, 'Exec lifetime');
  if (source.includes(AUX_COLD_ENTRY_REFUSAL) ||
      !source.startsWith("/* aux-owned-native-entry-v1 */\nprocess._linkedBinding('aux_owned_native');\n"))
    throw Error('Fixed dormant linked-entry prefix required');
  if (source.split(sidecarRoute).length !== 2) throw Error('ChatGPT sidecar route changed during projection');
  const bytes = Buffer.from(source);
  if (review.entrySha256 && hash(bytes) !== review.entrySha256)
    throw Error('Final complete provider native entry differs');
  return bytes;
}
