// Authoring aid for the Aux-owned extension sources (not shipped, not run by tests). Turns a
// supplied minified block into readable source: scope-aware renames from a spec, !0/!1 → true/false,
// doc comments on top-level bindings, then prettier. The parity tests are what prove the result.
//   node deminify.mjs list  <block.js> [--prefix]            top-level bindings and their locals
//   node deminify.mjs show  <block.js> <Top,Top2>            each local of those bindings, in context
//   node deminify.mjs build <block.js> <spec.mjs> <out.js> [--prefix]
// A spec exports {module: {old: new}, locals: {Top: {old: new, 'old@2': new}}, comments: {old: text}};
// `old@N` is the Nth declaration of that short name inside Top. --prefix parses a block that starts
// inside a `var` list. Needs acorn and prettier: AUX_ACORN and AUX_PRETTIER name their entry files.
import {readFileSync, writeFileSync} from 'node:fs';
const acorn = await import(process.env.AUX_ACORN ?? 'acorn');
const prettier = await import(process.env.AUX_PRETTIER ?? 'prettier');

const [mode, file, specFile, outFile] = process.argv.slice(2);
const prefix = process.argv.includes('--prefix') ? 'var ' : '';
const source = prefix + readFileSync(file, 'utf8');
const ast = acorn.parse(source, {ecmaVersion: 'latest', sourceType: 'module', allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true});

