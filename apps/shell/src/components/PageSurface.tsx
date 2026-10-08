import { errorMessage } from "../error-message";
import { isLocal } from "../tab-window-transfer";
import { useEffect, useState } from "react";
import type { PageTarget } from "@aux/contracts";
import { bridge, inMock, inNativeHost } from "../bridge";
import { MockPage } from "./surfaces";
import "./PageSurface.css";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";
import { staticButtonProps as auxClassButtonProps } from "../ui/class-props";
import { nativeStatusRoleProps, nativePoliteLiveProps } from "../ui/native-attribute-props";

type SurfaceState = {
  pageId: string;
  windowId: string;
  contentId: string | null;
  error: string | null;
};

/** A browser page is embedded only in Aux's trusted WebUI. The browser process
 * resolves the opaque content ID after checking Profile and window ownership. */
export function PageSurface({ page }: { page: PageTarget }) {
  const [state, setState] = useState<SurfaceState | null>(null);
  const [attempt, setAttempt] = useState(0);
  const windowId = page.windowId ?? "main";
  const local = isLocal(page) && page.viewStatus !== "crashed";

  // The native handle belongs to WebContents; navigation rebinds its document
  // internally without destroying the embedding connector.
  useEffect(() => {
    if (!inNativeHost || !local) {
      setState(null);
      return;
    }
    let current = true;
    setState(null);
    void bridge
      .surfaceContentId(page.pageId)
      .then((contentId) => {
        if (current) setState({ pageId: page.pageId, windowId, contentId, error: null });
      })
      .catch((reason) => {
        if (current)
          setState({
            pageId: page.pageId,
            windowId,
            contentId: null,
            error: errorMessage(reason),
          });
      });
    return () => {
      current = false;
    };
  }, [page.pageId, windowId, local, attempt]);

  if (inMock && MockPage)
    return (
      <div className="page-surface mock">
        <MockPage page={page} />
      </div>
    );
  if (!inNativeHost || !local) return null;

  const resolved = state?.pageId === page.pageId && state.windowId === windowId ? state : null;
  if (resolved?.contentId)
    return (
      <embed
        key={resolved.contentId}
        className="page-surface webium"
        type="application/x-chromium-surface-embed"
        data-content-id={resolved.contentId}
        data-page-id={page.pageId}
        data-document-epoch={page.documentEpoch}
        aria-label={page.title || "Browser page"}
      />
    );

  return (
    <div className="page-surface-status" {...nativeStatusRoleProps} {...nativePoliteLiveProps}>
      {resolved ? (
        <>
          <p>
            {resolved.error
              ? "This page could not be attached."
              : "This page is not available in this window."}
          </p>
          <button
            {...auxNativeButtonTypeProps}
            {...auxClassButtonProps}
            onClick={() => setAttempt((value) => value + 1)}
          >
            Try again
          </button>
        </>
      ) : (
        <p>Opening page…</p>
      )}
    </div>
  );
}
