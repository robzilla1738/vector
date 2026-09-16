#!/usr/bin/env node
/**
 * `pnpm package:electron` — hybrid Electron desktop (not the product).
 * Native product: `pnpm package:local`.
 * production deps (pnpm deploy), build the renderer, and run electron-builder
 * for the current platform (unsigned dir target).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", ...opts });
  if (r.status !== 0) {
    console.error(`✗ ${cmd} ${args.join(" ")} failed`);
    process.exit(r.status ?? 1);
  }
};

console.log("▸ build workspace");
run("node_modules/.bin/tsc", ["-b", "tsconfig.json"]);

const desktopDir = join(root, "apps", "desktop");

console.log("▸ bundle main+preload");
run(process.execPath, [join(desktopDir, "bundle.mjs")]);

console.log("▸ build renderer");
run(join(desktopDir, "node_modules", ".bin", "vite"), ["build"], { cwd: desktopDir });

// Stage the runtime deterministically: copy dist + vendor the workspace
// packages, rewrite workspace deps to file:, and let npm produce a real
// flat node_modules. (pnpm deploy + shared lockfile is not reliable here.)
console.log("▸ stage runtime");
const staging = join(root, "release", ".staging");
rmSync(staging, { recursive: true, force: true });
const rtOut = join(staging, "runtime");
mkdirSync(rtOut, { recursive: true });

const vendor = (pkgDir, destName) => {
  const src = join(root, pkgDir);
  const dest = join(rtOut, "vendor", destName);
  mkdirSync(dest, { recursive: true });
  run("cp", ["-R", join(src, "dist"), join(src, "package.json"), dest + "/"]);
};

vendor("packages/contracts", "contracts");
vendor("packages/browser-driver", "browser-driver");
run("cp", ["-R", join(root, "apps/runtime/dist"), join(root, "apps/runtime/package.json"), rtOut + "/"]);

// rewrite workspace:* deps → file:../vendor/*
const rewriteFileDeps = (pkgPath, mapping) => {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  for (const [k, v] of Object.entries(pkg.dependencies ?? {})) {
    if (v.startsWith("workspace:") && mapping[k]) pkg.dependencies[k] = mapping[k];
  }
  delete pkg.devDependencies;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
};
rewriteFileDeps(join(rtOut, "vendor/browser-driver/package.json"), { "@vector/contracts": "file:../contracts" });
// npm treats file:-directory deps as links and does NOT install their deps —
// hoist vendor packages' registry deps into the runtime manifest instead.
const vendorDeps = {};
for (const name of ["contracts", "browser-driver"]) {
  const vp = JSON.parse(readFileSync(join(rtOut, "vendor", name, "package.json"), "utf8"));
  for (const [k, v] of Object.entries(vp.dependencies ?? {})) if (!v.startsWith("file:")) vendorDeps[k] = v;
}
{
  const pkg = JSON.parse(readFileSync(join(rtOut, "package.json"), "utf8"));
  for (const [k, v] of Object.entries(pkg.dependencies ?? {})) {
    if (v.startsWith("workspace:")) {
      const name = k.split("/").pop();
      pkg.dependencies[k] = `file:./vendor/${name}`;
    }
  }
  Object.assign(pkg.dependencies, vendorDeps);
  delete pkg.devDependencies;
  writeFileSync(join(rtOut, "package.json"), JSON.stringify(pkg, null, 2));
}

const cleanEnv = Object.fromEntries(
  Object.entries(process.env).filter(([k]) => !/^(npm_|pnpm_|PNPM_|INIT_CWD)/i.test(k)),
);
run("npm", ["install", "--omit=dev", "--no-package-lock", "--no-audit", "--no-fund"], {
  cwd: rtOut,
  env: cleanEnv,
});

// npm file: deps install as symlinks into ./vendor — replace with real
// copies so resolution stays inside runtime/node_modules.
for (const name of ["contracts", "browser-driver"]) {
  const link = join(rtOut, "node_modules", "@vector", name);
  const real = join(rtOut, "vendor", name);
  rmSync(link, { recursive: true, force: true });
  run("cp", ["-R", real, link]);
}

console.log("▸ electron-builder");
run(join(desktopDir, "node_modules", ".bin", "electron-builder"), ["--config", "electron-builder.yml"], {
  cwd: desktopDir,
});

// electron-builder always excludes node_modules from extraResources
// (app-builder-lib fileMatcher injects "!**/node_modules/**"), so the
// bundled runtime's deps are copied in after packaging.
console.log("▸ inject runtime node_modules");
const appResources = join(root, "release", "mac-arm64", "Vector.app", "Contents", "Resources");
if (existsSync(appResources)) {
  rmSync(join(appResources, "runtime", "node_modules"), { recursive: true, force: true });
  run("cp", ["-R", join(rtOut, "node_modules"), join(appResources, "runtime", "node_modules")]);
}

const out = join(root, "release");
console.log(`\n✓ packaged app in ${out}`);
if (existsSync(join(out, "mac-arm64", "Vector.app"))) console.log(`  → ${join(out, "mac-arm64", "Vector.app")}`);
