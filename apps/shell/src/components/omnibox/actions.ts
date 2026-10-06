import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { PageTarget, Run } from "@aux/contracts";
import { AskCircuitBreaker, type Intent } from "../../intent";
import { bridge, inNativeHost } from "../../bridge";
import { useStore } from "../../store";
import { auxShellPathFromUrl } from "../../settings/routes";
import { openCommandSurface, type CommandSurfaceMode } from "../../command-surface-state";
import type { useNativeOmnibox } from "./use-native-omnibox";

export const askBreaker = new AskCircuitBreaker();
let pendingAsk: Promise<Run | null> | null = null;
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
}: Actions) {
  return useCallback(
    async (i: Intent, alt = false, _typedPick = false) => {
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
