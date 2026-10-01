import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PageTarget, SplitGroup } from "@aux/contracts";
import { paneRects, dividerRatio, springStep, type Box } from "../split-layout";
import { runCommand } from "../commands";
import { useStore } from "../store";
import { hostOf } from "../workspace";
import { PageSurface } from "./PageSurface";
import "./SplitStage.css";

function useSpringRects(targets: Box[], ids: string[], immediate: boolean) {
  const [rects, setRects] = useState(targets);
  const current = useRef(new Map(ids.map((id, index) => [id, targets[index]!] )));
  const velocities = useRef(new Map<string, Box>());
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, last = performance.now();
    const finish = () => {
      cancelAnimationFrame(frame);
      current.current = new Map(ids.map((id, index) => [id, targets[index]!]));
      velocities.current.clear(); setRects(targets);
    };
    const changed = () => { if (reduced.matches) finish(); };
    reduced.addEventListener("change", changed);
    if (immediate || reduced.matches) finish();
    else {
      const animate = (now: number) => {
        let moving = false;
        const next = targets.map((box, index) => {
          const id = ids[index]!;
          const origin = current.current.get(id) ?? { ...box, x: box.x + box.width / 2, y: box.y + box.height / 2, width: 0, height: 0 };
          const value = { ...box }, velocity = velocities.current.get(id) ?? { x: 0, y: 0, width: 0, height: 0 };
          for (const key of ["x", "y", "width", "height"] as const) {
            const step = springStep(origin[key], velocity[key], box[key], (now - last) / 1000);
            value[key] = Math.abs(step.position - box[key]) < .1 && Math.abs(step.velocity) < .1 ? box[key] : step.position;
            velocity[key] = step.velocity; moving ||= value[key] !== box[key];
          }
          current.current.set(id, value); velocities.current.set(id, velocity); return value;
        });
        last = now; setRects(next);
        if (moving) frame = requestAnimationFrame(animate);
        else finish();
      };
      frame = requestAnimationFrame(animate);
    }
    return () => { cancelAnimationFrame(frame); reduced.removeEventListener("change", changed); };
  }, [targets, ids, immediate]);
  return rects;
}

export function SplitStage({ group, pages }: { group: SplitGroup; pages: PageTarget[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box>({ x: 0, y: 0, width: 0, height: 0 });
  const minimal = useStore(state => state.settings.minimalUi === true);
  const [resizing, setResizing] = useState(false);
  const resize = useCallback((divider: number, ratio: number, persist = true) => runCommand("split-resize", { payload: { pageId: group.focused, divider, ratio, persist } }), [group.focused]);
  const drag = useRef<{ pointer: number; index: number; ratio: number } | null>(null);
  const cancelDrag = useCallback(() => {
    const start = drag.current; drag.current = null; setResizing(false);
    if (start && useStore.getState().layout.splitGroups?.some(item => item.id === group.id)) resize(start.index, start.ratio);
  }, [group.id, resize]);
  useEffect(() => {
    window.addEventListener("blur", cancelDrag);
    return () => { window.removeEventListener("blur", cancelDrag); cancelDrag(); };
  }, [cancelDrag]);
  useEffect(() => {
    const element = root.current; if (!element) return;
    const update = () => setBox({ x: 0, y: 0, width: element.clientWidth, height: element.clientHeight });
    const observer = new ResizeObserver(update); observer.observe(element); update(); return () => observer.disconnect();
  }, []);
  const geometry = useMemo(() => paneRects(box, group, minimal ? 0 : 8), [box, group, minimal]);
  const targets = useMemo(() => [...geometry.panes, ...geometry.dividers], [geometry]);
  const ids = useMemo(() => [...group.panes, ...geometry.dividers.map(divider => `${group.id}:divider:${divider.index}`)], [group.id, group.panes, geometry.dividers]);
  const rects = useSpringRects(targets, ids, resizing);
  return <div className="split-stage" role="region" ref={root} aria-label={`${group.panes.length} split panes`}>
    {group.panes.map((id, index) => {
      const page = pages.find(page => page.pageId === id)!;
      const rect = rects[index] ?? geometry.panes[index]!;
      return <section key={id} className={`split-pane ${group.focused === id ? "focused" : ""}`} style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }} aria-label={`Split pane: ${page.title}`}>
        <header className="split-pane-header"><span>{hostOf(page.url)}</span>
          <button className="icon-btn xs" data-command-id="split-swap" aria-label="Swap split sides" onClick={() => runCommand("split-swap", { payload: { pageId: id } })}>⇄</button>
          <button className="icon-btn xs" data-command-id="split-close" aria-label={`Close split pane: ${page.title}`} onClick={() => runCommand("split-close", { payload: { pageId: id } })}>×</button>
        </header><div className="split-pane-page"><PageSurface page={page} /></div>
      </section>;
    })}
    {geometry.dividers.map((divider, index) => {
      const rect = rects[group.panes.length + index] ?? divider;
      return <hr key={divider.index} className={`fluid-split-divider ${divider.axis}`} role="separator" tabIndex={0}
      aria-label={`Resize split divider ${divider.index + 1}`} aria-orientation={divider.axis === "x" ? "vertical" : "horizontal"}
      aria-valuemin={10} aria-valuemax={90} aria-valuenow={Math.round(divider.ratio * 100)}
      style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
      onPointerDown={event => { if (event.button !== 0) return; event.preventDefault(); event.currentTarget.focus(); setResizing(true); drag.current = { pointer: event.pointerId, index: divider.index, ratio: group.ratios[divider.index] ?? .5 }; event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={event => { if (drag.current?.pointer !== event.pointerId) return; const bounds = root.current!.getBoundingClientRect(); resize(divider.index, dividerRatio(divider, divider.axis === "x" ? event.clientX - bounds.left : event.clientY - bounds.top), false); }}
      onPointerUp={event => {
        if (drag.current?.pointer !== event.pointerId) return;
        drag.current = null; setResizing(false);
        const ratio = useStore.getState().layout.splitGroups?.find(item => item.id === group.id)?.ratios[divider.index];
        if (ratio !== undefined) resize(divider.index, ratio);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={cancelDrag} onLostPointerCapture={cancelDrag}
      onDoubleClick={() => { resize(divider.index, .5); }}
      onKeyDown={event => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Escape" && drag.current) { event.preventDefault(); cancelDrag(); return; }
        const negative = divider.axis === "x" ? "ArrowLeft" : "ArrowUp", positive = divider.axis === "x" ? "ArrowRight" : "ArrowDown";
        const step = event.shiftKey ? .1 : .02;
        const ratio = event.key === negative ? divider.ratio - step : event.key === positive ? divider.ratio + step : event.key === "Enter" ? .5 : null;
        if (ratio === null) return; event.preventDefault(); event.stopPropagation(); resize(divider.index, ratio);
      }} />;
    })}
  </div>;
}
