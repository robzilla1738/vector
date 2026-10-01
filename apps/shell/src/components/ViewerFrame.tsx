import type { ReactNode } from "react";
import { shellIconClose } from "./icons";
import "./ViewerFrame.css";

/** Shared reading surface; callers own result identity, edits and native actions. */
export function ViewerFrame({label, title, metadata, toolbar, onClose, closeLabel, children}: {
  label:string; title:string; metadata?:ReactNode; toolbar?:ReactNode; onClose():void; closeLabel:string; children:ReactNode;
}) {
  return <section className="viewer-frame" aria-label={label}>
    <div className="viewer-heading"><header><div className="viewer-identity"><strong title={title}>{title}</strong>{metadata && <div className="viewer-metadata">{metadata}</div>}</div><button className="icon-btn xs" aria-label={closeLabel} onClick={onClose}>{shellIconClose}</button></header>{toolbar && <div className="viewer-toolbar">{toolbar}</div>}</div>
    <div className="viewer-body">{children}</div>
  </section>;
}
