import { packagedNodeBootstrap } from "./packaged-node.js";
import { jsonDigest as digest, digest as bytesDigest } from "@aux/contracts/util/digest";
import { access, realpath, rm, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { isIP } from "node:net";
import { dirname, isAbsolute, relative, sep } from "node:path";
import { StreamableHTTPClientTransport, type Transport } from "@modelcontextprotocol/client";
import { DEFAULT_INHERITED_ENV_VARS, StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { AuxError, type OutboundMcpServer } from "@aux/contracts";
import type { McpTransportProvider } from "./outbound-mcp.js";
import { extractMcpBundle } from "./mcp-bundle.js";

const forbiddenHost = (hostname: string) => {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return (
    isIP(host) !== 0 ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  );
};

// This profile grants only process execution and reads of macOS runtime files,
// the reviewed working directory, and the executable's installation. Network
// and file writes remain denied by default. Values are passed as sandbox
// parameters, never interpolated into the policy language.
const localSeatbelt = (parentCount: number, bootstrapCount: number) => `(version 1)
(deny default)
(allow process*)
(allow sysctl-read)
(allow file-read* (literal "/")
  (subpath "/usr") (subpath "/bin") (subpath "/System")
  (subpath "/Library") (subpath "/dev") (subpath "/private/etc")
  (subpath "/opt/homebrew")
  ${Array.from({ length: parentCount }, (_, index) => `(literal (param "MCP_PARENT_${index}"))`).join(" ")}
  ${Array.from({ length: bootstrapCount }, (_, index) => `(literal (param "MCP_BOOTSTRAP_${index}"))`).join(" ")}
  (subpath (param "MCP_WORKDIR")) (subpath (param "MCP_COMMAND_DIR")))`;

function pathParents(path: string): string[] {
  const parents: string[] = [];
  for (let parent = dirname(path); parent !== "/"; parent = dirname(parent)) parents.push(parent);
  return parents;
}

async function sandboxedStdio(
  source: { command: string; args: string[]; cwd: string },
  signal: AbortSignal,
  bootstrapFiles: readonly string[] = [],
): Promise<Transport> {
  if (process.platform !== "darwin")
    throw new AuxError("backend_unavailable", "Sandboxed local MCP launch requires macOS.");
  const { command, args, cwd } = source;
  if (!isAbsolute(command) || !isAbsolute(cwd))
    throw new AuxError("invalid_params", "MCP executable and working directory must be absolute paths.");
  const [resolvedCommand, resolvedCwd] = await Promise.all([realpath(command), realpath(cwd)]);
  const [commandInfo, cwdInfo] = await Promise.all([stat(resolvedCommand), stat(resolvedCwd)]);
  if (
    !commandInfo.isFile() ||
    !cwdInfo.isDirectory() ||
    resolvedCwd === "/" ||
    dirname(resolvedCommand) === "/"
  )
    throw new AuxError(
      "permission_denied",
      "MCP requires an executable file and a bounded working directory.",
    );
  await access(resolvedCommand, constants.X_OK);
  if (signal.aborted) throw new AuxError("cancelled", "MCP connection was cancelled.");
  const launchArgs = await Promise.all(
    args.map(async (arg) => {
      if (!isAbsolute(arg)) return arg;
      try {
        const resolved = await realpath(arg);
        const inside = relative(resolvedCwd, resolved);
        return inside === "" || (inside !== ".." && !inside.startsWith(`..${sep}`) && !isAbsolute(inside))
          ? resolved
          : arg;
      } catch {
        return arg;
      }
    }),
  );
  const parents = [...new Set([...pathParents(resolvedCwd), ...pathParents(resolvedCommand), ...bootstrapFiles.flatMap(pathParents)])];
  if (parents.length > 64)
    throw new AuxError("permission_denied", "MCP path nesting exceeds the sandbox limit.");
  // The SDK merges getDefaultEnvironment() under this object. Undefined replaces
  // HOME/PATH/USER so Node omits them instead of inheriting the host environment.
  // The transport type only admits strings; the undefined values are intentional.
  const launchEnvironment = Object.fromEntries(
    DEFAULT_INHERITED_ENV_VARS.map((key) => [key, undefined]),
  ) as unknown as Record<string, string>;
  const transport = new StdioClientTransport({
    command: "/usr/bin/sandbox-exec",
    args: [
      "-D",
      `MCP_WORKDIR=${resolvedCwd}`,
      "-D",
      `MCP_COMMAND_DIR=${dirname(resolvedCommand)}`,
      ...parents.flatMap((parent, index) => ["-D", `MCP_PARENT_${index}=${parent}`]),
      ...bootstrapFiles.flatMap((file, index) => ["-D", `MCP_BOOTSTRAP_${index}=${file}`]),
      "-p",
      localSeatbelt(parents.length, bootstrapFiles.length),
      resolvedCommand,
      ...launchArgs,
    ],
    cwd: resolvedCwd,
    env: launchEnvironment,
    stderr: "ignore",
    maxBufferSize: 1_000_000,
  });
  signal.addEventListener(
    "abort",
    () => {
      void transport.close();
    },
    { once: true },
  );
  return transport;
}

/** Real MCP transports behind reviewed source identity. */
export function createMcpTransportProvider(
  oauth?: {
    token(
      server: OutboundMcpServer & { source: { kind: "remote"; url: string; auth: "oauth" } },
    ): Promise<string>;
  },
  networkFetch: typeof fetch = fetch,
): McpTransportProvider {
  return async (server: OutboundMcpServer, signal: AbortSignal, bundleBytes?: Buffer): Promise<Transport> => {
    if (signal.aborted) throw new AuxError("cancelled", "MCP connection was cancelled.");
    if (server.state !== "active" || digest(server.source) !== server.sourceDigest)
      throw new AuxError("permission_denied", "MCP server source is not approved.");
    if (server.source.kind === "remote") {
      const url = new URL(server.source.url);
      if (url.protocol !== "https:" || url.username || url.password || forbiddenHost(url.hostname))
        throw new AuxError("permission_denied", "MCP endpoint must be a reviewed public HTTPS host.");
      const reviewedOrigin = url.origin;
      const exactOriginFetch: typeof fetch = (input, init) => {
        const requestUrl = new URL(input instanceof Request ? input.url : String(input));
        if (
          requestUrl.protocol !== "https:" ||
          requestUrl.origin !== reviewedOrigin ||
          requestUrl.username ||
          requestUrl.password ||
          signal.aborted
        )
          throw new AuxError("permission_denied", "MCP request left the reviewed HTTPS origin.");
        const requestSignals = [
          signal,
          init?.signal,
          input instanceof Request ? input.signal : undefined,
        ].filter((value): value is AbortSignal => !!value);
        return networkFetch(input, { ...init, redirect: "error", signal: AbortSignal.any(requestSignals) });
      };
      const authProvider =
        server.source.auth === "oauth"
          ? {
              token: async () => {
                if (!oauth)
                  throw new AuxError("backend_unavailable", "MCP OAuth is unavailable in this host.");
                if (signal.aborted) throw new AuxError("cancelled", "MCP connection was cancelled.");
                return oauth.token(
                  server as OutboundMcpServer & { source: { kind: "remote"; url: string; auth: "oauth" } },
                );
              },
            }
          : undefined;
      const transport = new StreamableHTTPClientTransport(url, {
        fetch: exactOriginFetch,
        authProvider,
        onInsufficientScope: "throw",
        reconnectionOptions: {
          maxReconnectionDelay: 0,
          initialReconnectionDelay: 0,
          reconnectionDelayGrowFactor: 1,
          maxRetries: 0,
        },
      });
      signal.addEventListener(
        "abort",
        () => {
          void transport.close();
        },
        { once: true },
      );
      return transport;
    }
    if (server.source.kind === "local") return sandboxedStdio(server.source, signal);
    if (!bundleBytes || bundleBytes.length > 20_000_000 || bytesDigest(bundleBytes) !== server.source.sha256)
      throw new AuxError("conflict", "Installed MCP bundle is missing or changed since approval.");
    const extracted = await extractMcpBundle(bundleBytes);
    try {
      const nodeBootstrap = packagedNodeBootstrap();
      const transport = await sandboxedStdio(
        { command: process.execPath, args: [...nodeBootstrap.args, ...extracted.args], cwd: extracted.directory },
        signal,
        nodeBootstrap.files,
      );
      const close = transport.close.bind(transport);
      transport.close = async () => {
        try {
          await close();
        } finally {
          await rm(extracted.directory, { recursive: true, force: true });
        }
      };
      return transport;
    } catch (error) {
      await rm(extracted.directory, { recursive: true, force: true });
      throw error;
    }
  };
}
