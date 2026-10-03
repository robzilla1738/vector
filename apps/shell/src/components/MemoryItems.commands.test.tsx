// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { MemoryItems } from "./MemoryItems";
import { useMemoryDrafts } from "../memory-drafts";
import { invokeScopedControl } from "../scoped-control-commands";
const mocks = vi.hoisted(() => ({
  call: vi.fn(),
  saved: vi.fn(),
  errors: vi.fn(),
  privateMode: false,
  state: {} as any,
}));
vi.mock("../bridge", () => ({
  bridge: {
    windowId: "owned-window",
    get privateMode() {
      return mocks.privateMode;
    },
  },
}));
vi.mock("../store", () => ({
  call: mocks.call,
  errToast: mocks.errors,
  useStore: Object.assign((select: (state: any) => unknown) => select(mocks.state), {
    getState: () => mocks.state,
  }),
}));
vi.mock("../commands", async () => {
  const { invokeScopedControl } = await import("../scoped-control-commands");
  return {
    executeCommand: (id: string, context: any) => {
      try {
        return Promise.resolve(invokeScopedControl(id, context));
      } catch (reason) {
        return Promise.reject(reason);
      }
    },
  };
});
vi.mock("./MemoryExclusions", () => ({ MemoryExclusions: () => null }));
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const item = () => ({
  itemId: "original",
  content: "Original cited note",
  sourceUrl: "https://owned.example/citation",
  enabled: true,
  createdAt: 1,
  updatedAt: 2,
});
const memory = (workspaceId = "wa", revision = 1) => ({
  workspaceId,
  revision,
  content: "Original overview",
  items: [item()],
  excludedOrigins: [],
});
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    fn(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  mocks.privateMode = false;
  mocks.call.mockReset();
  mocks.saved.mockReset();
  mocks.errors.mockReset();
  mocks.state = {
    layout: {
      spaces: [
        { id: "space-a", workspaceId: "wa" },
        { id: "space-b", workspaceId: "wb" },
      ],
      archivedSpaces: [],
    },
  };
  useMemoryDrafts.setState({ drafts: {} });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  mocks.call.mockImplementation(async (method, params) => {
    if (method.endsWith(".set"))
      return { ...memory(params.workspaceId, params.expectedRevision + 1), items: params.items };
    if (method.endsWith(".get")) return memory(params.workspaceId, 2);
    throw new Error(method);
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useMemoryDrafts.setState({ drafts: {} });
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const button = (text: string) =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent === text)!;
const mount = async (value = memory(), disabled = false) => {
  await act(async () =>
    root.render(<MemoryItems memory={value} disabled={disabled} onSaved={mocks.saved} />),
  );
};
async function text(node: HTMLInputElement | HTMLTextAreaElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      node instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
      "value",
    )!.set!.call(node, value);
    node.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
it("saves only an explicitly reviewed draft through the actual form, preserving citation and expected revision", async () => {
  await mount();
  await act(async () => button("Add note").click());
  const input = host.querySelector<HTMLTextAreaElement>("textarea")!;
  await text(input, "Keep original facts");
  await text(
    host.querySelector<HTMLInputElement>('[aria-label="Memory source address"]')!,
    "https://owned.example/new",
  );
  expect(mocks.call).not.toHaveBeenCalled();
  await act(async () =>
    host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(mocks.call).toHaveBeenCalledWith(
    "workspaces.memory.set",
    expect.objectContaining({
      workspaceId: "wa",
      expectedRevision: 1,
      content: "Original overview",
      items: expect.arrayContaining([
        expect.objectContaining({ content: "Keep original facts", sourceUrl: "https://owned.example/new" }),
        item(),
      ]),
    }),
  );
  expect(useMemoryDrafts.getState().drafts["item:wa"]).toBeUndefined();
  expect(mocks.saved).toHaveBeenCalledOnce();
});
it("preserves validation and draft on invalid credentials, then discards without writing", async () => {
  await mount();
  await act(async () => button("Add note").click());
  await text(host.querySelector<HTMLTextAreaElement>("textarea")!, "Fact");
  await text(
    host.querySelector<HTMLInputElement>('[aria-label="Memory source address"]')!,
    "https://user:secret@owned.example/",
  );
  await act(async () =>
    host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(host.textContent).toContain("without credentials");
  expect(mocks.call).not.toHaveBeenCalled();
  expect(useMemoryDrafts.getState().drafts["item:wa"]).toBeDefined();
  await act(async () => button("Discard draft").click());
  expect(useMemoryDrafts.getState().drafts["item:wa"]).toBeUndefined();
  expect(mocks.call).not.toHaveBeenCalled();
});
it("keeps original note citation in details and toggles only its original enabled item", async () => {
  await mount();
  const row = host.querySelector<HTMLButtonElement>(".ui-list-open")!;
  row.focus();
  await act(async () => invokeScopedControl("select-memory-note"));
  expect(host.querySelector(".memory-note-metadata")!.textContent).toContain(
    "https://owned.example/citation",
  );
  expect(host.textContent).toContain("This Space");
  await act(async () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
  expect(mocks.call).toHaveBeenCalledWith(
    "workspaces.memory.set",
    expect.objectContaining({
      expectedRevision: 1,
      items: [expect.objectContaining({ ...item(), enabled: false, updatedAt: expect.any(Number) })],
    }),
  );
});
it("held original save cannot clear a newer draft or notify a replacement workspace", async () => {
  await mount();
  await act(async () => button("Add note").click());
  await text(host.querySelector<HTMLTextAreaElement>("textarea")!, "Original draft");
  let finish!: (value: any) => void;
  mocks.call.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await act(async () =>
    host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  await mount(memory("wb"));
  await act(async () => button("Add note").click());
  await text(host.querySelector<HTMLTextAreaElement>("textarea")!, "New workspace draft");
  await act(async () => finish(memory("wa", 2)));
  expect(mocks.saved).not.toHaveBeenCalled();
  expect(useMemoryDrafts.getState().drafts["item:wa"]!.content).toContain("Original draft");
  expect(useMemoryDrafts.getState().drafts["item:wb"]!.content).toContain("New workspace draft");
  expect(host.querySelector<HTMLTextAreaElement>("textarea")!.value).toBe("New workspace draft");
});
it("Private and disabled owners never author or discard retained drafts", async () => {
  await mount();
  await act(async () => button("Add note").click());
  await text(host.querySelector<HTMLTextAreaElement>("textarea")!, "Retained draft");
  await mount(memory(), true);
  const discard = button("Discard draft");
  discard.focus();
  expect(() => invokeScopedControl("discard-memory-note-draft")).toThrow();
  mocks.privateMode = true;
  await mount();
  expect(host.querySelector("form")).toBeNull();
  expect(mocks.call).not.toHaveBeenCalled();
  expect(useMemoryDrafts.getState().drafts["item:wa"]!.content).toContain("Retained draft");
});
it("the explicit original Delete menu item preserves remaining citations and rejects mutated item identity", async () => {
  const original = memory();
  await mount(original);
  const trigger = host.querySelector<HTMLButtonElement>('[aria-label^="Actions for note"]')!;
  await act(async () => trigger.click());
  const remove = document.querySelector<HTMLButtonElement>('[role="menuitem"]:last-child')!;
  remove.focus();
  original.items[0]!.sourceUrl = "https://foreign.example/replaced";
  expect(() => invokeScopedControl("delete-memory-note")).toThrow("changed");
  expect(mocks.call).not.toHaveBeenCalled();
  await act(async () =>
    remove.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
  );
  await mount(memory());
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label^="Actions for note"]')!.click());
  await act(async () => document.querySelector<HTMLButtonElement>('[role="menuitem"]:last-child')!.click());
  expect(mocks.call).toHaveBeenCalledWith(
    "workspaces.memory.set",
    expect.objectContaining({ workspaceId: "wa", expectedRevision: 1, items: [] }),
  );
});
it("a held rejection after Private retirement keeps the draft without publishing protected diagnostics", async () => {
  await mount();
  await act(async () => button("Add note").click());
  await text(host.querySelector<HTMLTextAreaElement>("textarea")!, "Retained fact");
  let fail!: (reason: unknown) => void;
  mocks.call.mockImplementation(
    () =>
      new Promise((_ok, reject) => {
        fail = reject;
      }),
  );
  await act(async () =>
    host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  mocks.privateMode = true;
  await mount();
  mocks.privateMode = false;
  await mount();
  await act(async () => fail(new Error("Private retired failure")));
  expect(mocks.saved).not.toHaveBeenCalled();
  expect(mocks.errors).not.toHaveBeenCalled();
  expect(host.textContent).not.toContain("Private retired failure");
  expect(host.querySelector<HTMLTextAreaElement>("textarea")!.value).toBe("Retained fact");
});
it("a genuine conflict preserves the reviewed draft and requires an explicit latest-revision action", async () => {
  await mount();
  await act(async () => button("Add note").click());
  await text(host.querySelector<HTMLTextAreaElement>("textarea")!, "Reviewed fact");
  const original = new Error("Original revision conflict");
  mocks.call.mockRejectedValueOnce(original);
  await act(async () =>
    host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(host.textContent).toContain("Memory changed elsewhere");
  expect(mocks.saved).not.toHaveBeenCalled();
  expect(mocks.call.mock.calls.filter(([method]) => method.endsWith(".set"))).toHaveLength(1);
  expect(useMemoryDrafts.getState().drafts["item:wa"]!.content).toContain("Reviewed fact");
  await act(async () => button("Save my note against latest").click());
  expect(mocks.call).toHaveBeenLastCalledWith(
    "workspaces.memory.set",
    expect.objectContaining({
      expectedRevision: 2,
      content: "Original overview",
      items: expect.arrayContaining([expect.objectContaining({ content: "Reviewed fact" }), item()]),
    }),
  );
  expect(mocks.saved).toHaveBeenCalledOnce();
});
it("scope retirement hides original detail, conflict and error rather than carrying them into another Space", async () => {
  await mount();
  await act(async () => host.querySelector<HTMLButtonElement>(".ui-list-open")!.click());
  await act(async () => button("Add note").click());
  await text(host.querySelector<HTMLTextAreaElement>("textarea")!, "Retained original draft");
  mocks.call.mockRejectedValueOnce(new Error("Original conflict diagnostic"));
  await act(async () =>
    host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(host.textContent).toContain("Original conflict diagnostic");
  expect(host.textContent).toContain("Memory changed elsewhere");
  await mount(memory("wb"));
  expect(host.textContent).not.toContain("Original conflict diagnostic");
  expect(host.textContent).not.toContain("Memory changed elsewhere");
  expect(host.querySelector(".memory-note-metadata")).toBeNull();
  expect(useMemoryDrafts.getState().drafts["item:wa"]!.content).toContain("Retained original draft");
});
it("an external newer original-Space draft survives a late acknowledged save without receiving its callback", async () => {
  await mount();
  await act(async () => button("Add note").click());
  await text(host.querySelector<HTMLTextAreaElement>("textarea")!, "Original draft");
  let finish!: (value: any) => void;
  mocks.call.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await act(async () =>
    host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  await act(async () =>
    useMemoryDrafts.getState().write("item:wa", {
      revision: 1,
      content: JSON.stringify({
        itemId: "new-draft",
        content: "Newer captured draft",
        sourceUrl: "https://owned.example/new",
        expires: "",
      }),
    }),
  );
  await act(async () => finish(memory("wa", 2)));
  expect(useMemoryDrafts.getState().drafts["item:wa"]!.content).toContain("Newer captured draft");
  expect(mocks.saved).not.toHaveBeenCalled();
  expect(mocks.errors).not.toHaveBeenCalled();
});
it("unique actual Space mapping A→B→A irreversibly retires a held save while preserving its original ACK", async () => {
  await mount();
  const original = host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  original.focus();
  let finish!: (value: any) => void;
  mocks.call.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invokeScopedControl("toggle-memory-note-use") as Promise<unknown>;
  });
  mocks.state.layout.spaces[0] = { id: "replacement-space", workspaceId: "wa" };
  await mount();
  mocks.state.layout.spaces[0] = { id: "space-a", workspaceId: "wa" };
  await mount();
  const ack = { ...memory("wa", 2), items: [{ ...item(), enabled: false }] };
  await act(async () => finish(ack));
  await expect(completion).resolves.toBe(ack);
  expect(mocks.saved).not.toHaveBeenCalled();
  expect(mocks.errors).not.toHaveBeenCalled();
  expect(host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(true);
});
it("duplicate live/archived workspace membership refuses authoring rather than borrowing either native Space", async () => {
  mocks.state.layout.archivedSpaces = [{ id: "archived-second", workspaceId: "wa" }];
  await mount();
  const original = host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  original.focus();
  expect(() => invokeScopedControl("toggle-memory-note-use")).toThrow("Space changed");
  expect(mocks.call).not.toHaveBeenCalled();
  expect(mocks.saved).not.toHaveBeenCalled();
});
it("same-revision changed incoming memory retires old pending delivery and preserves the received acknowledgement", async () => {
  await mount();
  const original = host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  original.focus();
  let finish!: (value: any) => void;
  mocks.call.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invokeScopedControl("toggle-memory-note-use") as Promise<unknown>;
  });
  await mount({
    ...memory(),
    content: "Changed at the same revision",
    items: [{ ...item(), content: "New incoming note" }],
  });
  const ack = { ...memory("wa", 2), items: [{ ...item(), enabled: false }] };
  await act(async () => finish(ack));
  await expect(completion).resolves.toBe(ack);
  expect(mocks.saved).not.toHaveBeenCalled();
  expect(host.textContent).toContain("New incoming note");
  expect(host.textContent).not.toContain("Original cited note");
  expect(mocks.errors).not.toHaveBeenCalled();
});

it("retired external draft keeps the original rejected save identity and newer draft", async () => {
  await mount();
  button("Add note").focus();
  await act(async()=>button("Add note").click());
  const input=host.querySelector<HTMLTextAreaElement>("textarea")!;
  await text(input,"Original draft");
  input.focus();
  let reject!: (reason:unknown)=>void;
  mocks.call.mockImplementation(()=>new Promise((_,fail)=>{reject=fail;}));
  let completion!:Promise<unknown>;
  await act(async()=>{completion=invokeScopedControl("save-memory-note") as Promise<unknown>;});
  const original=new Error("Original backend rejection");
  const refusal=expect(completion).rejects.toBe(original);
  const newer={content:JSON.stringify({itemId:"new",content:"External newer draft",sourceUrl:"",expires:""}),revision:1};
  await act(async()=>useMemoryDrafts.getState().write("item:wa",newer));
  await act(async()=>reject(original));
  await refusal;
  expect(useMemoryDrafts.getState().drafts["item:wa"]).toBe(newer);
  expect(mocks.errors).not.toHaveBeenCalled();
  expect(mocks.saved).not.toHaveBeenCalled();
  expect(host.textContent).not.toContain(original.message);
});