// ---- scopes
class Scope {
  constructor(parent, node, isFunction) { this.parent = parent; this.node = node; this.isFunction = isFunction; this.bindings = new Map(); this.children = []; parent?.children.push(this); }
  functionScope() { let s = this; while (!s.isFunction) s = s.parent; return s; }
  lookup(name) { for (let s = this; s; s = s.parent) if (s.bindings.has(name)) return s.bindings.get(name); return null; }
}
const bindings = [];
const scopeOf = new Map();
function declare(scope, id, kind, top) {
  if (scope.bindings.has(id.name)) { scope.bindings.get(id.name).decls.push(id); return; }
  const b = {name: id.name, scope, kind, decls: [id], refs: [], top, newName: null, ordinal: 0};
  scope.bindings.set(id.name, b); bindings.push(b);
}
function patternIds(p, out = []) {
  if (!p) return out;
  switch (p.type) {
    case 'Identifier': out.push(p); break;
    case 'ObjectPattern': for (const prop of p.properties) patternIds(prop.type === 'RestElement' ? prop.argument : prop.value, out); break;
    case 'ArrayPattern': for (const el of p.elements) patternIds(el, out); break;
    case 'RestElement': patternIds(p.argument, out); break;
    case 'AssignmentPattern': patternIds(p.left, out); break;
  }
  return out;
}
const isFn = n => n && (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression');
// Pass 1: build scopes and declarations. `top` = name of the enclosing top-level binding.
function build(node, scope, top) {
  if (!node || typeof node.type !== 'string') return;
  const visitChildren = (n, s, t) => { for (const key of Object.keys(n)) { if (key === 'type' || key === 'start' || key === 'end') continue; const v = n[key]; if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && build(c, s, t)); else if (v && typeof v.type === 'string') build(v, s, t); } };
  if (node.type === 'Program') {
    // hoist top-level
    for (const st of node.body) hoistDecls(st, scope, null, true);
    for (const st of node.body) {
      if (st.type === 'VariableDeclaration') for (const d of st.declarations) { buildPattern(d.id, scope, d.id.name); build(d.init, scope, d.id.name ?? '*var'); }
      else build(st, scope, topNameOf(st));
    }
    return;
  }
  if (isFn(node)) {
    if (node.type === 'FunctionDeclaration') { /* declared by hoisting */ }
    const fs = new Scope(scope, node, true); scopeOf.set(node, fs);
    if (node.type === 'FunctionExpression' && node.id) declare(fs, node.id, 'fname', top);
    for (const p of node.params) for (const id of patternIds(p)) declare(fs, id, 'param', top);
    for (const p of node.params) buildPattern(p, fs, top);
    if (node.body.type === 'BlockStatement') { for (const st of node.body.body) hoistDecls(st, fs, top, true); for (const st of node.body.body) build(st, fs, top); }
    else build(node.body, fs, top);
    return;
  }
  if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
    if (node.type === 'ClassExpression' && node.id) { const cs = new Scope(scope, node, false); declare(cs, node.id, 'class', top); visitChildren({...node, id: null}, cs, top); return; }
    visitChildren({...node, id: null}, scope, top); return;
  }
  if (node.type === 'BlockStatement' || node.type === 'StaticBlock') {
    const bs = new Scope(scope, node, false); scopeOf.set(node, bs);
    for (const st of node.body) hoistDecls(st, bs, top, false);
    for (const st of node.body) build(st, bs, top);
    return;
  }
  if (node.type === 'ForStatement' || node.type === 'ForInStatement' || node.type === 'ForOfStatement') {
    const bs = new Scope(scope, node, false);
    const init = node.init ?? node.left;
    if (init && init.type === 'VariableDeclaration' && init.kind !== 'var') for (const d of init.declarations) for (const id of patternIds(d.id)) declare(bs, id, init.kind, top);
    visitChildren(node, bs, top); return;
  }
  if (node.type === 'SwitchStatement') {
    build(node.discriminant, scope, top);
    const bs = new Scope(scope, node, false);
    for (const c of node.cases) for (const st of c.consequent) hoistDecls(st, bs, top, false);
    for (const c of node.cases) { if (c.test) build(c.test, bs, top); for (const st of c.consequent) build(st, bs, top); }
    return;
  }
  if (node.type === 'CatchClause') {
    const cs = new Scope(scope, node, false);
    if (node.param) { for (const id of patternIds(node.param)) declare(cs, id, 'catch', top); buildPattern(node.param, cs, top); }
    build(node.body, cs, top); return;
  }
  if (node.type === 'VariableDeclaration') { for (const d of node.declarations) { buildPattern(d.id, scope, top); build(d.init, scope, top); } return; }
  if (node.type === 'ImportDeclaration' || node.type === 'ExportNamedDeclaration' && !node.declaration) return;
  visitChildren(node, scope, top);
}
// Default values and computed keys inside patterns are expressions.
function buildPattern(p, scope, top) {
  if (!p) return;
  if (p.type === 'AssignmentPattern') { buildPattern(p.left, scope, top); build(p.right, scope, top); }
  else if (p.type === 'ObjectPattern') for (const prop of p.properties) { if (prop.type === 'RestElement') buildPattern(prop.argument, scope, top); else { if (prop.computed) build(prop.key, scope, top); buildPattern(prop.value, scope, top); } }
  else if (p.type === 'ArrayPattern') for (const el of p.elements) buildPattern(el, scope, top);
  else if (p.type === 'RestElement') buildPattern(p.argument, scope, top);
}
function topNameOf(st) {
  if (st.type === 'FunctionDeclaration' || st.type === 'ClassDeclaration') return st.id?.name;
  if (st.type === 'VariableDeclaration') return '*var';
  return '*stmt';
}
function hoistDecls(st, scope, top, isFunctionBody) {
  const fscope = scope.functionScope();
  const walkVar = n => {
    if (!n || typeof n.type !== 'string' || isFn(n) && n !== st || n.type === 'ClassDeclaration' || n.type === 'ClassExpression') {
      if (n && n.type === 'FunctionDeclaration' && n === st) {} else return;
    }
    if (n.type === 'VariableDeclaration' && n.kind === 'var') for (const d of n.declarations) for (const id of patternIds(d.id)) declare(fscope, id, 'var', top ?? id.name);
    for (const key of Object.keys(n)) { if (key === 'type') continue; const v = n[key]; if (Array.isArray(v)) v.forEach(walkVar); else if (v && typeof v.type === 'string' && !isFn(v)) walkVar(v); }
  };
  if (st.type === 'FunctionDeclaration') declare(scope, st.id, 'function', top ?? st.id.name);
  else if (st.type === 'ClassDeclaration') declare(scope, st.id, 'class', top ?? st.id.name);
  else if (st.type === 'VariableDeclaration' && st.kind !== 'var') for (const d of st.declarations) for (const id of patternIds(d.id)) declare(scope, id, st.kind, top ?? id.name);
  else if (st.type === 'ExportNamedDeclaration' && st.declaration) hoistDecls(st.declaration, scope, top, isFunctionBody);
  if (st.type !== 'FunctionDeclaration') walkVar(st);
}

