/**
 * Loader for the `@vector/engine-native` addon.
 *
 * Resolution order:
 *   1. `VECTOR_ENGINE_NATIVE` — explicit path to a `.node`/`.so`/`.dylib`/`.dll`
 *   2. `vector-engine.<platform>-<arch>[-<libc>].node` next to this file
 *      (what `pnpm --filter @vector/engine-native build` produces)
 *   3. the cargo output for a dev checkout: `$CARGO_TARGET_DIR` or
 *      `<repo>/target` → `release/libve_napi.<ext>` then `debug/...`
 *
 * Any failure throws one Error explaining every location that was tried and
 * how to build the binary, so the runtime can report the engine as
 * unavailable instead of dying with a bare MODULE_NOT_FOUND.
 */
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function libcSuffix() {
  if (process.platform !== "linux") return "";
  try {
    const report = process.report?.getReport?.();
    const glibc = report?.header?.glibcVersionRuntime;
    return glibc ? "" : "-musl";
  } catch {
    return "";
  }
}

const ext = process.platform === "win32" ? "dll" : process.platform === "darwin" ? "dylib" : "so";
const libName = process.platform === "win32" ? "ve_napi" : "libve_napi";

const candidates = [];
if (process.env.VECTOR_ENGINE_NATIVE) candidates.push(resolve(process.env.VECTOR_ENGINE_NATIVE));
candidates.push(join(here, `vector-engine.${process.platform}-${process.arch}${libcSuffix()}.node`));
candidates.push(join(here, `vector-engine.${process.platform}-${process.arch}.node`));
const targetDirs = [];
if (process.env.CARGO_TARGET_DIR) targetDirs.push(resolve(process.env.CARGO_TARGET_DIR));
targetDirs.push(resolve(here, "../../target"), resolve(here, "../../../target"));
for (const dir of targetDirs) {
  candidates.push(join(dir, "release", `${libName}.${ext}`));
  candidates.push(join(dir, "debug", `${libName}.${ext}`));
}

let native = null;
let loaded = "";
const errors = [];
for (const path of candidates) {
  if (!existsSync(path)) {
    errors.push(`${path}: not found`);
    continue;
  }
  try {
    native = require(path);
    loaded = path;
    break;
  } catch (e) {
    errors.push(`${path}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

if (!native) {
  const err = new Error(
    `@vector/engine-native: no engine binary for ${process.platform}-${process.arch}.\n` +
      `Build it with:\n  cd engine && cargo build -p ve-napi --features napi --release\n` +
      `or  pnpm --filter @vector/engine-native build\n` +
      `then set VECTOR_ENGINE_NATIVE=<path to .node> if it lives elsewhere.\nTried:\n  ${errors.join("\n  ")}`,
  );
  err.code = "VECTOR_ENGINE_NATIVE_MISSING";
  err.tried = candidates;
  throw err;
}

export const binaryPath = loaded;
if (!process.env.VECTOR_ENGINE_HOST) {
  const hostName = process.platform === "win32" ? "ve-host.exe" : "ve-host";
  const nextToNative = join(dirname(loaded), hostName);
  const nextToHere = join(here, hostName);
  if (existsSync(nextToNative)) process.env.VECTOR_ENGINE_HOST = nextToNative;
  else if (existsSync(nextToHere)) process.env.VECTOR_ENGINE_HOST = nextToHere;
  else {
    for (const dir of targetDirs) {
      for (const profile of ["release", "debug"]) {
        const p = join(dir, profile, hostName);
        if (existsSync(p)) {
          process.env.VECTOR_ENGINE_HOST = p;
          break;
        }
      }
      if (process.env.VECTOR_ENGINE_HOST) break;
    }
  }
}
export const Engine = native.Engine;
export const describe = native.describe;
export const version = native.version;
export default { Engine, describe, version, binaryPath };
