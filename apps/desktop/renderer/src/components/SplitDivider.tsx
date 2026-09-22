import type { PageTarget } from "@aux/contracts";
import { MockPage } from "./MockPage";
import { useEffect, useRef, useState } from "react";
import { splitWidths } from "@aux/contracts/split-layout";
import { useStore } from "../store";

/** The native pages leave this gutter uncovered, so resizing belongs to the shell. */
export function SplitDivider({preview}: {preview?: [PageTarget, PageTarget]}) {
  const divider = useRef<HTMLDivElement>(null);
  const drag = useRef<{pointerId:number;ratio:number} | null>(null);
  const [width, setWidth] = useState(0);
  const ratio = useStore(state => state.layout.splitRatio ?? .5);
  useEffect(() => {
    const parent = divider.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(() => setWidth(parent.clientWidth));
    observer.observe(parent); setWidth(parent.clientWidth);
    return () => observer.disconnect();
  }, []);
  const geometry = splitWidths(width, ratio);
  const percentage = geometry.left + geometry.right > 0 ? Math.round(geometry.left / (geometry.left + geometry.right) * 100) : 50;
  const setRatio = useStore.getState().setSplitRatio;
  function finish(cancel = false) {
    const current = drag.current;
    if (!current) return;
    drag.current = null;
    setRatio(cancel ? current.ratio : useStore.getState().layout.splitRatio ?? .5);
    if (divider.current?.hasPointerCapture(current.pointerId)) divider.current.releasePointerCapture(current.pointerId);
  }
  return <>
    {preview && <>
      <div className="split-preview-page" style={{left:0,width:geometry.left}}><MockPage page={preview[0]} /></div>
      <div className="split-preview-page" style={{left:geometry.left+geometry.gutter,width:geometry.right}}><MockPage page={preview[1]} /></div>
    </>}
    <div ref={divider} className="split-divider" role="separator" tabIndex={0}
    aria-label="Resize split view" aria-orientation="vertical" aria-valuemin={25} aria-valuemax={75}
    aria-valuenow={percentage} aria-valuetext={`${percentage} percent for the left page`}
    title="Drag to resize · arrow keys adjust · double-click resets"
    style={{left:geometry.left,width:geometry.gutter}}
    onPointerDown={event => {
      if (event.button !== 0) return;
      event.preventDefault(); event.currentTarget.focus();
      drag.current = {pointerId:event.pointerId,ratio};
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
    onPointerMove={event => {
      if (drag.current?.pointerId !== event.pointerId) return;
      const bounds = event.currentTarget.parentElement!.getBoundingClientRect();
      const available = bounds.width - geometry.gutter;
      if (available > 0) setRatio((event.clientX - bounds.left - geometry.gutter / 2) / available, false);
    }}
    onPointerUp={() => finish()} onPointerCancel={() => finish(true)} onLostPointerCapture={() => finish()}
    onDoubleClick={() => setRatio(.5)}
    onKeyDown={event => {
      if (event.nativeEvent.isComposing) return;
      const step = event.shiftKey ? .1 : .02;
      const value = event.key === "ArrowLeft" ? ratio - step : event.key === "ArrowRight" ? ratio + step
        : event.key === "Home" ? .25 : event.key === "End" ? .75 : event.key === "Enter" ? .5 : null;
      if (value !== null) { event.preventDefault(); event.stopPropagation(); setRatio(value); }
      else if (event.key === "Escape" && drag.current) { event.preventDefault(); event.stopPropagation(); finish(true); }
    }}><span /></div></>;
}
