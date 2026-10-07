import { afterEach, expect, it, vi } from "vitest";
import { basename, join } from "node:path";
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fixtureFilesystemPolicy } from "../fixtures/filesystem-policy.js";

const hooks = vi.hoisted(() => ({
  afterSync: undefined as (() => Promise<void>) | undefined,
  failWrite: false,
}));
vi.mock("node:fs/promises", async (original) => {
  const actual = await original<typeof import("node:fs/promises")>();
  return {
    ...actual,
    open: async (...args: Parameters<typeof actual.open>) => {
      const handle = await actual.open(...args);
      if (!basename(String(args[0])).startsWith(".aux-")) return handle;
      return new Proxy(handle, {
        get(target, property) {
          if (property === "sync")
            return async () => {
              await target.sync();
              await hooks.afterSync?.();
            };
          if (property === "writeFile" && hooks.failWrite)
            return async () => {
              throw new Error("Injected temporary write failure");
            };
          const value = Reflect.get(target, property, target);
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
    },
  };
});
import { executeCodingFileRequest, fileState } from "../../apps/runtime/dist/services/coding-files-worker.js";

const roots: string[] = [];
afterEach(async () => {
  hooks.afterSync = undefined;
  hooks.failWrite = false;
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});
it.each(["editor", "write failure"] as const)(
  "preserves original contents and cleans temporary files after %s during preparation",
  async (failure) => {
    const root = await realpath(await mkdtemp(join(tmpdir(), "aux-write-conflict-")));
    roots.push(root);
    const path = join(root, "main.ts");
    await writeFile(path, "original");
    const before = await fileState(path);
    if (failure === "editor") hooks.afterSync = () => writeFile(path, "editor's newer changes");
    else hooks.failWrite = true;
    await expect(
      executeCodingFileRequest(fixtureFilesystemPolicy([root]), {
        kind: "apply",
        root,
        before: [before],
        after: [{ ...before, content: "Aux proposed changes", version: "proposed" }],
      }),
    ).rejects.toThrow(
      failure === "editor" ? "File changed while preparing the write" : "Injected temporary write failure",
    );
    expect(await readFile(path, "utf8")).toBe(failure === "editor" ? "editor's newer changes" : "original");
    expect(await readdir(root)).toEqual(["main.ts"]);
  },
);

it("inherits parent ignores for narrow searches with directory-only, anchored and repository boundaries", async () => {
  const root = await realpath(await mkdtemp(join(tmpdir(), "aux-search-ignores-")));
  roots.push(root);
  const project = join(root, "project"),
    src = join(project, "src"),
    nested = join(src, "nested"),
    ignored = join(src, "ignored");
  await mkdir(nested, { recursive: true });
  await mkdir(ignored);
  await mkdir(join(project, ".git"));
  await writeFile(join(root, ".gitignore"), "*.txt\n");
  await writeFile(join(project, ".gitignore"), "*.log\ncache/\n/src/anchored.txt\n/src/ignored/\n");
  await writeFile(join(src, "keep.txt"), "keep");
  await writeFile(join(src, "debug.log"), "omit");
  await writeFile(join(src, "cache"), "regular file should remain");
  await writeFile(join(src, "anchored.txt"), "omit");
  await writeFile(join(nested, "anchored.txt"), "keep nested anchored name");
  await writeFile(join(ignored, "kept.txt"), "must not traverse ignored subtree");
  const policy = fixtureFilesystemPolicy([root]);
  const search = (path: string) =>
    executeCodingFileRequest(policy, { kind: "search", root: path }) as Promise<{
      matches: { path: string }[];
    }>;
  const result = await search(src);
  expect(result.matches.map((match) => match.path)).toEqual([
    join(src, "cache"),
    join(src, "keep.txt"),
    join(nested, "anchored.txt"),
  ]);
  expect((await search(ignored)).matches).toEqual([]);
  expect((await search(nested)).matches.map((match) => match.path)).toEqual([join(nested, "anchored.txt")]);
});
