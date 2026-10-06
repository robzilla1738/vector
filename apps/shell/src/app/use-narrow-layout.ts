import { useEffect } from "react";
import { useStore } from "../store";

export function useNarrowLayout() {
  // narrow windows: the sidebar folds to its thin rail while the agent rail is open
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1100px)");
    const apply = () => useStore.getState().setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
}
