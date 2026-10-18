import { request } from "node:https";
import { AuxError } from "@aux/contracts";
import { resolveNetworkAddress } from "./public-network.js";
import { permittedWebUrl } from "../agent/web-tools.js";
import { CONNECTOR_UPLOAD_MAX_BYTES } from "./connector-upload-sources.js";

export type ConnectorUploadInstruction = {
  url: string;
  headers: Record<string, string>;
  encoding: { kind: "raw" } | { kind: "multipart"; field: string; boundary: string };
};
export type ConnectorUploadRequest = { url: URL; headers: Record<string, string>; body: Buffer };
export type ConnectorUploadResponse = { status: number; body: string };
export type ConnectorUploadSender = (
  input: ConnectorUploadRequest,
  signal: AbortSignal,
  checkCurrent: () => void,
  beforeDispatch: () => void,
) => Promise<ConnectorUploadResponse>;
const MAX_RESPONSE_BYTES = 64 * 1024;

/** Signed upload credentials are taken only from the sealed provider result, never from model parameters. */
export function prepareConnectorUpload(
  instruction: ConnectorUploadInstruction,
  bytes: Buffer,
  source: { filename: string; mediaType: string },
): ConnectorUploadRequest {
  const url = permittedWebUrl(instruction.url);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hash ||
    (url.port && url.port !== "443")
  )
    throw new AuxError("permission_denied", "Upload instructions require an exact HTTPS destination.");
  if (bytes.length < 1 || bytes.length > CONNECTOR_UPLOAD_MAX_BYTES)
    throw new AuxError("invalid_params", "Connector uploads are bounded to 20 MiB.");
  if (
    !source.filename ||
    source.filename.length > 180 ||
    /[\r\n\0"\\/]/u.test(source.filename) ||
    !/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/i.test(source.mediaType)
  )
    throw new AuxError("invalid_params", "The sealed upload filename or MIME is invalid.");
  const headers: Record<string, string> = {};
  if (
    Object.keys(instruction.headers).length > 20 ||
    Buffer.byteLength(JSON.stringify(instruction.headers)) > 16_384
  )
    throw new AuxError("invalid_params", "The upload headers exceed their bounded allowance.");
  for (const [key, value] of Object.entries(instruction.headers)) {
    const name = key.toLowerCase();
    if (
      !/^[a-z0-9!#$%&'*+.^_`|~-]+$/.test(name) ||
      /[\r\n\0]/.test(value) ||
      [
        "host",
        "cookie",
        "connection",
        "content-length",
        "transfer-encoding",
        "proxy-authorization",
        "proxy-connection",
        "upgrade",
      ].includes(name) ||
      name in headers
    )
      throw new AuxError("permission_denied", "The provider returned unsupported upload headers.");
    headers[name] = value;
  }
  let body: Buffer;
  if (instruction.encoding.kind === "multipart") {
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(instruction.encoding.field))
      throw new AuxError("capability_unsupported", "The provider returned an unsupported upload form field.");
    const boundary = instruction.encoding.boundary;
    if (!/^[A-Za-z0-9_-]{24,80}$/.test(boundary) || bytes.includes(Buffer.from(boundary)))
      throw new AuxError("invalid_params", "The sealed upload boundary is invalid.");
    if (headers["content-type"] && !/^multipart\/form-data(?:;|$)/i.test(headers["content-type"]))
      throw new AuxError("capability_unsupported", "The upload headers conflict with multipart encoding.");
    headers["content-type"] = `multipart/form-data; boundary=${boundary}`;
    body = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${instruction.encoding.field}"; filename="${source.filename}"\r\nContent-Type: ${source.mediaType}\r\n\r\n`,
      ),
      bytes,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
  } else {
    headers["content-type"] ??= source.mediaType;
    body = Buffer.from(bytes);
  }
  headers["content-length"] = String(body.length);
  return { url, headers, body };
}

/** The socket uses a vetted DNS answer; no redirect, cookie jar, automatic retry or ambient authorization exists. */
export const sendConnectorUpload: ConnectorUploadSender = async (
  input,
  signal,
  checkCurrent,
  beforeDispatch,
) => {
  signal.throwIfAborted();
  checkCurrent();
  const address = await new Promise<Awaited<ReturnType<typeof resolveNetworkAddress>>>((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener("abort", abort, { once: true });
    resolveNetworkAddress(input.url.hostname)
      .then(resolve, reject)
      .finally(() => signal.removeEventListener("abort", abort));
    if (signal.aborted) abort();
  });
  signal.throwIfAborted();
  checkCurrent();
  return new Promise((resolve, reject) => {
    let requestError: unknown;
    let completed = false;
    let closed = false;
    let requestFinished = false;
    let responseResult: ConnectorUploadResponse | undefined;
    const complete = () => {
      if (completed || requestError || !requestFinished || !responseResult) return;
      try {
        signal.throwIfAborted();
        checkCurrent();
        req.removeListener("drain", write);
        completed = true;
        resolve(responseResult);
      } catch (error) {
        req.destroy(error instanceof Error ? error : new Error("Upload authority retired"));
      }
    };
    checkCurrent();
    beforeDispatch();
    const req = request(
      input.url,
      {
        method: "POST",
        headers: input.headers,
        signal,
        agent: false,
        family: address.family,
        lookup: (_host, _options, callback) => callback(null, address.address, address.family),
      },
      (response) => {
        const chunks: Buffer[] = [];
        let length = 0;
        response.on("error", (error) => req.destroy(error));
        response.on("data", (chunk: Buffer) => {
          length += chunk.length;
          if (length > MAX_RESPONSE_BYTES) {
            req.destroy(new AuxError("backend_unavailable", "The upload response exceeds 64 KiB."));
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () => {
          try {
            signal.throwIfAborted();
            checkCurrent();
            const status = response.statusCode ?? 0;
            if (status < 200 || status >= 300)
              throw new AuxError(
                "backend_unavailable",
                "The original upload endpoint did not acknowledge a supported success response.",
              );
            responseResult = { status, body: Buffer.concat(chunks).toString("utf8") };
            complete();
          } catch (error) {
            req.destroy(error instanceof Error ? error : new Error("Upload authority retired"));
          }
        });
      },
    );
    req.on("error", (error) => {
      requestError = error;
      req.removeListener("drain", write);
    });
    req.on("finish", () => {
      requestFinished = true;
      complete();
    });
    req.on("close", () => {
      closed = true;
      req.removeListener("drain", write);
      if (!completed)
        reject(
          requestError ??
            new AuxError("backend_unavailable", "The original upload connection closed before confirmation."),
        );
    });
    req.setTimeout(30_000, () =>
      req.destroy(new AuxError("backend_unavailable", "The upload request timed out.")),
    );
    let offset = 0;
    const write = () => {
      if (completed || closed || requestError || requestFinished) return;
      try {
        signal.throwIfAborted();
        checkCurrent();
        while (offset < input.body.length) {
          checkCurrent();
          const chunk = input.body.subarray(offset, offset + 256 * 1024);
          offset += chunk.length;
          if (!req.write(chunk)) {
            req.once("drain", write);
            return;
          }
        }
        req.end();
      } catch (error) {
        req.destroy(error instanceof Error ? error : new Error("Upload authority retired"));
      }
    };
    write();
  });
};
