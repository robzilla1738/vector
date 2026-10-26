import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const pins = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/integration/advertised-tools/source-pins.json', import.meta.url), 'utf8'));
export function transformAuxBashCloseLifetime({ text, source = text }) {
  if (typeof source !== 'string' || !pins.inputSha256.includes(createHash('sha256').update(source).digest('hex')))
    throw Error('Bash lifetime requires a pinned A51 source or reviewed successor.');
  if (typeof text !== 'string' || text.includes('auxBashClosed')) throw Error('Unknown or repeated bash lifetime source.');
  for (const rule of pins.rules) if (source.split(rule.find).length - 1 !== rule.count || text.split(rule.find).length - 1 !== rule.count)
    throw Error(`Bash lifetime source drift: ${rule.scope}`);
  const anchors = [];
  for (const rule of pins.rules) { text = text.replace(rule.find, () => rule.replace); anchors.push({ ...rule, kind: 'integration' }); }
  return { text, anchors };
}
