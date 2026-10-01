import { useSyncExternalStore } from "react";
export type SplitEdge = "left" | "right" | "top" | "bottom";
const listeners = new Set<() => void>();
let state: { dragging: string | null; picker: boolean; edge: SplitEdge | null } = { dragging: null, picker: false, edge: null };
export const getSurfaceState = () => state;
export const subscribeSurfaceState = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function setSurfaceState(patch: Partial<typeof state>) { state = { ...state, ...patch }; for (const listener of listeners) listener(); }
export const useSurfaceState = () => useSyncExternalStore(subscribeSurfaceState, getSurfaceState);
export const useSurfaceCovering = () => { const state = useSurfaceState(); return !!state.dragging || state.picker; };
export const openSplitPicker = () => setSurfaceState({ picker: true });
