// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ExternalAgentOversight } from "./ExternalAgentOversight";

const rpc = vi.hoisted(() => vi.fn());
const openRail = vi.hoisted(() => vi.fn());
vi.mock("../store", () => ({ call: rpc, useStore: (selector: (state: unknown) => unknown) => selector({ openRail }) }));

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  rpc.mockReset(); openRail.mockReset();
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); });

it("shows only durable runs for known connections and opens the shared receipt surface", async () => {
  const ours = { runId: "ours", goal: "Private title", status: "running", createdAt: 1,
    statusMessage: "External agent used pages.execute", config: { implementation: "external-agent", externalConnectionId: "c1" } };
  rpc.mockImplementation(async (method: string) => {
    if (method === "runs.list") return [ours, { runId: "foreign", status: "running", createdAt: 2,
      config: { implementation: "external-agent", externalConnectionId: "c2" } }];
    if (method === "safety.approvals.pending") return [{ approvalId: "a1", action: {} }];
    if (method === "runs.get") return { run: ours, steps: [
      { runId: "ours", op: "pages.execute", outcome: { status: "ok" }, inputs: { secret: "do not show" } },
      { runId: "foreign", op: "agent.web.fetch", outcome: { status: "failed" } },
    ] };
    throw new Error(`Unexpected ${method}`);
  });
  const connection = { connectionId: "c1", name: "Codex task", client: "codex" as const,
    scope: { kind: "workspace" as const, workspaceId: "w1" }, createdAt: 1 };
  await act(async () => root.render(<ExternalAgentOversight connections={[connection]} />));
  expect(host.textContent).toContain("Codex task · running");
  expect(host.textContent).toContain("External agent used pages.execute");
  expect(host.textContent).toContain("1 approval request(s) need review");
  expect(host.textContent).not.toContain("foreign");
  const activity = [...host.querySelectorAll("button")].find(button => button.textContent === "Show activity");
  await act(async () => activity!.click());
  expect(host.textContent).toContain("Recorded external actions · 1");
  expect(host.textContent).not.toContain("do not show");
  const review = [...host.querySelectorAll("button")].find(button => button.textContent === "Review run");
  await act(async () => review!.click());
  expect(openRail).toHaveBeenCalledWith({ kind: "run", runId: "ours" });
});
