import { expect, it, vi } from "vitest";
import { BrowserImporter, Repo, openDb } from "@aux/runtime";
import type { BrowserExportFormat, BrowserExportSource, NativeBrowserImportSelection } from "@aux/contracts";
import { NativeImportFixture, flushImport } from "../fixtures/native-browser-import.js";

class ExportFixture extends NativeImportFixture {
  readonly selectionId = "original-native-export-selection";
  receipt: NativeBrowserImportSelection = { selectionId: this.selectionId, unknown: false, done: false };
  browserImportSelectExport = vi.fn(
    async (_input: { token: string; sourceId: BrowserExportSource; format: BrowserExportFormat }) =>
      structuredClone(this.receipt),
  );
  browserImportExportPoll = vi.fn(async (_id: string) => structuredClone(this.receipt));
  browserImportExportCancel = vi.fn(async (_id: string) => {
    this.receipt = {
      selectionId: this.selectionId,
      unknown: false,
      done: true,
      error: { code: "cancelled", message: "Export cancelled" },
    };
    return structuredClone(this.receipt);
  });
}
function fixture() {
  const db = openDb(":memory:"),
    repo = new Repo(db),
    native = new ExportFixture();
  const importer = new BrowserImporter({ repo, native, emit: () => {} });
  return { db, repo, native, importer };
}
it("publishes only native export summaries and keeps opaque snapshots out of public status and durable receipts", async () => {
  const f = fixture();
  try {
    const start = await f.importer.selectExport(
      { sourceId: "firefox", format: "bookmarks-html" },
      f.native.token,
    );
    expect(start).toEqual({ selectionId: f.native.selectionId });
    expect(f.native.browserImportBegin).not.toHaveBeenCalled();
    f.native.receipt = {
      ...f.native.receipt,
      done: true,
      discovery: await f.native.browserImportDiscover(f.native.token),
    };
    const status = await f.importer.exportStatus(start.selectionId, f.native.token);
    expect(status.sources?.[0]?.profiles).toEqual(["Reviewed"]);
    expect(JSON.stringify(status)).not.toContain(f.native.sourceHandle);
    expect(f.repo.getSetting("browser-import.receipts.v1")).toBeUndefined();
    await f.importer.start(
      { selections: [{ sourceId: "chrome", profileId: "Reviewed", categories: ["bookmarks"] }] },
      f.native.token,
    );
    await flushImport();
    expect(f.native.browserImportBegin).toHaveBeenCalledTimes(1);
  } finally {
    await f.importer.close();
    f.db.close();
  }
});
it("refuses export publication after original document retirement and joins picker cancellation on shutdown", async () => {
  const f = fixture();
  try {
    const { selectionId } = await f.importer.selectExport(
      { sourceId: "safari", format: "safari-archive" },
      f.native.token,
    );
    f.native.ownerAlive = false;
    await expect(f.importer.exportStatus(selectionId, f.native.token)).rejects.toThrow(
      "Original window retired",
    );
    expect(f.native.browserImportExportPoll).not.toHaveBeenCalled();
    await f.importer.close();
    expect(f.native.browserImportExportCancel).toHaveBeenCalledWith(selectionId);
    expect(f.native.browserImportBegin).not.toHaveBeenCalled();
  } finally {
    f.db.close();
  }
});

it("publishes Safari window tabs through the original picker receipt without a file export or destination dispatch", async () => {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const native = new ExportFixture();
  const selectWindow = vi.fn(async (_input: { token: string; sourceId: "safari" }) =>
    structuredClone(native.receipt),
  );
  const importer = new BrowserImporter({
    repo,
    native: Object.assign(native, { browserImportSelectWindow: selectWindow }),
    emit: () => {},
  });
  try {
    const { selectionId } = await importer.selectWindow({ sourceId: "safari" }, native.token);
    expect(selectWindow).toHaveBeenCalledWith({ token: native.token, sourceId: "safari" });
    expect(native.browserImportSelectExport).not.toHaveBeenCalled();
    native.receipt = {
      selectionId,
      unknown: false,
      done: true,
      discovery: {
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
        snapshots: [{ sourceId: "safari", profileId: "Safari window 42", sourceHandle: native.sourceHandle }],
      },
    };
    const status = await importer.exportStatus(selectionId, native.token);
    expect(status.sources?.[0]?.profileCategories).toEqual(
      native.receipt.discovery?.sources[0]?.profileCategories,
    );
    expect(JSON.stringify(status)).not.toContain(native.sourceHandle);
    expect(repo.getSetting("browser-import.receipts.v1")).toBeUndefined();
    expect(native.browserImportBegin).not.toHaveBeenCalled();
  } finally {
    await importer.close();
    db.close();
  }
});

