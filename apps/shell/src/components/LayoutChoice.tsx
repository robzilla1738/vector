import { useId } from "react";
import { RadioCard } from "../ui";

/** CSS miniatures use Aux's own silhouette and tokens, not stale screenshots. */
export function LayoutChoice({ value, onChange }: { value: string; onChange(value: "horizontal" | "vertical"): void }) {
  const name = useId();
  return <div className="layout-choice" role="radiogroup" aria-label="Tab layout">{(["horizontal", "vertical"] as const).map(layout => <RadioCard key={layout} name={name} value={layout} checked={value === layout} onChange={() => onChange(layout)}>
    <span className={`layout-miniature ${layout}`} aria-hidden="true"><span className="mini-controls"><i/><i/><i/></span><span className="mini-tabs"><i/><i/><i/></span><span className="mini-page"><i/><i/><i/></span></span>
    <span>{layout === "horizontal" ? "Horizontal" : "Vertical"}</span>
  </RadioCard>)}</div>;
}
