import { expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ArtifactStore, EventBus, openDb, Repo } from "@aux/runtime";
import { SavedResults } from "../../apps/runtime/src/services/saved-results.js";

it("finds saved text outputs by filename or conversation and excludes archived/internal/binary results", () => {
  const db = openDb(":memory:"),
    repo = new Repo(db);
  try {
    repo.saveRun({
      runId: "r",
      goal: "Compare travel",
      status: "completed",
      pageIds: [],
      config: { chatId: "chat" },
      createdAt: 1,
    });
    for (const [id, name, type] of [
      ["report", "comparison.md", "text/markdown"],
      ["observation", "observation-r1.txt", "text/plain"],
      ["image", "photo.png", "image/png"],
    ])
      repo.saveArtifact({
        artifactId: id!,
        runId: "r",
        path: `/tmp/${id}-${name}`,
        mediaType: type!,
        size: 10,
        status: "complete",
        createdAt: 2,
      });
    const results = new SavedResults(repo, {
      read: () => ({ dataBase64: Buffer.from("# Comparison").toString("base64") }),
    } as never);
    expect(results.search("comparison")).toMatchObject([{ filename: "comparison.md", chatId: "chat" }]);
    expect(results.search("travel")).toHaveLength(1);
    expect(results.search("travel")[0]).not.toHaveProperty("path");
    expect(results.read("report")).toMatchObject({
      content: "# Comparison",
      chatId: "chat",
      filename: "comparison.md",
    });
    expect(
      results.available([
        { artifactId: "report", chatId: "chat" },
        { artifactId: "report", chatId: "wrong-chat" },
        { artifactId: "image", chatId: "chat" },
      ]),
    ).toEqual(["report"]);
    expect(() => results.read("observation")).toThrow("unavailable");
    expect(() => results.read("image")).toThrow("unavailable");
    repo.archiveConversation("chat", true);
    expect(results.search("travel")).toEqual([]);
    repo.deleteConversation("chat");
    expect(results.available([{ artifactId: "report", chatId: "chat" }])).toEqual([]);
    expect(results.search("comparison")).toEqual([]);
    expect(() => results.read("report")).toThrow();
  } finally {
    db.close();
  }
});

it("saves immutable edited result versions with durable parent lineage", () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-result-versions-"));
  const db = openDb(join(dir, "aux-state.sqlite")),
    repo = new Repo(db);
  let open = true;
  try {
    repo.saveRun({
      runId: "report-run",
      goal: "Write report",
      status: "completed",
      pageIds: [],
      config: { chatId: "report-chat" },
      createdAt: 1,
    });
    const files = new ArtifactStore(join(dir, "artifacts"), repo, new EventBus(repo));
    const original = files.save({
      runId: "report-run",
      label: "report.md",
      mediaType: "text/markdown",
      buffer: Buffer.from("# Original"),
    });
    const results = new SavedResults(repo, files);
    const v2 = results.saveVersion({
      chatId: "report-chat",
      sourceArtifactId: original.artifactId,
      content: "# Human edit",
    });
    expect(v2).toMatchObject({
      revision: 2,
      parentArtifactId: original.artifactId,
      rootArtifactId: original.artifactId,
      content: "# Human edit",
    });
    const v3 = results.saveVersion({
      chatId: "report-chat",
      sourceArtifactId: v2.artifactId,
      content: "# Second edit",
    });
    expect(v3).toMatchObject({
      revision: 3,
      parentArtifactId: v2.artifactId,
      rootArtifactId: original.artifactId,
    });
    expect(results.read(original.artifactId).content).toBe("# Original");
    expect(results.read(v2.artifactId).content).toBe("# Human edit");
    expect(repo.getSetting(`conversationArtifacts:report-chat`)).toEqual([v3.artifactId]);
    expect(() =>
      results.saveVersion({ chatId: "other-chat", sourceArtifactId: v3.artifactId, content: "# Stolen" }),
    ).toThrow(/unavailable/);
    db.close();
    open = false;
    const reopened = openDb(join(dir, "aux-state.sqlite"));
    try {
      const reopenedRepo = new Repo(reopened);
      const restored = new SavedResults(
        reopenedRepo,
        new ArtifactStore(join(dir, "artifacts"), reopenedRepo, new EventBus(reopenedRepo)),
      );
      expect(restored.read(v3.artifactId)).toMatchObject({
        revision: 3,
        parentArtifactId: v2.artifactId,
        rootArtifactId: original.artifactId,
        content: "# Second edit",
      });
      reopenedRepo.deleteConversation("report-chat");
      expect(reopened.prepare("SELECT count(*) AS n FROM result_versions").get()).toEqual({ n: 0 });
    } finally {
      reopened.close();
    }
  } finally {
    if (open) db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

it("includes JSON reports while filtering observations by content even with ordinary filenames", () => {
  const db = openDb(":memory:"),
    repo = new Repo(db);
  try {
    repo.saveRun({
      runId: "r",
      goal: "Report",
      status: "completed",
      pageIds: [],
      config: { chatId: "chat" },
      createdAt: 1,
    });
    const observation = JSON.stringify({
      observationId: "o",
      pageId: "p",
      documentEpoch: 1,
      revision: 1,
      observedAt: 1,
      scope: "full",
      content: {
        url: "https://example.com",
        title: "Example",
        viewport: { width: 100, height: 100, scale: 1 },
        scroll: { x: 0, y: 0, maxY: 0 },
        frames: [],
        text: "",
        headings: [],
        elements: [],
        formFields: [],
        tables: [],
        links: [],
        dialogs: [],
        truncated: false,
        stats: { elementsTotal: 0, elementsShown: 0, textChars: 0, approxTokens: 0 },
      },
    });
    for (const id of ["internal", "report"])
      repo.saveArtifact({
        artifactId: id,
        runId: "r",
        path: `/tmp/${id}-data.json`,
        mediaType: "application/json",
        size: 100,
        status: "complete",
        createdAt: id === "internal" ? 3 : 2,
      });
    const results = new SavedResults(repo, {
      read: (id: string) => ({
        dataBase64: Buffer.from(id === "internal" ? observation : '{"total":4}').toString("base64"),
      }),
    } as never);
    expect(results.search("report", 1)).toMatchObject([{ artifactId: "report", filename: "data.json" }]);
    expect(results.read("report").content).toBe('{"total":4}');
    expect(() => results.read("internal")).toThrow("cannot be displayed");
  } finally {
    db.close();
  }
});
