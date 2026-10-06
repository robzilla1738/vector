import { useEffect } from "react";
import { bridge } from "../bridge";
import { useStore } from "../store";

export function useTabAudio() {
  useEffect(() => {
    let audioLive = true;
    const changedAudio = new Set<string>();
    const offAudio = bridge.onAudio(({ pageId, removed, ...state }) => {
      changedAudio.add(pageId);
      useStore.setState((current) => {
        const tabAudio = { ...current.tabAudio };
        if (removed) delete tabAudio[pageId];
        else tabAudio[pageId] = state;
        return { tabAudio };
      });
    });
    void bridge
      .tabAudio()
      .then((snapshot) => {
        if (audioLive)
          useStore.setState((current) => ({
            tabAudio: {
              ...Object.fromEntries(Object.entries(snapshot).filter(([id]) => !changedAudio.has(id))),
              ...Object.fromEntries(Object.entries(current.tabAudio).filter(([id]) => changedAudio.has(id))),
            },
          }));
      })
      .catch(() => {});
    return () => {
      audioLive = false;
      offAudio();
    };
  }, []);
}
