import { expect, it } from "vitest";
import { startupBundle } from "../../scripts/bundle-budget.mjs";

it("counts hashed boot chunks and shared CSS once without counting lazy settings or terminal", () => {
  const manifest = {
    "index.html": { file: "assets/entry.js", dynamicImports: ["_bootstrap.js"] },
    "_bootstrap.js": {
      file: "assets/abc.js",
      name: "main",
      imports: ["_shared.js"],
      dynamicImports: ["_app.js", "src/chromium-bridge.ts"],
      css: ["assets/main.css"],
    },
    "_app.js": {
      file: "assets/def.js",
      name: "App",
      imports: ["index.html", "_shared.js"],
      dynamicImports: ["settings.tsx", "xterm.ts"],
      css: ["assets/main.css", "assets/app.css"],
    },
    "_shared.js": { file: "assets/shared.js", css: ["assets/main.css"] },
    "src/chromium-bridge.ts": { file: "assets/native.js", name: "chromium-bridge" },
    "settings.tsx": { file: "assets/settings.js", css: ["assets/settings.css"] },
    "xterm.ts": { file: "assets/xterm.js" },
  };
  const result = startupBundle(
    manifest,
    { startupEntries: ["index.html"], bootModules: ["main", "App", "chromium-bridge"] },
    '<link rel="modulepreload" crossorigin href="/assets/def.js">',
  );
  expect(result.js.sort()).toEqual(
    ["assets/entry.js", "assets/abc.js", "assets/def.js", "assets/shared.js", "assets/native.js"].sort(),
  );
  expect(result.css.sort()).toEqual(["assets/app.css", "assets/main.css"]);
});

it("counts actual preloads even when a shared chunk has a different logical name", () => {
  expect(
    startupBundle(
      {
        "index.html": { file: "assets/entry.js" },
        "_combined.js": { file: "assets/123.js", css: ["assets/combined.css"] },
      },
      { startupEntries: ["index.html"], bootModules: ["main", "App"] },
      "<link href='./assets/123.js' rel='modulepreload'>",
    ),
  ).toEqual({ js: ["assets/entry.js", "assets/123.js"], css: ["assets/combined.css"] });
});

it("rejects a malformed startup report instead of understating its bytes", () => {
  expect(() => startupBundle({}, { startupEntries: ["index.html"], bootModules: [] }, "")).toThrow(
    "Startup chunk is absent",
  );
  expect(() =>
    startupBundle({}, { startupEntries: [], bootModules: [] }, '<link rel="modulepreload" href="/lost.js">'),
  ).toThrow("Module preload is absent");
});
