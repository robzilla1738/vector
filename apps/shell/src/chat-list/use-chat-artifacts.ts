import { useEffect, useState } from "react";
import type { ConversationArtifact, ConversationSummary } from "@aux/contracts";
import { call } from "../store";
import type { ConversationCollection } from "./collection";

/** Cards read only visible result metadata and bind it to the exact latest turn. */
export function useChatArtifacts(
  collection: ConversationCollection,
  items: readonly ConversationSummary[],
  active: boolean,
) {
  const [result, setResult] = useState<{
    collection: ConversationCollection;
    byId: Record<string, ConversationArtifact>;
  }>();
  useEffect(() => {
    if (!active || !items.length) return;
    let live = true;
    const visible = items.slice(0, 3);
    void Promise.all(
      visible.map(async (item) => {
        if (!collection.current()) return null;
        try {
          const { artifacts } = await call("conversations.artifacts.get", { chatId: item.chatId });
          const artifact = artifacts
            .filter((value) => value.runId === item.latestRun.runId)
            .sort((a, b) => b.createdAt - a.createdAt)[0];
          return artifact ? ([item.chatId, artifact] as const) : null;
        } catch {
          return null;
        }
      }),
    ).then((found) => {
      if (live && collection.current())
        setResult({ collection, byId: Object.fromEntries(found.filter((item) => item !== null)) });
    });
    return () => {
      live = false;
    };
  }, [collection, items, active]);
  return result?.collection === collection ? result.byId : {};
}
