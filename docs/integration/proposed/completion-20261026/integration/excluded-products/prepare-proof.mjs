// Static source-only closure proof. No product/native/credential operation.
import { parse } from '/Users/rcourson/Documents/Vibe/web/node_modules/.pnpm/acorn@8.19.0/node_modules/acorn/dist/acorn.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const sha = value => createHash('sha256').update(value).digest('hex');
const root = '/Users/rcourson/Documents/Vibe/web';
const accepted = root + '/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/';
function inspect(text) {
  const ast = parse(text, { ecmaVersion: 'latest', sourceType: 'module' });
  const flat = ast.body.flatMap(node => node.type === 'VariableDeclaration' ? node.declarations : [node]);
  const named = name => { const values = flat.filter(node => node.id?.name === name); if (values.length !== 1) throw Error('One exact declaration required: ' + name); return values[0]; };
  const first = named('getAppleCredentialExchangeSessionStoreBackend'), last = named('init_apple_credential_exchange');
  const lastStatement = ast.body.find(node => node.start <= last.start && node.end >= last.end);
  const desktop = named('init_desktop_routes'), router = named('init_routes$8'), windows = named('materializeEmbeddedBinding');
  const helperRange = [first.start, lastStatement.end];
  const cutRanges = [helperRange, [desktop.init.start, desktop.init.end], [router.init.start, router.init.end]];
  const symbols = new Set(flat.filter(node => node.start >= first.start && node.end <= lastStatement.end).map(node => node.id?.name).filter(Boolean));
  const outside = [];
  function walk(node, parent, key) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { for (const child of node) walk(child, parent, key); return; }
    if (node.type === 'Identifier' && symbols.has(node.name) && !cutRanges.some(([start, end]) => node.start >= start && node.end <= end)) {
      const property = parent && ((parent.type === 'MemberExpression' && key === 'property' && !parent.computed) || (parent.type === 'Property' && key === 'key' && !parent.computed && !parent.shorthand));
      if (!property) outside.push({ name: node.name, position: node.start });
    }
    for (const [name, child] of Object.entries(node)) if (child && typeof child === 'object') walk(child, node, name);
  }
  walk(ast);
  if (outside.length) throw Error('Excluded helper has remaining consumers: ' + JSON.stringify(outside));
  const rules = [
    { scope: 'disconnected Windows SEA-only materializer', find: text.slice(windows.start, windows.end), replace: '' },
    { scope: 'unused SEA asset declaration', find: 'packageRoot,EMBEDDED_BINDING_ASSET,productVariant', replace: 'packageRoot,productVariant' },
    { scope: 'unused SEA asset assignment', find: 'EMBEDDED_BINDING_ASSET=`aside-native.node`,', replace: '' },
    { scope: 'unregistered Vault router construction', find: text.slice(router.init.start, router.init.end), replace: '__esmMin((()=>{}))' },
    { scope: 'unregistered Vault router declaration', find: 'passwordManagerRouter,init_routes$8=', replace: 'init_routes$8=' },
    { scope: 'disconnected Vault desktop/importer router initializer', find: text.slice(desktop.init.start, desktop.init.end), replace: '__esmMin((()=>{}))' },
    { scope: 'closed Apple credential-exchange helper/sessionstore subgraph', find: text.slice(...helperRange), replace: '' },
  ];
  return { rules, proof: { helperSymbols: [...symbols], externalHelperIdentifierReferences: outside, windowsMaterializerIdentifierOccurrences: (text.match(/\bmaterializeEmbeddedBinding\b/g) ?? []).length, passwordManagerRouterIdentifierOccurrences: (text.match(/\bpasswordManagerRouter\b/g) ?? []).length, productRouterRegistrationPresent: text.includes('passwordManager:passwordManagerRouter') } };
}
let rules;
const files = [];
for (const name of ['index.mjs', 'aux-native-entry.mjs']) {
  const original = readFileSync(accepted + name, 'utf8'), currentPath = root + '/out/completion-20261026-paired-source-a5/' + name, current = readFileSync(currentPath, 'utf8');
  const source = inspect(original), successor = inspect(current);
  if (JSON.stringify(source.rules) !== JSON.stringify(successor.rules)) throw Error('Reviewed source ranges changed through current composition');
  if (rules && JSON.stringify(rules) !== JSON.stringify(source.rules)) throw Error('Paired excluded source differs');
  if (source.proof.windowsMaterializerIdentifierOccurrences !== 1 || source.proof.passwordManagerRouterIdentifierOccurrences !== 2 || source.proof.productRouterRegistrationPresent) throw Error('Excluded-product consumer proof changed');
  rules = source.rules;
  files.push({ name, original: accepted + name, originalSha256: sha(original), current: currentPath, currentSha256: sha(current), proof: successor.proof });
}
writeFileSync(new URL('./source-pins.json', import.meta.url), JSON.stringify({ format: 'aux.excluded-products.pruning.v1', parser: 'acorn8.19.0', files, rules }, null, 2) + '\n');
console.log(JSON.stringify({ pairedFiles: files.length, removedHelperSymbols: files[0].proof.helperSymbols.length, countedRules: rules.length, productExecuted: false }));
