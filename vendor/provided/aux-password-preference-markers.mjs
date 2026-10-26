import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export function auxFindPasswordManagerMemoryBlock(text) {
  const formats = [
    ['<!-- aux:password-manager-preference:v2:start -->', '<!-- aux:password-manager-preference:v2:end -->'],
    ['<!-- aside:password-manager-preference:start -->', '<!-- aside:password-manager-preference:end -->'],
  ];
  let found;
  for (const [start, end] of formats) {
    const opening = text.indexOf(start), closing = text.indexOf(end);
    if (opening === -1 && closing === -1) continue;
    if (found || opening === -1 || closing < opening + start.length ||
        text.indexOf(start, opening + start.length) !== -1 || text.indexOf(end, closing + end.length) !== -1)
      throw Error('Password-manager preference markers are ambiguous or incomplete; existing memory was preserved.');
    found = { start: opening, end: closing + end.length };
  }
  return found;
}
export function upsertPasswordManagerMemoryBlock(text, block) {
  const existing = auxFindPasswordManagerMemoryBlock(text);
  return existing
    ? [text.slice(0, existing.start).trimEnd(), block, text.slice(existing.end).trimStart()].filter(Boolean).join('\n\n') + '\n'
    : `${text.trimEnd()}\n\n${block}\n`;
}
export function removePasswordManagerMemoryBlock(text) {
  const existing = auxFindPasswordManagerMemoryBlock(text);
  if (!existing) return text;
  const remaining = [text.slice(0, existing.start).trimEnd(), text.slice(existing.end).trimStart()].filter(Boolean).join('\n\n');
  return remaining ? remaining + '\n' : '';
}

const pins = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/integration/preference-identity/source-pins.json', import.meta.url), 'utf8'));
export function transformAuxPreferenceIdentity({ text, source }) {
  const sha = value => createHash('sha256').update(value).digest('hex');
  if (!pins.originalPair.includes(sha(source)) || typeof text !== 'string' || text.includes('function auxFindPasswordManagerMemoryBlock('))
    throw Error('Preference identity requires the original paired A51 source and one fresh composition.');
  const replacement = [auxFindPasswordManagerMemoryBlock, upsertPasswordManagerMemoryBlock, removePasswordManagerMemoryBlock].map(fn => fn.toString()).join('\n');
  const rules = pins.rules.map(rule => ({ ...rule, replace: rule.functionBlock ? replacement : rule.replace }));
  const anchors = [];
  for (const rule of rules) {
    if (source.split(rule.find).length - 1 !== 1 || text.split(rule.find).length - 1 !== 1)
      throw Error('Preference identity source/consumer count drift.');
    text = text.replace(rule.find, () => rule.replace);
    anchors.push({ kind: 'identity', find: rule.find, replace: rule.replace, count: 1 });
  }
  return { text, anchors };
}
