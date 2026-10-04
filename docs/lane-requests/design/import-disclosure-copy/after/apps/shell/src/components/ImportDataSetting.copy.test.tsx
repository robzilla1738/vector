// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import type { AuxEvent, ImportJobStatus } from "@aux/contracts";
import { ImportDataSetting } from "./ImportDataSetting";

const rpc = vi.hoisted(() => vi.fn());
const listeners = vi.hoisted(() => new Set<(event: AuxEvent) => void>());
vi.mock("../store", () => ({ call: rpc }));
vi.mock("../bridge", () => ({
  bridge: {
    onEvent: (listener: (event: AuxEvent) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  },
}));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("separates live-tab access from browser sources without discovering anything on disclosure", async () => {
  rpc.mockReset();
  rpc.mockRejectedValue(new Error("No prior import"));
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    const copy = () => host.textContent!.replace(/\s+/g, " ");
    expect(copy()).toContain("Chrome, Arc, Safari or Firefox. Live tabs require an attached Chrome.");
    expect(copy()).toContain("Nothing is imported until you confirm.");
    expect(copy()).toContain("Passwords, cookies, extensions and agent permissions are not imported here.");
    const details = [...host.querySelectorAll("details")];
    expect(details).toHaveLength(2);
    expect(details.every((item) => !item.open)).toBe(true);
    const summary = details[1]!.querySelector("summary")!;
    await act(async () => {
      summary.focus();
      summary.click();
    });
    expect(document.activeElement).toBe(summary);
    expect(details[1]!.open).toBe(true);
    for (const fact of [
      "does not ask for browser Keychain passwords",
      "Aux may separately ask macOS to unlock its protected local storage",
      "Check the app and purpose in that system prompt; you can cancel it",
      "Review password transfers separately in Passwords & Autofill",
      "Reading Safari data may require Full Disk Access",
    ])
      expect(copy()).toContain(fact);
    expect(rpc.mock.calls).toEqual([["import.status", {}]]);
    expect(host.querySelector('input[type="checkbox"]')).toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

it("keeps ongoing-job and partial-count warnings with explicit reviewed retry after interruption", async () => {
  const job: ImportJobStatus = {
    jobId: "owned-copy-job",
    done: false,
    cancelled: false,
    revision: 1,
    progress: [
      { source: "chrome", label: "Chrome", category: "history", state: "running", imported: 500, skipped: 0 },
    ],
  };
  rpc.mockReset();
  rpc.mockResolvedValue(job);
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    expect(host.textContent).toContain("You can leave this page and return to check progress.");
    expect(host.textContent).toContain("500 imported");
    expect(
      [...host.querySelectorAll("button")].find(
        (button) => button.textContent === "See what can be imported",
      )!.disabled,
    ).toBe(true);
    await act(async () => {
      for (const listener of listeners)
        listener({
          seq: 1,
          streamId: "owned-import-copy",
          ts: 1,
          type: "import.progress",
          payload: { ...job, revision: 2, done: true, interrupted: true },
        });
    });
    const copy = host.textContent!.replace(/\s+/g, " ");
    expect(copy).toContain("Import interrupted when Aux stopped. Confirmed items remain available.");
    expect(copy).toContain("Review sources and select what to retry.");
    expect(copy).toContain("Bookmarks and history merge safely; live tabs can open duplicates.");
    expect(copy).toContain("Counts cover confirmed batches; an interrupted request may have added more.");
    expect(
      [...host.querySelectorAll("button")].find((button) => button.textContent === "Review sources to retry")!
        .disabled,
    ).toBe(false);
    expect(rpc.mock.calls).toEqual([["import.status", {}]]);
  } finally {
    await act(async () => root.unmount());
  }
});
