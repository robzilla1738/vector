/**
 * Rebrands and rewires the vendored extensions. Visible product text becomes "Aux"; the
 * `Aside.*` CDP methods, `chrome.aside*` APIs, permission names and client identifiers stay
 * exactly as shipped, which is what keeps the copied code working unchanged.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { PRODUCT_WORD } from "./brand.mjs";

const here = import.meta.dirname;
const TEXT_FILES = /\.(?:js|mjs|html|json|css|txt)$/;


/** Anchored edits, per extension. `file` is relative to the extension root. */
export const extensionPatches = {
  "agent-manager": [
    {
      // Aside serves the uBlock Origin asset catalog from its cloud; Aux reads it from upstream.
      name: "adblock filter catalog",
      file: "assets/recommended-filters-gA0HHZVC.js",
      find: 'await m("adblock/assets")',
      replace: 'await fetch("https://raw.githubusercontent.com/gorhill/uBlock/master/assets/assets.json")',
    },
  ],
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

  applyAuxArtwork(directory);
  if (name === "agent-manager") addManifestPermissions(directory, ["declarativeNetRequest", "unlimitedStorage"]);
  installPrivateApiShim(directory);
}

const BRAND_DIR = join(here, "../../../assets/brand");
const MARK_PATH = readFileSync(join(BRAND_DIR, "aux-mark-white.svg"), "utf8").match(/ d="([^"]+)"/)?.[1];
// 847x671 mark centred in a 64x64 box at 70% width.
const MARK_TRANSFORM = "translate(9.6 14.25) scale(0.0529)";

/** Swaps Aside artwork for Aux: raster icons, embossed brand SVGs and the inline 64x64 brand component. */
function applyAuxArtwork(directory) {
  if (!MARK_PATH) throw new Error("Aux mark path not found");
  for (const path of walk(directory)) {
    const name = basename(path);
    if (/\.png$/.test(name) && /^(?:icon-?\d+|favicon-(?:dark|light))\.png$/.test(name)) {
      const size = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", path], { encoding: "utf8" });
      const width = size.match(/pixelWidth: (\d+)/)[1];
      const height = size.match(/pixelHeight: (\d+)/)[1];
      execFileSync("sips", ["-z", height, width, join(BRAND_DIR, "aux-icon-1024.png"), "--out", path], { stdio: "ignore" });
    } else if (/^brand-embossed-(light|dark)\.svg$/.test(name)) {
      const dark = name.includes("dark");
      writeFileSync(
        path,
        `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path transform="${MARK_TRANSFORM}" d="${MARK_PATH}" fill="${dark ? "#fff" : "#0A0A0A"}" fill-opacity="${dark ? 0.22 : 0.16}"/></svg>\n`,
      );
    } else if (path.endsWith(".js")) {
      const source = readFileSync(path, "utf8");
      const component =
        /(\w+=\w+=>\(0,(\w+)\.jsxs\)\("svg",\{width:64,height:64,viewBox:"0 0 64 64",fill:"none",xmlns:"http:\/\/www\.w3\.org\/2000\/svg",\.\.\.\w+,children:)\[\(0,\2\.jsxs\)\("g",\{clipPath:"url\(#clip0_3720_\d+\)"[\s\S]*?\{width:64,height:64,fill:"white"\}\)\}\)\}\)\]\}\)/g;
      const next = source.replace(
        component,
        (_, head, runtime) =>
          `${head}(0,${runtime}.jsx)("path",{transform:"${MARK_TRANSFORM}",d:"${MARK_PATH}",fill:"currentColor",fillOpacity:.3})})`,
      );
      if (next !== source) writeFileSync(path, next);
    }
  }
}

/** Adds Chromium permissions the shims need (content blocking and large filter-list storage). */
function addManifestPermissions(directory, permissions) {
  const path = join(directory, "manifest.json");
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  manifest.permissions = [...new Set([...manifest.permissions, ...permissions])];
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
}

/** Loads the private-API shims before any extension code runs. */
function installPrivateApiShim(directory) {
  const shims = ["aux-private-shim.js", "aux-adblock.js", "aux-omnibox.js"].map((file) => readFileSync(join(here, "../shims", file), "utf8"));
  writeFileSync(join(directory, "aux-private-shim.js"), shims.join("\n"));
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
