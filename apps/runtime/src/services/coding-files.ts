import { createHash, randomUUID } from "node:crypto";
import { AuxError } from "@aux/contracts";
import type {
  CodingFileChange,
  CloudCodingIdentity,
  CodingFileReceipt,
  CodingFileSnapshot,
  CodingFileState,
  CodingFileStat,
  CodingSearchRequest,
  CodingSearchResult,
} from "@aux/contracts/coding-files";
import type { Repo } from "../store/repo.js";

export interface CodingFileBackend {
  readonly execution?: CloudCodingIdentity;
  requirePath(path: string, access: "read" | "write", runId?: string): string;
  coding<T>(
    request: Record<string, unknown>,
    runId?: string,
    signal?: AbortSignal,
    beforeDispatch?: () => void,
    context?: CodingFileContext,
  ): Promise<T>;
}

export interface CodingFileContext {
  runId: string;
  actor?: "user";
  signal?: AbortSignal;
  checkOwner?: () => void;
  verifyOwner?: () => Promise<void>;
}
export interface CodingFileAuthorization {
  category: "read" | "file_write" | "file_delete";
  actionId: string;
  categories?: ("file_write" | "file_delete")[];
  paths: string[];
  before?: CodingFileState[];
  after?: CodingFileState[];
}
export type AuthorizeCodingFiles = (
  request: CodingFileAuthorization,
  context: CodingFileContext,
) => Promise<void | (() => void)>;
const version = (content: string, mode?: number) =>
  createHash("sha256")
    .update(mode === undefined ? content : JSON.stringify([content, mode]))
    .digest("hex");

