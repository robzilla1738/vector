import { expect, it, vi } from "vitest";
import { hostBlocked, installTrackerBlock } from "../../apps/desktop/main/tracker-block.js";
import { TRACKER_HOSTS } from "../../apps/desktop/main/tracker-hosts.js";

type Session = Parameters<typeof installTrackerBlock>[0];

function setup(enabled = true) {
  let handler: ((details: { url: string; resourceType: string }, callback: (response: { cancel?: boolean }) => void) => void) | undefined;
  const blocked: string[] = [];
  const ses = { webRequest: { onBeforeRequest: (fn: typeof handler) => { handler = fn; } } } as unknown as Session;
  installTrackerBlock(ses, { enabled: () => enabled, onBlocked: url => blocked.push(url) });
  return {
    blocked,
    request: (url: string, resourceType = "script") => {
      const callback = vi.fn();
      handler!({ url, resourceType }, callback);
      return callback.mock.calls[0]?.[0] ?? {};
    },
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
    expect(fixture.request("https://a.doubleclick.net/serve", resourceType), resourceType).toEqual({ cancel: true });
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
  const fixture = setup(false);
  expect(fixture.request("https://a.doubleclick.net/serve", "script")).toEqual({});
  expect(fixture.blocked).toHaveLength(0);
});

it("ignores malformed request URLs", () => {
  const fixture = setup();
  expect(fixture.request("not a url", "script")).toEqual({});
});
