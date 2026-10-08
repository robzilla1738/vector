import { canonicalFilePath } from "./filesystem-paths.js";
import { constants } from "node:fs";
import { open, mkdir, realpath, unlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import { executeCodingFileRequest } from "./coding-files-worker.js";
import { CLOUD_FILE_BYTES, CLOUD_PROJECT_ROOT, validateCloudFileRequest } from "./cloud-files-protocol.js";

export async function executeCloudFileRequest(
  request: Record<string, unknown>,
  root = CLOUD_PROJECT_ROOT,
): Promise<unknown> {
  const paths = validateCloudFileRequest(request, root);
  await mkdir(root, { recursive: true, mode: 0o700 });
  if ((await realpath(root)) !== root) throw new Error("The original cloud project root changed.");
  for (const path of paths)
    if (canonicalFilePath(path) !== path) throw new Error("Cloud file targets cannot use symlink aliases.");
  return executeCodingFileRequest(
    {
      mode: "guard",
      purpose: "coding",
      revision: 1,
      readRoots: [root],
      writeRoots: [root],
      deniedRoots: [],
      protectedRoots: [],
      internalRoots: [],
    },
    request,
  );
}

/** The immutable command arguments bind the uploaded envelope; no host paths or environment are copied. */
export async function runCloudFileWorker(path: string, digest: string): Promise<void> {
  if (!/^\/vercel\/sandbox\/\.aux-files-[a-f0-9-]+\.json$/.test(path) || !/^[a-f0-9]{64}$/.test(digest))
    throw new Error("Invalid cloud file envelope.");
  try {
    const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    let bytes: Buffer;
    try {
      const stat = await file.stat();
      if (!stat.isFile() || stat.size > CLOUD_FILE_BYTES)
        throw new Error("Cloud file input exceeds its bound.");
      bytes = await file.readFile();
      if (bytes.length > CLOUD_FILE_BYTES || createHash("sha256").update(bytes).digest("hex") !== digest)
        throw new Error("The cloud file envelope changed before execution.");
    } finally {
      await file.close();
    }
    const request = JSON.parse(bytes.toString("utf8")) as Record<string, unknown>;
    const output = JSON.stringify({ value: await executeCloudFileRequest(request) });
    if (Buffer.byteLength(output) > CLOUD_FILE_BYTES) throw new Error("Cloud file output exceeds its bound.");
    process.stdout.write(output);
  } finally {
    await unlink(path).catch(() => {});
  }
}