/** Shared tool/code-mode surface. Before-images never leave protected persistence through receipts. */
export class CodingFilesService {
  private queue: Promise<unknown> = Promise.resolve();
  constructor(
    private readonly repo: Repo,
    private readonly filesystem: CodingFileBackend,
    private readonly authorize: AuthorizeCodingFiles,
  ) {}
  private boundary(context: CodingFileContext): void {
    if (context.signal?.aborted) throw new AuxError("cancelled", "File operation was cancelled.");
    context.checkOwner?.();
  }
  async authorizeInspection(context: CodingFileContext, actionId: string): Promise<() => void> {
    this.boundary(context);
    const fence = await this.authorize({ category: "read", actionId, paths: [] }, context);
    const check = () => {
      this.boundary(context);
      fence?.();
    };
    check();
    return check;
  }
  private async readState(path: string, context: CodingFileContext): Promise<CodingFileState> {
    this.boundary(context);
    return this.filesystem.coding({ kind: "read", path }, context.runId, context.signal, undefined, context);
  }
  private async readStates(paths: string[], context: CodingFileContext): Promise<CodingFileState[]> {
    this.boundary(context);
    return this.filesystem.coding(
      { kind: "snapshots", path: paths[0], paths },
      context.runId,
      context.signal,
      undefined,
      context,
    );
  }
  async read(
    request: { path: string; startLine?: number; endLine?: number },
    context: CodingFileContext,
  ): Promise<CodingFileSnapshot> {
    const fence = await this.authorize(
      { category: "read", actionId: `read:${request.path}`, paths: [request.path] },
      context,
    );
    const state = await this.readState(request.path, context);
    this.boundary(context);
    fence?.();
    if (state.version === null) throw new AuxError("not_found", "File does not exist.");
    if (state.content === null)
      throw new AuxError(
        "capability_unsupported",
        "Binary files expose versions and changes, rather than text ranges.",
      );
    const start = request.startLine ?? 1,
      end = request.endLine ?? Infinity;
    if (!Number.isInteger(start) || start < 1 || end < start || (end !== Infinity && !Number.isInteger(end)))
      throw new AuxError("invalid_params", "Invalid line range.");
    const content =
      request.startLine !== undefined || request.endLine !== undefined
        ? state.content
            .split(/\r?\n/)
            .slice(start - 1, end)
            .join("\n")
        : state.content;
    return { path: state.path, content, version: state.version };
  }
  async search(request: CodingSearchRequest, context: CodingFileContext): Promise<CodingSearchResult> {
    const fence = await this.authorize(
      { category: "read", actionId: `search:${request.root}`, paths: [request.root] },
      context,
    );
    this.boundary(context);
    const result = await this.filesystem.coding<CodingSearchResult>(
      { kind: "search", ...request },
      context.runId,
      context.signal,
      undefined,
      context,
    );
    this.boundary(context);
    fence?.();
    return result;
  }
  async list(
    path: string,
    context: CodingFileContext,
  ): Promise<{ path: string; kind: "file" | "directory" }[]> {
    const fence = await this.authorize(
      { category: "read", actionId: `list:${path}`, paths: [path] },
      context,
    );
    this.boundary(context);
    const result = await this.filesystem.coding<{ path: string; kind: "file" | "directory" }[]>(
      { kind: "list", path },
      context.runId,
      context.signal,
      undefined,
      context,
    );
    this.boundary(context);
    fence?.();
    return result;
  }
  async stat(path: string, context: CodingFileContext): Promise<CodingFileStat> {
    const fence = await this.authorize(
      { category: "read", actionId: `stat:${path}`, paths: [path] },
      context,
    );
    this.boundary(context);
    const result = await this.filesystem.coding<CodingFileStat>(
      { kind: "stat", path },
      context.runId,
      context.signal,
      undefined,
      context,
    );
    this.boundary(context);
    fence?.();
    return result;
  }
  async versions(
    paths: string[],
    context: CodingFileContext,
  ): Promise<{ path: string; version: string | null }[]> {
    if (!paths.length) return [];
    this.boundary(context);
    const fence = await this.authorize({ category: "read", actionId: "file-versions", paths }, context);
    const versions: { path: string; version: string | null }[] = [];
    for (let offset = 0; offset < paths.length; offset += 100) {
      this.boundary(context);
      fence?.();
      const batch = paths.slice(offset, offset + 100);
      versions.push(
        ...(await this.filesystem.coding<{ path: string; version: string | null }[]>(
          { kind: "versions", path: batch[0], paths: batch },
          context.runId,
          context.signal,
          undefined,
          context,
        )),
      );
    }
    this.boundary(context);
    fence?.();
    return versions;
  }
  private save(receipt: CodingFileReceipt): void {
    const protectedJson = this.repo.protectRecordField(
      "coding_file_receipts",
      [receipt.receiptId],
      "receipt",
      JSON.stringify(receipt),
    );
    this.repo.db
      .prepare(
        `INSERT INTO coding_file_receipts(receipt_id,run_id,action_id,created_at,status,receipt,summary) VALUES(?,?,?,?,?,?,?) ON CONFLICT(receipt_id) DO UPDATE SET status=excluded.status,receipt=excluded.receipt,summary=excluded.summary`,
      )
      .run(
        receipt.receiptId,
        receipt.runId,
        receipt.actionId,
        receipt.createdAt,
        receipt.status,
        protectedJson,
        this.repo.protectRecordField(
          "coding_file_receipts",
          [receipt.receiptId],
          "summary",
          JSON.stringify(this.metadata(receipt)),
        ),
      );
  }
  private load(row: { receipt_id: string; receipt: string }): CodingFileReceipt {
    return JSON.parse(
      this.repo.revealRecordField("coding_file_receipts", [row.receipt_id], "receipt", row.receipt),
    ) as CodingFileReceipt;
  }
  changes(runId: string): CodingFileReceipt[] {
    const rows = this.repo.db
      .prepare("SELECT receipt_id,receipt FROM coding_file_receipts WHERE run_id=? ORDER BY created_at,rowid")
      .all(runId) as unknown as { receipt_id: string; receipt: string }[];
    return rows.map((row) => this.load(row));
  }
  private metadata(receipt: CodingFileReceipt): CodingFileReceipt {
    const state = ({ content, contentBase64, ...rest }: CodingFileState): CodingFileState => ({
      ...rest,
      content: content === null ? null : "",
      ...(contentBase64 !== undefined ? { contentBase64: "" } : {}),
    });
    return { ...receipt, before: receipt.before.map(state), after: receipt.after.map(state) };
  }
  changeViews(
    runId: string,
    request: { receiptId?: string; path?: string; full?: boolean } = {},
  ): CodingFileReceipt[] {
    if (!request.receiptId) {
      const rows = this.repo.db
        .prepare(
          "SELECT receipt_id,summary FROM coding_file_receipts WHERE run_id=? ORDER BY created_at,rowid",
        )
        .all(runId) as { receipt_id: string; summary: string }[];
      return rows.map(
        (row) =>
          JSON.parse(
            this.repo.revealRecordField("coding_file_receipts", [row.receipt_id], "summary", row.summary),
          ) as CodingFileReceipt,
      );
    }
    const receipt = this.get(request.receiptId, runId);
    const state = (value: CodingFileState): CodingFileState => {
      const { contentBase64, ...rest } = value;
      const content =
        value.content === null ? null : request.full ? value.content : value.content.slice(0, 65536);
      return {
        ...rest,
        content,
        ...(contentBase64 !== undefined ? { contentBase64: "" } : {}),
        contentTruncated: !request.full && (value.content?.length ?? 0) > 65536,
      };
    };
    return [
      {
        ...receipt,
        before: receipt.before.filter((value) => !request.path || value.path === request.path).map(state),
        after: receipt.after.filter((value) => !request.path || value.path === request.path).map(state),
      },
    ];
  }
  recentChangeViews(runId: string, limit = 12): CodingFileReceipt[] {
    const rows = this.repo.db
      .prepare(
        "SELECT receipt_id,summary FROM coding_file_receipts WHERE run_id=? ORDER BY created_at DESC,rowid DESC LIMIT ?",
      )
      .all(runId, limit) as { receipt_id: string; summary: string }[];
    return rows
      .reverse()
      .map(
        (row) =>
          JSON.parse(
            this.repo.revealRecordField("coding_file_receipts", [row.receipt_id], "summary", row.summary),
          ) as CodingFileReceipt,
      );
  }
  recentChanges(runId: string, limit = 12): CodingFileReceipt[] {
    const rows = this.repo.db
      .prepare(
        "SELECT receipt_id,receipt FROM coding_file_receipts WHERE run_id=? ORDER BY created_at DESC,rowid DESC LIMIT ?",
      )
      .all(runId, limit) as unknown as { receipt_id: string; receipt: string }[];
    return rows.reverse().map((row) => this.load(row));
  }
  unresolved(runId: string): CodingFileReceipt[] {
    const rows = this.repo.db
      .prepare(
        "SELECT receipt_id,receipt FROM coding_file_receipts WHERE run_id=? AND status IN ('pending','uncertain') ORDER BY created_at,rowid",
      )
      .all(runId) as unknown as { receipt_id: string; receipt: string }[];
    return rows.map((row) => this.load(row));
  }
  unresolvedIds(runId: string): string[] {
    return (
      this.repo.db
        .prepare(
          "SELECT receipt_id FROM coding_file_receipts WHERE run_id=? AND status IN ('pending','uncertain') ORDER BY created_at,rowid",
        )
        .all(runId) as unknown as { receipt_id: string }[]
    ).map((row) => row.receipt_id);
  }
  receiptIds(runId: string, limit = 32): string[] {
    return (
      this.repo.db
        .prepare(
          "SELECT receipt_id FROM coding_file_receipts WHERE run_id=? ORDER BY created_at DESC,rowid DESC LIMIT ?",
        )
        .all(runId, limit) as unknown as { receipt_id: string }[]
    )
      .reverse()
      .map((row) => row.receipt_id);
  }
  count(runId: string): number {
    return (
      this.repo.db
        .prepare("SELECT COUNT(*) AS count FROM coding_file_receipts WHERE run_id=?")
        .get(runId) as { count: number }
    ).count;
  }
  changesByIds(runId: string, receiptIds: string[]): CodingFileReceipt[] {
    const selected = [...new Set(receiptIds)];
    if (!selected.length) return [];
    const rows = this.repo.db
      .prepare(
        `SELECT receipt_id,receipt FROM coding_file_receipts WHERE run_id=? AND receipt_id IN (${selected.map(() => "?").join(",")}) ORDER BY created_at DESC,rowid DESC`,
      )
      .all(runId, ...selected) as unknown as { receipt_id: string; receipt: string }[];
    if (rows.length !== selected.length)
      throw new AuxError("not_found", "A selected file receipt does not belong to this run.");
    return rows.map((row) => this.load(row));
  }
  receiptForAction(runId: string, actionId: string): CodingFileReceipt | undefined {
    const row = this.repo.db
      .prepare("SELECT receipt_id,receipt FROM coding_file_receipts WHERE run_id=? AND action_id=?")
      .get(runId, actionId) as { receipt_id: string; receipt: string } | undefined;
    return row ? this.load(row) : undefined;
  }
  get(receiptId: string, runId: string): CodingFileReceipt {
    const row = this.repo.db
      .prepare("SELECT receipt_id,receipt FROM coding_file_receipts WHERE receipt_id=? AND run_id=?")
      .get(receiptId, runId) as { receipt_id: string; receipt: string } | undefined;
    if (!row) throw new AuxError("not_found", "File receipt does not exist for this run.");
    return this.load(row);
  }
  async applyChanges(
    request: { actionId: string; changes: CodingFileChange[] },
    context: CodingFileContext,
  ): Promise<CodingFileReceipt> {
    if (!request.actionId.trim() || !request.changes.length || request.changes.length > 100)
      throw new AuxError("invalid_params", "A stable action ID and 1–100 file changes are required.");
    return this.serialize(async () => {
      const requestHash = version(JSON.stringify(request.changes));
      const existing = this.receiptForAction(context.runId, request.actionId);
      if (existing) {
        this.assertExecution(existing);
        if (existing.requestHash !== requestHash)
          throw new AuxError("conflict", "The action ID was already used for different file changes.");
        if (["confirmed", "partially_applied", "not_applied"].includes(existing.status)) return existing;
        throw new AuxError("operation_uncertain", "Reconcile the existing file action before retrying.");
      }
      const paths = new Set<string>();
      const changes = request.changes.map((change) => {
        const path = this.filesystem.requirePath(change.path, "write", context.runId);
        if (paths.has(path))
          throw new AuxError("invalid_params", "Each path may occur only once in a batch.");
        paths.add(path);
        if (change.kind !== "move") return { ...change, path };
        const destination = this.filesystem.requirePath(change.destination, "write", context.runId);
        if (paths.has(destination))
          throw new AuxError("invalid_params", "Each path may occur only once in a batch.");
        paths.add(destination);
        return { ...change, path, destination };
      });
      const before = await this.readStates([...paths], context);
      const states = new Map(before.map((state) => [state.path, state]));
      const after: CodingFileState[] = [];
      for (const change of changes) {
        const state = states.get(change.path)!;
        if (
          change.kind === "create"
            ? state.version !== null
            : state.version !== change.expectedVersion || state.version === null
        )
          throw new AuxError("conflict", `File changed since it was read: ${change.path}`);
        if (change.kind === "move") {
          if (states.get(change.destination)!.version !== null)
            throw new AuxError("conflict", "Move destination already exists.");
          after.push(
            {
              path: change.destination,
              content: state.content,
              contentBase64: state.contentBase64,
              version: state.version,
              mode: state.mode,
            },
            { path: change.path, content: null, version: null },
          );
        } else if (change.kind === "delete") after.push({ path: change.path, content: null, version: null });
        else {
          const mode = change.mode ?? state.mode ?? 0o600;
          if (!Number.isInteger(mode) || mode < 0 || mode > 0o777)
            throw new AuxError("invalid_params", "File mode must contain ordinary permission bits only.");
          if (change.encoding === "base64") {
            const bytes = Buffer.from(change.content, "base64");
            if (bytes.toString("base64") !== change.content || bytes.length > 8 * 1024 * 1024)
              throw new AuxError(
                "invalid_params",
                "Binary changes require canonical base64 smaller than 8 MiB.",
              );
            const text = bytes.toString("utf8");
            if (!bytes.includes(0) && Buffer.from(text).equals(bytes))
              after.push({ path: change.path, content: text, version: version(text, mode), mode });
            else
              after.push({
                path: change.path,
                content: null,
                contentBase64: change.content,
                version: version(`base64:${change.content}`, mode),
                mode,
              });
          } else {
            const bytes = Buffer.from(change.content, "utf8");
            if (
              bytes.length > 8 * 1024 * 1024 ||
              bytes.includes(0) ||
              bytes.toString("utf8") !== change.content
            )
              throw new AuxError(
                "invalid_params",
                "Text writes require valid UTF-8 without NUL bytes, smaller than 8 MiB. Use base64 for binary content.",
              );
            after.push({
              path: change.path,
              content: change.content,
              version: version(change.content, mode),
              mode,
            });
          }
        }
      }
      return this.dispatch(request.actionId, before, after, context, undefined, requestHash);
    });
  }
  private async dispatch(
    actionId: string,
    before: CodingFileState[],
    after: CodingFileState[],
    context: CodingFileContext,
    undoOf?: string,
    requestHash?: string,
  ): Promise<CodingFileReceipt> {
    if (before.length === 0) throw new AuxError("invalid_params", "No file changes to dispatch.");
    const unresolved = this.unresolved(context.runId);
    if (
      unresolved.some((receipt) =>
        receipt.after.some((state) => before.some((target) => target.path === state.path)),
      )
    )
      throw new AuxError("operation_uncertain", "Reconcile unresolved changes to these files first.");
    const categories = new Set(
      after.map((state) => (state.version === null ? ("file_delete" as const) : ("file_write" as const))),
    );
    const checkAuthority = await this.authorize(
      {
        category: categories.has("file_write") ? "file_write" : "file_delete",
        categories: [...categories],
        actionId,
        paths: before.map((state) => state.path),
        before,
        after,
      },
      context,
    );
    this.boundary(context);
    for (const state of before) this.filesystem.requirePath(state.path, "write", context.runId);
    const current = await this.readStates(
      before.map((state) => state.path),
      context,
    );
    for (const [index, state] of current.entries()) {
      if (state.version !== before[index]!.version)
        throw new AuxError("conflict", `File changed while awaiting approval: ${state.path}`);
    }
    await context.verifyOwner?.();
    this.boundary(context);
    checkAuthority?.();
    const receipt: CodingFileReceipt = {
      ...(this.filesystem.execution ? { execution: { ...this.filesystem.execution } } : {}),
      receiptId: randomUUID(),
      actionId,
      runId: context.runId,
      createdAt: Date.now(),
      status: "pending",
      before,
      after,
      undoOf,
      requestHash,
      fileOutcomes: after.map((state) => ({ path: state.path, status: "pending" })),
    };
    this.save(receipt);
    try {
      await this.filesystem.coding(
        { kind: "apply", path: before[0]!.path, before, after },
        context.runId,
        context.signal,
        () => {
          this.boundary(context);
          checkAuthority?.();
        },
        context,
      );
      receipt.status = "confirmed";
      receipt.fileOutcomes = after.map((state) => ({ path: state.path, status: "confirmed" }));
      this.save(receipt);
      return receipt;
    } catch (error) {
      receipt.status = "uncertain";
      receipt.fileOutcomes = after.map((state) => ({ path: state.path, status: "uncertain" }));
      receipt.error = error instanceof Error ? error.message : "File dispatch failed";
      this.save(receipt);
      throw new AuxError(
        "operation_uncertain",
        "File execution did not return a confirmed receipt. Reconcile before retrying.",
        { receiptId: receipt.receiptId },
      );
    }
  }
  async reconcile(receiptId: string, context: CodingFileContext): Promise<CodingFileReceipt> {
    return this.serialize(async () => {
      const check = await this.authorizeInspection(context, `reconcile:${receiptId}`);
      const receipt = this.get(receiptId, context.runId);
      this.assertExecution(receipt);
      if (receipt.status !== "pending" && receipt.status !== "uncertain") return receipt;
      const actual = await this.readStates(
        receipt.after.map((state) => state.path),
        context,
      );
      check();
      if (actual.every((state, index) => state.version === receipt.after[index]!.version))
        receipt.status = "confirmed";
      else if (
        actual.every(
          (state) => state.version === receipt.before.find((before) => before.path === state.path)?.version,
        )
      )
        receipt.status = "not_applied";
      else receipt.status = "uncertain";
      receipt.fileOutcomes = actual.map((state) => ({
        path: state.path,
        status:
          state.version === receipt.after.find((after) => after.path === state.path)?.version
            ? "confirmed"
            : state.version === receipt.before.find((before) => before.path === state.path)?.version
              ? "not_applied"
              : "uncertain",
      }));
      if (
        receipt.status === "uncertain" &&
        receipt.fileOutcomes.every((outcome) => outcome.status !== "uncertain")
      )
        receipt.status = "partially_applied";
      this.save(receipt);
      return receipt;
    });
  }
  async undo(
    request: { actionId: string; receiptIds: string[] },
    context: CodingFileContext,
  ): Promise<CodingFileReceipt[]> {
    return this.serialize(async () => {
      const completed: CodingFileReceipt[] = [];
      if (
        !request.actionId.trim() ||
        !request.receiptIds.length ||
        new Set(request.receiptIds).size !== request.receiptIds.length
      )
        throw new AuxError(
          "invalid_params",
          "A stable action ID and distinct file receipt IDs are required.",
        );
      const receipts = this.changesByIds(context.runId, request.receiptIds);
      for (const receipt of receipts) this.assertExecution(receipt);
      for (const original of receipts) {
        const actionId = `${request.actionId}:${original.receiptId}`;
        const existing = this.receiptForAction(context.runId, actionId);
        if (existing?.status === "confirmed") {
          this.assertExecution(existing);
          completed.push(existing);
          continue;
        }
        if (existing || (original.status !== "confirmed" && original.status !== "partially_applied"))
          throw new AuxError("operation_uncertain", "Reconcile file writes before undoing them.");
        const confirmed =
          original.status === "confirmed"
            ? new Set(original.after.map((state) => state.path))
            : new Set(
                original.fileOutcomes
                  ?.filter((outcome) => outcome.status === "confirmed")
                  .map((outcome) => outcome.path),
              );
        completed.push(
          await this.dispatch(
            actionId,
            original.after.filter((state) => confirmed.has(state.path)),
            original.before.filter((state) => confirmed.has(state.path)),
            context,
            original.receiptId,
          ),
        );
      }
      return completed;
    });
  }
  private assertExecution(receipt: CodingFileReceipt): void {
    const original = receipt.execution,
      current = this.filesystem.execution;
    if (
      original?.backend !== current?.backend ||
      original?.resourceId !== current?.resourceId ||
      original?.sandboxName !== current?.sandboxName ||
      original?.sessionId !== current?.sessionId ||
      original?.root !== current?.root
    )
      throw new AuxError("ref_stale", "This file receipt belongs to a different execution session.");
  }
  private serialize<T>(operation: () => Promise<T>): Promise<T> {
    const pending = this.queue.then(operation);
    this.queue = pending.catch(() => undefined);
    return pending;
  }
}
