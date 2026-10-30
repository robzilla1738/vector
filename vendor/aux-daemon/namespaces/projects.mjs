/** The `projects` tRPC namespace: Projects, the files in their workspaces, and the skills of a
 * Project or of the account (`projectId: null`). Project rows stay in the supplied ProjectStore,
 * which sessions and routines read too; skill parsing, the skills cache and the built-in skill
 * catalog stay the supplied ones. */
import {existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import {cp, mkdir, readFile, rm, stat} from 'node:fs/promises';
import path from 'node:path';

/** `name`, or `name (1)`, `name (2)`… when a file of that name exists. */
function uniqueFileName(directory, name) {
  if (!existsSync(path.join(directory, name))) return name;
  const extension = path.extname(name), stem = path.basename(name, extension);
  for (let index = 1; ; index += 1) {
    const candidate = `${stem} (${index})${extension}`;
    if (!existsSync(path.join(directory, candidate))) return candidate;
  }
}

const isCode = (error, ...codes) => error && typeof error === 'object' && 'code' in error && codes.includes(error.code);

/** The skill procedures, scoped to a Project's `.agents/skills` or the account's `skills`. */
function skillProcedures({accountProcedure, z, TRPCError, projects: services, skills: k}) {
  const scope = accountProcedure.input(z.object({projectId: z.string().nullable()})).use(({ctx, input, next}) => {
    const project = input.projectId ? services.ProjectStore.get(ctx.accountId, input.projectId) : undefined;
    if (input.projectId && !project) throw new TRPCError({code: 'NOT_FOUND', message: 'Project not found'});
    const root = services.getAccountTaskRoot(ctx.accountId);
    return next({ctx: {...ctx, cacheKey: root, skillsDir: project ? path.join(project.workspacePath, '.agents/skills') : path.join(root, 'skills')}});
  });
  const conflict = message => new TRPCError({code: 'CONFLICT', message});
  const invalid = message => new TRPCError({code: 'BAD_REQUEST', message});
  const settingsSkills = skillsDir => k.collectSkillsForSettings(skillsDir, k.getBuiltinSkillPaths(skillsDir));
  /** A created or copied user skill, and the built-in skill of the same name it overrides. */
  const userSkill = (folder, name, builtinMatch) => {
    const skillPath = `${k.userSkillsPrefix}/${folder}`;
    return {path: skillPath, definitionPath: `${skillPath}/SKILL.md`, name, overridesBuiltin: !!builtinMatch, overriddenSkillPath: builtinMatch?.path};
  };
  const builtin = (skills, name) => skills.find(skill => skill.creator === 'builtin' && skill.name === name);
  const assertNoUserSkill = (skills, name, except) => {
    if (skills.find(skill => skill.creator === 'user' && skill.name === name && skill.path !== except)) throw conflict(`User skill already exists: ${name}`);
  };
  const changed = (ctx, result) => {
    k.Skills.clearSharedCache(ctx.cacheKey);
    return result;
  };

  return {
    getSkillsDirectory: scope.query(({ctx}) => ctx.skillsDir),
    listSkills: scope.query(({ctx}) => {
      const listed = new Map();
      for (const directory of new Set([path.join(services.getAccountTaskRoot(ctx.accountId), 'skills'), ctx.skillsDir])) {
        const skills = k.collectImmediateSkills(directory, k.getBuiltinSkillPaths(directory))
          .filter(skill => skill.path !== 'builtin/password-manager' && skill.enabled && k.isAuxSkill(skill.metadata ?? {}));
        for (const skill of k.dedupeSkillsByRuntimePriority(skills)) listed.set(skill.name, k.toListedSkill(skill));
      }
      return [...listed.values()];
    }),
    listSkillsForSettings: scope.query(({ctx}) => existsSync(ctx.skillsDir)
      ? k.markOverriddenSkills(settingsSkills(ctx.skillsDir).filter(skill => skill.path !== 'builtin/password-manager')) : []),
    createSkill: scope.input(k.createSkillInputSchema).mutation(async ({ctx, input}) => {
      const userDir = path.join(ctx.skillsDir, k.userSkillsPrefix), folder = k.slugifySkillFolderName(input.name), target = path.resolve(path.join(userDir, folder));
      const definitionFile = path.join(target, 'SKILL.md');
      k.assertWithinDirectory(userDir, target);
      const skills = existsSync(ctx.skillsDir) ? settingsSkills(ctx.skillsDir) : [];
      assertNoUserSkill(skills, input.name);
      if (existsSync(target)) throw conflict(`Skill folder already exists: ${folder}`);
      const source = k.createUserSkillSource(input), definition = k.parseSkillDefinition(source, definitionFile, folder);
      if (!definition) throw invalid('Generated skill frontmatter is invalid');
      await mkdir(userDir, {recursive: true});
      try {
        await mkdir(target);
      } catch (error) {
        throw isCode(error, 'EEXIST') ? conflict(`Skill folder already exists: ${folder}`) : error;
      }
      writeFileSync(definitionFile, source, 'utf-8');
      return changed(ctx, userSkill(folder, definition.name, builtin(skills, input.name)));
    }),
    updateSkill: scope.input(k.updateSkillInputSchema).mutation(({ctx, input}) => {
      const {skillFilePath, definitionPath} = k.getUserSkillTarget(ctx.skillsDir, input.skillPath), skills = settingsSkills(ctx.skillsDir);
      const skillPath = skills.find(skill => skill.path === input.skillPath || skill.definitionPath === input.skillPath)?.path ?? input.skillPath;
      assertNoUserSkill(skills, input.name, skillPath);
      const folder = path.basename(path.dirname(skillFilePath));
      const source = k.createUserSkillSource(input, k.parseSkillFrontmatter(readFileSync(skillFilePath, 'utf-8'), folder)), definition = k.parseSkillDefinition(source, skillFilePath, folder);
      if (!definition) throw invalid('Generated skill frontmatter is invalid');
      writeFileSync(skillFilePath, source, 'utf-8');
      k.Skills.clearSharedCache(ctx.cacheKey);
      const builtinMatch = builtin(skills, input.name);
      return {path: skillPath, definitionPath, name: definition.name, overridesBuiltin: !!builtinMatch, overriddenSkillPath: builtinMatch?.path};
    }),
    copySkillForCustomization: scope.input(k.copySkillInputSchema).mutation(async ({ctx, input}) => {
      const source = path.resolve(path.join(ctx.skillsDir, input.skillPath));
      k.assertWithinDirectory(ctx.skillsDir, source);
      if (!existsSync(source)) throw new TRPCError({code: 'NOT_FOUND', message: 'Skill not found'});
      const sourceStat = statSync(source), definitionFile = sourceStat.isDirectory() ? path.join(source, 'SKILL.md') : source;
      if (!existsSync(definitionFile) || !definitionFile.endsWith('.md') || !statSync(definitionFile).isFile()) throw invalid('Invalid skill path');
      const definition = k.parseSkillDefinition(readFileSync(definitionFile, 'utf-8'), definitionFile, path.basename(source).replace(/\.md$/, ''));
      if (!definition) throw invalid('SKILL.md frontmatter is invalid');
      const userDir = path.join(ctx.skillsDir, k.userSkillsPrefix), folder = k.slugifySkillFolderName(definition.name), target = path.resolve(path.join(userDir, folder));
      const copiedFile = path.join(target, 'SKILL.md');
      k.assertWithinDirectory(userDir, target);
      const skills = settingsSkills(ctx.skillsDir);
      assertNoUserSkill(skills, definition.name);
      if (existsSync(target)) throw conflict(`Skill folder already exists: ${folder}`);
      await mkdir(userDir, {recursive: true});
      if (sourceStat.isDirectory()) await cp(source, target, {recursive: true, force: false, errorOnExist: true});
      else {
        await mkdir(target);
        writeFileSync(copiedFile, readFileSync(definitionFile, 'utf-8'), 'utf-8');
      }
      const copied = k.parseSkillDefinition(readFileSync(copiedFile, 'utf-8'), copiedFile, folder);
      if (!copied) throw invalid('Copied skill frontmatter is invalid');
      return changed(ctx, userSkill(folder, copied.name, builtin(skills, copied.name)));
    }),
    deleteSkill: scope.input(k.deleteSkillInputSchema).mutation(async ({ctx, input}) => {
      const {targetPath} = k.getUserSkillTarget(ctx.skillsDir, input.skillPath);
      await rm(targetPath, {recursive: statSync(targetPath).isDirectory()});
      return changed(ctx, {success: true});
    }),
    importSkillFolder: scope.input(z.object({sourcePath: z.string().trim().min(1)})).mutation(async ({ctx, input}) => {
      const source = path.resolve(input.sourcePath), folder = path.basename(source);
      if (!folder || folder.startsWith('.') || folder === 'node_modules') throw invalid('Invalid skill folder name');
      const sourceStat = await stat(source).catch(() => null);
      if (!sourceStat) throw new TRPCError({code: 'NOT_FOUND', message: 'Selected folder was not found'});
      if (!sourceStat.isDirectory()) throw invalid('Selected path must be a folder');
      const definitionFile = path.join(source, 'SKILL.md');
      if (!(await stat(definitionFile).catch(() => null))?.isFile()) throw invalid('Selected folder must contain SKILL.md');
      let name = folder;
      try {
        const definition = k.parseSkillDefinition(await readFile(definitionFile, 'utf-8'), definitionFile, folder);
        if (!definition) throw invalid('SKILL.md frontmatter is invalid');
        name = definition.name;
      } catch (error) {
        throw error instanceof TRPCError ? error : invalid(error instanceof Error ? error.message : 'SKILL.md frontmatter is invalid');
      }
      const userDir = path.join(ctx.skillsDir, k.userSkillsPrefix);
      await mkdir(userDir, {recursive: true});
      const target = path.resolve(path.join(userDir, folder));
      k.assertWithinDirectory(userDir, target);
      const fromSource = path.relative(source, target);
      if (fromSource === '' || !fromSource.startsWith('..') && !path.isAbsolute(fromSource)) throw invalid('Cannot import a folder into itself');
      if (existsSync(target)) throw conflict(`Skill folder already exists: ${folder}`);
      try {
        await cp(source, target, {recursive: true, force: false, errorOnExist: true});
      } catch (error) {
        throw isCode(error, 'ERR_FS_CP_EEXIST', 'EEXIST') ? conflict(`Skill folder already exists: ${folder}`) : error;
      }
      return changed(ctx, {path: `${k.userSkillsPrefix}/${folder}`, name});
    }),
    setSkillEnabled: scope.input(z.object({skillPath: z.string(), enabled: z.boolean()})).mutation(({ctx, input}) => {
      k.writeSkillFrontmatter(k.getSkillDefinitionFile(ctx.skillsDir, input.skillPath), 'disabled', !input.enabled || undefined);
      return changed(ctx, {success: true});
    }),
    setSkillAgents: scope.input(z.object({skillPath: z.string(), agents: z.array(k.skillAgentSchema).min(1)})).mutation(({ctx, input}) => {
      k.writeSkillFrontmatter(k.getSkillDefinitionFile(ctx.skillsDir, input.skillPath), 'agents', k.skillAgents.filter(agent => input.agents.includes(agent)));
      return changed(ctx, {success: true});
    }),
    readSkillFile: scope.input(z.object({skillPath: z.string()})).query(({ctx, input}) => {
      const file = path.resolve(path.join(ctx.skillsDir, input.skillPath));
      k.assertWithinDirectory(ctx.skillsDir, file);
      try {
        const content = readFileSync(file, 'utf-8');
        return {content, lastUpdatedAt: k.getLastUpdatedAt(file), metadata: input.skillPath.endsWith('.md') ? k.parseSkillFrontmatter(content) : null};
      } catch {
        return {content: '', lastUpdatedAt: null, metadata: null};
      }
    }),
    listSkillFiles: scope.input(z.object({skillName: z.string()})).query(({ctx, input}) => {
      const directory = path.join(ctx.skillsDir, input.skillName);
      return !existsSync(directory) || !statSync(directory).isDirectory() ? [] : k.listFilesRecursive(directory, '');
    }),
  };
}

export function create(bindings) {
  return {...projectProcedures(bindings), ...skillProcedures(bindings)};
}

function projectProcedures({accountProcedure, z, TRPCError, stateDb, projects: services}) {
  const projectsDir = accountId => path.join(services.getAccountTaskRoot(accountId), 'projects');
  /** projects/<id>, or projects/<id>-2, -3… when taken. */
  const availableWorkspace = (accountId, projectId) => {
    const preferred = path.join(projectsDir(accountId), projectId);
    if (!existsSync(preferred)) return preferred;
    for (let index = 2; ; index += 1) {
      const candidate = path.join(projectsDir(accountId), `${projectId}-${index}`);
      if (!existsSync(candidate)) return candidate;
    }
  };
  /** A chosen path is kept unless it is a taken default (projects/<id> or projects/<id>-<n>). */
  const resolveWorkspace = (accountId, projectId, chosen) => {
    if (path.dirname(chosen) !== projectsDir(accountId)) return chosen;
    const name = path.basename(chosen), suffix = name.startsWith(`${projectId}-`) ? name.slice(projectId.length + 1) : undefined;
    const isDefault = name === projectId || suffix && /^\d+$/.test(suffix);
    return isDefault && existsSync(chosen) ? availableWorkspace(accountId, projectId) : chosen;
  };
  const projectSessions = (accountId, projectId) => services.SessionStore.listFull(accountId, {projectId, archived: 'include', parent: 'all', ephemeral: 'include', routines: 'include'});
  const assertNoRunningSessions = (accountId, projectId, action) => {
    if (projectSessions(accountId, projectId).some(session => services.GlobalAgentSessionServer.isRunning(accountId, session.id)))
      throw new TRPCError({code: 'BAD_REQUEST', message: `Cannot ${action} a Project while one of its tasks is running.`});
  };
  /** Detaches a deleted Project's sessions and routines and removes its row; returns the routine ids. */
  const deleteProjectRows = (accountId, projectId) => {
    const database = stateDb(accountId).$client, seconds = Math.floor(Date.now() / 1000);
    database.prepare('begin').run();
    try {
      database.prepare('update "sessions" set "project_id" = ?, "system_prompt" = ?, "archived_at" = ? where "sessions"."project_id" = ?').run(null, '', seconds, projectId);
      const routines = database.prepare('update "routines" set "project_id" = ?, "next_run_at" = ?, "updated_at" = ?, "paused_at" = ? where "routines"."project_id" = ? returning "id"')
        .all(null, null, seconds, seconds, projectId);
      database.prepare('delete from "projects" where "projects"."id" = ?').run(projectId);
      database.prepare('commit').run();
      return routines.map(routine => routine.id);
    } catch (error) {
      database.prepare('rollback').run();
      throw error;
    }
  };

  const workspacePath = z.string().min(1, 'Workspace path is required').refine(path.isAbsolute, {message: 'Workspace path must be absolute'});
  const fileName = z.enum(['AGENTS.md', 'MEMORY.md']);
  const {icon, color} = services.projectSchema.shape;
  const byId = accountProcedure.input(z.object({projectId: z.string()})).use(async ({input, ctx, next}) => {
    const project = services.ProjectStore.get(ctx.accountId, input.projectId);
    if (!project) throw new TRPCError({code: 'NOT_FOUND', message: 'Project not found'});
    return next({ctx: {...ctx, project}});
  });

  return {
    list: accountProcedure.query(({ctx}) => services.ProjectStore.list(ctx.accountId)),
    get: byId.query(({ctx}) => ctx.project),
    listFiles: byId.query(({ctx}) => existsSync(ctx.project.workspacePath)
      ? readdirSync(ctx.project.workspacePath, {withFileTypes: true}).filter(entry => entry.isFile() && !entry.name.startsWith('.')).map(entry => entry.name).sort((a, b) => a.localeCompare(b))
      : []),
    defaultWorkspacePath: accountProcedure.input(z.object({projectId: z.string().min(1)})).query(({ctx, input}) => {
      const availableProjectId = services.ProjectStore.getAvailableId(ctx.accountId, input.projectId);
      return {projectId: input.projectId, availableProjectId, projectsDir: projectsDir(ctx.accountId),
        defaultWorkspacePath: path.join(projectsDir(ctx.accountId), input.projectId), workspacePath: availableWorkspace(ctx.accountId, availableProjectId)};
    }),
    create: accountProcedure.input(z.object({id: z.string().min(1), name: z.string().min(1), icon: icon.optional(), color: color.optional(), workspacePath})).mutation(({ctx, input}) => {
      const id = services.ProjectStore.getAvailableId(ctx.accountId, input.id), name = path.basename(input.workspacePath);
      const isDefault = path.dirname(input.workspacePath) === projectsDir(ctx.accountId) && (name === input.id || name.startsWith(`${input.id}-`));
      const workspace = isDefault ? availableWorkspace(ctx.accountId, id) : resolveWorkspace(ctx.accountId, id, input.workspacePath);
      const project = services.ProjectStore.create(ctx.accountId, {...input, id, workspacePath: workspace});
      if (isDefault) writeFileSync(path.join(project.workspacePath, 'MEMORY.md'), '');
      return project;
    }),
    update: byId.input(z.object({name: z.string().min(1).optional(), icon: icon.optional(), color: color.optional(), workspacePath: workspacePath.optional()})).mutation(async ({ctx, input}) => {
      const sessions = projectSessions(ctx.accountId, input.projectId);
      assertNoRunningSessions(ctx.accountId, input.projectId, 'update');
      services.ProjectStore.update(ctx.accountId, input.projectId, input);
      for (const session of sessions) {
        services.SessionStore.update(ctx.accountId, session.id, {systemPrompt: ''});
        await services.GlobalAgentSessionServer.disposeSession(ctx.accountId, session.id);
      }
      return services.ProjectStore.require(ctx.accountId, input.projectId);
    }),
    archive: byId.mutation(async ({ctx, input}) => {
      assertNoRunningSessions(ctx.accountId, input.projectId, 'archive');
      services.ProjectStore.archive(ctx.accountId, input.projectId);
      return services.ProjectStore.require(ctx.accountId, input.projectId);
    }),
    delete: byId.mutation(async ({ctx, input}) => {
      if (!ctx.project.archivedAt) throw new TRPCError({code: 'BAD_REQUEST', message: 'Archive a Project before deleting it.'});
      const sessions = projectSessions(ctx.accountId, input.projectId);
      assertNoRunningSessions(ctx.accountId, input.projectId, 'delete');
      for (const session of sessions) await services.GlobalAgentSessionServer.disposeSession(ctx.accountId, session.id);
      await services.stopCoderWork(ctx.accountId, sessions.map(session => session.id));
      for (const routineId of deleteProjectRows(ctx.accountId, input.projectId)) services.EventBus.emit('routine:changed', {accountId: ctx.accountId, routineId});
      services.notifyAgentFileChange(ctx.accountId);
      return {deleted: true};
    }),
    readFile: byId.input(z.object({fileName})).query(({ctx, input}) => {
      try {
        return {content: readFileSync(path.join(ctx.project.workspacePath, input.fileName), 'utf-8')};
      } catch {
        return {content: ''};
      }
    }),
    writeFile: byId.input(z.object({fileName, content: z.string()})).mutation(({ctx, input}) => {
      mkdirSync(ctx.project.workspacePath, {recursive: true});
      writeFileSync(path.join(ctx.project.workspacePath, input.fileName), input.content, 'utf-8');
      return {success: true};
    }),
    importFiles: byId.input(z.object({files: z.array(z.object({name: z.string().min(1), data: z.string()})).min(1)})).mutation(({ctx, input}) => {
      mkdirSync(ctx.project.workspacePath, {recursive: true});
      const imported = [];
      for (const file of input.files) {
        const name = path.basename(file.name);
        if (!name || name === '.' || name === '..') throw new TRPCError({code: 'BAD_REQUEST', message: `Invalid file name: ${file.name}`});
        const unique = uniqueFileName(ctx.project.workspacePath, name);
        writeFileSync(path.join(ctx.project.workspacePath, unique), Buffer.from(file.data, 'base64'));
        imported.push(unique);
      }
      return {imported};
    }),
  };
}
