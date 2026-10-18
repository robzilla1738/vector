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
  mocks.state.layout.spaces = [{ id: "space", workspaceId: "workspace" }];
  memory = { workspaceId: "workspace", content: "Saved root", revision: 1, items: [], excludedOrigins: [] };
  documents = {
    generation: "first",
    documents: [note("one", "First original"), note("two", "Second original")],
  };
  mocks.call.mockImplementation(async (method: string, input: any) => {
    if (method === "memory.pipeline.documents") return documents;
    if (method === "workspaces.memory.get") return memory;
    if (method === "workspaces.memory.set") return { ...memory, revision: 2 };
    if (method === "workspaces.memory.setDocument") {
      if (input.expectedRevision !== memory.revision) throw new Error("Memory changed.");
      const remaining = (memory.documents ?? []).filter((document: any) => document.path !== input.path);
      memory = {
        ...memory,
        revision: memory.revision + 1,
        documents:
          input.content === null
            ? remaining
            : [...remaining, { path: input.path, content: input.content, updatedAt: 1000 }],
      };
      return memory;
    }
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
    [...document.querySelectorAll("button")].find((button) => button.textContent?.trim() === text)!.click(),
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

it("creates real USER and TAXONOMY documents without replacing the root", async () => {
  await render();
  await click("Add document");
  await click("USER.md");
  await type("Edit USER.md", "The synthetic workshop prefers concise, sourced answers.");
  await click("Save");
  expect(mocks.call).toHaveBeenCalledWith("workspaces.memory.setDocument", {
    workspaceId: "workspace",
    expectedRevision: 1,
    path: "USER.md",
    content: "The synthetic workshop prefers concise, sourced answers.",
  });
  await render();
  await click("Add document");
  await click("TAXONOMY.md");
  await type("Edit TAXONOMY.md", "Organize notes into research and project decisions.");
  await click("Save");
  await render();
  expect(memory.content).toBe("Saved root");
  expect(memory.documents.map((document: any) => document.path)).toEqual(["USER.md", "TAXONOMY.md"]);
  expect(host.textContent).toContain("Owner-written context for this Space.");
});
it("keeps an owner document draft for comparison but never moves it to another Space", async () => {
  memory.documents = [{ path: "USER.md", content: "Saved synthetic user context", updatedAt: 1 }];
  await render();
  await click("USER.md");
  await click("Edit");
  await type("Edit USER.md", "Unsaved first Space owner prose");
  memory = {
    ...memory,
    revision: 2,
    documents: [{ path: "USER.md", content: "Latest first Space owner context", updatedAt: 2 }],
  };
  await render();
  expect(host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Edit USER.md"]')?.value).toBe(
    "Unsaved first Space owner prose",
  );
  expect(host.querySelector(".memory-document-conflict")?.textContent).toContain(
    "Latest first Space owner context",
  );
  expect([...host.querySelectorAll("button")].find((button) => button.textContent === "Save")?.disabled).toBe(
    true,
  );
  memory = {
    ...memory,
    workspaceId: "replacement",
    revision: 1,
    documents: [{ path: "USER.md", content: "Second Space user context", updatedAt: 1 }],
  };
  mocks.state.layout.spaces = [{ id: "replacement", workspaceId: "replacement" }];
  await render();
  await click("USER.md");
  expect(host.textContent).toContain("Second Space user context");
  expect(host.textContent).not.toContain("Unsaved first Space owner prose");
  expect(host.querySelector("textarea")).toBeNull();
});
it("deletes only the reviewed document revision and keeps newer content on conflict", async () => {
  memory.documents = [{ path: "USER.md", content: "Reviewed owner content", updatedAt: 1 }];
  await render();
  await click("USER.md");
  await click("Delete");
  memory = {
    ...memory,
    revision: 2,
    documents: [{ path: "USER.md", content: "Newer owner content", updatedAt: 2 }],
  };
  await render();
  await click("Remove document");
  expect(mocks.call).toHaveBeenCalledWith("workspaces.memory.setDocument", {
    workspaceId: "workspace",
    expectedRevision: 1,
    path: "USER.md",
    content: null,
  });
  expect(memory.documents[0].content).toBe("Newer owner content");
  expect(document.querySelector("dialog")?.textContent).toContain("Memory changed.");
  await click("Cancel");
  await click("Delete");
  await click("Remove document");
  await render();
  expect(memory.documents).toEqual([]);
  expect(host.textContent).not.toContain("Newer owner content");
});
