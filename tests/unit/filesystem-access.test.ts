import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { FilesystemAccessService } from "../../apps/runtime/dist/services/filesystem-access.js";
import {
  filesystemPermits,
  filesystemSeatbelt,
  type FileAccessMode,
} from "../../apps/runtime/dist/services/filesystem-policy.js";

const dispose: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of dispose.splice(0)) cleanup();
});
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "aux-filesystem-"));
  dispose.push(() => rmSync(directory, { recursive: true, force: true }));
  const home = join(directory, "home"),
    data = join(home, "AuxProfile"),
    artifacts = join(data, "artifacts"),
    external = join(directory, "reviewed");
  for (const path of [home, artifacts, external, join(home, "Documents"), join(home, ".ssh")])
    mkdirSync(path, { recursive: true });
  let mode: FileAccessMode = "guard",
    revision = 0;
  const service = new FilesystemAccessService({
    homeDir: home,
    internalRoots: [artifacts],
    scratchDir: artifacts,
    protectedRoots: [data],
    settings: () => ({ fileAccessMode: mode, fileAccessRevision: revision }),
    reviewedRoots: () => ({ read: [external], write: [external] }),
  });
  return {
    service,
    home,
    data,
    artifacts,
    external,
    setMode: (next: FileAccessMode) => {
      mode = next;
      revision++;
    },
  };
}

it("applies Guard Home reads and bounded user writes while denying sensitive and protected data", () => {
  const f = fixture(),
    policy = f.service.snapshot();
  expect(filesystemPermits(policy, join(f.home, "notes.txt"), "read")).toBe(true);
  expect(filesystemPermits(policy, join(f.home, "notes.txt"), "write")).toBe(false);
  expect(filesystemPermits(policy, join(f.home, "Documents", "notes.txt"), "write")).toBe(true);
  expect(filesystemPermits(policy, join(f.home, ".ssh", "id_ed25519"), "read")).toBe(false);
  for (const config of [".codex/config.toml", ".codex/auth.json", ".claude.json", ".claude/.credentials.json", ".cursor/mcp.json"])
    expect(filesystemPermits(policy, join(f.home, config), "read")).toBe(false);
  expect(filesystemPermits(policy, join(f.home, ".agents", "skills", "aux", "SKILL.md"), "read")).toBe(true);
  expect(filesystemPermits(policy, join(f.data, "settings.json"), "read")).toBe(false);
  expect(filesystemPermits(policy, join(f.artifacts, "output.txt"), "write")).toBe(true);
});

it("keeps Read-only user roots unwritable and Full bounded by Home and reviewed roots", () => {
  const f = fixture();
  f.setMode("read-only");
  expect(filesystemPermits(f.service.snapshot(), join(f.external, "output.txt"), "write")).toBe(false);
  expect(filesystemPermits(f.service.snapshot(), join(f.artifacts, "output.txt"), "write")).toBe(true);
  f.setMode("full");
  const policy = f.service.snapshot();
  expect(filesystemPermits(policy, join(f.home, "output.txt"), "write")).toBe(true);
  expect(filesystemPermits(policy, join(f.external, "output.txt"), "write")).toBe(true);
  expect(filesystemPermits(policy, join(f.external, "..", "unreviewed.txt"), "write")).toBe(false);
  expect(filesystemPermits(policy, join(f.data, "settings.json"), "write")).toBe(false);
});

it("refuses symlink escapes and puts sensitive denies after broad Home allowances", () => {
  const f = fixture();
  symlinkSync(join(f.home, ".ssh"), join(f.home, "Documents", "keys"));
  expect(filesystemPermits(f.service.snapshot(), join(f.home, "Documents", "keys", "key"), "read")).toBe(
    false,
  );
  const profile = filesystemSeatbelt(f.service.snapshot(), true);
  expect(profile.lastIndexOf("(deny file-read-data file-write*")).toBeGreaterThan(
    profile.indexOf("(allow file-read-data (subpath"),
  );
  expect(profile).toContain("(require-not (subpath");
  expect(profile).toContain("(allow network-outbound)");
});

it.runIf(process.platform === "darwin")(
  "reads and writes through the sandboxed helper without reopening upload paths",
  async () => {
    const f = fixture(),
      file = join(f.artifacts, "upload.txt");
    await f.service.writeText(file, "first");
    expect(readFileSync(file, "utf8")).toBe("first");
    const bytes = await f.service.readUpload(file);
    writeFileSync(file, "replacement");
    expect(bytes.toString("utf8")).toBe("first");
    expect(await f.service.readText(file)).toBe("replacement");
    await expect(f.service.readText(join(f.home, ".ssh", "secret"))).rejects.toMatchObject({
      code: "permission_denied",
    });
  },
);
