import { lstat } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { AuxError } from "@aux/contracts";
import {
  COPILOT_RELEASE,
  CopilotRuntimeReceiptSchema,
  writeCopilotRuntimeLicense,
} from "./copilot-runtime-install.js";
import { extractCopilotArchive } from "./copilot-archive.js";

const payload = process.argv[2],
  count = Number(process.argv[3]);
async function main() {
  const send = process.send,
    disconnect = process.disconnect;
  if (
    !payload ||
    !isAbsolute(payload) ||
    !Number.isSafeInteger(count) ||
    count <= 0 ||
    count > 128 * 1024 * 1024 ||
    !send ||
    !disconnect
  )
    throw new AuxError(
      "invalid_params",
      "Invalid owned installer worker invocation.",
    );
  const ownedPayload = payload;
  const root = await lstat(ownedPayload);
  if (
    !root.isDirectory() ||
    root.isSymbolicLink() ||
    root.uid !== process.getuid?.() ||
    (root.mode & 0o077) !== 0
  )
    throw new AuxError(
      "permission_denied",
      "Extraction destination is not privately owned.",
    );
  const receipt = CopilotRuntimeReceiptSchema.parse({
    ...(await extractCopilotArchive(3, ownedPayload, count, COPILOT_RELEASE)),
    supplementalLicense: await writeCopilotRuntimeLicense(ownedPayload),
  });
  await new Promise<void>((resolve, reject) => {
    send.call(process, receipt, (error: Error | null) =>
      error ? reject(error) : resolve(),
    );
  });
  disconnect.call(process);
}
// The parent accepts only IPC receipt + actual successful process exit. On failure all pending
// worker writers/descriptors are retired by process exit before the parent removes staging.
void main().catch(() => {
  process.exit(1);
});
