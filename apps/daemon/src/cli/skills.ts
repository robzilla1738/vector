import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { loadSkills } from '@aux/skills';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
import { createDeveloperSettingsRouter } from './developer-settings.js';
import { createSkillSettingsRouter } from './skill-settings.js';

export async function accountSkills(
  store: DaemonServices['store'],
  accountId: number,
  projectId?: string | null,
) {
  const roots = [join(store.accountHome(accountId), 'skills/user')];
  if (projectId) {
    const project = z
      .object({ workspacePath: z.string(), archivedAt: z.number().optional() })
      .parse(store.get(accountId, 'projects', projectId));
    if (project.archivedAt)
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Project is archived.',
      });
    roots.push(join(project.workspacePath, '.agents/skills'));
  }
  const disabled = z
    .array(z.string())
    .parse(store.get(accountId, 'settings', 'skills.disabled') ?? []);
  const projectDisabled = projectId
    ? z
        .array(z.string())
        .parse(store.get(accountId, 'skill-settings', projectId) ?? [])
    : [];
  return loadSkills(roots, [...disabled, ...projectDisabled]);
}
const targets: Record<string, string> = {
  general: '.agents/skills',
  codex: '.codex/skills',
  'claude-code': '.claude/skills',
  cursor: '.cursor/skills',
  opencode: '.config/opencode/skills',
};
export function createSkillRouters(
  services: DaemonServices,
  options: { home?: string; cliExecutable?: string } = {},
) {
  const { store, t, procedure } = services;
  const developerHome = options.home ?? homedir();
  const scope = z.object({
    accountId: z.number().int().nonnegative(),
    projectId: z.string().nullable().optional(),
  });
  async function skill(
    accountId: number,
    name: string,
    projectId?: string | null,
  ) {
    const found = (await accountSkills(store, accountId, projectId)).find(
      (item) => item.name === name,
    );
    if (!found)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Skill was not found.',
      });
    return found;
  }
  async function installed(path: string) {
    try {
      return {
        path,
        installed: true,
        original: (await readFile(path, 'utf8')).includes(
          'Connect an external coding agent to the local Aux browser.',
        ),
      };
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
        return { path, installed: false, original: false };
      throw error;
    }
  }
  return {
    projectSkills: createSkillSettingsRouter(services),
    cliSkills: t.router({
      skillsList: procedure
        .input(scope)
        .query(async ({ input }) =>
          (await accountSkills(store, input.accountId, input.projectId)).map(
            ({ body, ...metadata }) => metadata,
          ),
        ),
      skillsShow: procedure
        .input(scope.extend({ name: z.string().min(1) }))
        .query(({ input }) =>
          skill(input.accountId, input.name, input.projectId),
        ),
    }),
    developers: t.mergeRouters(
      createDeveloperSettingsRouter(services, options),
      t.router({
        getAuxBrowserSkill: procedure
          .input(scope)
          .query(({ input }) => skill(input.accountId, 'aux-browser')),
        checkAgentInstallations: procedure
          .input(scope)
          .query(async ({ input }) => {
            store.requireAccount(input.accountId);
            return Promise.all(
              Object.entries(targets).map(async ([id, root]) => ({
                id,
                ...(await installed(
                  join(developerHome, root, 'aux-browser/SKILL.md'),
                )),
              })),
            );
          }),
        installAuxBrowserSkill: procedure
          .input(
            scope.extend({
              id: z.enum([
                'general',
                'codex',
                'claude-code',
                'cursor',
                'opencode',
              ]),
            }),
          )
          .mutation(async ({ input }) => {
            const root = targets[input.id];
            if (!root)
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Unknown installation target.',
              });
            const source = await skill(input.accountId, 'aux-browser');
            const directory = join(developerHome, root, 'aux-browser');
            await mkdir(directory, { recursive: true });
            await writeFile(join(directory, 'SKILL.md'), source.body, {
              flag: 'wx',
            });
            return { installed: true, path: join(directory, 'SKILL.md') };
          }),
      }),
    ),
  };
}
