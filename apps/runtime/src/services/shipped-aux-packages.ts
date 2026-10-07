import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
export function shippedAuxPackageDirectories(): { name: string; path: string; shipped: true }[] {
  const runtime = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(runtime, "packages", "aux-core"),
    resolve(runtime, "../packages/aux-core"),
    resolve(runtime, "../../packages/aux-core"),
  ];
  const path = candidates.find((candidate) => existsSync(join(candidate, "aux.package.json")));
  if (!path) throw new Error("The shipped Aux core package is missing from the runtime payload.");
  return [{ name: "aux-core", path, shipped: true }];
}
