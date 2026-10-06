import { errorMessage } from "../error-message";
import { useState } from "react";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { shellIconGlobe } from "./icons";
import { Button } from "../ui";

/** Chrome-style bar shown while a page is translated in place. */
export function TranslationBar({ pageId }: { pageId: string }) {
  const translation = useStore((s) => (s.translation?.pageId === pageId ? s.translation : null));
  const pending = useStore((s) => s.translationPending === pageId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (pending && !translation) {
    return (
      <output className="translation-bar">
        <span className="translation-bar-icon">{shellIconGlobe}</span>
        <span className="translation-bar-copy">
          Translating page…<small>Page text was sent to your configured model provider.</small>
        </span>
      </output>
    );
  }
  if (!translation) return null;
  const restore = async () => {
    setBusy(true);
    setError("");
    try {
      await bridge.showOriginal(pageId);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  };
  return (
    <output className="translation-bar">
      <span className="translation-bar-icon">{shellIconGlobe}</span>
      <span className="translation-bar-copy">
        Page translated from <b>{translation.lang}</b>
        {translation.truncated ? " (part of the page)" : ""}
        <small>Page text was sent to your configured model provider.</small>
      </span>
      {error && <span className="translation-bar-error">{error}</span>}
      <Button size="small" disabled={busy} onClick={() => void restore()}>
        {busy ? "Restoring…" : "Show original"}
      </Button>
    </output>
  );
}
