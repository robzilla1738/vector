import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { expect, it } from "vitest";

// Chromium's WebUI accessibility checks reject names on generic containers.
// Keep this gate alongside renderer tests so a new surface cannot crash its host.
it("assigns a nameable role to labelled generic renderer containers", () => {
  const root = join(import.meta.dirname, "components");
  const invalid: string[] = [];
  for (const name of readdirSync(root).filter((name) => name.endsWith(".tsx") && !name.includes(".test."))) {
    const source = ts.createSourceFile(
      name,
      readFileSync(join(root, name), "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function visit(node: ts.Node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(source);
        const attrs = node.attributes.properties
          .filter(ts.isJsxAttribute)
          .map((attr) => attr.name.getText(source));
        if (
          ["div", "span", "pre", "p", "strong"].includes(tag) &&
          attrs.some((attr) => attr === "aria-label" || attr === "aria-labelledby") &&
          !attrs.includes("role")
        ) {
          invalid.push(`${name}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  expect(invalid).toEqual([]);
});
