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

it("describes actual browser Profile import without discovering anything on disclosure", async () => {
  rpc.mockReset();
  rpc.mockRejectedValue(new Error("No prior import"));
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    const copy = () => host.textContent!.replace(/\s+/g, " ");
    expect(copy()).toContain("Choose available data from detected browser Profiles.");
    expect(copy()).toContain("Nothing is imported until you confirm.");
    expect(copy()).toContain("Cookies and agent permissions are not copied.");
    const details = [...host.querySelectorAll("details")];
    expect(details).toHaveLength(3);
    expect(details.every((item) => !item.open)).toBe(true);
    const summary = details[1]!.querySelector("summary")!;
    await act(async () => {
      summary.focus();
      summary.click();
    });
    expect(document.activeElement).toBe(summary);
    expect(details[1]!.open).toBe(true);
    for (const fact of [
      "may ask macOS to unlock the source browser’s Safe Storage key",
      "Check the app and purpose in the system prompt; you can cancel it",
      "Keys and password text stay in the native browser",
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
    expect(copy).toContain(
      "Native import completion is unknown. Some accepted items may already be imported.",
    );
    expect(copy).toContain("Review sources and select what to import next.");
    expect(copy).toContain("A fresh import can add duplicates.");
    expect(copy).toContain(
      "Counts cover confirmed native completion; an interrupted request may have accepted more.",
    );
    expect(
      [...host.querySelectorAll("button")].find((button) => button.textContent === "Review sources to retry")!
        .disabled,
    ).toBe(false);
    expect(rpc.mock.calls).toEqual([["import.status", {}]]);
  } finally {
    await act(async () => root.unmount());
  }
});
