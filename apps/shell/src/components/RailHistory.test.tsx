// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { useStore } from "../store";
import { makeRun } from "../mock/fixtures";
import { RailHistory } from "./RailHistory";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("keeps live and recent sections in sync as a run completes", async () => {
  const original = useStore.getState();
  const live = makeRun({ runId: "live", goal: "Live fixture", pageIds: [], createdAt: 200 });
  const past = makeRun({
    runId: "past",
    goal: "Past fixture",
    status: "completed",
    pageIds: [],
    createdAt: 100,
  });
  useStore.setState({ runs: [live, past], sets: [], members: [] });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<RailHistory />));
    expect(host.querySelector(".rail-block .count")?.textContent).toBe("1");
    expect(host.querySelector(".run-list")?.textContent).toContain("Past fixture");
    await act(async () => useStore.setState({ runs: [{ ...live, status: "completed" }, past] }));
    expect(host.querySelectorAll(".rail-block")).toHaveLength(1);
    expect(host.querySelector(".run-list")?.textContent).toContain("Live fixture");
    expect(host.querySelector(".run-list")?.textContent).toContain("Past fixture");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    useStore.setState(original, true);
  }
});