it("binds multiple exported data files to exact native handles while preserving labels and independent category receipts", async () => {
  const f = fixture();
  const groups = [
    {
      id: "10000000-0000-4000-8000-000000000001",
      label: "History – Work.json",
      handle: "held-work-history",
      category: "history" as const,
    },
    {
      id: "10000000-0000-4000-8000-000000000002",
      label: "Shared bookmarks and passwords",
      handle: "held-shared-export",
      category: "bookmarks" as const,
    },
  ];
  try {
    const { selectionId } = await f.importer.selectExport(
      { sourceId: "safari", format: "safari-archive" },
      f.native.token,
    );
    f.native.receipt = {
      selectionId,
      unknown: false,
      done: true,
      discovery: {
        sources: [
          {
            id: "safari",
            label: "Safari exported data files",
            profiles: groups.map((group) => group.id),
            categories: groups.map((group) => ({ category: group.category, available: true })),
            profileCategories: groups.map((group, index) => ({
              profileId: group.id,
              label: group.label,
              kind: index === 0 ? ("export-file" as const) : ("shared-export" as const),
              categories: [{ category: group.category, available: true }],
            })),
          },
        ],
        snapshots: groups.map((group) => ({
          sourceId: "safari",
          profileId: group.id,
          sourceHandle: group.handle,
        })),
      },
    };
    const reviewed = await f.importer.exportStatus(selectionId, f.native.token);
    expect(reviewed.sources?.[0]?.profileCategories.map((group) => [group.kind, group.label])).toEqual([
      ["export-file", groups[0]!.label],
      ["shared-export", groups[1]!.label],
    ]);
    expect(f.native.browserImportBegin).not.toHaveBeenCalled();
    f.native.browserImportBegin.mockImplementation(async (input) => {
      await f.native.turnSourceContext(input.token);
      const original = groups.find((group) => group.handle === input.sourceHandle);
      if (!original || input.categories.length !== 1 || input.categories[0] !== original.category)
        throw new Error("Original export group changed");
      const receipt = {
        operationId: input.operationId,
        unknown: false,
        done: true,
        cancelled: false,
        progress: [
          {
            source: "safari",
            label: "Safari exported data files",
            profileId: original.id,
            category: original.category,
            state: "done" as const,
            imported: 2,
            skipped: 0,
          },
        ],
      };
      f.native.jobs.set(input.operationId, receipt);
      return receipt;
    });
    await expect(
      f.importer.start(
        { selections: [{ sourceId: "safari", profileId: groups[0]!.label, categories: ["history"] }] },
        f.native.token,
      ),
    ).rejects.toThrow("original native browser preview");
    const job = await f.importer.start(
      {
        selections: groups.map((group) => ({
          sourceId: "safari",
          profileId: group.id,
          categories: [group.category],
        })),
      },
      f.native.token,
    );
    await flushImport();
    expect(f.native.browserImportBegin.mock.calls.map(([input]) => input.sourceHandle)).toEqual(
      groups.map((group) => group.handle),
    );
    const status = await f.importer.status(job.jobId, f.native.token);
    expect(status.done).toBe(true);
    expect(status.progress.map((row) => [row.label, row.category, row.imported])).toEqual(
      groups.map((group) => [group.label, group.category, 2]),
    );
    expect(JSON.stringify(status)).not.toContain("held-work-history");
  } finally {
    await f.importer.close();
    f.db.close();
  }
});
