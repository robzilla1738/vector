import { useCommittedSurfaceWitness } from "../committed-surface-witness";
import { useOrganizationEditor } from "../features/organization-state";
import { useSyncExternalStore } from "react";
import { movedSelection, observeMovedSelection } from "../features/window-sync/moved-selection";
import { isHomeAddress, nativePageId } from "../chrome";
import { PaneBoundary } from "./PaneBoundary";
import { deferNamedSurface } from "./DeferredSurface";
import { PageRecovery } from "./PageRecovery";
import { forwardRef, lazy, memo, Suspense, useEffect, useRef, useCallback, type RefObject } from "react";
import { bridge, inNativeHost } from "../bridge";
import { useStore, call, errToast } from "../store";

import { Conversation } from "./surfaces";
import { shellIconChrome } from "./icons";
import { AgentOverlay } from "../agent/AgentOverlay";
import { visibleSplitGroup } from "../features/surfaces/split-actions";
import { useSurfaceState } from "../features/surfaces/drag-state";
import { useFeature } from "../use-feature";
import { isLocal, ownPages } from "../tab-window-transfer";
import { staticPrimaryButtonProps as auxClassPrimaryButtonProps } from "../ui/class-props";

const StartPage = deferNamedSurface(() => import("./StartPage"), "StartPage", "New tab", true);
const TranslationBar = deferNamedSurface(
  () => import("./TranslationBar"),
  "TranslationBar",
  "Translation",
  true,
  true,
);

const PageSurface = lazy(async () => {
  const module = await import("./PageSurface");
  return { default: module.PageSurface };
});
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
    const movedCovered = useStore(
      (state) => enabled && !!moved && state.pages.some((page) => page.pageId === moved.pageId),
    );
    const localSelection = useStore((s) =>
      s.activePageId ? ownPages(s.pages).find((p) => p.pageId === s.activePageId) : undefined,
    );
    const page = movedCovered ? undefined : localSelection;
    const mode = useStore((s) => s.mode);
    const layout = useStore((s) => s.layout);
    const pages = useStore((s) => s.pages);
    const splitting = useFeature("splitView");
    const surfaceState = useSurfaceState();
    const overlay = useStore((s) => s.overlay);
    const confirming = useStore((s) => !!s.confirmation);
    const translating = useStore(
      (state) =>
        !!page && (state.translation?.pageId === page.pageId || state.translationPending === page.pageId),
    );
    const hasUrl = !!page && (!!page.showBlankDocument || !isHomeAddress(page.url));
    const loading = !!page?.loading && !page.navigationError && page.viewStatus !== "crashed";

    const organizationCovered = !!useOrganizationEditor();
    const covered = organizationCovered || !!surfaceState.dragging || surfaceState.picker;
    const splitGroup = splitting && page && mode === "focus" ? visibleSplitGroup(layout, page.pageId) : null;
    const selectedSplit =
      splitGroup &&
      splitGroup.panes.every((id) => {
        const item = pages.find((page) => page.pageId === id);
        return item && nativePageId({ mode, overlay, confirming, activePageId: id, ...item });
      });
    const splitVisible = !covered && selectedSplit;
    // A scrim or an action confirmation replaces the page so the dialog is the thing that can be clicked.
    const selectedPage =
      !!page &&
      nativePageId({
        mode,
        overlay,
        confirming,
        activePageId: page.pageId,
        url: page.url,
        backend: page.backend,
        viewStatus: page.viewStatus,
        navigationError: page.navigationError,
        showBlankDocument: page.showBlankDocument,
      }) === page.pageId;

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
      confirming,
      organizationCovered,
      selectedSplit
        ? splitGroup!.panes.map((id) => {
            const item = pages.find((page) => page.pageId === id)!;
            return [id, item.documentEpoch];
          })
        : selectedPage && page
          ? [[page.pageId, page.documentEpoch]]
          : [],
    ]);
    useCommittedSurfaceWitness(stageNode, "stage", () => committedSelection);

    const showingPage = !covered && selectedPage;
    const visibleIds = JSON.stringify(
      organizationCovered
        ? []
        : selectedSplit
          ? splitGroup!.panes
          : selectedPage && page && isLocal(page) && !page.ownedByRuntime
            ? [page.pageId]
            : [],
    );
    useEffect(() => {
      if (inNativeHost) void bridge.setStageVisible(JSON.parse(visibleIds) as string[]).catch(errToast);
    }, [visibleIds]);
    useEffect(
      () => () => {
        if (inNativeHost) void bridge.setStageVisible([]).catch(errToast);
      },
      [],
    );

    return (
      <div
        inert={organizationCovered || overlay === "tasks" || overlay === "settings"}
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
          {showingPage && page && !splitVisible && (
            <Suspense fallback={<div className="stage-message">Opening page…</div>}>
              <PageSurface page={page} />
            </Suspense>
          )}
          {showingPage && page && !splitVisible && <AgentOverlay pageId={page.pageId} />}
          {splitVisible && (
            <Suspense fallback={null}>
              <SplitStage group={splitGroup!} pages={pages} />
            </Suspense>
          )}
          {mode === "conversation" && (
            <PaneBoundary label="This conversation">
              <Conversation composerRef={composerRef} findReturnRef={scrollRef} />
            </PaneBoundary>
          )}
          {mode === "overview" && <Overview />}
          {mode === "table" && <ResultsTable />}
        </div>
      </div>
    );
  }),
);
