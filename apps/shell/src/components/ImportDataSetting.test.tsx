// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ImportDataSetting } from "./ImportDataSetting";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("../store", () => ({ call: rpc }));
vi.mock("../bridge", () => ({ bridge: { onEvent: () => () => {} } }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("sends only the source, Profile and categories the user checked", async () => {
  rpc.mockReset();
  rpc.mockImplementation(async (method: string) => {
    if (method === "import.preview") return { sources: [
      { id: "chrome", label: "Chrome", profiles: ["Personal", "Work"],
        categories: [], profileCategories: [
          { profileId: "Personal", categories: [
            { category: "bookmarks", available: true }, { category: "history", available: true },
          ] },
          { profileId: "Work", categories: [
            { category: "bookmarks", available: true }, { category: "history", available: true },
          ] },
        ] },
    ] };
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
    expect(rows.every(row => !row.checked)).toBe(true);
    await act(async () => rows[3]!.click());
    await act(async () => [...host.querySelectorAll("button")].find(button => button.textContent?.startsWith("Import selected"))!.click());
    expect(rpc).toHaveBeenCalledWith("import.run", {
      selections: [{ sourceId: "chrome", profileId: "Work", categories: ["history"] }],
    });
  } finally {
    await act(async () => root.unmount());
  }
});
