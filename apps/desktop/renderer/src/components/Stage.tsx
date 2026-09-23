import { SplitDivider } from "./SplitDivider";
import { PaneBoundary } from "./PaneBoundary";
import { isScrimOverlay, nativePageId } from "../chrome";
import { deferSurface } from "./DeferredSurface";
import { navigationFailure } from "../navigation-failure";
import { forwardRef, memo, useRef, useState } from "react";
import type { PageTarget } from "@aux/contracts";
import { bridge, inElectron, inMock } from "../bridge";
import { useStore, call, errToast, tabCommand } from "../store";

import { TranslationBar } from "./TranslationBar";
import { Conversation, MockPage } from "./surfaces";
import { StartPage } from "./StartPage";
import { I } from "./icons";

const Overview = deferSurface(async () => { const module = await import("./Overview"); return {default:module.Overview}; }, "Tab overview", true);
const ResultsTable = deferSurface(async () => { const module = await import("./ResultsTable"); return {default:module.ResultsTable}; }, "Results", true);

function PageRecovery({ page }: { page: PageTarget }) {
  const [busy, setBusy] = useState<"reload" | "back" | "proceed" | null>(null);
  const pending = useRef(false);
  const [actionError, setActionError] = useState("");
  const error = page.navigationError;
  const crashed = page.viewStatus === "crashed";
  const httpFallback = !crashed && !!error?.upgradedFrom;
  const failure = crashed ? {title:"This tab crashed",detail:"Reload to try again. Unsaved changes on this page may be lost."} : httpFallback ? {title:"This site doesn't support secure connections",detail:"Aux tried to load it over encrypted HTTPS but the site didn't respond securely. You can continue over unencrypted HTTP — information you send won't be private on this site."} : navigationFailure(error!);
  const insecure = !crashed && !httpFallback && !!error && /ERR_CERT_/.test(error.message);
  const recover = async (action: "reload" | "back") => {
    if (pending.current) return;
    pending.current = true;
    setBusy(action); setActionError("");
    try { await call(action === "reload" ? "pages.reload" : "pages.back", { pageId: page.pageId }); }
    catch (reason) {
      const detail = reason instanceof Error ? reason.message : String(reason);
      setActionError(`${action === "reload" ? "Couldn’t reload this tab" : "Couldn’t go back"}. ${detail}`);
    }
    finally { pending.current = false; setBusy(null); }
  };
  const proceed = async () => {
    if (pending.current || !error) return;
    pending.current = true;
    setBusy("proceed"); setActionError("");
    try {
      if (error.upgradedFrom) await bridge.useHttp(page.pageId, error.upgradedFrom);
      else {
        await bridge.proceedInsecure(error.url);
        await tabCommand({ kind: "reload", pageId: page.pageId });
      }
    } catch (reason) {
      setActionError(`Couldn’t proceed. ${reason instanceof Error ? reason.message : String(reason)}`);
    } finally { pending.current = false; setBusy(null); }
  };
  return <div className="stage-message"><div className="empty-state navigation-error" role="status">
    <span className={`empty-ico ${crashed ? "err" : ""}`}>{crashed ? I.alert : I.globe}</span><h2>{failure.title}</h2>
    <p>{failure.detail}</p>
    <p className="navigation-error-address selectable">{error?.url ?? page.url}</p>
    <div className="empty-actions">
      <button className="btn primary" disabled={busy !== null} onClick={() => void recover("reload")}>{busy === "reload" ? "Trying…" : crashed ? "Reload" : "Try again"}</button>
      <button className="btn" onClick={() => useStore.getState().focusCommandBar()}>Edit address</button>
      {page.canGoBack && <button className="btn" disabled={busy !== null} onClick={() => void recover("back")}>{busy === "back" ? "Going back…" : "Go back"}</button>}
      {httpFallback && <button className="btn" disabled={busy !== null} onClick={() => void proceed()}>{busy === "proceed" ? "Continuing…" : "Continue over HTTP"}</button>}
      {insecure && <button className="btn ghost" disabled={busy !== null} onClick={() => void proceed()}>{busy === "proceed" ? "Proceeding…" : "Proceed anyway (unsafe)"}</button>}
    </div>
    {actionError && <p role="alert">{actionError}</p>}
    {error && !crashed && <details className="navigation-error-details"><summary>Connection details</summary><p className="selectable">{error.message} ({error.code})</p></details>}
  </div></div>;
}

