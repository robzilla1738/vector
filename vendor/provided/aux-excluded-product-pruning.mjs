import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const pins = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/integration/excluded-products/source-pins.json', import.meta.url), 'utf8'));
export function transformAuxExcludedProducts({ text, source }) {
  const hash = createHash('sha256').update(source).digest('hex');
  if (!pins.files.some(file => file.originalSha256 === hash)) throw Error('Excluded product pruning requires exact paired A51 source.');
  const anchors = [];
  for (const rule of pins.rules) {
    if (source.split(rule.find).length - 1 !== 1 || text.split(rule.find).length - 1 !== 1)
      throw Error('Excluded product source/consumer drift: ' + rule.scope);
    const offset = text.indexOf(rule.find);
    text = text.slice(0, offset) + rule.replace + text.slice(offset + rule.find.length);
    anchors.push({ kind: 'integration', scope: rule.scope, find: rule.find, replace: rule.replace, count: 1, offsetAtApplication: offset });
  }
  return { text, anchors };
}
