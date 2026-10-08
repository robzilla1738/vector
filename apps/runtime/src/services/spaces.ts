import { randomUUID } from "node:crypto";
import {
  BrowserSpaceSchema,
  AuxError,
  type BrowserSpace,
  type ProfileOrganizationSnapshot,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { EventBus } from "../events.js";

const SPACE_KEY = "browserSpaces";
const BINDINGS_KEY = "browserSpaceBindings";
const REVISION_KEY = "browserSpacesNativeRevision";
type Binding = { id: string; workspaceId: string };

/** Native presentation and runtime task scope share exact identities, never names. */
export class SpaceService {
  constructor(
    private repo: Repo,
    private events: EventBus,
  ) {}

  list(): BrowserSpace[] {
    const saved = BrowserSpaceSchema.array().parse(this.repo.getSetting(SPACE_KEY) ?? []);
    const workspaces = this.repo.listWorkspaces();
    const bindings = this.repo.getSetting<Binding[]>(BINDINGS_KEY) ?? saved;
    const mapped = new Set(bindings.map((space) => space.workspaceId));
    return [
      ...saved.filter((space) => workspaces.some((workspace) => workspace.workspaceId === space.workspaceId)),
      ...workspaces
        .filter((workspace) => !mapped.has(workspace.workspaceId))
        .map((workspace) => ({
          id: `workspace:${workspace.workspaceId}`,
          workspaceId: workspace.workspaceId,
          name: workspace.name,
          color: "slate" as const,
          grain: 0,
          archived: false,
        })),
    ];
  }

  /** Input comes only from the authenticated original Profile's organization snapshot. */
  reconcileNative(snapshot: ProfileOrganizationSnapshot): BrowserSpace[] {
    if (!snapshot.shared) return this.list();
    const revision = this.repo.getSetting<number>(REVISION_KEY);
    if (revision !== undefined && snapshot.revision < revision)
      throw new AuxError("conflict", "Native Space organization changed. Refresh its workspace mappings.");
    if (snapshot.revision === revision) {
      const workspaces = new Set(this.repo.listWorkspaces().map((workspace) => workspace.workspaceId));
      const saved = BrowserSpaceSchema.array().parse(this.repo.getSetting(SPACE_KEY) ?? []);
      if (saved.every((space) => workspaces.has(space.workspaceId))) return this.list();
    }
    const presentation = [
      ...snapshot.shared.spaces.map((space) => ({ ...space, archived: false })),
      ...snapshot.shared.archivedSpaces.map((space) => ({ ...space, archived: true })),
    ];
    if (new Set(presentation.map((space) => space.id)).size !== presentation.length)
      throw new AuxError("conflict", "Native Space identities are duplicated.");
    const spaces = this.repo.transaction(() => {
      const workspaces = new Set(this.repo.listWorkspaces().map((workspace) => workspace.workspaceId));
      const saved = BrowserSpaceSchema.array().parse(this.repo.getSetting(SPACE_KEY) ?? []);
      const retained = this.repo.getSetting<Binding[]>(BINDINGS_KEY) ?? saved;
      const bindings = new Map(
        retained
          .filter((space) => workspaces.has(space.workspaceId))
          .map((space) => [space.id, space.workspaceId]),
      );
      const unmapped = new Map(this.list().map((space) => [space.id, space.workspaceId]));
      const spaces = presentation.map((space) => {
        let workspaceId = bindings.get(space.id) ?? unmapped.get(space.id);
        if (!workspaceId) {
          workspaceId = randomUUID();
          this.repo.insertWorkspace(workspaceId, space.name, Date.now());
        } else this.repo.renameWorkspace(workspaceId, space.name);
        bindings.set(space.id, workspaceId);
        // A renderer may have written workspaceId into presentation; it cannot grant task authority.
        return BrowserSpaceSchema.parse({ ...space, workspaceId });
      });
      this.repo.setSetting(SPACE_KEY, spaces);
      this.repo.setSetting(
        BINDINGS_KEY,
        [...bindings].map(([id, workspaceId]) => ({ id, workspaceId })),
      );
      this.repo.setSetting(REVISION_KEY, snapshot.revision);
      return this.list();
    });
    this.events.emit("spaces.updated", { spaces });
    return spaces;
  }
}
