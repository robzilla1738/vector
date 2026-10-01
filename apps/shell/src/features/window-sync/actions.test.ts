import { afterEach, expect, it, vi } from "vitest";
import type { CommandContext } from "../registry";
const host = vi.hoisted(() => ({ showTabWindow: vi.fn() }));
vi.mock("../../bridge", () => ({ bridge: host }));
import { claimTab, showTabWindow } from "./actions";
afterEach(() => vi.resetAllMocks());
const current = (controller = "none", ownedByRuntime = false) => ({ activePageId: "selected", pages: [{ pageId: "selected", windowId: "owner", windowKind: "normal", viewStatus: "hidden", controller, ownedByRuntime }], activate: vi.fn().mockResolvedValue(undefined) }) as unknown as CommandContext;
it("uses the actual selected page for a remapped keyboard command and Show window never activates it", async () => {
  const state = current(); host.showTabWindow.mockResolvedValue(true);
  await showTabWindow(state, {});
  expect(host.showTabWindow).toHaveBeenCalledExactlyOnceWith("selected");
  expect(state.activate).not.toHaveBeenCalled();
  await claimTab(state, {});
  expect(state.activate).toHaveBeenCalledExactlyOnceWith("selected");
});
it("visibly refuses missing or invalid explicit targets before native work", async () => {
  const state = current();
  await expect(claimTab(state, { payload: { pageId: "gone" } })).rejects.toThrow("no longer available");
  await expect(showTabWindow(state, { payload: { spaceId: "wrong-kind" } })).rejects.toThrow("Choose a tab");
  expect(state.activate).not.toHaveBeenCalled(); expect(host.showTabWindow).not.toHaveBeenCalled();
});
it("refuses agent, external and runtime-owned claims while allowing Show window", async () => {
  host.showTabWindow.mockResolvedValue(true);
  for (const state of [current("agent"), current("external"), current("agent", true)]) {
    await expect(claimTab(state, {})).rejects.toThrow("working in this tab");
    expect(state.activate).not.toHaveBeenCalled();
    await showTabWindow(state, {});
  }
  host.showTabWindow.mockResolvedValue(false);
  await expect(showTabWindow(current(), {})).rejects.toThrow("window is no longer available");
});
