import ts from "typescript";
import { basename, sep } from "node:path";

// Only schema construction/derivation: parse, metadata/registry and callbacks are excluded.
const methods = new Set(
  "string number boolean bigint undefined null unknown any never date literal enum object strictObject looseObject array tuple record union discriminatedUnion intersection lazy custom preprocess instanceof function optional nullable nullish default catch readonly brand strict passthrough strip partial required extend safeExtend merge pick omit and or pipe transform refine superRefine min max length int finite positive negative nonnegative nonpositive multipleOf safe url email uuid regex trim toLowerCase toUpperCase startsWith endsWith includes".split(
    " ",
  ),
);
const marker = "/* @__PURE__ */";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function vlq(value) {
  let bits = value < 0 ? -value * 2 + 1 : value * 2,
    result = "";
  do {
    const digit = bits % 32;
    bits = Math.floor(bits / 32);
    result += alphabet[digit + (bits ? 32 : 0)];
  } while (bits);
  return result;
}
/** Comments only. No source/schema rewrite, no execution of schema factories. */
export function annotateContractSchemaFactories(code, filename = "contracts.js") {
  const source = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const known = new Set(),
    namespaces = new Set(),
    positions = new Set();
  function schema(node) {
    if (ts.isIdentifier(node)) return known.has(node.text);
    if (
      !ts.isCallExpression(node) ||
      !ts.isPropertyAccessExpression(node.expression) ||
      !methods.has(node.expression.name.text)
    )
      return false;
    const receiver = node.expression.expression;
    return (ts.isIdentifier(receiver) && namespaces.has(receiver.text)) || schema(receiver);
  }
  function annotate(node) {
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) return;
    if (ts.isCallExpression(node) && schema(node)) positions.add(node.getStart(source));
    ts.forEachChild(node, annotate);
  }
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) {
      const bindings = statement.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings))
        for (const binding of bindings.elements) {
          const imported = binding.propertyName?.text ?? binding.name.text;
          if (statement.moduleSpecifier.text === "zod" && imported === "z") namespaces.add(binding.name.text);
          if (statement.moduleSpecifier.text.startsWith("./") && imported.endsWith("Schema"))
            known.add(binding.name.text);
        }
    }
    if (ts.isVariableStatement(statement))
      for (const declaration of statement.declarationList.declarations) {
        if (declaration.initializer && ts.isIdentifier(declaration.name) && schema(declaration.initializer)) {
          known.add(declaration.name.text);
          annotate(declaration.initializer);
        }
      }
  }
  if (!positions.size) return null;
  const insertions = [...positions].sort((a, b) => a - b);
  // Exact original UTF-16 positions, including insertions; build-time map only.
  let transformed = "",
    mappings = "",
    generatedColumn = 0,
    originalLine = 0,
    originalColumn = 0;
  let lastColumn = 0,
    lastLine = 0,
    previousColumn = 0,
    segmentCount = 0,
    insertion = 0;
  function map() {
    if (segmentCount++) mappings += ",";
    mappings += [generatedColumn - lastColumn, 0, originalLine - lastLine, originalColumn - previousColumn]
      .map(vlq)
      .join("");
    lastColumn = generatedColumn;
    lastLine = originalLine;
    previousColumn = originalColumn;
  }
  for (let index = 0; index <= code.length; index++) {
    if (insertions[insertion] === index) {
      map();
      transformed += marker;
      generatedColumn += marker.length;
      insertion++;
    }
    map();
    if (index === code.length) break;
    const character = code[index];
    transformed += character;
    if (character === "\n") {
      mappings += ";";
      originalLine++;
      originalColumn = generatedColumn = lastColumn = segmentCount = 0;
    } else {
      originalColumn++;
      generatedColumn++;
    }
  }
  return {
    code: transformed,
    map: {
      version: 3,
      file: basename(filename),
      sources: [filename],
      sourcesContent: [code],
      names: [],
      mappings,
    },
    annotatedCalls: positions.size,
  };
}
/** Scoped to the original compiled contract modules; never renderer/dependency code. */
export function contractSchemaPurityPlugin(directory) {
  const prefix = directory + sep;
  return {
    name: "aux-contract-schema-purity",
    apply: "build",
    transform(code, id) {
      if (!id.startsWith(prefix) || !id.endsWith(".js")) return null;
      const result = annotateContractSchemaFactories(code, id);
      return result ? { code: result.code, map: result.map } : null;
    },
  };
}
