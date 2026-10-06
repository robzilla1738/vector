import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { act, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS, SCOPED_COMMANDS, TaskSchema, type Task } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { executeCommand, dispatchShortcut } from "../commands";
import { makePage } from "../mock/fixtures";
import { TaskResources } from "./TaskResources";
vi.mock("../use-feature", () => ({ useFeature: () => true, featureStage: () => "on" }));
const initial = useStore.getState(),
  originalWindow = bridge.windowId,
  originalPrivate = bridge.privateMode,
  originalKind = bridge.windowKind;
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const task = TaskSchema.parse({
  taskId: "original",
  workspaceId: "workspace",
  revision: 1,
  state: "open",
  createdAt: 1,
  updatedAt: 1,
  title: "Original",
  objective: "Keep reference authority",
  criteria: [{ criterionId: "one", description: "Original", verification: "manual" }],
  resources: [
    {
      resourceId: "reference",
      kind: "url",
      locator: "https://example.com/reference",
      label: "R".repeat(200),
      access: "reference",
    },
  ],
});
const page = makePage(0, { pageId: "page", title: "Original page", url: "https://example.com/owned" });
const update = vi.fn(async (_resources: Task["resources"]) => true);
const activate = vi.fn(async (_pageId: string) => undefined);
const newTab = vi.fn(async (_url: string) => page);
const ids = [
  "open-task-resource",
  "rename-task-resource",
  "save-task-resource-label",
  "cancel-task-resource-label",
  "set-task-resource-access",
  "remove-task-resource-reference",
  "attach-task-resource-page",
  "add-task-resource-url",
];
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  bridge.windowId = "original-window";
  bridge.privateMode = false;
  bridge.windowKind = "normal";
  useStore.setState(
    { ...initial, connected: false, pages: normalizePages([page]), activate, newTab, toasts: [] },
    true,
  );
  update.mockReset().mockResolvedValue(true);
  activate.mockClear();
  newTab.mockClear();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  bridge.windowId = originalWindow;
  bridge.privateMode = originalPrivate;
  bridge.windowKind = originalKind;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function render(value: Task = task) {
  await act(async () =>
    root.render(<TaskResources task={value} activePageId="page" attached={false} update={update} />),
  );
}
function control(id: string) {
  return host.querySelector<HTMLElement>(`[data-command-id="${id}"]`)!;
}
async function invoke(id: string) {
  let completion!: Promise<unknown>;
  await act(async () => {
    (control(id) instanceof HTMLFormElement
      ? control(id).querySelector<HTMLInputElement>("input")!
      : control(id)
    ).focus();
    completion = executeCommand(id);
    void completion.catch(() => {});
  });
  return { completion };
}
function held<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
it("eight additive normal scoped controls retain original reference labels and registry routes", async () => {
  await render();
  for (const id of ids) {
    const row = COMMANDS.find((row) => row.id === id);
    expect(row).toMatchObject({ dispatch: "scoped", windows: ["normal"], palette: false, bindings: [] });
    expect(SCOPED_COMMANDS.find((row) => row.id === id)).toBe(row);
  }
  expect(host.querySelector("strong")!.textContent).toBe(task.resources[0]!.label);
  expect(host.textContent).toContain("Reference-only never grants agent access");
  expect(host.textContent).toContain("not MCP/CLI authority");
});
it("actual remapped Rename and Cancel preserve full label and original Rename focus", async () => {
  await render();
  useStore.setState({
    settings: {
      ...initial.settings,
      shortcutOverrides: {
        "rename-task-resource": [{ key: "r", command: true, alt: true }],
        "cancel-task-resource-label": [{ key: "c", command: true, alt: true }],
      },
    },
  });
  const rename = control("rename-task-resource");
  rename.focus();
  await act(async () =>
    expect(dispatchShortcut({ key: "r", meta: true, alt: true, shift: false })).toBe(true),
  );
  const input = host.querySelector<HTMLInputElement>('[aria-label="Resource label"]')!;
  expect(input.value).toBe(task.resources[0]!.label);
  expect(input.maxLength).toBe(200);
  control("cancel-task-resource-label").focus();
  await act(async () =>
    expect(dispatchShortcut({ key: "c", meta: true, alt: true, shift: false })).toBe(true),
  );
  expect(document.activeElement).toBe(rename);
  expect(input.isConnected).toBe(false);
  expect(update).not.toHaveBeenCalled();
});
it("focused URL resource returns original new-tab ACK and existing tab chooses original activation", async () => {
  await render();
  expect(await (await invoke("open-task-resource")).completion).toBe(page);
  expect(newTab).toHaveBeenCalledWith(task.resources[0]!.locator);
  const existing = { ...page, url: task.resources[0]!.locator };
  await act(async () => useStore.setState({ pages: normalizePages([existing]) }));
  await (
    await invoke("open-task-resource")
  ).completion;
  expect(activate).toHaveBeenCalledWith(existing.pageId);
});
it("access selection and remove use original complete task resource snapshot", async () => {
  await render();
  const select = control("set-task-resource-access") as HTMLSelectElement;
  select.value = "read";
  expect(await (await invoke("set-task-resource-access")).completion).toBe(true);
  expect(update).toHaveBeenLastCalledWith([{ ...task.resources[0], access: "read" }]);
  await (
    await invoke("remove-task-resource-reference")
  ).completion;
  expect(update).toHaveBeenLastCalledWith([]);
});
it("registered Attach captures latest actual page and URL form preserves normalized producer", async () => {
  await render();
  const latest = { ...page, title: "Latest original page" };
  await act(async () => useStore.setState({ pages: normalizePages([latest]) }));
  await (
    await invoke("attach-task-resource-page")
  ).completion;
  expect(update).toHaveBeenLastCalledWith(
    expect.arrayContaining([expect.objectContaining({ kind: "page", locator: "page", label: latest.title })]),
  );
  const input = host.querySelector<HTMLInputElement>('[aria-label="Resource URL"]')!;
  input.value = "https://example.com/next";
  expect(await (await invoke("add-task-resource-url")).completion).toBe(true);
  expect(update).toHaveBeenLastCalledWith(
    expect.arrayContaining([
      expect.objectContaining({ kind: "url", locator: "https://example.com/next", label: "example.com" }),
    ]),
  );
});
it("Save exposes original false ACK and leaves original label editor mounted", async () => {
  await render();
  await (
    await invoke("rename-task-resource")
  ).completion;
  update.mockResolvedValueOnce(false);
  expect(await (await invoke("save-task-resource-label")).completion).toBe(false);
  expect(host.querySelector('[aria-label="Resource label"]')).not.toBeNull();
});
it("same-tick mutation reservation refuses duplicate until original ACK", async () => {
  await render();
  const old = held<boolean>();
  update.mockReturnValueOnce(old.promise);
  const a = (await invoke("remove-task-resource-reference")).completion;
  await expect((await invoke("remove-task-resource-reference")).completion).rejects.toThrow(
    "original editable",
  );
  expect(update).toHaveBeenCalledOnce();
  await act(async () => old.resolve(true));
  expect(await a).toBe(true);
  await (
    await invoke("remove-task-resource-reference")
  ).completion;
  expect(update).toHaveBeenCalledTimes(2);
});
it.each(["success", "failure"])(
  "held A save preserves %s identity without clearing fresh B editor",
  async (outcome) => {
    await render();
    await (
      await invoke("rename-task-resource")
    ).completion;
    const old = held<boolean>(),
      reason = new Error("original protected failure");
    update.mockReturnValueOnce(old.promise);
    const a = (await invoke("save-task-resource-label")).completion;
    await render({ ...task, taskId: "B", resources: [{ ...task.resources[0]!, label: "Fresh B" }] });
    await (
      await invoke("rename-task-resource")
    ).completion;
    await act(async () => {
      if (outcome === "success") old.resolve(true);
      else old.reject(reason);
    });
    const delivered = await a.then(
      (value) => value,
      (failure) => failure,
    );
    expect(delivered).toBe(outcome === "success" ? true : reason);
    expect(host.querySelector<HTMLInputElement>('[aria-label="Resource label"]')!.value).toBe("Fresh B");
    expect(useStore.getState().toasts).toEqual([]);
  },
);
it("observed window ABA permanently refuses original callbacks while fresh task owner works", async () => {
  await render();
  bridge.windowId = "foreign";
  await expect((await invoke("remove-task-resource-reference")).completion).rejects.toThrow();
  bridge.windowId = "original-window";
  await expect((await invoke("remove-task-resource-reference")).completion).rejects.toThrow();
  expect(update).not.toHaveBeenCalled();
  await render({ ...task, revision: 2 });
  await (
    await invoke("remove-task-resource-reference")
  ).completion;
  expect(update).toHaveBeenCalledOnce();
});
it("archived and hidden controls refuse real dispatch without updates", async () => {
  await render({ ...task, state: "archived" });
  await expect((await invoke("remove-task-resource-reference")).completion).rejects.toThrow();
  expect(update).not.toHaveBeenCalled();
  await render(task);
  host.setAttribute("inert", "");
  await expect((await invoke("remove-task-resource-reference")).completion).rejects.toThrow();
  expect(update).not.toHaveBeenCalled();
});
it.each([
  { ...page, viewStatus: "detached" as const },
  { ...page, ownedByRuntime: true },
])("detached or worker page cannot dispatch attachment ($viewStatus, $ownedByRuntime)", async (target) => {
  await render();
  await act(async () => useStore.setState({ pages: normalizePages([target]) }));
  await expect((await invoke("attach-task-resource-page")).completion).rejects.toThrow(
    "original current tab",
  );
  expect(update).not.toHaveBeenCalled();
});
it.each(ids)("actual remapped %s invokes only the original mounted control", async (id) => {
  await render();
  if (id === "save-task-resource-label" || id === "cancel-task-resource-label")
    await (
      await invoke("rename-task-resource")
    ).completion;
  const node = control(id),
    target = node instanceof HTMLFormElement ? node.querySelector<HTMLInputElement>("input")! : node;
  if (id === "add-task-resource-url") (target as HTMLInputElement).value = "https://example.com/new";
  if (id === "set-task-resource-access") (node as HTMLSelectElement).value = "write";
  useStore.setState({
    settings: {
      ...initial.settings,
      shortcutOverrides: { [id]: [{ key: "f13", command: true, alt: true, shift: true }] },
    },
  });
  target.focus();
  await act(async () =>
    expect(dispatchShortcut({ key: "f13", meta: true, alt: true, shift: true })).toBe(true),
  );
  const effect =
    id === "open-task-resource"
      ? newTab.mock.calls.length
      : id === "rename-task-resource"
        ? Number(!!host.querySelector('[aria-label="Resource label"]'))
        : id === "cancel-task-resource-label"
          ? Number(!host.querySelector('[aria-label="Resource label"]'))
          : update.mock.calls.length;
  expect(effect).toBe(1);
});
it("synchronous producer throw retains original rejection identity", async () => {
  await render();
  const reason = new Error("original mutation failure");
  update.mockImplementationOnce(() => {
    throw reason;
  });
  await expect((await invoke("remove-task-resource-reference")).completion).rejects.toBe(reason);
  expect(update).toHaveBeenCalledOnce();
  expect(await (await invoke("remove-task-resource-reference")).completion).toBe(true);
});
it("native submit on original Save form uses the same registered mutation", async () => {
  await render();
  await (
    await invoke("rename-task-resource")
  ).completion;
  const form = control("save-task-resource-label") as HTMLFormElement,
    event = new Event("submit", { bubbles: true, cancelable: true });
  await act(async () => form.dispatchEvent(event));
  expect(event.defaultPrevented).toBe(true);
  expect(update).toHaveBeenCalledWith(task.resources);
  expect(host.querySelector('[aria-label="Resource label"]')).toBeNull();
});
it("held original click rejection cannot publish protected error after window retirement", async () => {
  await render();
  const old = held<boolean>(),
    reason = new Error("protected original error");
  update.mockReturnValueOnce(old.promise);
  await act(async () => control("remove-task-resource-reference").click());
  bridge.windowId = "foreign";
  await expect((await invoke("rename-task-resource")).completion).rejects.toThrow();
  bridge.windowId = "original-window";
  await act(async () => old.reject(reason));
  expect(useStore.getState().toasts).toEqual([]);
  expect(update).toHaveBeenCalledOnce();
});

