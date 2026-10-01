// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { emptyLayout } from "../../workspace";
import type { CommandContext } from "../registry";
const native = vi.hoisted(() => ({ windowKind: "little", littleWindow: vi.fn(), externalLinkTarget: vi.fn() }));
const peek = vi.hoisted(() => vi.fn());
vi.mock("../../bridge", () => ({ bridge: native }));
vi.mock("../../peek-link", () => ({ promotePeekLink: peek }));
import { openLittleWindow, promoteTab, setExternalLinkTarget } from "./actions";
afterEach(() => { native.windowKind = "little"; vi.resetAllMocks(); });
const state = () => ({ layout: emptyLayout(), peekPageId: null }) as CommandContext;
it("refuses an unavailable chosen Space before attempting native promotion", async () => {
  await expect(promoteTab(state(), { payload: { spaceId: "gone" } })).rejects.toThrow("no longer available");
  expect(native.littleWindow).not.toHaveBeenCalled();
});
it("promotes into the actual selected Space and surfaces native refusal", async () => {
  const current = state();
  const spaceId = current.layout.spaces[0]!.id;
  native.littleWindow.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
  await promoteTab(current, { payload: { spaceId } });
  expect(native.littleWindow).toHaveBeenCalledExactlyOnceWith("promote", { spaceId });
  await expect(promoteTab(current, {})).rejects.toThrow("could not move");
});
it("keeps Peek promotion on its existing live-page path and refuses a normal tab", async () => {
  native.windowKind = "normal";
  await expect(promoteTab(state(), {})).rejects.toThrow("Open a Peek or Little");
  expect(peek).not.toHaveBeenCalled();
  await promoteTab({ ...state(), peekPageId: "peek" }, {});
  expect(peek).toHaveBeenCalledTimes(1);
  expect(native.littleWindow).not.toHaveBeenCalled();
});
it("surfaces a failed native open and requires explicit external-link preference payload", async () => {
  native.littleWindow.mockResolvedValue(false);
  await expect(openLittleWindow()).rejects.toThrow("could not open");
  await expect(setExternalLinkTarget(state(), {})).rejects.toThrow("Choose Little");
  expect(native.externalLinkTarget).not.toHaveBeenCalled();
});

it("surfaces a refused external-link preference without announcing a saved change", async () => {
  const changed = vi.fn();
  window.addEventListener("aux-external-link-target-changed", changed);
  try {
    native.externalLinkTarget.mockResolvedValueOnce("little").mockResolvedValueOnce("main");
    await expect(setExternalLinkTarget(state(), { payload: { target: "main" } })).rejects.toThrow("could not save");
    expect(changed).not.toHaveBeenCalled();
    await setExternalLinkTarget(state(), { payload: { target: "main" } });
    expect(changed).toHaveBeenCalledTimes(1);
  } finally { window.removeEventListener("aux-external-link-target-changed", changed); }
});
