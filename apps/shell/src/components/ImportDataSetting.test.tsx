// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
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
afterEach(() => {
  listeners.clear();
  vi.useRealTimers();
});

it("sends only the source, Profile and categories the user checked", async () => {
  rpc.mockReset();
  rpc.mockImplementation(async (method: string) => {
    if (method === "import.preview")
      return {
        sources: [
          {
            id: "chrome",
            label: "Chrome",
            profiles: ["Personal", "Work"],
            categories: [],
            profileCategories: [
              {
                profileId: "Personal",
                categories: [
                  { category: "bookmarks", available: true },
                  { category: "history", available: true },
                ],
              },
              {
                profileId: "Work",
                categories: [
                  { category: "bookmarks", available: true },
                  { category: "history", available: true },
                ],
              },
            ],
          },
        ],
      };
    if (method === "import.run") return { jobId: "fixture-import" };
    if (method === "import.status") return { jobId: "fixture-import", done: true, progress: [] };
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    await act(async () => host.querySelector("button")!.click());
    const rows = [...host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    expect(rows).toHaveLength(4);
    expect(rows.every((row) => !row.checked)).toBe(true);
    await act(async () => rows[3]!.click());
    await act(async () =>
      [...host.querySelectorAll("button")]
        .find((button) => button.textContent?.startsWith("Import selected"))!
        .click(),
    );
    expect(rpc).toHaveBeenCalledWith("import.run", {
      selections: [{ sourceId: "chrome", profileId: "Work", categories: ["history"] }],
    });
  } finally {
    await act(async () => root.unmount());
  }
});

it("shows a stopped import as partial work rather than success", async () => {
  rpc.mockReset();
  rpc.mockImplementation(async (method: string) => {
    if (method === "import.preview")
      return {
        sources: [
          {
            id: "chrome-attached",
            label: "Attached Chrome",
            profiles: [],
            categories: [{ category: "tabs", available: true, count: 2 }],
            profileCategories: [],
          },
        ],
      };
    if (method === "import.run") return { jobId: "partial" };
    if (method === "import.status")
      return {
        jobId: "partial",
        done: true,
        cancelled: true,
        progress: [
          {
            source: "chrome-attached",
            label: "Attached Chrome",
            category: "tabs",
            state: "done",
            imported: 1,
            skipped: 1,
          },
        ],
      };
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    await act(async () => host.querySelector("button")!.click());
    await act(async () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
    await act(async () =>
      [...host.querySelectorAll("button")]
        .find((button) => button.textContent?.startsWith("Import selected"))!
        .click(),
    );
    expect(host.textContent).toContain("Import stopped — completed items remain available");
    expect(host.textContent).toContain("1 imported");
  } finally {
    await act(async () => root.unmount());
  }
});

function receipt(extra: Partial<ImportJobStatus> = {}): ImportJobStatus {
  return {
    jobId: "recover",
    done: false,
    cancelled: false,
    startedAt: 100,
    revision: 2,
    selections: [{ sourceId: "chrome", profileId: "Reviewed", categories: ["history"] }],
    progress: [
      {
        source: "chrome",
        label: "Chrome (Reviewed)",
        profileId: "Reviewed",
        category: "history",
        state: "running",
        imported: 500,
        skipped: 0,
      },
    ],
    ...extra,
  };
}
const emit = (job: ImportJobStatus) => {
  for (const listener of listeners)
    listener({
      type: "import.progress",
      payload: job,
      seq: job.revision ?? 0,
      streamId: "fixture",
      ts: Date.now(),
    });
};

it("restores a running import on remount without discovery or a duplicate start", async () => {
  rpc.mockReset();
  rpc.mockImplementation(async (method: string) => {
    if (method === "import.status") return receipt();
    if (method === "import.cancel") throw new Error("Cancel is temporarily unavailable");
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div");
  let root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    expect(host.textContent).toContain("500 imported");
    expect(rpc.mock.calls.every(([method]) => method === "import.status")).toBe(true);
    await act(async () => root.unmount());
    root = createRoot(host);
    await act(async () => root.render(<ImportDataSetting />));
    expect(host.textContent).toContain("500 imported");
    await act(async () =>
      [...host.querySelectorAll("button")].find((button) => button.textContent === "Cancel import")!.click(),
    );
    expect(host.textContent).toContain("Cancel is temporarily unavailable");
    expect(
      [...host.querySelectorAll("button")].find((button) => button.textContent === "Cancel import")?.disabled,
    ).toBe(false);
    expect(rpc.mock.calls.some(([method]) => method === "import.run" || method === "import.preview")).toBe(
      false,
    );
  } finally {
    await act(async () => root.unmount());
  }
});

it("does not let an older status response overwrite a newer terminal event", async () => {
  rpc.mockReset();
  let release!: (job: ImportJobStatus) => void;
  rpc.mockReturnValue(
    new Promise<ImportJobStatus>((resolve) => {
      release = resolve;
    }),
  );
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    await act(async () =>
      emit(
        receipt({
          done: true,
          revision: 4,
          progress: [{ ...receipt().progress[0]!, state: "done", imported: 1001 }],
        }),
      ),
    );
    await act(async () => release(receipt()));
    expect(host.textContent).toContain("Import finished.");
    expect(host.textContent).toContain("1,001 imported");
    expect(host.textContent).not.toContain("Cancel import");
  } finally {
    await act(async () => root.unmount());
  }
});

it("keeps the active job on a progress read failure and reconciles after checking again", async () => {
  vi.useFakeTimers();
  rpc.mockReset();
  rpc
    .mockResolvedValueOnce(receipt())
    .mockRejectedValueOnce(new Error("Offline"))
    .mockResolvedValue(
      receipt({
        done: true,
        revision: 3,
        progress: [{ ...receipt().progress[0]!, state: "done", imported: 1001 }],
      }),
    );
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    await act(async () => vi.advanceTimersByTimeAsync(1000));
    expect(host.textContent).toContain("may still be running");
    expect(host.textContent).toContain("Cancel import");
    await act(async () =>
      [...host.querySelectorAll("button")].find((button) => button.textContent === "Check progress")!.click(),
    );
    expect(host.textContent).toContain("Import finished.");
    expect(host.textContent).not.toContain("may still be running");
    await act(async () => vi.advanceTimersByTimeAsync(3000));
    expect(rpc).toHaveBeenCalledTimes(3);
  } finally {
    await act(async () => root.unmount());
  }
});

it("requires a fresh unchecked four-browser review after interruption and explains Keychain exclusions", async () => {
  rpc.mockReset();
  const interrupted = receipt({
    done: true,
    interrupted: true,
    revision: 3,
    progress: [{ ...receipt().progress[0]!, state: "error", detail: "Interrupted" }],
  });
  rpc.mockImplementation(async (method: string, params: Record<string, unknown>) => {
    if (method === "import.status")
      return params.jobId === "retry" ? receipt({ jobId: "retry", startedAt: 200 }) : interrupted;
    if (method === "import.preview")
      return {
        sources: ["chrome", "arc", "safari", "firefox"].map((id) => ({
          id,
          label: id[0]!.toUpperCase() + id.slice(1),
          profiles: ["Reviewed"],
          categories: [],
          profileCategories: [
            {
              profileId: "Reviewed",
              categories: [
                { category: "bookmarks", available: true },
                { category: "history", available: true },
              ],
            },
          ],
        })),
        recentJobs: [interrupted],
      };
    if (method === "import.run") return { jobId: "retry" };
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    expect(host.textContent).toContain("Import interrupted");
    expect(host.textContent).toContain("Keychain and macOS access");
    expect(host.textContent).toContain("does not ask for browser Keychain passwords");
    expect(host.textContent).toContain(
      "Passwords, cookies, extensions and agent permissions are not imported here",
    );
    expect(host.querySelector('input[type="checkbox"]')).toBeNull();
    await act(async () =>
      [...host.querySelectorAll("button")]
        .find((button) => button.textContent === "Review sources to retry")!
        .click(),
    );
    const choices = [...host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    expect(choices).toHaveLength(8);
    expect(choices.every((item) => !item.checked)).toBe(true);
    expect(
      [...host.querySelectorAll("button")].find((button) => button.textContent?.startsWith("Import selected"))
        ?.disabled,
    ).toBe(true);
    await act(async () => choices[5]!.click());
    await act(async () =>
      [...host.querySelectorAll("button")]
        .find((button) => button.textContent?.startsWith("Import selected"))!
        .click(),
    );
    expect(rpc).toHaveBeenCalledWith("import.run", {
      selections: [{ sourceId: "safari", profileId: "Reviewed", categories: ["history"] }],
    });
    expect(rpc.mock.calls.filter(([method]) => method === "import.run")).toHaveLength(1);
  } finally {
    await act(async () => root.unmount());
  }
});

it("keeps import consent and exclusions visible with optional folder and system-access details", async () => {
  rpc.mockReset();
  rpc.mockRejectedValue(new Error("No previous import"));
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    const descriptions = [...host.querySelectorAll(":scope > .import-setting > p")];
    expect(descriptions).toHaveLength(2);
    expect(descriptions[0]!.textContent).toContain("Nothing is imported until you confirm.");
    expect(descriptions[1]!.textContent).toContain("Passwords, cookies, extensions and agent permissions are not imported");
    const details = [...host.querySelectorAll("details")];
    expect(details.map(item => item.querySelector("summary")!.textContent)).toEqual(["Folders and retries", "Keychain and macOS access"]);
    expect(details.every(item => !item.open)).toBe(true);
    expect(details[0]!.textContent).toContain("Arc Spaces and pinned pages become bookmark folders");
    expect(details[0]!.textContent).toContain("Existing bookmarks keep their titles and");
    expect(details[0]!.textContent).toContain("history visits are skipped on retry");
    expect(details[1]!.textContent).toContain("does not ask for browser Keychain passwords");
    expect(details[1]!.textContent).toContain("you can cancel it");
    expect(details[1]!.textContent).toContain("Full Disk Access");
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("import.status", {});
    expect(host.querySelector('input[type="checkbox"]')).toBeNull();
  } finally {
    await act(async () => root.unmount());
  }
});

it("sends one original cancel request for duplicate activations before the pending render", async () => {
  rpc.mockReset();
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  rpc.mockImplementation((method: string) => method === "import.cancel" ? pending : Promise.resolve(receipt()));
  const host = document.createElement("div"), root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    const button = [...host.querySelectorAll("button")].find(item => item.textContent === "Cancel import")!;
    await act(async () => { button.click(); button.click(); });
    expect(rpc.mock.calls.filter(([method]) => method === "import.cancel")).toEqual([["import.cancel", { jobId: "recover" }]]);
    expect(button.disabled).toBe(true);
    await act(async () => release());
  } finally {
    await act(async () => { release(); root.unmount(); });
  }
});

it("does not publish an old cancellation failure into a newer import and keeps its cancel available", async () => {
  rpc.mockReset();
  let reject!: (error: Error) => void;
  rpc.mockImplementation((method: string) => method === "import.cancel" ? new Promise<void>((_, fail) => { reject = fail; }) : Promise.resolve(receipt()));
  const host = document.createElement("div"), root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    await act(async () => [...host.querySelectorAll("button")].find(item => item.textContent === "Cancel import")!.click());
    await act(async () => emit(receipt({ jobId: "newer", startedAt: 200 })));
    const cancel = [...host.querySelectorAll("button")].find(item => item.textContent === "Cancel import");
    expect(cancel).toBeDefined();
    expect(cancel!.disabled).toBe(false);
    await act(async () => reject(new Error("Old cancellation failed")));
    expect(host.textContent).not.toContain("Old cancellation failed");
    expect(host.textContent).toContain("500 imported");
    await act(async () => cancel!.click());
    expect(rpc.mock.calls.filter(([method]) => method === "import.cancel")).toEqual([
      ["import.cancel", { jobId: "recover" }], ["import.cancel", { jobId: "newer" }],
    ]);
  } finally {
    await act(async () => { reject(new Error("Original cleanup")); root.unmount(); });
  }
});