it("StrictMode committed replay remains usable and retains only its original reservation", async () => {
  await act(async () =>
    root.render(
      <StrictMode>
        <TaskResources task={task} activePageId="page" attached={false} update={update} />
      </StrictMode>,
    ),
  );
  expect(await (await invoke("remove-task-resource-reference")).completion).toBe(true);
  expect(update).toHaveBeenCalledOnce();
});
it("ordinary activation catalog visibility refresh retains active original failure reporting", async () => {
  const resource = { ...task.resources[0]!, kind: "page" as const, locator: page.pageId };
  await render({ ...task, resources: [resource] });
  const old = held<undefined>(),
    reason = new Error("original activation failed");
  activate.mockReturnValueOnce(old.promise);
  await act(async () => control("open-task-resource").click());
  await act(async () =>
    useStore.setState({
      pages: normalizePages([{ ...page, viewStatus: "visible", title: "Refreshed display title" }]),
    }),
  );
  await act(async () => old.reject(reason));
  expect(useStore.getState().toasts.map((item) => item.text)).toContain(reason.message);
});
it("held original page error cannot publish after document epoch changes", async () => {
  await render({ ...task, resources: [{ ...task.resources[0]!, kind: "page", locator: page.pageId }] });
  const old = held<undefined>(),
    reason = new Error("retired original page failure");
  activate.mockReturnValueOnce(old.promise);
  await act(async () => control("open-task-resource").click());
  await act(async () =>
    useStore.setState({ pages: normalizePages([{ ...page, documentEpoch: page.documentEpoch + 1 }]) }),
  );
  await act(async () => old.reject(reason));
  expect(useStore.getState().toasts).toEqual([]);
});

