export type McpCatalogTool = {
  name: string;
  group: "browser" | "task" | "development" | "cloud" | "workspace";
  description: string;
  scoped: boolean;
  workspaceCreate?: boolean;
};

/** Tools a generated scoped MCP token may call. Names are Aux-canonical. */
export const MCP_SCOPED_CATALOG: readonly McpCatalogTool[] = [
  { name: "aux_pages_list", group: "browser", scoped: true, description: "List open browser pages attached to this connection." },
  { name: "aux_page_observe", group: "browser", scoped: true, description: "Observe an authorized page." },
  { name: "aux_page_execute", group: "browser", scoped: true, description: "Run a typed program on an authorized page." },
  { name: "aux_page_takeover", group: "browser", scoped: true, description: "Pause an agent so you can control the page." },
  { name: "aux_page_resume", group: "browser", scoped: true, description: "Return the page to the agent." },
  { name: "aux_page_capture", group: "browser", scoped: true, description: "Capture a screenshot of an authorized page." },
  { name: "aux_run_get", group: "task", scoped: true, description: "Read an Aux built-in agent run." },
  { name: "aux_run_control", group: "task", scoped: true, description: "Pause, resume or cancel an Aux built-in agent run." },
  { name: "aux_run_answer", group: "task", scoped: true, description: "Answer a needs-input Aux run." },
  { name: "aux_extract", group: "browser", scoped: true, description: "Extract fields from an authorized page." },
  { name: "aux_wait_for", group: "browser", scoped: true, description: "Wait for a condition on an authorized page." },
  { name: "aux_console", group: "browser", scoped: true, description: "Read recent console lines from an authorized page." },
  { name: "aux_dialog", group: "browser", scoped: true, description: "Inspect or answer a page dialog." },
  { name: "aux_network", group: "browser", scoped: true, description: "Read captured network responses for an authorized page." },
  { name: "aux_workspaces_list", group: "workspace", scoped: true, description: "List the workspace this connection is allowed to see." },
  { name: "aux_tasks_list", group: "task", scoped: true, description: "List saved tasks in this connection’s scope. Optional query matches title and objective." },
  { name: "aux_task_get", group: "task", scoped: true, description: "Read a task, revisions and associated runs." },
  { name: "aux_task_update", group: "task", scoped: true, description: "Revise a task using its expected current revision." },
  { name: "aux_task_archive", group: "task", scoped: true, description: "Archive or restore a task." },
  { name: "aux_task_start", group: "task", scoped: true, description: "Start Aux’s built-in agent on a saved task." },
  { name: "aux_task_record_evidence", group: "task", scoped: true, description: "Record an external-client claim. This is not human acceptance." },
  { name: "aux_task_capture_evidence", group: "task", scoped: true, description: "Capture a dated page-text observation as evidence." },
  { name: "aux_task_receipt", group: "task", scoped: true, description: "Read criterion evidence, reviews, unresolved actions and costs." },
  { name: "aux_task_verify_criterion", group: "task", scoped: true, description: "Run an honest local criterion check. Manual criteria stay unverified." },
  { name: "aux_task_replace_agent", group: "task", scoped: true, description: "Cancel the active Aux agent on this task and start a replacement with the same task identity." },
  { name: "aux_task_create", group: "task", scoped: true, workspaceCreate: true, description: "Create a task. Task-scoped connections may only add a resource-free child." },
];

export function mcpCatalogForScope(kind: "workspace" | "task" | undefined): McpCatalogTool[] {
  return MCP_SCOPED_CATALOG.filter(tool => kind !== "task" || !tool.workspaceCreate || tool.name === "aux_task_create");
}
