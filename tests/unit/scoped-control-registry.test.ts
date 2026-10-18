import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { expect, it } from "vitest";
import { COMMANDS } from "@aux/contracts";

it("routes every literal preference/model control through a registered scoped command", () => {
  const root = fileURLToPath(new URL("../../apps/shell/src/", import.meta.url));
  const commands = new Map(COMMANDS.map((command) => [command.id as string, command]));
  const missing: string[] = [];
  const hooks = new Set(["usePreferenceCommand", "useModelMountedCommand", "useModelDraftCommand"]);
  for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !/\.tsx?$/.test(entry.name) || /\.test\./.test(entry.name)) continue;
    const path = join(entry.parentPath, entry.name);
    const source = ts.createSourceFile(
      path,
      readFileSync(path, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const inspect = (node: ts.Node) => {
      let value: ts.Expression | undefined;
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && hooks.has(node.expression.text))
        value = node.arguments[0];
      if (ts.isJsxAttribute(node) && node.name.getText(source) === "command" && node.initializer) {
        const opening = node.parent.parent;
        if (
          (ts.isJsxOpeningElement(opening) || ts.isJsxSelfClosingElement(opening)) &&
          opening.tagName.getText(source) === "PreferenceAction"
        )
          value = ts.isJsxExpression(node.initializer) ? node.initializer.expression : node.initializer;
      }
      if (value && ts.isStringLiteral(value)) {
        const definition = commands.get(value.text);
        if (!definition || !("dispatch" in definition) || definition.dispatch !== "scoped")
          missing.push(`${relative(root, path)}: ${value.text}`);
      }
      ts.forEachChild(node, inspect);
    };
    inspect(source);
  }
  expect(missing).toEqual([]);
});
