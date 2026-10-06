import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { expect, it } from "vitest";

const script = join(process.cwd(), "scripts/native-diff.mjs");
it("creates a baseline-relative patch including new and removed native files", () => {
  const root = mkdtempSync(join(tmpdir(), "aux-native-diff-test-"));
  const source = join(root, "source"),
    worktree = join(root, "worktree");
  const run = (...args: string[]) =>
    execFileSync(process.execPath, [script, ...args, "--source", source, "--worktree", worktree], {
      stdio: "pipe",
    });
  try {
    mkdirSync(join(source, "chrome"), { recursive: true });
    writeFileSync(join(source, "chrome/existing.cc"), "old\n");
    writeFileSync(join(source, "chrome/removed.cc"), "remove\n");
    run("init", "--file", "chrome/existing.cc", "--file", "chrome/removed.cc", "--file", "chrome/new.cc");
    expect(() => run("init", "--file", "chrome/existing.cc")).toThrow();
    writeFileSync(join(worktree, ".native/chrome/existing.cc"), "new\n");
    rmSync(join(worktree, ".native/chrome/removed.cc"));
    writeFileSync(join(worktree, ".native/chrome/new.cc"), "added\n");
    const patch = "chromium/patches/aux/runtime/0140-fixture.patch";
    run("diff", "--patch", patch);
    const diff = readFileSync(join(worktree, patch), "utf8");
    expect(diff).toContain("-old\n+new");
    expect(diff).toContain("new file mode");
    expect(diff).toContain("deleted file mode");
    execFileSync("git", ["init", "--quiet", source]);
    execFileSync("git", ["apply", "--check", join(worktree, patch)], { cwd: source });
    expect(readFileSync(join(source, "chrome/existing.cc"), "utf8")).toBe("old\n");
    writeFileSync(join(worktree, ".native-base/chrome/existing.cc"), "tampered\n");
    expect(() => run("diff", "--patch", patch)).toThrow();
    expect(() => run("diff", "--patch", "../escape.patch")).toThrow();
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

it("refuses symlinked source parents and patch destinations", () => {
  const root = mkdtempSync(join(tmpdir(), "aux-native-diff-test-"));
  const source = join(root, "source"),
    worktree = join(root, "worktree"),
    outside = join(root, "outside");
  const run = (...args: string[]) =>
    execFileSync(process.execPath, [script, ...args, "--source", source, "--worktree", worktree], {
      stdio: "pipe",
    });
  try {
    mkdirSync(source);
    mkdirSync(outside);
    writeFileSync(join(outside, "native.cc"), "old\n");
    symlinkSync(outside, join(source, "chrome"));
    expect(() => run("init", "--file", "chrome/native.cc")).toThrow();
    rmSync(join(source, "chrome"));
    mkdirSync(join(source, "chrome"));
    writeFileSync(join(source, "chrome/native.cc"), "old\n");
    run("init", "--file", "chrome/native.cc");
    writeFileSync(join(worktree, ".native/chrome/native.cc"), "new\n");
    mkdirSync(join(worktree, "chromium"));
    symlinkSync(outside, join(worktree, "chromium/patches"));
    expect(() => run("diff", "--patch", "chromium/patches/aux/runtime/0140-fixture.patch")).toThrow();
    expect(readFileSync(join(outside, "native.cc"), "utf8")).toBe("old\n");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
