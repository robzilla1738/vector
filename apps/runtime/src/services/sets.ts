import {
  EventTypes,
  newMemberId,
  newSetId,
  VectorError,
  type PageSet,
  type ResultRecord,
  type SetMember,
} from "@vector/contracts";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";
import type { PageService } from "./pages.js";

export class SetService {
  constructor(
    private repo: Repo,
    private events: EventBus,
    private pages: PageService,
  ) {}

  list(): PageSet[] {
    return this.repo.listSets();
  }

  get(setId: string): { set: PageSet; members: SetMember[] } {
    const set = this.repo.getSet(setId);
    if (!set) throw new VectorError("not_found", `no set ${setId}`);
    return { set, members: this.repo.listMembers(setId) };
  }

  async create(opts: {
    name: string;
    source: PageSet["source"];
    urls?: string[];
    pageIds?: string[];
    records?: Record<string, unknown>[];
    collectFromPageId?: string;
    linkSelector?: string;
  }): Promise<PageSet> {
    const setId = newSetId();
    const members: SetMember[] = [];
    let ordinal = 0;

    if (opts.urls) {
      for (const url of opts.urls) {
        members.push({ memberId: newMemberId(), setId, ordinal: ordinal++, url, status: "queued" });
      }
    }
    if (opts.pageIds) {
      for (const pid of opts.pageIds) {
        const p = this.pages.get(pid);
        members.push({
          memberId: newMemberId(),
          setId,
          ordinal: ordinal++,
          url: p.url,
          label: p.title || undefined,
          pageId: pid,
          status: "queued",
        });
      }
    }
    if (opts.records) {
      for (const rec of opts.records) {
        members.push({
          memberId: newMemberId(),
          setId,
          ordinal: ordinal++,
          url: typeof rec.url === "string" ? rec.url : undefined,
          recordKey: typeof rec.id === "string" ? rec.id : undefined,
          label: typeof rec.title === "string" ? rec.title : undefined,
          status: "queued",
        });
      }
    }
    if (opts.collectFromPageId) {
      const page = this.pages.get(opts.collectFromPageId);
      const obs = await this.pages.observe(opts.collectFromPageId, { scope: "links" });
      void page;
      const sel = opts.linkSelector;
      const links = sel
        ? obs.content.elements.filter((e) => e.href && e.selector.css?.includes(sel.replace(/^.*\s/, "").split(/[>:\[]/)[0] ?? ""))
        : obs.content.links;
      const seen = new Set<string>();
      for (const l of links) {
        if (!l.href) continue;
        const abs = new URL(l.href, obs.content.url).href;
        if (seen.has(abs)) continue;
        seen.add(abs);
        members.push({
          memberId: newMemberId(),
          setId,
          ordinal: ordinal++,
          url: abs,
          label: l.text || undefined,
          status: "queued",
        });
      }
    }

    const set: PageSet = {
      setId,
      name: opts.name,
      source: opts.source,
      memberIds: members.map((m) => m.memberId),
      createdAt: Date.now(),
    };
    this.repo.saveSet(set);
    for (const m of members) this.repo.saveMember(m);
    this.events.emit(EventTypes.SetUpdated, { set });
    return set;
  }

  updateMember(m: SetMember) {
    this.repo.saveMember(m);
    this.events.emit(EventTypes.MemberUpdated, { member: m });
  }

  results(setId: string, status?: ResultRecord["status"]): ResultRecord[] {
    return this.repo.listResults({ setId, status });
  }
}
