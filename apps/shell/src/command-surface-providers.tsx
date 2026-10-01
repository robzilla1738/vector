import type { PreparedConversation, Task } from "@aux/contracts";
import { conversationDraftEntries } from "./conversation-drafts";
import { openSavedTask } from "./task-navigation";
import { useStore } from "./store";
import { shellIconLayersSm, shellIconPencil, shellIconResult } from "./components/icons";
import type { Suggestion } from "./components/command-provider-types";

export interface CommandSurfaceWork {
  query: string;
  tasks: Task[];
  memory: Array<{ workspaceId: string; name: string; excerpt: string; enabled: boolean }>;
  prepared: PreparedConversation[];
}
export const emptyCommandSurfaceWork = (query: string): CommandSurfaceWork => ({ query, tasks: [], memory: [], prepared: [] });

/** Completes legacy palette provider parity; the shared field already owns
 * history/bookmarks/results/Skills/conversations and native autocomplete. */
export function commandSurfaceWorkRows(query: string, work: CommandSurfaceWork): Suggestion[] {
  const state = useStore.getState();
  const term = query.trim().toLocaleLowerCase();
  if (term.length < 2 || work.query !== query) return [];
  const rows: Suggestion[] = [];
  for (const task of work.tasks) rows.push({ id: `task-${task.taskId}`, section: "tasks", title: task.title,
    detail: task.objective, icon: shellIconLayersSm, run: () => openSavedTask(task.taskId) });
  for (const note of work.memory) {
    if (![...state.layout.spaces, ...(state.layout.archivedSpaces ?? [])].some(space => space.workspaceId === note.workspaceId)) continue;
    rows.push({ id: `memory-${note.workspaceId}`, section: "memory", title: note.name, detail: note.excerpt,
      icon: shellIconResult, run: () => {
        const current = useStore.getState();
        if (![...current.layout.spaces, ...(current.layout.archivedSpaces ?? [])].some(space => space.workspaceId === note.workspaceId)) throw new Error("The Space is no longer available.");
        useStore.setState({ settingsCategory: "Memory", memoryWorkspaceId: note.workspaceId }); current.setOverlay("settings");
      } });
  }
  for (const draft of conversationDraftEntries(state.conversationDrafts, state.runs, work.prepared)) {
    if (!`${draft.title} ${draft.text}`.toLocaleLowerCase().includes(term)) continue;
    rows.push({ id: `draft-${draft.key}`, section: "chats", title: draft.title, detail: `Unsent draft · ${draft.text}`,
      icon: shellIconPencil, run: () => state.openConversationDraft(draft.id) });
  }
  for (const set of state.sets) if (set.name.toLocaleLowerCase().includes(term)) rows.push({ id: `set-${set.setId}`,
    section: "sets", title: set.name, detail: `${set.memberIds.length} members`, icon: shellIconLayersSm,
    run: async () => {
      if (!useStore.getState().sets.some(item => item.setId === set.setId)) throw new Error("The Set is no longer available.");
      await state.refreshResults(set.setId);
      if (!useStore.getState().sets.some(item => item.setId === set.setId)) throw new Error("The Set is no longer available.");
      useStore.getState().setMode("table");
    } });
  return rows;
}