/** Shared viewport for native pages and browser-owned surfaces. */
export const Stage = memo(forwardRef<HTMLDivElement>(function Stage(_props, ref) {
  const page = useStore((s) => (s.activePageId ? s.pages.find((p) => p.pageId === s.activePageId) : undefined));
  const mode = useStore((s) => s.mode);
  const companion = useStore(s => s.pages.find(item => item.pageId === s.splitPageId));
  const overlay = useStore(s => s.overlay);
  const connected = useStore((s) => s.connected);
  const hasUrl = !!page && (!!page.showBlankDocument || (!!page.url && page.url !== "about:blank"));
  const loading = !!page?.loading && !page.navigationError && page.viewStatus !== "crashed";

  const splitVisible = mode === "focus" && page && companion && companion.pageId !== page.pageId
    && [page, companion].every(item => nativePageId({mode,overlay,activePageId:item.pageId,...item}));
  // A scrim replaces the page. A floating toolbar would lay that surface under the window buttons.
  const showingPage = mode === "focus" && !isScrimOverlay(overlay) && hasUrl && page?.backend !== "chrome" && page?.viewStatus !== "crashed" && !page?.navigationError;

  return (
    <div inert={overlay === "tasks" || overlay === "settings"} className={`stage-card ${loading ? "loading" : ""} ${showingPage ? "has-page" : ""}`} data-controller={page?.controller ?? "none"}>
      <div className="stage-progress" role="progressbar" aria-hidden={!loading} aria-valuetext={loading ? "Loading" : "Idle"} />
      {page && <TranslationBar pageId={page.pageId} />}
      <div id="stage" ref={ref}>
        {mode === "focus" && page?.backend === "chrome" && page.viewStatus !== "crashed" && !page.navigationError && (
          <div className="stage-message">
            <div className="empty-state">
              <span className="empty-ico">{I.chrome}</span>
              <h2>This tab lives in your Chrome</h2>
              <p>Aux drives it over CDP. Type, click, and upload in the real Chrome window — the agent sees the same page.</p>
              <div className="empty-actions">
                <button className="btn primary" onClick={() => void call("pages.openLive", { pageId: page.pageId }).catch(errToast)}>
                  Open live in Chrome
                </button>
              </div>
            </div>
          </div>
        )}
        {mode === "focus" && page?.navigationError && page.viewStatus !== "crashed" && (
          <PageRecovery key={`${page.pageId}:${page.navigationError.url}`} page={page} />
        )}
        {mode === "focus" && page?.viewStatus === "crashed" && <PageRecovery key={page.pageId} page={page} />}
        {mode === "focus" && page?.backend !== "chrome" && !hasUrl && page?.viewStatus !== "crashed" && connected && <StartPage />}
        {mode === "focus" && !hasUrl && page?.viewStatus !== "crashed" && !connected && (
          <div className="stage-message">
            <div className="empty-state">
              <span className="empty-ico"><span className="spin" /></span>
              <h2>Waiting for the runtime</h2>
              <p>Aux's runtime process is not answering yet. Your tabs stay open. Reconnect to inspect the task before resuming.</p>
            </div>
          </div>
        )}
        {mode === "focus" && hasUrl && page?.backend !== "chrome" && page?.viewStatus !== "crashed" && !page?.navigationError && !inElectron && inMock && !splitVisible && <MockPage page={page} />}
        {splitVisible && <SplitDivider preview={!inElectron && inMock ? [page!, companion!] : undefined} />}
        {mode === "conversation" && <PaneBoundary label="This conversation"><Conversation /></PaneBoundary>}
        {mode === "overview" && <Overview />}
        {mode === "table" && <ResultsTable />}
      </div>
    </div>
  );
}));
