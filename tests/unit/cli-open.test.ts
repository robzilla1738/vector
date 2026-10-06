import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  discoverProfiles,
  openRequest,
  openedPage,
  selectProfile,
  selectSpace,
  type CliProfile,
} from "../../packages/cli/src/open";
const profiles: CliProfile[] = [
  {
    id: "Default",
    name: "Personal",
    current: true,
    archived: false,
    spaces: [{ id: "research", name: "Research", color: "blue" }],
  },
  {
    id: "Profile 1",
    name: "Work",
    current: false,
    archived: false,
    spaces: [{ id: "work-research", name: "Research", color: "green" }],
  },
  { id: "Profile 2", name: "Work", current: false, archived: true, spaces: [] },
];
describe("CLI native open", () => {
  it("reads only disposable Local State and preserves archive metadata without changing bytes", () => {
    const root = mkdtempSync(join(tmpdir(), "aux-cli-profiles-"));
    try {
      mkdirSync(join(root, "Default"));
      const path = join(root, "Local State");
      const bytes = JSON.stringify({
        profile: {
          last_used: "Default",
          info_cache: {
            Default: { name: "Personal" },
            "Profile 1": { name: "Work" },
            "Guest Profile": { name: "Guest" },
          },
        },
        aux: {
          archived_profiles: { "Profile 1": true },
          profile_spaces_index: { default: [{ id: "research", name: "Research", color: "blue" }] },
        },
      });
      writeFileSync(path, bytes);
      expect(discoverProfiles(root)).toEqual([profiles[0], { ...profiles[1], archived: true, spaces: [] }]);
      expect(readFileSync(path, "utf8")).toBe(bytes);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it("requires an unambiguous live Profile and Space and reports candidates", () => {
    expect(selectProfile(profiles, "default")).toEqual(profiles[0]);
    expect(selectProfile(profiles, "Profile 1")).toEqual(profiles[1]);
    expect(() => selectProfile(profiles, "Work")).toThrow(/Profile 1.*Profile 2/);
    expect(() => selectProfile(profiles, "Profile 2")).toThrow(/archived/);
    expect(() => selectProfile(profiles, "missing")).toThrow(/Unknown/);
    expect(selectSpace(profiles[1]!, "research")).toBe("work-research");
    expect(() =>
      selectSpace(
        {
          ...profiles[1]!,
          spaces: [...profiles[1]!.spaces, { id: "other", name: "Research", color: "red" }],
        },
        "Research",
      ),
    ).toThrow(/Ambiguous/);
  });
  it("encodes the inner URL once and leaves unspecified Profiles for native CLI routing", () => {
    const url = "http://127.0.0.1:1234/path?q=a%26b#fragment";
    const request = new URL(
      openRequest(url, { profile: "Profile 1", space: "Research", little: true, background: true }, profiles)
        .url,
    );
    expect(request.searchParams.get("url")).toBe(url);
    expect(request.searchParams.get("profile")).toBe("Profile 1");
    expect(request.searchParams.get("space")).toBe("work-research");
    expect(request.searchParams.get("source")).toBe("cli");
    expect(request.searchParams.get("window")).toBe("little");
    expect(new URL(openRequest(url, {}, profiles).url).searchParams.has("profile")).toBe(false);
    for (const invalid of ["file:///etc/passwd", "javascript:alert(1)", "http://name:secret@127.0.0.1/"])
      expect(() => openRequest(invalid, {}, profiles)).toThrow();
    expect(() => openRequest(url, { little: true, newWindow: true }, profiles)).toThrow();
  });
  it("resolves a standalone Space by exact ID and reports cross-Profile name ambiguity", () => {
    const request = openRequest("http://127.0.0.1/", { space: "work-research" }, profiles);
    expect(request.profile?.id).toBe("Profile 1");
    expect(request.spaceId).toBe("work-research");
    expect(() => openRequest("http://127.0.0.1/", { space: "Research" }, profiles)).toThrow(
      /Personal.*default.*Work.*Profile 1/,
    );
    expect(() => openRequest("http://127.0.0.1/", { space: "missing" }, profiles)).toThrow(/Unknown Space/);
  });
  it("waits for a new human page and actual target Space placement", () => {
    const page = { pageId: "new", url: "http://127.0.0.1/", ownedByRuntime: false, viewStatus: "visible" };
    expect(openedPage({ pages: [page], tabPlacements: {} }, new Set(), page.url, "research")).toBeUndefined();
    const snapshot = { pages: [page], tabPlacements: { new: { spaceId: "research" } } };
    expect(openedPage(snapshot, new Set(), page.url, "research")).toEqual(page);
    expect(openedPage(snapshot, new Set(["new"]), page.url, "research")).toBeUndefined();
    expect(
      openedPage({ ...snapshot, pages: [{ ...page, ownedByRuntime: true }] }, new Set(), page.url),
    ).toBeUndefined();
    expect(
      openedPage({ ...snapshot, pages: [{ ...page, windowKind: "private" }] }, new Set(), page.url),
    ).toBeUndefined();
  });
});
