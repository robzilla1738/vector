import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface RuntimeDescriptor {
  port: number;
  token: string;
  pid: number;
}

export function descriptorPath(): string {
  const dir = process.env.VECTOR_DATA_DIR ?? join(homedir(), "Library", "Application Support", "Vector");
  return join(dir, "runtime.json");
}

export function readDescriptor(): RuntimeDescriptor {
  const p = process.env.VECTOR_RUNTIME_FILE ?? descriptorPath();
  if (!existsSync(p)) {
    throw new Error(
      `No running Vector runtime found (looked for ${p}). Start the desktop app or run \`vector-runtime\` first.`,
    );
  }
  return JSON.parse(readFileSync(p, "utf8")) as RuntimeDescriptor;
}

export async function rpc<T = unknown>(method: string, params: unknown = {}): Promise<T> {
  const { port, token } = readDescriptor();
  const res = await fetch(`http://127.0.0.1:${port}/rpc`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ method, params }),
    signal: AbortSignal.timeout(120_000),
  });
  const body = (await res.json()) as { result?: T; error?: { code: string; message: string; detail?: unknown } };
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${body.error?.message ?? res.statusText}`);
  if (body.error) {
    const err = new Error(body.error.message) as Error & { code: string; detail?: unknown };
    err.code = body.error.code;
    err.detail = body.error.detail;
    throw err;
  }
  return body.result as T;
}

export async function* events(lastSeq = 0): AsyncGenerator<{ seq: number; type: string; payload: unknown; ts: number; runId?: string }> {
  let seq = lastSeq;
  for (;;) {
    try {
      const r = await rpc<{ events: { seq: number; type: string; payload: unknown; ts: number; runId?: string }[]; lastSeq: number }>(
        "events.since",
        { sinceSeq: seq, limit: 500 },
      );
      for (const e of r.events) yield e;
      seq = r.lastSeq;
    } catch {
      // runtime may be restarting — back off and retry
      await new Promise((r) => setTimeout(r, 1000));
    }
    await new Promise((r) => setTimeout(r, 400));
  }
}
