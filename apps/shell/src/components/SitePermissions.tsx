import { staticHintProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../store";
import { bridge } from "../bridge";
import { FilterListManager } from "./FilterListManager";
import { useFeature } from "../use-feature";
import { nativeAlertRoleProps, nativeCheckboxTypeProps } from "../ui/native-attribute-props";

type Decisions = Record<string, Record<string, "allow" | "deny">>;
const labels: Record<string, string> = {
  media: "Camera and microphone",
  "media:audio": "Microphone",
  "media:video": "Camera",
  geolocation: "Location",
  notifications: "Notifications",
  "display-capture": "Screen capture",
  pointerLock: "Pointer lock",
  "idle-detection": "Idle detection",
  "clipboard-read": "Read clipboard",
  "clipboard-sanitized-write": "Write clipboard",
};

export function SitePermissions({ query = "" }: { query?: string }) {
  const contentBlockingAvailable = useFeature("contentBlocking");
  const openSites = useStore(
    useShallow((state) => {
      const origins = new Set<string>();
      return state.pages.flatMap((page) => {
        if (page.backend !== "aux" || !/^https?:/.test(page.url) || !URL.canParse(page.url)) return [];
        const origin = new URL(page.url).origin;
        if (origins.has(origin)) return [];
        origins.add(origin);
        return [`${page.pageId}\u0000${page.url}`];
      });
    }),
  ).map((key) => {
    const split = key.indexOf("\u0000");
    return { pageId: key.slice(0, split), url: key.slice(split + 1) };
  });
  const [selectedPage, setSelectedPage] = useState("");
  const chosenPage = openSites.find((page) => page.pageId === selectedPage) ?? openSites[0];
  const siteDataKey = chosenPage ? `${chosenPage.pageId}\u0000${chosenPage.url}` : "";
  const [siteDataCount, setSiteDataCount] = useState<{ key: string; domain: string; cookies: number } | null>(
    null,
  );
  const [siteDataError, setSiteDataError] = useState<{ key: string; message: string } | null>(null);
  const [siteDataReview, setSiteDataReview] = useState("");
  const [siteDataRetry, setSiteDataRetry] = useState(0);
  const currentSiteDataCount = siteDataCount?.key === siteDataKey ? siteDataCount : null;
  const currentSiteDataError = siteDataError?.key === siteDataKey ? siteDataError.message : "";
  const [decisions, setDecisions] = useState<Decisions>({});
  const [privacy, setPrivacy] = useState<{
    trackerBlock: boolean;
    blocked: number;
    allowedHosts?: string[];
    httpsUpgrade?: boolean;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loadError, setLoadError] = useState("");
  const [privacyError, setPrivacyError] = useState("");
  const request = useRef(0);
  const pending = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  async function load() {
    const version = ++request.current;
    setLoading(true);
    setLoadError("");
    setPrivacyError("");
    const [decisionsResult, privacyResult] = await Promise.allSettled([
      bridge.sitePermissions(),
      contentBlockingAvailable ? bridge.privacy() : Promise.resolve(null),
    ]);
    if (version === request.current) {
      if (decisionsResult.status === "fulfilled") setDecisions(decisionsResult.value);
      else
        setLoadError(
          decisionsResult.reason instanceof Error
            ? decisionsResult.reason.message
            : String(decisionsResult.reason),
        );
      if (privacyResult.status === "fulfilled") setPrivacy(privacyResult.value);
      else {
        setPrivacy(null);
        setPrivacyError(
          privacyResult.reason instanceof Error ? privacyResult.reason.message : String(privacyResult.reason),
        );
      }
    }
    if (version === request.current) setLoading(false);
  }
  useEffect(() => {
    void load();
    const refresh = () => {
      if (!pending.current && document.visibilityState !== "hidden") void load();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      ++request.current;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  useEffect(() => {
    if (!chosenPage) return;
    let current = true;
    const key = siteDataKey;
    void bridge
      .siteDataCount(chosenPage.pageId)
      .then((result) => {
        if (current) setSiteDataCount({ key, ...result });
      })
      .catch((reason) => {
        if (current) setSiteDataError({ key, message: errorMessage(reason) });
      });
    return () => {
      current = false;
    };
  }, [siteDataKey, siteDataRetry]);
  async function action(id: string, work: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;
    ++request.current;
    setLoading(false);
    setBusy(id);
    setError("");
    setNotice("");
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    try {
      await work();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      pending.current = false;
      setBusy("");
      requestAnimationFrame(() => {
        if (!root.current || document.activeElement !== document.body) return;
        if (trigger?.isConnected) trigger.focus();
        else searchInput.current?.focus();
      });
    }
  }
  const reset = (origin: string, permission?: string) =>
    action(origin, async () => {
      if (!(await bridge.clearSitePermission(origin, permission)))
        throw new Error("The permission reset was not confirmed. Refresh permissions before trying again.");
      setDecisions((current) => {
        const next = { ...current };
        if (permission) {
          next[origin] = { ...next[origin] };
          delete next[origin][permission];
          if (!Object.keys(next[origin]).length) delete next[origin];
        } else delete next[origin];
        return next;
      });
      setNotice(
        "Decision reset. Reload this site to request access again. An active capture may continue until you stop it or close the tab.",
      );
      await load();
    });
  const clearData = () =>
    chosenPage &&
    currentSiteDataCount &&
    action(chosenPage.pageId, async () => {
      const latest = await bridge.siteDataCount(chosenPage.pageId);
      if (latest.domain !== currentSiteDataCount.domain || latest.cookies !== currentSiteDataCount.cookies) {
        setSiteDataCount({ key: siteDataKey, ...latest });
        setSiteDataReview("");
        setSiteDataError({
          key: siteDataKey,
          message: "The cookie count changed. Review it before clearing.",
        });
        return;
      }
      if (!(await bridge.clearSiteData(chosenPage.pageId)))
        throw new Error("Website data could not be cleared. Try again after the page finishes loading.");
      setSiteDataReview("");
      setSiteDataCount({ key: siteDataKey, domain: latest.domain, cookies: 0 });
      setNotice(
        "Cookies and stored website data cleared. Reload the site's open tabs. Cached files and permission decisions remain.",
      );
    });
  const terms = `${search} ${/site|permission/i.test(query) ? "" : query}`.trim().toLowerCase();
  const sites = Object.entries(decisions)
    .sort(([a], [b]) => a.localeCompare(b))
    .filter(([origin, permissions]) =>
      `${origin} ${Object.keys(permissions)
        .map((key) => labels[key] ?? key)
        .join(" ")}`
        .toLowerCase()
        .includes(terms),
    );
  const toggleTracking = () =>
    action("tracker-block", async () => {
      if (!privacy)
        throw new Error("Privacy settings are unavailable. Refresh them before changing tracker blocking.");
      const next = await bridge.setTrackerBlock(!privacy.trackerBlock);
      setPrivacy((current) => ({ ...current, ...next }));
      setNotice(
        next.trackerBlock
          ? "Tracker and ad blocking is on for new requests. Reload open tabs to refresh hidden page elements."
          : "Tracker and ad blocking is off for new requests.",
      );
    });
  const removeAllowed = (host: string) =>
    action(`allow-${host}`, async () => {
      const allowedHosts = await bridge.removeAllowedHost(host);
      setPrivacy((current) => (current ? { ...current, allowedHosts } : current));
      setNotice(`${host} will block trackers and ads again. Reload its tabs to apply.`);
    });
  return (
    <div ref={root} className="site-permissions">
      <p {...staticHintProps}>
        Manage saved website access for the shared human and agent browsing profile. Resetting a decision
        makes the site ask again; it does not clear cookies or sign you out.
      </p>
      {contentBlockingAvailable && (
        <section className="site-data-group" aria-label="Privacy">
          <header>
            <strong>Privacy</strong>
          </header>
          {privacyError && (
            <p {...nativeAlertRoleProps}>Couldn’t refresh blocking settings. {privacyError}</p>
          )}
          <label className="memory-use-toggle">
            <input
              {...nativeCheckboxTypeProps}
              checked={privacy?.trackerBlock ?? false}
              disabled={!!busy || !privacy}
              onChange={() => void toggleTracking()}
            />
            <span>
              Block trackers and ads
              <small>
                {!privacy
                  ? "Load privacy settings to see the current state."
                  : privacy.trackerBlock === false
                    ? "Off. Advertising and tracking domains load on every website."
                    : `Known tracker, ad and telemetry domains can't load on any website${privacy.blocked > 0 ? ` — ${privacy.blocked} request${privacy.blocked === 1 ? "" : "s"} blocked this session` : ""}.`}
              </small>
            </span>
          </label>
          {privacy?.allowedHosts?.length ? (
            <div className="filter-exceptions">
              <strong {...staticHintProps}>Sites where blocking is paused</strong>
              {privacy.allowedHosts.map((host) => (
                <div className="site-permission-row" key={host}>
                  <span>{host}</span>
                  <span {...staticHintProps}>Blocking paused</span>
                  <button
                    {...smallButtonProps}
                    aria-label={`Resume blocking on ${host}`}
                    disabled={!!busy}
                    onClick={() => void removeAllowed(host)}
                  >
                    {busy === `allow-${host}` ? "Resuming…" : "Resume blocking"}
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <FilterListManager />
        </section>
      )}
      <section className="site-data-group" aria-label="Website data">
        <header>
          <strong>Website data</strong>
        </header>
        <p {...staticHintProps}>
          Clear cookies and stored data for an open website. This can sign you out; cookies for related
          subdomains are included.
        </p>
        {chosenPage ? (
          <div className="site-permission-row">
            <select
              aria-label="Website to clear"
              value={chosenPage.pageId}
              disabled={!!busy}
              onChange={(event) => {
                setSiteDataReview("");
                setSelectedPage(event.target.value);
              }}
            >
              {openSites.map((page) => (
                <option key={page.pageId} value={page.pageId}>
                  {new URL(page.url).origin}
                </option>
              ))}
            </select>
            <button
              {...smallButtonProps}
              disabled={!!busy || !currentSiteDataCount}
              onClick={() => {
                setSiteDataError(null);
                setSiteDataReview(siteDataKey);
              }}
            >
              Clear website data…
            </button>
          </div>
        ) : (
          <p {...staticHintProps}>Open a website to manage its stored data.</p>
        )}
        {chosenPage && (
          <output {...staticHintProps} data-block>
            {currentSiteDataCount
              ? `${currentSiteDataCount.cookies} ${currentSiteDataCount.cookies === 1 ? "cookie" : "cookies"} in ${currentSiteDataCount.domain}. Other website storage is not counted.`
              : currentSiteDataError
                ? `Couldn’t count cookies: ${currentSiteDataError}`
                : "Counting website cookies…"}
          </output>
        )}
        {currentSiteDataError && !currentSiteDataCount && (
          <button
            {...smallButtonProps}
            onClick={() => {
              setSiteDataError(null);
              setSiteDataRetry((current) => current + 1);
            }}
          >
            Retry count
          </button>
        )}
        {siteDataReview === siteDataKey && currentSiteDataCount && (
          <div role="group" aria-label="Confirm website data removal">
            <p>
              Remove {currentSiteDataCount.cookies}{" "}
              {currentSiteDataCount.cookies === 1 ? "cookie" : "cookies"} and other stored website data for{" "}
              {currentSiteDataCount.domain}? This can sign you out and cannot be undone.
            </p>
            <button className="btn sm danger" disabled={!!busy} onClick={() => void clearData()}>
              {busy === chosenPage?.pageId ? "Clearing…" : "Clear cookies and storage"}
            </button>
            <button {...smallButtonProps} disabled={!!busy} onClick={() => setSiteDataReview("")}>
              Cancel
            </button>
          </div>
        )}
        {currentSiteDataError && currentSiteDataCount && (
          <p {...nativeAlertRoleProps}>{currentSiteDataError}</p>
        )}
      </section>
      <input
        ref={searchInput}
        aria-label="Search site permissions"
        placeholder="Search websites or permissions"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {loading && <output data-block>Loading site permissions…</output>}
      {error && <p {...nativeAlertRoleProps}>{error}</p>}
      {loadError && (
        <div {...nativeAlertRoleProps}>
          <p>Couldn’t refresh permissions. {loadError}</p>
          <button {...smallButtonProps} disabled={loading || !!busy} onClick={() => void load()}>
            Refresh permissions
          </button>
        </div>
      )}
      {notice && (
        <output {...staticHintProps} data-block>
          {notice}
        </output>
      )}
      {!loading && !loadError && !sites.length && (
        <p {...staticHintProps}>
          {Object.keys(decisions).length
            ? "No matching websites."
            : "No saved website permissions. Websites ask when they need access."}
        </p>
      )}
      {sites.map(([origin, permissions]) => (
        <section className="site-permission-group" key={origin} aria-label={origin}>
          <header>
            <strong>{origin}</strong>
            <button {...smallButtonProps} disabled={!!busy} onClick={() => void reset(origin)}>
              Reset site
            </button>
          </header>
          {Object.entries(permissions).map(([permission, decision]) => (
            <div className="site-permission-row" key={permission}>
              <span>{labels[permission] ?? permission}</span>
              <span {...staticHintProps}>
                {permission === "media" ? "Ask again" : decision === "allow" ? "Allowed" : "Blocked"}
              </span>
              <button
                {...smallButtonProps}
                aria-label={`Reset ${labels[permission] ?? permission} for ${origin}`}
                disabled={!!busy}
                onClick={() => void reset(origin, permission)}
              >
                Reset
              </button>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
