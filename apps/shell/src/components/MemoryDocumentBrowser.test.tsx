// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useMemoryDrafts } from "../memory-drafts";
import { MemoryDocumentBrowser } from "./MemoryDocumentBrowser";
const mocks = vi.hoisted(() => ({
  call: vi.fn(),
  state: { layout: { spaces: [{ id: "space", workspaceId: "workspace" }] } },
  event: null as null | ((event: any) => void),
}));
vi.mock("../bridge", () => ({
  bridge: {
    windowId: "window",
    privateMode: false,
    onEvent: (callback: any) => {
      mocks.event = callback;
      return () => {
        mocks.event = null;
      };
    },
  },
}));
vi.mock("../store", () => ({
  call: mocks.call,
  useStore: Object.assign((select: any) => select(mocks.state), { getState: () => mocks.state }),
}));
vi.mock("./MemoryDocument", () => ({ MemoryDocument: ({ text }: { text: string }) => <p>{text}</p> }));
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, memory: any, documents: any;
const saved = vi.fn();
const note = (id: string, text: string) => ({
  path: "episodic/2026-10-17.md",
  updatedAt: 1000,
  claim: {
    claimId: id,
    text,
    capturedAt: 1000,
    sourceRunId: "run",
    source: { kind: "owner-paste", quote: text },
  },
});
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  useMemoryDrafts.setState({ drafts: {}, storageError: false });
  saved.mockReset();
  mocks.call.mockReset();
  memory = { workspaceId: "workspace", content: "Saved root", revision: 1, items: [], excludedOrigins: [] };
  documents = {
    generation: "first",
    documents: [note("one", "First original"), note("two", "Second original")],
  };
  mocks.call.mockImplementation(async (method: string) => {
    if (method === "memory.pipeline.documents") return documents;
    if (method === "workspaces.memory.get") return memory;
    if (method === "workspaces.memory.set") return { ...memory, revision: 2 };
    return [];
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
const render = () =>
  act(async () =>
    root.render(
      <MemoryDocumentBrowser memory={memory} onSaved={saved} active onManage={() => {}} onClose={() => {}} />,
    ),
  );
async function click(text: string) {
  await act(async () =>
    [...host.querySelectorAll("button")].find((button) => button.textContent === text)!.click(),
  );
}
async function type(label: string, value: string) {
  await act(async () => {
    const input = host.querySelector<HTMLTextAreaElement>(`textarea[aria-label="${label}"]`)!;
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
it("edits the authoritative root with its expected revision", async () => {
  await render();
  await click("Edit");
  await type("Edit MEMORY.md", "Updated root");
  await click("Save");
  expect(mocks.call).toHaveBeenCalledWith("workspaces.memory.set", {
    workspaceId: "workspace",
    expectedRevision: 1,
    content: "Updated root",
  });
  expect(saved).toHaveBeenCalled();
});
it("groups daily notes and submits changed fragments together while showing original sources", async () => {
  await render();
  expect(
    [...host.querySelectorAll("button")].filter((button) => button.textContent === "2026-10-17.md"),
  ).toHaveLength(1);
  await click("2026-10-17.md");
  expect(host.querySelectorAll(".memory-source-quote")).toHaveLength(2);
  await click("Edit");
  await type("Edit note 1", "New first");
  await type("Edit note 2", "New second");
  await click("Save");
  expect(mocks.call).toHaveBeenCalledWith("memory.pipeline.edit", {
    workspaceId: "workspace",
    expectedGeneration: "first",
    edits: [
      { claimId: "one", text: "New first" },
      { claimId: "two", text: "New second" },
    ],
  });
});
it("preserves conflicting drafts, includes newly added notes on rebase, and purges forgotten fragments", async () => {
  await render();
  await click("2026-10-17.md");
  await click("Edit");
  await type("Edit note 1", "My draft");
  documents = { generation: "second", documents: [...documents.documents, note("three", "New saved note")] };
  await act(async () =>
    mocks.event!({ type: "workspace.memory.updated", payload: { workspaceId: "workspace" } }),
  );
  expect(host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Edit note 1"]')!.value).toBe(
    "My draft",
  );
  expect([...host.querySelectorAll("button")].find((button) => button.textContent === "Save")!.disabled).toBe(
    true,
  );
  await click("Keep my draft against this version");
  await click("Save");
  expect(mocks.call).toHaveBeenCalledWith("memory.pipeline.edit", {
    workspaceId: "workspace",
    expectedGeneration: "second",
    edits: [{ claimId: "one", text: "My draft" }],
  });
  await click("Edit");
  await type("Edit note 1", "Forgotten draft");
  documents = { generation: "third", documents: documents.documents.slice(1) };
  await act(async () =>
    mocks.event!({ type: "workspace.memory.updated", payload: { workspaceId: "workspace" } }),
  );
  expect([...host.querySelectorAll("textarea")].some((input) => input.value === "Forgotten draft")).toBe(
    false,
  );
});

it("opens the existing Space draft and retains it after a rejected save", async () => {
  useMemoryDrafts.getState().write("workspace", { content: "Existing unfinished notes", revision: 1 });
  mocks.call.mockImplementation(async (method: string) => {
    if (method === "memory.pipeline.documents") return documents;
    if (method === "workspaces.memory.get") return { ...memory, revision: 2, content: "External revision" };
    throw new Error("Memory changed");
  });
  await render();
  expect(host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Edit MEMORY.md"]')!.value).toBe(
    "Existing unfinished notes",
  );
  await click("Save");
  expect(useMemoryDrafts.getState().drafts.workspace).toEqual({
    content: "Existing unfinished notes",
    revision: 1,
  });
  expect(saved).toHaveBeenCalledWith(expect.objectContaining({ revision: 2 }));
});
it("keeps the unavailable-state retry visible while editing root notes", async () => {
  mocks.call.mockRejectedValue(new Error("Pipeline unavailable"));
  await render();
  await click("Edit");
  expect(host.querySelector('[role="alert"]')!.textContent).toContain("Pipeline unavailable");
  expect(host.querySelector("nav")!.textContent).toContain("Unavailable");
  expect(host.querySelector("nav")!.textContent).not.toContain("Loading");
});
