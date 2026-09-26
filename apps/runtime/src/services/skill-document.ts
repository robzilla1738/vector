import { lstat, readFile } from "node:fs/promises";
import { AuxError, RoutineShareSchema, type RoutineShare } from "@aux/contracts";

const MAX_BYTES = 64_000;
const fields = new Set(["name", "description", "icon", "autoInject", "aux"]);

/** A portable, human-readable SKILL.md. The Aux extension retains parameters and evidence criteria. */
export function serializeSkillDocument(share: RoutineShare): string {
  const aux = {
    parameters: share.parameters,
    siteOrigins: share.siteOrigins,
    outputHint: share.outputHint,
    successCriteria: share.successCriteria,
  };
  const metadata: Record<string, unknown> = {
    name: share.title,
    description: share.description ?? share.objective.slice(0, 200),
    ...(share.icon ? { icon: share.icon } : {}),
    autoInject: share.autoInject,
    aux,
  };
  const result = `---\n${Object.entries(metadata)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n")}\n---\n\n${share.objective.trim()}\n`;
  if (Buffer.byteLength(result) > MAX_BYTES)
    throw new AuxError("invalid_params", "The Skill document exceeds 64 KB.");
  return result;
}

/** Read only the bounded Aux document fields. Import is always paused and task-unbound. */
export function parseSkillDocument(markdown: string): RoutineShare {
  if (Buffer.byteLength(markdown) > MAX_BYTES)
    throw new AuxError("invalid_params", "The Skill document exceeds 64 KB.");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n(?:\r?\n)?([\s\S]*)$/.exec(markdown);
  if (!match) throw new AuxError("invalid_params", "Skill document needs YAML frontmatter and an objective.");
  const metadata: Record<string, unknown> = {};
  for (const line of match[1]!.split(/\r?\n/)) {
    const pair = /^([A-Za-z][A-Za-z0-9]*): (.+)$/.exec(line);
    if (!pair || !fields.has(pair[1]!) || pair[1]! in metadata)
      throw new AuxError("invalid_params", "Skill frontmatter contains an unsupported or duplicate field.");
    try {
      metadata[pair[1]!] = JSON.parse(pair[2]!);
    } catch {
      throw new AuxError("invalid_params", "Skill frontmatter fields must use JSON scalar or flow values.");
    }
  }
  const aux = metadata.aux;
  if (aux !== undefined && (!aux || typeof aux !== "object" || Array.isArray(aux)))
    throw new AuxError("invalid_params", "Skill Aux metadata is invalid.");
  const objective = match[2]!.trim();
  const parsed = RoutineShareSchema.safeParse({
    ...(aux as Record<string, unknown> | undefined),
    title: metadata.name,
    description: metadata.description,
    icon: metadata.icon,
    autoInject: metadata.autoInject,
    objective,
    // A document cannot carry execution authority from another installation.
    accountLabels: [],
    calendarGrantIds: [],
    sourceTaskId: undefined,
    trigger: { kind: "manual" },
    paused: true,
    reviewRequired: true,
  });
  if (!parsed.success) throw new AuxError("invalid_params", "Skill document fields are invalid.");
  return parsed.data;
}

export async function readSkillDocument(path: string): Promise<RoutineShare> {
  const info = await lstat(path).catch(() => undefined);
  if (!info?.isFile() || info.size > MAX_BYTES)
    throw new AuxError("invalid_params", "Choose a bounded regular SKILL.md file.");
  return parseSkillDocument(await readFile(path, "utf8"));
}
