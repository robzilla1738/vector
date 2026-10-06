import { mergeHistory } from "../run-history";
import { useStore } from "../store";
import type { ChatEntry } from "./model";

export function openChatEntry(entry: ChatEntry) {
  if (entry.kind === "local-run") useStore.getState().setRailView({ kind: "run", runId: entry.run.runId });
  else {
    mergeHistory([entry.item.latestRun]);
    useStore.getState().openConversation(entry.item.latestRun.runId);
  }
}
