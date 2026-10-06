import { minify } from "terser";

/** Fresh options keep Terser's bookkeeping local to one rendered chunk. */
export function conservativeRendererMinifyOptions() {
  return {
    module: true,
    ecma: 2024,
    keep_fnames: true,
    keep_classnames: true,
    mangle: { properties: false, keep_fnames: true, keep_classnames: true },
    compress: {
      keep_fargs: true,
      pure_getters: false,
      unsafe: false,
      unsafe_arrows: false,
      unsafe_comps: false,
      unsafe_Function: false,
      unsafe_math: false,
      unsafe_methods: false,
      unsafe_proto: false,
      unsafe_regexp: false,
      unsafe_symbols: false,
      unsafe_undefined: false,
      passes: 3,
    },
    format: { comments: "some" },
    sourceMap: false,
  };
}

function chunkGraph(ast, code) {
  const imports = [],
    exports = [],
    dynamic = [],
    preloads = [];
  let closed = true;
  const literal = (node) => node?.type === "Literal" && typeof node.value === "string";
  const name = (node) => node?.name ?? node?.value;
  function bindingNames(node) {
    if (node.type === "Identifier") return [node.name];
    if (node.type === "RestElement") return bindingNames(node.argument);
    if (node.type === "AssignmentPattern") return bindingNames(node.left);
    if (node.type === "ArrayPattern")
      return node.elements.flatMap((item) => (item ? bindingNames(item) : []));
    if (node.type === "ObjectPattern")
      return node.properties.flatMap((item) => bindingNames(item.value ?? item.argument));
    closed = false;
    return [];
  }
  function attributes(node) {
    return (node.attributes ?? []).map((item) => [name(item.key), name(item.value)]);
  }
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (node.type === "ImportDeclaration") {
      imports.push({
        source: node.source.value,
        names: node.specifiers.map((item) => ({
          kind: item.type,
          name:
            item.type === "ImportSpecifier"
              ? name(item.imported)
              : item.type === "ImportDefaultSpecifier"
                ? "default"
                : "*",
        })),
        attributes: attributes(node),
      });
    } else if (node.type === "ExportNamedDeclaration") {
      const names = node.declaration
        ? node.declaration.type === "VariableDeclaration"
          ? node.declaration.declarations.flatMap((item) => bindingNames(item.id))
          : [node.declaration.id.name]
        : node.specifiers.map((item) => name(item.exported));
      exports.push({
        source: node.source?.value ?? null,
        names,
        external: node.source ? node.specifiers.map((item) => name(item.local)) : null,
        all: false,
        attributes: attributes(node),
      });
    } else if (node.type === "ExportDefaultDeclaration") {
      exports.push({ source: null, names: ["default"], external: null, all: false, attributes: [] });
    } else if (node.type === "ExportAllDeclaration") {
      exports.push({
        source: node.source.value,
        names: [node.exported ? name(node.exported) : "*"],
        external: null,
        all: true,
        attributes: attributes(node),
      });
    } else if (node.type === "ImportExpression") {
      if (!literal(node.source) || node.options != null) closed = false;
      dynamic.push(literal(node.source) ? node.source.value : code.slice(node.source.start, node.source.end));
    } else if (
      node.type === "ArrayExpression" &&
      node.elements.length &&
      node.elements.every(literal) &&
      node.elements.some((item) => /\.(?:js|css)$/.test(item.value))
    ) {
      preloads.push(node.elements.map((item) => item.value));
    }
    for (const [key, child] of Object.entries(node)) {
      if (key === "parent") continue;
      if (Array.isArray(child)) child.forEach(visit);
      else if (child && typeof child === "object") visit(child);
    }
  }
  visit(ast);
  return closed ? { imports, exports, dynamic, preloads } : null;
}

/** Refuse changed load records, computed import URLs and invalid candidate syntax. */
export function chooseConservativeRendererChunk(original, candidate, parse) {
  if (
    typeof candidate !== "string" ||
    Buffer.byteLength(candidate, "utf8") >= Buffer.byteLength(original, "utf8")
  )
    return original;
  const before = chunkGraph(parse(original), original);
  if (!before) return original;
  let after;
  try {
    after = chunkGraph(parse(candidate), candidate);
  } catch {
    return original;
  }
  return after && JSON.stringify(before) === JSON.stringify(after) ? candidate : original;
}

/** Bounded reparse reduction; every accepted intermediate is independently checked. */
export async function minifyConservativeRendererChunk(code, parse, warn, minifyCode = minify) {
  let current = code;
  for (let round = 0; round < 2; round++) {
    let result;
    try {
      result = await minifyCode(current, conservativeRendererMinifyOptions());
    } catch (reason) {
      parse(current);
      warn({
        code: "AUX_MINIFY_RETAINED_ORIGINAL",
        message: "Conservative minification retained the last validated chunk: " + String(reason),
      });
      break;
    }
    const selected = chooseConservativeRendererChunk(current, result.code, parse);
    if (selected === current) break;
    current = selected;
  }
  return current;
}

/** Runs after esbuild's normal render hook and before Rollup computes asset hashes. */
export function conservativeRendererMinify() {
  return {
    name: "aux-conservative-renderer-minify",
    apply: "build",
    enforce: "post",
    renderChunk: {
      order: "post",
      async handler(code, _chunk, outputOptions) {
        if (outputOptions.format !== "es") return null;
        const selected = await minifyConservativeRendererChunk(
          code,
          (source) => this.parse(source),
          (warning) => this.warn(warning),
        );
        return selected === code ? null : { code: selected, map: null };
      },
    },
  };
}
