// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ChatSessions } from "./ChatSessions";
import { bridge } from "../bridge";
import { makeRun } from "../mock/fixtures";

it("bounds recent chats, exposes organization in one menu, and requires confirmation before deletion", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => { fn(0); return 1; });
  const storage = new Map<string,string>();
  vi.stubGlobal("localStorage", { getItem:(key:string)=>storage.get(key) ?? null, setItem:(key:string,value:string)=>storage.set(key,value), removeItem:(key:string)=>storage.delete(key) });
  vi.useFakeTimers();
  const rows = Array.from({length: 9}, (_,i) => ({ chatId:`chat-${i}`, title:`Session ${i}`, archived:false, updatedAt:100-i, createdAt:100-i, turnCount:1, latestRun:makeRun({runId:`run-${i}`,config:{chatId:`chat-${i}`}}) }));
  vi.spyOn(bridge, "onEvent").mockReturnValue(() => {});
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async method => method === "conversations.list" ? rows : undefined);
  const host=document.createElement("div"); document.body.append(host); const root=createRoot(host);
  try {
    await act(async () => root.render(<ChatSessions compact/>));
    await act(async () => vi.advanceTimersByTimeAsync(110));
    expect(host.querySelectorAll(".session-item")).toHaveLength(3);
    expect(host.querySelectorAll(".session-item .ui-menu-trigger")).toHaveLength(3);
    expect(host.textContent).toContain("All chats");
    expect(host.textContent).not.toContain("Projects");
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Actions for Session 0"]')!.click());
    const item = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find(button => button.textContent?.includes("Delete chat"))!;
    await act(async () => item.click());
    expect(invoke.mock.calls.some(([method]) => method === "conversations.delete")).toBe(false);
    expect(host.querySelector('.session-disclosure.open')?.textContent).toContain("Delete this chat permanently?");
    await act(async () => host.querySelector('.session-disclosure.open')!.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true})));
    expect(host.querySelector('.session-disclosure.open')).toBeNull();
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Actions for Session 0");
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Actions for Session 0"]')!.click());
    const move = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find(button => button.textContent?.includes("Move to project"))!;
    await act(async () => move.click());
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Project for Session 0");
    await act(async () => host.querySelector('.session-disclosure.open')!.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true})));
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Actions for Session 0");
  } finally { await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); vi.useRealTimers(); vi.unstubAllGlobals(); }
});
