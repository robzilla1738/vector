import { constants } from "node:fs";
/** Only the reviewed runtime program is uploaded; no Profile, Keychain or SDK token. */
import { mkdir, open, writeFile, rename, unlink, readdir } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { ReplPool, type ReplHostDeps } from "../agent/loop/repl.js";
import { CLOUD_REPL_BYTES, CloudReplRequest, CloudReplCalls } from "./cloud-repl-protocol.js";
const directory = (() => {
  const value = process.argv[2];
  if (!value || !/^\/vercel\/sandbox\/\.aux-repl-[a-f0-9-]{36}$/.test(value))
    throw new Error("Invalid original worker directory");
  return value;
})();
await mkdir(directory, { recursive: true, mode: 0o700 });
const pool = new ReplPool();
let active = false;
async function boundedJson(path: string) {
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > CLOUD_REPL_BYTES)
      throw new Error("Worker message exceeds limit or is not a regular file");
    const bytes = Buffer.alloc(CLOUD_REPL_BYTES + 1);
    let length = 0;
    while (length < bytes.length) {
      const result = await handle.read(bytes, length, bytes.length - length, null);
      if (!result.bytesRead) break;
      length += result.bytesRead;
    }
    if (length > CLOUD_REPL_BYTES) throw new Error("Worker message exceeds limit");
    return JSON.parse(bytes.subarray(0, length).toString("utf8")) as unknown;
  } finally {
    await handle.close();
  }
}
async function publish(name: string, value: unknown) {
  const bytes = Buffer.from(JSON.stringify(value));
  if (bytes.length > CLOUD_REPL_BYTES) throw new Error("Worker response exceeds limit");
  await writeFile(join(directory, `${name}.tmp`), bytes, { mode: 0o600 });
  await rename(join(directory, `${name}.tmp`), join(directory, `${name}.json`));
}
async function execute(filename: string) {
  const input = CloudReplRequest.parse(
    await boundedJson(join(directory, filename.replace(/\.ready\.accepted$/, ".payload"))),
  );
  if (active) {
    await publish(`result-${input.id}`, { error: "A cloud REPL cell is already executing." });
    return;
  }
  active = true;
  const controller = new AbortController();
  let sequence = 0;
  const cancelled = setInterval(() => {
    void open(
      join(directory, `cancel-${input.id}`),
      constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
    )
      .then(async (handle) => {
        try {
          if ((await handle.stat()).isFile()) controller.abort();
        } finally {
          await handle.close();
        }
      })
      .catch(() => {});
  }, 100);
  const rpc = async (method: keyof typeof CloudReplCalls, args: unknown[]) => {
    const current = sequence++;
    CloudReplCalls[method].parse(args);
    await publish(`rpc-${input.id}-${current}`, { id: input.id, sequence: current, method, args });
    const expires = Date.now() + 120000;
    while (!controller.signal.aborted && Date.now() < expires) {
      try {
        const marker = await open(
          join(directory, `reply-${input.id}-${current}.ready`),
          constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
        );
        try {
          if (!(await marker.stat()).isFile()) throw new Error("Invalid reply marker");
        } finally {
          await marker.close();
        }
        const response = (await boundedJson(join(directory, `reply-${input.id}-${current}.payload`))) as {
          value?: unknown;
          error?: string;
        };
        await unlink(join(directory, `reply-${input.id}-${current}.ready`));
        if (response.error) throw new Error(response.error);
        return response.value;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      await delay(50);
    }
    throw new Error("Original callback cancelled or expired");
  };
  const functions = Object.fromEntries(
    Object.keys(CloudReplCalls).map((method) => [
      method,
      (...args: unknown[]) => rpc(method as keyof typeof CloudReplCalls, args),
    ]),
  );
  // Arguments and host responses are validated on both sides; this cast binds the fixed public dispatch surface.
  const deps = { ...functions, runId: input.runId, signal: controller.signal } as unknown as ReplHostDeps;
  try {
    await publish(`result-${input.id}`, {
      value: await pool.eval(deps, input.code, { pageId: input.pageId, deadlineMs: input.deadlineMs }),
    });
  } catch (error) {
    await publish(`result-${input.id}`, {
      error: error instanceof Error ? error.message : "Cloud REPL failed",
    });
  } finally {
    clearInterval(cancelled);
    active = false;
  }
}
for (;;) {
  const files = await readdir(directory);
  for (const file of files)
    if (/^request-[a-f0-9-]{36}\.ready$/.test(file)) {
      await rename(join(directory, file), join(directory, `${file}.accepted`));
      void execute(`${file}.accepted`).catch(() => {
        process.exitCode = 1;
      });
    }
  await delay(50);
}
