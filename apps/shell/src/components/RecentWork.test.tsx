// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { RecentWork } from "../chat-list/RecentWork";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { makeRun } from "../mock/fixtures";
it("uses the latest turn’s actual table and opens its exact saved result", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const initial = useStore.getState();
  useStore.setState({ conversationDrafts: {}, resultPreview: null });
  const run = makeRun({ runId: "latest", config: { chatId: "chat" }, status: "completed" });
  const artifact = {
    artifactId: "table-2",
    runId: "latest",
    filename: "comparison.csv",
    mediaType: "text/csv",
    excerpt: "Name,Value\nCorrect,42",
    byteLength: 30,
    createdAt: 2,
    turnGoal: "Compare",
    included: true,
    revision: 2,
  };
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "conversations.list")
      return [
        {
          chatId: "chat",
          title: "Comparison",
          latestRun: run,
          updatedAt: 2,
          createdAt: 1,
          archived: false,
          turnCount: 2,
        },
      ];
    if (method === "conversations.artifacts.get")
      return {
        chatId: "chat",
        artifacts: [
          artifact,
          { ...artifact, artifactId: "old", runId: "previous", excerpt: "Stale,999", createdAt: 3 },
        ],
      };
    return [];
  });
  const host = document.createElement("div"),
    root = createRoot(host);
  document.body.append(host);
  try {
    await act(async () => root.render(<RecentWork />));
    expect(host.querySelector("table")?.textContent).toContain("Correct42");
    expect(host.textContent).not.toContain("Stale");
    await act(async () => host.querySelector<HTMLButtonElement>(".home-result-open")!.click());
    expect(useStore.getState().resultPreview).toBe("table-2");
    expect(invoke.mock.calls.filter(([method]) => method === "results.read")).toHaveLength(0);
    await act(async () => useStore.setState({ conversationDrafts: { "chat:chat": "My unsent follow-up" } }));
    expect(host.querySelector(".home-result-open")).toBeNull();
    expect(host.textContent).toContain("My unsent follow-up");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    useStore.setState(initial, true);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
