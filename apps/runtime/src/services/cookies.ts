import { execFile } from "node:child_process";
import { createDecipheriv, pbkdf2Sync } from "node:crypto";
import { copyFileSync, existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { promisify } from "node:util";
import { AuxError } from "@aux/contracts";
import type { BrowserCookie } from "@aux/chromium-driver";
import type { NativeBridge } from "../native.js";

const execFileP = promisify(execFile);

/**
 * Reads a copy of Chrome's on-disk cookie store after macOS authorizes the
 * Safe Storage keychain read. App-bound v20 rows cannot be decrypted here.
 * Cookies are imported through the native Profile bridge; values are never
 * logged, returned, or persisted by Aux.
 */

export interface CookieImportResult {
  ok: boolean;
  source: "profile";
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

interface CookieProfileSource {
  directory: string;
  safeStorageService: string;
}

const CHROME_PROFILES: readonly CookieProfileSource[] = [
  { directory: join(homedir(), "Library/Application Support/Google/Chrome"), safeStorageService: "Chrome Safe Storage" },
  { directory: join(homedir(), "Library/Application Support/Google/Chrome Beta"), safeStorageService: "Chrome Beta Safe Storage" },
  { directory: join(homedir(), "Library/Application Support/Chromium"), safeStorageService: "Chromium Safe Storage" },
];

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
    throw new AuxError(
      "backend_unavailable",
      `Could not read "${service}" from the keychain. Unlock it when macOS prompts and retry the import.`,
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
      native: NativeBridge;
      profileSources?: readonly CookieProfileSource[];
      readSafeStoragePassword?: (service: string) => Promise<string>;
    },
  ) {}

  private async inject(cookies: BrowserCookie[]): Promise<number> {
    const { native } = this.deps;
    if (!native.available()) {
      throw new AuxError("backend_unavailable", "Native Profile cookie import is unavailable.");
    }
    return (await native.setCookies(cookies)).count;
  }

  async importCookies(_opts: { source?: "auto" | "profile" } = {}): Promise<CookieImportResult> {
    if (!this.deps.native.available()) {
      throw new AuxError("backend_unavailable", "Native Profile cookie import is unavailable.");
    }

    // ---- profile path ----
    const source = (this.deps.profileSources ?? CHROME_PROFILES).find((candidate) => existsSync(candidate.directory));
    if (!source) {
      throw new AuxError("not_found", "no Chrome profile found on this machine");
    }
    const dir = source.directory;
    let profiles: string[];
    try {
      profiles = readdirSync(dir).filter(
        (p) => (p === "Default" || /^Profile \d+$/.test(p)) && existsSync(join(dir, p, "Cookies")),
      );
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "EPERM") {
        throw new AuxError(
          "backend_unavailable",
          "macOS is blocking reads of Chrome's profile directory. Grant Aux Full Disk Access in System Settings → Privacy & Security → Full Disk Access, then retry the import.",
        );
      }
      throw e;
    }
    if (!profiles.length) throw new AuxError("not_found", "Chrome profile has no Cookies store");

    const password = await (this.deps.readSafeStoragePassword ?? safeStoragePassword)(source.safeStorageService);
    const key = pbkdf2Sync(password, "saltysalt", 1003, 16, "sha1");

    const byKey = new Map<string, BrowserCookie>();
    let skipped = 0;
    let appBound = 0;
    // The copies hold encrypted_value blobs and any plaintext `value` rows —
    // they must not outlive the import (P1-11), hence the finally below.
    const tmp = mkdtempSync(join(tmpdir(), "aux-cookies-"));
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
      skipped: skipped + appBound + (cookies.length - imported),
      domains: new Set(cookies.map((c) => c.domain)).size,
      detail:
        appBound > 0
          ? `${appBound} cookie(s) use Chrome's app-bound encryption and cannot be imported from disk.`
          : `imported from ${profiles.length} Chrome profile(s)`,
    };
  }
}
