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
 * only. Click/wheel/key/IME map through `pages.engineInput` so takeover
 * still types on the same page the agent sees.
 */
export function EngineView({ page }: { page: PageTarget }) {
  const [scene, setScene] = useState<Scene | null>(null);
  const [shot, setShot] = useState<Shot | null>(null);
  const pageRef = useRef(page);
  pageRef.current = page;
  const busy = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  const run = async (input: Record<string, unknown>) => {
    if (busy.current || pageRef.current.controller === "agent") return;
    busy.current = true;
    try {
      await call("pages.engineInput", { pageId: pageRef.current.pageId, ...input });
      await paint();
    } finally {
      busy.current = false;
    }
  };

  const onClick = (e: MouseEvent<HTMLElement>) => {
    if (!metrics) return;
    e.currentTarget.focus();
    const r = e.currentTarget.getBoundingClientRect();
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
    void run({ type: "imePreedit", text: e.data ?? "" }).catch(() => {});
  };

  const onCompositionEnd = (e: CompositionEvent<HTMLElement>) => {
    void run({ type: "ime", text: e.data ?? "" }).catch(() => {});
  };

  const hostProps = {
    className: "engine-view",
    tabIndex: 0,
    "data-transport": scene ? "scene" : "png",
    onClick,
    onWheel,
    onKeyDown,
    onCompositionUpdate,
    onCompositionEnd,
  } as const;

  if (scene) {
    return (
      <canvas
        {...hostProps}
        ref={canvasRef}
        role="img"
        aria-label={page.title || ""}
      />
    );
  }
  if (!shot) return null;
  return (
    <img
      {...hostProps}
      src={shot.dataUrl}
      alt={page.title || ""}
      draggable={false}
    />
  );
}
