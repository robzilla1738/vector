import { expect, it } from "vitest";
import { OrganizationLayoutSchema, HostMethods } from "@aux/contracts";
import { emptyLayout } from "../../apps/shell/src/workspace";
import { toOrganizationLayout } from "../../apps/shell/src/store/organization-layout";

it("bounds finished archives and pending reservations independently, with unique receipts and pages", () => {
  const archivedTabs = Array.from({ length: 320 }, (_, index) => ({ archiveId: `receipt-${index}`, pageId: `page-${index}`, url: "https://example.test/article", title: "Article", spaceId: "space-personal", index: 0, archivedAt: 1, state: index < 300 ? "archived" as const : "pending" as const, reason: "auto" as const, batchId: "batch" }));
  const layout = toOrganizationLayout(emptyLayout());
  const valid = { ...layout, shared: { ...layout.shared, archivedTabs } };
  expect(OrganizationLayoutSchema.safeParse(valid).success).toBe(true);
  for (const change of [
    { ...archivedTabs[300]!, state: "archived" },
    { ...archivedTabs[0]!, state: "pending" },
    { ...archivedTabs[0]!, pageId: archivedTabs[1]!.pageId },
    { ...archivedTabs[0]!, archiveId: archivedTabs[1]!.archiveId },
  ]) {
    const entries = [...archivedTabs];
    entries[change.state === "archived" && change.pageId === "page-300" ? 300 : 0] = change as typeof archivedTabs[number];
    expect(OrganizationLayoutSchema.safeParse({ ...valid, shared: { ...valid.shared, archivedTabs: entries } }).success).toBe(false);
  }
});

it("requires guarded archive identity and complete native media snapshots", () => {
  expect(HostMethods.archiveTab.args.safeParse(["page", "https://example.test", "batch", 1]).success).toBe(true);
  expect(HostMethods.archiveTab.args.safeParse(["page", "invalid", "batch", -1]).success).toBe(false);
  expect(HostMethods.tabAudio.result.safeParse({ page: { muted: false, audible: false, video: true, pip: false } }).success).toBe(true);
  expect(HostMethods.tabAudio.result.safeParse({ page: { muted: false, audible: false } }).success).toBe(false);
});
