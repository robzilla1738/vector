import type { Stats } from 'node:fs';
import { lstat, readdir, readFile, realpath } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';
import { z } from 'zod';

const metadata = z.object({
  name: z.string().min(1).max(128),
  description: z.string().min(1),
  autoInject: z
    .object({
      keywords: z.array(z.string().min(1)).default([]),
      urlPatterns: z.array(z.string().regex(/^[^\s:]+$/)).default([]),
    })
    .default({ keywords: [], urlPatterns: [] }),
  siteSpecific: z.boolean().default(false),
});
export type Skill = z.infer<typeof metadata> & {
  body: string;
  path: string;
  builtin: boolean;
  enabled: boolean;
};
export const builtinDirectory = fileURLToPath(
  new URL('../builtins/', import.meta.url),
);

export async function loadSkills(
  userDirectories: string[] = [],
  disabled: string[] = [],
): Promise<Skill[]> {
  const skills = new Map<string, Skill>();
  async function visit(
    directory: string,
    root: string,
    builtin: boolean,
  ): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    const skillFile = entries.find(
      (entry) => entry.name === 'SKILL.md' && entry.isFile(),
    );
    if (skillFile) {
      const path = join(directory, skillFile.name);
      if ((await lstat(path)).size > 1_048_576)
        throw new Error(`Skill file is too large: ${path}`);
      const body = await readFile(path, 'utf8');
      const header = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(body)?.[1];
      if (!header) throw new Error(`Skill metadata is missing: ${path}`);
      const document = parseDocument(header, { uniqueKeys: true });
      if (document.errors.length)
        throw new Error(`Invalid skill metadata: ${path}`);
      const fields = metadata.parse(document.toJS({ maxAliasCount: 0 }));
      const canonical = await realpath(path);
      const within = relative(root, canonical);
      if (within === '..' || within.startsWith(`..${sep}`))
        throw new Error('Skill path escapes its configured root.');
      skills.set(fields.name, {
        ...fields,
        body,
        path: canonical,
        builtin,
        enabled: !disabled.includes(fields.name),
      });
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      await visit(join(directory, entry.name), root, builtin);
    }
  }
  for (const [index, directory] of [
    builtinDirectory,
    ...userDirectories,
  ].entries()) {
    let info: Stats;
    try {
      info = await lstat(directory);
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT' &&
        index > 0
      )
        continue;
      throw error;
    }
    if (!info.isDirectory() || info.isSymbolicLink())
      throw new Error(`Skill root must be a real directory: ${directory}`);
    await visit(directory, await realpath(directory), index === 0);
  }
  return [...skills.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function matchingSkills(
  skills: Skill[],
  prompt: string,
  urls: string[],
): Skill[] {
  const query = prompt.toLocaleLowerCase();
  return skills.filter(
    (skill) =>
      skill.enabled &&
      (skill.autoInject.keywords.some((keyword) =>
        query.includes(keyword.toLocaleLowerCase()),
      ) ||
        skill.autoInject.urlPatterns.some((pattern) => {
          const expression = new RegExp(
            `^${pattern
              .split('*')
              .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
              .join('.*')}$`,
            'i',
          );
          return urls.some((value) => {
            const url = new URL(value);
            return expression.test(`${url.host}${url.pathname}`);
          });
        })),
  );
}
