// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
const fixture = vi.hoisted(() => ({
  store: null as unknown as { setState(value: { overlay: string | null }): void },
  call: vi.fn(),
  execute: vi.fn(),
}));
vi.mock("../../store", async () => {
  const { create } = await import("zustand");
  const store = create(() => ({ overlay: null as string | null }));
  fixture.store = store;
  return { useStore: store, call: fixture.call };
});
vi.mock("../../commands", () => ({ executeCommand: fixture.execute }));
vi.mock("./MorningReview", () => ({
  MorningReviewInbox: () => <h2>Overnight review</h2>,
}));
vi.mock("./NightSettings", () => ({ NightSettingsSection: () => null }));
import { useNightReview } from "./state";
import { NightOverlays } from "./mount";
import { SettingsShell } from "../../settings/SettingsShell";
import { createRef } from "react";
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fixture.store.setState({ overlay: null });
  fixture.execute.mockReset();
  fixture.call.mockReset().mockImplementation(async (method: string) =>
    method === "workspaces.list"
      ? [
          { workspaceId: "space-a", name: "Space A" },
          { workspaceId: "space-b", name: "Space B" },
        ]
      : [],
  );
  useNightReview.setState({
    inboxOpen: false,
    queueOpen: false,
    queueVisited: false,
    items: [],
    busy: false,
    error: "",
  });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
async function render() {
  await act(async () =>
    root.render(
      <>
        <SettingsShell shellRef={createRef<HTMLElement>()} nav={<button>Routines</button>}>
          <h1>Settings</h1>
        </SettingsShell>
        <NightOverlays />
      </>,
    ),
  );
}
const select = (label: string) =>
  [...document.querySelectorAll<HTMLSelectElement>("dialog label select")].find((node) =>
    node.parentElement?.textContent?.startsWith(label),
  )!;
async function waitForQueue() {
  await act(async () => {
    await import("./QueueTonight");
  });
  await vi.waitFor(async () => {
    await act(async () => {});
    expect(select("Space")).toBeDefined();
    expect(select("Work")).toBeDefined();
  });
}
it("dismisses the actual modal lifecycle when global Settings navigation occurs", async () => {
  useNightReview.setState({ inboxOpen: true });
  await render();
  expect(document.querySelector('dialog[open][aria-label="Overnight review"]')).not.toBeNull();
  await act(async () => fixture.store.setState({ overlay: "settings" }));
  expect(document.querySelector("dialog[open]")).toBeNull();
  expect(useNightReview.getState().inboxOpen).toBe(false);
  expect(container.querySelector('[aria-label="Settings"] button')?.textContent).toBe("Routines");
});
it("loads no queue data before the first visit, and preserves form edits across navigation", async () => {
  await render();
  expect(fixture.call).not.toHaveBeenCalled();
  await act(async () => useNightReview.setState({ queueOpen: true, queueVisited: true }));
  await waitForQueue();
  await act(async () => {
    select("Space").value = "space-b";
    select("Space").dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () => {
    select("Work").value = "memory.reindex";
    select("Work").dispatchEvent(new Event("change", { bubbles: true }));
  });
  const budget = document.querySelector<HTMLInputElement>('dialog input[type="number"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(budget, "0.37");
    budget.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => fixture.store.setState({ overlay: "settings" }));
  expect(document.querySelector("dialog[open]")).toBeNull();
  expect(useNightReview.getState().queueOpen).toBe(false);
  expect(fixture.execute).not.toHaveBeenCalled();
  await act(async () => {
    fixture.store.setState({ overlay: null });
    useNightReview.setState({ queueOpen: true, queueVisited: true });
  });
  expect(select("Space").value).toBe("space-b");
  expect(select("Work").value).toBe("memory.reindex");
  expect(document.querySelector<HTMLInputElement>('dialog input[type="number"]')?.value).toBe("0.37");
  expect(fixture.execute).not.toHaveBeenCalled();
});

it("preserves the selected Skill and edited parameters without queuing work on navigation", async () => {
  fixture.call.mockImplementation(async (method: string) =>
    method === "workspaces.list"
      ? [{ workspaceId: "space-a", name: "Space A" }]
      : method === "routines.list"
        ? [
            {
              routineId: "skill-a",
              title: "Reviewed skill",
              paused: false,
              revision: 1,
              parameters: [{ name: "company", value: "" }],
            },
          ]
        : [],
  );
  useNightReview.setState({ queueOpen: true, queueVisited: true });
  await render();
  await waitForQueue();
  await act(async () => {
    select("Work").value = "routine";
    select("Work").dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () => {
    select("Skill").value = "skill-a";
    select("Skill").dispatchEvent(new Event("change", { bubbles: true }));
  });
  const parameter = document.querySelector<HTMLInputElement>('[aria-label="Overnight value for company"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
      parameter,
      "Synthetic company",
    );
    parameter.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => fixture.store.setState({ overlay: "settings" }));
  await act(async () => {
    fixture.store.setState({ overlay: null });
    useNightReview.setState({ queueOpen: true, queueVisited: true });
  });
  expect(select("Skill").value).toBe("skill-a");
  expect(document.querySelector<HTMLInputElement>('[aria-label="Overnight value for company"]')?.value).toBe(
    "Synthetic company",
  );
  expect(fixture.execute).not.toHaveBeenCalled();
});
