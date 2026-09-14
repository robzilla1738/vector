import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export function readDescriptor(): { port: number; token: string; pid: number } {
  const dir = process.env.VECTOR_DATA_DIR ?? join(homedir(), "Library", "Application Support", "Vector");
  const p = process.env.VECTOR_RUNTIME_FILE ?? join(dir, "runtime.json");
  if (!existsSync(p)) throw new Error("Vector runtime is not running — start the Vector app first.");
  return JSON.parse(readFileSync(p, "utf8"));
}

export async function rpc<T = unknown>(method: string, params: unknown = {}): Promise<T> {
  const { port, token } = readDescriptor();
  const res = await fetch(`http://127.0.0.1:${port}/rpc`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ method, params }),
    signal: AbortSignal.timeout(120_000),
  });
  const body = (await res.json()) as { result?: T; error?: { code: string; message: string } };
  if (body.error) throw new Error(`${body.error.code}: ${body.error.message}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return body.result as T;
}
