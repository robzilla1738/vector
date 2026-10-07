import { randomUUID } from "node:crypto";
import { expect, it } from "vitest";
import { BrowserImporter, Repo, openDb } from "@aux/runtime";
import { NativeImportFixture, flushImport } from "../fixtures/native-browser-import.js";

it("binds per-item extension choices to the source review and persists skips before native dispatch", async () => {
  const db = openDb(":memory:"),
    repo = new Repo(db),
    native = new NativeImportFixture();
  const importer = new BrowserImporter({ repo, native, emit: () => {} });
  const reviewId = randomUUID(),
    chosenId = randomUUID(),
    skippedId = randomUUID();
  native.browserImportExtensionReview.mockResolvedValue({
    reviewId,
    candidates: [
      {
        candidateId: chosenId,
        name: "Firefox reader",
        sourceIdentity: "reader@example.org",
        kind: "firefox",
        enabled: false,
        detail: "Choose a counterpart.",
      },
      {
        candidateId: skippedId,
        name: "Safari app",
        sourceIdentity: "app.TeamID",
        kind: "safari",
        detail: "No automatic counterpart.",
      },
    ],
  });
  try {
    await importer.preview(native.token);
    const review = await importer.reviewExtensions(
      { sourceId: "chrome", profileId: "Reviewed" },
      native.token,
    );
    const choice = {
      sourceId: "chrome",
      profileId: "Reviewed",
      categories: ["extensions" as const],
      extensionReview: {
        reviewId: review.reviewId,
        choices: [
          { candidateId: chosenId, chromeWebStoreId: "a".repeat(32) },
          { candidateId: skippedId, skip: true as const },
        ],
      },
    };
    await expect(
      importer.start(
        {
          selections: [{ ...choice, extensionReview: { ...choice.extensionReview, reviewId: randomUUID() } }],
        },
        native.token,
      ),
    ).rejects.toMatchObject({ code: "ref_stale" });
    expect(native.browserImportBegin).not.toHaveBeenCalled();
    const begin = native.browserImportBegin.getMockImplementation()!;
    native.browserImportBegin.mockImplementation(async (input) => {
      expect(JSON.stringify(repo.getSetting("browser-import.receipts.v1"))).toContain(
        JSON.stringify(choice.extensionReview),
      );
      expect(input.extensionReview).toEqual(choice.extensionReview);
      return begin(input);
    });
    await importer.start({ selections: [choice] }, native.token);
    await flushImport();
    expect(native.browserImportBegin).toHaveBeenCalledTimes(1);
    await importer.preview(native.token);
    await expect(importer.start({ selections: [choice] }, native.token)).rejects.toMatchObject({
      code: "ref_stale",
    });
  } finally {
    await importer.close();
    db.close();
  }
});
