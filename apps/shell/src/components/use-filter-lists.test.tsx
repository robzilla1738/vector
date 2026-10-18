// @vitest-environment jsdom
import { act, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { bridge, type FilterListStatus } from "../bridge";
import { useFilterLists, type FilterListsController } from "./use-filter-lists";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => vi.restoreAllMocks());

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const initial: FilterListStatus = {
  backend: "ublock_origin",
  cosmeticBackend: "native_user_styles",
  compilationWarnings: [],
  sources: [
    {
      id: "aaaaaaaaaaaa",
      name: "Research",
      url: "https://example.test/list",
      enabled: true,
      kind: "adblock",
    },
  ],
};
const updated: FilterListStatus = { ...initial, sources: [{ ...initial.sources[0]!, enabled: false }] };

it("never publishes an older catalog read over the original update result", async () => {
  const oldRead = deferred<FilterListStatus>();
  const update = deferred<FilterListStatus>();
  vi.spyOn(bridge, "filterLists").mockResolvedValueOnce(initial).mockReturnValueOnce(oldRead.promise);
  const write = vi.spyOn(bridge, "updateFilters").mockReturnValue(update.promise);
  let controller!: FilterListsController;
  function Fixture() {
    const next = useFilterLists(true);
    useLayoutEffect(() => {
      controller = next;
    });
    return null;
  }
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<Fixture />));
    let read!: Promise<void>;
    await act(async () => {
      read = controller.refresh();
    });
    let work!: ReturnType<FilterListsController["update"]>;
    await act(async () => {
      work = controller.update();
      void controller.update();
    });
    expect(write).toHaveBeenCalledTimes(1);
    await act(async () => {
      update.resolve(updated);
      await work;
    });
    expect(controller.status).toEqual(updated);
    await act(async () => {
      oldRead.resolve(initial);
      await read;
    });
    expect(controller.status).toEqual(updated);
    expect(controller.notice).toContain("Enabled lists checked");
    expect(controller.busy).toBe(false);
  } finally {
    await act(async () => root.unmount());
  }
});

it("joins original work across retirement, refuses stale callbacks and reads fresh state on reactivation", async () => {
  const update = deferred<FilterListStatus>();
  const read = vi.spyOn(bridge, "filterLists").mockResolvedValueOnce(initial).mockResolvedValue(updated);
  const write = vi.spyOn(bridge, "updateFilters").mockReturnValue(update.promise);
  let controller!: FilterListsController;
  function Fixture({ active }: { active: boolean }) {
    const next = useFilterLists(active);
    useLayoutEffect(() => {
      controller = next;
    });
    return null;
  }
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<Fixture active />));
    const original = controller;
    let work!: ReturnType<FilterListsController["update"]>;
    await act(async () => {
      work = controller.update();
    });
    await act(async () => root.render(<Fixture active={false} />));
    await act(async () => root.render(<Fixture active />));
    expect(controller.status).toBeNull();
    expect(controller.busy).toBe(true);
    await act(async () => {
      await original.update();
      await controller.update();
    });
    expect(write).toHaveBeenCalledTimes(1);
    expect(read).toHaveBeenCalledTimes(1);
    await act(async () => {
      update.resolve(updated);
      await work;
    });
    expect(read).toHaveBeenCalledTimes(2);
    expect(controller.status).toEqual(updated);
    expect(controller.notice).toBe("");
    await act(async () => {
      await original.update();
    });
    expect(write).toHaveBeenCalledTimes(1);
  } finally {
    await act(async () => root.unmount());
  }
});

it("ignores update rejection after unmount without retrying or starting another read", async () => {
  const update = deferred<FilterListStatus>();
  const read = vi.spyOn(bridge, "filterLists").mockResolvedValue(initial);
  const write = vi.spyOn(bridge, "updateFilters").mockReturnValue(update.promise);
  let controller!: FilterListsController;
  function Fixture() {
    const next = useFilterLists(true);
    useLayoutEffect(() => {
      controller = next;
    });
    return null;
  }
  const root = createRoot(document.createElement("div"));
  await act(async () => root.render(<Fixture />));
  let work!: ReturnType<FilterListsController["update"]>;
  await act(async () => {
    work = controller.update();
  });
  await act(async () => root.unmount());
  await act(async () => {
    update.reject(new Error("Original native failure"));
    await work;
    await controller.update();
  });
  expect(write).toHaveBeenCalledTimes(1);
  expect(read).toHaveBeenCalledTimes(1);
});

it("publishes native unavailability without claiming a completed update or retrying", async () => {
  vi.spyOn(bridge, "filterLists").mockResolvedValue(initial);
  const write = vi.spyOn(bridge, "updateFilters").mockResolvedValue({ ...initial, backend: "unavailable" });
  let controller!: FilterListsController;
  function Fixture() {
    const next = useFilterLists(true);
    useLayoutEffect(() => {
      controller = next;
    });
    return null;
  }
  const root = createRoot(document.createElement("div"));
  try {
    await act(async () => root.render(<Fixture />));
    await act(async () => {
      await controller.update();
    });
    expect(controller.status?.backend).toBe("unavailable");
    expect(controller.notice).toBe("");
    expect(controller.error).toContain("Native filtering unavailable");
    await act(async () => {
      await controller.update();
    });
    expect(write).toHaveBeenCalledTimes(1);
  } finally {
    await act(async () => root.unmount());
  }
});

it("keeps freshly read native status when a same-batch draft validation event uses its original render", async () => {
  vi.spyOn(bridge, "filterLists").mockResolvedValueOnce(initial).mockResolvedValue(updated);
  let controller!: FilterListsController;
  function Fixture() {
    const next = useFilterLists(true);
    useLayoutEffect(() => {
      controller = next;
    });
    return null;
  }
  const root = createRoot(document.createElement("div"));
  try {
    await act(async () => root.render(<Fixture />));
    const rendered = controller;
    await act(async () => {
      await rendered.refresh();
      rendered.reportError("Enter an HTTPS filter URL");
    });
    expect(controller.status).toEqual(updated);
    expect(controller.error).toBe("Enter an HTTPS filter URL");
  } finally {
    await act(async () => root.unmount());
  }
});
