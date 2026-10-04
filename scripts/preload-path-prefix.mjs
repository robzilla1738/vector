/** Factor only the exact literal dependency cache emitted by pinned Vite import analysis. */
export function factorPreloadPathPrefix(code, parse) {
  const ast = parse(code);
  const identifiers = new Set();
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'Identifier') identifiers.add(node.name);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) for (const child of value) visit(child);
      else if (value && typeof value === 'object') visit(value);
    }
  }
  visit(ast);
  const declarations = ast.body.filter(n => n.type === 'VariableDeclaration' && n.kind === 'const' && n.declarations.length === 1 && n.declarations[0].id.name === '__vite__mapDeps');
  if (declarations.length !== 1) return null;
  const declaration = declarations[0]; const helper = declaration.declarations[0].init;
  if (helper?.type !== 'ArrowFunctionExpression' || helper.params.length !== 3) return null;
  const assignment = helper.params[2]?.right?.right;
  const array = assignment?.right;
  if (assignment?.type !== 'AssignmentExpression' || assignment.operator !== '=' || assignment.left.type !== 'MemberExpression' || assignment.left.computed || assignment.left.object.name !== 'm' || assignment.left.property.name !== 'f' || array?.type !== 'ArrayExpression') return null;
  if (code.slice(declaration.start, array.start) !== 'const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=' || code.slice(array.end, declaration.end) !== ')))=>i.map(i=>d[i]);') return null;
  if (!array.elements.length || !array.elements.every(n => n?.type === 'Literal' && typeof n.value === 'string' && n.value.startsWith('assets/'))) return null;
  let name;
  for (const character of 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    const candidate = '$' + character;
    if (!identifiers.has(candidate)) { name = candidate; break; }
  }
  if (!name) return null;
  const replacement = '[' + array.elements.map(n => name + '+' + JSON.stringify(n.value.slice(7))).join(',') + ']';
  const prefix = `const ${name}="assets/";\n`;
  const transformed = code.slice(0, declaration.start) + prefix + code.slice(declaration.start, array.start) + replacement + code.slice(array.end);
  if (Buffer.byteLength(transformed) >= Buffer.byteLength(code)) return null;
  return { code: transformed, urls: array.elements.map(n => n.value), savedBytes: Buffer.byteLength(code) - Buffer.byteLength(transformed) };
}
export function preloadPathPrefix() {
  return {
    name: 'aux-preload-path-prefix', apply: 'build',
    generateBundle: { order: 'post', handler(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk' || output.map || !output.code.includes('__vite__mapDeps')) continue;
        const result = factorPreloadPathPrefix(output.code, this.parse.bind(this));
        if (result) output.code = result.code;
      }
    } },
  };
}
