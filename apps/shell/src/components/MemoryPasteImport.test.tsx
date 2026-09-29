// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryPasteImport } from "./MemoryPasteImport";

const rpc = vi.hoisted(() => vi.fn());
const native = vi.hoisted(() => ({ privateMode: false, onEvent: vi.fn(() => () => {}) }));
vi.mock("../bridge", () => ({ bridge: native }));
vi.mock("../store", () => ({
  call: rpc,
  useStore: (selector: (value: unknown) => unknown) =>
    selector({
      layout: {
        spaces: [
          { id: "space-one", workspaceId: "workspace-one", name: "Personal" },
          { id: "space-two", workspaceId: "workspace-two", name: "Research" },
        ],
      },
    }),
}));
const ids = ["03ff3a89-bf13-4277-a4ec-26cba3ea9b56", "1047cd75-63c7-4e97-a4c9-c70ab7c9d580"];
const previewId = "2047cd75-63c7-4e97-a4c9-c70ab7c9d581";
const preview = {
  status: "ready",
  workspaceId: "workspace-one",
  previewId,
  expiresAt: Date.now() + 600000,
  candidates: ids.map((candidateId, index) => ({
    candidateId,
    text: `Useful note ${index}`,
    duplicate: index === 1,
  })),
};
const receipt = {
  importId: previewId,
  createdAt: 1,
  selected: 1,
  added: 1,
  duplicates: 0,
  pending: 1,
  accepted: 0,
  restorable: 0,
  removed: 0,
};
const review = vi.fn();
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const button = (text: string) =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find((item) => item.textContent === text)!;
async function choose(value = "workspace-one") {
  await act(async () => {
    const select = host.querySelector("select")!;
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
async function paste(text = "Useful note 0\nUseful note 1") {
  await act(async () => {
    const textarea = host.querySelector("textarea")!;
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(textarea, text);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function mount() {
  await act(async () => root.render(<MemoryPasteImport onReview={review} />));
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  rpc.mockReset();
  review.mockClear();
  native.privateMode = false;
  rpc.mockImplementation(async (method: string) => {
    if (method === "memory.pipeline.policy") return { enabled: false };
    if (method === "memory.paste.status") return [];
    if (method === "memory.paste.preview") return preview;
    if (method === "memory.pipeline.setPolicy") return { enabled: true };
    if (method === "memory.paste.commit") return receipt;
    throw new Error(`Unexpected ${method}`);
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

it("requires an explicit destination and preview, with every candidate initially unchecked", async () => {
  await mount();
  await paste();
  expect(rpc).not.toHaveBeenCalled();
  expect(button("Preview pasted notes").disabled).toBe(true);
  await choose();
  expect(rpc.mock.calls.some(([method]) => method === "memory.paste.preview")).toBe(false);
  await act(async () => button("Preview pasted notes").click());
  expect(rpc).toHaveBeenCalledWith("memory.paste.preview", {
    workspaceId: "workspace-one",
    text: "Useful note 0\nUseful note 1",
  });
  const inputs = [...host.querySelectorAll<HTMLInputElement>('fieldset input[type="checkbox"]')];
  expect(inputs).toHaveLength(3);
  expect(inputs.every((input) => !input.checked)).toBe(true);
  expect(inputs[1]!.disabled).toBe(true);
  expect(
    rpc.mock.calls.some(
      ([method]) => method === "memory.paste.commit" || method === "memory.pipeline.setPolicy",
    ),
  ).toBe(false);
});

it("enables Memory only on explicit choice and queues just the checked notes for separate acceptance", async () => {
  await mount();
  await choose();
  await paste();
  await act(async () => button("Preview pasted notes").click());
  await act(async () => host.querySelector<HTMLInputElement>('fieldset input[type="checkbox"]')!.click());
  expect(button("Add 1 note to Memory review").disabled).toBe(true);
  await act(async () =>
    [...host.querySelectorAll<HTMLInputElement>('fieldset input[type="checkbox"]')].at(-1)!.click(),
  );
  expect(rpc).toHaveBeenCalledWith("memory.pipeline.setPolicy", {
    workspaceId: "workspace-one",
    enabled: true,
  });
  await act(async () => button("Add 1 note to Memory review").click());
  expect(rpc).toHaveBeenCalledWith("memory.paste.commit", {
    workspaceId: "workspace-one",
    previewId,
    selectedIds: [ids[0]],
  });
  expect(host.querySelector("textarea")!.value).toBe("");
  expect(review).toHaveBeenCalledWith("workspace-one");
  expect(host.textContent).toContain("1 pending, 0 approved");
  expect(rpc.mock.calls.some(([method]) => method === "memory.pipeline.review")).toBe(false);
});

it("invalidates a review after editing text or choosing another Space", async () => {
  await mount();
  await choose();
  await paste();
  await act(async () => button("Preview pasted notes").click());
  await paste("A changed note");
  expect(host.querySelector("fieldset")).toBeNull();
  await act(async () => button("Preview pasted notes").click());
  await choose("workspace-two");
  expect(review).toHaveBeenLastCalledWith(null);
  expect(host.querySelector("fieldset")).toBeNull();
  expect(rpc.mock.calls.some(([method]) => method === "memory.paste.commit")).toBe(false);
});

it("shows a blocked sensitivity result without an import or approval path", async () => {
  const original = rpc.getMockImplementation()!;
  rpc.mockImplementation(async (method, params) =>
    method === "memory.paste.preview"
      ? { status: "blocked", workspaceId: "workspace-one", reason: "Remove the credential before preview." }
      : original(method, params),
  );
  await mount();
  await choose();
  await paste("password = fixture-only");
  await act(async () => button("Preview pasted notes").click());
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("No notes were saved");
  expect(host.querySelector("fieldset")).toBeNull();
  expect(rpc.mock.calls.some(([method]) => method === "memory.paste.commit")).toBe(false);
});

it("reconciles a lost commit response with durable receipts and does not repeat work after remount", async () => {
  const original = rpc.getMockImplementation()!;
  let committed = false;
  rpc.mockImplementation(async (method, params) => {
    if (method === "memory.paste.commit") {
      committed = true;
      throw new Error("Response interrupted. Check receipts.");
    }
    if (method === "memory.paste.status") return committed ? [receipt] : [];
    if (method === "memory.pipeline.policy") return { enabled: true };
    return original(method, params);
  });
  await mount();
  await choose();
  await paste();
  await act(async () => button("Preview pasted notes").click());
  await act(async () => host.querySelector<HTMLInputElement>('fieldset input[type="checkbox"]')!.click());
  await act(async () => button("Add 1 note to Memory review").click());
  await act(async () => button("Refresh import receipts").click());
  expect(host.textContent).toContain("1 pending, 0 approved");
  expect(host.querySelector("fieldset")).toBeNull();
  await act(async () => root.render(null));
  await mount();
  await choose();
  expect(host.querySelector("textarea")!.value).toBe("");
  expect(host.textContent).toContain("1 pending, 0 approved");
  expect(rpc.mock.calls.filter(([method]) => method === "memory.paste.commit")).toHaveLength(1);
  expect(rpc.mock.calls.filter(([method]) => method === "memory.paste.preview")).toHaveLength(1);
});

it("does not expose paste controls or issue RPCs in private browsing", async () => {
  native.privateMode = true;
  await mount();
  expect(host.querySelector("textarea")).toBeNull();
  expect(rpc).not.toHaveBeenCalled();
});

it("ignores a late preview when the permitted destination changes", async () => {
  const original = rpc.getMockImplementation()!;
  let finish!: () => void;
  rpc.mockImplementation(async (method, params) => {
    if (method === "memory.paste.preview") {
      await new Promise<void>((resolve) => {
        finish = resolve;
      });
      return preview;
    }
    return original(method, params);
  });
  await mount();
  await choose();
  await paste();
  await act(async () => button("Preview pasted notes").click());
  await act(async () => root.render(<MemoryPasteImport workspaceId="workspace-two" onReview={review} />));
  await act(async () => finish());
  expect(host.querySelector("fieldset")).toBeNull();
  expect(host.querySelector("select")!.value).toBe("");
  expect(rpc.mock.calls.some(([method]) => method === "memory.paste.commit")).toBe(false);
});
