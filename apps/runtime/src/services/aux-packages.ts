import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import { join, relative, isAbsolute } from "node:path";
import {
  AuxError,
  AuxPackageManifestSchema,
  AuxPackageSnapshotSchema,
  type AuxPackageSnapshot,
} from "@aux/contracts";
import { parseSkillDocument } from "./skill-document.js";

export async function loadAuxPackage(
  root: string,
  registeredTools: ReadonlySet<string>,
  readGoverned?: (path: string) => Promise<string>,
): Promise<AuxPackageSnapshot> {
  const canonical = await realpath(root);
  async function read(path: string, limit: number) {
    const destination = join(canonical, path);
    const info = await lstat(destination);
    const resolved = await realpath(destination);
    const within = relative(canonical, resolved);
    if (
      !info.isFile() ||
      info.isSymbolicLink() ||
      within.startsWith("..") ||
      isAbsolute(within) ||
      info.size > limit
    )
      throw new AuxError(
        "invalid_params",
        "Aux packages contain bounded regular files within their package directory.",
      );
    const text = readGoverned ? await readGoverned(destination) : await readFile(destination, "utf8");
    if (Buffer.byteLength(text) > limit)
      throw new AuxError("invalid_params", "Aux package file is too large.");
    return text;
  }
  const manifest = AuxPackageManifestSchema.parse(JSON.parse(await read("aux.package.json", 256_000)));
  for (const profile of manifest.profiles)
    for (const tool of profile.tools)
      if (tool !== "*" && !registeredTools.has(tool))
        throw new AuxError("invalid_params", `Unknown Aux tool: ${tool}`);
  for (const workflow of Object.values(manifest.workflows))
    for (const step of workflow)
      if (!registeredTools.has(step.tool))
        throw new AuxError("invalid_params", `Unknown Aux workflow tool: ${step.tool}`);
  const skills = [];
  const warnings: string[] = [];
  for (const path of manifest.skills) {
    const parsed = parseSkillDocument(await read(path, 64_000), (fields) => {
      if (fields.length)
        warnings.push(
          `${path.slice(0, 128)}: unsupported metadata ${fields
            .slice(0, 6)
            .map((field) => field.replace(/\s/g, " ").slice(0, 48))
            .join(", ")}${fields.length > 6 ? ` (+${fields.length - 6} more)` : ""}`,
        );
    });
    skills.push({
      path,
      name: parsed.title,
      description: parsed.description ?? "",
      instructions: parsed.objective,
    });
  }
  const digest = createHash("sha256").update(JSON.stringify({ manifest, skills, warnings })).digest("hex");
  return AuxPackageSnapshotSchema.parse({ manifest, skills, warnings, digest });
}
export function auxPackageContext(packages: AuxPackageSnapshot[]): string {
  return packages
    .map(
      (item) =>
        `Aux package ${item.manifest.name}@${item.manifest.version} (${item.digest})\n${item.skills.map((skill) => `${skill.name}: ${skill.description}`).join("\n")}`,
    )
    .join("\n\n");
}

export function selectAuxPackages(installed: AuxPackageSnapshot[], names: string[]): AuxPackageSnapshot[] {
  return [...new Set(names)].map((name) => {
    const matches = installed.filter((item) => item.manifest.name === name);
    if (matches.length !== 1) throw new AuxError("invalid_params", `Choose a unique Aux package: ${name}`);
    return AuxPackageSnapshotSchema.parse(matches[0]);
  });
}
export function auxSkillInstructions(packages: AuxPackageSnapshot[], name: string): string {
  const matches = packages.flatMap((item) => item.skills).filter((skill) => skill.name === name);
  if (matches.length !== 1)
    throw new AuxError("invalid_params", "Choose a unique skill from this run's Aux packages.");
  return matches[0]!.instructions;
}
