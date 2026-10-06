import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { resolveConfig } from "vite";
import react from "../../apps/shell/node_modules/@vitejs/plugin-react/dist/index.js";
import { reactConstructorAliases } from "../../scripts/react-constructor-aliases.mjs";

const require = createRequire(new URL("../../apps/shell/package.json", import.meta.url));
const { transformSync } = createRequire(require.resolve("vite/package.json"))("esbuild");
const React = require("react");
const runtime = require("react/jsx-runtime");
const plugin = reactConstructorAliases();
function evaluate(code, imports = require) {
  const module = { exports: {} };
  new Function("require", "module", "exports", code)(imports, module, module.exports);
  return module.exports;
}
function adapter(id) {
  const source = plugin.load(plugin.resolveId(id));
  return evaluate(transformSync(source, { format: "cjs", target: "chrome154" }).code);
}
const aliases = adapter("@aux/react-constructors/jsx-runtime");
const development = adapter("@aux/react-constructors/jsx-dev-runtime");
const elements = adapter("@aux/react-constructors");
function compiled(source, adapted, jsxDev = false) {
  const result = transformSync(source, {
    loader: "tsx",
    format: "cjs",
    target: "chrome154",
    jsx: "automatic",
    jsxDev,
    jsxImportSource: adapted ? "@aux/react-constructors" : "react",
  });
  return {
    code: result.code,
    render: evaluate(result.code, (id) => {
      if (id === "@aux/react-constructors") return elements;
      if (id === "@aux/react-constructors/jsx-runtime") return aliases;
      if (id === "@aux/react-constructors/jsx-dev-runtime") return development;
      return require(id);
    }).default,
  };
}
function context() {
  const effects = [];
  const ref = { current: null };
  const onClick = () => effects.push("clicked");
  const mark = (name, value) => (effects.push(name), value);
  function Type() {}
  Type.defaultProps = { optional: "default", overridden: "default" };
  const spread = {
    get title() {
      effects.push("spread-title");
      return "title";
    },
    key: "spread-key",
    ref,
    onClick,
  };
  return { effects, ref, onClick, mark, Type, spread };
}
function equivalent(source, verify = () => {}) {
  const original = compiled(source, false),
    adapted = compiled(source, true);
  const a = context(),
    b = context();
  const left = original.render(a),
    right = adapted.render(b);
  function canonical(value, ctx) {
    if (value === ctx.Type) return "original-type";
    if (value === ctx.ref) return "original-ref";
    if (value === ctx.onClick) return "original-callback";
    if (Array.isArray(value)) return value.map((item) => canonical(item, ctx));
    if (value && typeof value === "object") {
      if (React.isValidElement(value))
        return { type: canonical(value.type, ctx), key: value.key, props: canonical(value.props, ctx) };
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, canonical(item, ctx)]));
    }
    return value;
  }
  assert.deepEqual(canonical(right, b), canonical(left, a));
  assert.deepEqual(b.effects, a.effects);
  verify(right, b, adapted.code);
}
test("build-only aliases are the exact installed constructors, including fallback", () => {
  assert.equal(aliases.jsx, runtime.jsx);
  assert.equal(aliases.jsxs, runtime.jsxs);
  assert.equal(aliases.Fragment, runtime.Fragment);
  assert.equal(elements.createElement, React.createElement);
  assert.equal(plugin.apply, "build");
  assert.equal(plugin.resolveId("react/jsx-runtime"), undefined);
  assert.equal(development.jsxDEV, require("react/jsx-dev-runtime").jsxDEV);
  assert.equal(development.Fragment, require("react/jsx-dev-runtime").Fragment);
  assert.equal(plugin.resolveId("@aux/react-constructors/foreign"), undefined);
});
test("supported development builds retain original jsxDEV constructor and arguments", async () => {
  if (process.env.NODE_ENV === "production") return;
  const build = await resolveConfig(
    { configFile: false, plugins: [reactConstructorAliases(), react()], logLevel: "silent" },
    "build",
    "development",
  );
  assert.equal(build.isProduction, false);
  assert.equal(build.esbuild.jsxDev, true);
  assert.equal(build.esbuild.jsxImportSource, "@aux/react-constructors");
  const source =
    'export default c => <><section key="original" ref={c.ref} onClick={c.onClick}>{c.mark("first", "A")}<span>B</span></section></>';
  const c = context();
  const before = compiled(source, false, true).render(c);
  const effects = [...c.effects];
  c.effects.length = 0;
  const after = compiled(source, true, true).render(c);
  assert.equal(after.type, before.type);
  assert.equal(after.props.children.type, before.props.children.type);
  assert.equal(after.props.children.key, before.props.children.key);
  assert.equal(after.props.children.props.ref, c.ref);
  assert.equal(after.props.children.props.onClick, c.onClick);
  assert.equal(after.props.children.props.children[0], before.props.children.props.children[0]);
  assert.deepEqual(
    after.props.children.props.children[1].props,
    before.props.children.props.children[1].props,
  );
  assert.deepEqual(c.effects, effects);
});
test("Vite build selects aliases while serve keeps original development runtime", async () => {
  const config = { configFile: false, plugins: [reactConstructorAliases(), react()], logLevel: "silent" };
  const build = await resolveConfig(config, "build", "production");
  const serve = await resolveConfig(config, "serve", "development");
  assert.equal(build.esbuild.jsx, "automatic");
  assert.equal(build.esbuild.jsxImportSource, "@aux/react-constructors");
  assert.equal(serve.esbuild.jsx, "automatic");
  assert.equal(serve.esbuild.jsxImportSource, undefined);
  assert.equal(
    serve.plugins.some((p) => p.name === plugin.name),
    false,
  );
});
test("single and multiple children preserve order, content, ref and callback", () => {
  equivalent(
    'export default c => <section ref={c.ref} onClick={c.onClick} title={c.mark("title", "title")}><span>{c.mark("first", "first")}</span>{c.mark("second", "second")}<input value="x" /></section>',
    (node, ctx) => {
      assert.equal(node.props.ref, ctx.ref);
      assert.equal(node.props.onClick, ctx.onClick);
      assert.deepEqual(ctx.effects, ["title", "first", "second"]);
      node.props.onClick();
      assert.equal(ctx.effects.at(-1), "clicked");
    },
  );
});
test("fragments, null/boolean children, arrays and empty roots retain exact values", () => {
  equivalent(
    'export default c => <><div />{null}{false}{[<span key="a">A</span>, <span key="b">B</span>]}{c.mark("tail", 0)}</>',
  );
});
test("function type defaultProps and explicit undefined remain installed semantics", () => {
  equivalent(
    'export default c => <c.Type optional={undefined} overridden="explicit" ref={c.ref} onClick={c.onClick} />',
    (node, ctx) => {
      assert.equal(node.type, ctx.Type);
      assert.equal(node.props.optional, undefined);
      assert.equal(node.props.overridden, "explicit");
    },
  );
});
test("key-before-spread preserves getter evaluation and spread key precedence", () => {
  equivalent(
    'export default c => <c.Type key={c.mark("key", "explicit")} {...c.spread} overridden={c.mark("override", "x")} />',
  );
});
test("key-after-spread preserves actual createElement fallback and reserved props", () => {
  equivalent(
    'export default c => <c.Type {...c.spread} key={c.mark("key", "explicit")} ref={c.ref}>{c.mark("child", "text")}</c.Type>',
    (node, ctx, code) => {
      assert.match(code, /require\("@aux\/react-constructors"\)/);
      assert.match(code, /\.createElement\b/);
      assert.equal(node.props.optional, "default");
      assert.equal(node.key, "explicit");
      assert.equal(node.props.ref, ctx.ref);
      assert.equal(Object.hasOwn(node.props, "key"), process.env.NODE_ENV !== "production");
      assert.deepEqual(ctx.effects, ["spread-title", "key", "child"]);
    },
  );
});
test("original throwing prop effects abort construction identically", () => {
  const source =
    'export default c => <div title={c.mark("before", "x")} value={c.fail()}>{c.mark("after", "y")}</div>';
  for (const adapted of [false, true]) {
    const ctx = context();
    const original = new Error("original getter failed");
    ctx.fail = () => {
      ctx.effects.push("throw");
      throw original;
    };
    assert.throws(
      () => compiled(source, adapted).render(ctx),
      (reason) => reason === original,
    );
    assert.deepEqual(ctx.effects, ["before", "throw"]);
  }
});
test("construction still returns distinct original elements on repeated calls", () => {
  const render = compiled(
    "export default c => <div onClick={c.onClick}><span>A</span><span>B</span></div>",
    true,
  ).render;
  const ctx = context(),
    first = render(ctx),
    second = render(ctx);
  assert.notEqual(first, second);
  assert.notEqual(first.props.children, second.props.children);
  assert.notEqual(first.props.children[0], second.props.children[0]);
});
test("actual installed server renderer emits identical element markup", () => {
  const { renderToStaticMarkup } = require("react-dom/server");
  const source =
    'export default c => <><section className="aux" aria-label="Aux" style={{color:"red",padding:4}}><button disabled onClick={c.onClick}>Continue</button><input defaultValue="draft" /><span>{c.mark("text", "<&>")}</span></section></>';
  const a = context(),
    b = context();
  const before = renderToStaticMarkup(compiled(source, false).render(a));
  const after = renderToStaticMarkup(compiled(source, true).render(b));
  assert.equal(after, before);
  assert.match(after, /&lt;&amp;&gt;/);
  assert.deepEqual(b.effects, a.effects);
});
