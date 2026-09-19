import { createCipheriv, createHash, pbkdf2Sync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { chromeEpochToUnix, CookieService, decryptValue, mapSameSite } from "@vector/runtime";
import type { BrowserCookie, BrowserDriver } from "@vector/engine-client";

const KEY = pbkdf2Sync("test-password", "saltysalt", 1003, 16, "sha1");
const IV = Buffer.alloc(16, 0x20);

function encryptV10(plain: string): Buffer {
  const c = createCipheriv("aes-128-cbc", KEY, IV);
  return Buffer.concat([Buffer.from("v10"), c.update(plain, "utf8"), c.final()]);
}

function fakeDriver(cookies: BrowserCookie[]): BrowserDriver {
  const jar: BrowserCookie[] = [];
  return {
    backend: "vector",
    async connect() {},
    async disconnect() {},
    isConnected: () => true,
    async listTargets() { return []; },
    async attach() { throw new Error("no"); },
    async getAllCookies() { return cookies; },
    async setCookies(cs) { jar.push(...cs); return cs.length; },
  };
}

const nullNative = { available: () => false } as never;

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
    const enc = Buffer.concat([Buffer.from("v10"), c.update(Buffer.concat([hash, Buffer.from("v42")])), c.final()]);
    expect(decryptValue(enc, KEY, 24)).toBe("v42");
  });

  it("returns null for app-bound v20 and plaintext passthrough", () => {
    expect(decryptValue(Buffer.concat([Buffer.from("v20"), Buffer.alloc(40)]), KEY, 0)).toBeNull();
    expect(decryptValue(Buffer.from("plain-value"), KEY, 0)).toBe("plain-value");
  });
});

describe("CookieService.importCookies — attached source", () => {
  const cookies: BrowserCookie[] = [
    { name: "sid", value: "x", domain: ".example.com", path: "/", secure: true, httpOnly: true, sameSite: "Lax" },
    { name: "", value: "bad", domain: ".example.com", path: "/", secure: false, httpOnly: false },
  ];

  it("imports from an attached chrome driver and skips malformed rows", async () => {
    const vector = fakeDriver([]);
    let setCount = 0;
    const spy = vector.setCookies;
    vector.setCookies = async (cs) => { setCount = cs.length; return spy!(cs); };
    const chrome = fakeDriver(cookies);
    (chrome as { backend: string }).backend = "chrome";
    const svc = new CookieService({ drivers: () => ({ vector, chrome }), native: nullNative });
    const res = await svc.importCookies({ source: "auto" });
    expect(res.source).toBe("attached");
    expect(res.imported).toBe(1);
    expect(res.skipped).toBe(1);
    expect(res.domains).toBe(1);
  });

  it("errors clearly when 'attached' is requested but nothing is connected", async () => {
    const svc = new CookieService({ drivers: () => ({ vector: fakeDriver([]), chrome: null }), native: nullNative });
    await expect(svc.importCookies({ source: "attached" })).rejects.toThrow(/no Chrome attached/);
  });
});
