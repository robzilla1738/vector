import { digest } from "@aux/contracts/util/digest";
import { lstat, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { AuxError, type PluginAsset } from "@aux/contracts";

const manifestSchema = z.object({
  name: z.string().trim().min(1).max(200).regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/),
  version: z.string().min(1).max(60).optional(),
  description: z.string().max(2000).optional(),
}).passthrough();

export type ImportedAsset = Pick<PluginAsset, "kind" | "name" | "description" | "content" | "digest">;
export type ImportedPlugin = { format: "claude-code"; name: string; version?: string; description?: string; assets: ImportedAsset[] };

const validName = (name: string) => /^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/.test(name);

async function regularFile(path: string, maxBytes = 64_000): Promise<string> {
  const info = await lstat(path);
  if (!info.isFile() || info.size > maxBytes) throw new AuxError("invalid_params", "Plugin component must be a bounded regular file.");
  return readFile(path, "utf8");
}

async function optionalObject(path: string): Promise<Record<string, unknown> | undefined> {
  try {
    const raw: unknown = JSON.parse(await regularFile(path, 128_000));
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("expected an object");
    return raw as Record<string, unknown>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw new AuxError("invalid_params", `Invalid plugin component ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function frontmatter(markdown: string): { name?: string; description?: string } {
  const lines = markdown.split(/\r?\n/);
  if (lines[0] !== "---") return {};
  const end = lines.indexOf("---", 1);
  if (end < 0 || end > 80) throw new AuxError("invalid_params", "Skill frontmatter is not terminated within 80 lines.");
  const values: Record<string, string> = {};
  for (let i = 1; i < end; i++) {
    const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(lines[i]!);
    if (!match) continue;
    const key = match[1]!;
    let value = match[2]!.trim();
    if (value === "|" || value === ">") {
      const block: string[] = [];
      while (i + 1 < end && /^\s+/.test(lines[i + 1]!)) block.push(lines[++i]!.trim());
      value = block.join(value === "|" ? "\n" : " ");
    }
    values[key] = value.replace(/^(["'])(.*)\1$/, "$2");
  }
  return { name: values.name, description: values.description };
}

/** Parse only the documented component locations. No imported command, hook or server is executed here. */
export async function readClaudePlugin(root: string): Promise<ImportedPlugin> {
  const rootInfo = await lstat(root).catch(() => undefined);
  if (!rootInfo?.isDirectory()) throw new AuxError("invalid_params", "Choose a regular Claude Code plugin directory.");
  const metadataDir = join(root, ".claude-plugin");
  if (!(await lstat(metadataDir).catch(() => undefined))?.isDirectory())
    throw new AuxError("invalid_params", "Claude Code plugins need .claude-plugin/plugin.json.");
  let manifest: z.infer<typeof manifestSchema>;
  try { manifest = manifestSchema.parse(JSON.parse(await regularFile(join(metadataDir, "plugin.json")))); }
  catch (error) { throw new AuxError("invalid_params", `Invalid Claude Code plugin manifest: ${error instanceof Error ? error.message : String(error)}`); }
  const assets: ImportedAsset[] = [];
  const skillsDir = join(root, "skills");
  const skillsInfo = await lstat(skillsDir).catch(() => undefined);
  if (skillsInfo && !skillsInfo.isDirectory()) throw new AuxError("invalid_params", "Plugin skills must be a regular directory.");
  if (skillsInfo) {
    const entries = (await readdir(skillsDir, { withFileTypes: true }))
      .sort((left, right) => left.name.localeCompare(right.name));
    if (entries.length > 64) throw new AuxError("invalid_params", "Plugin has too many skills.");
    for (const entry of entries) {
      if (!validName(entry.name) || !entry.isDirectory()) throw new AuxError("invalid_params", "Plugin skills must use regular named directories.");
      const content = await regularFile(join(skillsDir, entry.name, "SKILL.md"));
      const meta = frontmatter(content);
      const name = meta.name ?? entry.name;
      if (!validName(name) || (meta.description?.length ?? 0) > 2000)
        throw new AuxError("invalid_params", "Skill name or description is invalid.");
      assets.push({ kind: "skill", name, description: meta.description, content, digest: digest(content) });
    }
  }
  const mcp = await optionalObject(join(root, ".mcp.json"));
  if (mcp) {
    const servers = mcp.mcpServers;
    if (!servers || typeof servers !== "object" || Array.isArray(servers))
      throw new AuxError("invalid_params", "Plugin .mcp.json needs an mcpServers object.");
    for (const [name, config] of Object.entries(servers)) {
      if (!validName(name) || !config || typeof config !== "object" || Array.isArray(config))
        throw new AuxError("invalid_params", "Plugin MCP server name or declaration is invalid.");
      // The declaration may contain tokens or commands. Persist only its name and hash.
      assets.push({ kind: "mcp_server", name, digest: digest(JSON.stringify(config)) });
    }
  }
  const hooksDir = join(root, "hooks");
  const hooksInfo = await lstat(hooksDir).catch(() => undefined);
  if (hooksInfo && !hooksInfo.isDirectory()) throw new AuxError("invalid_params", "Plugin hooks must be a regular directory.");
  const hooks = hooksInfo ? await optionalObject(join(hooksDir, "hooks.json")) : undefined;
  if (hooks) {
    const events = hooks.hooks;
    if (!events || typeof events !== "object" || Array.isArray(events))
      throw new AuxError("invalid_params", "Plugin hooks.json needs a hooks object.");
    for (const [name, config] of Object.entries(events)) {
      if (!validName(name) || !Array.isArray(config)) throw new AuxError("invalid_params", "Plugin hook event is invalid.");
      assets.push({ kind: "hook", name, digest: digest(JSON.stringify(config)) });
    }
  }
  if (assets.length > 128) throw new AuxError("invalid_params", "Plugin has too many components.");
  if (!assets.length) throw new AuxError("invalid_params", "Plugin has no supported skills, MCP servers or hooks.");
  return { format: "claude-code", name: manifest.name, version: manifest.version, description: manifest.description, assets };
}
