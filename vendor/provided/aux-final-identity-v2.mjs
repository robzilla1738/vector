import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const pins = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/integration/final-identity/source-pins.json', import.meta.url), 'utf8'));
const sha = text => createHash('sha256').update(text).digest('hex');
const exactIdentifierCount = (text, name) => (text.match(new RegExp('(?<![A-Za-z0-9_$])' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z0-9_$])', 'g')) ?? []).length;
function apply(text, rules) {
  const anchors = [];
  for (const rule of rules) {
    const offset = text.indexOf(rule.find);
    if (text.split(rule.find).length - 1 !== rule.count) throw Error('Final identity count drift: ' + rule.scope);
    text = text.slice(0, offset) + rule.replace + text.slice(offset + rule.find.length);
    anchors.push({ kind: 'integration', ...rule, offsetAtApplication: offset });
  }
  return { text, anchors };
}
export function transformAuxTrustedTypes({ path, text, source }) {
  const content = path === 'content/content.js';
  const expected = content ? pins.contentOriginal.sha256 : pins.originals.find(row => row.name === path)?.sha256;
  if (!expected || sha(source) !== expected) throw Error('Trusted Types requires exact A38 producer source.');
  const rules = pins.trustedTypesPolicies.flatMap(([find, replace], index) => {
    const count = content ? pins.contentPolicyCounts[index] : 1;
    if (source.split(find).length - 1 !== count) throw Error('Original policy count changed.');
    return count ? [{ scope: 'paired Aux v2 Trusted Types policy ' + find, find, replace, count }] : [];
  });
  return apply(text, rules);
}
export function transformAuxFinalVaultExclusion({ text, source }) {
  if (!pins.originals.some(row => row.sha256 === sha(source))) throw Error('Vault exclusion requires exact A38 paired source.');
  for (const { name, expectedIdentifierOccurrences } of pins.deadDeclarations)
    if (exactIdentifierCount(text, name) !== expectedIdentifierOccurrences) throw Error('Excluded declaration has unexpected consumers: ' + name);
  for (const rule of pins.rules)
    if (source.split(rule.find).length - 1 !== 1) throw Error('Original Vault exclusion source changed.');
  return apply(text, pins.rules);
}
