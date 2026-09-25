import { describe, expect, it } from "vitest";
import { mergeCommandResults, titleHostKey } from "./command-results";

describe("command result merge", () => {
  it("preserves Chromium order and drops matching title plus host from Aux", () => {
    const host = [
      {
        id: "history-1",
        title: "Release Notes",
        url: "https://example.com/releases",
      },
      {
        id: "bookmark-1",
        title: "Project",
        url: "https://aux.example/project",
      },
    ];
    const aux = [
      {
        id: "tab-1",
        title: "Release  Notes",
        url: "https://example.com/releases?from=tab",
      },
      {
        id: "skill-1",
        title: "Review release",
        url: "https://example.com/releases",
      },
    ];
    const result = mergeCommandResults(host, aux);
    expect(result.rows.map((row) => row.id)).toEqual(["history-1", "bookmark-1", "skill-1"]);
    expect(result.dropped).toEqual([
      {
        droppedId: "tab-1",
        keptId: "history-1",
        key: "release notes\u0000example.com",
      },
    ]);
  });

  it("keeps distinct titles and non-web actions", () => {
    expect(titleHostKey({ id: "command", title: "Open settings" })).toBeNull();
    expect(
      mergeCommandResults(
        [{ id: "a", title: "A", url: "https://example.com" }],
        [
          { id: "b", title: "B", url: "https://example.com" },
          { id: "c", title: "A" },
        ],
      ).rows.map((row) => row.id),
    ).toEqual(["a", "b", "c"]);
  });
});
