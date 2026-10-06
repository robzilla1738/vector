import { constants, read } from "node:fs";
import { open } from "node:fs/promises";
import { join } from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import { AuxError } from "@aux/contracts";
import { z } from "zod";
import {
  copilotArchivePath,
  copilotRuntimeFileIdentity,
  type CopilotInstallationReceipt,
} from "./copilot-runtime-install.js";
/** Trusted release metadata, explicitly supplied by the bundled worker; no human/model API accepts these fields. */
export interface CopilotArchiveRelease {
  sdkVersion: string;
  runtimeVersion: string;
  platform: string;
  packageName: string;
  expandedBytes: number;
  fileCount: number;
  wrapper: string;
  nativeModule: string;
  integrity: string;
}
function bytes(max: number) {
  let received = 0;
  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      received += chunk.byteLength;
      callback(
        received > max
          ? new AuxError(
              "permission_denied",
              "Archive expansion exceeded its reviewed bound.",
            )
          : null,
        chunk,
      );
    },
  });
}
/** Positional reads borrow the caller's descriptor without adopting or closing it. */
async function withBorrowedArchive<T>(
  fd: number,
  size: number,
  work: (source: Readable) => Promise<T>,
): Promise<T> {
  if (!Number.isSafeInteger(size) || size <= 0)
    throw new AuxError("permission_denied", "Invalid held archive byte bound.");
  let stopped = false;
  let pending: Promise<number> | undefined;
  const source = Readable.from(
    (async function* () {
      let position = 0;
      while (!stopped && position < size) {
        const buffer = Buffer.alloc(Math.min(65536, size - position));
        pending = new Promise<number>((resolve, reject) => {
          read(fd, buffer, 0, buffer.length, position, (error, count) => {
            if (error) reject(error);
            else resolve(count);
          });
        });
        const count = await pending;
        pending = undefined;
        if (stopped) return;
        if (count === 0)
          throw new AuxError(
            "permission_denied",
            "Held archive ended before its reviewed size.",
          );
        position += count;
        yield buffer.subarray(0, count);
      }
    })(),
    { objectMode: false },
  );
  try {
    return await work(source);
  } finally {
    stopped = true;
    source.destroy();
    // pipeline destruction must not let caller cleanup race an original fs.read.
    // Its rejection is already owned by the generator/pipeline, not a close ACK.
    await pending?.then(
      () => {},
      () => {},
    );
  }
}
export async function extractCopilotArchive(
  archiveFd: number,
  payload: string,
  downloadBytes: number,
  release: CopilotArchiveRelease,
) {
  const tar = await import("tar");
  const entries = new Map<
    string,
    { size: number; type: string; mode: number }
  >();
  let expanded = 0;
  let refused: Error | undefined;
  const maxTar = release.expandedBytes + 4 * 1024 * 1024;
  const list = tar.list({
    strict: true,
    maxMetaEntrySize: 65536,
    onReadEntry(entry) {
      try {
        const path = copilotArchivePath(entry.path, entry.type);
        if (
          entries.has(path) ||
          entries.size >= 256 ||
          !Number.isSafeInteger(entry.size) ||
          entry.size < 0
        )
          throw new AuxError(
            "permission_denied",
            "Archive contains duplicate or oversized entries.",
          );
        expanded += entry.type === "File" ? entry.size : 0;
        if (expanded > release.expandedBytes)
          throw new AuxError(
            "permission_denied",
            "Archive exceeds its exact expanded size.",
          );
        entries.set(path, {
          size: entry.size,
          type: entry.type,
          mode: entry.mode ?? 0,
        });
      } catch (error) {
        refused =
          error instanceof Error
            ? error
            : new AuxError("permission_denied", "Invalid archive metadata.");
        list.abort(refused);
      }
    },
  });
  try {
    await withBorrowedArchive(archiveFd, downloadBytes, (source) =>
      pipeline(source, createGunzip(), bytes(maxTar), list),
    );
  } catch (error) {
    throw refused ?? error;
  }
  const files = [...entries].filter(([, e]) => e.type === "File");
  if (
    expanded !== release.expandedBytes ||
    files.length !== release.fileCount ||
    !entries.has(`package/${release.wrapper}`) ||
    !entries.has(`package/${release.nativeModule}`)
  )
    throw new AuxError(
      "permission_denied",
      "Archive is missing its full reviewed runtime.",
    );
  const extraction = tar.extract({
    cwd: payload,
    strict: true,
    strip: 1,
    preservePaths: false,
    preserveOwner: false,
    noMtime: true,
    chmod: true,
    processUmask: 0o077,
    umask: 0o077,
    maxMetaEntrySize: 65536,
    filter(path, entry) {
      if (!("type" in entry))
        throw new AuxError("permission_denied", "Unexpected archive entry.");
      const p = copilotArchivePath(path, entry.type),
        expected = entries.get(p);
      if (
        !expected ||
        expected.type !== entry.type ||
        expected.size !== entry.size
      )
        throw new AuxError(
          "permission_denied",
          "Held archive changed before extraction.",
        );
      return true;
    },
  });
  await withBorrowedArchive(archiveFd, downloadBytes, (source) =>
    pipeline(source, createGunzip(), bytes(maxTar), extraction),
  );
  const identities: CopilotInstallationReceipt["files"] = [];
  for (const [path] of files.sort(([a], [b]) => a.localeCompare(b))) {
    const relative = path.slice("package/".length),
      identity = await copilotRuntimeFileIdentity(
        join(payload, relative),
        entries.get(path)?.size,
      );
    if (identity.size !== entries.get(path)?.size)
      throw new AuxError(
        "permission_denied",
        "Extracted artifact size changed.",
      );
    identities.push({ ...identity, path: relative });
  }
  const packageFile = await open(
    join(payload, "package.json"),
    constants.O_RDONLY | constants.O_NOFOLLOW,
  );
  try {
    const body = Buffer.alloc(32769),
      { bytesRead } = await packageFile.read(body, 0, body.length, 0);
    if (bytesRead > 32768)
      throw new AuxError(
        "permission_denied",
        "Invalid runtime package metadata size.",
      );
    z.object({
      name: z.literal(release.packageName),
      version: z.literal(release.sdkVersion),
      license: z.literal("MIT"),
    }).parse(JSON.parse(body.subarray(0, bytesRead).toString("utf8")));
  } finally {
    await packageFile.close();
  }
  if (!identities.find((f) => f.path === release.wrapper)?.executable)
    throw new AuxError(
      "permission_denied",
      "The official wrapper is not executable.",
    );
  return {
    version: 1,
    sdkVersion: release.sdkVersion,
    runtimeVersion: release.runtimeVersion,
    platform: release.platform,
    integrity: release.integrity,
    downloadBytes,
    expandedBytes: expanded,
    files: identities,
  };
}
