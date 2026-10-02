import { useCallback, useEffect, useRef, useState } from "react";
import { bridge, type BrowserSiteInfo } from "../bridge";
import { useStore } from "../store";
import {
  shellIconAlert,
  shellIconClose,
  shellIconCode,
  shellIconCookie,
  shellIconGlobe,
  shellIconLock,
  shellIconShield,
} from "./icons";
import { SiteAgentAccess } from "../features/trust/SiteAgentAccess";
import { useFeature } from "../use-feature";
import { PageZoom } from "./PageZoom";
import { siteControlsOpener } from "../site-controls-opener";
import { Dialog } from "../ui";
import "./SiteControls.css";

const labels: Record<string, string> = {
  "media:audio": "Microphone",
  "media:video": "Camera",
  media: "Camera and microphone",
  geolocation: "Location",
  notifications: "Notifications",
  "display-capture": "Screen capture",
  pointerLock: "Pointer lock",
  "idle-detection": "Idle detection",
  "clipboard-read": "Read clipboard",
  "clipboard-sanitized-write": "Write clipboard",
};

function blockedRequestsLabel(count: number) {
  return `${count} request${count === 1 ? "" : "s"} blocked for this site this session`;
}

export function SiteControls() {
  const agentPermissions = useFeature("agentSitePermissions");
  const page = useStore((state) => state.pages.find((page) => page.pageId === state.activePageId));
  const pageId = page?.pageId;
  const setOverlay = useStore((state) => state.setOverlay);
  const key = JSON.stringify([
    pageId,
    page?.url,
    page?.documentEpoch,
    page?.loading,
    page?.navigationError,
    page?.viewStatus,
  ]);
  const currentKey = useRef(key);
  const request = useRef(0);
  const [loaded, setLoaded] = useState<{ key: string; info: BrowserSiteInfo } | null>(null);
  const info = loaded?.key === key ? loaded.info : null;
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(false);
  const actionPending = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(siteControlsOpener());
  const close = () => {
    setOverlay(null);
  };
  const load = useCallback(async () => {
    const version = ++request.current;
    if (!pageId) {
      setError("Open a website to view its site controls.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const value = await bridge.siteInfo(pageId);
      if (version === request.current && currentKey.current === key) setLoaded({ key, info: value });
    } catch (reason) {
      if (version === request.current && currentKey.current === key)
        setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      if (version === request.current && currentKey.current === key) setLoading(false);
    }
  }, [pageId, key]);
  useEffect(() => {
    currentKey.current = key;
    setLoaded(null);
    setNotice("");
    setError("");
    setActionError("");
    setLoading(false);
    if (!page?.loading) void load();
    return () => {
      ++request.current;
    };
  }, [load, page?.loading, key]);
  useEffect(() => {
    let active = true;
    void bridge
      .focusShell()
      .then(() => {
        if (active) closeRef.current?.focus();
      })
      .catch(() => {});
    return () => {
      active = false;
      currentKey.current = "";
    };
  }, []);
  const action = async (name: string, work: () => Promise<boolean | void>, message: string) => {
    if (!info || actionPending.current) return;
    actionPending.current = true;
    const originKey = key;
    const trigger = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null;
    setBusy(name);
    setNotice("");
    setActionError("");
    try {
      const changed = await work();
      if (currentKey.current !== originKey || changed === false) return;
      await load();
      if (currentKey.current === originKey) setNotice(message);
    } catch (reason) {
      if (currentKey.current === originKey)
        setActionError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      actionPending.current = false;
      setBusy("");
      requestAnimationFrame(() => {
        if (
          currentKey.current === originKey &&
          document.activeElement === document.body &&
          trigger?.isConnected
        )
          trigger.focus();
      });
    }
  };
  const reset = (permission?: string) =>
    info &&
    action(
      permission ?? "all",
      () => bridge.clearSitePermission(info.origin, permission),
      permission
        ? `${labels[permission] ?? permission} will ask again.`
        : "This site will ask for access again.",
    );
  const clear = () =>
    info &&
    action(
      "data",
      () => bridge.clearSiteData(info.pageId),
      "Cookies and stored website data cleared. Reload the site to finish signing out.",
    );
  const toggleTrackers = (allowed: boolean) =>
    info &&
    action(
      "trackers",
      async () => {
        await bridge.setSiteTrackers(info.pageId, allowed);
      },
      allowed
        ? `Trackers and ads are allowed on ${new URL(info.url).hostname}. Reload the tab to apply.`
        : "Trackers and ads will be blocked on this site. Reload the tab to apply.",
    );
  const unavailable = !!page?.navigationError || page?.viewStatus === "crashed";
  const security = unavailable
    ? {
        icon: shellIconAlert,
        title: "Connection not established",
        detail:
          "This page did not load successfully. Its address alone does not establish a secure connection.",
      }
    : !info
      ? {
          icon: shellIconGlobe,
          title: error ? "Site details unavailable" : "Checking this page…",
          detail: "",
        }
      : info.security === "secure"
        ? {
            icon: shellIconLock,
            title: "Connection is secure",
            detail: "This page was loaded over an encrypted HTTPS connection.",
          }
        : info.security === "local"
          ? {
              icon: shellIconGlobe,
              title: "Local connection",
              detail: "This page uses an unencrypted connection on this Mac.",
            }
          : {
              icon: shellIconAlert,
              title: "Connection is not secure",
              detail: info.url.startsWith("https:")
                ? "This HTTPS page has a security warning. Information you send may be exposed."
                : "Information sent to this page is not encrypted.",
            };
  return (
    <Dialog
      label={info?.origin ?? "Site controls"}
      onClose={close}
      className="site-controls-card pop-in"
      returnFocus={openerRef}
    >
      <header>
        <div className={`site-security-icon ${unavailable ? "insecure" : (info?.security ?? "")}`}>
          {security.icon}
        </div>
        <div>
          <h2 id="site-controls-title">{info?.origin ?? "Site controls"}</h2>
          <p>{security.title}</p>
        </div>
        <button ref={closeRef} className="icon-btn" aria-label="Close site controls" onClick={close}>
          {shellIconClose}
        </button>
      </header>
      {error && (
        <div className="site-controls-error" role="alert">
          <span>{error}</span>
          <button
            className="btn sm"
            disabled={loading || !!busy || !!page?.loading}
            onClick={() => void load()}
          >
            {loading ? "Refreshing…" : "Refresh details"}
          </button>
        </div>
      )}
      {actionError && (
        <p className="site-controls-error" role="alert">
          {actionError}
        </p>
      )}
      {!info && !error && (
        <output className="site-controls-loading" data-block>
          Loading site details…
        </output>
      )}
      {info && (
        <>
          <PageZoom key={info.pageId} pageId={info.pageId} documentEpoch={page?.documentEpoch} />
          <div className="site-security-copy">
            <span>{security.detail}</span>
          </div>
          <section className="site-controls-group" aria-labelledby="site-data-title">
            <div>
              <span className="site-row-icon">{shellIconCookie}</span>
              <div>
                <strong id="site-data-title">Cookies and site data</strong>
                <span>
                  {info.cookieCount === 1 ? "1 cookie" : `${info.cookieCount} cookies`} stored for this
                  address
                </span>
              </div>
              <button className="btn sm" disabled={!!busy} onClick={() => void clear()}>
                {busy === "data" ? "Clearing…" : "Clear…"}
              </button>
            </div>
            <div>
              <span className="site-row-icon">{shellIconShield}</span>
              <div>
                <strong>Block trackers and ads</strong>
                <span>
                  {info.trackersAllowed ? "Paused on this site" : blockedRequestsLabel(info.blockedCount)}
                </span>
              </div>
              <button
                className="btn sm"
                role="switch"
                aria-checked={!info.trackersAllowed}
                disabled={!!busy}
                onClick={() => void toggleTrackers(!info.trackersAllowed)}
              >
                {busy === "trackers" ? "Saving…" : info.trackersAllowed ? "Off" : "On"}
              </button>
            </div>
          </section>
          <section className="site-controls-group" aria-labelledby="site-access-title">
            <div className="site-group-heading">
              <div>
                <strong id="site-access-title">Site access</strong>
                <span>{bridge.privateMode ? "Only for this private window" : "Saved for this website"}</span>
              </div>
              {Object.keys(info.permissions).length > 0 && (
                <button className="btn sm" disabled={!!busy} onClick={() => void reset()}>
                  {busy === "all" ? "Resetting…" : "Reset all"}
                </button>
              )}
            </div>
            {Object.entries(info.permissions).length ? (
              Object.entries(info.permissions).map(([permission, decision]) => (
                <div className="site-permission-compact" key={permission}>
                  <span>{labels[permission] ?? permission}</span>
                  <span className={`site-decision ${decision}`}>
                    {decision === "allow" ? "Allowed" : "Blocked"}
                  </span>
                  <button
                    className="btn sm"
                    aria-label={`Reset ${labels[permission] ?? permission}`}
                    disabled={!!busy}
                    onClick={() => void reset(permission)}
                  >
                    {busy === permission ? "Resetting…" : "Reset"}
                  </button>
                </div>
              ))
            ) : (
              <p className="site-empty-access">
                No saved access decisions. Aux will ask before this site uses sensitive capabilities.
              </p>
            )}
          </section>
          {agentPermissions && !bridge.privateMode && /^https?:\/\//.test(info.origin) && (
            <SiteAgentAccess origin={`${new URL(info.origin).origin}/`} />
          )}
          {!bridge.privateMode && page?.backend !== "chrome" && /^https?:\/\//.test(info.origin) && (
            <section className="site-controls-group" aria-label="Page customization">
              <div>
                <span className="site-row-icon">{shellIconCode}</span>
                <div>
                  <strong>Customize this site</strong>
                  <span>Hide page elements or add CSS for this Profile</span>
                </div>
                <button className="btn sm" disabled={!!busy} onClick={() => setOverlay("zap")}>
                  Open…
                </button>
              </div>
            </section>
          )}
          {notice && (
            <output className="site-controls-notice" data-block>
              {notice}
            </output>
          )}
        </>
      )}
    </Dialog>
  );
}
