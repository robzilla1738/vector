import { useCallback, useEffect, useRef, useState, type CompositionEvent, type KeyboardEvent, type MouseEvent, type WheelEvent } from "react";
import type { PageTarget } from "@vector/contracts";
import { call } from "../store";

interface SceneItem {
  kind: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  text?: string;
  size?: number;
  color?: string;
  a?: number;
}

interface Scene {
  kind: string;
  width: number;
  height: number;
  itemCount: number;
  items: SceneItem[];
  scale?: number;
  png?: boolean;
}

interface Shot {
  dataUrl: string;
  width: number;
  height: number;
  scale: number;
}

function paintScene(canvas: HTMLCanvasElement, scene: Scene) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = Math.max(1, Math.round(scene.width || 1));
  canvas.height = Math.max(1, Math.round(scene.height || 1));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const it of scene.items) {
    switch (it.kind) {
      case "rect":
        ctx.fillStyle = it.color ?? "#fff";
        ctx.fillRect(it.x ?? 0, it.y ?? 0, it.w ?? 0, it.h ?? 0);
        break;
      case "text":
        ctx.fillStyle = it.color ?? "#000";
        ctx.font = `${it.size ?? 16}px sans-serif`;
        ctx.fillText(it.text ?? "", it.x ?? 0, it.y ?? 0);
        break;
      case "border":
        ctx.strokeStyle = it.color ?? "#000";
        ctx.strokeRect(it.x ?? 0, it.y ?? 0, it.w ?? 0, it.h ?? 0);
        break;
      case "clip":
        ctx.save();
        ctx.beginPath();
        ctx.rect(it.x ?? 0, it.y ?? 0, it.w ?? 0, it.h ?? 0);
        ctx.clip();
        break;
      case "popClip":
        ctx.restore();
        break;
      case "opacity":
        ctx.save();
        ctx.globalAlpha *= it.a ?? 1;
        break;
      case "popOpacity":
        ctx.restore();
        break;
      default:
        break;
    }
  }
}

/**
 * Finding 1: the stage paints the engine display list. PNG is fallback
 * only. A textarea is the IME/focus host so composition reaches
 * `pages.engineInput` on the same page the agent sees.
 */
export function EngineView({ page }: { page: PageTarget }) {
  const [scene, setScene] = useState<Scene | null>(null);
  const [shot, setShot] = useState<Shot | null>(null);
  const pageRef = useRef(page);
  pageRef.current = page;
  const busy = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const imeRef = useRef<HTMLTextAreaElement | null>(null);

  const paint = useCallback(async () => {
    const id = pageRef.current.pageId;
    try {
      const s = await call<Scene>("pages.scene", { pageId: id });
      if (pageRef.current.pageId !== id) return;
      if (s?.items?.length && s.png === false) {
        setScene(s);
        setShot(null);
        return;
      }
    } catch {
      /* fall through to capture */
    }
    const c = await call<{ dataUrl?: string; width: number; height: number; scale?: number }>("pages.capture", { pageId: id });
    if (pageRef.current.pageId !== id || !c.dataUrl) return;
    setScene(null);
    setShot({ dataUrl: c.dataUrl, width: c.width, height: c.height, scale: c.scale ?? 1 });
  }, []);

  useEffect(() => {
    void paint().catch(() => {});
  }, [paint, page.pageId, page.url, page.documentEpoch, page.lastRevision, page.loading]);

  useEffect(() => {
    if (!scene || !canvasRef.current) return;
    paintScene(canvasRef.current, scene);
  }, [scene]);

  const metrics = scene
    ? { width: scene.width, height: scene.height, scale: scene.scale ?? 1 }
    : shot
      ? { width: shot.width, height: shot.height, scale: shot.scale }
      : null;

  const run = async (input: Record<string, unknown>, refresh = true) => {
    // Gate B/F: a click or key while the agent holds the page must still
    // reach pages.engineInput so onNativeTakeover can stop dispatch.
    if (busy.current) return;
    busy.current = true;
    try {
      await call("pages.engineInput", { pageId: pageRef.current.pageId, ...input });
      if (refresh) await paint();
    } finally {
      busy.current = false;
    }
  };

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box?.width || !box.height) return;
      void run({ type: "resize", width: box.width, height: box.height }, false).catch(() => {});
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [scene, shot]);

  const onClick = (e: MouseEvent<HTMLElement>) => {
    if (!metrics) return;
    imeRef.current?.focus();
    const r = (hostRef.current ?? e.currentTarget).getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const x = ((e.clientX - r.left) / r.width) * metrics.width / metrics.scale;
    const y = ((e.clientY - r.top) / r.height) * metrics.height / metrics.scale;
    void run({ type: "click", x, y }).catch(() => {});
  };

  const onWheel = (e: WheelEvent<HTMLElement>) => {
    e.preventDefault();
    const direction = e.deltaY >= 0 ? "down" : "up";
    const amount = Math.min(800, Math.max(40, Math.abs(e.deltaY)));
    void run({ type: "scroll", direction, amount }).catch(() => {});
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.nativeEvent.isComposing) return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
      e.preventDefault();
      void run({ type: "select", start: 0, end: 1_000_000 }).catch(() => {});
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Shift" || e.key === "Control" || e.key === "Meta" || e.key === "Alt") return;
    e.preventDefault();
    void run({ type: "key", key: e.key }).catch(() => {});
  };

  const onCompositionUpdate = (e: CompositionEvent<HTMLElement>) => {
    void run({ type: "imePreedit", text: e.data ?? "" }, false).catch(() => {});
  };

  const onCompositionEnd = (e: CompositionEvent<HTMLElement>) => {
    if (imeRef.current) imeRef.current.value = "";
    void run({ type: "ime", text: e.data ?? "" }).catch(() => {});
  };

  if (!scene && !shot) return null;

  return (
    <div
      ref={hostRef}
      className="engine-view"
      data-transport={scene ? "scene" : "png"}
      data-testid="engine-view"
      onClick={onClick}
      onWheel={onWheel}
    >
      {scene ? (
        <canvas ref={canvasRef} className="engine-view-scene" role="img" aria-hidden="true" />
      ) : (
        <img className="engine-view-scene" src={shot!.dataUrl} alt="" draggable={false} />
      )}
      <textarea
        ref={imeRef}
        className="engine-view-ime"
        aria-label={page.title || "Page input"}
        data-testid="engine-view-ime"
        tabIndex={0}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onKeyDown={onKeyDown}
        onCompositionUpdate={onCompositionUpdate}
        onCompositionEnd={onCompositionEnd}
      />
    </div>
  );
}
