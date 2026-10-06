import { useEffect, type RefObject } from "react";
import { bridge } from "../bridge";
import { useStore, call, errToast, toast } from "../store";
import { orderedPages } from "../store/pages";
import { useMemoryDrafts } from "../memory-drafts";

export function usePageActions(conversationComposer: RefObject<HTMLTextAreaElement | null>) {
  useEffect(
    () =>
      bridge.onPageAction((action) => {
        if (action.windowId && action.windowId !== bridge.windowId) return;
        if (bridge.privateMode) return;
        if (action.action === "remember") {
          const state = useStore.getState();
          const space = state.layout.spaces.find((space) => space.id === state.layout.activeSpaceId);
          if (!space?.workspaceId) {
            errToast(new Error("Choose a Space before saving memory."));
            return;
          }
          const workspaceId = space.workspaceId,
            key = `item:${workspaceId}`;
          const openMemory = () => {
            useStore.setState({ memoryWorkspaceId: workspaceId, settingsCategory: "Memory" });
            useStore.getState().setOverlay("settings");
          };
          if (useMemoryDrafts.getState().drafts[key]) {
            openMemory();
            errToast(
              new Error(
                "Finish or discard the existing memory-note draft before remembering another selection.",
              ),
            );
            return;
          }
          void call("workspaces.memory.get", { workspaceId })
            .then((memory) => {
              if (useMemoryDrafts.getState().drafts[key])
                throw new Error(
                  "A memory-note draft was opened while loading. Your existing draft is preserved.",
                );
              let sourceUrl = "";
              try {
                const url = new URL(action.url);
                if (
                  ["http:", "https:"].includes(url.protocol) &&
                  !url.username &&
                  !url.password &&
                  url.href.length <= 2048
                )
                  sourceUrl = url.href;
              } catch {
                /* Non-web selections remain explicit unsourced notes. */
              }
              useMemoryDrafts.getState().write(key, {
                revision: memory.revision,
                content: JSON.stringify({
                  itemId: crypto.randomUUID(),
                  content: action.selection,
                  sourceUrl,
                  expires: "",
                  selectionTruncated: action.truncated,
                }),
              });
              if (useStore.getState().layout.activeSpaceId === space.id) openMemory();
              else toast(`Memory draft saved in ${space.name}. Open Memory settings to review it.`);
            })
            .catch(errToast);
          return;
        }
        void import("../selection-action-draft")
          .then(({ prepareSelectionActionDraft }) => {
            // Resolve after loading so a navigation during the import cannot create a stale draft.
            const state = useStore.getState();
            const prepared = prepareSelectionActionDraft({
              action,
              pages: orderedPages(state.pages),
              preferences: state.settings.selectionCapture,
              windowId: bridge.windowId,
              privateMode: bridge.privateMode,
            });
            const id = crypto.randomUUID();
            state.setConversationContext(id, prepared.source.pageId);
            state.setConversationBrowserSources(id, [prepared.source]);
            state.setConversationDraft(id, prepared.draft);
            const open = () => {
              state.openConversationDraft(id);
              requestAnimationFrame(() => conversationComposer.current?.focus());
            };
            if (prepared.needsImage) {
              const image = action.image!;
              void call("conversations.images.add", {
                chatId: id,
                filename: "page-image.png",
                dataUrl: image.dataUrl!,
                sourceUrl: image.srcURL,
              })
                .then(open)
                .catch((error) => {
                  open();
                  errToast(error instanceof Error ? error : new Error(String(error)));
                });
            } else open();
          })
          .catch((error) => errToast(error instanceof Error ? error : new Error(String(error))));
      }),
    [],
  );
}
