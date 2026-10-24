import fs from 'node:fs';
const anchors = JSON.parse(fs.readFileSync(new URL('./anchors.json', import.meta.url), 'utf8'));
const helper = fs.readFileSync(new URL('./managed-producers.js', import.meta.url), 'utf8');
export function transformAuxManagedProducers(text) {
  const changes = [];
  for (const anchor of anchors) {
    const count = text.split(anchor.find).length - 1;
    if (count !== anchor.count) throw Error(`Managed producer anchor ${anchor.name}: expected ${anchor.count}, got ${count}`);
    const replace = anchor.replace.replace('__AUX_MANAGED_SOURCE__', () => helper);
    text = text.replace(anchor.find, () => replace);
    changes.push({name: anchor.name, find: anchor.find, replace, count});
  }
  return {text, changes};
}
