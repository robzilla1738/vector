import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const pins = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/integration/identity/source-pins.json', import.meta.url), 'utf8'));
const sha256 = text => createHash('sha256').update(text).digest('hex');

export function transformAuxFinalRuntimeIdentity({ component, path, text, source = text }) {
  const pin = pins[component];
  if (!pin || component === 'agent' && path !== pin.path)
    throw Error('Unsupported final runtime identity source.');
  if (typeof source !== 'string' || !pin.inputSha256.includes(sha256(source)))
    throw Error('Final runtime identity requires the pinned A51, cloud-transfer successor or feedback source.');
  if (typeof text !== 'string') throw Error('Composed source text is required.');
  for (const rule of pin.rules) {
    if (source.split(rule.find).length - 1 !== rule.count || text.split(rule.find).length - 1 !== rule.count)
      throw Error(`Final runtime identity source drift: ${rule.scope}`);
  }
  if (component === 'daemon' && text.includes('init_aux'))
    throw Error('Final runtime identity would collide with an existing module binding.');
  const anchors = [];
  for (const rule of pin.rules) {
    text = text.split(rule.find).join(rule.replace);
    anchors.push({ ...rule, kind: 'identity' });
  }
  return { text, anchors };
}
