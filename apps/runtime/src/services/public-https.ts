import { request } from "node:https";
import { resolveNetworkAddress } from "./public-network.js";

export interface PublicTextResponse {
  status: number;
  etag?: string;
  text: string;
}
/** No redirects or credentials; the socket is pinned to the vetted DNS answer. */
export async function publicHttpsText(
  url: URL,
  options: { maxBytes: number; signal?: AbortSignal; etag?: string },
): Promise<PublicTextResponse> {
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hash ||
    !Number.isSafeInteger(options.maxBytes) ||
    options.maxBytes < 1
  )
    throw new Error("Public text requests require an exact HTTPS URL and a byte limit.");
  options.signal?.throwIfAborted();
  // DNS promises are not cancelable. Retire the caller immediately on abort;
  // the eventual lookup result is discarded and can never open a socket.
  const chosen = await new Promise<Awaited<ReturnType<typeof resolveNetworkAddress>>>((resolve, reject) => {
    const abort = () => reject(options.signal!.reason);
    options.signal?.addEventListener("abort", abort, { once: true });
    resolveNetworkAddress(url.hostname)
      .then(resolve, reject)
      .finally(() => options.signal?.removeEventListener("abort", abort));
    if (options.signal?.aborted) abort();
  });
  options.signal?.throwIfAborted();
  return new Promise((resolve, reject) => {
    const transport = request(
      url,
      {
        method: "GET",
        agent: false,
        // Pin the vetted singleton family so Node requests the single-address lookup contract.
        family: chosen.family,
        signal: options.signal,
        headers: {
          "Accept-Encoding": "identity",
          ...(options.etag ? { "If-None-Match": options.etag.slice(0, 512) } : {}),
        },
        lookup: (_hostname, _options, callback) => callback(null, chosen.address, chosen.family),
      },
      (response) => {
        const status = response.statusCode ?? 0;
        if (status !== 200) {
          // The owner separately rejects redirects/failed responses. Do not drain
          // arbitrary error bodies or follow a redirect into a different origin.
          response.destroy();
          resolve({ status, etag: response.headers.etag?.slice(0, 512), text: "" });
          return;
        }
        const declared = Number(response.headers["content-length"]);
        if (Number.isFinite(declared) && declared > options.maxBytes) {
          response.destroy();
          reject(new Error("The filter list is too large."));
          return;
        }
        if (response.headers["content-encoding"] && response.headers["content-encoding"] !== "identity") {
          response.destroy();
          reject(new Error("Public text transport requires an uncompressed response."));
          return;
        }
        const decoder = new TextDecoder("utf-8", { fatal: true });
        let bytes = 0,
          text = "";
        response.on("error", reject);
        response.on("aborted", () => reject(new Error("The public HTTPS response was interrupted.")));
        response.on("data", (part: Buffer) => {
          bytes += part.byteLength;
          try {
            if (bytes > options.maxBytes) throw new Error("The filter list is too large.");
            text += decoder.decode(part, { stream: true });
          } catch (error) {
            response.destroy();
            reject(error);
          }
        });
        response.on("end", () => {
          try {
            text += decoder.decode();
            resolve({ status, etag: response.headers.etag?.slice(0, 512), text });
          } catch (error) {
            reject(error);
          }
        });
      },
    );
    transport.on("error", reject);
    transport.end();
  });
}
