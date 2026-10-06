import { expect, it } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { duplicateTabs, protectedDuplicateIds } from "./duplicate-tabs";
import { emptyLayout } from "./workspace";

const tab = (pageId: string, lastActiveAt: number, extra: Partial<PageTarget> = {}) =>
  ({
    pageId,
    lastActiveAt,
    url: "https://example.com/",
    viewStatus: "hidden",
    controller: "none",
    ownedByRuntime: false,
    ...extra,
  }) as PageTarget;

it("preserves the active copy, separate Spaces, exact queries/fragments and controlled tabs", () => {
  const layout = { ...emptyLayout(), tabSpace: { other: "other-space" } };
  const pages = [
    tab("old", 1),
    tab("newest", 9),
    tab("active", 2),
    tab("other", 0),
    tab("query", 0, { url: "https://example.com/?account=2" }),
    tab("fragment", 0, { url: "https://example.com/#section" }),
    tab("agent", 0, { controller: "agent" }),
    tab("external", 0, { controller: "external" }),
    tab("worker", 0, { ownedByRuntime: true }),
    tab("blank1", 0, { url: "about:blank" }),
    tab("blank2", 0, { url: "about:blank" }),
  ];
  expect(duplicateTabs(pages, layout, "active")).toEqual(["old", "newest"]);
  expect(duplicateTabs(pages, layout, null)).toEqual(["old", "active"]);
  expect(
    duplicateTabs(
      pages.filter((page) => page.pageId !== "active" && page.pageId !== "newest"),
      layout,
      null,
    ),
  ).toEqual([]);
});

it("keeps pinned and playing copies out of a duplicate cleanup proposal", () => {
  const layout = emptyLayout();
  const pages = [
    tab("pinned", 1),
    tab("playing", 2),
    tab("extra", 3),
    tab("other", 4, { url: "https://other.test/" }),
  ];
  expect(duplicateTabs(pages, layout, null, new Set(["pinned", "playing"]))).toEqual(["extra"]);
  expect(duplicateTabs(pages, layout, "playing", new Set(["pinned", "playing"]))).toEqual(["extra"]);
});

it("derives protection from Space pins and live audio before proposing cleanup", () => {
  const base = emptyLayout();
  const layout = {
    ...base,
    pins: { [base.activeSpaceId]: [{ url: "https://example.com/", title: "Pinned" }] },
  };
  const pages = [
    tab("pinned-copy", 1),
    tab("playing", 2, { url: "https://media.test/" }),
    tab("media-extra", 3, { url: "https://media.test/" }),
  ];
  const protectedIds = protectedDuplicateIds(pages, layout, { playing: { audible: true } });
  expect([...protectedIds]).toEqual(["pinned-copy", "playing"]);
  expect(duplicateTabs(pages, layout, null, protectedIds)).toEqual(["media-extra"]);
});
