import type { OrganizationCommit, OrganizationSnapshot } from "@aux/contracts";
import type { Layout } from "../workspace";
import {
  fromOrganizationLayout,
  rebaseOrganizationLayout,
  toOrganizationLayout,
} from "./organization-layout";

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
    private readonly legacy: Layout,
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
          layout: toOrganizationLayout(this.legacy),
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
        toOrganizationLayout(this.legacy),
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
    const merged = this.pending
      ? rebaseOrganizationLayout(base.layout!, toOrganizationLayout(this.pending), latest.layout)
      : latest.layout;
    this.base = latest;
    if (this.pending) this.pending = fromOrganizationLayout(merged);
    return fromOrganizationLayout(merged);
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
          local = rebaseOrganizationLayout(
            base.layout ?? toOrganizationLayout(this.legacy),
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
