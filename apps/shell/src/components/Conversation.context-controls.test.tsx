// @vitest-environment jsdom
import { act, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { executeCommand, dispatchShortcut } from "../commands";
import { makePage } from "../mock/fixtures";
import { Conversation } from "./Conversation";
import { useConversationContextControls } from "./ConversationContextControls";
import { Popover } from "../ui/popover";

const initial = useStore.getState(), windowId = bridge.windowId;
const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100 }] as unknown as DOMRectList);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; }); vi.stubGlobal("cancelAnimationFrame", () => {});
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  const page = makePage(0, { url: "http://127.0.0.1:3210/context", title: "Original selected context" });
  useStore.setState({ ...initial, runs: [], steps: {}, pages: [page], activePageId: page.pageId, connected: true, toasts: [], pendingTurns: [], prompt: null, conversationDrafts: { "chat:a": "Keep A draft", "chat:b": "Keep B draft" }, conversationContexts: { "chat:a": page.pageId }, conversationBrowserSources: {} }, true);
  vi.spyOn(bridge, "onEvent").mockImplementation(() => () => {});
  vi.spyOn(bridge, "invoke").mockImplementation(async method => {
    if (method === "runs.list" || method === "runs.messages.list") return [];
    if (method === "conversations.get") return { title: "Original chat", archived: false };
    if (method === "conversations.artifacts.get") return { artifacts: [] };
    if (method === "conversations.images.get") return { images: [] };
    if (method === "conversations.attachments.get") return { attachments: [] };
    if (method === "conversations.sources.get") return { sources: [] };
    if (method === "runs.context.get") return { entries: [], historyEnabled: true };
    return { workspace: null, memory: null };
  });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount()); host.remove(); useStore.setState(initial, true); bridge.windowId = windowId;
  vi.restoreAllMocks(); vi.unstubAllGlobals();
  if (scroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", scroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});
const add = () => host.querySelector<HTMLButtonElement>('[aria-label="Add context"]')!;
const summary = () => host.querySelector<HTMLButtonElement>(".home-context-summary")!;
const panel = (label = "Add context") => document.querySelector<HTMLDialogElement>(`dialog[aria-label="${label}"]`);
async function render(chat = "a") { await act(async () => root.render(<Conversation chatId={chat} embedded/>)); }
async function command(control = add()) { await act(async () => { control.focus(); await executeCommand("toggle-conversation-context"); }); }
async function cancel(label = "Add context") { await act(async () => panel(label)!.dispatchEvent(new Event("cancel", { cancelable: true }))); }
function key(node: Element, value: string) { return node.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true })); }
it("registered Add toggles the original portal and preserves the exact composer, context and draft", async () => {
  await render(); const input = host.querySelector<HTMLTextAreaElement>("textarea")!, context = useStore.getState().conversationContexts;
  await act(async () => { add().focus(); add().click(); }); expect(panel()).not.toBeNull(); expect(add().getAttribute("aria-expanded")).toBe("true");
  await cancel(); expect(panel()).toBeNull(); expect(document.activeElement).toBe(add());
  expect(host.querySelector("textarea")).toBe(input); expect(input.value).toBe("Keep A draft"); expect(useStore.getState().conversationContexts).toBe(context);
  expect(vi.mocked(bridge.invoke).mock.calls.some(([method]) => method === "runs.start" || method === "runs.context.set")).toBe(false);
});
it("context summary invokes the retained original activation without a synthetic click or lookup", async () => {
  await render(); const actualClick = vi.fn(); add().addEventListener("click", actualClick); const lookup = vi.spyOn(host.querySelector(".conversation")!, "querySelector");
  await act(async () => { summary().focus(); summary().click(); });
  expect(panel()).not.toBeNull(); expect(actualClick).not.toHaveBeenCalled(); expect(lookup.mock.calls.some(([selector]) => String(selector).includes("home-tools-trigger"))).toBe(false);
  await cancel(); expect(document.activeElement).toBe(add()); expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep A draft");
});
it("focused remapped summary opens choices while disconnected without changing current context", async () => {
  useStore.setState({ connected: false, settings: { shortcutOverrides: { "toggle-conversation-context": [{ key: "j", command: true, alt: true }] } } });
  await render(); await act(async () => { summary().focus(); expect(dispatchShortcut({ key: "j", meta: true, alt: true, shift: false })).toBe(true); });
  expect(panel()).not.toBeNull(); expect(panel()!.querySelector('[aria-label="Browser context"]')).not.toBeNull();
  await cancel(); expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep A draft"); expect(useStore.getState().conversationContexts["chat:a"]).toBe("page-1");
});
it("original nested browser-tab Popover Escape/cancel keeps outer choices and restores each actual opener", async () => {
  await render(); await command(); const nested = panel()!.querySelector<HTMLButtonElement>('[aria-label="Add browser tabs"]')!;
  await act(async () => { nested.focus(); nested.click(); }); expect(panel("Add browser tabs")).not.toBeNull();
  await act(async () => key(panel("Add browser tabs")!.querySelector("input")!, "Escape"));
  expect(panel("Add browser tabs")).toBeNull(); expect(panel()).not.toBeNull(); expect(document.activeElement).toBe(nested);
  await act(async () => nested.click()); await cancel("Add browser tabs"); expect(panel()).not.toBeNull(); expect(document.activeElement).toBe(nested);
  await act(async () => key(nested, "Escape")); expect(panel()).toBeNull(); expect(document.activeElement).toBe(add());
});
it("original backdrop click closes choices and returns to Add, without changing draft", async () => {
  await render(); await command(summary());
  await act(async () => panel()!.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 100, clientY: 100 })));
  expect(panel()).toBeNull(); expect(document.activeElement).toBe(add()); expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep A draft");
});
it("both controls remain actual focused owners and ambiguous/unfocused dispatch cannot choose one", async () => {
  await render(); await expect(executeCommand("toggle-conversation-context")).rejects.toThrow("focused");
  await command(add()); expect(panel()).not.toBeNull(); await cancel();
  await command(summary()); expect(panel()).not.toBeNull(); await cancel();
  expect(vi.mocked(bridge.invoke).mock.calls.some(([method]) => method === "runs.start")).toBe(false);
});
it("summary refuses a hidden or disabled original Add target without fabricating another opener", async () => {
  await render(); add().disabled = true; await expect((async () => { summary().focus(); return executeCommand("toggle-conversation-context"); })()).rejects.toThrow("original conversation context"); expect(panel()).toBeNull();
  add().disabled = false; add().closest<HTMLElement>(".home-tools-trigger")!.hidden = true;
  await expect(executeCommand("toggle-conversation-context")).rejects.toThrow("original conversation context"); expect(panel()).toBeNull();
});
it("observed foreign-window ABA permanently refuses old controls but does not retire a newer chat owner", async () => {
  await render(); const old = add(); await act(async () => old.focus()); bridge.windowId = "foreign";
  await expect(executeCommand("toggle-conversation-context")).rejects.toThrow(); bridge.windowId = windowId;
  await expect(executeCommand("toggle-conversation-context")).rejects.toThrow(); expect(panel()).toBeNull();
  await render("b"); await command(); expect(panel()).not.toBeNull(); await cancel(); expect(useStore.getState().conversationDrafts["chat:b"]).toBe("Keep B draft");
});
function OptionalOpener({ mounted }: { mounted: boolean }) {
  const current = useCallback(() => true, []), controls = useConversationContextControls(current);
  return <>{mounted && <Popover label="Owned optional context" trigger="Original" triggerControl={controls.triggerControl} onTrigger={controls.onTrigger}>{() => <input aria-label="Owned field"/>}</Popover>}
    <button ref={controls.summaryRef} onClick={controls.onSummary}>Summary</button></>;
}
it("an absent or removed actual Add target cannot be replaced by an inferred control", async () => {
  await act(async () => root.render(<OptionalOpener mounted/>)); const original = host.querySelector<HTMLButtonElement>('[aria-label="Owned optional context"]')!;
  await act(async () => root.render(<OptionalOpener mounted={false}/>)); expect(original.isConnected).toBe(false);
  await act(async () => host.querySelector("button")!.focus()); await expect(executeCommand("toggle-conversation-context")).rejects.toThrow("original conversation context"); expect(panel("Owned optional context")).toBeNull();
});
it("unopted original Popover retains toggle, initial focus, disabled-close and cancellation behavior", async () => {
  function Default({ disabled = false }) { const field = useRef<HTMLInputElement>(null); return <Popover label="Unopted original" trigger="Open" initialFocusRef={field} disabled={disabled}>{() => <><button>First</button><input ref={field} aria-label="Preferred field"/></>}</Popover>; }
  await act(async () => root.render(<Default/>)); const trigger = host.querySelector("button")!;
  await act(async () => { trigger.focus(); trigger.click(); }); expect(document.activeElement).toBe(panel("Unopted original")!.querySelector("input"));
  await cancel("Unopted original"); expect(document.activeElement).toBe(trigger); expect(panel("Unopted original")).toBeNull();
  await act(async () => trigger.click()); await act(async () => root.render(<Default disabled/>)); expect(panel("Unopted original")).toBeNull(); expect(trigger.disabled).toBe(true);
});
it("opt-in Popover receives the genuine original click event and invokes its same internal activation", async () => {
  let activate!: () => void; const events: Event[] = [], native: Event[] = [];
  await act(async () => root.render(<Popover label="Owned event" trigger="Open" triggerControl={(_, toggle) => { activate = toggle; }} onTrigger={event => { events.push(event.nativeEvent); activate(); }}>{() => <input/>}</Popover>));
  const trigger = host.querySelector("button")!; trigger.addEventListener("click", event => native.push(event));
  await act(async () => trigger.click()); expect(events).toEqual(native); expect(panel("Owned event")).not.toBeNull(); await cancel("Owned event");
});
it("the context row is normal scoped and remappable", () => {
  expect(COMMANDS.find(row => row.id === "toggle-conversation-context")).toMatchObject({ windows: ["normal"], palette: false, bindings: [], intercept: true });
});
