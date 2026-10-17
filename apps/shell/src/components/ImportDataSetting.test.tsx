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
            id: "chrome",
            label: "Chrome",
            profiles: ["Default"],
            categories: [{ category: "bookmarks", available: true, count: 2 }],
            profileCategories: [
              { profileId: "Default", categories: [{ category: "bookmarks", available: true, count: 2 }] },
            ],
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
            source: "chrome",
            label: "Chrome",
            profileId: "Default",
            category: "bookmarks",
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

it("requires exact acknowledgement and a fresh unchecked native-source review after unknown completion", async () => {
  rpc.mockReset();
  const interrupted = receipt({
    done: false,
    interrupted: true,
    nativeOperations: [
      {
        operationId: "original-operation-identity",
        sourceId: "chrome",
        profileId: "Reviewed",
        categories: ["history"],
        state: "unknown",
      },
    ],
    revision: 3,
    progress: [{ ...receipt().progress[0]!, state: "error", detail: "Interrupted" }],
  });
  rpc.mockImplementation(async (method: string, params: Record<string, unknown>) => {
    if (method === "import.status")
      return params.jobId === "retry" ? receipt({ jobId: "retry", startedAt: 200 }) : interrupted;
    if (method === "import.preview")
      return {
        sources: ["chrome", "arc", "brave", "edge"].map((id) => ({
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
    expect(host.textContent).toContain("Native import completion is unknown");
    expect(host.textContent).toContain("Keychain and macOS access");
    expect(host.textContent).toContain("may ask macOS to unlock the source browser’s Safe Storage key");
    expect(host.textContent).toContain("Cookies and agent permissions are not copied");
    const acknowledgement = host.querySelector<HTMLInputElement>('input[type="checkbox"]');
    expect(acknowledgement?.checked).toBe(false);
    expect(rpc.mock.calls.some(([method]) => method === "import.run")).toBe(false);
    await act(async () => acknowledgement!.click());
    await act(async () =>
      [...host.querySelectorAll("button")]
        .find((button) => button.textContent === "See what can be imported")!
        .click(),
    );
    const choices = [...host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    expect(choices).toHaveLength(3);
    expect(choices[0]?.checked).toBe(true);
    expect(choices.slice(1).every((item) => !item.checked)).toBe(true);
    expect(
      [...host.querySelectorAll("button")].find((button) => button.textContent?.startsWith("Import selected"))
        ?.disabled,
    ).toBe(true);
    await act(async () => {
      const picker = host.querySelector<HTMLSelectElement>('[aria-label="Detected browser"]')!;
      picker.value = "brave";
      picker.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await act(async () => host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[2]!.click());
    await act(async () =>
      [...host.querySelectorAll("button")]
        .find((button) => button.textContent?.startsWith("Import selected"))!
        .click(),
    );
    expect(rpc).toHaveBeenCalledWith("import.run", {
      selections: [{ sourceId: "brave", profileId: "Reviewed", categories: ["history"] }],
      acknowledgeInterruptedJobId: "recover",
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
    expect(descriptions[1]!.textContent).toContain("Cookies and agent permissions are not copied");
    const details = [...host.querySelectorAll("details")];
    expect(details.map((item) => item.querySelector("summary")!.textContent)).toEqual([
      "Folders and retries",
      "Keychain and macOS access",
      "Choose a browser export",
    ]);
    expect(details.every((item) => !item.open)).toBe(true);
    expect(details[0]!.textContent).toContain(
      "Imported bookmark folders and pinned tabs retain their source structure",
    );
    expect(details[0]!.textContent).toContain("Existing bookmarks are not overwritten");
    expect(details[0]!.textContent).toContain("A fresh import can add duplicate bookmarks or tabs");
    expect(details[1]!.textContent).toContain(
      "may ask macOS to unlock the source browser’s Safe Storage key",
    );
    expect(details[1]!.textContent).toContain("you can cancel it");
    expect(details[1]!.textContent).toContain("Keys and password text stay in the native browser");
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
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  rpc.mockImplementation((method: string) =>
    method === "import.cancel" ? pending : Promise.resolve(receipt()),
  );
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    const button = [...host.querySelectorAll("button")].find((item) => item.textContent === "Cancel import")!;
    await act(async () => {
      button.click();
      button.click();
    });
    expect(rpc.mock.calls.filter(([method]) => method === "import.cancel")).toEqual([
      ["import.cancel", { jobId: "recover" }],
    ]);
    expect(button.disabled).toBe(true);
    await act(async () => release());
  } finally {
    await act(async () => {
      release();
      root.unmount();
    });
  }
});

it("does not publish an old cancellation failure into a newer import and keeps its cancel available", async () => {
  rpc.mockReset();
  let reject!: (error: Error) => void;
  rpc.mockImplementation((method: string) =>
    method === "import.cancel"
      ? new Promise<void>((_, fail) => {
          reject = fail;
        })
      : Promise.resolve(receipt()),
  );
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    await act(async () =>
      [...host.querySelectorAll("button")].find((item) => item.textContent === "Cancel import")!.click(),
    );
    await act(async () => emit(receipt({ jobId: "newer", startedAt: 200 })));
    const cancel = [...host.querySelectorAll("button")].find((item) => item.textContent === "Cancel import");
    expect(cancel).toBeDefined();
    expect(cancel!.disabled).toBe(false);
    await act(async () => reject(new Error("Old cancellation failed")));
    expect(host.textContent).not.toContain("Old cancellation failed");
    expect(host.textContent).toContain("500 imported");
    await act(async () => cancel!.click());
    expect(rpc.mock.calls.filter(([method]) => method === "import.cancel")).toEqual([
      ["import.cancel", { jobId: "recover" }],
      ["import.cancel", { jobId: "newer" }],
    ]);
  } finally {
    await act(async () => {
      reject(new Error("Original cleanup"));
      root.unmount();
    });
  }
});

it("reviews extension counterparts per item and preserves unselected entries as explicit skips", async () => {
  rpc.mockReset();
  const selectedId = "11111111-1111-4111-8111-111111111111";
  const skippedId = "22222222-2222-4222-8222-222222222222";
  const reviewId = "33333333-3333-4333-8333-333333333333";
  rpc.mockImplementation(async (method: string) => {
    if (method === "import.preview")
      return {
        sources: [
          {
            id: "firefox",
            label: "Firefox",
            profiles: ["Reviewed"],
            categories: [{ category: "extensions", available: true }],
            profileCategories: [
              { profileId: "Reviewed", categories: [{ category: "extensions", available: true }] },
            ],
          },
        ],
      };
    if (method === "import.extensions.review")
      return {
        reviewId,
        candidates: [
          {
            candidateId: selectedId,
            name: "Reader",
            sourceIdentity: "reader@example.org",
            kind: "firefox",
            enabled: false,
            detail: "Choose a counterpart.",
          },
          {
            candidateId: skippedId,
            name: "No counterpart",
            sourceIdentity: "other@example.org",
            kind: "unsupported",
            detail: "No automatic transfer.",
          },
        ],
      };
    if (method === "import.run") return { jobId: "reviewed-import" };
    if (method === "import.status") return { jobId: "reviewed-import", done: true, progress: [] };
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    await act(async () => host.querySelector("button")!.click());
    const button = (name: string) =>
      [...host.querySelectorAll<HTMLButtonElement>("button")].find((entry) =>
        entry.textContent?.startsWith(name),
      )!;
    await act(async () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
    expect(button("Import selected").disabled).toBe(true);
    await act(async () => button("Review extensions").click());
    expect(host.textContent).toContain("No counterpart");
    const choices = [...host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    await act(async () => choices[1]!.click());
    expect(button("Import selected").disabled).toBe(true);
    const input = host.querySelector<HTMLInputElement>(
      '[aria-label="Chrome Web Store counterpart for Reader"]',
    )!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
        input,
        `https://chromewebstore.google.com/detail/reader/${"a".repeat(32)}`,
      );
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(button("Import selected").disabled).toBe(false);
    await act(async () => button("Import selected").click());
    expect(rpc).toHaveBeenCalledWith("import.run", {
      selections: [
        {
          sourceId: "firefox",
          profileId: "Reviewed",
          categories: ["extensions"],
          extensionReview: {
            reviewId,
            choices: [
              { candidateId: selectedId, chromeWebStoreId: "a".repeat(32) },
              { candidateId: skippedId, skip: true },
            ],
          },
        },
      ],
    });
  } finally {
    await act(async () => root.unmount());
  }
});

it("retires displayed extension choices when a replacement export publishes a new source preview", async () => {
  rpc.mockReset();
  const source = {
    id: "safari",
    label: "Safari",
    profiles: ["Safari export"],
    categories: [{ category: "extensions", available: true }],
    profileCategories: [
      { profileId: "Safari export", categories: [{ category: "extensions", available: true }] },
    ],
  };
  rpc.mockImplementation(async (method: string) => {
    if (method === "import.preview") return { sources: [source] };
    if (method === "import.extensions.review")
      return {
        reviewId: "44444444-4444-4444-8444-444444444444",
        candidates: [
          {
            candidateId: "55555555-5555-4555-8555-555555555555",
            name: "Original source extension",
            sourceIdentity: "app.TeamID",
            kind: "safari",
            detail: "Choose a counterpart.",
          },
        ],
      };
    if (method === "import.selectExport") return { selectionId: "replacement-export-selection" };
    if (method === "import.exportStatus")
      return { selectionId: "replacement-export-selection", unknown: false, done: true, sources: [source] };
    if (method === "import.cancelExport")
      return { selectionId: "replacement-export-selection", unknown: false, done: true };
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div"),
    root = createRoot(host);
  const button = (label: string) =>
    [...host.querySelectorAll<HTMLButtonElement>("button")].find((node) =>
      node.textContent?.trim().startsWith(label),
    )!;
  try {
    await act(async () => root.render(<ImportDataSetting />));
    await act(async () => button("See what can be imported").click());
    await act(async () => button("Review extensions").click());
    expect(host.textContent).toContain("Original source extension");
    await act(async () => button("Choose export file").click());
    expect(rpc).toHaveBeenCalledWith("import.selectExport", { sourceId: "safari", format: "safari-archive" });
    expect(host.textContent).not.toContain("Original source extension");
    const category = host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    await act(async () => category.click());
    expect(button("Import selected").disabled).toBe(true);
    expect(rpc.mock.calls.some(([method]) => method === "import.run")).toBe(false);
  } finally {
    await act(async () => root.unmount());
  }
});

it("switches detected browsers without keeping hidden selections queued", async () => {
  rpc.mockReset();
  rpc.mockImplementation(async (method: string) => {
    if (method === "import.preview")
      return {
        sources: ["chrome", "firefox"].map((id) => ({
          id,
          label: id,
          profiles: ["Synthetic"],
          categories: [],
          profileCategories: [
            { profileId: "Synthetic", categories: [{ category: "bookmarks", available: true }] },
          ],
        })),
      };
    if (method === "import.run") return { jobId: "selected-browser" };
    if (method === "import.status") return { jobId: "selected-browser", done: true, progress: [] };
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    await act(async () => host.querySelector("button")!.click());
    await act(async () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
    expect(
      [...host.querySelectorAll("button")].find((button) =>
        button.textContent?.startsWith("Import selected"),
      )!.disabled,
    ).toBe(false);
    await act(async () => {
      const picker = host.querySelector<HTMLSelectElement>('[aria-label="Detected browser"]')!;
      picker.value = "firefox";
      picker.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const selected = host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    expect(selected.checked).toBe(false);
    expect(
      [...host.querySelectorAll("button")].find((button) =>
        button.textContent?.startsWith("Import selected"),
      )!.disabled,
    ).toBe(true);
    await act(async () => selected.click());
    await act(async () =>
      [...host.querySelectorAll("button")]
        .find((button) => button.textContent?.startsWith("Import selected"))!
        .click(),
    );
    expect(rpc).toHaveBeenCalledWith("import.run", {
      selections: [{ sourceId: "firefox", profileId: "Synthetic", categories: ["bookmarks"] }],
    });
  } finally {
    await act(async () => root.unmount());
  }
});
it("shows an actionable empty browser discovery result", async () => {
  rpc.mockReset().mockImplementation(async (method: string) => {
    if (method === "import.preview") return { sources: [] };
    throw new Error("No prior import");
  });
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    await act(async () => host.querySelector("button")!.click());
    expect(host.querySelector('[aria-label="Detected browser"]')).toBeNull();
    expect(host.textContent).toContain("No installed browser Profiles were found");
    expect(host.textContent).toContain("Choose an export file");
    expect(rpc.mock.calls.some(([method]) => method === "import.run")).toBe(false);
  } finally {
    await act(async () => root.unmount());
  }
});

it("uses the browser display name when a native export summary carries only its source ID", async () => {
  rpc.mockReset().mockImplementation(async (method: string) => {
    if (method === "import.preview")
      return {
        sources: [
          {
            id: "chrome",
            label: "chrome",
            profiles: ["Synthetic"],
            categories: [],
            profileCategories: [
              { profileId: "Synthetic", categories: [{ category: "bookmarks", available: true }] },
            ],
          },
        ],
      };
    throw new Error("No prior import");
  });
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    await act(async () => host.querySelector("button")!.click());
    expect(
      host.querySelector<HTMLSelectElement>('[aria-label="Detected browser"]')!.selectedOptions[0]!
        .textContent,
    ).toBe("Google Chrome");
    expect(host.querySelector(".import-source-head")!.textContent).toBe("Google Chrome");
  } finally {
    await act(async () => root.unmount());
  }
});

it("distinguishes a completed receipt from a fresh export review and labels native source IDs", async () => {
  rpc.mockReset().mockImplementation(async (method: string) => {
    if (method === "import.status")
      return receipt({
        done: true,
        progress: [{ ...receipt().progress[0]!, label: "chrome", state: "done", imported: 1 }],
      });
    if (method === "import.selectExport") return { selectionId: "fresh-review" };
    if (method === "import.exportStatus")
      return {
        selectionId: "fresh-review",
        done: true,
        unknown: false,
        sources: [
          {
            id: "chrome",
            label: "chrome",
            profiles: ["Fresh export"],
            categories: [],
            profileCategories: [
              { profileId: "Fresh export", categories: [{ category: "bookmarks", available: true }] },
            ],
          },
        ],
      };
    if (method === "import.cancelExport") return {};
    throw new Error("Unexpected " + method);
  });
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    expect(host.textContent).toContain("Google Chrome · History");
    expect(host.textContent).not.toContain("Previous import");
    const choose = [...host.querySelectorAll("button")].find(
      (button) => button.textContent === "Choose export file",
    )!;
    await act(async () => choose.click());
    expect(host.querySelector('[aria-label="Import progress"] h4')?.textContent).toBe("Previous import");
    expect(host.textContent).toContain("1 imported");
    expect(host.textContent).toContain("Fresh export");
    expect(rpc.mock.calls.some(([method]) => method === "import.run")).toBe(false);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
