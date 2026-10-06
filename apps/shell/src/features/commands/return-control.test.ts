import { normalizePages } from "../../store/pages";
// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { COMMANDS, type PageTarget } from "@aux/contracts";
import { executeCommand, dispatchShortcut } from "../../commands";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import * as registry from "../registry";
const initial = useStore.getState();
const page: PageTarget = {
  pageId: "person-page",
  windowId: bridge.windowId,
  backend: "aux",
  targetId: "native-tab",
  url: "https://example.test",
  title: "Person page",
  documentEpoch: 1,
  lastRevision: 0,
  controller: "human",
  controllerEpoch: 2,
  ownedByRuntime: true,
  viewStatus: "visible",
  createdAt: 1,
  lastActiveAt: 1,
};
afterEach(() => {
  vi.restoreAllMocks();
  useStore.setState(initial, true);
});
it("routes the remapped Return control chord to the original active person-held page", () => {
  vi.spyOn(registry, "runFeatureCommand").mockReturnValue({ handled: false });
  const returnControl = vi.fn().mockResolvedValue(undefined);
  useStore.setState({
    pages: normalizePages([page]),
    activePageId: page.pageId,
    returnControl,
    settings: {
      ...initial.settings,
      shortcutOverrides: { "return-agent-control": [{ key: "u", command: true, alt: true }] },
    },
  });
  expect(COMMANDS.find((command) => command.id === "return-agent-control")?.handler).toBe("shell");
  expect(dispatchShortcut({ key: "u", meta: true, alt: true, shift: false })).toBe(true);
  expect(returnControl).toHaveBeenCalledExactlyOnceWith(page.pageId);
});
it("awaits the existing native Return control operation without granting authority itself", async () => {
  vi.spyOn(registry, "runFeatureCommand").mockReturnValue({ handled: false });
  let acknowledge!: () => void;
  const returnControl = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        acknowledge = resolve;
      }),
  );
  useStore.setState({ pages: normalizePages([page]), activePageId: page.pageId, returnControl });
  let completed = false;
  const operation = executeCommand("return-agent-control", { payload: { pageId: page.pageId } }).then(() => {
    completed = true;
  });
  await Promise.resolve();
  expect(completed).toBe(false);
  acknowledge();
  await operation;
  expect(completed).toBe(true);
  expect(returnControl).toHaveBeenCalledExactlyOnceWith(page.pageId);
});
it("refuses changed, missing, non-person and detached pages before the native operation", async () => {
  vi.spyOn(registry, "runFeatureCommand").mockReturnValue({ handled: false });
  const returnControl = vi.fn();
  for (const state of [
    { pages: [page], activePageId: "another-page" },
    { pages: [], activePageId: page.pageId },
    { pages: [{ ...page, controller: "agent" as const }], activePageId: page.pageId },
    { pages: [{ ...page, viewStatus: "detached" as const }], activePageId: page.pageId },
    { pages: [{ ...page, viewStatus: "crashed" as const }], activePageId: page.pageId },
  ]) {
    useStore.setState({ ...state, pages: normalizePages(state.pages), returnControl });
    await expect(
      executeCommand("return-agent-control", { payload: { pageId: page.pageId } }),
    ).rejects.toThrow(/selected page changed/);
  }
  expect(returnControl).not.toHaveBeenCalled();
});

it("registers Take control and suppresses duplicate pending native requests", async () => {
  vi.spyOn(registry, "runFeatureCommand").mockReturnValue({ handled: false });
  let acknowledge!: (result: unknown) => void;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(
    () =>
      new Promise((resolve) => {
        acknowledge = resolve;
      }),
  );
  useStore.setState({ pages: normalizePages([{ ...page, controller: "agent" }]), activePageId: page.pageId });
  const operation = executeCommand("take-page-control", { payload: { pageId: page.pageId } });
  let duplicateCompleted = false;
  const duplicate = executeCommand("take-page-control", { payload: { pageId: page.pageId } }).then(() => {
    duplicateCompleted = true;
  });
  await Promise.resolve();
  expect(duplicateCompleted).toBe(false);
  expect(invoke).toHaveBeenCalledExactlyOnceWith("pages.takeover", { pageId: page.pageId });
  acknowledge(page);
  await Promise.all([operation, duplicate]);
  expect(duplicateCompleted).toBe(true);
  invoke.mockResolvedValue(page);
  await executeCommand("take-page-control", { payload: { pageId: page.pageId } });
  expect(invoke).toHaveBeenCalledTimes(2);
});
it("refuses Take control of a missing or person-held page before native ingress", async () => {
  vi.spyOn(registry, "runFeatureCommand").mockReturnValue({ handled: false });
  const invoke = vi.spyOn(bridge, "invoke");
  useStore.setState({ pages: normalizePages([page]), activePageId: page.pageId });
  await expect(executeCommand("take-page-control")).rejects.toThrow(/selected page changed/);
  expect(invoke).not.toHaveBeenCalled();
});
it("releases the pending Take control guard after the original native refusal", async () => {
  vi.spyOn(registry, "runFeatureCommand").mockReturnValue({ handled: false });
  const invoke = vi
    .spyOn(bridge, "invoke")
    .mockRejectedValueOnce(new Error("Original native refusal"))
    .mockResolvedValue(page);
  useStore.setState({
    pages: normalizePages([{ ...page, controller: "external" }]),
    activePageId: page.pageId,
  });
  await expect(executeCommand("take-page-control")).rejects.toThrow("Original native refusal");
  await executeCommand("take-page-control");
  expect(invoke).toHaveBeenCalledTimes(2);
});
