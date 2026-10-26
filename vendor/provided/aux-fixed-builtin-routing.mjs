import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

const entry = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/runtime/fixed-builtins/entry.anchors.json', import.meta.url), 'utf8'));
const originals = new Map([
  ['index.mjs', '48af998738fb6d2fc30cb8d5b2e9de03cb04ab7d8563ebdaa5fe8100944fc514'],
  ['aux-native-entry.mjs', entry.inputSha256],
]);
const route = "function auxIsFixedUtilityCommand(command){return process.platform==='darwin'&&['generate-thumbnail','list-open-apps','app-icons','copy-file','open-with'].includes(command)}\nfunction auxNativeCommandRoute(command){if(auxIsFixedUtilityCommand(command))return{binding:loadAuxMacUtilityBinding(),bindingPath:null,error:auxMacUtilityBindingError};return{binding:loadBinding(),bindingPath:loadedBindingPath,error:bindingLoadError}}";

export function transformAuxFixedBuiltinRouting({path, text, source}) {
  if (!originals.has(path) || createHash('sha256').update(source).digest('hex') !== originals.get(path))
    throw Error('Fixed builtin routing requires the exact paired A51 source.');
  const rules = entry.anchors.map(rule => ({...rule}));
  rules[3].after = route;
  if (path === 'index.mjs') {
    // The supplied index already uses its utility availability probe correctly.
    rules.splice(2, 1);
    rules[2].before = "function auxNativeCommandRoute(command){if(process.platform==='darwin'&&['generate-thumbnail','list-open-apps','app-icons','copy-file','open-with'].includes(command))return{binding:loadAuxMacUtilityBinding(),bindingPath:path.join(__auxDaemonResources,'native/aux-macos-utilities.cjs'),error:auxMacUtilityBindingError};return{binding:loadBinding(),bindingPath:loadedBindingPath,error:bindingLoadError}}";
  }
  const anchors = [];
  for (const rule of rules) {
    if (source.split(rule.before).length - 1 !== rule.count || text.split(rule.before).length - 1 !== rule.count)
      throw Error('Fixed builtin route count drift: ' + path);
    text = text.replace(rule.before, () => rule.after);
    anchors.push({kind: 'integration', find: rule.before, replace: rule.after, count: rule.count});
  }
  return {text, anchors};
}
