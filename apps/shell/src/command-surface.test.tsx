import { normalizePages } from "./store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("./feature-availability", async () => {
  const { featureEnabled } = await import("@aux/contracts");
  return { featureStage: () => "on", featureAvailable: () => true, featureVisible: featureEnabled };
});
vi.mock("./use-feature", () => ({ featureStage: () => "on", useFeature: () => true }));
import { COMMANDS, type CommandDef } from "@aux/contracts";
import { CommandSurface } from "./components/CommandSurface";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { closeCommandSurface, openCommandSurface } from "./command-surface-state";
import { commandSurfaceWorkRows } from "./command-surface-providers";
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const page = {
  pageId: "p1",
  url: "https://example.com/red",
  title: "Red",
  backend: "aux",
  ownedByRuntime: false,
  viewStatus: "live",
};
const settle = () => act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView ??= () => {};
  useStore.setState({
    pages: normalizePages([page] as never),
    activePageId: "p1",
    bookmarks: [],
    closedTabs: [],
    programs: [],
    runs: [],
    sets: [],
    settings: {},
    conversationDrafts: {},
    overlay: null,
  } as never);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  closeCommandSurface();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("renders only registered commands and awaits the supplied real dispatcher boundary", async () => {
  let done: (() => void) | undefined;
  const execute = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        done = resolve;
      }),
  );
  await act(async () =>
    root.render(
      <CommandSurface
        request={{ mode: "command", sequence: 1, seed: "settings" }}
        executeCommand={execute}
      />,
    ),
  );
  const registered = new Set(COMMANDS.map((command) => command.id));
  const rows = [...host.querySelectorAll<HTMLElement>("[data-command-id]")];
  expect(rows.length).toBeGreaterThan(0);
  expect(rows.every((row) => registered.has(row.dataset.commandId as never))).toBe(true);
  await act(async () =>
    host
      .querySelector("input")!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })),
  );
  expect(execute).toHaveBeenCalledWith("settings");
  expect(host.querySelector("input")?.getAttribute("aria-busy")).toBe("true");
  await act(async () => done?.());
  await settle();
  expect(host.querySelector("input")?.getAttribute("aria-busy")).toBeNull();
});
it("split provider rows carry registered split-add payloads, not ad hoc actions", async () => {
  const layout = useStore.getState().layout;
  useStore.setState({
    pages: normalizePages([
      page,
      { ...page, pageId: "p2", title: "Blue", url: "https://example.com/blue" },
    ] as never),
    layout: { ...layout, tabSpace: { p1: layout.activeSpaceId, p2: layout.activeSpaceId } },
  } as never);
  const execute = vi.fn().mockResolvedValue(undefined);
  await act(async () =>
    root.render(
      <CommandSurface
        request={{ mode: "command", provider: "split", sequence: 2 }}
        executeCommand={execute}
      />,
    ),
  );
  const row = host.querySelector('[data-command-id="split-add"] [role="option"]');
  expect(row?.textContent).toContain("Blue");
  await act(async () => row!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await settle();
  expect(execute).toHaveBeenCalledWith("split-add", { payload: { pageId: "p2" } });
});
it("retains bounded task, note, draft and Set parity with query lifetime fencing", () => {
  const state = useStore.getState();
  const space = state.layout.spaces[0]!;
  useStore.setState({
    sets: [{ setId: "set1", name: "Review collection", memberIds: [] }],
    conversationDrafts: { new: "Review draft" },
  } as never);
  const work = {
    query: "Review",
    tasks: [{ taskId: "task1", title: "Review", objective: "Review task" }],
    memory: [{ workspaceId: space.workspaceId, name: "Review notes", excerpt: "Notes", enabled: true }],
    prepared: [],
  };
  const rows = commandSurfaceWorkRows("Review", work as never);
  expect(rows.some((row) => row.id === "task-task1")).toBe(true);
  expect(rows.some((row) => row.id === "set-set1")).toBe(true);
  expect(commandSurfaceWorkRows("Different", work as never)).toEqual([]);
});
it("an old command completion cannot close a replacement surface request", () => {
  vi.spyOn(bridge, "overlay").mockResolvedValue(true);
  openCommandSurface({ mode: "command" });
  openCommandSurface({ mode: "new-tab" });
  closeCommandSurface(0);
  expect(useStore.getState().overlay).toBe("command-surface");
});

it("opens command mode with registered rows before typing and declares supported window boundaries", async () => {
  await act(async () =>
    root.render(
      <CommandSurface
        request={{ mode: "command", sequence: 9 }}
        executeCommand={vi.fn().mockResolvedValue(undefined)}
      />,
    ),
  );
  expect(host.querySelector('[data-command-id="settings"]')).not.toBeNull();
  for (const id of ["new-tab", "open-address", "palette"]) {
    const command = COMMANDS.find((command) => command.id === id)!;
    expect((command as CommandDef).windows).toEqual(["normal", "private"]);
  }
});

it("keeps tasks, archived notes, drafts and Sets in the explicit Work scope", async () => {
  const state = useStore.getState();
  const archived = {
    ...state.layout.spaces[0]!,
    id: "archived",
    workspaceId: "archived-memory",
    name: "Archived",
  };
  useStore.setState({
    layout: { ...state.layout, archivedSpaces: [archived] },
    sets: [{ setId: "review-set", name: "Review collection", memberIds: [] }],
    conversationDrafts: { new: "Review draft" },
  } as never);
  const work = {
    query: "Review",
    tasks: [{ taskId: "review-task", title: "Review task", objective: "Review" }],
    memory: [
      { workspaceId: archived.workspaceId, name: "Review notes", excerpt: "Archived notes", enabled: true },
    ],
    prepared: [],
  };
  await act(async () =>
    root.render(
      <CommandSurface request={{ mode: "new-tab", sequence: 20, seed: "Review" }} executeCommand={vi.fn()} />,
    ),
  );
  const rows = commandSurfaceWorkRows("Review", work as never);
  expect(rows.map((row) => row.section)).toEqual(
    expect.arrayContaining(["tasks", "memory", "chats", "sets"]),
  );
  const { CommandBar } = await import("./components/CommandBar");
  await act(async () =>
    root.render(<CommandBar surfaceMode="new-tab" seed="Review" providerRows={() => rows} />),
  );
  const workButton = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent === "Work",
  )!;
  expect(workButton).toBeDefined();
  await act(async () => workButton.click());
  for (const title of ["Review task", "Review notes", "Review collection", "Review draft"])
    expect(host.textContent).toContain(title);
  const note = rows.find((row) => row.section === "memory")!;
  useStore.setState({ layout: { ...useStore.getState().layout, archivedSpaces: [] } });
  expect(() => note.run()).toThrow("The Space is no longer available");
});

it("removes disabled Labs commands immediately and restores them when enabled", async () => {
  await act(async () =>
    root.render(
      <CommandSurface
        request={{ mode: "command", sequence: 1, seed: "New Space" }}
        executeCommand={vi.fn()}
      />,
    ),
  );
  expect(host.querySelector('[data-command-id="command-new-space"]')).not.toBeNull();
  await act(async () => useStore.setState({ settings: { featureOverrides: { spaces: false } } }));
  expect(host.querySelector('[data-command-id="command-new-space"]')).toBeNull();
  await act(async () => useStore.setState({ settings: { featureOverrides: { spaces: true } } }));
  expect(host.querySelector('[data-command-id="command-new-space"]')).not.toBeNull();
});
