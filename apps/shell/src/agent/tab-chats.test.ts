// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { makePage } from "../mock/fixtures";
import { normalizePages } from "../store/pages";
import { installTabChats } from "./tab-chats";

const initial = useStore.getState();
let off: () => void;
let event: Parameters<typeof bridge.onEvent>[0];
beforeEach(() => {
  bridge.privateMode = false;
  bridge.windowKind = "normal";
  vi.spyOn(bridge, "onEvent").mockImplementation((callback) => {
    event = callback;
    return () => {};
  });
  useStore.setState(
    {
      ...initial,
      settings: {},
      activePageId: "a",
      railView: { kind: "draft", chatId: "chat-a" },
      pages: normalizePages([makePage(1, { pageId: "a" }), makePage(2, { pageId: "b" })]),
      conversationDrafts: { "chat:chat-a": "Keep my draft" },
    },
    true,
  );
  off = installTabChats();
});
afterEach(() => {
  off();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
});

it("restores per-tab chats without deleting drafts and honors Keep current chat", () => {
  useStore.setState({ activePageId: "b" });
  const second = useStore.getState().railView;
  expect(second).toMatchObject({ kind: "draft" });
  expect(second).not.toEqual({ kind: "draft", chatId: "chat-a" });
  useStore.setState({ activePageId: "a" });
  expect(useStore.getState().railView).toEqual({ kind: "draft", chatId: "chat-a" });
  expect(useStore.getState().conversationDrafts["chat:chat-a"]).toBe("Keep my draft");
  useStore.setState({ activePageId: "b" });
  expect(useStore.getState().railView).toEqual(second);
  useStore.setState({ settings: { askTabSwitch: "keep-current" }, activePageId: "a" });
  expect(useStore.getState().railView).toEqual(second);
});

it("does not override explicit chat navigation, set panels or private-window state", () => {
  useStore.setState({ activePageId: "b", railView: { kind: "draft", chatId: "explicit" } });
  expect(useStore.getState().railView).toEqual({ kind: "draft", chatId: "explicit" });
  useStore.setState({ railView: { kind: "set", setId: "set" }, activePageId: "a" });
  expect(useStore.getState().railView).toEqual({ kind: "set", setId: "set" });
  bridge.privateMode = true;
  useStore.setState({ activePageId: "b" });
  expect(useStore.getState().railView).toEqual({ kind: "set", setId: "set" });
});

it("forgets a deleted chat while another tab is selected", () => {
  useStore.setState({ activePageId: "b" });
  event({ seq: 1, streamId: "test", ts: 1, type: "conversation.deleted", payload: { chatId: "chat-a" } });
  useStore.setState({ activePageId: "a" });
  expect(useStore.getState().railView).not.toEqual({ kind: "draft", chatId: "chat-a" });
});
