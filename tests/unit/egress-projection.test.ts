import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { EgressRequestSchema } from "@aux/contracts";
import { projectEgressRequest, textFingerprints, phraseHashes } from "../../apps/runtime/src/safety/egress-projection.js";

const hash = (text: string) => createHash("sha256").update(text).digest("hex");

describe("native request projection reference", () => {
  it("transports fingerprints, exact origin and metadata without raw secret fields", () => {
    const projection = projectEgressRequest({
      url: "https://recipient.test/?private=query-secret-27891", method: "POST",
      body: Buffer.from("password=body-secret-238917"),
      headers: [["Cookie", "sid=cookie-secret-12897"], ["Authorization", "Bearer header-secret-19371"], ["X-Private", "custom-secret-17659"]],
    });
    const encoded = JSON.stringify(projection);
    for (const value of ["query-secret", "body-secret", "cookie-secret", "header-secret", "custom-secret", "password", "Cookie", "Bearer", "recipient.test"])
      expect(encoded).not.toContain(value);
    expect(projection).toMatchObject({ version: 1, phase: "send", headersComplete: true, projectionComplete: true });
    expect(projection.textHashes.length).toBeGreaterThan(0);
    expect(EgressRequestSchema.safeParse({ requestId: "x", bodyBase64: "secret" }).success).toBe(false);
  });

  it("binds method, exact URL, body, final headers and phase to the request digest", () => {
    const base = { url: "https://recipient.test/path", method: "POST", body: Buffer.from("hello"), headers: [["X-Value", "one"]] as Array<[string, string]> };
    const original = projectEgressRequest(base).requestDigest;
    for (const patch of [{ method: "PUT" }, { url: base.url + "?q=1" }, { body: Buffer.from("other") }, { headers: [["X-Value", "two"]] as Array<[string, string]> }, { phase: "preflight" as const }, { headersComplete: false }])
      expect(projectEgressRequest({ ...base, ...patch }).requestDigest).not.toBe(original);
    expect(projectEgressRequest({ ...base, headers: [["x-value", "one"]] }).requestDigest).toBe(original);
  });

  it("rejects binary, opaque-sized and oversized header/body inputs without truncation", () => {
    const base = { url: "https://recipient.test/", method: "POST" };
    expect(() => projectEgressRequest({ ...base, body: new Uint8Array([255]) })).toThrow();
    expect(() => projectEgressRequest({ ...base, body: new Uint8Array(65_537) })).toThrow(/bound/);
    expect(() => projectEgressRequest({ ...base, headers: [["X-Value", "x".repeat(16_385)]] })).toThrow(/bound/);
    expect(() => projectEgressRequest({ ...base, headers: Array.from({ length: 129 }, () => ["X", "a"]) })).toThrow(/bound/);
    expect(() => projectEgressRequest({ ...base, url: base.url + "x".repeat(2048) })).toThrow(/bound/);
  });

  it("defines native parity for Unicode normalization, whitespace, URI and base64 variants", () => {
    expect([...textFingerprints("ＡＢＣＤＥＦＧＨＩＪＫＬ")]).toEqual([hash("abcdefghijkl")]);
    expect([...textFingerprints("ABC\t\nDEF GHIJ")]).toEqual([hash("abc def ghij")]);
    const phrase = "selected meeting schedule requires";
    expect(phraseHashes(phrase.toUpperCase())).toEqual(new Set([hash(phrase)]));
    const secret = "aurora-keeper-784991";
    const projected = projectEgressRequest({ url: "https://example.test/", method: "POST", headers: [
      ["X-Percent", [...Buffer.from(secret)].map(byte => `%${byte.toString(16)}`).join("")],
      ["X-Encoded", Buffer.from(secret).toString("base64")],
    ] });
    for (const value of textFingerprints(secret)) expect(projected.textHashes).toContain(value);
  });
});
