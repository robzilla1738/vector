import { useEffect, useState } from "react";
import type { PageTarget } from "@aux/contracts";
import { bridge, hostKind } from "../bridge";
import { MockPage } from "./surfaces";
import "./PageSurface.css";

type SurfaceState = {
  pageId: string;
  documentEpoch: number;
  contentId: string | null;
  error: string | null;
};

/** A browser page is embedded only in Aux's trusted WebUI. The browser process
 * resolves the opaque content ID after checking Profile and window ownership. */
export function PageSurface({ page }: { page: PageTarget }) {
  const [state, setState] = useState<SurfaceState | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (hostKind !== "chromium") return;
    let current = true;
    setState(null);
    void bridge
      .surfaceContentId(page.pageId)
      .then((contentId) => {
        if (current)
          setState({ pageId: page.pageId, documentEpoch: page.documentEpoch, contentId, error: null });
      })
      .catch((reason) => {
        if (current)
          setState({
            pageId: page.pageId,
            documentEpoch: page.documentEpoch,
            contentId: null,
            error: reason instanceof Error ? reason.message : String(reason),
          });
      });
    return () => {
      current = false;
    };
  }, [page.pageId, page.documentEpoch, attempt]);

  if (hostKind === "mock")
    return (
      <div className="page-surface mock">
        <MockPage page={page} />
      </div>
    );
  if (hostKind !== "chromium") return null;

  const resolved = state?.pageId === page.pageId && state.documentEpoch === page.documentEpoch ? state : null;
  if (resolved?.contentId)
    return (
      <embed
        className="page-surface webium"
        type="application/x-chromium-surface-embed"
        data-content-id={resolved.contentId}
        aria-label={page.title || "Browser page"}
      />
    );

  return (
    <div className="page-surface-status" role="status" aria-live="polite">
      {resolved ? (
        <>
          <p>
            {resolved.error
              ? "This page could not be attached."
              : "This page is not available in this window."}
          </p>
          <button type="button" className="btn" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </button>
        </>
      ) : (
        <p>Opening page…</p>
      )}
    </div>
  );
}
