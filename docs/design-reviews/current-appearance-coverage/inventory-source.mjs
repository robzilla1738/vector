// Read-only registry and source AST inventory. Never invokes a journey runner.
import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { relative } from 'node:path';
import ts from '/tmp/aux-browser-runtime-design-private-observation/node_modules/typescript/lib/typescript.js';
const root = realpathSync('/tmp/aux-browser-runtime-root-person-observer');
const { journeyRegistry, checkJourneyRegistry } = await import(root + '/tests/host/journeys/index.mjs');
const entries = await journeyRegistry(), registry = checkJourneyRegistry(entries);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sources = [];
for (const path of [...new Set(entries.map(entry => entry.path))]) {
  const bytes = readFileSync(path), source = ts.createSourceFile(path, bytes.toString('utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const calls = [], helpers = new Map();
  for (const statement of source.statements) if (ts.isImportDeclaration(statement) && statement.importClause?.namedBindings && ts.isNamedImports(statement.importClause.namedBindings)) {
    for (const binding of statement.importClause.namedBindings.elements) {
      const original = binding.propertyName?.text ?? binding.name.text;
      if (['captureHomeState', 'captureHomeJourneyState', 'captureOwnedPip'].includes(original)) helpers.set(binding.name.text, original);
    }
  }
  function enclosing(node) {
    for (let parent = node.parent; parent; parent = parent.parent) {
      if (ts.isFunctionDeclaration(parent)) return parent.name?.text ?? '<anonymous>';
      if (ts.isArrowFunction(parent) || ts.isFunctionExpression(parent)) {
        const name = parent.name?.text ?? (ts.isVariableDeclaration(parent.parent) ? parent.parent.name.getText(source) : null);
        if (name) return name;
      }
    }
    return '<module>';
  }
  const literal = node => node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : null;
  function visit(node) {
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(source), method = helpers.get(callee) ?? (ts.isPropertyAccessExpression(node.expression) ? node.expression.name.text : callee);
      if (['capture', 'capturePip', 'captureHomeState', 'captureHomeJourneyState', 'captureOwnedPip'].includes(method)) {
        const helper = method.startsWith('captureHome'), child = method === 'captureOwnedPip', name = node.arguments[helper || child ? 1 : 0], state = helper ? node.arguments[2] : child ? node.arguments[4] : null;
        calls.push({ line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, function: enclosing(node), callee, method,
          name: literal(name), nameExpression: name?.getText(source) ?? null, state: literal(state), stateExpression: state?.getText(source) ?? null,
          optionsExpression: helper ? null : node.arguments[1]?.getText(source) ?? null,
          sourcePolicy: helper ? 'conditional strict one-original-layer0 helper when appearance is enabled' : child || method === 'capturePip' ? 'requires independent child producer/ownership review' : 'direct capture; inspect actual options/native producer before counting' });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (hash(readFileSync(path)) !== hash(bytes)) throw new Error('Source changed during read-only inventory');
  sources.push({ path: relative(root, path), sha256: hash(bytes), journeys: entries.filter(entry => entry.path === path).map(entry => ({ id: entry.journey.id, runFunction: entry.run.name, features: entry.journey.features, needs: entry.journey.needs })), captures: calls });
}
const result = { schema: 1, kind: 'source-only-appearance-capture-inventory', root,
  sourceHead: execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), registry,
  sourceFiles: sources.length, directCaptureSites: sources.flatMap(item => item.captures).filter(item => item.callee.endsWith('.capture')).length,
  strictHelperSites: sources.flatMap(item => item.captures).filter(item => item.method.startsWith('captureHome')).length,
  actualNativeCapturesReviewed: 0, f21CellsQualified: 0, sources };
writeFileSync(new URL('./SOURCE-INVENTORY.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ sourceHead: result.sourceHead, registry, sourceFiles: result.sourceFiles, directCaptureSites: result.directCaptureSites, strictHelperSites: result.strictHelperSites }));
