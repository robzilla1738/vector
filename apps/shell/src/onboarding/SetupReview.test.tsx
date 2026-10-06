// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { AuxEvent, ImportJobStatus, OnboardingState } from "@aux/contracts";
import { SetupReview } from "./SetupReview";

const rpc = vi.hoisted(() => vi.fn());
let listener: ((event: AuxEvent) => void) | undefined;
vi.mock("../store", () => ({ call: rpc }));
vi.mock("../bridge", () => ({
  bridge: {
    onEvent: (fn: typeof listener) => {
      listener = fn;
      return () => {
        listener = undefined;
      };
    },
  },
}));
const state: OnboardingState = {
  version: 1,
  revision: 4,
  status: "active",
  step: "postcard",
  visited: [],
  skipped: [],
  disclosureVersion: 1,
};
const job = (): ImportJobStatus => ({
  jobId: "fixture-import",
  done: true,
  cancelled: false,
  revision: 2,
  startedAt: 10,
  selections: [{ sourceId: "chrome", profileId: "Fixture", categories: ["bookmarks", "history"] }],
  progress: [
    {
      source: "chrome",
      label: "Fixture Chrome",
      category: "bookmarks",
      imported: 4,
      skipped: 2,
      state: "done",
    },
    {
      source: "chrome",
      label: "Fixture Chrome",
      category: "history",
      imported: 7,
      skipped: 0,
      state: "done",
    },
  ],
});
let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
const visit = vi.fn(),
  recovery = vi.fn();
const render = async (patch: Partial<Parameters<typeof SetupReview>[0]> = {}) =>
  act(async () =>
    root.render(
      <SetupReview
        connected
        settings={{
          modelConfigured: true,
          modelProvider: "gateway",
          modelApiKey: "never-render-this-secret",
        }}
        state={state}
        recovery="ready"
        source={null}
        onVisit={visit}
        onCheckRecovery={recovery}
        {...patch}
      />,
    ),
  );
const button = (label: string) =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent === label)!;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  rpc.mockReset().mockResolvedValue(job());
  visit.mockReset();
  recovery.mockReset();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

it("shows confirmed import counts and authority explanations using only the existing receipt", async () => {
  await render();
  expect(rpc.mock.calls).toEqual([["import.status", {}]]);
  expect(host.textContent).toContain("Import finished · Chrome");
  expect(host.querySelector("dl, dt, dd")).toBeNull();
  expect(host.textContent).toContain("4 confirmed");
  expect(host.textContent).toContain("7 confirmed");
  expect(host.textContent).toContain("2 skipped");
  expect(host.textContent).toContain("does not request your browser’s Keychain passwords");
  expect(host.textContent).toContain("copies outside Aux cannot be revoked after Forget");
  expect(host.textContent).not.toContain("never-render-this-secret");
  await act(async () => button("Review browser import").click());
  expect(visit).toHaveBeenCalledWith("import");
  await act(async () => button("Review agent mode").click());
  expect(visit).toHaveBeenLastCalledWith("model");
  expect(rpc).toHaveBeenCalledOnce();
});

it.each(["running", "interrupted", "error"] as const)(
  "labels %s receipts without claiming completion or retrying",
  async (kind) => {
    rpc.mockResolvedValue({
      ...job(),
      done: kind !== "running",
      interrupted: kind === "interrupted",
      error: kind === "error" ? "fixture failure" : undefined,
    });
    await render();
    expect(host.textContent).not.toContain("Import finished");
    expect(host.textContent).toContain("4 confirmed");
    expect(rpc.mock.calls.every(([method]) => method === "import.status")).toBe(true);
  },
);

it("distinguishes no receipt from unavailable progress and supports an explicit refresh", async () => {
  rpc.mockRejectedValueOnce(Object.assign(new Error("No previous import"), { code: "not_found" }));
  await render();
  expect(host.textContent).toContain("No browser import recorded");
  rpc.mockRejectedValueOnce(new Error("offline"));
  await act(async () => button("Refresh import receipt").click());
  expect(host.textContent).toContain("Import progress is unavailable");
  expect(host.textContent).not.toContain("No browser import recorded");
  await act(async () => button("Refresh import receipt").click());
  expect(host.textContent).toContain("Import finished");
});

it("does not overwrite a newer progress event with a delayed older receipt", async () => {
  let finish!: (value: ImportJobStatus) => void;
  rpc.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await render();
  await act(async () =>
    listener?.({
      seq: 1,
      streamId: "fixture",
      ts: 1,
      type: "import.progress",
      payload: { ...job(), revision: 4, progress: [{ ...job().progress[0]!, imported: 20 }] },
    } as AuxEvent),
  );
  await act(async () => finish(job()));
  expect(host.textContent).toContain("20 confirmed");
  expect(host.textContent).not.toContain("4 confirmed");
});

it("retains fresh event evidence when an older status request fails", async () => {
  let fail!: (value: Error) => void;
  rpc.mockImplementationOnce(
    () =>
      new Promise((_resolve, reject) => {
        fail = reject;
      }),
  );
  await render();
  await act(async () =>
    listener?.({ seq: 1, streamId: "fixture", ts: 1, type: "import.progress", payload: job() } as AuxEvent),
  );
  await act(async () => fail(new Error("older request disconnected")));
  expect(host.textContent).toContain("Import finished");
  expect(host.textContent).not.toContain("Import progress is unavailable");
});

it("keeps recovery unavailability explicit and reconnects without automatic import effects", async () => {
  await render({ connected: false, recovery: "unavailable" });
  expect(rpc).not.toHaveBeenCalled();
  expect(button("Check recovery readiness").disabled).toBe(true);
  await render({ connected: true, recovery: "unavailable" });
  await act(async () => button("Check recovery readiness").click());
  expect(recovery).toHaveBeenCalledOnce();
  expect(rpc.mock.calls).toEqual([["import.status", {}]]);
});
