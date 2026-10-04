import { useEffect, useState } from "react";
import { bridge, inNativeHost } from "../bridge";
import { isolatedHtmlDocument } from "../isolated-html";

const PREVIEW_URL = /^aux-result:\/\/preview\/[0-9a-f]{48}$/i;

/** HTML is never mounted in the shell document. Native serves an opaque, network-blocked origin. */
export function IsolatedArtifactHtml({ html }: { html: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!inNativeHost) return;
    let live = true;
    let registered: string | null = null;
    void bridge.createResultPreview(html).then((value) => {
      if (!PREVIEW_URL.test(value)) throw new Error("The isolated preview address was invalid.");
      registered = value;
      if (live) setUrl(value);
      else void bridge.releaseResultPreview(value);
    }).catch((reason) => { if (live) setError(reason instanceof Error ? reason.message : String(reason)); });
    return () => { live = false; if (registered) void bridge.releaseResultPreview(registered); };
  }, [html]);
  if (error) return <p role="alert">{error}</p>;
  if (!inNativeHost) return <iframe title="Inert HTML artifact" sandbox="" referrerPolicy="no-referrer"
    srcDoc={isolatedHtmlDocument(html)} />;
  return url ? <iframe title="Isolated HTML artifact" sandbox="allow-scripts" referrerPolicy="no-referrer" src={url} />
    : <output data-block>Preparing isolated preview…</output>;
}
