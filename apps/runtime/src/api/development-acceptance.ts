import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

const ALLOWED = new Set(["electronMigration"]);

/** Accept one preview feature only for an owner-only, short-lived native journey Profile. */
export function developmentAcceptanceStages<T extends Record<string, string>>(
  stages: T, dataDir: string, sourceCommit: string, token?: string,
): T {
  if (!token) return stages;
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error("Development acceptance token is invalid.");
  const root = realpathSync(dataDir);
  const rel = relative(realpathSync("/tmp"), root).split(sep);
  if (rel.length !== 4 || !/^aux-native-journey-[A-Za-z0-9]+$/.test(rel[0]!) ||
      rel[1] !== "profile" || rel[2] !== "Default" || rel[3] !== "Aux Runtime Data")
    throw new Error("Development acceptance requires a disposable native journey Profile.");
  const file = resolve(root, "development-acceptance.json");
  const info = lstatSync(file);
  if (!info.isFile() || info.isSymbolicLink() || info.mode & 0o077 || info.uid !== process.getuid?.())
    throw new Error("Development acceptance marker must be owner-only.");
  const marker = JSON.parse(readFileSync(file, "utf8")) as {
    version?: unknown; sourceCommit?: unknown; tokenHash?: unknown; features?: unknown; createdAt?: unknown;
  };
  if (marker.version !== 1 || marker.sourceCommit !== sourceCommit ||
      marker.tokenHash !== createHash("sha256").update(token).digest("hex") ||
      !Array.isArray(marker.features) || !marker.features.length ||
      marker.features.some(feature => typeof feature !== "string" || !ALLOWED.has(feature) || stages[feature] !== "preview") ||
      typeof marker.createdAt !== "number" || Math.abs(Date.now() - marker.createdAt) > 2 * 60 * 60 * 1000)
    throw new Error("Development acceptance marker does not match this source and Profile.");
  return { ...stages, ...Object.fromEntries(marker.features.map(feature => [feature, "on"])) };
}
