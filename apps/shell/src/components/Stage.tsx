import { tabFullscreenPageId } from "../tab-fullscreen";
import { useShallow } from "zustand/react/shallow";
import { useCommittedSurfaceWitness } from "../committed-surface-witness";
import { useOrganizationEditor } from "../features/organization-state";
import { useSyncExternalStore } from "react";
import { movedSelection, observeMovedSelection } from "../features/window-sync/moved-selection";
import { isHomeAddress, nativePageId } from "../chrome";
import { PaneBoundary } from "./PaneBoundary";
import { deferNamedSurface } from "./DeferredSurface";
import { PageRecovery } from "./PageRecovery";
import { PageSurface } from "./PageSurface";
import { forwardRef, lazy, memo, Suspense, useEffect, useRef, useCallback, type RefObject } from "react";
import { bridge, inNativeHost } from "../bridge";
import { useStore, call, errToast } from "../store";

import { Conversation } from "./surfaces";
import { shellIconChrome } from "../ui/icons";
import { AgentOverlay } from "../agent/AgentOverlay";
import { canSplitPage, splitGroupForPage } from "../workspace";
import { useSurfaceState } from "../features/surfaces/drag-state";
import { useFeature } from "../use-feature";
import { isLocal } from "../tab-window-transfer";
import { staticPrimaryButtonProps as auxClassPrimaryButtonProps } from "../ui/class-props";

const SuspensionPrompt = deferNamedSurface(
  () => import("../features/permissions/SuspensionPrompt"),
  "SuspensionPrompt",
  "Pending action",
);
const StartPage = deferNamedSurface(() => import("./StartPage"), "StartPage", "New tab", true);
const TranslationBar = deferNamedSurface(
  () => import("./TranslationBar"),
  "TranslationBar",
  "Translation",
  true,
  true,
);

const SplitStage = lazy(async () => {
  const module = await import("./SplitStage");
  return { default: module.SplitStage };
});

const Overview = deferNamedSurface(() => import("./Overview"), "Overview", "Tab overview", true);
const ResultsTable = deferNamedSurface(() => import("./ResultsTable"), "ResultsTable", "Results", true);

