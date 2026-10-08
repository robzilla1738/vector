import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import { isPublicNetworkAddress, resolveNetworkAddress } from "../services/public-network.js";
import { AuxError } from "@aux/contracts";

const MAX_BYTES = 1_000_000;
const REQUEST_DEADLINE_MS = 30_000;

export type WebPage = {
  url: string;
  title: string;
  text: string;
  links: { title: string; url: string }[];
  contentType: string;
};
export type WebTransport = (
  url: URL,
  allowPrivateNetwork: boolean,
  signal?: AbortSignal,
) => Promise<{ status: number; location?: string; contentType: string; body: string }>;

export function permittedWebUrl(raw: string, allowPrivateNetwork = false): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new AuxError("invalid_params", "Use an absolute web URL.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password)
    throw new AuxError("invalid_params", "Web tools accept only HTTP(S) URLs without embedded credentials.");
  const literal = url.hostname.replace(/^\[|\]$/g, "");
  if (
    !allowPrivateNetwork &&
    (literal === "localhost" ||
      literal.endsWith(".localhost") ||
      (isIP(literal) && !isPublicNetworkAddress(literal)))
  )
    throw new AuxError("permission_denied", "Web tools cannot contact a private or local network address.");
  url.hash = "";
  return url;
}

/** DNS is pinned to a vetted address for each connection; redirects are checked independently. */
export const nodeWebTransport: WebTransport = async (
  url,
  allowPrivateNetwork,
  signal = AbortSignal.timeout(REQUEST_DEADLINE_MS),
) => {
  signal.throwIfAborted();
  // DNS lookup itself cannot be cancelled. Its retired result must never open a socket.
  const chosen = await new Promise<Awaited<ReturnType<typeof resolveNetworkAddress>>>((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener("abort", abort, { once: true });
    resolveNetworkAddress(url.hostname, allowPrivateNetwork)
      .then(resolve, reject)
      .finally(() => signal.removeEventListener("abort", abort));
    if (signal.aborted) abort();
  });
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const request = (url.protocol === "https:" ? httpsRequest : httpRequest)(
      url,
      {
        method: "GET",
        timeout: 15_000,
        signal,
        family: chosen.family,
        headers: {
          "User-Agent": "AuxBrowser/1.0",
          Accept: "text/html,text/plain,application/json,application/xml",
          "Accept-Encoding": "identity",
        },
        lookup: (_host, _options, callback) => callback(null, chosen.address, chosen.family),
      },
      (response) => {
        response.on("error", (error) => reject(signal.aborted ? signal.reason : error));
        const status = response.statusCode ?? 0;
        const contentType = String(response.headers["content-type"] ?? "").toLowerCase();
        const location = response.headers.location;
        if (status >= 300 && status < 400) {
          response.destroy();
          resolve({ status, location, contentType, body: "" });
          return;
        }
        if (!/^(text\/|application\/(json|xml|xhtml\+xml))/.test(contentType)) {
          response.destroy();
          reject(
            new AuxError("capability_unsupported", "Web fetch accepts text, HTML, JSON and XML responses."),
          );
          return;
        }
        const parts: Buffer[] = [];
        let bytes = 0;
        response.on("data", (part: Buffer) => {
          if (signal.aborted) return;
          bytes += part.length;
          if (bytes > MAX_BYTES) {
            request.destroy(new AuxError("invalid_params", "Web response exceeds the 1 MB limit."));
            return;
          }
          parts.push(part);
        });
        response.on("end", () => {
          if (signal.aborted) reject(signal.reason);
          else resolve({ status, contentType, body: Buffer.concat(parts).toString("utf8") });
        });
      },
    );
    request.on("timeout", () =>
      request.destroy(new AuxError("backend_unavailable", "Web request timed out.")),
    );
    request.on("error", (error) => reject(signal.aborted ? signal.reason : error));
    request.end();
  });
};

type HtmlNode = {
  nodeName?: string;
  value?: string;
  attrs?: { name: string; value: string }[];
  childNodes?: HtmlNode[];
};
async function pageFromHtml(url: URL, html: string, contentType: string): Promise<WebPage> {
  if (!contentType.includes("html"))
    return { url: url.href, title: url.hostname, text: html.slice(0, MAX_BYTES), links: [], contentType };
  const { parse } = await import("parse5");
  const root = parse(html) as HtmlNode;
  const links: { title: string; url: string }[] = [];
  const text: string[] = [];
  let title = "";
  const read = (node: HtmlNode): string => {
    if (["script", "style", "svg", "noscript"].includes(node.nodeName ?? "")) return "";
    if (node.nodeName === "#text") return node.value ?? "";
    const content = (node.childNodes ?? []).map(read).join(" ").replace(/\s+/g, " ").trim();
    if (node.nodeName === "title") title = content;
    if (node.nodeName === "a") {
      const href = node.attrs?.find((attr) => attr.name === "href")?.value;
      if (href && content) {
        try {
          let target = new URL(href, url);
          const redirected = target.searchParams.get("uddg");
          if (redirected) target = new URL(redirected);
          if (["http:", "https:"].includes(target.protocol))
            links.push({ title: content.slice(0, 300), url: target.href });
        } catch {
          /* ignore malformed site links */
        }
      }
    }
    if (["h1", "h2", "h3", "p", "li", "td", "th", "pre"].includes(node.nodeName ?? "") && content)
      text.push(content);
    return content;
  };
  read(root);
  return {
    url: url.href,
    title: title || url.hostname,
    text: [...new Set(text)].join("\n").slice(0, 32_000),
    links: links.slice(0, 100),
    contentType,
  };
}

export class AgentWebTools {
  constructor(
    private allowOrigin: (url: URL) => boolean | Promise<boolean>,
    private transport: WebTransport = nodeWebTransport,
    private allowPrivateNetwork = false,
  ) {}
  async fetch(rawUrl: string, originalSignal?: AbortSignal): Promise<WebPage> {
    const deadline = AbortSignal.timeout(REQUEST_DEADLINE_MS);
    const signal = originalSignal ? AbortSignal.any([originalSignal, deadline]) : deadline;
    signal.throwIfAborted();
    let url = permittedWebUrl(rawUrl, this.allowPrivateNetwork);
    for (let redirects = 0; redirects <= 3; redirects++) {
      signal.throwIfAborted();
      if (!(await this.allowOrigin(url)))
        throw new AuxError("permission_denied", `Web egress is not granted for ${url.origin}.`);
      signal.throwIfAborted();
      const response = await this.transport(url, this.allowPrivateNetwork, signal);
      signal.throwIfAborted();
      if (response.status >= 300 && response.status < 400) {
        if (!response.location || redirects === 3)
          throw new AuxError("conflict", "Web redirect limit exceeded.");
        url = permittedWebUrl(new URL(response.location, url).href, this.allowPrivateNetwork);
        continue;
      }
      if (response.status < 200 || response.status >= 300)
        throw new AuxError("backend_unavailable", `Web request returned HTTP ${response.status}.`);
      const page = await pageFromHtml(url, response.body, response.contentType);
      signal.throwIfAborted();
      return page;
    }
    throw new AuxError("conflict", "Web redirect limit exceeded.");
  }
  async search(query: string, template: string, signal?: AbortSignal): Promise<WebPage> {
    if (!template.includes("%s"))
      throw new AuxError("invalid_params", "Search engine template is missing %s.");
    return this.fetch(template.replaceAll("%s", encodeURIComponent(query)), signal);
  }
}
