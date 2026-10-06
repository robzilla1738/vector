import { createHash } from "node:crypto";
import { mkdtemp, mkdir, open, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as tar from "tar";
import {
  extractCopilotArchive,
  type CopilotArchiveRelease,
} from "../../apps/runtime/dist/services/copilot-archive.js";

import {
  assertCopilotRuntimeLicense,
  writeCopilotRuntimeLicense,
  COPILOT_RUNTIME_LICENSE,
} from "../../apps/runtime/dist/services/copilot-runtime-install.js";

/** Small synthetic archive exercises the same maintained parser; it is never an accepted official runtime. */
async function fixture(link = false, embeddedLicense = true) {
  const root = await mkdtemp(join(tmpdir(), "aux-copilot-archive-fixture-"));
  const source = join(root, "source"),
    payload = join(root, "payload"),
    file = join(root, "fixture.tgz");
  await mkdir(join(source, "package", "prebuilds", "fixture"), {
    recursive: true,
    mode: 0o700,
  });
  await mkdir(payload, { mode: 0o700 });
  const content = new Map([
    [
      "package.json",
      JSON.stringify({
        name: "@aux/synthetic-copilot-runtime",
        version: "1.0.16",
        license: "MIT",
      }),
    ],
    ["LICENSE", "Synthetic protocol fixture license; not a provider runtime."],
    [
      "prebuilds/fixture/copilot-runtime",
      "Synthetic placeholder; never executed.",
    ],
    ["prebuilds/fixture/runtime.node", "Synthetic placeholder; never loaded."],
  ]);
  if (!embeddedLicense) content.delete("LICENSE");
  for (const [path, body] of content)
    await writeFile(join(source, "package", path), body, {
      mode: path.endsWith("copilot-runtime") ? 0o700 : 0o600,
    });
  if (link) {
    const { symlink } = await import("node:fs/promises");
    await symlink("/outside-fixture", join(source, "package", "bad-link"));
  }
  await tar.create({ cwd: source, file, gzip: true, portable: true }, [
    "package",
  ]);
  const archive = await open(file, "r"),
    stat = await archive.stat();
  const release: CopilotArchiveRelease = {
    sdkVersion: "1.0.16",
    runtimeVersion: "fixture-only",
    platform: "fixture",
    packageName: "@aux/synthetic-copilot-runtime",
    integrity: createHash("sha512")
      .update("fixture-not-installed")
      .digest("base64"),
    fileCount: content.size,
    expandedBytes: [...content.values()].reduce(
      (n, s) => n + Buffer.byteLength(s),
      0,
    ),
    wrapper: "prebuilds/fixture/copilot-runtime",
    nativeModule: "prebuilds/fixture/runtime.node",
  };
  return {
    root,
    payload,
    archive,
    stat,
    release,
    async close() {
      await archive.close();
      await rm(root, { recursive: true });
    },
  };
}
describe("Copilot held archive decoder", () => {
  it("retains the complete archive and verifies the separate pinned upstream notice", async () => {
    const f = await fixture(false, false);
    try {
      const result = await extractCopilotArchive(
        f.archive.fd,
        f.payload,
        f.stat.size,
        f.release,
      );
      expect(result.files.map((file) => file.path)).toEqual([
        "package.json",
        "prebuilds/fixture/copilot-runtime",
        "prebuilds/fixture/runtime.node",
      ]);
      expect(result.expandedBytes).toBe(f.release.expandedBytes);
      expect(
        result.files.every(
          (file) => /^[a-f0-9]{64}$/.test(file.sha256) && !!file.ino,
        ),
      ).toBe(true);
      expect(
        result.files.find((file) => file.path === f.release.wrapper)
          ?.executable,
      ).toBe(true);
      // The actual official platform tar omits a license file. The worker's
      // pinned notice remains a separate owned receipt, not an archive count.
      const notice = await writeCopilotRuntimeLicense(f.payload);
      expect(notice.sha256).toBe(COPILOT_RUNTIME_LICENSE.sha256);
      expect(notice.sourceCommit).toBe(COPILOT_RUNTIME_LICENSE.sourceCommit);
      expect(notice.size).toBe(1060);
      expect(result.files.some((file) => file.path === notice.path)).toBe(
        false,
      );
      await assertCopilotRuntimeLicense(f.payload, notice);
      const changed = Buffer.from(COPILOT_RUNTIME_LICENSE.text);
      changed[0] = changed[0] === 88 ? 89 : 88;
      await writeFile(join(f.payload, notice.path), changed);
      await expect(
        assertCopilotRuntimeLicense(f.payload, notice),
      ).rejects.toMatchObject({ code: "permission_denied" });
    } finally {
      await f.close();
    }
  });
  it("refuses a symlink before extracting any payload", async () => {
    const f = await fixture(true);
    try {
      await expect(
        extractCopilotArchive(f.archive.fd, f.payload, f.stat.size, f.release),
      ).rejects.toMatchObject({ code: "permission_denied" });
      const { readdir } = await import("node:fs/promises");
      expect(await readdir(f.payload)).toEqual([]);
      expect((await f.archive.stat()).ino).toBe(f.stat.ino);
      const signature = Buffer.alloc(2);
      expect((await f.archive.read(signature, 0, 2, 0)).bytesRead).toBe(2);
      expect([...signature]).toEqual([0x1f, 0x8b]);
    } finally {
      await f.close();
    }
  });
  it("refuses truncated support coverage instead of installing only an executable", async () => {
    const f = await fixture();
    try {
      await expect(
        extractCopilotArchive(f.archive.fd, f.payload, f.stat.size, {
          ...f.release,
          nativeModule: "prebuilds/fixture/absent-runtime.node",
        }),
      ).rejects.toMatchObject({ code: "permission_denied" });
    } finally {
      await f.close();
    }
  });
});
