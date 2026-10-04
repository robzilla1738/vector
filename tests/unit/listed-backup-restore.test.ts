import { expect, it, vi } from "vitest";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";
import { writeFile, readFile, rename, mkdir } from "node:fs/promises";
import { openDb, Repo } from "@aux/runtime";
const seam = vi.hoisted(() => ({
  afterCopy: null as null | ((source: string, target: string) => Promise<void>),
  afterWrite: null as null | ((path: string) => void),
  afterSyncWrite: null as null | (() => void),
  afterRename: null as null | ((path: string) => void),
}));
vi.mock("node:fs/promises", async (original) => {
  const fs = await original<typeof import("node:fs/promises")>();
  return {
    ...fs,
    rename: async (...args: Parameters<typeof fs.rename>) => {
      await fs.rename(...args);
      seam.afterRename?.(String(args[1]));
    },
    writeFile: async (...args: Parameters<typeof fs.writeFile>) => {
      await fs.writeFile(...args);
      seam.afterWrite?.(String(args[0]));
    },
    copyFile: async (
      source: Parameters<typeof fs.copyFile>[0],
      target: Parameters<typeof fs.copyFile>[1],
      mode?: number,
    ) => {
      await fs.copyFile(source, target, mode);
      await seam.afterCopy?.(String(source), String(target));
    },
  };
});
vi.mock("node:fs", async (original) => {
  const fs = await original<typeof import("node:fs")>();
  return {
    ...fs,
    writeFileSync: (...args: Parameters<typeof fs.writeFileSync>) => {
      fs.writeFileSync(...args);
      seam.afterSyncWrite?.();
    },
  };
});
import {
  createRuntimeBackup,
  stageListedRuntimeRestore,
  stageRuntimeRestore,
} from "../../apps/runtime/src/services/runtime-backup.js";
import { advanceManagedRecoveryGeneration } from "../../apps/runtime/src/services/managed-recovery-generation.js";
import { installationMethods } from "../../apps/runtime/src/api/methods/installation.js";
async function fixture(
  test: (
    dataDir: string,
    backup: Awaited<ReturnType<typeof createRuntimeBackup>>,
    repo: Repo,
  ) => Promise<void>,
) {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-listed-restore-")),
    repo = new Repo(openDb(join(dataDir, "fixture.sqlite")));
  try {
    repo.setSetting("synthetic-marker", "original");
    await mkdir(join(dataDir, "artifacts"), { recursive: true });
    const artifact = join(dataDir, "artifacts", "synthetic.txt");
    await writeFile(artifact, "synthetic original");
    repo.saveArtifact({
      artifactId: "synthetic",
      path: artifact,
      mediaType: "text/plain",
      size: 18,
      status: "complete",
      createdAt: 1,
    });
    const backup = await createRuntimeBackup(repo, dataDir);
    await test(dataDir, backup, repo);
  } finally {
    seam.afterCopy = null;
    seam.afterWrite = null;
    seam.afterSyncWrite = null;
    seam.afterRename = null;
    repo.close();
    rmSync(dataDir, { recursive: true, force: true });
  }
}
it("stages genuine disposable managed backup and retains actual original source receipt", async () =>
  fixture(async (dataDir, backup) => {
    const result = await stageListedRuntimeRestore(dataDir, basename(backup.path), backup.sha256);
    expect(result.staged).toBe(true);
    expect(result.source).toEqual({ path: backup.path, name: basename(backup.path), sha256: backup.sha256 });
    expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(true);
  }));
it("refuses original reviewed hash after a genuine newly completed backup replaces it", async () =>
  fixture(async (dataDir, backup, repo) => {
    repo.setSetting("synthetic-marker", "replacement");
    const replacement = await createRuntimeBackup(repo, dataDir);
    await rename(backup.path, backup.path + ".previous");
    await rename(replacement.path, backup.path);
    await expect(stageListedRuntimeRestore(dataDir, basename(backup.path), backup.sha256)).rejects.toThrow(
      "changed",
    );
    expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(false);
  }));
