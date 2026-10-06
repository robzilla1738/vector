// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { ActivityLog } from "./ActivityLog";
import { bridge } from "../../bridge";
import type { SafetyActivityPage } from "@aux/contracts/safety-activity";
const entry = (action: string) => ({
  decisionId: "00000000-0000-4000-8000-000000000001",
  at: 1,
  actor: "builtin_agent",
  effect: "read",
  category: "read",
  action,
  origin: "https://fixture.test",
  status: "allow" as const,
  source: "policy",
  guidance: null,
  runId: null,
  taskId: null,
});
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("pages real decisions using the returned cursor without duplicating overlap", async () => {
  const cursor = { at: 1, decisionId: entry("read").decisionId };
  const invoke = vi
    .spyOn(bridge, "invoke")
    .mockResolvedValueOnce({ entries: [entry("Read page")], nextCursor: cursor })
    .mockResolvedValueOnce({ entries: [entry("Read page")], nextCursor: null });
  await act(async () => root.render(<ActivityLog active />));
  await act(async () =>
    [...host.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent === "Load more activity")!
      .click(),
  );
  expect(invoke).toHaveBeenLastCalledWith("safety.decisions.list", { limit: 50, cursor });
  expect(host.querySelectorAll("article")).toHaveLength(1);
  expect(host.textContent).not.toContain("Load more activity");
});
it("ignores a retired view response when the activity section is revisited", async () => {
  let old!: (page: SafetyActivityPage) => void;
  vi.spyOn(bridge, "invoke")
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          old = resolve;
        }),
    )
    .mockResolvedValueOnce({ entries: [entry("Current view")], nextCursor: null });
  await act(async () => root.render(<ActivityLog active />));
  await act(async () => root.render(<ActivityLog active={false} />));
  await act(async () => root.render(<ActivityLog active />));
  await act(async () => old({ entries: [entry("Retired view")], nextCursor: null }));
  expect(host.textContent).toContain("Current view");
  expect(host.textContent).not.toContain("Retired view");
});
