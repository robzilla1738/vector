// @vitest-environment jsdom

import { expect, it } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { canClaim, inSharedSidebar, isLocal, ownPages } from "../../tab-window-transfer";

const page = (windowId: string, fields = {}) => ({ windowId, ownedByRuntime: false, viewStatus: "hidden", controller: "none", ...fields }) as PageTarget;
it("shares normal human rows while keeping surfaces in their owning window", () => {
  const local = page("a"), remote = page("b");
  expect([local, remote].filter(item => inSharedSidebar(item, "a"))).toEqual([local, remote]);
  expect(ownPages([local, remote], "a")).toEqual([local]);
  expect(isLocal(remote, "a")).toBe(false);
});
it("excludes anchors, workers, detached and special-window rows", () => {
  for (const fields of [{ anchor: true }, { ownedByRuntime: true }, { viewStatus: "detached" }, { windowKind: "little" }, { windowKind: "quick-ask" }, { windowKind: "private" }]) {
    expect(inSharedSidebar(page("a", fields), "a")).toBe(false);
    expect(canClaim(page("a", fields))).toBe(false);
  }
  expect(inSharedSidebar(page("a", { windowKind: "little" }), "a", "little")).toBe(true);
  expect(inSharedSidebar(page("b", { windowKind: "little" }), "a", "little")).toBe(false);
});
it("never claims agent-owned or externally controlled human tabs", () => {
  expect(canClaim(page("b", { controller: "agent" }))).toBe(false);
  expect(canClaim(page("b", { controller: "external" }))).toBe(false);
  expect(canClaim(page("b"))).toBe(true);
});

it("keeps local agent-owned surfaces local without making them claimable", () => {
  const worker = page("a", { ownedByRuntime: true, controller: "agent" });
  expect(isLocal(worker, "a")).toBe(true);
  expect(ownPages([worker], "a")).toEqual([worker]);
  expect(canClaim(worker)).toBe(false);
  const controlled = page("b", { controller: "agent" });
  expect(inSharedSidebar(controlled, "a")).toBe(true);
  expect(canClaim(controlled)).toBe(false);
});
