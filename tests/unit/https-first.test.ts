import { describe, expect, it } from "vitest";
import { HttpsFirst, isLocalDevHost } from "../../apps/desktop/main/https-first.js";

describe("isLocalDevHost", () => {
  it("recognises loopback, private ranges, link-local and dev TLDs", () => {
    for (const host of [
      "localhost", "app.localhost", "127.0.0.1", "127.55.0.9", "[::1]", "::1", "fe80::1",
      "10.0.0.4", "192.168.1.20", "172.16.5.5", "172.31.9.9", "169.254.1.1", "100.64.0.1",
      "printer.local", "api.internal", "service.test", "home.home.arpa", "nas.lan",
      "devbox", "buildserver",
    ]) expect(isLocalDevHost(host), host).toBe(true);
  });
  it("does not treat public hosts as local", () => {
    for (const host of ["example.com", "localhost.evil.com", "test.example.com", "172.15.0.1", "192.167.0.1", "8.8.8.8", "local.io"]) {
      expect(isLocalDevHost(host), host).toBe(false);
    }
  });
});

describe("HttpsFirst.upgrade", () => {
  it("upgrades http main-frame URLs and skips local hosts", () => {
    const first = new HttpsFirst();
    expect(first.upgrade("http://example.com/path?q=1")).toBe("https://example.com/path?q=1");
    expect(first.upgrade("http://a.b.example.co.uk/")).toBe("https://a.b.example.co.uk/");
    expect(first.upgrade("http://localhost:3000/app")).toBeUndefined();
    expect(first.upgrade("http://192.168.1.5/admin")).toBeUndefined();
    expect(first.upgrade("https://example.com/")).toBeUndefined();
    expect(first.upgrade("not a url")).toBeUndefined();
  });
  it("does not upgrade hosts the user continued to over http", () => {
    const first = new HttpsFirst();
    first.allowHttp("example.com");
    expect(first.upgrade("http://example.com/")).toBeUndefined();
    expect(first.upgrade("http://other.com/")).toBe("https://other.com/");
  });
  it("respects the enabled flag", () => {
    const first = new HttpsFirst();
    first.enabled = false;
    expect(first.upgrade("http://example.com/")).toBeUndefined();
  });
});

describe("HttpsFirst.httpFallback", () => {
  it("offers the original http URL only for upgraded hosts with no-TLS failures", () => {
    const first = new HttpsFirst();
    first.upgrade("http://old-site.com/page");
    // Connection refused → the original http address comes back.
    expect(first.httpFallback("https://old-site.com/page", -102)).toBe("http://old-site.com/page");
    // Cert failure on an upgraded host also offers http.
    expect(first.httpFallback("https://old-site.com/page", -202)).toBe("http://old-site.com/page");
    // A host the user typed https:// for never gets a downgrade.
    expect(first.httpFallback("https://typed.example/", -102)).toBeUndefined();
    // DNS errors don't suggest "no TLS".
    expect(first.httpFallback("https://old-site.com/page", -105)).toBeUndefined();
    // Non-https failures are ignored.
    expect(first.httpFallback("http://old-site.com/page", -102)).toBeUndefined();
  });
});