it.each(["manifest", "database"])(
  "refuses %s replacement during actual database copy before staging commit",
  async (kind) =>
    fixture(async (dataDir, backup) => {
      seam.afterCopy = async (source) => {
        if (!source.endsWith("state.sqlite")) return;
        seam.afterCopy = null;
        const path = join(backup.path, kind === "manifest" ? "manifest.json" : "state.sqlite");
        const bytes = await readFile(path);
        await rename(path, path + ".original");
        await writeFile(path, bytes, { mode: 0o600 });
      };
      await expect(stageListedRuntimeRestore(dataDir, basename(backup.path), backup.sha256)).rejects.toThrow(
        "changed",
      );
      expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(false);
    }),
);
it("original path-only producer accepts same-path replacement whereas reviewed source refuses it", async () =>
  fixture(async (dataDir, backup) => {
    seam.afterCopy = async (source) => {
      if (!source.endsWith("state.sqlite")) return;
      seam.afterCopy = null;
      const path = join(backup.path, "manifest.json"),
        bytes = await readFile(path);
      await rename(path, path + ".original");
      await writeFile(path, bytes, { mode: 0o600 });
    };
    expect((await stageRuntimeRestore(dataDir, backup.path)).staged).toBe(true);
  }));
it.each([{ external: true }, { external: false, codeMode: true }])(
  "managed listed restore refuses non-owner before filesystem producers: %j",
  async (client) => {
    const context = {
      client,
      params: { name: "aux-runtime-synthetic", expectedSha256: "a".repeat(64) },
      s: { settings: { all: vi.fn() }, repo: {} },
    } as unknown as Parameters<
      NonNullable<(typeof installationMethods)["installation.stageListedRestore"]>
    >[0];
    await expect(installationMethods["installation.stageListedRestore"]!(context)).rejects.toMatchObject({
      code: "permission_denied",
    });
    expect(context.s.settings.all).not.toHaveBeenCalled();
  },
);

it("current Forget generation retirement during copied source refuses before pending restore publication", async () =>
  fixture(async (dataDir, backup) => {
    seam.afterCopy = async (source) => {
      if (!source.endsWith("state.sqlite")) return;
      seam.afterCopy = null;
      advanceManagedRecoveryGeneration(dataDir);
    };
    await expect(stageListedRuntimeRestore(dataDir, basename(backup.path), backup.sha256)).rejects.toThrow(
      /generation|Forget/,
    );
    expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(false);
  }));
it("actual artifact replacement after copied bytes cannot consume original reviewed source", async () =>
  fixture(async (dataDir, backup) => {
    seam.afterCopy = async (source) => {
      if (!source.endsWith("synthetic.txt")) return;
      seam.afterCopy = null;
      const bytes = await readFile(source);
      await rename(source, source + ".original");
      await writeFile(source, bytes, { mode: 0o600 });
    };
    await expect(stageListedRuntimeRestore(dataDir, basename(backup.path), backup.sha256)).rejects.toThrow(
      "artifact changed",
    );
    expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(false);
  }));

it("refuses Forget at synchronous original descriptor boundary without publishing a false ACK", async () =>
  fixture(async (dataDir, backup) => {
    seam.afterSyncWrite = () => {
      seam.afterSyncWrite = null;
      advanceManagedRecoveryGeneration(dataDir);
    };
    let failure: unknown;
    try {
      await stageListedRuntimeRestore(dataDir, basename(backup.path), backup.sha256);
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(AggregateError);
    expect((failure as Error).message).toMatch(/Forget|generation/);
    expect((failure as { cleanupDebt: unknown[] }).cleanupDebt).toHaveLength(2);
    expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(false);
  }));
it("actual artifact rename then Forget retains exact orphan identity debt before database publication", async () =>
  fixture(async (dataDir, backup) => {
    seam.afterRename = (path) => {
      if (!path.endsWith("pending-runtime-restore-artifacts")) return;
      seam.afterRename = null;
      advanceManagedRecoveryGeneration(dataDir);
    };
    let failure: unknown;
    try {
      await stageListedRuntimeRestore(dataDir, basename(backup.path), backup.sha256);
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(AggregateError);
    expect((failure as { cleanupDebt: { path: string }[] }).cleanupDebt.map((value) => value.path)).toEqual([
      join(dataDir, "pending-runtime-restore-artifacts"),
    ]);
    expect(existsSync(join(dataDir, "pending-runtime-restore.sqlite"))).toBe(false);
    expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(false);
  }));
it("managed descriptor publication has no awaited write gap", async () =>
  fixture(async (dataDir, backup) => {
    const write = vi.fn();
    seam.afterWrite = write;
    await stageListedRuntimeRestore(dataDir, basename(backup.path), backup.sha256);
    expect(write.mock.calls.some(([path]) => path.endsWith("pending-runtime-restore.json"))).toBe(false);
    expect(existsSync(join(dataDir, "pending-runtime-restore.json"))).toBe(true);
  }));
