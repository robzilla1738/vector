import { forwardRef } from "react";
import type { PageTarget } from "@vector/contracts";
import { inElectron, inMock } from "../bridge";
import { useStore, call, errToast } from "../store";
import { EngineView } from "./EngineView";
import { MockPage } from "./MockPage";
import { Overview } from "./Overview";
import { ResultsTable } from "./ResultsTable";
import { StartPage } from "./StartPage";
import { I } from "./icons";

/**
 * The page area — Arc's card: a rounded viewport inset from the window edge
 * with a soft shadow. `#stage` is the rect the native WebContentsView is
 * pinned to; engine pages paint a software screenshot here instead.
 */
export const Stage = forwardRef<HTMLDivElement, { page: PageTarget | undefined }>(function Stage({ page }, ref) {
  const mode = useStore((s) => s.mode);
  const connected = useStore((s) => s.connected);
  const hasUrl = !!page && !!page.url && page.url !== "about:blank";
  const loading = !!page?.loading;

  return (
    <div className={`stage-card ${loading ? "loading" : ""} ${hasUrl && page?.backend !== "chrome" && page?.viewStatus !== "crashed" ? "has-page" : ""}`} data-controller={page?.controller ?? "none"}>
      <div className="stage-progress" role="progressbar" aria-hidden={!loading} aria-valuetext={loading ? "Loading" : "Idle"} />
      <div id="stage" ref={ref}>
        {mode === "focus" && page?.backend === "chrome" && (
          <div className="stage-message">
            <div className="empty-state">
              <span className="empty-ico">{I.chrome}</span>
              <h2>This tab lives in your Chrome</h2>
              <p>Vector drives it over CDP. Type, click, and upload in the real Chrome window — the agent sees the same page.</p>
              <div className="empty-actions">
                <button className="btn primary" onClick={() => void call("pages.openLive", { pageId: page.pageId }).catch(errToast)}>
                  Open live in Chrome
                </button>
              </div>
            </div>
          </div>
        )}
        {mode === "focus" && page?.viewStatus === "crashed" && (
          <div className="stage-message">
            <div className="empty-state">
              <span className="empty-ico err">{I.alert}</span>
              <h2>This tab crashed</h2>
              <p>{page.error ?? "The renderer process went away."} Reload to try again.</p>
              <div className="empty-actions">
                <button className="btn primary" onClick={() => void call("pages.reload", { pageId: page.pageId }).catch(errToast)}>Reload</button>
              </div>
            </div>
          </div>
        )}
        {mode === "focus" && page?.backend !== "chrome" && !hasUrl && connected && <StartPage />}
        {mode === "focus" && !hasUrl && !connected && (
          <div className="stage-message">
            <div className="empty-state">
              <span className="empty-ico"><span className="spin" /></span>
              <h2>Waiting for the runtime</h2>
              <p>Vector's runtime process is not answering yet. Your tabs stay open; the agent resumes as soon as it reconnects.</p>
            </div>
          </div>
        )}
        {mode === "focus" && hasUrl && page?.backend === "vector-engine" && page.viewStatus !== "crashed" && inElectron && <EngineView page={page} />}
        {mode === "focus" && hasUrl && page?.backend !== "chrome" && page?.viewStatus !== "crashed" && !inElectron && inMock && <MockPage page={page} />}
        {mode === "overview" && <Overview />}
        {mode === "table" && <ResultsTable />}
      </div>
    </div>
  );
});
