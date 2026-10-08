// @vitest-environment jsdom
import { act, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { COMMANDS, type ConversationAttachment } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { executeCommand, dispatchShortcut } from "../commands";
import { DocumentSnapshot } from "./DocumentSnapshot";
import { makeDocumentPage } from "../mock/fixtures";
import type { SavedDocumentPage } from "@aux/contracts/document-snapshot";
const initial = useStore.getState(),
  windowId = bridge.windowId;
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const close = vi.fn();
type ReadSnapshot = SavedDocumentPage & { attachment: ConversationAttachment };
const snapshot = (id = "one", content = "Original full snapshot text"): ReadSnapshot => ({
  attachment: {
    attachmentId: id,
    filename: "Original document.txt",
    excerpt: "Original full",
    included: true,
    createdAt: 1,
    byteLength: content.length,
  },
  ...makeDocumentPage(content, "Original document.txt"),
});
let reads: {
  params: unknown;
  resolve(value: ReturnType<typeof snapshot>): void;
  reject(reason: unknown): void;
}[];
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  useStore.setState({ ...initial, connected: false, toasts: [] }, true);
  close.mockReset();
  reads = [];
  vi.spyOn(bridge, "invoke").mockImplementation((method, params) => {
    if (method !== "conversations.attachments.read") throw new Error(`Unexpected ${method}`);
    return new Promise((resolve, reject) => reads.push({ params, resolve, reject }));
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  bridge.windowId = windowId;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function render(chat = "a", id = "one") {
  await act(async () => root.render(<DocumentSnapshot chatId={chat} attachmentId={id} onClose={close} />));
}
async function ready() {
  await render();
  await act(async () => reads[0]!.resolve(snapshot()));
}
const control = (command: string) => host.querySelector<HTMLElement>(`[data-command-id="${command}"]`)!;
async function command(id: string) {
  let result!: Promise<unknown>;
  await act(async () => {
    control(id).focus();
    result = executeCommand(id);
    void result.catch(() => {});
  });
  return { result };
}
const details = "toggle-conversation-document-details",
  retry = "retry-conversation-document-read",
  closeId = "close-conversation-document-preview";
it("actual original read/filename/scope/source disclosure and full text remain intact", async () => {
  await ready();
  expect(reads[0]!.params).toEqual({ chatId: "a", attachmentId: "one" });
  expect(host.textContent).toContain("Original document.txt");
  expect(host.textContent).toContain("Original full snapshot text");
  expect(host.textContent).toContain("relevant excerpts are chosen within the model’s available context");
  const pointer = new MouseEvent("click", { bubbles: true, cancelable: true });
  await act(async () => {
    expect(control(details).dispatchEvent(pointer)).toBe(false);
  });
  expect(pointer.defaultPrevented).toBe(true);
  expect(host.querySelector<HTMLDetailsElement>("details")!.open).toBe(true);
  expect(host.textContent).toContain("Earlier turns and retries keep their original");
});
it("retry actual producer keeps error identity text and resolves fresh original request", async () => {
  await render();
  const reason = new Error("Original read failed");
  await act(async () => reads[0]!.reject(reason));
  expect(host.querySelector('[role="alert"]')?.textContent).toContain(String(reason));
  await command(retry);
  expect(reads).toHaveLength(2);
  expect(reads[1]!.params).toEqual(reads[0]!.params);
  await act(async () => reads[1]!.resolve(snapshot()));
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
it("close loading snapshot is registered and retains original callback ACK", async () => {
  await render();
  const ack = { original: "close" };
  close.mockReturnValue(ack);
  const original = await command(closeId);
  await expect(original.result).resolves.toBe(ack);
  expect(close).toHaveBeenCalledTimes(1);
});
it("held chat A→B→A replies cannot replace the newest actual snapshot", async () => {
  await render();
  await render("b");
  await render("a");
  expect(reads).toHaveLength(3);
  await act(async () => reads[2]!.resolve(snapshot("one", "Current accepted source")));
  await act(async () => {
    reads[0]!.resolve(snapshot("one", "Retired original source"));
    reads[1]!.resolve(snapshot("one", "Foreign chat source"));
  });
  expect(host.textContent).toContain("Current accepted source");
  expect(host.textContent).not.toContain("Retired original source");
  expect(host.textContent).not.toContain("Foreign chat source");
});
it("held attachment one→two→one failure cannot replace current source", async () => {
  await render();
  await render("a", "two");
  await render("a", "one");
  await act(async () => reads[2]!.resolve(snapshot()));
  await act(async () => reads[0]!.reject(new Error("Retired source failure")));
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.textContent).toContain("Original full snapshot text");
});
it("observed foreign window ABA refuses old close and held reply publication", async () => {
  await render();
  bridge.windowId = "foreign";
  await act(async () => control(closeId).click());
  bridge.windowId = windowId;
  await expect(executeCommand(closeId)).rejects.toThrow();
  await act(async () => reads[0]!.resolve(snapshot()));
  expect(host.textContent).not.toContain("Original full snapshot text");
  expect(close).not.toHaveBeenCalled();
  expect(useStore.getState().toasts).toEqual([]);
});
it("committed disconnected→connected→disconnected renews exact read and refuses old failures", async () => {
  await render();
  await act(async () => useStore.setState({ connected: true }));
  await act(async () => useStore.setState({ connected: false }));
  expect(reads).toHaveLength(3);
  await act(async () => reads[2]!.resolve(snapshot("one", "Latest source after renewal")));
  await act(async () => reads[0]!.reject(new Error("Old disconnected reply")));
  expect(host.textContent).toContain("Latest source after renewal");
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
it("focused remap uses the actual loaded summary control", async () => {
  useStore.setState({
    settings: {
      shortcutOverrides: {
        [details]: [{ key: "j", command: true, alt: true }],
      },
    },
  });
  await ready();
  await act(async () => {
    control(details).focus();
    expect(dispatchShortcut({ key: "j", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(host.querySelector<HTMLDetailsElement>("details")!.open).toBe(true);
});
it("excluded snapshot accurately describes future context without promising fixed excerpts", async () => {
  await render();
  const value = snapshot();
  value.attachment.included = false;
  await act(async () => reads[0]!.resolve(value));
  expect(host.textContent).toContain("Excluded from new replies");
  expect(host.textContent).toContain(value.chunk.segments[0]!.text);
});
it("hidden/unfocused controls refuse original close or display mutation", async () => {
  await ready();
  control(closeId).setAttribute("hidden", "");
  control(closeId).focus();
  await expect(executeCommand(closeId)).rejects.toThrow();
  host.focus();
  await expect(executeCommand(details)).rejects.toThrow();
  expect(close).not.toHaveBeenCalled();
});
it("all remaining actions remain original normal scoped controls", () => {
  for (const id of [details, retry, closeId])
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      windows: ["normal", "private"],
      palette: false,
      bindings: [],
      intercept: true,
    });
});

it("committed layout-cut same-attachment new-chat cannot disclose old snapshot before passive clear", async () => {
  let attack = false,
    completion: Promise<unknown> | undefined,
    observedOpen: boolean | undefined;
  function Probe({ attack }: { attack: boolean }) {
    useLayoutEffect(() => {
      if (attack) {
        control(details).focus();
        completion = executeCommand(details);
        void completion.catch(() => {});
        observedOpen = host.querySelector<HTMLDetailsElement>("details")!.open;
      }
    }, [attack]);
    return null;
  }
  function View({ chat }: { chat: string }) {
    return (
      <>
        <DocumentSnapshot attachmentId="one" chatId={chat} onClose={close} />
        <Probe attack={attack} />
      </>
    );
  }
  await act(async () => root.render(<View chat="a" />));
  await act(async () => reads[0]!.resolve(snapshot()));
  attack = true;
  await act(async () => root.render(<View chat="b" />));
  expect(observedOpen).toBe(false);
  await expect(completion).rejects.toThrow();
  await act(async () => reads[1]!.resolve(snapshot()));
  await command(details);
  expect(host.querySelector<HTMLDetailsElement>("details")!.open).toBe(true);
});
it("refused original summary pointer prevents browser default disclosure after observed window drift", async () => {
  await ready();
  const node = control(details),
    element = host.querySelector<HTMLDetailsElement>("details")!;
  bridge.windowId = "foreign";
  const event = new MouseEvent("click", { bubbles: true, cancelable: true });
  let accepted = true;
  await act(async () => {
    accepted = node.dispatchEvent(event);
  });
  expect(element.open).toBe(false);
  expect(accepted).toBe(false);
  expect(event.defaultPrevented).toBe(true);
  bridge.windowId = windowId;
  node.focus();
  await expect(executeCommand(details)).rejects.toThrow();
  expect(useStore.getState().toasts).toEqual([]);
});

it("loads only requested immutable sections and replays Previous with the accepted manifest", async () => {
  await render();
  const first = { ...snapshot(), nextCursor: "second" };
  await act(async () => reads[0]!.resolve(first));
  expect(reads).toHaveLength(1);
  await command("next-document-section");
  expect(reads[1]!.params).toEqual({
    chatId: "a",
    attachmentId: "one",
    sha256: first.sha256,
    cursor: "second",
  });
  const second = {
    ...snapshot("one", "Last located section"),
    chunk: {
      index: 1,
      segments: [{ locator: { kind: "text" as const, line: 50, offset: 0 }, text: "Last located section" }],
    },
  };
  await act(async () => reads[1]!.resolve(second));
  expect(host.textContent).toContain("Last located section");
  expect(host.textContent).toContain("Line 50");
  expect(host.textContent).not.toContain("Original full snapshot text");
  await command("previous-document-section");
  expect(reads[2]!.params).toEqual({
    chatId: "a",
    attachmentId: "one",
    sha256: first.sha256,
    cursor: undefined,
  });
  await act(async () => reads[2]!.resolve(first));
  expect(host.textContent).toContain("Original full snapshot text");
  await command("next-document-section");
  await render("other");
  await act(async () => reads[3]!.resolve(second));
  expect(host.textContent).not.toContain("Last located section");
});
