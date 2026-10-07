// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ImportDataSetting } from "./ImportDataSetting";
const rpc = vi.hoisted(() => vi.fn());
vi.mock("../store", () => ({ call: rpc }));
vi.mock("../bridge", () => ({ bridge: { onEvent: () => () => {} } }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("reviews a native export selection before displaying categories and never sends a file path", async () => {
  rpc.mockImplementation(async (method: string) => {
    if (method === "import.status") throw new Error("No import yet");
    if (method === "import.selectExport") return { selectionId: "original-native-export-selection" };
    if (method === "import.exportStatus")
      return {
        selectionId: "original-native-export-selection",
        unknown: false,
        done: true,
        sources: [
          {
            id: "safari",
            label: "Safari",
            profiles: ["Safari export"],
            categories: [{ category: "history", available: true }],
            profileCategories: [
              { profileId: "Safari export", categories: [{ category: "history", available: true }] },
            ],
          },
        ],
      };
    if (method === "import.cancelExport")
      return { selectionId: "original-native-export-selection", unknown: false, done: true };
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    const button = [...host.querySelectorAll("button")].find(
      (element) => element.textContent === "Choose export file",
    );
    if (!button) throw new Error("Export picker control missing");
    await act(async () => button.click());
    expect(rpc).toHaveBeenCalledWith("import.selectExport", { sourceId: "safari", format: "safari-archive" });
    expect(rpc).toHaveBeenCalledWith("import.exportStatus", {
      selectionId: "original-native-export-selection",
    });
    expect(host.textContent).toContain("Profile: Safari export");
    expect(rpc.mock.calls.some(([method]) => method === "import.run")).toBe(false);
    expect(host.querySelectorAll('input[type="checkbox"]')).toHaveLength(1);
  } finally {
    await act(async () => root.unmount());
  }
});

it("reviews Safari window tabs through native selection and discloses unknown private status", async () => {
  rpc.mockClear();
  rpc.mockImplementation(async (method: string) => {
    if (method === "import.status") throw new Error("No import yet");
    if (method === "import.selectWindow") return { selectionId: "original-native-window-selection" };
    if (method === "import.exportStatus")
      return {
        selectionId: "original-native-window-selection",
        unknown: false,
        done: true,
        sources: [
          {
            id: "safari",
            label: "Safari",
            profiles: ["Safari window 42"],
            categories: [{ category: "tabs", available: true }],
            profileCategories: [
              { profileId: "Safari window 42", categories: [{ category: "tabs", available: true }] },
            ],
          },
        ],
      };
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    expect(host.textContent).toContain("Safari cannot identify private windows");
    const button = [...host.querySelectorAll("button")].find(
      (element) => element.textContent === "Choose a Safari window",
    );
    if (!button) throw new Error("Safari window review control missing");
    await act(async () => button.click());
    expect(rpc).toHaveBeenCalledWith("import.selectWindow", { sourceId: "safari" });
    expect(rpc).toHaveBeenCalledWith("import.exportStatus", {
      selectionId: "original-native-window-selection",
    });
    expect(host.textContent).toContain("Profile: Safari window 42");
    expect(host.querySelectorAll('input[type="checkbox"]')).toHaveLength(1);
    expect(
      rpc.mock.calls.some(([method]) => method === "import.selectExport" || method === "import.run"),
    ).toBe(false);
  } finally {
    await act(async () => root.unmount());
  }
});

it("labels exact export groups without inferring Profiles and keeps malformed category files disabled", async () => {
  rpc.mockClear();
  const historyId = "10000000-0000-4000-8000-000000000001",
    sharedId = "10000000-0000-4000-8000-000000000002";
  rpc.mockImplementation(async (method: string) => {
    if (method === "import.status") throw new Error("No import yet");
    if (method === "import.selectExport") return { selectionId: "original-native-export-selection" };
    if (method === "import.exportStatus")
      return {
        selectionId: "original-native-export-selection",
        unknown: false,
        done: true,
        sources: [
          {
            id: "safari",
            label: "Safari exported data files",
            profiles: [historyId, sharedId, "broken-native-file"],
            categories: [
              { category: "history", available: true },
              { category: "bookmarks", available: true },
            ],
            profileCategories: [
              {
                profileId: historyId,
                kind: "export-file",
                label: "History – Work.json",
                categories: [{ category: "history", available: true }],
              },
              {
                profileId: sharedId,
                kind: "shared-export",
                label: "Shared bookmarks and passwords",
                categories: [{ category: "bookmarks", available: true }],
              },
              {
                profileId: "broken-native-file",
                kind: "export-file",
                label: "History – Damaged.json",
                categories: [
                  { category: "history", available: false, blocker: "The Safari history file is not valid." },
                ],
              },
            ],
          },
        ],
      };
    if (method === "import.run") throw new Error("Fixture native acceptance withheld");
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<ImportDataSetting />));
    const choose = [...host.querySelectorAll("button")].find(
      (button) => button.textContent === "Choose export file",
    );
    if (!choose) throw new Error("Export selector missing");
    await act(async () => choose.click());
    expect(host.textContent).toContain("Exported data file: History – Work.json");
    expect(host.textContent).toContain("Shared export: Shared bookmarks and passwords");
    expect(host.textContent).toContain("Aux does not infer which files belong to the same Safari Profile");
    expect(host.textContent).not.toContain(`Profile: ${historyId}`);
    const boxes = [...host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    expect(boxes).toHaveLength(3);
    expect(boxes[2]!.disabled).toBe(true);
    expect(host.textContent).toContain("The Safari history file is not valid.");
    expect(rpc.mock.calls.some(([method]) => method === "import.run")).toBe(false);
    await act(async () => {
      boxes[0]!.click();
      boxes[1]!.click();
    });
    const run = [...host.querySelectorAll("button")].find(
      (button) => button.textContent === "Import selected (2)",
    );
    if (!run) throw new Error("Import confirmation missing");
    await act(async () => run.click());
    expect(rpc).toHaveBeenCalledWith("import.run", {
      selections: [
        { sourceId: "safari", profileId: historyId, categories: ["history"] },
        { sourceId: "safari", profileId: sharedId, categories: ["bookmarks"] },
      ],
    });
  } finally {
    await act(async () => root.unmount());
  }
});
