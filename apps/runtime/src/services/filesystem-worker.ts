import { constants } from "node:fs";
import { mkdir, open } from "node:fs/promises";
import { dirname } from "node:path";

// Executed only by the supervised launcher under the policy captured by its owner.
const chunks: Buffer[] = [];
for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
try {
  const request = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
    operation: "read" | "write";
    path: string;
    content?: string;
  };
  if (request.operation !== "read" && request.operation !== "write")
    throw new Error("Unknown file operation");
  const path = request.path;
  if (typeof path !== "string" || !path.startsWith("/")) throw new Error("An absolute file path is required");
  if (request.operation === "write") {
    if (typeof request.content !== "string") throw new Error("Missing file content");
    await mkdir(dirname(path), { recursive: true });
  }
  const file = await open(
    path,
    constants.O_NOFOLLOW |
      (request.operation === "read" ? constants.O_RDONLY : constants.O_WRONLY | constants.O_CREAT),
    0o600,
  );
  try {
    if (!(await file.stat()).isFile()) throw new Error("A regular file is required");
    if (request.operation === "read") process.stdout.write(await file.readFile());
    else {
      await file.truncate(0);
      await file.writeFile(request.content!, "utf8");
    }
  } finally {
    await file.close();
  }
} catch {
  process.exitCode = 1;
}
