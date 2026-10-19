/** Implements docs/spec/daemon/services.md Projects and workspace files. */

import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import { z } from 'zod';
import {
  type AgentEngine,
  fail,
  scope,
} from '../../../../packages/agent/src/index.js';
import type { DaemonServices } from '../http/server.js';

const projectScope = scope.extend({
  projectId: z.string().regex(/^[\w-]{1,128}$/),
});
const fields = z.object({
  name: z.string().trim().min(1),
  workspacePath: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().optional(),
});
const projectSchema = fields.extend({
  id: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  archivedAt: z.number().optional(),
});
const fileName = z.enum(['AGENTS.md', 'CONTEXT.md', 'PROJECT.md']);
export function createProjectRouter(
  { t, procedure, store }: DaemonServices,
  engine: AgentEngine,
) {
  function get(accountId: number, id: string) {
    const value = store.get(accountId, 'projects', id);
    if (!value) fail('NOT_FOUND', 'Project not found');
    return projectSchema.parse(value);
  }
  function directory(accountId: number, id: string) {
    engine.requireProject(accountId, id);
    const path = join(store.accountHome(accountId), 'projects', id);
    mkdirSync(path, { recursive: true, mode: 0o700 });
    const root = realpathSync(join(store.accountHome(accountId), 'projects'));
    if (!realpathSync(path).startsWith(`${root}/`))
      fail('FORBIDDEN', 'Project path escapes storage');
    return path;
  }
  function path(accountId: number, id: string, name: z.infer<typeof fileName>) {
    const target = join(directory(accountId, id), name);
    if (existsSync(target) && lstatSync(target).isSymbolicLink())
      fail('FORBIDDEN', 'Project context cannot be a symbolic link');
    return target;
  }
  return t.router({
    list: procedure.input(scope).query(({ input }) =>
      Object.values(store.all(input.accountId, 'projects'))
        .filter(Boolean)
        .map((value) => projectSchema.parse(value)),
    ),
    get: procedure
      .input(projectScope)
      .query(({ input }) => get(input.accountId, input.projectId)),
    defaultWorkspacePath: procedure.input(projectScope).query(({ input }) => {
      store.requireAccount(input.accountId);
      const root = join(
        store.accountHome(input.accountId),
        'projects',
        input.projectId,
        'workspace',
      );
      let candidate = root;
      let index = 1;
      while (existsSync(candidate)) candidate = `${root}-${index++}`;
      return candidate;
    }),
    create: procedure
      .input(
        scope
          .extend({ id: z.string().regex(/^[\w-]{1,128}$/) })
          .extend(fields.shape),
      )
      .mutation(({ input }) => {
        store.requireAccount(input.accountId);
        if (store.get(input.accountId, 'projects', input.id))
          fail('CONFLICT', 'Project ID already exists');
        if (!isAbsolute(input.workspacePath))
          fail('BAD_REQUEST', 'Workspace path must be absolute');
        const { accountId, ...data } = input;
        const project = {
          ...data,
          workspacePath: resolve(input.workspacePath),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        store.set(accountId, 'projects', project.id, project);
        mkdirSync(directory(accountId, project.id), {
          recursive: true,
          mode: 0o700,
        });
        return project;
      }),
    update: procedure
      .input(projectScope.extend(fields.partial().shape))
      .mutation(({ input }) => {
        engine.requireProject(input.accountId, input.projectId);
        const { accountId, projectId, ...patch } = input;
        return store.set(accountId, 'projects', projectId, {
          ...get(accountId, projectId),
          ...patch,
          updatedAt: Date.now(),
        });
      }),
    archive: procedure.input(projectScope).mutation(({ input }) =>
      store.set(input.accountId, 'projects', input.projectId, {
        ...get(input.accountId, input.projectId),
        archivedAt: Date.now(),
        updatedAt: Date.now(),
      }),
    ),
    delete: procedure.input(projectScope).mutation(({ input }) => {
      get(input.accountId, input.projectId);
      if (
        engine
          .list(input.accountId)
          .some((s) => s.projectId === input.projectId)
      )
        fail(
          'CONFLICT',
          'Move or delete project sessions before deleting the project',
        );
      store.set(input.accountId, 'projects', input.projectId, null);
      return { deleted: true };
    }),
    listFiles: procedure
      .input(projectScope)
      .query(({ input }) =>
        readdirSync(directory(input.accountId, input.projectId)).filter(
          (name) => fileName.safeParse(name).success,
        ),
      ),
    readFile: procedure
      .input(projectScope.extend({ fileName }))
      .query(({ input }) => {
        const target = path(input.accountId, input.projectId, input.fileName);
        return {
          content: existsSync(target) ? readFileSync(target, 'utf8') : '',
        };
      }),
    writeFile: procedure
      .input(
        projectScope.extend({ fileName, content: z.string().max(2_000_000) }),
      )
      .mutation(({ input }) => {
        writeFileSync(
          path(input.accountId, input.projectId, input.fileName),
          input.content,
          { mode: 0o600 },
        );
        return { success: true };
      }),
    importFiles: procedure
      .input(
        projectScope.extend({
          files: z
            .array(
              z.object({ name: fileName, data: z.string().max(3_000_000) }),
            )
            .min(1),
        }),
      )
      .mutation(({ input }) => {
        const names = new Set<string>();
        for (const file of input.files) {
          const target = path(input.accountId, input.projectId, file.name);
          if (existsSync(target) || names.has(file.name))
            fail('CONFLICT', 'Imported filename already exists');
          names.add(file.name);
          if (
            !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
              file.data,
            )
          )
            fail('BAD_REQUEST', 'Invalid base64 data');
        }
        for (const file of input.files)
          writeFileSync(
            path(input.accountId, input.projectId, file.name),
            Buffer.from(file.data, 'base64'),
            { mode: 0o600, flag: 'wx' },
          );
        return { imported: input.files.map((file) => file.name) };
      }),
  });
}
