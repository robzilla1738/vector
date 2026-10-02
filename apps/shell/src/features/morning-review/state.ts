import { create } from "zustand";
import { type MethodResult, type NightShiftItem } from "@aux/contracts";
import { call } from "../../store";
export const useNightReview = create<{ items: NightShiftItem[]; summary: MethodResult<"nightShift.summary"> | null; inboxOpen: boolean; queueOpen: boolean; queueVisited: boolean; busy: boolean; error: string }>(() => ({ items: [], summary: null, inboxOpen: false, queueOpen: false, queueVisited: false, busy: false, error: "" }));
let life = 0;
export const nightReviewGeneration = () => life;
export function bootNightReview() {
  const generation = ++life;
  const refresh = async () => {
    try { const [items, summary] = await Promise.all([call("nightShift.list", {}), call("nightShift.summary", {})]); if (generation === life) useNightReview.setState({ items, summary, error: "" }); }
    catch (error) { if (generation === life) useNightReview.setState({ error: error instanceof Error ? error.message : String(error) }); }
  };
  void refresh(); const timer = window.setInterval(() => void refresh(), 30_000);
  return () => { ++life; window.clearInterval(timer); useNightReview.setState({ items: [], summary: null, inboxOpen: false, queueOpen: false, queueVisited: false, busy: false, error: "" }); };
}
export async function reviewNightItem(id: string, decision: "approve" | "discard" | "apply") {
  if (useNightReview.getState().busy) return;
  const generation = life; useNightReview.setState({ busy: true, error: "" });
  try {
    const item = await call("nightShift.review", { id, decision });
    if (generation === life) useNightReview.setState(state => ({ items: state.items.map(prior => prior.id === id ? item : prior) }));
    return item;
  } catch (error) { if (generation === life) useNightReview.setState({ error: error instanceof Error ? error.message : String(error) }); throw error; }
  finally { if (generation === life) useNightReview.setState({ busy: false }); }
}
export async function queueTonight(input: Parameters<typeof call<"nightShift.queue">>[1]) {
  const generation = life;
  const item = await call("nightShift.queue", input);
  if (generation === life) useNightReview.setState(state => ({ items: [...state.items, item], queueOpen: false })); return item;
}
