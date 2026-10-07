import { z } from "zod";
import { AuxError } from "@aux/contracts";
import type { LoopToolManifest } from "./types.js";

export function codingToolManifest(): LoopToolManifest {
  const path = z.string().min(1).max(4096);
  const content = z.string().max(8 * 1024 * 1024);
  const version = z.string().min(1).max(128);
  const change = z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("create"),
      path,
      content,
      encoding: z.literal("base64").optional(),
      mode: z.number().int().min(0).max(0o777).optional(),
    }),
    z.object({
      kind: z.literal("edit"),
      path,
      content,
      expectedVersion: version,
      encoding: z.literal("base64").optional(),
      mode: z.number().int().min(0).max(0o777).optional(),
    }),
    z.object({ kind: z.literal("move"), path, destination: path, expectedVersion: version }),
    z.object({ kind: z.literal("delete"), path, expectedVersion: version }),
  ]);
  const search = {
    root: path,
    pattern: z.string().max(4096).optional(),
    cursor: z.string().optional(),
    limit: z.number().int().positive().max(500).optional(),
  };
  const definitions = {
    coder_worktree_recovery: {
      description: "Inspect the exact contents of an incomplete coder worktree before recovery or archival.",
      schema: z.object({ cellId: z.string().min(1).max(200) }),
    },
    coder_worktree_archive: {
      description:
        "Archive an incomplete coder worktree while preserving the exact inspected contents. Requires its current recovery digest.",
      schema: z.object({ cellId: z.string().min(1).max(200), expectedDigest: z.string().min(1).max(128) }),
    },
    coder_worktree_diff: {
      description: "Inspect a coder cell's isolated changes against its captured base and parent files.",
      schema: z.object({ cellId: z.string().min(1).max(200) }),
    },
    coder_worktree_integrate: {
      description:
        "Integrate a coder cell's reviewed changes through the parent's governed file journal with conflict checks.",
      schema: z.object({ cellId: z.string().min(1).max(200) }),
    },
    coder_worktree_retire: {
      description:
        "Retire a coder cell worktree only after its changes have been integrated or remain empty.",
      schema: z.object({ cellId: z.string().min(1).max(200) }),
    },
    package_skill: {
      description: "Load one skill's full instructions from this run's pinned Aux Packages.",
      schema: z.object({ name: z.string().min(1).max(128) }),
    },
    package_template: {
      description: "Read a prompt template from this run's pinned Aux Packages.",
      schema: z.object({ name: z.string().min(1).max(128) }),
    },
    package_workflow: {
      description:
        "Read a declarative workflow as proposed work. Its steps remain subject to ordinary tool authority and review.",
      schema: z.object({ name: z.string().min(1).max(128) }),
    },
    read_file: {
      description:
        "Read UTF-8 content and a version token. Read before editing; line ranges retain the full file version.",
      schema: z.object({
        path,
        startLine: z.number().int().positive().optional(),
        endLine: z.number().int().positive().optional(),
      }),
    },
    write_file: {
      description:
        "Create a file, or replace a file with its read version in expectedVersion. Governed, journaled and undoable.",
      schema: z.object({ path, content, expectedVersion: version.optional() }),
    },
    edit_file: {
      description:
        "Replace a uniquely matching oldText after reading the file; expectedVersion prevents stale writes. Set all for every match.",
      schema: z.object({
        path,
        oldText: z.string().min(1).max(200000),
        newText: z.string().max(200000),
        expectedVersion: version,
        all: z.boolean().optional(),
      }),
    },
    grep: {
      description:
        "Search project files by literal text or regex without shell approval. Returns bounded path/line matches and a continuation cursor.",
      schema: z.object({ ...search, query: z.string().min(1).max(4096), regex: z.boolean().optional() }),
    },
    glob: {
      description: "Find project files by glob pattern, respecting ignores and protected paths.",
      schema: z.object({ ...search, pattern: z.string().min(1).max(4096) }),
    },
    list_directory: {
      description: "List a permitted directory without following symlinks.",
      schema: z.object({ path }),
    },
    stat: { description: "Inspect a permitted file/directory and its version.", schema: z.object({ path }) },
    apply_changes: {
      description:
        "Prepare and apply a reviewed multi-file create/edit/move/delete batch. Existing files require read versions. Each effect is journaled.",
      schema: z.object({ changes: z.array(change).min(1).max(100) }),
    },
    diff: {
      description: "Inspect this run's durable file changes, receipt identities and unresolved outcomes.",
      schema: z.object({ receiptIds: z.array(z.string()).optional() }),
    },
    undo: {
      description:
        "Revert selected governed file receipts in reverse order, preserving user edits by reporting conflicts.",
      schema: z.object({ receiptIds: z.array(z.string()).min(1).max(100) }),
    },
    reconcile_file: {
      description:
        "Independently hash current files to settle an uncertain file receipt. Never replays its mutations.",
      schema: z.object({ receiptId: z.string().min(1) }),
    },
    bg_start: {
      description:
        "Start a supervised development process tied to this run. Logs are durable artifacts; Stop and run retirement terminate it.",
      schema: z.object({
        command: z.string().min(1).max(8192),
        workdir: path.optional(),
        network: z.boolean().optional(),
      }),
    },
    bg_status: {
      description: "Inspect a supervised process owned by this run.",
      schema: z.object({ processId: z.string().min(1) }),
    },
    bg_logs: {
      description: "Read bounded supervised process logs, with a continuation cursor.",
      schema: z.object({ processId: z.string().min(1), cursor: z.number().int().nonnegative().optional() }),
    },
    reconcile_process: {
      description:
        "Independently reconcile an uncertain process launch from its OS identity. An interrupted command has unknown outcome and cannot count as success.",
      schema: z.object({ processId: z.string().min(1) }),
    },
    bg_stop: {
      description: "Terminate a supervised process owned by this run and confirm cleanup.",
      schema: z.object({ processId: z.string().min(1) }),
    },
  };
  return Object.fromEntries(
    Object.entries(definitions).map(([name, definition]) => [
      name,
      {
        description: definition.description,
        byline: "Aux governed coding",
        inputSchema: definition.schema,
        execute: async (raw, ctx) => {
          if (!ctx.deps.codingTool)
            throw new AuxError(
              "capability_unsupported",
              "Governed coding tools are unavailable for this run.",
            );
          return ctx.deps.codingTool(name, definition.schema.parse(raw), ctx);
        },
      },
    ]),
  );
}
