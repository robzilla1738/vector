export type LittlePanel = "spaces" | "downloads" | null;
let panel: LittlePanel = null;
const listeners = new Set<() => void>();
export const littlePanel = () => panel;
export function toggleLittlePanel(next: Exclude<LittlePanel, null>) {
  panel = panel === next ? null : next;
  for (const listener of listeners) listener();
}
export const observeLittlePanel = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
