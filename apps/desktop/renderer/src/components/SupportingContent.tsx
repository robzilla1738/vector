import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { requestStageReport } from "../stage-obstruction";
import { useDismissable } from "../use-dismissable";
import { DetailPane } from "./ui";
import { I } from "./icons";
import "./SupportingContent.css";

/** One supporting-content slot. The transcript and composer never remount. */
export function SupportingContent({ container, title, children, onClose, initiallyExpanded = false }: {
  container: RefObject<HTMLElement | null>; title: string; children: ReactNode; onClose(): void; initiallyExpanded?: boolean;
}) {
  const [wide, setWide] = useState(false);
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [width, setWidth] = useState(320);
  const dialog = useRef<HTMLDialogElement>(null);
  const overlay = !wide && expanded;
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const update = () => setWide(element.clientWidth >= 960);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [container]);
  useDismissable(overlay, () => setExpanded(false));
  useEffect(() => {
    if (!overlay || !dialog.current) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = dialog.current;
    node.showModal();
    requestStageReport();
    return () => { node.close(); previous?.focus(); requestAnimationFrame(requestStageReport); };
  }, [overlay]);
  const pane = <DetailPane title={title} onClose={overlay ? () => setExpanded(false) : onClose}>{children}</DetailPane>;
  if (!wide) return <>
    <button type="button" className="supporting-chip" onClick={() => setExpanded(true)} aria-haspopup="dialog">{I.result}<span>{title}</span>{I.open}</button>
    {overlay && createPortal(<dialog ref={dialog} className="supporting-dialog ctx-menu" aria-label={title} onCancel={event => { event.preventDefault(); setExpanded(false); }} onClick={event => { if (event.target === event.currentTarget) setExpanded(false); }}>{pane}</dialog>, document.body)}
  </>;
  return <aside className="supporting-content" style={{ width }}>
    <div className="supporting-resize" role="separator" tabIndex={0} aria-label="Supporting content width" aria-orientation="vertical" aria-valuemin={280} aria-valuemax={440} aria-valuenow={width} title="Drag to resize · double-click resets" onDoubleClick={() => setWidth(320)} onKeyDown={event => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); setWidth(value => Math.max(280, Math.min(440, value + (event.key === "ArrowLeft" ? 16 : -16)))); }
      if (event.key === "Home") { event.preventDefault(); setWidth(320); }
    }} onPointerDown={event => { event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={event => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
      const edge = event.currentTarget.parentElement!.getBoundingClientRect().right;
      setWidth(Math.max(280, Math.min(440, edge - event.clientX)));
    }} onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}/>
    {pane}
  </aside>;
}
