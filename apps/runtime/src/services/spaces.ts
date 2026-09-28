import { randomUUID } from "node:crypto";
import { BrowserSpaceSchema, AuxError, type BrowserSpace, type SpaceInput, type Workspace } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { EventBus } from "../events.js";

const SPACE_KEY = "browserSpaces";

/** Browser organization and task context share identities, never name-based guesses. */
export class SpaceService {
  constructor(private repo: Repo, private events: EventBus) {}

  list(): BrowserSpace[] {
    const saved = BrowserSpaceSchema.array().parse(this.repo.getSetting(SPACE_KEY) ?? []);
    const workspaces = this.repo.db.prepare("SELECT workspace_id AS workspaceId,name,created_at AS createdAt FROM workspaces ORDER BY created_at,workspace_id").all() as unknown as Workspace[];
    const mapped = new Set(saved.map(space => space.workspaceId));
    return [
      ...saved.map(space => ({ ...space, name: workspaces.find(workspace => workspace.workspaceId === space.workspaceId)?.name ?? space.name })),
      ...workspaces.filter(workspace => !mapped.has(workspace.workspaceId)).map(workspace => ({
        id: `workspace:${workspace.workspaceId}`, workspaceId: workspace.workspaceId,
        name: workspace.name, color: "slate" as const, grain: 0, archived: false,
      })),
    ];
  }

  import(inputs: SpaceInput[]): BrowserSpace[] {
    let changed = false;
    const spaces = this.repo.transaction(() => {
      const spaces = this.list();
      for (const input of inputs) {
        if (spaces.some(space => space.id === input.id)) continue;
        const workspaceId = randomUUID();
        this.repo.db.prepare("INSERT INTO workspaces VALUES(?,?,?)").run(workspaceId, input.name, Date.now());
        spaces.push({ ...input, workspaceId, archived: false });
        changed = true;
      }
      this.repo.setSetting(SPACE_KEY, spaces);
      return spaces;
    });
    if (changed) this.events.emit("spaces.updated", { spaces });
    return spaces;
  }

  create(name: string, color: BrowserSpace["color"], grain = 0, theme?: BrowserSpace["theme"]): BrowserSpace[] {
    return this.import([{ id: `space-${randomUUID()}`, name, color, grain, ...(theme ? { theme } : {}) }]);
  }

  update(id: string, patch: Partial<Pick<BrowserSpace, "name" | "color" | "grain" | "archived">> & { theme?: BrowserSpace["theme"] | null }): BrowserSpace[] {
    const spaces = this.repo.transaction(() => {
      const spaces = this.list();
      const current = spaces.find(space => space.id === id);
      if (!current) throw new AuxError("not_found", "This space no longer exists.");
      if (patch.archived && !current.archived && spaces.filter(space => !space.archived).length === 1) {
        throw new AuxError("conflict", "Keep at least one active space.");
      }
      Object.assign(current, patch);
      if (patch.theme === null) delete current.theme;
      if (patch.name) this.repo.db.prepare("UPDATE workspaces SET name=? WHERE workspace_id=?").run(patch.name, current.workspaceId);
      this.repo.setSetting(SPACE_KEY, spaces);
      return spaces;
    });
    this.events.emit("spaces.updated", { spaces });
    return spaces;
  }
}