/** Shared viewport for native pages and browser-owned surfaces. */
export const Stage = memo(
  forwardRef<
    HTMLDivElement,
    { composerRef?: RefObject<HTMLTextAreaElement | null>; scrollRef?: RefObject<HTMLDivElement | null> }
  >(function Stage({ composerRef, scrollRef }, ref) {
    const moved = useSyncExternalStore(observeMovedSelection, movedSelection);
    const enabled = useFeature("windowSync") && !bridge.privateMode;
    const movedCovered = useStore((state) => enabled && !!moved && !!state.pages.byId[moved.pageId ?? ""]);
    const localSelection = useStore((s) =>
      s.activePageId && s.pages.byId[s.activePageId] && isLocal(s.pages.byId[s.activePageId]!)
        ? s.pages.byId[s.activePageId]
        : undefined,
    );
    const page = movedCovered ? undefined : localSelection;
    const mode = useStore((s) => s.mode);
    const fullscreenPageId = useStore((state) => tabFullscreenPageId(state, bridge.windowId));
    const splitting = useFeature("splitView");
    const surfaceState = useSurfaceState();
    const overlay = useStore((s) => s.overlay);
    const confirmation = useStore((s) => s.confirmation);
    const translating = useStore(
      (state) =>
        !!page && (state.translation?.pageId === page.pageId || state.translationPending === page.pageId),
    );
    const hasUrl = !!page && (!!page.showBlankDocument || !isHomeAddress(page.url));
    const loading = !!page?.loading && !page.navigationError && page.viewStatus !== "crashed";

    const organizationCovered = !!useOrganizationEditor();
    const covered =
      !fullscreenPageId && (organizationCovered || !!surfaceState.dragging || surfaceState.picker);
    const splitGroup = useStore((state) => {
      const group = splitting && page ? splitGroupForPage(state.layout, page.pageId) : null;
      return group?.panes.every((id) => {
        const pane = state.pages.byId[id];
        return pane && isLocal(pane) && !pane.ownedByRuntime && canSplitPage(pane);
      })
        ? group
        : null;
    });
    const pages = useStore(
      useShallow((state) =>
        (splitGroup?.panes ?? []).flatMap((id) => (state.pages.byId[id] ? [state.pages.byId[id]!] : [])),
      ),
    );
    const selectedSplit =
      splitGroup &&
      splitGroup.panes.every((id) => {
        const item = pages.find((page) => page.pageId === id);
        return (
          item &&
          nativePageId({
            mode: fullscreenPageId ? "focus" : mode,
            overlay: fullscreenPageId ? null : overlay,
            activePageId: id,
            ...item,
          })
        );
      });
    const splitVisible = !covered && selectedSplit;
    const retainedPage =
      !!page && nativePageId({ ...page, mode: "focus", overlay: null, activePageId: page.pageId });
    // Presentation can change without retiring the original native connector.
    const selectedPage =
      !!page &&
      nativePageId({
        mode: fullscreenPageId ? "focus" : mode,
        overlay: fullscreenPageId ? null : overlay,
        activePageId: page.pageId,
        url: page.url,
        backend: page.backend,
        viewStatus: page.viewStatus,
        navigationError: page.navigationError,
        showBlankDocument: page.showBlankDocument,
      }) === page.pageId;

    const showingPage = !covered && selectedPage;
    const stageNode = useRef<HTMLDivElement>(null);
    const bindStage = useCallback(
      (node: HTMLDivElement | null) => {
        stageNode.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );
    const committedSelection = JSON.stringify([
      mode,
      overlay,
      covered,
      fullscreenPageId && page
        ? [[fullscreenPageId, page.documentEpoch]]
        : splitVisible
          ? splitGroup!.panes.map((id) => {
              const item = pages.find((page) => page.pageId === id)!;
              return [id, item.documentEpoch];
            })
          : showingPage && page
            ? [[page.pageId, page.documentEpoch]]
            : [],
    ]);
    useCommittedSurfaceWitness(stageNode, "stage", () => committedSelection);

    const visibleIds = JSON.stringify(
      fullscreenPageId
        ? [fullscreenPageId]
        : covered
          ? []
          : selectedSplit
            ? splitGroup!.panes
            : selectedPage && page && isLocal(page) && !page.ownedByRuntime
              ? [page.pageId]
              : [],
    );
    useEffect(() => {
      if (!inNativeHost) return;
      let current = true;
      const original = useStore.getState();
      const windowId = bridge.windowId;
      const ids = JSON.parse(visibleIds) as string[];
      // Visibility belongs to WebContents, not a document revision. A same-tab
      // navigation does not retire a genuine current presentation refusal.
      const sources = ids.map((id) => original.pages.byId[id]);
      void bridge.setStageVisible(ids).catch((error) => {
        const state = useStore.getState();
        if (
          current &&
          bridge.windowId === windowId &&
          state.activePageId === original.activePageId &&
          state.mode === original.mode &&
          state.overlay === original.overlay &&
          sources.every((source, index) => {
            const page = state.pages.byId[ids[index]!];
            return source && page && page.windowId === source.windowId;
          })
        )
          errToast(error);
      });
      return () => {
        current = false;
      };
    }, [visibleIds]);
    useEffect(
      () => () => {
        if (inNativeHost) void bridge.setStageVisible([]).catch(errToast);
      },
      [],
    );

    return (
      <div
        inert={
          !fullscreenPageId &&
          (organizationCovered ||
            overlay === "command-surface" ||
            overlay === "tasks" ||
            overlay === "settings" ||
            overlay === "saved-pages")
        }
        className={`stage-card ${loading ? "loading" : ""} ${showingPage ? "has-page" : ""}`}
        data-controller={page?.controller ?? "none"}
      >
        <div
          className="stage-progress"
          role="progressbar"
          aria-hidden={!loading}
          aria-valuetext={loading ? "Loading" : "Idle"}
        />
        {page && translating && <TranslationBar pageId={page.pageId} />}
        <div id="stage" ref={bindStage} data-stage-dragging={surfaceState.dragging ? "true" : "false"}>
          {mode === "focus" &&
            page?.backend === "chrome" &&
            page.viewStatus !== "crashed" &&
            !page.navigationError && (
              <div className="stage-message">
                <div className="empty-state">
                  <span className="empty-ico">{shellIconChrome}</span>
                  <h2>This tab lives in your Chrome</h2>
                  <p>
                    Aux drives it over CDP. Type, click, and upload in the real Chrome window — the agent sees
                    the same page.
                  </p>
                  <div className="empty-actions">
                    <button
                      {...auxClassPrimaryButtonProps}
                      onClick={() => void call("pages.openLive", { pageId: page.pageId }).catch(errToast)}
                    >
                      Open live in Chrome
                    </button>
                  </div>
                </div>
              </div>
            )}
          {mode === "focus" && page?.navigationError && page.viewStatus !== "crashed" && (
            <PageRecovery key={`${page.pageId}:${page.navigationError.url}`} page={page} />
          )}
          {mode === "focus" && page?.viewStatus === "crashed" && (
            <PageRecovery key={page.pageId} page={page} />
          )}
          {mode === "focus" && page?.backend !== "chrome" && !hasUrl && page?.viewStatus !== "crashed" && (
            <StartPage />
          )}
          {(splitGroup || retainedPage) && (
            <div className="stage-native-surface" inert={!showingPage} aria-hidden={!showingPage}>
              {splitGroup ? (
                <Suspense fallback={null}>
                  <SplitStage
                    group={splitGroup}
                    pages={pages}
                    presented={!!splitVisible && (!!fullscreenPageId || overlay !== "command-surface")}
                    fullscreenPageId={fullscreenPageId}
                  />
                </Suspense>
              ) : (
                page && <PageSurface page={page} />
              )}
            </div>
          )}
          {showingPage && page && !splitGroup && <AgentOverlay pageId={page.pageId} />}
          {mode === "conversation" && (
            <PaneBoundary label="This conversation">
              <Conversation composerRef={composerRef} findReturnRef={scrollRef} />
            </PaneBoundary>
          )}
          {mode === "overview" && <Overview />}
          {mode === "table" && <ResultsTable />}
        </div>
        {showingPage && !overlay && confirmation && <SuspensionPrompt pill />}
      </div>
    );
  }),
);
