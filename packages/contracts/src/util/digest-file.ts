import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

/** Hash a file incrementally without retaining its contents. Node-only. */
export function digestFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(path);
    stream.on("data", chunk => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}
