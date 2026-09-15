import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface RuntimeDescriptor {
  port: number;
  token: string;
  pid: number;
}

export function readDescriptor(): RuntimeDescriptor {
  const dir = process.env.VECTOR_DATA_DIR ?? join(homedir(), "Library", "Application Support", "Vector");
  const p = process.env.VECTOR_RUNTIME_FILE ?? join(dir, "runtime.json");
  if (!existsSync(p)) throw new Error("Vector runtime is not running — start the Vector app first.");
  return JSON.parse(readFileSync(p, "utf8")) as RuntimeDescriptor;
}

/**
 * runtime.json is read once and cached — it only changes when the runtime
 * restarts on a new port, which surfaces as a connection failure. On that
 * failure the descriptor is re-read and the call retried once.
 */
let cached: RuntimeDescriptor | null = null;

function descriptor(fresh = false): RuntimeDescriptor {
  if (fresh || !cached) cached = readDescriptor();
  return cached;
}

/** For tests / diagnostics — drop the cached descriptor. */
export function resetDescriptorCache() {
  cached = null;
}

async function post(d: RuntimeDescriptor, method: string, params: unknown): Promise<Response> {
  return fetch(`http://127.0.0.1:${d.port}/rpc`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${d.token}` },
    body: JSON.stringify({ method, params }),
    signal: AbortSignal.timeout(120_000),
  });
}

export async function rpc<T = unknown>(method: string, params: unknown = {}): Promise<T> {
  let res: Response;
  try {
    res = await post(descriptor(), method, params);
  } catch (e) {
    // connection-level failure (ECONNREFUSED / reset): the runtime may have
    // restarted on another port — re-read the descriptor and retry once
    if (e instanceof Error && e.name === "TimeoutError") throw e;
    res = await post(descriptor(true), method, params);
  }
  const body = (await res.json()) as { result?: T; error?: { code: string; message: string } };
  if (body.error) throw new Error(`${body.error.code}: ${body.error.message}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return body.result as T;
}
