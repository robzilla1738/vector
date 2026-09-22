import { expect, it } from "vitest";
import { decideRequest, hostBlocked, type PolicyHooks } from "../../apps/desktop/main/request-policy.js";
import { TRACKER_HOSTS } from "../../apps/desktop/main/tracker-hosts.js";
import type { OnBeforeRequestListenerDetails } from "electron";

function setup(opts: { enabled?: boolean; allowed?: string[]; upgrade?: (d: OnBeforeRequestListenerDetails) => string | undefined } = {}) {
  const blocked: string[] = [];
  const allowed = new Set((opts.allowed ?? []).map(h => h.toLowerCase()));
  const hooks: PolicyHooks = {
    httpsUpgrade: opts.upgrade,
    blockingEnabled: () => opts.enabled !== false,
    blockedHosts: () => TRACKER_HOSTS,
    hostAllowed: host => allowed.has(host.toLowerCase()),
    onBlocked: url => blocked.push(url),
  };
  return {
    blocked,
    request: (url: string, resourceType = "script", frameUrl = "https://site.test/") =>
      decideRequest({ url, resourceType, frame: { url: frameUrl } } as unknown as OnBeforeRequestListenerDetails, hooks),
  };
}

it("matches a domain and every subdomain but not sibling suffixes", () => {
  const hosts = new Set(["tracker.example", "ads.example.net"]);
  expect(hostBlocked(hosts, "tracker.example")).toBe(true);
  expect(hostBlocked(hosts, "a.b.tracker.example")).toBe(true);
  expect(hostBlocked(hosts, "TRACKER.example")).toBe(true);
  expect(hostBlocked(hosts, "nottracker.example")).toBe(false);
  expect(hostBlocked(hosts, "tracker.example.evil.test")).toBe(false);
  expect(hostBlocked(hosts, "example.net")).toBe(false);
});

it("ships a non-empty list of suffix-only domain entries", () => {
  expect(TRACKER_HOSTS.size).toBeGreaterThan(50);
  for (const host of TRACKER_HOSTS) {
    expect(host).toMatch(/^[a-z0-9.-]+\.[a-z]{2,}$/);
    expect(host).not.toContain("*");
  }
});

it("cancels subresource requests to listed hosts and counts them", () => {
  const fixture = setup();
  for (const resourceType of ["script", "xhr", "image", "subFrame", "ping", "stylesheet"]) {
    expect(fixture.request("https://a.doubleclick.net/serve", resourceType)).toEqual({ cancel: true });
  }
  expect(fixture.blocked).toHaveLength(6);
});

it("never cancels main-frame navigation or unlisted hosts", () => {
  const fixture = setup();
  expect(fixture.request("https://doubleclick.net/", "mainFrame")).toEqual({});
  expect(fixture.request("https://site.test/page", "mainFrame")).toEqual({});
  expect(fixture.request("https://site.test/app.js", "script")).toEqual({});
  expect(fixture.blocked).toHaveLength(0);
});

it("passes everything through while the toggle is off", () => {
  const fixture = setup({ enabled: false });
  expect(fixture.request("https://a.doubleclick.net/serve", "script")).toEqual({});
  expect(fixture.blocked).toHaveLength(0);
});

it("lets subresources through on sites the user allowed", () => {
  const fixture = setup({ allowed: ["site.test"] });
  expect(fixture.request("https://a.doubleclick.net/serve", "script", "https://site.test/")).toEqual({});
  // A different page host still blocks the same request.
  expect(fixture.request("https://a.doubleclick.net/serve", "script", "https://other.test/")).toEqual({ cancel: true });
});

it("ignores malformed request URLs and non-http schemes", () => {
  const fixture = setup();
  expect(fixture.request("not a url", "script")).toEqual({});
  expect(fixture.request("data:image/png;base64,x", "image")).toEqual({});
  expect(fixture.request("chrome-extension://abc/ad.js", "script")).toEqual({});
});

it("upgrades main-frame http requests before blocking checks", () => {
  const fixture = setup({
    upgrade: d => { const u = new URL(d.url); u.protocol = "https:"; return u.href; },
  });
  expect(fixture.request("http://doubleclick.net/", "mainFrame")).toEqual({ redirectURL: "https://doubleclick.net/" });
  expect(fixture.request("http://doubleclick.net/ad.js", "script")).toEqual({ cancel: true });
  expect(fixture.blocked).toHaveLength(1);
});
