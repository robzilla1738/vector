import { randomUUID } from "node:crypto";
import { VectorError, type DatasetHandle, type StateQuery, type StateQueryResult } from "@vector/contracts";
import type { Repo } from "../store/repo.js";
import type { PageService } from "./pages.js";
import type { OperationService } from "./operations.js";

const newId = (p: string) => `${p}_${randomUUID().slice(0, 12)}`;

type Row = Record<string, unknown>;

function match(row: Row, where?: { field: string; op: string; value: unknown }[]): boolean {
  if (!where?.length) return true;
  return where.every((w) => {
    const v = w.field.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Row)[k] : undefined), row);
    switch (w.op) {
      case "eq": return v === w.value || JSON.stringify(v) === JSON.stringify(w.value);
      case "ne": return !(v === w.value || JSON.stringify(v) === JSON.stringify(w.value));
      case "contains": return String(v ?? "").includes(String(w.value));
      case "in": return Array.isArray(w.value) && (w.value as unknown[]).some((x) => x === v || JSON.stringify(x) === JSON.stringify(v));
      case "gt": return Number(v) > Number(w.value);
      case "gte": return Number(v) >= Number(w.value);
      case "lt": return Number(v) < Number(w.value);
      case "lte": return Number(v) <= Number(w.value);
      default: return false;
    }
  });
}

const project = (rows: Row[], select?: string[]): Row[] =>
  select?.length ? rows.map((r) => Object.fromEntries(select.map((f) => [f, r[f]]))) : rows;

/**
 * The state index (§8.3): every queryable entity reads from persisted state
 * — captured responses, results, datasets, artifacts, live page controls —
 * so answering "what do we already know" never needs inference or re-work.
 */
export class StateService {
  constructor(
    private deps: { repo: Repo; pages: PageService; operations?: OperationService },
  ) {}

  query(q: StateQuery): StateQueryResult {
    const { rows, explain } = this.load(q);
    const filtered = rows.filter((r) => match(r, q.where));
    // position-based cursor — stable because load() orders deterministically
    filtered.forEach((r, i) => (r["__cursor"] = i));
    const start = q.cursor ? filtered.findIndex((r) => String(r["__cursor"]) === q.cursor) + 1 : 0;
    const lim = Math.min(q.limit ?? 500, 5000);
    const pageRows = filtered.slice(Math.max(start, 0), Math.max(start, 0) + lim);
    const truncated = Math.max(start, 0) + lim < filtered.length;
    const nextCursor = truncated ? String(pageRows[pageRows.length - 1]?.["__cursor"] ?? filtered.length) : undefined;
    const handle: DatasetHandle = {
      datasetId: `adhoc:${q.entity}`,
      source: `state.${q.entity}`,
      schema: pageRows.length ? Object.keys(pageRows[0]!).filter((k) => k !== "__cursor") : [],
      rowCount: filtered.length,
      coverage: { kind: filtered.length ? "complete" : "unknown", basis: "state index" },
      freshness: "live",
    };
    return {
      dataset: handle,
      rows: project(pageRows, q.select).map(({ __cursor, ...r }) => r),
      count: filtered.length,
      truncated,
      nextCursor,
      explain,
    };
  }

  private load(q: StateQuery): { rows: Row[]; explain: string } {
    switch (q.entity) {
      case "responses": {
        const pageIds = q.scope?.pageIds ?? [];
        const rows = pageIds.flatMap((pid) =>
          this.deps.repo.listResponses(pid, { since: q.scope?.runId ? undefined : undefined, limit: 1000 }),
        );
        return { rows: rows as unknown as Row[], explain: `responses captured on ${pageIds.length || "all"} scoped page(s)` };
      }
      case "records": {
        const rows = this.deps.repo.listResults({ runId: q.scope?.runId }) as unknown as Row[];
        return { rows, explain: "persisted extraction results" };
      }
      case "controls": {
        const pageIds = q.scope?.pageIds ?? this.deps.pages.livePageIds();
        const rows = pageIds.flatMap((pid) => {
          const last = this.deps.repo.latestObservation(pid);
          if (!last) return [];
          const c = JSON.parse(last.json) as { content?: { formFields?: Row[] }; formFields?: Row[] };
          const fields = c.content?.formFields ?? c.formFields ?? [];
          return fields.map((f) => ({ pageId: pid, revision: last.revision, ...f }));
        });
        return { rows, explain: "form controls from latest observations" };
      }
      case "artifacts": {
        const rows = this.deps.repo.listArtifacts({ runId: q.scope?.runId, pageId: q.scope?.pageIds?.[0] }) as unknown as Row[];
        return { rows, explain: "captured artifacts" };
      }
      case "operations": {
        const rows = this.deps.repo.listOperations() as unknown as Row[];
        return { rows, explain: "registered operations" };
      }
      case "datasets": {
        const rows = this.deps.repo.listDatasets({ runId: q.scope?.runId, pageId: q.scope?.pageIds?.[0] }) as unknown as Row[];
        return { rows, explain: "materialized datasets" };
      }
      default:
        throw new VectorError("invalid_params", `unknown entity ${(q as { entity: string }).entity}`);
    }
  }

