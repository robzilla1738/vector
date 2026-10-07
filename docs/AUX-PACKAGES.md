# Aux Packages

An Aux Package is a directory containing `aux.package.json`. Packages contribute instructions and declarations to Aux's own agent loop. They do not contain an executable agent runtime or installation hooks, and never grant permissions.

```json
{
  "schemaVersion": 1,
  "name": "project-coding",
  "version": "1.0.0",
  "description": "Project conventions and coding workflows",
  "skills": ["skills/review/SKILL.md"],
  "profiles": [{
    "name": "reviewer",
    "prompt": "Inspect the changed code and report actionable findings.",
    "tools": ["read_file", "grep", "glob", "diff", "submit_result"],
    "workspace": "shared",
    "packages": [],
    "limits": {}
  }],
  "templates": { "review": "Review the current changes for correctness." },
  "workflows": {
    "list-source": [{ "tool": "glob", "input": { "pattern": "src/**/*.ts" } }]
  }
}
```

Skills use portable SKILL.md frontmatter (`name`, `description`) followed by instructions. Existing compatible documents can be imported; metadata claiming permission or allowed tools does not carry execution authority. All paths must remain inside the package and resolve to bounded regular files. Profiles and workflows name registered Aux tools. Unknown manifest fields, executable hooks, and unknown tool names are rejected. Unsupported imported skill metadata is reported in Settings and carries no execution authority.

At run start Aux resolves package selections into immutable snapshots containing the manifest, parsed skill instructions, and a SHA-256 content digest. Resume uses that snapshot rather than rereading a changed package. The initial context lists short skill descriptions; full instructions are loaded when a skill is selected. Shipped package directories belong in the runtime's protected roots; customization uses a user-owned copy.

Agent profiles declare a name, prompt, tool subset, package selection, workspace and optional narrowing limits. `workspace` defaults to `shared`; `isolated` places each spawned profile cell in its own governed Git worktree. The built-in coder uses `isolated`; the default browser profile stays `shared`. Package authors can declare custom isolated coding profiles without adding tools, filesystem roots or grants. Built-in profiles are `default`, `explorer`, `read_only`, and `coder`. A child profile intersects the parent's tool subset and never expands its authority. Declared limits narrow the effective model-call, cost and deadline budgets for top-level and child runs. A coding child can operate with an attached project and no browser pages. Parallel coders use isolated Git worktrees; resulting changes are reviewed and integrated by the parent through governed file writes rather than automatic commits or merges.

Worktree snapshots retain permitted dirty files and their original parent versions. Protected paths are excluded before checkout. The original snapshot distinguishes child changes from pre-existing parent changes. Unfinished worktrees remain available for recovery. Integration and retirement are explicit durable operations; the worktree's Git metadata and snapshot baseline are protected from model writes.

Interrupted coder worktree creation produces a protected recovery handle tied to its original parent and cell reservation. Changes, processes and agents exposes the preserved file inventory and captured contents, including after Stop. Explicit archive review binds the exact inventory digest and moves files intact to Aux’s worktree archive. Linked or protected paths block archival; uncertain archive outcomes are inspected without replaying creation or cleanup.

Integration persists stable batch identities and uses at most 100 file changes per reviewed batch. After partial reconciliation, Aux verifies each previously confirmed parent version before skipping it and reviews only the remaining changes. Unknown batches require reconciliation; a changed parent file produces a conflict. Restarts restore receipt-bound worktree recovery handles without copying files again, and parked cells retain their original group and reservation.
