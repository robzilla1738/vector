import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/** Default data dir when VECTOR_DATA_DIR is unset (shared with the desktop shell). */
export const defaultDataDir = () => join(homedir(), "Library", "Application Support", "Vector");

/**
 * Parse a dotenv-style file: `KEY=value` lines, `#` comments, optional
 * `export ` prefix, single/double quotes stripped (double quotes unescape
 * `\n`). No interpolation — this is deliberately tiny.
 */
export function parseDotEnv(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    let v = m[2]!.trim();
    if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) {
      v = v.slice(1, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"');
    } else if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) {
      v = v.slice(1, -1);
    } else {
      // strip an unquoted trailing comment
      v = v.replace(/\s+#.*$/, "");
    }
    out[m[1]!] = v;
  }
  return out;
}

/**
 * Overlay `.env` files onto an env object WITHOUT overriding keys already
 * set (real environment always wins). Files are applied in order, so the
 * first file that defines a key wins among the files. Returns a new object.
 */
export function loadDotEnv(env: NodeJS.ProcessEnv, files: string[]): NodeJS.ProcessEnv {
  const merged: NodeJS.ProcessEnv = { ...env };
  for (const f of files) {
    if (!existsSync(f)) continue;
    let parsed: Record<string, string>;
    try {
      parsed = parseDotEnv(readFileSync(f, "utf8"));
    } catch {
      continue;
    }
    for (const [k, v] of Object.entries(parsed)) {
      if (merged[k] === undefined || merged[k] === "") merged[k] = v;
    }
  }
  return merged;
}

/** The files startRuntime consults: dataDir, cwd, then parent folders (pnpm dev cwd is apps/desktop). */
export function dotEnvCandidates(env: NodeJS.ProcessEnv, cwd = process.cwd()): string[] {
  const dataDir = env.VECTOR_DATA_DIR || defaultDataDir();
  const out: string[] = [];
  for (const p of [join(dataDir, ".env"), join(cwd, ".env"), join(cwd, "..", ".env"), join(cwd, "..", "..", ".env")]) {
    if (!out.includes(p)) out.push(p);
  }
  return out;
}

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
  const dataDir = env.VECTOR_DATA_DIR || defaultDataDir();
  const artifactsDir = join(dataDir, "artifacts");
  const downloadsDir = join(dataDir, "downloads");
  const previewsDir = join(dataDir, "previews");
  const logsDir = join(dataDir, "logs");
  const benchmarksDir = join(dataDir, "benchmarks");
  // the data dir holds runtime.json (bearer token), the SQLite store with the
  // gateway key, and cookies-adjacent artifacts — owner-only when we create it.
  // An existing dir's mode is left alone (the user may have chosen it).
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  for (const d of [artifactsDir, downloadsDir, previewsDir, logsDir, benchmarksDir])
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
