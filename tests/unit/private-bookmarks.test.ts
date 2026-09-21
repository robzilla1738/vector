import { describe, expect, it } from "vitest";
import { PrivateBookmarks } from "../../apps/desktop/main/private-bookmarks.js";

describe("private bookmark collections", () => {
  it("preserves nested folders, edits and existing imports without sharing between windows", () => {
    const collection = new PrivateBookmarks();
    collection.invoke("bookmarks.add", { url: "https://example.com", title: "My title", folderPath: ["Research", "Sources"] });
    const result = collection.invoke("bookmarks.import", { bookmarks: [
      { url: "https://example.com", title: "Imported title", folderPath: ["Imported"] },
      { url: "https://example.org", title: "Reference", folderPath: ["Research", "Sources"] },
    ], folders: [["Empty"]] });
    expect(result).toEqual({ added: 1, skipped: 1 });
    collection.invoke("bookmarks.folders.rename", { path: ["Research"], name: "Project" });
    expect(collection.list().find(item => item.url === "https://example.com")).toMatchObject({ title: "My title", folderPath: ["Project", "Sources"] });
    collection.invoke("bookmarks.add", { url: "https://example.com", title: "Edited" });
    expect(collection.list().find(item => item.url === "https://example.com")).toMatchObject({ title: "Edited", folderPath: ["Project", "Sources"] });
    expect(collection.paths()).toContainEqual(["Empty"]);
    expect(new PrivateBookmarks().list()).toEqual([]);
    expect(new PrivateBookmarks().paths()).toEqual([]);
  });

  it("rejects destructive folder collisions and invalid imports without partial changes", () => {
    const collection = new PrivateBookmarks();
    collection.invoke("bookmarks.add", { url: "https://example.com", title: "Page", folderPath: ["Keep"] });
    collection.invoke("bookmarks.folders.create", { path: ["Other"] });
    const before = collection.list();
    expect(() => collection.invoke("bookmarks.folders.rename", { path: ["Keep"], name: "Other" })).toThrow("already exists");
    expect(() => collection.invoke("bookmarks.folders.remove", { path: ["Keep"] })).toThrow("Move this folder");
    expect(() => collection.invoke("bookmarks.import", { bookmarks: [{ url: "https://example.org", title: "Valid" }, { url: "https://user:password@example.net", title: "Invalid" }], folders: [["Must not appear"]] })).toThrow();
    expect(collection.list()).toEqual(before);
    expect(collection.paths()).not.toContainEqual(["Must not appear"]);
    collection.invoke("bookmarks.add", { url: "https://example.com", title: "Moved", folderPath: [] });
    collection.invoke("bookmarks.folders.remove", { path: ["Keep"] });
    expect(collection.paths()).not.toContainEqual(["Keep"]);
  });
});
