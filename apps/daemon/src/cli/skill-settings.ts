/** Implements docs/spec/daemon/services.md project-scoped skill settings. */
import { randomUUID } from 'node:crypto';
import {
  lstat,
  mkdir,
  readdir,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { builtinDirectory, loadSkills } from '@aux/skills';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';

const scope = z.object({
  accountId: z.number().int().nonnegative(),
  projectId: z.string().nullable().optional(),
});
const targeted = scope.extend({ skillPath: z.string().min(1) });
const fields = z.object({
  name: z.string().regex(/^[a-z0-9][a-z0-9-]{0,127}$/),
  description: z.string().trim().min(1).max(10000),
  body: z.string().trim().min(1).max(1_000_000),
  enabled: z.boolean().default(true),
  siteSpecific: z.boolean().default(false),
  keywords: z.array(z.string().trim().min(1)).default([]),
  urlPatterns: z.array(z.string().regex(/^[^\s:]+$/)).default([]),
});
function reject(message: string): never {
  throw new TRPCError({ code: 'BAD_REQUEST', message });
}
function within(root: string, path: string) {
  const part = relative(root, path);
  return (
    part === '' ||
    (part !== '..' && !part.startsWith(`..${sep}`) && !isAbsolute(part))
  );
}
async function realDirectory(path: string, create = false) {
  if (create) {
    const parent = dirname(path);
    if (parent !== path) await realDirectory(parent, true);
    try {
      await mkdir(path, { mode: 0o700 });
    } catch (error) {
      if (
        !(error instanceof Error && 'code' in error && error.code === 'EEXIST')
      )
        throw error;
    }
  }
  const info = await lstat(path);
  if (!info.isDirectory() || info.isSymbolicLink())
    reject('Choose a real directory without symbolic links.');
  return realpath(path);
}
async function files(root: string) {
  const result: { name: string; size: number }[] = [];
  let bytes = 0;
  let visited = 0;
  async function visit(path: string, depth = 0) {
    if (depth > 16 || ++visited > 200)
      reject('Skill folder hierarchy is too large.');
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const target = join(path, entry.name);
      if (entry.isSymbolicLink())
        reject('Skill folders cannot contain symbolic links.');
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) await visit(target, depth + 1);
      else if (entry.isFile()) {
        const info = await lstat(target);
        bytes += info.size;
        if (info.size > 1_048_576 || bytes > 10_485_760 || result.length >= 100)
          reject('Skill folder exceeds the 100-file or 10 MB limit.');
        result.push({ name: relative(root, target), size: info.size });
      } else
        reject(
          'Skill folders can only contain ordinary files and directories.',
        );
    }
  }
  await visit(root);
  return result;
}
export function createSkillSettingsRouter({
  store,
  t,
  procedure,
}: DaemonServices) {
  async function directory(accountId: number, projectId?: string | null) {
    store.requireAccount(accountId);
    if (!projectId)
      return realDirectory(
        join(await realpath(store.accountHome(accountId)), 'skills', 'user'),
        true,
      );
    const project = z
      .object({ workspacePath: z.string(), archivedAt: z.number().optional() })
      .parse(store.get(accountId, 'projects', projectId));
    if (project.archivedAt) reject('Project is archived.');
    const workspace = await realDirectory(project.workspacePath);
    return realDirectory(join(workspace, '.agents', 'skills'), true);
  }
  function disabled(accountId: number, projectId?: string | null) {
    return z
      .array(z.string())
      .parse(
        projectId
          ? (store.get(accountId, 'skill-settings', projectId) ?? [])
          : (store.get(accountId, 'settings', 'skills.disabled') ?? []),
      );
  }
  async function inventory(accountId: number, projectId?: string | null) {
    const root = await directory(accountId, projectId);
    const accountRoot = await directory(accountId);
    const blocked = [
      ...disabled(accountId),
      ...(projectId ? disabled(accountId, projectId) : []),
    ];
    const active = await loadSkills(
      projectId ? [accountRoot, root] : [root],
      blocked,
    );
    const builtins = await loadSkills([], blocked);
    return [
      ...active,
      ...builtins.filter((skill) =>
        active.some((item) => item.name === skill.name && !item.builtin),
      ),
    ].map((skill) => ({
      ...skill,
      category: skill.builtin
        ? 'builtin'
        : within(root, skill.path)
          ? projectId
            ? 'project'
            : 'user'
          : 'user',
      overridden:
        skill.builtin &&
        active.some((item) => item.name === skill.name && !item.builtin),
    }));
  }
  async function target(input: z.infer<typeof targeted>, mutable = false) {
    const skill = (await inventory(input.accountId, input.projectId)).find(
      (item) => item.path === input.skillPath,
    );
    if (!skill)
      reject(
        'Skill is no longer available in this scope. Refresh the inventory.',
      );
    const root = await directory(input.accountId, input.projectId);
    if (mutable && (skill.builtin || !within(root, skill.path)))
      reject(
        'Only skills owned by this scope can be changed. Copy this skill for customization.',
      );
    return { skill, root };
  }
  function setEnabled(
    accountId: number,
    projectId: string | null | undefined,
    name: string,
    enabled: boolean,
  ) {
    const names = new Set(disabled(accountId, projectId));
    if (enabled) names.delete(name);
    else names.add(name);
    store.set(
      accountId,
      projectId ? 'skill-settings' : 'settings',
      projectId ?? 'skills.disabled',
      [...names],
    );
  }
  const serialize = (input: z.infer<typeof fields>) =>
    `---\n${JSON.stringify({ name: input.name, description: input.description, siteSpecific: input.siteSpecific, autoInject: { keywords: input.keywords, urlPatterns: input.urlPatterns } }, null, 2)}\n---\n\n${input.body}\n`;
  async function write(root: string, name: string, content: string) {
    const folder = join(root, name);
    try {
      await mkdir(folder, { mode: 0o700 });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'EEXIST')
        reject(
          'A user skill with that name already exists. Choose another name or edit it.',
        );
      throw error;
    }
    try {
      await writeFile(join(folder, 'SKILL.md'), content, {
        mode: 0o600,
        flag: 'wx',
      });
    } catch (error) {
      await rm(folder, { recursive: true, force: true });
      throw error;
    }
    return join(folder, 'SKILL.md');
  }
  return t.router({
    getSkillsDirectory: procedure
      .input(scope)
      .query(({ input }) => directory(input.accountId, input.projectId)),
    listSkills: procedure
      .input(scope)
      .query(async ({ input }) =>
        (await inventory(input.accountId, input.projectId))
          .filter((skill) => !skill.overridden)
          .map(({ body, ...metadata }) => metadata),
      ),
    listSkillsForSettings: procedure
      .input(scope)
      .query(async ({ input }) =>
        (await inventory(input.accountId, input.projectId)).map(
          ({ body, ...metadata }) => metadata,
        ),
      ),
    getSkill: procedure.input(targeted).query(async ({ input }) => {
      const { skill } = await target(input);
      return { ...skill, files: await files(dirname(skill.path)) };
    }),
    readSkillFile: procedure
      .input(targeted.extend({ fileName: z.string().min(1) }))
      .query(async ({ input }) => {
        const { skill } = await target(input);
        const root = dirname(skill.path);
        const path = resolve(root, input.fileName);
        if (
          !within(root, path) ||
          !(await files(root)).some((item) => item.name === input.fileName)
        )
          reject('Skill file is outside this skill folder.');
        const content = await readFile(path);
        if (content.includes(0))
          reject('This file is binary and cannot be previewed as text.');
        return { content: content.toString('utf8') };
      }),
    createSkill: procedure
      .input(scope.extend(fields.shape))
      .mutation(async ({ input }) => {
        const root = await directory(input.accountId, input.projectId);
        const path = await write(root, input.name, serialize(input));
        setEnabled(input.accountId, input.projectId, input.name, input.enabled);
        return { skillPath: path };
      }),
    updateSkill: procedure
      .input(targeted.extend(fields.shape))
      .mutation(async ({ input }) => {
        const { skill } = await target(input, true);
        if (skill.name !== input.name)
          reject(
            'Skill names are fixed after creation. Copy the skill to use a new name.',
          );
        const temporary = join(dirname(skill.path), `.aux-${randomUUID()}`);
        try {
          await writeFile(
            temporary,
            serialize({ ...input, siteSpecific: skill.siteSpecific }),
            {
              mode: 0o600,
              flag: 'wx',
            },
          );
          await rename(temporary, skill.path);
        } finally {
          await rm(temporary, { force: true });
        }
        setEnabled(input.accountId, input.projectId, input.name, input.enabled);
        return { skillPath: skill.path };
      }),
    deleteSkill: procedure.input(targeted).mutation(async ({ input }) => {
      const { skill, root } = await target(input, true);
      const folder = dirname(skill.path);
      if (folder === root)
        reject('The root skills directory cannot be deleted.');
      await files(folder);
      await rm(folder, { recursive: true });
      setEnabled(input.accountId, input.projectId, skill.name, true);
      return { deleted: true };
    }),
    setSkillEnabled: procedure
      .input(targeted.extend({ enabled: z.boolean() }))
      .mutation(async ({ input }) => {
        const { skill } = await target(input);
        setEnabled(input.accountId, input.projectId, skill.name, input.enabled);
        return { enabled: input.enabled };
      }),
    copySkillForCustomization: procedure
      .input(targeted.extend({ name: fields.shape.name.optional() }))
      .mutation(async ({ input }) => {
        const { skill, root } = await target(input);
        const name = input.name ?? skill.name;
        const body = skill.body
          .replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '')
          .trim();
        const path = await write(
          root,
          name,
          serialize({
            name,
            description: skill.description,
            siteSpecific: skill.siteSpecific,
            body,
            enabled: true,
            keywords: skill.autoInject.keywords,
            urlPatterns: skill.autoInject.urlPatterns,
          }),
        );
        return { skillPath: path };
      }),
    importSkillFolder: procedure
      .input(
        scope.extend({
          folderPath: z.string().min(1),
          authorized: z.literal(true),
        }),
      )
      .mutation(async ({ input }) => {
        if (!isAbsolute(input.folderPath))
          reject('Choose an absolute folder path.');
        const source = await realDirectory(input.folderPath);
        if (within(builtinDirectory, source))
          reject('Use Copy for customization for built-in skills.');
        const entries = await files(source);
        const skill = (await loadSkills([source])).find(
          (item) => item.path === join(source, 'SKILL.md') && !item.builtin,
        );
        if (!skill)
          reject('The chosen folder must contain its own valid SKILL.md.');
        const name = fields.shape.name.parse(skill.name);
        const root = await directory(input.accountId, input.projectId);
        if (within(source, root) || within(root, source))
          reject('Choose a folder outside the destination skills directory.');
        const temporary = join(root, `.import-${randomUUID()}`);
        await mkdir(temporary, { mode: 0o700 });
        try {
          for (const entry of entries) {
            const path = join(temporary, entry.name);
            await mkdir(dirname(path), { recursive: true, mode: 0o700 });
            await writeFile(path, await readFile(join(source, entry.name)), {
              mode: 0o600,
              flag: 'wx',
            });
          }
          const destination = join(root, name);
          try {
            await lstat(destination);
            reject(
              'A skill with this name already exists. Rename its metadata before importing.',
            );
          } catch (error) {
            if (
              !(
                error instanceof Error &&
                'code' in error &&
                error.code === 'ENOENT'
              )
            )
              throw error;
          }
          await rename(temporary, destination);
          return {
            skillPath: join(destination, 'SKILL.md'),
            importedFiles: entries.length,
          };
        } finally {
          await rm(temporary, { recursive: true, force: true });
        }
      }),
  });
}
