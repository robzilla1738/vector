/** Decorative material only; its parent retains layout, semantics and focus. */
export function GlassMaterial({
  alpha = false,
  inset = false,
  noTopGlow = false,
  tinted = false,
}: {
  alpha?: boolean;
  inset?: boolean;
  noTopGlow?: boolean;
  tinted?: boolean;
}) {
  const layer = (name: string) => <span key={name} className={`glass-layer ${name}`} />;
  return (
    <span
      aria-hidden="true"
      className={`glass-material${alpha ? " _alpha" : ""}${inset ? " _inset" : ""}${noTopGlow ? " _noTopGlow" : ""}${tinted ? " glass-tinted" : ""}`}
    >
      {layer("glass-light-backdrop")}
      {layer("glass-dark-backdrop")}
      {layer("glass-light-shadow")}
      {layer("glass-dark-shadow")}
      {layer("glass-linear-burn glass-light-burn-shadow")}
      {layer("glass-linear-burn glass-dark-burn-shadow")}
      {tinted && layer("glass-linear-burn glass-tinted-burn-shadow")}
      {layer("glass-normal-black-fill")}
      {layer("glass-normal-white-fill")}
      {layer("glass-linear-dodge-fill")}
      {layer("glass-luminosity-fill")}
      {layer("glass-overlay-fill")}
      {layer("glass-dark-fill")}
      {layer("glass-light-inset-fill")}
      {layer("glass-dark-inset-fill")}
      {layer("glass-light-glass-fill")}
      {layer("glass-white-backing")}
      <span className="glass-layer glass-tint-stack">
        {layer("glass-tint-white-fill")}
        {layer("glass-tint-saturation-fill")}
        {layer("glass-tint-overlay-fill")}
        {layer("glass-tint-color")}
      </span>
      {layer("glass-solid-glass-fill")}
      {layer("glass-stroke glass-light-stroke")}
      {layer("glass-stroke glass-dark-stroke")}
      {layer("glass-linear-burn glass-light-inner-glow")}
      {layer("glass-linear-burn glass-dark-inner-glow")}
      {layer("glass-linear-dodge glass-light-inner-shade")}
      {layer("glass-linear-dodge glass-dark-inner-shade")}
      {layer("glass-light-inner-edge")}
      {layer("glass-state-layer glass-light-state")}
      {layer("glass-state-layer glass-dark-state")}
    </span>
  );
}
