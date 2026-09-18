import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type WheelEvent } from "react";
import type { PageTarget } from "@vector/contracts";
import { call } from "../store";

interface Shot {
  dataUrl: string;
  width: number;
  height: number;
  scale: number;
}

/**
 * Vector Engine has no WebContentsView. The stage paints a software screenshot
 * of the same document the agent sees, and maps click/wheel through
 * `pages.engineInput` so takeover still types.
 */
export function EngineView({ page }: { page: PageTarget }) {
  const [shot, setShot] = useState<Shot | null>(null);
  const pageRef = useRef(page);
  pageRef.current = page;
  const busy = useRef(false);

  const paint = useCallback(async () => {
    const id = pageRef.current.pageId;
    const c = await call<{ dataUrl?: string; width: number; height: number; scale?: number }>("pages.capture", { pageId: id });
    if (pageRef.current.pageId !== id || !c.dataUrl) return;
    setShot({ dataUrl: c.dataUrl, width: c.width, height: c.height, scale: c.scale ?? 1 });
  }, []);

  useEffect(() => {
    void paint().catch(() => {});
  }, [paint, page.pageId, page.url, page.documentEpoch, page.lastRevision, page.loading]);

  const run = async (input: {
    type: "click" | "scroll" | "key";
    x?: number;
    y?: number;
    direction?: "up" | "down";
    amount?: number;
    key?: string;
  }) => {
    if (busy.current || pageRef.current.controller === "agent") return;
    busy.current = true;
    try {
      await call("pages.engineInput", { pageId: pageRef.current.pageId, ...input });
      await paint();
    } finally {
      busy.current = false;
    }
  };

  const onClick = (e: MouseEvent<HTMLImageElement>) => {
    if (!shot) return;
    e.currentTarget.focus();
    const r = e.currentTarget.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const x = ((e.clientX - r.left) / r.width) * shot.width / shot.scale;
    const y = ((e.clientY - r.top) / r.height) * shot.height / shot.scale;
    void run({ type: "click", x, y }).catch(() => {});
  };

  const onWheel = (e: WheelEvent<HTMLImageElement>) => {
    e.preventDefault();
    const direction = e.deltaY >= 0 ? "down" : "up";
    const amount = Math.min(800, Math.max(40, Math.abs(e.deltaY)));
    void run({ type: "scroll", direction, amount }).catch(() => {});
  };

  const onKeyDown = (e: KeyboardEvent<HTMLImageElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Shift" || e.key === "Control" || e.key === "Meta" || e.key === "Alt") return;
    e.preventDefault();
    void run({ type: "key", key: e.key }).catch(() => {});
  };

  if (!shot) return null;
  return (
    <img
      className="engine-view"
      src={shot.dataUrl}
      alt={page.title || ""}
      tabIndex={0}
      draggable={false}
      onClick={onClick}
      onWheel={onWheel}
      onKeyDown={onKeyDown}
    />
  );
}