// Pass 2: references.
const declIds = new Set();
function refs(node, parent, scope, key) {
  if (!node || typeof node.type !== 'string') return;
  if (scopeOf.has(node)) scope = scopeOf.get(node);
  else if (['ForStatement', 'ForInStatement', 'ForOfStatement', 'SwitchStatement', 'CatchClause'].includes(node.type) || node.type === 'ClassExpression' && node.id)
    scope = scope.children.find(c => c.node === node) ?? scope;
  if (node.type === 'Identifier') {
    if (parent) {
      if ((parent.type === 'MemberExpression') && key === 'property' && !parent.computed) return;
      if ((parent.type === 'Property' || parent.type === 'MethodDefinition' || parent.type === 'PropertyDefinition') && key === 'key' && !parent.computed) return;
      if (parent.type === 'LabeledStatement' || parent.type === 'BreakStatement' || parent.type === 'ContinueStatement') return;
      if (parent.type === 'ImportSpecifier' || parent.type === 'ExportSpecifier' || parent.type === 'ImportDefaultSpecifier' || parent.type === 'ImportNamespaceSpecifier') { if (key === 'local' && parent.type === 'ExportSpecifier') {} else return; }
      if (parent.type === 'MetaProperty') return;
    }
    const b = scope.lookup(node.name);
    if (b && !b.decls.includes(node)) b.refs.push(node);
    return;
  }
  for (const k of Object.keys(node)) {
    if (k === 'type' || k === 'start' || k === 'end') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && refs(c, node, scope, k));
    else if (v && typeof v.type === 'string') refs(v, node, scope, k);
  }
}
const program = new Scope(null, ast, true);
scopeOf.set(ast, program);
build(ast, program, null);
refs(ast, null, program, null);

// Ordinals per (top, name) in source order.
const counters = new Map();
for (const b of [...bindings].sort((a, b) => a.decls[0].start - b.decls[0].start)) {
  const k = `${b.top}|${b.name}`; counters.set(k, (counters.get(k) ?? 0) + 1); b.ordinal = counters.get(k);
}

if (mode === 'show') {
  const want = new Set(specFile.split(','));
  for (const b of [...bindings].sort((a, b) => a.decls[0].start - b.decls[0].start)) {
    if (!want.has(b.top) || b.scope === program) continue;
    const at = b.decls[0].start;
    console.log(`${b.top} ${b.name}${b.ordinal > 1 ? '@' + b.ordinal : ''} :: ${source.slice(Math.max(0, at - 25), at + 35).replace(/\n/g, ' ')}`);
  }
  process.exit(0);
}
if (mode === 'list') {
  const byTop = new Map();
  for (const b of bindings) { if (!byTop.has(b.top)) byTop.set(b.top, []); byTop.get(b.top).push(b); }
  for (const [top, list] of byTop) {
    console.log(`== ${top}`);
    console.log('   ' + list.sort((a, b) => a.decls[0].start - b.decls[0].start).map(b => `${b.name}${b.ordinal > 1 ? '@' + b.ordinal : ''}:${b.kind[0]}`).join(' '));
  }
  process.exit(0);
}

// ---- build
const spec = (await import(new URL(specFile, `file://${process.cwd()}/`).href)).default;
// spec: {module: {old: new}, locals: {Top: {old: new, 'old@2': new}}, comments: {name: text}}
for (const b of bindings) {
  if (b.scope === program) { if (spec.module?.[b.name]) b.newName = spec.module[b.name]; continue; }
  const local = spec.locals?.[b.top] ?? {};
  const pick = local[`${b.name}@${b.ordinal}`] ?? local[b.name];
  if (pick) b.newName = pick;
}
// Capture check: a new name must not be declared in a scope between any reference and the binding,
// nor be a name referenced (resolving elsewhere) inside the binding's scope.
const problems = [];
for (const b of bindings) {
  if (!b.newName || b.newName === b.name) continue;
  const clash = b.scope.bindings.get(b.newName);
  if (clash && clash !== b && !(clash.newName && clash.newName !== b.newName)) problems.push(`${b.top}: ${b.name}→${b.newName} clashes in its scope`);
  // any other binding visible in b.scope's subtree with the same final name
  const finalName = x => x.newName ?? x.name;
  for (const other of bindings) {
    if (other === b || finalName(other) !== b.newName) continue;
    // other is in an enclosing scope of b, and b's subtree references other → capture
    const encloses = (() => { for (let s = b.scope; s; s = s.parent) if (s === other.scope) return true; return false; })();
    const inside = node => node.start >= b.scope.node.start && node.end <= b.scope.node.end;
    if (encloses && other.refs.some(inside)) problems.push(`${b.top}: ${b.name}→${b.newName} would capture an outer ${other.name}`);
    // other is inside b's scope subtree and shadows b where b is referenced
    const otherInside = (() => { for (let s = other.scope; s; s = s.parent) if (s === b.scope) return s !== other.scope || true; return false; })();
    if (otherInside && other.scope !== b.scope && b.refs.some(r => r.start >= other.scope.node.start && r.end <= other.scope.node.end)) problems.push(`${b.top}: ${b.name}→${b.newName} shadowed by inner ${other.name}`);
  }
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }

