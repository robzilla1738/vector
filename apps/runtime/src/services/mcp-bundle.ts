import { createWriteStream } from "node:fs";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, sep } from "node:path";
import { Transform, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import JSZip, { type JSZipObject } from "jszip";
import { AuxError } from "@aux/contracts";

const MAX_ARCHIVE_BYTES = 20_000_000;
const MAX_UNPACKED_BYTES = 50_000_000;
const MAX_FILE_BYTES = 15_000_000;

function safeEntry(name: string): boolean {
  const path = name.endsWith("/") ? name.slice(0, -1) : name;
  return (
    path.length > 0 &&
    name.length <= 1024 &&
    !name.includes("\\") &&
    !name.includes("\0") &&
    !isAbsolute(name) &&
    !path.split("/").some((part) => part === ".." || part === "." || part === "")
  );
}

async function limitedBytes(entry: JSZipObject, limit: number): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  await pipeline(
    entry.nodeStream("nodebuffer"),
    new Writable({
      write(chunk: Buffer, _encoding, done) {
        size += chunk.length;
        if (size > limit) done(new AuxError("invalid_params", "MCP bundle entry exceeds the size limit."));
        else {
          chunks.push(chunk);
          done();
        }
      },
    }),
  );
  return Buffer.concat(chunks);
}

export async function inspectMcpBundle(bytes: Buffer): Promise<{
  name: string;
  server: Record<string, unknown>;
  entryPoint: string;
  launchArgs: string[];
  archive: JSZip;
}> {
  if (bytes.length > MAX_ARCHIVE_BYTES) throw new AuxError("invalid_params", "MCP bundle exceeds 20 MB.");
  let archive: JSZip;
  try {
    archive = await JSZip.loadAsync(bytes);
  } catch {
    throw new AuxError("invalid_params", "MCP bundle is not a valid ZIP archive.");
  }
  const entries = Object.values(archive.files);
  if (entries.length > 256 || entries.some((entry) => !safeEntry(entry.unsafeOriginalName ?? entry.name)))
    throw new AuxError("invalid_params", "MCP bundle contains an unsafe path or too many files.");
  const manifestEntry = archive.file("manifest.json");
  if (!manifestEntry) throw new AuxError("invalid_params", "MCP bundle has no manifest.json.");
  let manifest: Record<string, unknown>;
  try {
    manifest = JSON.parse((await limitedBytes(manifestEntry, 131_072)).toString("utf8"));
  } catch {
    throw new AuxError("invalid_params", "MCP bundle manifest is invalid or too large.");
  }
  if (
    !manifest ||
    typeof manifest !== "object" ||
    Array.isArray(manifest) ||
    typeof manifest.name !== "string" ||
    !manifest.name.trim() ||
    !manifest.server ||
    typeof manifest.server !== "object" ||
    Array.isArray(manifest.server)
  )
    throw new AuxError("invalid_params", "MCP bundle manifest is incomplete.");
  const server = manifest.server as Record<string, unknown>;
  const entryPoint = server.entry_point;
  if (
    server.type !== "node" ||
    typeof entryPoint !== "string" ||
    !safeEntry(entryPoint) ||
    !archive.file(entryPoint)
  )
    throw new AuxError(
      "capability_unsupported",
      "This MCP bundle needs a self-contained Node.js entry point.",
    );
  const userConfig = manifest.user_config;
  if (
    userConfig !== undefined &&
    (typeof userConfig !== "object" ||
      !userConfig ||
      Array.isArray(userConfig) ||
      Object.keys(userConfig).length > 0)
  )
    throw new AuxError("capability_unsupported", "MCP bundle user configuration is not supported yet.");
  const compatibility = manifest.compatibility;
  if (compatibility !== undefined) {
    if (typeof compatibility !== "object" || !compatibility || Array.isArray(compatibility))
      throw new AuxError("invalid_params", "MCP bundle compatibility must be an object.");
    const platforms = (compatibility as Record<string, unknown>).platforms;
    if (platforms !== undefined && (!Array.isArray(platforms) || !platforms.includes(process.platform)))
      throw new AuxError("capability_unsupported", "This MCP bundle does not support this platform.");
  }
  const rawConfig = server.mcp_config;
  if (rawConfig !== undefined && (typeof rawConfig !== "object" || !rawConfig || Array.isArray(rawConfig)))
    throw new AuxError("invalid_params", "MCP bundle launch configuration must be an object.");
  const config = rawConfig as Record<string, unknown> | undefined;
  if (
    (config?.command !== undefined && config.command !== "node") ||
    config?.platform_overrides !== undefined ||
    (config?.env !== undefined &&
      (typeof config.env !== "object" ||
        !config.env ||
        Array.isArray(config.env) ||
        Object.keys(config.env).length > 0))
  )
    throw new AuxError(
      "capability_unsupported",
      "MCP bundle custom commands and environment are not supported yet.",
    );
  const configuredArgs = config?.args ?? [entryPoint];
  if (
    !Array.isArray(configuredArgs) ||
    configuredArgs.length < 1 ||
    configuredArgs.length > 32 ||
    configuredArgs.some((value) => typeof value !== "string" || value.length > 4096 || /[\0\r\n]/.test(value))
  )
    throw new AuxError("invalid_params", "MCP bundle arguments are invalid.");
  if (configuredArgs[0] !== entryPoint && configuredArgs[0] !== "${__dirname}/" + entryPoint)
    throw new AuxError("capability_unsupported", "MCP bundle must launch its reviewed entry point first.");
  const launchArgs = configuredArgs.slice(1).map((value) => {
    if (value.startsWith("${__dirname}/")) {
      const referenced = value.slice("${__dirname}/".length);
      if (!safeEntry(referenced) || !archive.file(referenced))
        throw new AuxError("invalid_params", "MCP bundle argument references a missing or unsafe file.");
      return value;
    }
    if (value.includes("${") || isAbsolute(value) || value.startsWith("../"))
      throw new AuxError(
        "capability_unsupported",
        "MCP bundle argument requires unsupported host substitution.",
      );
    return value;
  });
  return { name: manifest.name.slice(0, 200), server, entryPoint, launchArgs, archive };
}

