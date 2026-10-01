import type { OrganizationCommit, OrganizationLayout, OrganizationSnapshot } from "@aux/contracts";
import { tidyFoldersMatch } from "../tidy-layout";
import type { Layout } from "../workspace";
import {
  fromOrganizationLayout,
  rebaseOrganizationLayout,
  toOrganizationLayout,
} from "./organization-layout";

const STALE_TIDY_UNDO = "This Tidy change is out of date. Review the folders and tabs before undoing.";

function tidyUndoRemovedFolders(
  base: OrganizationLayout | null | undefined,
  local: OrganizationLayout,
): boolean {
  const receipt = base?.shared.tidyUndo;
  if (!receipt || local.shared.tidyUndo) return false;
  const created = new Set(receipt.created.map((folder) => folder.id));
  return (
    base.shared.folders.some((folder) => created.has(folder.id)) &&
    !local.shared.folders.some((folder) => created.has(folder.id))
  );
}

function sameTidyState(left: OrganizationLayout, right: OrganizationLayout): boolean {
  const leftReceipt = left.shared.tidyUndo;
  const rightReceipt = right.shared.tidyUndo;
  if (!leftReceipt && !rightReceipt) return true;
  if (!leftReceipt || !rightReceipt || JSON.stringify(leftReceipt) !== JSON.stringify(rightReceipt))
    return false;
  if (!tidyFoldersMatch(leftReceipt.created, right.shared.folders)) return false;
  const created = new Set(leftReceipt.created.map((folder) => folder.id));
  const assignments = (layout: OrganizationLayout) =>
    Object.entries(layout.shared.tabFolder)
      .filter(([, folderId]) => created.has(folderId))
      .sort(([leftId], [rightId]) => leftId.localeCompare(rightId))
      .map(([pageId, folderId]) => `${pageId}\0${folderId}`);
  return JSON.stringify(assignments(left)) === JSON.stringify(assignments(right));
}

export interface OrganizationHost {
  organizationSnapshot(): Promise<OrganizationSnapshot>;
  organizationCommit(input: OrganizationCommit): Promise<OrganizationSnapshot>;
}

/** Serializes renderer writes and rebases a stale window on the latest Profile revision. */
export class OrganizationPersistence {
  private base: OrganizationSnapshot | null = null;
  private hydratePromise: Promise<Layout> | null = null;
  private pending: Layout | null = null;
  private flushing: Promise<void> | null = null;

  constructor(
    private readonly host: OrganizationHost,
    private readonly initial: Layout,
  ) {}

  hydrate(): Promise<Layout> {
    return (this.hydratePromise ??= this.load());
  }

  private async load(): Promise<Layout> {
    let snapshot = await this.host.organizationSnapshot();
    if (!snapshot.layout) {
      try {
        snapshot = await this.host.organizationCommit({
          expectedRevision: snapshot.revision,
          layout: toOrganizationLayout(this.initial),
        });
      } catch {
        snapshot = await this.host.organizationSnapshot();
        if (!snapshot.layout) throw new Error("Profile organization could not be initialized.");
      }
    }
    this.base = snapshot;
    const loaded = fromOrganizationLayout(snapshot.layout!);
    if (!this.pending) return loaded;
    this.pending = fromOrganizationLayout(
      rebaseOrganizationLayout(
        toOrganizationLayout(this.initial),
        toOrganizationLayout(this.pending),
        snapshot.layout!,
      ),
    );
    return this.pending;
  }

  persist(layout: Layout): void {
    this.pending = layout;
  }