it("held page document ABA permanently retires original presentation", async () => {
  await render({ ...task, resources: [{ ...task.resources[0]!, kind: "page", locator: page.pageId }] });
  const old = held<undefined>(),
    reason = new Error("retired ABA page failure");
  activate.mockReturnValueOnce(old.promise);
  await act(async () => control("open-task-resource").click());
  await act(async () => {
    useStore.setState({ pages: normalizePages([{ ...page, documentEpoch: page.documentEpoch + 1 }]) });
    useStore.setState({ pages: normalizePages([page]) });
  });
  await act(async () => old.reject(reason));
  expect(useStore.getState().toasts).toEqual([]);
});
it("retired original finally cannot release a newer task mutation reservation", async () => {
  await render();
  const a = held<boolean>(),
    b = held<boolean>();
  update.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
  const old = (await invoke("remove-task-resource-reference")).completion;
  await render({ ...task, taskId: "B" });
  const fresh = (await invoke("remove-task-resource-reference")).completion;
  await act(async () => a.resolve(true));
  expect(await old).toBe(true);
  await expect((await invoke("remove-task-resource-reference")).completion).rejects.toThrow(
    "original editable",
  );
  expect(update).toHaveBeenCalledTimes(2);
  await act(async () => b.resolve(false));
  expect(await fresh).toBe(false);
  expect(await (await invoke("remove-task-resource-reference")).completion).toBe(true);
});
it("observed foreign original native click cannot publish refusal into newer window", async () => {
  await render();
  const original = control("remove-task-resource-reference");
  bridge.windowId = "foreign";
  await act(async () => original.click());
  expect(useStore.getState().toasts).toEqual([]);
  expect(update).not.toHaveBeenCalled();
  bridge.windowId = "original-window";
  await act(async () => original.click());
  expect(useStore.getState().toasts).toEqual([]);
  expect(update).not.toHaveBeenCalled();
});
it("active original UI failure reports its exact original error once", async () => {
  await render();
  const reason = new Error("current original mutation error");
  update.mockRejectedValueOnce(reason);
  await act(async () => control("remove-task-resource-reference").click());
  expect(useStore.getState().toasts.map((item) => item.text)).toEqual([reason.message]);
});
