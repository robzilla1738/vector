import { execFile } from "node:child_process";
import { createDecipheriv, pbkdf2Sync } from "node:crypto";
import { copyFileSync, existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { promisify } from "node:util";
import { VectorError } from "@vector/contracts";
import type { BrowserCookie, BrowserDriver } from "@vector/engine-client";
import type { NativeBridge } from "../native.js";

const execFileP = promisify(execFile);

/**
 * Chrome cookie import. Two sources:
 *
 * - "attached": the user's running Chrome, reached over its remote-debugging
 *   port. `Storage.getCookies` returns already-decrypted values — no keychain
 *   access, and it covers cookies Vector could never decrypt itself (Chrome
 *   v130+ "app-bound" v20 entries).
 * - "profile": Chrome's on-disk `Cookies` SQLite DB. Values are AES-128-CBC
 *   encrypted with a key derived from the "Chrome Safe Storage" keychain
 *   entry; reading it triggers the macOS permission prompt, which is the
 *   user-mediated consent boundary. v20/app-bound rows are skipped and
 *   counted — importing those needs the attached path.
 *
 * In both cases cookies are injected into Vector's shared profile partition
 * through the native bridge (or the standalone driver's CDP session). Cookie
 * values are never logged, returned, or persisted by Vector itself.
 */

export interface CookieImportResult {
  ok: boolean;
  source: "attached" | "profile";
  imported: number;
  skipped: number;
  /** distinct domains touched — names only, never values */
  domains: number;
  detail?: string;
}

interface ChromeProfileRow {
  host_key: string;
  name: string;
  value: string;
  encrypted_value: Buffer;
  path: string;
  expires_utc: number;
  is_secure: number;
  is_httponly: number;
  samesite: number;
  is_persistent: number;
}

const CHROME_DIRS = [
  join(homedir(), "Library/Application Support/Google/Chrome"),
  join(homedir(), "Library/Application Support/Google/Chrome Beta"),
  join(homedir(), "Library/Application Support/Chromium"),
];

const SAFE_STORAGE_SERVICE: Record<string, string> = {
  "Google/Chrome": "Chrome Safe Storage",
  "Google/Chrome Beta": "Chrome Beta Safe Storage",
  Chromium: "Chromium Safe Storage",
};

export function chromeEpochToUnix(expiresUtc: number): number | undefined {
  if (!expiresUtc) return undefined;
  const unix = Math.floor(expiresUtc / 1_000_000 - 11_644_473_600);
  return unix > 0 ? unix : undefined;
}

export function mapSameSite(v: number): BrowserCookie["sameSite"] {
  return v === 0 ? "None" : v === 1 ? "Lax" : v === 2 ? "Strict" : undefined;
}

async function safeStoragePassword(service: string): Promise<string> {
  try {
    // macOS shows its own authorization prompt for this keychain read —
    // that prompt is the user's consent gate for profile import.
    const { stdout } = await execFileP("security", ["find-generic-password", "-w", "-s", service], {
      timeout: 120_000, // macOS prompt waits on the human — give them time
    });
    return stdout.trim();
  } catch {
    throw new VectorError(
      "backend_unavailable",
      `Could not read "${service}" from the keychain — unlock it when macOS prompts, or attach Chrome (⌘⇧P → Attach Chrome) and import from the running browser instead.`,
    );
  }
}

export function decryptValue(encrypted: Buffer, key: Buffer, metaVersion: number): string | null {
  const prefix = encrypted.subarray(0, 3).toString("latin1");
  if (prefix === "v20") return null; // app-bound — only Chrome itself can decrypt
  if (prefix !== "v10" && prefix !== "v11") {
    // some rows store plaintext in encrypted_value when crypto was unavailable
    const s = encrypted.toString("utf8");
    return /^[\x20-\x7e]*$/.test(s) && s.length > 0 ? s : null;
  }
  try {
    const iv = Buffer.alloc(16, 0x20);
    const decipher = createDecipheriv("aes-128-cbc", key, iv);
    let plain = Buffer.concat([decipher.update(encrypted.subarray(3)), decipher.final()]);
    // DB meta version ≥24 prefixes plaintext with SHA256(host_key)
    if (metaVersion >= 24 && plain.length > 32) plain = plain.subarray(32);
    return plain.toString("utf8");
  } catch {
    return null;
  }
}

export class CookieService {
  constructor(
    private deps: {
      drivers: () => { vector: BrowserDriver | null; chrome: BrowserDriver | null; engine?: BrowserDriver | null };
      native: NativeBridge;
    },
  ) {}

  private async inject(cookies: BrowserCookie[]): Promise<number> {
    const { native } = this.deps;
    // the Vector Engine keeps its own jar — mirror imports there so engine-routed
    // pages see the same sessions (best-effort; the Chromium count is authoritative)
    const engine = this.deps.drivers().engine;
    if (engine?.isConnected() && engine.setCookies) await engine.setCookies(cookies).catch(() => 0);
    if (native.available()) {
      const res = await native.setCookies(cookies);
      return res.count;
    }
    const vector = this.deps.drivers().vector;
    if (!vector?.setCookies) {
      throw new VectorError("backend_unavailable", "no Vector browser session to receive cookies");
    }
    return vector.setCookies(cookies);
  }

  async importCookies(opts: { source?: "auto" | "attached" | "profile" }): Promise<CookieImportResult> {
    const source = opts.source ?? "auto";
    const chrome = this.deps.drivers().chrome;

    if ((source === "auto" || source === "attached") && chrome?.isConnected() && chrome.getAllCookies) {
      const all = await chrome.getAllCookies();
      const usable = all.filter((c) => c.name && c.domain);
      const imported = await this.inject(usable);
      return {
        ok: true,
        source: "attached",
        imported,
        skipped: all.length - usable.length + (usable.length - imported),
        domains: new Set(usable.map((c) => c.domain)).size,
        detail: `imported from running Chrome over CDP`,
      };
    }
    if (source === "attached") {
      throw new VectorError("backend_unavailable", "no Chrome attached — run Attach Chrome first");
    }

    // ---- profile path ----
    const dir = CHROME_DIRS.find((d) => existsSync(d));
    if (!dir) {
      throw new VectorError("not_found", "no Chrome profile found on this machine");
    }
    let profiles: string[];
    try {
      profiles = readdirSync(dir).filter(
        (p) => (p === "Default" || /^Profile \d+$/.test(p)) && existsSync(join(dir, p, "Cookies")),
      );
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "EPERM") {
        throw new VectorError(
          "backend_unavailable",
          "macOS is blocking reads of Chrome's profile directory. Either grant Vector Full Disk Access (System Settings → Privacy & Security → Full Disk Access), or attach Chrome (launch it with --remote-debugging-port=9222) and re-import — the attached path needs no extra permissions.",
        );
      }
      throw e;
    }
    if (!profiles.length) throw new VectorError("not_found", "Chrome profile has no Cookies store");

    const serviceKey = Object.keys(SAFE_STORAGE_SERVICE).find((k) => dir.includes(k))!;
    const password = await safeStoragePassword(SAFE_STORAGE_SERVICE[serviceKey]!);
    const key = pbkdf2Sync(password, "saltysalt", 1003, 16, "sha1");

    const byKey = new Map<string, BrowserCookie>();
    let skipped = 0;
    let appBound = 0;
    // The copies hold encrypted_value blobs and any plaintext `value` rows —
    // they must not outlive the import (P1-11), hence the finally below.
    const tmp = mkdtempSync(join(tmpdir(), "vector-cookies-"));
    try {
    for (const profile of profiles) {
      const src = join(dir, profile, "Cookies");
      const dst = join(tmp, `${profile}.db`);
      try {
        copyFileSync(src, dst); // Chrome holds a lock on the live DB — work on a copy
      } catch {
        continue;
      }
      let db: DatabaseSync | null = null;
      try {
        db = new DatabaseSync(dst, { readOnly: true });
        const metaVersion =
          Number(
            (db.prepare("SELECT value FROM meta WHERE key='version'").get() as { value: string } | undefined)?.value,
          ) || 0;
        const rows = db
          .prepare(
            `SELECT host_key, name, value, encrypted_value, path, expires_utc,
                    is_secure, is_httponly, samesite, is_persistent FROM cookies`,
          )
          .all() as unknown as ChromeProfileRow[];
        for (const r of rows) {
          const enc = Buffer.isBuffer(r.encrypted_value) ? r.encrypted_value : Buffer.from(r.encrypted_value ?? []);
          let value: string | null = r.value || null;
          if (!value && enc.length) {
            if (enc.subarray(0, 3).toString("latin1") === "v20") {
              appBound++;
              continue;
            }
            value = decryptValue(enc, key, metaVersion);
          }
          if (value === null || !r.name || !r.host_key) {
            skipped++;
            continue;
          }
          byKey.set(`${r.host_key}${r.path}${r.name}`, {
            name: r.name,
            value,
            domain: r.host_key,
            path: r.path || "/",
            secure: Boolean(r.is_secure),
            httpOnly: Boolean(r.is_httponly),
            sameSite: mapSameSite(r.samesite),
            expires: r.is_persistent ? chromeEpochToUnix(r.expires_utc) : undefined,
          });
        }
      } catch {
        skipped++;
      } finally {
        db?.close();
      }
    }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }

    const cookies = [...byKey.values()];
    const imported = await this.inject(cookies);
    return {
      ok: true,
      source: "profile",
      imported,
      skipped: skipped + (cookies.length - imported),
      domains: new Set(cookies.map((c) => c.domain)).size,
      detail:
        appBound > 0
          ? `${appBound} cookie(s) use Chrome's app-bound encryption and can't be read from disk — attach Chrome and re-import to capture them`
          : `imported from ${profiles.length} Chrome profile(s)`,
    };
  }
}
