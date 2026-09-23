import { TaskSchema } from "@aux/contracts";
import { projectCommands } from "../app/services.js";
import { runtimeInvoke } from "../runtime/supervisor.js";

/** Projects with a file change in flight — commands, commits and other edits wait. */
export const savingProjects = new Set<string>();

/** A foreground command (or a stopping service) owns the checkout's files. */
export function assertProjectEditable(projectId: string, action: string) {
  if (projectCommands.list(projectId).some(command => ["running", "stopping"].includes(command.state) && (command.mode !== "service" || command.state === "stopping"))) throw new Error(`Stop the project's command before ${action} a file.`);
}

export const projectCommandsActive = (projectId: string) => projectCommands.list(projectId).some(command => command.state === "running" || command.state === "stopping");

export async function withProjectLock<T>(projectId: string, fn: () => Promise<T>, busy = "A file is already being changed in this project."): Promise<T> {
  if (savingProjects.has(projectId)) throw new Error(busy);
  savingProjects.add(projectId);
  try { return await fn(); } finally { savingProjects.delete(projectId); }
}

/** The task as the runtime has it now, still at the reviewed revision with this checkout attached. */
export async function requireCurrentTask(selection: { taskId: string; expectedRevision: number }, projectId: string, errors: { revision: string; detached: string }) {
  const details = await runtimeInvoke<{ task: unknown }>("tasks.get", { taskId: selection.taskId });
  const task = TaskSchema.parse(details.task);
  if (task.revision !== selection.expectedRevision) throw new Error(errors.revision);
  if (!task.resources.some(resource => resource.kind === "repository" && resource.projectId === projectId)) throw new Error(errors.detached);
  return task;
}
