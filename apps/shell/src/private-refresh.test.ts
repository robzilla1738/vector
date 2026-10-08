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

it("keeps native tabs usable when the private AI session is unavailable", async () => {
  bridge.privateMode = true;
  const catalog = vi.spyOn(bridge, "tabsSnapshot").mockResolvedValue({ version: 0, tabs: [], windows: [] });
  const runtime = vi.spyOn(bridge, "invoke");
  vi.spyOn(bridge, "capabilities").mockResolvedValue({
    buildId: "test",
    sourceCommit: "a".repeat(40),
    methods: [],
  });
  vi.spyOn(globalThis, "setTimeout").mockReturnValue(0 as unknown as ReturnType<typeof setTimeout>);
  await useStore.getState().refresh();
  expect(catalog).toHaveBeenCalledOnce();
  expect(runtime).not.toHaveBeenCalled();
  expect(useStore.getState().connected).toBe(false);
  expect(useStore.getState().toasts).toHaveLength(1);
});
