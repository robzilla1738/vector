/** The Project store: the `projects` table of the account's state.db. A Project's last activity is
 * the newest of its tasks, or its own stored time when it has none. Rows are validated by the
 * supplied Project schema, so callers see the same objects. */
import {accessSync, constants, mkdirSync, statSync} from 'node:fs';
import path from 'node:path';

const COLUMNS = '"id", "name", "icon", "color", "workspace_path", "last_active_at", "archived_at", "created_at", "updated_at"';
/** Writable columns, by the field names callers use. */
const FIELDS = {name: 'name', icon: 'icon', color: 'color', workspacePath: 'workspace_path', lastActiveAt: 'last_active_at', archivedAt: 'archived_at', updatedAt: 'updated_at'};
const seconds = date => Math.floor(date.getTime() / 1000);
const date = value => value === null ? undefined : new Date(value * 1000);

export function create({stateDb, stores: {projects: p}}) {
  const database = accountId => stateDb(accountId).$client;
  const fromRow = row => p.projectSchema.parse({id: row.id, name: row.name, icon: row.icon, color: row.color, workspacePath: row.workspace_path,
    lastActiveAt: date(row.last_active_at), archivedAt: date(row.archived_at), createdAt: date(row.created_at), updatedAt: date(row.updated_at)});

  /** The path, created if missing; it must be an absolute, writable directory. */
  const provisionWorkspace = workspacePath => {
    if (!path.isAbsolute(workspacePath)) throw new p.ProjectWorkspaceError(workspacePath, 'must be an absolute path');
    const existing = statSync(workspacePath, {throwIfNoEntry: false});
    if (existing && !existing.isDirectory()) throw new p.ProjectWorkspaceError(workspacePath, 'is not a directory');
    if (!existing) mkdirSync(workspacePath, {recursive: true});
    try {
      accessSync(workspacePath, constants.R_OK | constants.W_OK | constants.X_OK);
    } catch (error) {
      throw error instanceof Error ? new p.ProjectWorkspaceError(workspacePath, 'is not writable') : error;
    }
    return workspacePath;
  };

  const get = (accountId, projectId) => {
    const row = database(accountId).prepare(`select ${COLUMNS} from "projects" where "projects"."id" = ?`).get(projectId);
    return row ? fromRow(row) : undefined;
  };
  const require = (accountId, projectId) => {
    const project = get(accountId, projectId);
    if (!project) throw Error(`Project not found: ${projectId}`);
    return project;
  };
  const setColumns = (accountId, projectId, changes) => {
    const entries = Object.entries(changes).filter(([field, value]) => Object.hasOwn(FIELDS, field) && value !== undefined);
    const values = entries.map(([, value]) => value instanceof Date ? seconds(value) : value);
    database(accountId).prepare(`update "projects" set ${entries.map(([field]) => `"${FIELDS[field]}" = ?`).join(', ')} where "projects"."id" = ?`).run(...values, projectId);
  };

  return {
    list(accountId) {
      const db = database(accountId), projects = db.prepare(`select ${COLUMNS} from "projects"`).all().map(fromRow);
      const latest = new Map(db.prepare('select "project_id", max("created_at") as "last_active_at" from "sessions" where "sessions"."project_id" is not null group by "sessions"."project_id"').all()
        .flatMap(row => row.project_id && row.last_active_at ? [[row.project_id, new Date(row.last_active_at * 1000)]] : []));
      return projects.map(project => ({...project, lastActiveAt: latest.get(project.id) ?? project.lastActiveAt}));
    },
    get,
    require,
    getAvailableId(accountId, projectId) {
      if (!get(accountId, projectId)) return projectId;
      for (let index = 2; ; index++) {
        const candidate = `${projectId}-${index}`;
        if (!get(accountId, candidate)) return candidate;
      }
    },
    create(accountId, project) {
      if (get(accountId, project.id)) throw Error(`Project already exists: ${project.id}`);
      const workspacePath = provisionWorkspace(project.workspacePath);
      database(accountId).prepare('insert into "projects" ("id", "name", "icon", "color", "workspace_path") values (?, ?, ?, ?, ?)')
        .run(project.id, project.name, project.icon ?? 'folder', project.color ?? 'mono', workspacePath);
      const created = require(accountId, project.id);
      p.notifyAgentFileChange(accountId);
      return created;
    },
    update(accountId, projectId, changes) {
      require(accountId, projectId);
      const resolved = changes.workspacePath ? {...changes, workspacePath: provisionWorkspace(changes.workspacePath)} : changes;
      setColumns(accountId, projectId, {...resolved, updatedAt: new Date()});
      p.notifyAgentFileChange(accountId);
    },
    archive(accountId, projectId) {
      setColumns(accountId, projectId, {archivedAt: new Date(), updatedAt: new Date()});
      p.notifyAgentFileChange(accountId);
    },
    touchLastActive(accountId, projectId, at = new Date()) {
      setColumns(accountId, projectId, {lastActiveAt: at});
    },
    remove(accountId, projectId) {
      database(accountId).prepare('delete from "projects" where "projects"."id" = ?').run(projectId);
      p.notifyAgentFileChange(accountId);
    },
  };
}
