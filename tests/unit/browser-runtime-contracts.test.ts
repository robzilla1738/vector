import { expect, it } from "vitest";
import { createClock, HostMethods, LiveFolderSchema, LinkRoutesSchema, SplitGroupSchema } from "@aux/contracts";

it("keeps live sources bounded and excludes connection secrets from layout", () => {
  const rss = { kind: "rss", config: { url: "https://fixture.invalid/feed" }, refreshMinutes: 15 };
  expect(LiveFolderSchema.parse(rss)).toEqual(rss);
  expect(LiveFolderSchema.safeParse({ ...rss, config: { url: "file:///private/feed" } }).success).toBe(false);
  expect(LiveFolderSchema.safeParse({ ...rss, refreshMinutes: 0 }).success).toBe(false);
  const github = { kind: "github", config: { connectionId: "fixture", source: "query" }, refreshMinutes: 15 };
  expect(LiveFolderSchema.safeParse(github).success).toBe(false);
  expect(LiveFolderSchema.safeParse({ ...github, config: { ...github.config, query: "repo:aux/fixture", token: "secret" } }).success).toBe(false);
  expect(LiveFolderSchema.safeParse({ ...github, config: { ...github.config, query: "repo:aux/fixture" } }).success).toBe(true);
});

it("rejects duplicate split members and invalid focused panes", () => {
  const split = { id: "split", panes: ["red", "blue"], layout: "row", ratios: [0.5], focused: "red" };
  expect(SplitGroupSchema.safeParse(split).success).toBe(true);
  expect(SplitGroupSchema.safeParse({ ...split, panes: ["red", "red"] }).success).toBe(false);
  expect(SplitGroupSchema.safeParse({ ...split, focused: "green" }).success).toBe(false);
  expect(SplitGroupSchema.safeParse({ ...split, layout: "grid" }).success).toBe(false);
});

it("bounds native stage visibility and permits hiding every page", () => {
  const args = HostMethods.setStageVisible.args;
  expect(args.safeParse([[]]).success).toBe(true);
  expect(args.safeParse([["red", "blue", "green", "yellow"]]).success).toBe(true);
  expect(args.safeParse([["red", "red"]]).success).toBe(false);
  expect(args.safeParse([["a", "b", "c", "d", "e"]]).success).toBe(false);
});

it("requires unique routing rules and known destinations", () => {
  const rule = { id: "rule", enabled: true, order: 0, match: { kind: "host", pattern: "fixture.invalid", subdomains: false },
    destination: { kind: "profile", profileId: "Default", window: "tab" }, hits: 0 };
  const config = { version: 1, revision: 0, enabled: true, inApp: "off", default: { kind: "last-used" }, rules: [rule] };
  expect(LinkRoutesSchema.safeParse(config).success).toBe(true);
  expect(LinkRoutesSchema.safeParse({ ...config, rules: [rule, rule] }).success).toBe(false);
  expect(LinkRoutesSchema.safeParse({ ...config, rules: [{ ...rule, destination: { kind: "private" } }] }).success).toBe(false);
});


it("scales elapsed ages and delays without changing native wall timestamps", () => {
  const clock = createClock(3600, () => 20000);
  expect(clock.now()).toBe(20000);
  expect(clock.elapsedSince(8000)).toBe(12 * 60 * 60 * 1000);
  expect(clock.elapsedSince(21000)).toBe(0);
  expect(clock.delayMs(12 * 60 * 60 * 1000)).toBe(12000);
  expect(createClock(1, () => 20000).elapsedSince(8000)).toBe(12000);
  for (const scale of [0, -1, Infinity, NaN, 100001]) expect(() => createClock(scale)).toThrow();
  expect(() => clock.delayMs(-1)).toThrow();
});
