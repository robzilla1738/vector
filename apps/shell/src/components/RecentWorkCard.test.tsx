// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import type { ConversationSummary } from "@aux/contracts";
import { useStore } from "../store";
import { makeRun } from "../mock/fixtures";
import { RecentConversationCard } from "./RecentWorkCard";

const previews = vi.hoisted(() => vi.fn());
vi.mock("./surfaces", () => ({
  AnswerPreview: ({ text }: { text: string }) => {
    previews(text);
    return <p>{text}</p>;
  },
}));

it("updates only the changed chat draft and preserves focus on another card", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const initial = useStore.getState();
  useStore.setState({ conversationDrafts: {} });
  const items = ["a", "b"].map(
    (id) =>
      ({
        chatId: id,
        title: `Chat ${id}`,
        updatedAt: 1,
        createdAt: 1,
        archived: false,
        turnCount: 1,
        latestRun: makeRun({ runId: id, goal: `Read ${id}`, status: "completed", result: {} }),
      }) as ConversationSummary,
  );
  const host = document.createElement("div"),
    root = createRoot(host);
  document.body.append(host);
  try {
    await act(async () =>
      root.render(
        <>
          {items.map((item) => (
            <RecentConversationCard key={item.chatId} item={item} />
          ))}
        </>,
      ),
    );
    const first = host.querySelector("button")!;
    first.focus();
    previews.mockClear();
    await act(async () => useStore.setState({ conversationDrafts: { "chat:b": "Unsent B" } }));
    expect(previews.mock.calls).toEqual([["Unsent B"]]);
    expect(document.activeElement).toBe(first);
    previews.mockClear();
    await act(async () =>
      useStore.setState({ conversationDrafts: { "chat:b": "Unsent B", "chat:unrelated": "Other draft" } }),
    );
    expect(previews).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(first);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    useStore.setState(initial, true);
    vi.unstubAllGlobals();
  }
});
