import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface RuntimeConfig {
  dataDir: string;
  artifactsDir: string;
  downloadsDir: string;
  previewsDir: string;
  logsDir: string;
  benchmarksDir: string;
  dbPath: string;
  settingsPath: string;
  /** CDP base URL of the hosting Electron app, e.g. http://127.0.0.1:9333 */
  electronCdp: string | null;
  apiPort: number;
  apiToken: string;
}

export function loadConfig(env = process.env): RuntimeConfig {
  const dataDir =
    env.VECTOR_DATA_DIR ?? join(homedir(), "Library", "Application Support", "Vector");
  const artifactsDir = join(dataDir, "artifacts");
  const downloadsDir = join(dataDir, "downloads");
  const previewsDir = join(dataDir, "previews");
  const logsDir = join(dataDir, "logs");
  const benchmarksDir = join(dataDir, "benchmarks");
  for (const d of [dataDir, artifactsDir, downloadsDir, previewsDir, logsDir, benchmarksDir])
    mkdirSync(d, { recursive: true });
  return {
    dataDir,
    artifactsDir,
    downloadsDir,
    previewsDir,
    logsDir,
    benchmarksDir,
    dbPath: join(dataDir, "vector.sqlite"),
    settingsPath: join(dataDir, "settings.json"),
    electronCdp: env.VECTOR_ELECTRON_CDP ?? null,
    apiPort: Number(env.VECTOR_API_PORT ?? 0),
    apiToken: env.VECTOR_API_TOKEN ?? "",
  };
}
