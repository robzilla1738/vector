import { createCipheriv, createHash, pbkdf2Sync } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { MethodSchemas } from "@aux/contracts";
import { chromeEpochToUnix, CookieService, decryptValue, mapSameSite } from "@aux/runtime";
import type { BrowserCookie } from "@aux/chromium-driver";

const KEY = pbkdf2Sync("test-password", "saltysalt", 1003, 16, "sha1");
const IV = Buffer.alloc(16, 0x20);

function encryptV10(plain: string): Buffer {
  const c = createCipheriv("aes-128-cbc", KEY, IV);
  return Buffer.concat([Buffer.from("v10"), c.update(plain, "utf8"), c.final()]);
}

describe("chrome cookie helpers", () => {
  it("converts chrome's 1601 epoch to unix seconds", () => {
    // 2025-01-01T00:00:00Z = 1735689600 unix = 13380163200000000 chrome-us
    expect(chromeEpochToUnix(13_380_163_200_000_000)).toBe(1_735_689_600);
    expect(chromeEpochToUnix(0)).toBeUndefined();
  });

  it("maps samesite ints", () => {
    expect(mapSameSite(0)).toBe("None");
    expect(mapSameSite(1)).toBe("Lax");
    expect(mapSameSite(2)).toBe("Strict");
    expect(mapSameSite(-1)).toBeUndefined();
  });

  it("decrypts v10 AES-CBC values", () => {
    expect(decryptValue(encryptV10("session-token-123"), KEY, 0)).toBe("session-token-123");
  });

  it("strips the SHA256(host) prefix for meta version ≥24", () => {
    const hash = createHash("sha256").update(".example.com").digest();
    const c = createCipheriv("aes-128-cbc", KEY, IV);
    const enc = Buffer.concat([
      Buffer.from("v10"),
      c.update(Buffer.concat([hash, Buffer.from("v42")])),
      c.final(),
    ]);
    expect(decryptValue(enc, KEY, 24)).toBe("v42");
  });

  it("returns null for app-bound v20 and plaintext passthrough", () => {
    expect(decryptValue(Buffer.concat([Buffer.from("v20"), Buffer.alloc(40)]), KEY, 0)).toBeNull();
    expect(decryptValue(Buffer.from("plain-value"), KEY, 0)).toBe("plain-value");
  });
});

describe("CookieService.importCookies — native Profile import", () => {
  const fixtures: string[] = [];
  afterEach(() => {
    for (const fixture of fixtures.splice(0)) rmSync(fixture, { recursive: true, force: true });
  });

  function profileSource() {
    const directory = mkdtempSync(join(tmpdir(), "aux-cookie-import-test-"));
    fixtures.push(directory);
    const profile = join(directory, "Default");
    mkdirSync(profile);
    const db = new DatabaseSync(join(profile, "Cookies"));
    db.exec(`CREATE TABLE meta (key TEXT, value TEXT);
      INSERT INTO meta VALUES ('version', '23');
      CREATE TABLE cookies (host_key TEXT, name TEXT, value TEXT, encrypted_value BLOB, path TEXT,
        expires_utc INTEGER, is_secure INTEGER, is_httponly INTEGER, samesite INTEGER, is_persistent INTEGER);`);
    const insert = db.prepare("INSERT INTO cookies VALUES (?, ?, ?, ?, '/', 0, 1, 1, 1, 0)");
    insert.run(".example.com", "plain", "plaintext", Buffer.alloc(0));
    insert.run(".example.com", "encrypted", "", encryptV10("session-token-123"));
    insert.run(".example.com", "bound", "", Buffer.concat([Buffer.from("v20"), Buffer.alloc(40)]));
    insert.run(".example.com", "", "malformed", Buffer.alloc(0));
    db.close();
    return { directory, safeStorageService: "Disposable Safe Storage" };
  }

  it("reads a disposable disk Profile, decrypts and imports through native Chromium", async () => {
    const source = profileSource();
    const received: BrowserCookie[] = [];
    const services: string[] = [];
    const svc = new CookieService({
      native: {
        available: () => true,
        setCookies: async (cookies: BrowserCookie[]) => {
          received.push(...cookies);
          return { count: cookies.length };
        },
      } as never,
      profileSources: [source],
      readSafeStoragePassword: async (service) => {
        services.push(service);
        return "test-password";
      },
    });
    const res = await svc.importCookies({ source: "auto" });
    expect(res).toMatchObject({ ok: true, source: "profile", imported: 2, skipped: 2, domains: 1 });
    expect(res.detail).toMatch(/1 cookie.*app-bound.*cannot be imported/);
    expect(services).toEqual(["Disposable Safe Storage"]);
    expect(received.map((cookie) => [cookie.name, cookie.value])).toEqual([
      ["plain", "plaintext"],
      ["encrypted", "session-token-123"],
    ]);
    expect(received.every((cookie) => cookie.httpOnly && cookie.secure && cookie.sameSite === "Lax")).toBe(
      true,
    );
    expect(JSON.stringify(res)).not.toContain("session-token-123");
    const original = new DatabaseSync(join(source.directory, "Default", "Cookies"), { readOnly: true });
    try {
      expect(original.prepare("SELECT count(*) AS count FROM cookies").get()?.count).toBe(4);
    } finally {
      original.close();
    }
  });

  it("rejects unavailable native import before reading a Profile or keychain", async () => {
    let keychainReads = 0;
    const svc = new CookieService({
      native: { available: () => false } as never,
      profileSources: [],
      readSafeStoragePassword: async () => {
        keychainReads++;
        return "test-password";
      },
    });
    await expect(svc.importCookies({ source: "profile" })).rejects.toThrow(
      /Native Profile cookie import is unavailable/,
    );
    expect(keychainReads).toBe(0);
  });

  it("rejects the removed attached source at the API boundary", () => {
    expect(MethodSchemas["chrome.importCookies"].safeParse({ source: "attached" }).success).toBe(false);
  });
});
