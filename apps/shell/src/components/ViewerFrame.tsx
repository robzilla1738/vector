import type { ReactNode } from "react";
import { shellIconClose } from "./icons";
import "./ViewerFrame.css";
import { staticExtraSmallIconButtonProps as auxClassExtraSmallIconButtonProps } from "../ui/class-props";

/** Shared reading surface; callers own result identity, edits and native actions. */
export function ViewerFrame({
  label,
  title,
  metadata,
  toolbar,
  onClose,
  closeLabel,
  closeControl,
  children,
}: {
  label: string;
  title: string;
  metadata?: ReactNode;
  toolbar?: ReactNode;
  onClose(): void;
  closeLabel: string;
  closeControl?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="viewer-frame" aria-label={label}>
      <div className="viewer-heading">
        <header>
          <div className="viewer-identity">
            <strong title={title}>{title}</strong>
            {metadata && <div className="viewer-metadata">{metadata}</div>}
          </div>
          {closeControl ?? (
            <button {...auxClassExtraSmallIconButtonProps} aria-label={closeLabel} onClick={onClose}>
              {shellIconClose}
            </button>
          )}
        </header>
        {toolbar && <div className="viewer-toolbar">{toolbar}</div>}
      </div>
      <div className="viewer-body">{children}</div>
    </section>
  );
}
