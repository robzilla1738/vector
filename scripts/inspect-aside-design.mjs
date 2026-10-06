import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { resolve, join, relative } from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";

// Read-only reference inspection. Generated evidence belongs outside the source bundle.
const [reference, destination] = process.argv.slice(2).map((path) => resolve(path));
if (!reference || !destination || destination.startsWith(reference)) {
  throw new Error("Usage: node scripts/inspect-aside-design.mjs <Aside bundle> <separate output directory>");
}
const requireShell = createRequire(new URL("../apps/shell/package.json", import.meta.url));
const postcss = createRequire(requireShell.resolve("vite"))("postcss");
const files = (await readdir(reference, { recursive: true, withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => join(entry.parentPath, entry.name))
  .sort();
const manifest = [];
const stylesheets = [];
const bundles = [];
const entrypoints = [];
const aliases = {
  "--font-sans": "--font-ui",
  "--font-mono": "--font-mono",
  "--spacing": "--space-1",
  "--background": "--bg-0",
  "--foreground": "--ink-0",
  "--popover": "--surface-menu",
  "--primary": "--ink-1",
  "--primary-foreground": "--accent-ink",
  "--muted-foreground": "--ink-2",
  "--muted": "--muted",
  "--input": "--surface-input",
  "--border": "--line",
  "--border-surface": "--line",
  "--border-surface-strong": "--line-strong",
  "--surface-primary": "--surface-primary",
  "--surface-secondary": "--surface-secondary",
  "--surface-tertiary": "--surface-tertiary",
  "--squircle-factor": "--squircle-factor",
  "--surface-primary-foreground": "--ink-1",
  "--surface-secondary-foreground": "--ink-2",
  "--surface-tertiary-foreground": "--ink-3",
  "--tabs-list": "--tabs-list",
  "--radius-md": "--r-md",
  "--radius-lg": "--r-lg",
  "--radius-xl": "--r-xl",
  "--radius-2xl": "--r-2xl",
  "--default-transition-duration": "--t-fast",
  "--default-transition-timing-function": "--ease-in-out",
};
function ancestors(node) {
  const chain = [];
  for (let parent = node.parent; parent && parent.type !== "root"; parent = parent.parent) {
    chain.unshift(parent.type === "atrule" ? `@${parent.name} ${parent.params}` : parent.selector);
  }
  return chain;
}
for (const file of files) {
  if (!/\.(css|js|html)$/.test(file)) continue;
  const source = await readFile(file, "utf8");
  const name = relative(reference, file);
  manifest.push({
    name,
    bytes: Buffer.byteLength(source),
    sha256: createHash("sha256").update(source).digest("hex"),
  });
  if (file.endsWith(".html")) {
    entrypoints.push({
      name,
      scripts: [...source.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]),
      styles: [...source.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map((match) => match[1]),
    });
  } else if (file.endsWith(".css")) {
    const root = postcss.parse(source, { from: file });
    const declarations = [],
      conditions = [],
      animations = [];
    root.walkDecls((node) =>
      declarations.push({
        scope: ancestors(node),
        property: node.prop,
        value: node.value,
        important: !!node.important,
        ...(node.prop.startsWith("--")
          ? {
              aux: aliases[node.prop] ?? null,
              status: aliases[node.prop]
                ? "alias candidate: compare scoped values"
                : "requires classification; not a verified match",
            }
          : {}),
      }),
    );
    root.walkAtRules((node) => {
      if (["media", "container", "supports"].includes(node.name))
        conditions.push({ type: node.name, condition: node.params, scope: ancestors(node) });
      if (node.name.endsWith("keyframes")) animations.push({ name: node.params, source: node.toString() });
    });
    stylesheets.push({ name, declarations, conditions, animations });
  } else {
    // Includes class strings passed through variant helpers, not only literal className assignments.
    const strings = [...source.matchAll(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g)]
      .filter(
        (match) =>
          /(?:className|(?:bg|text|border|rounded|shadow|duration|ease|transition|animate|size|max-w|min-w|gap|p[xytrbl]?|m[xytrbl]?|h|w)-)/.test(
            match[0],
          ) && match[0].length < 4000,
      )
      .map((match) => ({ offset: match.index, text: match[0].slice(1, -1) }));
    const imports = [...source.matchAll(/(?:from\s*|import\s*\()?"(\.\.?\/[^"\n]+\.js)"/g)].map(
      (match) => match[1],
    );
    if (
      strings.length ||
      /(?:settings|sidebar|composer|tasks|routine|newtab|menu|popover|dialog|tooltip|motion|resize)/.test(
        name,
      )
    ) {
      bundles.push({
        name,
        imports: [...new Set(imports)],
        designStrings: strings,
        status: "static inventory; dynamic/native behavior requires runtime comparison",
      });
    }
  }
}
await mkdir(destination, { recursive: true });
for (const [name, data] of Object.entries({
  manifest: { reference, entrypoints, files: manifest },
  stylesheets,
  bundles,
})) {
  await writeFile(join(destination, `${name}.json`), `${JSON.stringify(data, null, 2)}\n`);
}
console.log(
  JSON.stringify(
    {
      destination,
      files: manifest.length,
      stylesheets: stylesheets.length,
      uiCandidateBundles: bundles.length,
      declarations: stylesheets.reduce((count, item) => count + item.declarations.length, 0),
      conditions: stylesheets.reduce((count, item) => count + item.conditions.length, 0),
      animations: stylesheets.reduce((count, item) => count + item.animations.length, 0),
    },
    null,
    2,
  ),
);
