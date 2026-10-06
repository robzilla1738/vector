import { staticSmallIconButtonProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useRef, useState } from "react";
import {
  InlineAssistTextSchema,
  readSelectionCaptureSettings,
  type InlineAssistCapture,
} from "@aux/contracts";
import { call, toast, useStore } from "../store";
import { shellIconAgentSm, shellIconClose } from "../ui/icons";
import { bridge } from "../bridge";
import "./inline-assist.css";
import { staticSpacerProps as auxClassSpacerProps } from "../ui/class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

/** In-flow editor; the browser page remains visible while a person reviews the draft. */
export function InlineAssist() {
  const enabled =
    useStore((s) => readSelectionCaptureSettings(s.settings.selectionCapture).inlineAssist) &&
    !bridge.privateMode;
  const activePage = useStore((s) => s.pages.byId[s.activePageId ?? ""]);
  const setOverlay = useStore((s) => s.setOverlay);
  const initial = useRef(
    activePage
      ? {
          pageId: activePage.pageId,
          url: activePage.url,
          documentEpoch: activePage.documentEpoch,
          windowId: activePage.windowId,
        }
      : null,
  );
  const [capture, setCapture] = useState<InlineAssistCapture | null>(null);
  const captureId = useRef<string | null>(null);
  const generation = useRef(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"draft" | "apply" | null>(null);
  const [instruction, setInstruction] = useState("Improve clarity and tone without changing the meaning.");
  const [replacement, setReplacement] = useState("");
  const [drafted, setDrafted] = useState(false);
  const [error, setError] = useState("");
  const stale =
    !!capture &&
    (!activePage ||
      activePage.pageId !== capture.pageId ||
      activePage.url !== capture.url ||
      activePage.documentEpoch !== capture.documentEpoch ||
      activePage.windowId !== bridge.windowId);

  useEffect(() => {
    generation.current++;
    setBusy(null);
    setDrafted(false);
    setReplacement("");
    if (!enabled) {
      setCapture(null);
      setDrafted(false);
      setReplacement("");
      setLoading(false);
      setError("Inline assist is off or unavailable in this window. Review Selection & Capture settings.");
      return;
    }
    setLoading(true);
    setError("");
    const page = initial.current;
    if (page && page.windowId !== bridge.windowId) {
      setError("This field belongs to another window. Select a field in this window.");
      setLoading(false);
      return;
    }
    if (!page) {
      setError("Select a web page and focus a text field before opening Assist writing.");
      setLoading(false);
      return;
    }
    let live = true;
    void call("agent.inlineAssist.capture", {
      pageId: page.pageId,
      expectedUrl: page.url,
      expectedDocumentEpoch: page.documentEpoch,
    })
      .then((result) => {
        if (!live) {
          void call("agent.inlineAssist.cancel", { captureId: result.captureId }).catch(() => {});
          return;
        }
        captureId.current = result.captureId;
        setCapture(result);
      })
      .catch((reason) => {
        if (live) setError(errorMessage(reason));
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
      generation.current++;
      if (captureId.current)
        void call("agent.inlineAssist.cancel", { captureId: captureId.current }).catch(() => {});
      captureId.current = null;
    };
  }, [enabled]);

  function close() {
    setOverlay(null);
  }
  async function draft() {
    if (!enabled || !capture || stale || busy) return;
    const attempt = generation.current;
    setBusy("draft");
    setError("");
    setDrafted(false);
    try {
      const result = await call("agent.inlineAssist.draft", { captureId: capture.captureId, instruction });
      if (generation.current === attempt) {
        setReplacement(result.replacement);
        setDrafted(true);
      }
    } catch (reason) {
      if (generation.current === attempt) setError(errorMessage(reason));
    } finally {
      if (generation.current === attempt) setBusy(null);
    }
  }
  async function apply() {
    if (!enabled || !capture || !drafted || stale || busy) return;
    setBusy("apply");
    setError("");
    try {
      await call("agent.inlineAssist.apply", { captureId: capture.captureId, replacement });
      toast("Text applied. Use Undo in the page to revert it.");
      close();
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="shelf slide-up inline-assist" aria-label="Assist writing">
      <div className="shelf-head">
        <span>{shellIconAgentSm} Assist writing</span>
        <span {...auxClassSpacerProps} />
        <button {...staticSmallIconButtonProps} aria-label="Close Assist writing" onClick={close}>
          {shellIconClose}
        </button>
      </div>
      <div className="inline-assist-body">
        {loading ? (
          <output>Reading the focused field…</output>
        ) : capture ? (
          <>
            <p className="inline-assist-context">
              {capture.fieldLabel} · {capture.origin} ·{" "}
              {capture.mode === "selection" ? "Replace selection" : "Replace field text"}
            </p>
            <p className="inline-assist-disclosure">
              Drafting sends this field’s text, your instruction, and the site domain to your model provider.
              The page changes only when you select Apply.
            </p>
            <div className="inline-assist-preview">
              <strong>Current text</strong>
              <p>{capture.sourceText || "(empty field)"}</p>
            </div>
            <label className="inline-assist-label">
              What should Aux change?
              <textarea
                value={instruction}
                maxLength={1000}
                disabled={busy !== null || stale}
                onChange={(event) => setInstruction(event.target.value)}
              />
            </label>
            {drafted && (
              <label className="inline-assist-label">
                Review and edit the draft
                <textarea
                  aria-label="Proposed field text"
                  value={replacement}
                  maxLength={Math.min(12_000, capture.maxReplacementLength ?? 12_000)}
                  disabled={busy !== null || stale}
                  onChange={(event) => setReplacement(event.target.value)}
                />
              </label>
            )}
            {stale && <p {...nativeAlertRoleProps}>The page changed. Select the field and start again.</p>}
            {error && <p {...nativeAlertRoleProps}>{error}</p>}
            <div className="inline-assist-actions">
              <button
                {...smallButtonProps}
                disabled={busy !== null || stale || instruction.trim().length < 2}
                onClick={() => void draft()}
              >
                {busy === "draft" ? "Drafting…" : drafted ? "Redraft" : "Draft with AI"}
              </button>
              {drafted && (
                <button
                  className="btn sm primary"
                  disabled={
                    busy !== null ||
                    stale ||
                    !InlineAssistTextSchema.safeParse(replacement).success ||
                    replacement.length > (capture.maxReplacementLength ?? 12_000)
                  }
                  onClick={() => void apply()}
                >
                  {busy === "apply" ? "Applying…" : "Apply to field"}
                </button>
              )}
              <button {...smallGhostButtonProps} onClick={close}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p {...nativeAlertRoleProps}>{error || "No editable field was found."}</p>
            <button {...smallButtonProps} onClick={close}>
              Close
            </button>
          </>
        )}
      </div>
    </section>
  );
}
