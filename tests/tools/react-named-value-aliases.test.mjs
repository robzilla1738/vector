import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { resolveConfig } from "vite";
import react from "../../apps/shell/node_modules/@vitejs/plugin-react/dist/index.js";
import { reactNamedValueAliases } from "../../scripts/react-named-value-aliases.mjs";
const require = createRequire(new URL("../../apps/shell/package.json", import.meta.url));
const viteRequire = createRequire(require.resolve("vite/package.json"));
const { transformSync } = viteRequire("esbuild");
const { parseAst } = await import(pathToFileURL(viteRequire.resolve("rollup/parseAst")));
const React = require("react");
function evaluate(code, imports = require) {
  const module = { exports: {} };
  new Function("require", "module", "exports", code)(imports, module, module.exports);
  return module.exports;
}
async function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), "aux-react-bindings-"));
  try {
    const app = join(root, "src"),
      foreign = join(root, "foreign");
    mkdirSync(app);
    mkdirSync(foreign);
    const file = join(app, "component.tsx"),
      outside = join(foreign, "component.tsx");
    writeFileSync(file, "");
    writeFileSync(outside, "");
    const plugin = reactNamedValueAliases(app);
    const source = "@aux/react-named-values";
    const values = evaluate(
      transformSync(plugin.load(plugin.resolveId(source)), { format: "cjs", target: "chrome154" }).code,
    );
    return await run({ root, app, file, outside, plugin, source, values });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
test("every closed named export binds the exact installed React value without a wrapper", () =>
  fixture(({ plugin, values }) => {
    assert.ok(Object.keys(values).length > 30);
    for (const [name, value] of Object.entries(values)) assert.equal(value, React[name], name);
    assert.equal(plugin.apply, "build");
    assert.equal(plugin.enforce, "post");
    assert.equal(plugin.resolveId("react"), undefined);
    assert.equal(plugin.resolveId("@aux/react-named-values/foreign"), undefined);
  }));
test("app named imports retain aliases and statement evaluation source exactly", () =>
  fixture(({ plugin, file }) => {
    const original = 'import { useState as state, useEffect } from "react";\nconst kept = "react"; effect();';
    const result = plugin.transform.call({ parse: parseAst }, original, file).code;
    assert.equal(result, original.replace('from "react"', 'from "@aux/react-named-values"'));
    assert.equal(plugin.transform.call({ parse: parseAst }, 'import("react");', file), undefined);
  }));
test("default, namespace, mixed, unknown named and foreign imports stay untouched", () =>
  fixture(({ plugin, file }) => {
    for (const code of [
      'import React from "react";',
      'import * as React from "react";',
      'import React, { useState } from "react";',
      'import { futureUnsupported } from "react";',
      'import { useState, futureUnsupported } from "react";',
      'import "react";',
      'import { useState } from "other";',
    ])
      assert.equal(plugin.transform.call({ parse: parseAst }, code, file), undefined, code);
  }));
test("dependencies, sibling-prefix paths, virtual IDs and symlink escape cannot be retargeted", () =>
  fixture(({ plugin, app, outside, file }) => {
    const code = 'import { useState } from "react";';
    const escaped = join(app, "escaped.tsx");
    symlinkSync(outside, escaped);
    for (const id of [outside, escaped, "\0virtual", file + ".css", file + "/missing.tsx"])
      assert.equal(
        plugin.transform.call(
          {
            parse: () => {
              throw new Error("must not parse");
            },
          },
          code,
          id,
        ),
        undefined,
        id,
      );
    const qualified = plugin.transform.call({ parse: parseAst }, code, file + "?original=1");
    assert.match(qualified.code, /@aux\/react-named-values/);
  }));
test("Vite serve omits the named-value transform and original imports remain original", async () =>
  fixture(async ({ plugin }) => {
    const serve = await resolveConfig(
      { configFile: false, plugins: [plugin, react()], logLevel: "silent" },
      "serve",
      "development",
    );
    assert.equal(
      serve.plugins.some((p) => p.name === plugin.name),
      false,
    );
  }));
test("actual installed hooks preserve state/context/memo/ref and identical server markup", () =>
  fixture(({ plugin, file, values, source }) => {
    const input = `import { useState, useMemo, useRef, useContext, createElement } from "react";
    export default function Surface({context}) {
      const [value] = useState("original");
      const ref = useRef(value);
      const memo = useMemo(() => value + " memo", [value]);
      const contextValue = useContext(context);
      return createElement("section", {"data-value":ref.current}, memo + contextValue);
    }`;
    const original = transformSync(input, { format: "cjs", target: "chrome154" }).code;
    const rewritten = plugin.transform.call({ parse: parseAst }, original, file);
    // Import rewriting runs before Rollup: esbuild's CJS conversion is only for execution here.
    const esm = transformSync(input, { format: "esm", target: "chrome154" }).code;
    const adapted = plugin.transform.call({ parse: parseAst }, esm, file).code;
    const baseline = evaluate(original).default;
    const component = evaluate(transformSync(adapted, { format: "cjs", target: "chrome154" }).code, (id) =>
      id === source ? values : require(id),
    ).default;
    assert.equal(rewritten, undefined);
    const context = React.createContext(" context");
    const { renderToStaticMarkup } = require("react-dom/server");
    assert.equal(
      renderToStaticMarkup(React.createElement(component, { context })),
      renderToStaticMarkup(React.createElement(baseline, { context })),
    );
  }));
test("named imports are snapshots of original CJS exports, never a mutable namespace proxy", async () =>
  fixture(async ({ values }) => {
    const originalNamespace = await import(pathToFileURL(require.resolve("react")));
    const original = React.useState;
    const replacement = () => {
      throw new Error("foreign replacement");
    };
    try {
      React.useState = replacement;
      assert.equal(originalNamespace.useState, original);
      assert.equal(values.useState, original);
    } finally {
      React.useState = original;
    }
  }));
test("multiple imports and Unicode offsets preserve all original evaluation code", () =>
  fixture(({ plugin, file }) => {
    const original =
      'const emoji="🟢";\nimport { useState as originalState } from "react";\nimport { useEffect } from "react";\noriginalEffect(emoji);';
    const adapted = plugin.transform.call({ parse: parseAst }, original, file).code;
    assert.equal(adapted, original.replaceAll('from "react"', 'from "@aux/react-named-values"'));
  }));
