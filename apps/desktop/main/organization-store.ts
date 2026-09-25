import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import {
  OrganizationCommitSchema,
  OrganizationLayoutSchema,
  type OrganizationCommit,
  type OrganizationLayout,
  type OrganizationSnapshot,
} from "@aux/contracts";

interface Document {
  revision: number;
  shared: OrganizationLayout["shared"];
  windows: Record<string, OrganizationLayout["window"]>;
}
const MAX_WINDOW_SELECTIONS = 64;

/** One process owns this Profile directory. The renderer never chooses a Profile or window ID. */
export class OrganizationHostStore {
  private document: Document | null;
  private readonly file: string;

  constructor(profileDirectory: string) {
    this.file = join(profileDirectory, "organization.v1.json");
    this.document = this.read();
  }

  private read(): Document | null {
    if (!existsSync(this.file)) return null;
    const raw = JSON.parse(readFileSync(this.file, "utf8")) as Document;
    if (
      !raw ||
      !Number.isSafeInteger(raw.revision) ||
      raw.revision < 0 ||
      !raw.windows ||
      typeof raw.windows !== "object"
    )
      throw new Error("The Profile organization file is invalid.");
    const shared = raw.shared;
    if (Object.keys(raw.windows).length > MAX_WINDOW_SELECTIONS)
      throw new Error("The Profile organization file has too many windows.");
    OrganizationLayoutSchema.parse({
      shared,
      window: Object.values(raw.windows)[0] ?? {
        activeSpaceId: shared?.spaces?.[0]?.id,
        activeTabs: {},
        splitRatio: 0.5,
        tabSpace: {},
        order: [],
        tabFolder: {},
        splits: {},
      },
    });
    for (const window of Object.values(raw.windows)) OrganizationLayoutSchema.parse({ shared, window });
    return raw;
  }

  snapshot(windowId: string): OrganizationSnapshot {
    const current = this.document;
    if (!current) return { revision: 0, layout: null };
    const window = current.windows[windowId] ?? {
      activeSpaceId: current.shared.spaces[0]!.id,
      activeTabs: {},
      splitRatio: 0.5,
      tabSpace: {},
      order: [],
      tabFolder: {},
      splits: {},
    };
    return { revision: current.revision, layout: { shared: current.shared, window } };
  }

  commit(windowId: string, input: OrganizationCommit): OrganizationSnapshot {
    const { expectedRevision, layout } = OrganizationCommitSchema.parse(input);
    const current = this.document;
    if (expectedRevision !== (current?.revision ?? 0)) throw new Error("Organization revision conflict.");
    const next: Document = {
      revision: expectedRevision + 1,
      shared: layout.shared,
      windows: { ...current?.windows, [windowId]: layout.window },
    };
    for (const oldId of Object.keys(next.windows).slice(0, -MAX_WINDOW_SELECTIONS)) {
      if (oldId !== windowId) delete next.windows[oldId];
    }
    mkdirSync(dirname(this.file), { recursive: true, mode: 0o700 });
    const temporary = `${this.file}.${randomUUID()}.tmp`;
    try {
      writeFileSync(temporary, JSON.stringify(next), { flag: "wx", mode: 0o600 });
      renameSync(temporary, this.file);
    } catch (error) {
      rmSync(temporary, { force: true });
      throw error;
    }
    this.document = next;
    return this.snapshot(windowId);
  }
}
