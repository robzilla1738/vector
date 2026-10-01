import { AuxError } from "@aux/contracts";
import { agentMayEgress } from "../agent/policy.js";

/** Every hop uses the saved source's explicit host grant; redirects cannot expand it. */
export async function liveFolderFetch(url: string, allowedHosts: readonly string[], options: {
  fetch?: typeof fetch; headers?: Record<string, string>; signal?: AbortSignal;
} = {}): Promise<string> {
  const signal = AbortSignal.any([AbortSignal.timeout(15_000), ...(options.signal ? [options.signal] : [])]);
  const initial = new URL(url);
  const authenticated = new Headers(options.headers).has("authorization");
  const initialProtocol = initial.protocol;
  let current = url;
  for (let hop = 0; hop <= 5; hop++) {
    const parsed = new URL(current);
    if ((authenticated && parsed.origin !== initial.origin) || !/^https?:$/.test(parsed.protocol) || (initialProtocol === "https:" && parsed.protocol !== "https:") || parsed.username || parsed.password ||
      !agentMayEgress(current, [...allowedHosts])) throw new AuxError("permission_denied", "This source cannot connect to that host.");
    const response = await (options.fetch ?? fetch)(current, { signal, redirect: "manual", credentials: "omit", headers: options.headers });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location || hop === 5) throw new AuxError("backend_unavailable", "This source returned too many redirects.");
      current = new URL(location, current).href;
      continue;
    }
    if (!response.ok) { await response.body?.cancel(); throw new AuxError("backend_unavailable", `This source returned HTTP ${response.status}.`); }
    const reader = response.body?.getReader();
    if (!reader) throw new AuxError("backend_unavailable", "This source returned no data.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 1_000_000) throw new AuxError("backend_unavailable", "This source exceeds the 1 MB limit.");
        chunks.push(value);
      }
      return new TextDecoder().decode(Buffer.concat(chunks));
    } finally { await reader.cancel().catch(() => undefined); }
  }
  throw new AuxError("backend_unavailable", "This source could not be loaded.");
}