// Edits
const edits = [];
const shorthandParents = new Map();
(function collect(node, parent, key) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'Property' && node.shorthand) shorthandParents.set(node.value.type === 'AssignmentPattern' ? node.value.left : node.value, node);
  for (const k of Object.keys(node)) { if (k === 'type') continue; const v = node[k]; if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && collect(c, node, k)); else if (v && typeof v.type === 'string') collect(v, node, k); }
})(ast);
for (const b of bindings) {
  if (!b.newName || b.newName === b.name) continue;
  for (const id of [...b.decls, ...b.refs]) {
    const sh = shorthandParents.get(id);
    if (sh) edits.push([id.start, id.end, `${b.name}: ${b.newName}`]);
    else edits.push([id.start, id.end, b.newName]);
  }
}
// Property `key: value` where value is renamed to the key name → shorthand.
(function collapse(node) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'Property' && !node.shorthand && !node.computed && node.key.type === 'Identifier' && node.kind === 'init' && !node.method) {
    const v = node.value.type === 'AssignmentPattern' ? node.value.left : node.value;
    const b = v.type === 'Identifier' && bindings.find(x => x.newName === node.key.name && (x.decls.includes(v) || x.refs.includes(v)));
    if (b) {
      // drop "key:" leaving the renamed value
      edits.push([node.key.start, v.start, '']);
    }
  }
  for (const k of Object.keys(node)) { if (k === 'type') continue; const v = node[k]; if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && collapse(c)); else if (v && typeof v.type === 'string') collapse(v); }
})(ast);
// !0 / !1
(function bools(node) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'UnaryExpression' && node.operator === '!' && node.argument.type === 'Literal' && (node.argument.value === 0 || node.argument.value === 1))
    edits.push([node.start, node.end, (/[\w$]/.test(source[node.start - 1] ?? '') ? ' ' : '') + (node.argument.value === 0 ? 'true' : 'false')]);
  for (const k of Object.keys(node)) { if (k === 'type') continue; const v = node[k]; if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && bools(c)); else if (v && typeof v.type === 'string') bools(v); }
})(ast);
// Comments before top-level declarators / function declarations, by original name.
for (const [name, text] of Object.entries(spec.comments ?? {})) {
  const b = program.bindings.get(name);
  if (!b) { console.error('no binding for comment', name); process.exit(1); }
  const id = b.decls[0];
  // find statement/declarator start: for function decl, the 'function' keyword; for var declarator, the id
  let at = id.start;
  const fnStart = source.lastIndexOf('function', id.start);
  if (b.kind === 'function' && source.slice(fnStart, id.start).trim() === 'function') at = source.slice(fnStart - 6, fnStart) === 'async ' ? fnStart - 6 : fnStart;
  edits.push([at, at, `/** ${text} */\n`]);
}
edits.sort((a, b) => b[0] - a[0] || b[1] - a[1]);
let out = source;
let last = Infinity;
for (const [s, e, text] of edits) {
  if (e > last) { console.error('overlapping edits at', s, e); process.exit(1); }
  out = out.slice(0, s) + text + out.slice(e);
  last = s;
}
let formatted = await prettier.format(out, {parser: 'babel', singleQuote: true, printWidth: 120, trailingComma: 'all', bracketSpacing: false, arrowParens: 'avoid'});
if (prefix) {
  if (!formatted.startsWith('var ')) { console.error('prefix lost'); process.exit(1); }
  formatted = formatted.slice(4);
}
writeFileSync(outFile, (spec.header ?? '') + formatted.replace(/;\n$/, spec.keepFinalSemicolon === false ? '\n' : ';\n'));
console.log('wrote', outFile, formatted.length);
