/**
 * Rebrands and rewires the vendored extensions. Visible product text becomes "Aux"; the
 * `Aside.*` CDP methods, `chrome.aside*` APIs, permission names and client identifiers stay
 * exactly as shipped, which is what keeps the copied code working unchanged.
 */
import { copyFileSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const here = import.meta.dirname;
const TEXT_FILES = /\.(?:js|mjs|html|json|css|txt)$/;

// A standalone "Aside" that is not part of an identifier, a dotted API name or a domain.
const PRODUCT_WORD = /(?<![\w.@/-])Aside(?![\w]|\.[a-zA-Z]|-)/g;

/** Anchored edits, per extension. `file` is relative to the extension root. */
export const extensionPatches = {
  "agent-manager": [],
  "password-manager": [],
};

const rewrites = [
  [/(127\.0\.0\.1|localhost):21420/g, "$1:21520"],
  [/(127\.0\.0\.1|localhost):21421/g, "$1:21521"],
  [/port 21420/g, "port 21520"],
  [PRODUCT_WORD, "Aux"],
];

function* walk(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

export function rebrandExtension(directory, name, patches) {
  for (const path of walk(directory)) {
    if (!TEXT_FILES.test(path)) continue;
    const original = readFileSync(path, "utf8");
    let text = original;
    for (const [pattern, replacement] of rewrites) text = text.replace(pattern, replacement);
    if (text !== original) writeFileSync(path, text);
  }

  for (const patch of patches[name] ?? []) {
    const path = join(directory, patch.file);
    const text = readFileSync(path, "utf8");
    const count = text.split(patch.find).length - 1;
    if (count !== (patch.count ?? 1)) throw new Error(`Extension patch "${patch.name}" matched ${count} times`);
    writeFileSync(path, text.split(patch.find).join(patch.replace));
  }

  installPrivateApiShim(directory);
}

/** Loads the private-API shim before any extension code runs. */
function installPrivateApiShim(directory) {
  copyFileSync(join(here, "../shims/aux-private-shim.js"), join(directory, "aux-private-shim.js"));
  const manifest = JSON.parse(readFileSync(join(directory, "manifest.json"), "utf8"));
  const worker = manifest.background?.service_worker;
  if (worker) {
    const path = join(directory, worker);
    const source = readFileSync(path, "utf8");
    // Module workers cannot importScripts; a static import evaluates the shim first.
    writeFileSync(path, manifest.background.type === "module" ? `import "/aux-private-shim.js";\n${source}` : `importScripts("/aux-private-shim.js");\n${source}`);
  }
  for (const path of walk(directory)) {
    if (!path.endsWith(".html")) continue;
    const html = readFileSync(path, "utf8");
    if (html.includes("aux-private-shim.js")) continue;
    const match = html.match(/<script\b/i);
    if (!match) continue;
    writeFileSync(path, html.slice(0, match.index) + '<script src="/aux-private-shim.js"></script>\n    ' + html.slice(match.index));
  }
}
