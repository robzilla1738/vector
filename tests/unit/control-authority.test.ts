import { expect, it } from "vitest";
import { canResumeAfterPageRelease } from "@vector/runtime";

it("keeps a multi-page run paused until every human-held page is returned", () => {
  const pages = [
    { pageId: "page-a", controller: "none" as const },
    { pageId: "page-b", controller: "human" as const },
    { pageId: "unrelated", controller: "human" as const },
  ];
  expect(canResumeAfterPageRelease(["page-a", "page-b"], "page-a", pages)).toBe(false);
  expect(canResumeAfterPageRelease(["page-a", "page-b"], "page-b", pages.map(page => page.pageId === "page-b" ? { ...page, controller: "none" as const } : page))).toBe(true);
  expect(canResumeAfterPageRelease(["page-a"], "page-a", pages)).toBe(true);
});
