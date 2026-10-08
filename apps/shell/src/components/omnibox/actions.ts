import { useCallback, useLayoutEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { PageTarget, Run } from "@aux/contracts";
import { AskCircuitBreaker, type Intent } from "../../intent";
import { toUrl } from "../../chrome";

import { bridge, inNativeHost } from "../../bridge";
import { call, useStore } from "../../store";
import { auxShellPathFromUrl } from "../../settings/routes";
import { openCommandSurface, type CommandSurfaceMode } from "../../command-surface-state";
import type { useNativeOmnibox } from "./use-native-omnibox";

export const askBreaker = new AskCircuitBreaker();
let pendingAsk: Promise<Run | null> | null = null;
const CLASSIFICATION_ALLOWANCE_MS = 150;

async function classifyCommittedInput(text: string) {
  if (inNativeHost && !useStore.getState().connected) return null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      call("agent.utility.intent", { text }).catch(() => null),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), CLASSIFICATION_ALLOWANCE_MS);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
type Workspace = ReturnType<typeof useStore.getState>;
type Actions = {
  page?: PageTarget;
  newTab: Workspace["newTab"];
  startRun: Workspace["startRun"];
  hero: boolean;
  surfaceMode?: CommandSurfaceMode;
  browserAutocomplete: boolean;
  nativeOmnibox: Pick<ReturnType<typeof useNativeOmnibox>, "openInput">;
  setBreakerVersion: Dispatch<SetStateAction<number>>;
  committedInput?: { text: string; generation: number; classify: boolean };
};
/** Browser acceptance and Ask acknowledgement retain their own authorities. */
export function useOmniboxActions({
  page,
  newTab,
  startRun,
  hero,
  surfaceMode,
  browserAutocomplete,
  nativeOmnibox,
  setBreakerVersion,
  committedInput,
}: Actions) {
  const owner = useRef<{
    live: boolean;
    text: string;
    generation: number;
    classify: boolean;
    windowId: typeof bridge.windowId;
    privateMode: boolean;
  } | null>(null);
  const text = committedInput?.text ?? "";
  const generation = committedInput?.generation ?? 0;
  const classify = committedInput?.classify ?? false;
  useLayoutEffect(() => {
    const current = {
      live: true,
      text,
      generation,
      classify,
      windowId: bridge.windowId,
      privateMode: bridge.privateMode,
    };
    owner.current = current;
    return () => {
      current.live = false;
    };
  }, [text, generation, classify, page?.pageId, page?.documentEpoch, page?.url]);
  return useCallback(
    async (i: Intent, alt = false, typedPick = false) => {
      const original = owner.current;
      if (
        typedPick &&
        original?.classify &&
        !original.privateMode &&
        (i.kind === "run" || (i.kind === "search" && !i.engine))
      ) {
        const result = await classifyCommittedInput(original.text);
        if (
          !original.live ||
          owner.current !== original ||
          bridge.windowId !== original.windowId ||
          bridge.privateMode !== original.privateMode
        )
          throw new Error("The committed input changed. Choose the current input again.");
        if (result?.kind === "chat" && !askBreaker.unavailable())
          i = { kind: "run", goal: original.text, scope: page ? "page" : "new" };
        else if (result?.kind === "search") {
          const engine = useStore.getState().settings.searchEngine;
          i = {
            kind: "search",
            query: original.text,
            url: toUrl(original.text, typeof engine === "string" ? engine : undefined),
          };
        }
      }
      switch (i.kind) {
        case "navigate":
        case "search": {
          if (i.kind === "navigate" && inNativeHost) {
            const shellPath = auxShellPathFromUrl(i.url);
            if (shellPath !== null) {
              if (window.location.pathname !== shellPath) window.history.pushState(null, "", shellPath);
              window.dispatchEvent(new PopStateEvent("popstate"));
              break;
            }
          }
          if (inNativeHost && browserAutocomplete && (i.kind === "navigate" || !i.engine)) {
            await nativeOmnibox.openInput(
              alt
                ? surfaceMode === "new-tab"
                  ? "new-background-tab"
                  : "new-foreground-tab"
                : surfaceMode === "new-tab"
                  ? "new-foreground-tab"
                  : "current-tab",
            );
            break;
          }
          const url = i.url;
          if (surfaceMode === "new-tab" && alt) {
            const ack = await bridge.tabCommand(
              { kind: "open", url, activate: false },
              useStore.getState().catalogVersion,
            );
            if (ack.status === "rejected" || !ack.pageId)
              throw new Error(ack.error?.message ?? "The tab could not be opened.");
          } else if (surfaceMode === "new-tab" || alt) {
            if (!(await newTab(url))) throw new Error("The tab could not be opened.");
          } else if (page) await useStore.getState().navigatePage(page.pageId, url);
          else if (!(await newTab(url))) throw new Error("The tab could not be opened.");
          break;
        }
        case "run": {
          if (pendingAsk)
            throw new Error(
              "An Ask request is still awaiting acknowledgement. You can search while it finishes.",
            );
          let timer: ReturnType<typeof setTimeout> | undefined;
          try {
            if (inNativeHost && !useStore.getState().connected)
              throw new Error("Ask is reconnecting. Your prompt is kept; you can keep browsing.");
            if (useStore.getState().settings.modelConfigured === false)
              throw new Error("Ask is unavailable. Connect a model in Settings; your prompt is kept.");
            const request = hero
              ? startRun(i.goal, { scope: "new", chatId: crypto.randomUUID(), presentation: "conversation" })
              : startRun(i.goal, { scope: alt ? "new" : i.scope });
            pendingAsk = request;
            void request.then(
              () => {
                if (pendingAsk === request) pendingAsk = null;
              },
              () => {
                if (pendingAsk === request) pendingAsk = null;
              },
            );
            const acknowledged = await Promise.race([
              request,
              new Promise<never>((_, reject) => {
                timer = setTimeout(
                  () => reject(new Error("Ask did not acknowledge within five seconds")),
                  5000,
                );
              }),
            ]);
            if (!acknowledged) throw new Error("Ask is unavailable. Your prompt is kept.");
          } catch (error) {
            askBreaker.failed();
            setBreakerVersion((value) => value + 1);
            throw error;
          } finally {
            clearTimeout(timer);
          }
          break;
        }
        case "command":
          openCommandSurface({ mode: "command", seed: i.query });
          break;
        case "empty":
          if (surfaceMode === "new-tab") {
            if (alt) {
              const ack = await bridge.tabCommand(
                { kind: "open", url: "about:blank", activate: false },
                useStore.getState().catalogVersion,
              );
              if (ack.status === "rejected" || !ack.pageId)
                throw new Error(ack.error?.message ?? "The tab could not be opened.");
            } else if (!(await newTab("about:blank"))) throw new Error("The tab could not be opened.");
          }
          break;
      }
    },
    [page, newTab, startRun, hero, surfaceMode, browserAutocomplete, nativeOmnibox, setBreakerVersion],
  );
}
