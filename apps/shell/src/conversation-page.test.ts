import { expect, it } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { conversationPage } from "./conversation-page";

const overrides: Partial<PageTarget>[] = [
  { pageId: "current", ownedByRuntime: false },
  { pageId: "linked", ownedByRuntime: false },
  { pageId: "worker", ownedByRuntime: true },
  { pageId: "closed", viewStatus: "detached" },
];
const pages: PageTarget[] = overrides.map(value => ({
  pageId: "fixture", backend: "aux", targetId: "fixture", url: "https://example.test", title: "Fixture",
  documentEpoch: 0, lastRevision: 0, viewStatus: "visible", controller: "human", controllerEpoch: 0,
  ownedByRuntime: false, createdAt: 0, lastActiveAt: 0, ...value,
}));

it("keeps an explicit new-tab choice separate from the linked and current tabs", () => {
  expect(conversationPage(pages, "none", "current", "linked")).toBeUndefined();
  expect(conversationPage(pages, "active", "current", "linked")?.pageId).toBe("current");
  expect(conversationPage(pages, "linked", "current", "linked")?.pageId).toBe("linked");
});
it("does not replace an unavailable explicit selection with another page", () => {
  for (const selection of ["missing", "worker", "closed"]) expect(conversationPage(pages, selection, "current", "linked")).toBeUndefined();
});