  async refresh(): Promise<Layout> {
    await this.hydrate();
    await this.flushing?.catch(() => {});
    const latest = await this.host.organizationSnapshot();
    const base = this.base!;
    if (!latest.layout || latest.revision <= base.revision)
      return this.pending ?? fromOrganizationLayout(base.layout!);
    const pendingLayout = this.pending ? toOrganizationLayout(this.pending) : null;
    // A queued undo must not merge over a Tidy folder or tab that changed underneath it.
    if (
      pendingLayout &&
      base.layout &&
      tidyUndoRemovedFolders(base.layout, pendingLayout) &&
      !sameTidyState(base.layout, latest.layout)
    ) {
      this.pending = null;
      this.base = latest;
      return fromOrganizationLayout(latest.layout);
    }
    const merged = pendingLayout
      ? rebaseOrganizationLayout(base.layout!, pendingLayout, latest.layout)
      : latest.layout;
    this.base = latest;
    if (this.pending) this.pending = fromOrganizationLayout(merged);
    return fromOrganizationLayout(merged);
  }

  /** Commit `next` only when the host still matches the layout Undo was reviewed against. */
  async commitReviewed(reviewed: Layout, next: Layout): Promise<void> {
    await this.flushing?.catch(() => {});
    const state: { current: Promise<void> | null } = { current: null };
    const commit = this.writeReviewed(reviewed, next).finally(() => {
      if (this.flushing === state.current) this.flushing = null;
    });
    state.current = commit;
    this.flushing = commit;
    await commit;
  }

  private async writeReviewed(reviewed: Layout, next: Layout): Promise<void> {
    await this.hydrate();
    const observed = await this.host.organizationSnapshot();
    if (
      !observed.layout ||
      JSON.stringify(fromOrganizationLayout(observed.layout)) !== JSON.stringify(reviewed)
    ) {
      throw new Error(STALE_TIDY_UNDO);
    }
    const pendingAtStart = this.pending;
    try {
      this.base = await this.host.organizationCommit({
        expectedRevision: observed.revision,
        layout: toOrganizationLayout(next),
      });
      if (this.pending === pendingAtStart) this.pending = null;
    } catch (error) {
      const latest = await this.host.organizationSnapshot();
      if (latest.layout && latest.revision !== observed.revision) {
        this.base = latest;
        throw new Error(STALE_TIDY_UNDO);
      }
      throw error;
    }
  }

  /** A native Profile import replaces the entire reviewed layout. Local tab
   * patches observed during import must not be rebased back over it. */
  async adoptNativeImport(): Promise<Layout> {
    await this.flushing?.catch(() => {});
    const latest = await this.host.organizationSnapshot();
    this.pending = null;
    if (!latest.layout) {
      this.base = null;
      this.hydratePromise = null;
      return this.hydrate();
    }
    this.base = latest;
    return fromOrganizationLayout(latest.layout);
  }

  flush(): Promise<void> {
    return (this.flushing ??= this.write().finally(() => {
      this.flushing = null;
    }));
  }

  private async write(): Promise<void> {
    await this.hydrate();
    while (this.pending) {
      const pending = this.pending;
      this.pending = null;
      let local = toOrganizationLayout(pending);
      for (let attempt = 0; attempt < 5; attempt++) {
        const base = this.base!;
        if (base.layout && JSON.stringify(local) === JSON.stringify(base.layout)) break;
        try {
          this.base = await this.host.organizationCommit({ expectedRevision: base.revision, layout: local });
          break;
        } catch (error) {
          const latest = await this.host.organizationSnapshot();
          if (latest.revision === base.revision || !latest.layout) {
            this.pending ??= pending;
            throw error;
          }
          // Rebase would treat a stale Tidy undo as a folder deletion.
          if (
            base.layout &&
            tidyUndoRemovedFolders(base.layout, local) &&
            !sameTidyState(base.layout, latest.layout)
          ) {
            throw new Error(STALE_TIDY_UNDO);
          }
          local = rebaseOrganizationLayout(
            base.layout ?? toOrganizationLayout(this.initial),
            local,
            latest.layout,
          );
          this.base = latest;
          if (attempt === 4) {
            this.pending ??= pending;
            throw new Error("Profile organization kept changing. Try again.");
          }
        }
      }
    }
  }
}
