import { readWorkspaceMemory } from "./workspace-memory.js";
import { BrowsingMemory } from "./browsing-memory.js";
import { memoryOrigin } from "@aux/contracts/memory-context";
import { randomUUID } from "node:crypto";
import {
  TaskCreateParams,
  TaskPromoteParams,
  TaskSchema,
  TaskUpdateParams,
  WorkspaceMemoryItemSchema,
  AuxError,
  taskConversationId,
  taskMatchesQuery,
  type Task,
  type Workspace,
  type WorkspaceMemory,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { EventBus } from "../events.js";

const ACTIVE_RUNS = "('queued','planning','running','paused','needs_input')";

/** Resources describe task context. They never grant access or read their locator. */
export class TaskService {
  constructor(
    private repo: Repo,
    private events: EventBus,
  ) {}

  createWorkspace(name: string): Workspace {
    const workspace = { workspaceId: randomUUID(), name: name.trim(), createdAt: Date.now() };
    if (!workspace.name || workspace.name.length > 100)
      throw new AuxError("invalid_params", "Workspace name must contain 1–100 characters");
    this.repo.db
      .prepare("INSERT INTO workspaces VALUES(?,?,?)")
      .run(workspace.workspaceId, workspace.name, workspace.createdAt);
    this.events.emit("workspace.created", { workspace });
    return workspace;
  }

  workspaces(): Workspace[] {
    return this.repo.db
      .prepare(
        "SELECT workspace_id AS workspaceId,name,created_at AS createdAt FROM workspaces ORDER BY created_at,workspace_id",
      )
      .all() as unknown as Workspace[];
  }

  workspaceMemory(workspaceId: string): WorkspaceMemory {
    return readWorkspaceMemory(this.repo, workspaceId);
  }

  searchWorkspaceMemory(query: string) {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return [];
    return this.workspaces()
      .flatMap((workspace) => {
        const memory = this.workspaceMemory(workspace.workspaceId),
          searchable = [
            memory.content,
            ...(memory.items ?? []).map((item) => `${item.content} ${item.sourceUrl ?? ""}`),
          ].join("\n"),
          index = searchable.toLocaleLowerCase().indexOf(needle);
        if (index < 0 && !workspace.name.toLocaleLowerCase().includes(needle)) return [];
        const start = Math.max(0, index - 60),
          end = Math.min(searchable.length, start + 240);
        return [
          {
            workspaceId: workspace.workspaceId,
            name: workspace.name,
            enabled: memory.enabled !== false,
            excerpt: `${start ? "…" : ""}${searchable.slice(start, end)}${end < searchable.length ? "…" : ""}`,
          },
        ];
      })
      .slice(0, 100);
  }

  setWorkspaceMemory(
    workspaceId: string,
    expectedRevision: number,
    content: string,
    enabled?: boolean,
    items?: WorkspaceMemory["items"],
    excludedOrigins?: string[],
  ): WorkspaceMemory {
    const prior = this.workspaceMemory(workspaceId);
    if (prior.revision !== expectedRevision)
      throw new AuxError("conflict", "Workspace memory changed; reload it before saving.");
    if (
      items &&
      (items.length > 40 ||
        new Set(items.map((item) => item.itemId)).size !== items.length ||
        items.some((item) => !WorkspaceMemoryItemSchema.safeParse(item).success))
    )
      throw new AuxError("invalid_params", "Use up to 40 valid memory notes with distinct identities.");
    let origins = prior.excludedOrigins ?? [];
    if (excludedOrigins) {
      if (excludedOrigins.length > 100) throw new AuxError("invalid_params", "Use up to 100 excluded sites.");
      try {
        origins = [...new Set(excludedOrigins.map(memoryOrigin))];
      } catch {
        throw new AuxError("invalid_params", "Use web addresses without credentials for excluded sites.");
      }
    }
    const next = {
      workspaceId,
      excludedOrigins: origins,
      items: items ?? prior.items ?? [],
      enabled: enabled ?? prior.enabled ?? true,
      content: content.slice(0, 16_000),
      revision: prior.revision + 1,
      updatedAt: Date.now(),
    };
    this.repo.transaction(() => {
      this.repo.setSetting(`workspaceMemory:${workspaceId}`, next);
      // An excluded site must leave local browsing memory as well as future prompts.
      new BrowsingMemory(this.repo).get(workspaceId);
      for (const origin of origins)
        this.repo.db
          .prepare("DELETE FROM content_memory WHERE workspace_id=? AND origin=?")
          .run(workspaceId, origin);
    });
    this.events.emit("workspace.memory.updated", { workspaceId, revision: next.revision });
    return next;
  }

  create(input: unknown, origin: "desktop" | "external" = "desktop"): Task {
    const definition = TaskCreateParams.parse(input);
    if (!this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(definition.workspaceId))
      throw new AuxError("not_found", "Workspace does not exist");
    if (definition.parentTaskId) {
      const parent = this.get(definition.parentTaskId);
      if (parent.workspaceId !== definition.workspaceId)
        throw new AuxError("permission_denied", "A child task must remain in its parent workspace");
      if (parent.state === "archived")
        throw new AuxError("conflict", "Restore the parent task before adding a child task");
      let cursor: Task | undefined = parent;
      let depth = 1;
      while (cursor.parentTaskId) {
        if (++depth > 4) throw new AuxError("conflict", "Aux limits child-task coordination to four levels");
        cursor = this.get(cursor.parentTaskId);
      }
      const children = this.list({
        workspaceId: definition.workspaceId,
        includeArchived: true,
        limit: 500,
      }).filter((task) => task.parentTaskId === parent.taskId);
      if (children.length >= 20) throw new AuxError("conflict", "This task already has 20 child tasks");
    }
    const now = Date.now();
    const task: Task = {
      ...definition,
      ...(origin === "external" ? { sourceOrigin: "external" as const } : {}),
      taskId: randomUUID(),
      revision: 1,
      state: "open",
      createdAt: now,
      updatedAt: now,
    };
    this.repo.transaction(() => {
      this.repo.db
        .prepare("INSERT INTO tasks VALUES(?,?,?,?,?,?)")
        .run(task.taskId, task.workspaceId, task.revision, task.state, now, JSON.stringify(task));
      this.saveRevision(task);
    });
    this.events.emit("task.created", { task });
    return task;
  }

  promote(input: unknown): Task {
    const { chatId, expectedRunId, ...definition } = TaskPromoteParams.parse(input);
    let created = false;
    const task = this.repo.transaction(() => {
      const existing = this.repo.taskForConversation(chatId);
      if (existing) return this.get(existing);
      const conversation = this.repo.getConversation(chatId);
      if (!conversation) throw new AuxError("not_found", "Conversation not found.");
      if (conversation.archived)
        throw new AuxError("conflict", "Restore the conversation before saving it as a task.");
      if (conversation.taskId) return this.get(conversation.taskId);
      if (conversation.latestRun.runId !== expectedRunId)
        throw new AuxError(
          "conflict",
          "The conversation changed. Review its latest reply before saving the task.",
        );
      if (
        this.repo.db
          .prepare(
            `SELECT 1 FROM runs WHERE (json_extract((SELECT config FROM run_lookup WHERE run_lookup.run_id=runs.run_id),'$.chatId')=? OR run_id=?) AND status IN ${ACTIVE_RUNS} LIMIT 1`,
          )
          .get(chatId, chatId)
      )
        throw new AuxError("conflict", "Wait for or stop the current turn before saving a task.");
      if (
        this.repo.db
          .prepare(
            "SELECT 1 FROM action_intents a JOIN runs r ON r.run_id=a.run_id LEFT JOIN run_lookup rl ON rl.run_id=r.run_id WHERE (json_extract(rl.config,'$.chatId')=? OR r.run_id=?) AND a.status IN ('pending','uncertain') LIMIT 1",
          )
          .get(chatId, chatId) ||
        this.repo.db
          .prepare(
            "SELECT 1 FROM operation_invocations o JOIN runs r ON r.run_id=o.run_id LEFT JOIN run_lookup rl ON rl.run_id=r.run_id WHERE (json_extract(rl.config,'$.chatId')=? OR r.run_id=?) AND (o.status IN ('running','interrupted') OR o.effect_outcome='unknown') LIMIT 1",
          )
          .get(chatId, chatId)
      )
        throw new AuxError(
          "conflict",
          "Resolve this conversation's uncertain actions before saving it as a task.",
        );
      if (!this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(definition.workspaceId))
        throw new AuxError("not_found", "Space does not exist.");
      const now = Date.now();
      const task: Task = {
        ...definition,
        conversationId: chatId,
        sourceOrigin: "conversation",
        taskId: randomUUID(),
        revision: 1,
        state: "open",
        createdAt: now,
        updatedAt: now,
      };
      this.repo.db
        .prepare("INSERT INTO tasks VALUES(?,?,?,?,?,?)")
        .run(task.taskId, task.workspaceId, task.revision, task.state, now, JSON.stringify(task));
      this.saveRevision(task);
      this.repo.setSetting(`conversationWorkspace:${chatId}`, task.workspaceId);
      this.repo.db
        .prepare("UPDATE conversations SET title=? WHERE chat_id=?")
        .run(task.title.slice(0, 160), chatId);
      created = true;
      return task;
    });
    if (created) this.events.emit("task.created", { task });
    return task;
  }

  descendants(taskId: string, limit = 500): Task[] {
    const root = this.get(taskId);
    const candidates = this.list({ workspaceId: root.workspaceId, includeArchived: true, limit });
    const allowed = new Set([root.taskId]);
    let changed = true;
    while (changed && allowed.size < limit) {
      changed = false;
      for (const task of candidates)
        if (task.parentTaskId && allowed.has(task.parentTaskId) && !allowed.has(task.taskId)) {
          allowed.add(task.taskId);
          changed = true;
        }
    }
    return [
      root,
      ...candidates.filter((task) => task.taskId !== root.taskId && allowed.has(task.taskId)),
    ].slice(0, limit);
  }

  get(taskId: string): Task {
    const row = this.repo.db.prepare("SELECT json FROM tasks WHERE task_id=?").get(taskId) as
      { json: string } | undefined;
    if (!row) throw new AuxError("not_found", "Task does not exist");
    return TaskSchema.parse(JSON.parse(row.json));
  }

  list(
    opts: { query?: string; workspaceId?: string; includeArchived?: boolean; limit?: number } = {},
  ): Task[] {
    return (
      this.repo.db
        .prepare(
          "SELECT json FROM tasks WHERE (? IS NULL OR workspace_id=?) AND (? OR state='open') ORDER BY updated_at DESC,task_id LIMIT 500",
        )
        .all(opts.workspaceId ?? null, opts.workspaceId ?? null, opts.includeArchived ? 1 : 0) as {
        json: string;
      }[]
    )
      .map((row) => TaskSchema.parse(JSON.parse(row.json)))
      .filter((task) => taskMatchesQuery(task, opts.query))
      .slice(0, opts.limit ?? 100);
  }

  details(taskId: string) {
    const task = this.get(taskId);
    const revisions = (
      this.repo.db
        .prepare("SELECT json FROM task_revisions WHERE task_id=? ORDER BY revision")
        .all(taskId) as { json: string }[]
    ).map((row) => TaskSchema.parse(JSON.parse(row.json)));
    const rows = this.repo.db
      .prepare("SELECT r.run_id FROM run_lookup l JOIN runs r ON r.run_id=l.run_id WHERE json_extract(l.config,'$.taskId')=? ORDER BY r.created_at DESC")
      .all(taskId) as { run_id: string }[];
    const runs = rows.map((row) => {
      const run = this.repo.getRun(row.run_id)!;
      return { run, currentRevision: run.config?.taskRevision === task.revision };
    });
    const descendants = this.descendants(taskId)
      .slice(1)
      .map((child) => {
        const row = this.repo.db
          .prepare(
            "SELECT r.run_id FROM run_lookup l JOIN runs r ON r.run_id=l.run_id WHERE json_extract(l.config,'$.taskId')=? ORDER BY r.created_at DESC LIMIT 1",
          )
          .get(child.taskId) as { run_id: string } | undefined;
        const run = row ? this.repo.getRun(row.run_id) : undefined;
        let depth = 1,
          cursor = child;
        while (cursor.parentTaskId && cursor.parentTaskId !== taskId && depth < 4) {
          cursor = this.get(cursor.parentTaskId);
          depth++;
        }
        return {
          task: child,
          depth,
          latestRun: run
            ? { runId: run.runId, status: run.status, taskRevision: run.config?.taskRevision }
            : undefined,
        };
      });
    return { task, revisions, runs, children: descendants };
  }

  update(input: unknown, origin: "desktop" | "external" = "desktop"): Task {
    const { taskId, expectedRevision, ...patch } = TaskUpdateParams.parse(input);
    return this.change(taskId, expectedRevision,
      origin === "external" ? { ...patch, sourceOrigin: "external" } : patch);
  }

  archive(taskId: string, expectedRevision: number, archived: boolean): Task {
    const task = this.get(taskId);
    this.requireRevision(task, expectedRevision);
    if (archived) {
      this.requireResolved(taskId);
      const openChild = this.descendants(taskId)
        .slice(1)
        .find((child) => child.state === "open");
      if (openChild)
        throw new AuxError("conflict", `Archive child task “${openChild.title}” before archiving its parent`);
    } else if (task.parentTaskId) {
      let parent = this.get(task.parentTaskId);
      while (true) {
        if (parent.state === "archived")
          throw new AuxError("conflict", `Restore parent task “${parent.title}” before restoring this child`);
        if (!parent.parentTaskId) break;
        parent = this.get(parent.parentTaskId);
      }
    }
    return this.change(taskId, expectedRevision, { state: archived ? "archived" : "open" });
  }

  private change(taskId: string, expectedRevision: number, patch: Partial<Task>): Task {
    const task = this.repo.transaction(() => {
      const prior = this.get(taskId);
      this.requireRevision(prior, expectedRevision);
      this.requireIdle(taskId);
      this.requireResolved(taskId);
      const next = TaskSchema.parse({
        ...prior,
        ...patch,
        revision: prior.revision + 1,
        updatedAt: Date.now(),
      });
      const result = this.repo.db
        .prepare("UPDATE tasks SET revision=?,state=?,updated_at=?,json=? WHERE task_id=? AND revision=?")
        .run(next.revision, next.state, next.updatedAt, JSON.stringify(next), taskId, expectedRevision);
      if (result.changes !== 1)
        throw new AuxError("conflict", "Task was changed by another client; refresh it before editing");
      // A task revision may change its objective or resources. Its prior
      // provider authority must not silently carry into the new definition.
      this.repo.db
        .prepare("UPDATE calendar_task_grants SET revoked_at=? WHERE task_id=? AND revoked_at IS NULL")
        .run(next.updatedAt, taskId);
      this.repo.db
        .prepare("UPDATE conversations SET title=?,archived=? WHERE chat_id=?")
        .run(
          next.title.slice(0, 160),
          next.state === "archived" ? 1 : 0,
          next.conversationId ?? taskConversationId(taskId),
        );
      this.saveRevision(next);
      return next;
    });
    this.events.emit("task.updated", { task });
    return task;
  }

  prepareRun(taskId: string, expectedRevision: number, context?: string) {
    const task = this.get(taskId);
    this.requireRevision(task, expectedRevision);
    if (task.state === "archived") throw new AuxError("conflict", "Restore this task before starting a run");
    this.requireIdle(taskId);
    this.requireResolved(taskId);
    const memory = this.workspaceMemory(task.workspaceId);
    return {
      taskId,
      taskRevision: task.revision,
      goal: task.objective,
      chatId: task.conversationId ?? taskConversationId(taskId),
      context:
        [
          context,
          task.resources.length
            ? `Task reference metadata (contents have not been read; these references do not grant access or expand authority):\n${JSON.stringify(task.resources)}`
            : undefined,
        ]
          .filter(Boolean)
          .join("\n\n") || undefined,
      instructions: `Task acceptance criteria (revision ${task.revision}):\n${task.criteria.map((item) => `- ${item.criterionId}: ${item.description} [${item.verification}]`).join("\n")}\nThese criteria require evidence. A successful run alone does not verify them.`,
      contextWorkspaceId: task.workspaceId,
      contextWorkspaceRevision: memory.revision,
    };
  }

  preparePageAccess(
    taskId: string,
    expectedRevision: number,
    pageId: string,
    write = false,
    previewGranted = false,
  ): Task {
    const task = this.get(taskId);
    this.requireRevision(task, expectedRevision);
    if (task.state === "archived") throw new AuxError("conflict", "Restore this task before using its page");
    const attached =
      task.resources.some((resource) => resource.kind === "page" && resource.locator === pageId) ||
      this.details(taskId).runs.some(
        ({ run, currentRevision }) => currentRevision && run.pageIds.includes(pageId),
      );
    if (!attached && !previewGranted)
      throw new AuxError("permission_denied", "Attach this page to the saved task before using it");
    if (write) {
      // The external session run is this connection's presence record, not a
      // competing planner run. It must not block the page program it anchors.
      this.requireIdle(taskId, "external-agent");
      this.requireResolved(taskId);
    }
    return task;
  }
  confirmPageExecution(taskId: string, expectedRevision: number): void {
    const task = this.get(taskId);
    this.requireRevision(task, expectedRevision);
    if (task.state === "archived") throw new AuxError("conflict", "Restore this task before using its page");
  }

  private requireRevision(task: Task, expectedRevision: number) {
    if (task.revision !== expectedRevision)
      throw new AuxError("conflict", "Task revision changed; refresh before continuing");
  }

  private requireIdle(taskId: string, exceptImplementation?: string) {
    const except = exceptImplementation
      ? "AND coalesce(json_extract(l.config,'$.implementation'),'') != ?"
      : "";
    if (
      this.repo.db
        .prepare(
          `SELECT 1 FROM run_lookup l JOIN runs r ON r.run_id=l.run_id WHERE json_extract(l.config,'$.taskId')=? AND r.status IN ${ACTIVE_RUNS} ${except} LIMIT 1`,
        )
        .get(...(exceptImplementation ? [taskId, exceptImplementation] : [taskId]))
    ) {
      throw new AuxError(
        "conflict",
        "This task has an active run. Stop it before revising the task or starting another run.",
      );
    }
  }

  private requireResolved(taskId: string, exceptInvocationId = "") {
    const unresolved = this.repo.db
      .prepare(
        `SELECT a.id FROM action_intents a LEFT JOIN runs r ON r.run_id=a.run_id LEFT JOIN run_lookup rl ON rl.run_id=r.run_id
      WHERE coalesce(a.task_id,json_extract(rl.config,'$.taskId'))=? AND a.status IN ('pending','uncertain') LIMIT 1`,
      )
      .get(taskId);
    if (unresolved)
      throw new AuxError(
        "conflict",
        "This task has an unresolved action; reconcile its outcome before continuing or archiving it",
      );
    const operation = this.repo.db
      .prepare(
        `SELECT i.invocation_id FROM operation_invocations i JOIN operations o ON o.operation_id=i.operation_id LEFT JOIN runs r ON r.run_id=i.run_id LEFT JOIN run_lookup rl ON rl.run_id=r.run_id
      WHERE coalesce(json_extract(rl.config,'$.taskId'),json_extract(i.inputs,'$.taskId'))=? AND o.effect_class!='read'
      AND i.invocation_id!=? AND (i.status IN ('running','interrupted') OR i.effect_outcome='unknown') LIMIT 1`,
      )
      .get(taskId, exceptInvocationId);
    if (operation)
      throw new AuxError(
        "conflict",
        "This task has an unresolved operation; reconcile its outcome before continuing or archiving it",
      );
  }

  private saveRevision(task: Task) {
    this.repo.db
      .prepare("INSERT INTO task_revisions VALUES(?,?,?)")
      .run(task.taskId, task.revision, JSON.stringify(task));
  }
}
