// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { draftWriter } from "./persistence";
import { DRAFT_ENTRY_PREFIX } from "../conversation-drafts";
import { BROWSER_SOURCES_PREFIX } from "../browser-context-sources";
const initial = useStore.getState();
const initialPrivate = bridge.privateMode;
afterEach(() => {
  draftWriter.flush();
  localStorage.clear();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  bridge.privateMode = initialPrivate;
});
it("switching a composed normal draft to Temporary erases its stored copy and keeps further edits in memory", () => {
  const state = useStore.getState();
  state.setConversationDraft("chat", "Normal draft");
  state.setConversationBrowserSources("chat", [
    { pageId: "source", documentEpoch: 1, url: "https://example.test/" },
  ]);
  draftWriter.flush();
  expect(localStorage.getItem(DRAFT_ENTRY_PREFIX + "chat:chat")).toBe("Normal draft");
  state.setComposerPreferences("chat:chat", { privateTask: true });
  expect(localStorage.getItem(DRAFT_ENTRY_PREFIX + "chat:chat")).toBeNull();
  expect(localStorage.getItem(BROWSER_SOURCES_PREFIX + "chat:chat")).toBeNull();
  state.setConversationDraft("chat", "Temporary secret");
  state.setConversationContext("chat", "temporary-tab");
  draftWriter.flush();
  expect(useStore.getState().conversationDrafts["chat:chat"]).toBe("Temporary secret");
  expect(
    [...Array(localStorage.length)]
      .map((_, index) => localStorage.getItem(localStorage.key(index)!))
      .join(" "),
  ).not.toContain("Temporary secret");
  expect(localStorage.getItem(DRAFT_ENTRY_PREFIX + "chat:chat")).toBeNull();
});
it("new temporary composers and private windows never write their draft text", () => {
  const writes = vi.spyOn(Storage.prototype, "setItem");
  useStore.getState().setComposerPreferences("new", { privateTask: true });
  useStore.getState().setAgentDraft("Temporary new question");
  draftWriter.flush();
  bridge.privateMode = true;
  useStore.getState().setConversationDraft("private", "Private-window question");
  draftWriter.flush();
  expect(writes.mock.calls.flat().join(" ")).not.toMatch(/Temporary new question|Private-window question/);
  expect(useStore.getState().agentDraft).toBe("Temporary new question");
  expect(useStore.getState().conversationDrafts["chat:private"]).toBe("Private-window question");
});