export async function extractMcpBundle(bytes: Buffer): Promise<{
  directory: string;
  entryPath: string;
  args: string[];
}> {
  const inspected = await inspectMcpBundle(bytes);
  const directory = await mkdtemp(join(tmpdir(), "aux-mcp-bundle-"));
  let total = 0;
  try {
    for (const entry of Object.values(inspected.archive.files)) {
      const target = join(directory, entry.name);
      if (entry.dir) {
        await mkdir(target, { recursive: true, mode: 0o700 });
        continue;
      }
      await mkdir(join(target, ".."), { recursive: true, mode: 0o700 });
      let fileSize = 0;
      const limit = new Transform({
        transform(chunk: Buffer, _encoding, done) {
          fileSize += chunk.length;
          total += chunk.length;
          done(
            fileSize > MAX_FILE_BYTES || total > MAX_UNPACKED_BYTES
              ? new AuxError("invalid_params", "MCP bundle expands beyond the size limit.")
              : null,
            chunk,
          );
        },
      });
      await pipeline(
        entry.nodeStream("nodebuffer"),
        limit,
        createWriteStream(target, { flags: "wx", mode: 0o600 }),
      );
    }
    const entryPath = join(directory, inspected.entryPoint);
    if (!entryPath.startsWith(directory + sep))
      throw new AuxError("invalid_params", "MCP bundle entry point leaves its install directory.");
    const args = [
      entryPath,
      ...inspected.launchArgs.map((value) =>
        value.startsWith("${__dirname}/") ? join(directory, value.slice("${__dirname}/".length)) : value,
      ),
    ];
    return { directory, entryPath, args };
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
}