  // ---------- datasets ----------

  listDatasets(filter?: { runId?: string; pageId?: string }): DatasetHandle[] {
    return this.deps.repo.listDatasets(filter).map((d) => ({
      datasetId: d.datasetId,
      source: d.source,
      schema: d.schema as string[],
      rowCount: d.rowCount,
      coverage: { kind: "complete" as const, basis: "materialized" },
      freshness: d.stale ? ("previously-observed" as const) : ("live" as const),
      provenance: d.provenance,
      stale: d.stale,
    }));
  }

  /** Materialize rows into a first-class dataset handle. */
  saveDataset(opts: {
    rows: Row[];
    source: string;
    runId?: string;
    pageId?: string;
    schema?: string[];
    provenance?: string;
  }): DatasetHandle {
    const datasetId = newId("ds");
    this.deps.repo.saveDataset({
      datasetId,
      runId: opts.runId,
      pageId: opts.pageId,
      source: opts.source,
      schema: (opts.schema ?? Object.keys(opts.rows[0] ?? {})).map((s) => ({ name: s })),
      rows: opts.rows,
      provenance: opts.provenance,
    });
    return {
      datasetId,
      source: opts.source,
      schema: opts.schema ?? Object.keys(opts.rows[0] ?? {}),
      rowCount: opts.rows.length,
      coverage: { kind: "complete", basis: "materialized" },
      freshness: "live",
      provenance: opts.provenance,
    };
  }

  /** Local transforms over a materialized dataset — no inference (§7.6). */
  transform(datasetId: string, op: string, args: Record<string, unknown> = {}): DatasetHandle {
    const d = this.deps.repo.getDataset(datasetId);
    if (!d) throw new VectorError("not_found", `no dataset ${datasetId}`);
    let rows = d.rows as Row[];
    switch (op) {
      case "project": {
        const fields = (args.fields as string[]) ?? [];
        rows = rows.map((r) => Object.fromEntries(fields.map((f) => [f, r[f]])));
        break;
      }
      case "filter":
        rows = rows.filter((r) => match(r, args.where as { field: string; op: string; value: unknown }[]));
        break;
      case "sort": {
        const field = String(args.field ?? "");
        const dir = args.dir === "desc" ? -1 : 1;
        rows = [...rows].sort((a, b) => (String(a[field]) > String(b[field]) ? dir : -dir));
        break;
      }
      case "dedup": {
        const field = String(args.field ?? "");
        const seen = new Set<string>();
        rows = rows.filter((r) => {
          const k = JSON.stringify(field ? r[field] : r);
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        break;
      }
      case "limit":
        rows = rows.slice(0, Number(args.n ?? rows.length));
        break;
      case "group": {
        const field = String(args.field ?? "");
        const groups = new Map<string, number>();
        for (const r of rows) groups.set(String(r[field]), (groups.get(String(r[field])) ?? 0) + 1);
        rows = [...groups.entries()].map(([k, n]) => ({ [field || "key"]: k, count: n }));
        break;
      }
      case "join": {
        // inner join against another materialized dataset on key equality
        const rightId = String(args.right ?? "");
        const right = this.deps.repo.getDataset(rightId);
        if (!right) throw new VectorError("not_found", `no dataset ${rightId} to join against`);
        const lf = String(args.leftField ?? args.field ?? "");
        const rf = String(args.rightField ?? lf);
        const rrows = right.rows as Row[];
        rows = rows.flatMap((l) =>
          rrows
            .filter((r) => JSON.stringify(l[lf]) === JSON.stringify(r[rf]))
            .map((r) => ({ ...l, ...Object.fromEntries(Object.entries(r).map(([k, v]) => [`r_${k}`, v])) })),
        );
        break;
      }
      case "export":
        // handled by the caller — the dataset is already materialized; the
        // export is just a handle over all rows (API can fetch rows() after)
        break;
      default:
        throw new VectorError("invalid_params", `unknown transform ${op}`);
    }
    return this.saveDataset({
      rows,
      source: `${d.source}|${op}`,
      runId: d.runId,
      pageId: d.pageId,
      provenance: `transform:${op} of ${datasetId}`,
    });
  }

  rows(datasetId: string): Row[] {
    const d = this.deps.repo.getDataset(datasetId);
    if (!d) throw new VectorError("not_found", `no dataset ${datasetId}`);
    return d.rows as Row[];
  }
}
