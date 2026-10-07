import { AgentProfileSchema, AuxError, type AgentProfile, type AuxPackageSnapshot } from "@aux/contracts";
const coordination = [
  "ask_user_question",
  "request_action_confirmation",
  "submit_result",
  "write_todos",
  "subagent",
  "subagent_wait",
  "subagent_send",
  "subagent_stop",
  "reconcile_action",
  "get_time",
  "package_skill",
  "package_template",
  "package_workflow",
  "repl",
  "repl_wait",
  "goal_program",
];
const files = ["read_file", "grep", "glob", "list_directory", "stat", "diff"];
export const BUILTIN_AGENT_PROFILES: AgentProfile[] = [
  {
    name: "default",
    prompt:
      "Complete the assigned work within the parent's authority. Report outcomes and supporting evidence.",
    tools: ["*"],
    packages: [],
  },
  {
    name: "explorer",
    prompt:
      "Inspect and navigate to answer the assigned question. Do not change files or submit page effects.",
    tools: [...files, ...coordination, "snapshot", "websearch", "webfetch"],
    packages: [],
  },
  {
    name: "read_only",
    prompt: "Read existing evidence and report findings. Do not modify files, pages, or process state.",
    tools: [...files, ...coordination, "snapshot", "websearch", "webfetch"],
    packages: [],
  },
  {
    name: "coder",
    workspace: "isolated",
    prompt:
      "Implement the assigned coding task in the attached project. Search before reading large files, observe versions before edits, and make coherent changes. Use governed changes and commands; inspect relevant failures and repair them. Verify proportionately, retain durable receipts, and report the resulting diff and any unresolved effects. Never replay uncertain writes. Use isolated coder cells for independent workstreams.",
    tools: [
      ...coordination,
      ...files,
      "write_file",
      "edit_file",
      "apply_changes",
      "reconcile_file",
      "reconcile_process",
      "undo",
      "bash",
      "bg_start",
      "bg_status",
      "bg_logs",
      "bg_stop",
      "coder_worktree_diff",
      "coder_worktree_integrate",
      "coder_worktree_retire",
      "coder_worktree_recovery",
      "coder_worktree_archive",
      "websearch",
      "webfetch",
    ],
    packages: [],
  },
].map((profile) => AgentProfileSchema.parse(profile));

export function resolveAgentProfile(name: string, packages: AuxPackageSnapshot[] = []): AgentProfile {
  const builtin = BUILTIN_AGENT_PROFILES.find((profile) => profile.name === name);
  if (builtin) return builtin;
  const matches = packages
    .flatMap((item) => item.manifest.profiles)
    .filter((profile) => profile.name === name);
  if (matches.length !== 1)
    throw new AuxError("invalid_params", "Choose a unique installed Aux agent profile.");
  return matches[0]!;
}
export function profileAllowsTool(profile: AgentProfile | undefined, tool: string): boolean {
  return !profile || profile.tools.includes("*") || profile.tools.includes(tool);
}

export function narrowProfileLimit(
  configured: number | undefined,
  declared: number | undefined,
): number | undefined {
  if (!declared || declared <= 0) return configured;
  return configured && configured > 0 ? Math.min(configured, declared) : declared;
}

export function narrowCostLimit(
  configured: number | undefined,
  declared: number | undefined,
): number | undefined {
  if (declared === undefined) return configured;
  return configured === undefined ? declared : Math.min(configured, declared);
}
