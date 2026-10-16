// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { ComposerProjectControl } from "./ComposerProjectControl";
const commands = vi.hoisted(() => vi.fn());
vi.mock("../commands", () => ({ runCommand: commands }));
const initial = useStore.getState();
const identity = {
  windowId: bridge.windowId,
  windowKind: bridge.windowKind,
  privateMode: bridge.privateMode,
};
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  useStore.setState({ composerPreferences: {} });
  bridge.privateMode = false;
  commands.mockReset();
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  Object.assign(bridge, identity);
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const render = (workspaceId: string | undefined = "space-a") =>
  act(async () =>
    root.render(<ComposerProjectControl draftKey="new" workspaceId={workspaceId} disabled={false} />),
  );
const menu = () => document.querySelector<HTMLElement>('[role="dialog"][aria-label="Composer project"]')!;
const item = (text: string) =>
  [...menu().querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent?.trim() === text,
  )!;
const open = () =>
  act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Composer project"]')!.click());
it("loads on opening, offers only reviewed writable folders, and selects without starting work or changing other preferences", async () => {
  const rpc = vi.spyOn(bridge, "invoke").mockResolvedValue([
    { folderId: "write", path: "/tmp/project-a", access: "readWrite" },
    { folderId: "read", path: "/tmp/read-only", access: "read" },
    { folderId: "changed", path: "/tmp/changed", access: "readWrite", agentsChanged: true },
    { folderId: "archived", path: "/tmp/archived", access: "readWrite", archivedAt: 1 },
  ] as never);
  useStore.setState({
    composerPreferences: { new: { privateTask: false, reasoning: "high", modelId: "synthetic/model" } },
  });
  await render();
  expect(rpc).not.toHaveBeenCalled();
  await open();
  expect(rpc).toHaveBeenCalledExactlyOnceWith("workspaces.folders.list", { workspaceId: "space-a" });
  expect(menu().textContent).toContain("project-a");
  expect(menu().textContent).not.toMatch(/read-only|changed|archived/);
  await act(async () => item("project-a").click());
  expect(menu()).toBeNull();
  expect(useStore.getState().composerPreferences.new).toEqual({
    privateTask: false,
    reasoning: "high",
    modelId: "synthetic/model",
    projectRoot: "/tmp/project-a",
  });
  expect(commands).not.toHaveBeenCalled();
  expect(rpc).toHaveBeenCalledTimes(1);
});
it("keeps an unavailable choice through failure and retries without silently clearing it", async () => {
  const rpc = vi.spyOn(bridge, "invoke").mockRejectedValueOnce(new Error("Synthetic offline"));
  useStore.setState({ composerPreferences: { new: { privateTask: false, projectRoot: "/tmp/retained" } } });
  await render();
  await open();
  expect(menu().textContent).toContain("Projects couldn’t load.");
  expect(useStore.getState().composerPreferences.new?.projectRoot).toBe("/tmp/retained");
  rpc.mockResolvedValue([] as never);
  await act(async () => item("Retry").click());
  expect(menu().textContent).toContain("selected project is unavailable");
  await act(async () => item("Automatic").click());
  expect(useStore.getState().composerPreferences.new?.projectRoot).toBeUndefined();
});
it("retires the previous Space menu and ignores its late folder catalog", async () => {
  let complete!: (value: unknown) => void;
  vi.spyOn(bridge, "invoke").mockImplementation(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }) as never,
  );
  await render();
  await open();
  await act(async () => root.render(<ComposerProjectControl draftKey="new" disabled={false} />));
  expect(menu()).toBeNull();
  await act(async () => complete([{ folderId: "old", path: "/tmp/old", access: "readWrite" }]));
  expect(host.textContent).not.toContain("old");
  expect(host.querySelector<HTMLButtonElement>("button")!.disabled).toBe(true);
});
it("opens the real Projects review route without granting folder access", async () => {
  const rpc = vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
  await render();
  await open();
  await act(async () => item("Use an existing folder").click());
  expect(window.location.pathname).toBe("/settings/projects");
  expect(useStore.getState().settingsCategory).toBe("Projects");
  expect(commands).toHaveBeenCalledExactlyOnceWith("settings");
  expect(rpc).toHaveBeenCalledTimes(1);
});
it("omits private-Profile projects and prevents local selection for a cloud run", async () => {
  const rpc = vi.spyOn(bridge, "invoke");
  bridge.privateMode = true;
  await render();
  expect(host.textContent).toBe("");
  expect(rpc).not.toHaveBeenCalled();
  bridge.privateMode = false;
  await act(async () =>
    useStore.setState({ composerPreferences: { new: { privateTask: false, executionTarget: "cloud" } } }),
  );
  await render();
  expect(host.querySelector<HTMLButtonElement>("button")!.disabled).toBe(true);
});

it("rejects a folder click after the native window identity changes", async () => {
  vi.spyOn(bridge, "invoke").mockResolvedValue([
    { folderId: "project", path: "/tmp/project", access: "readWrite" },
  ] as never);
  await render();
  await open();
  bridge.windowId = `${identity.windowId}-retired`;
  await act(async () => item("project").click());
  expect(useStore.getState().composerPreferences.new).toBeUndefined();
});
