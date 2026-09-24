/** CSS miniatures use Aux's own silhouette and tokens, not stale screenshots. */
export function LayoutChoice({ value, onChange }: { value: string; onChange(value: "horizontal" | "vertical"): void }) {
  return <div className="layout-choice" role="group" aria-label="Tab layout">{(["horizontal", "vertical"] as const).map(layout => <button key={layout} type="button" className={value === layout ? "selected" : ""} aria-pressed={value === layout} onClick={() => onChange(layout)}>
    <span className={`layout-miniature ${layout}`} aria-hidden="true"><span className="mini-controls"><i/><i/><i/></span><span className="mini-tabs"><i/><i/><i/></span><span className="mini-page"><i/><i/><i/></span></span>
    <span>{layout === "horizontal" ? "Horizontal" : "Vertical"}</span>
  </button>)}</div>;
}
