// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "./bridge";
import { useStore } from "./store";

const initial = useStore.getState();
afterEach(() => {
  vi.restoreAllMocks();
  bridge.privateMode = false;
  useStore.setState(initial, true);
});

it("refreshes native tabs in Private mode without contacting the unavailable runtime", async () => {
  bridge.privateMode = true;
  const catalog = vi.spyOn(bridge, "tabsSnapshot").mockResolvedValue({ version: 0, tabs: [], windows: [] });
  const runtime = vi.spyOn(bridge, "invoke");
  await useStore.getState().refresh();
  expect(catalog).toHaveBeenCalledOnce();
  expect(runtime).not.toHaveBeenCalled();
  expect(useStore.getState().toasts).toEqual([]);
});
