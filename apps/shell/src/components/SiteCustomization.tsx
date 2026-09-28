import { useEffect, useRef, useState } from "react";
import type { SiteCss, ZapPickResult, ZapRule } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import { siteControlsOpener } from "../site-controls-opener";
import { Dialog } from "../ui";
import { I } from "./icons";
import "./SiteCustomization.css";

function pageOrigin(url: string | null | undefined): string | null {
  try {
    const parsed = new URL(url ?? "");
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.origin : null;
  } catch {
    return null;
  }
}

export function SiteCustomization() {
  const page = useStore((state) => state.pages.find((item) => item.pageId === state.activePageId));
  const setOverlay = useStore((state) => state.setOverlay);
  const origin = pageOrigin(page?.url);
  const pageId = page?.pageId;
  const epoch = page?.documentEpoch;
  const [rules, setRules] = useState<ZapRule[]>([]);
  const [css, setCss] = useState("");
  const [savedCss, setSavedCss] = useState("");
  const [pick, setPick] = useState<Extract<ZapPickResult, { picked: true }> | null>(null);
  const [selector, setSelector] = useState("");
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const opener = useRef<HTMLElement | null>(siteControlsOpener());
  const close = () => setOverlay(null);
  const isCurrent = () => {
    const state = useStore.getState();
    const current = state.pages.find((item) => item.pageId === state.activePageId);
    return (
      state.overlay === "zap" &&
      current?.pageId === pageId &&
      current?.documentEpoch === epoch &&
      pageOrigin(current?.url) === origin
    );
  };
  const refresh = async () => {
    if (!origin) return;
    const [nextRules, nextCss] = await Promise.all([
      call("customization.zap.list", { origin }),
      call("customization.css.get", { origin }),
    ]);
    if (isCurrent()) {
      setRules(nextRules);
      setCss(nextCss.css);
      setSavedCss(nextCss.css);
    }
  };
  useEffect(() => {
    let active = true;
    void bridge.overlay(true);
    if (origin)
      void Promise.all([
        call("customization.zap.list", { origin }),
        call("customization.css.get", { origin }),
      ])
        .then(([nextRules, nextCss]) => {
          if (!active) return;
          setRules(nextRules);
          setCss(nextCss.css);
          setSavedCss(nextCss.css);
        })
        .catch((reason) => {
          if (active) setError(String(reason));
        });
    return () => {
      active = false;
    };
  }, [origin, pageId, epoch]);

  const apply = async () => {
    if (pageId && epoch !== undefined && isCurrent())
      await call("customization.css.apply", { pageId, expectedDocumentEpoch: epoch });
  };
  const startPick = async () => {
    if (!pageId || epoch === undefined || !origin || busy || picking) return;
    setError("");
    setNotice("");
    setPicking(true);
    // Let the modal leave the top layer and the native page become interactive.
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    try {
      await bridge.overlay(false);
      const result = await call("customization.zap.pick", { pageId, expectedDocumentEpoch: epoch });
      if (!isCurrent()) return;
      if (result.picked) {
        setPick(result);
        setSelector(result.candidates[0]!.selector);
      } else if (result.reason) setNotice(result.reason);
    } catch (reason) {
      if (isCurrent()) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      if (isCurrent()) {
        try {
          await bridge.overlay(true);
        } finally {
          setPicking(false);
        }
      }
    }
  };
  const saveRule = async () => {
    if (!pick || !isCurrent() || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await call("customization.zap.add", {
        pageId: pick.pageId,
        expectedDocumentEpoch: pick.documentEpoch,
        origin: pick.origin,
        selector,
      });
      await apply();
      await refresh();
      setPick(null);
      setNotice("Hidden on this site. The rule is saved to this Profile.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  };
  const removeRule = async (ruleId: string) => {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await call("customization.zap.remove", { ruleId });
      await apply();
      await refresh();
      setNotice("Hidden element rule removed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  };
  const saveCss = async () => {
    if (!origin || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const saved: SiteCss = await call("customization.css.set", { origin, css });
      await apply();
      setSavedCss(saved.css);
      setNotice(saved.css ? "Site CSS saved to this Profile." : "Site CSS removed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  };

  if (picking) return <output className="zap-picking">Click an element on the page · Esc cancels</output>;
  return (
    <Dialog
      label="Customize this site"
      onClose={close}
      className="site-customization-card"
      returnFocus={opener}
    >
      <header className="zap-header">
        <div>
          <span className="zap-eyebrow">Page customization</span>
          <h2>{origin ?? "Open a website"}</h2>
        </div>
        <button className="icon-btn" aria-label="Close site customization" onClick={close}>
          {I.close}
        </button>
      </header>
      <div className="zap-content">
        {error && (
          <p className="zap-error" role="alert">
            {error}
          </p>
        )}
        {notice && <output className="zap-notice">{notice}</output>}
        {pick ? (
          <section aria-labelledby="zap-review-title">
            <h3 id="zap-review-title">Review what to hide</h3>
            <p>
              Picked {pick.tag}
              {pick.text ? ` · ${pick.text}` : ""}. Choose the exact element or matching elements before
              saving.
            </p>
            <fieldset className="zap-candidates">
              <legend>Hide scope</legend>
              {pick.candidates.map((candidate) => (
                <label
                  key={candidate.selector}
                  aria-label={`${candidate.matchCount} matches: ${candidate.selector}`}
                >
                  <input
                    type="radio"
                    name="zap-selector"
                    value={candidate.selector}
                    checked={selector === candidate.selector}
                    onChange={() => setSelector(candidate.selector)}
                  />
                  <span>
                    <strong>
                      {candidate.matchCount === 1
                        ? "This element"
                        : `${candidate.matchCount} matching elements`}
                    </strong>
                    <code>{candidate.selector}</code>
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="zap-actions">
              <button className="btn" onClick={() => setPick(null)}>
                Back
              </button>
              <button className="btn primary" disabled={busy} onClick={() => void saveRule()}>
                {busy ? "Saving…" : "Hide selected"}
              </button>
            </div>
          </section>
        ) : (
          <>
            <section aria-labelledby="zap-rules-title">
              <div className="zap-section-heading">
                <div>
                  <h3 id="zap-rules-title">Hidden elements</h3>
                  <p>Rules apply to this website in your current Profile.</p>
                </div>
                <button
                  className="btn sm"
                  disabled={
                    !origin ||
                    !pageId ||
                    epoch === undefined ||
                    busy ||
                    page?.controller === "agent" ||
                    page?.backend === "chrome"
                  }
                  onClick={() => void startPick()}
                >
                  Pick element…
                </button>
              </div>
              {rules.length ? (
                <ul className="zap-rules">
                  {rules.map((rule) => (
                    <li key={rule.ruleId}>
                      <span>
                        <code>{rule.selector}</code>
                        <small>
                          {rule.matchCount === 1
                            ? "1 match when saved"
                            : `${rule.matchCount} matches when saved`}
                        </small>
                      </span>
                      <button
                        className="btn sm"
                        disabled={busy}
                        aria-label={`Remove ${rule.selector}`}
                        onClick={() => void removeRule(rule.ruleId)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="zap-empty">No elements hidden on this site.</p>
              )}
            </section>
            <section aria-labelledby="zap-css-title">
              <h3 id="zap-css-title">Site CSS</h3>
              <p>
                CSS is saved for this website in your current Profile. Changes appear on the open page when
                saved.
              </p>
              <label className="zap-css-label" htmlFor="zap-css-editor">
                Custom CSS
              </label>
              <textarea
                id="zap-css-editor"
                value={css}
                onChange={(event) => setCss(event.target.value)}
                spellCheck={false}
                maxLength={20_000}
                placeholder="/* CSS for this site */"
              />
              <div className="zap-actions">
                <span>{css.length.toLocaleString()} / 20,000</span>
                <button
                  className="btn primary"
                  disabled={!origin || busy || css === savedCss}
                  onClick={() => void saveCss()}
                >
                  {busy ? "Saving…" : "Save CSS"}
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </Dialog>
  );
}
