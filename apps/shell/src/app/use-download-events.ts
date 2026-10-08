import { useEffect } from "react";
import { bridge, inNativeHost } from "../bridge";
import { useStore, call } from "../store";

export function useDownloadEvents() {
  useEffect(() => {
    const projectedDownloads = new Set<string>();
    const offDownload = bridge.onDownload((d) => {
      useStore.getState().applyDownload(d as never);
      if (!inNativeHost || !d.tabUrl || !d.downloadRoot || !d.path) return;
      const terminal = d.state === "completed" || d.state === "interrupted" || d.state === "cancelled";
      if (!terminal && projectedDownloads.has(d.id)) return;
      projectedDownloads.add(d.id);
      void call("downloads.projectNative", { ...d, tabUrl: d.tabUrl, downloadRoot: d.downloadRoot }).catch(
        (error) => console.warn("Native download receipt projection failed", error),
      );
    });
    const offRemoved = bridge.onDownloadsRemoved(({ ids }) => {
      const removed = new Set(ids);
      useStore.setState((state) => ({ downloads: state.downloads.filter((item) => !removed.has(item.id)) }));
    });
    return () => {
      offDownload();
      offRemoved();
    };
  }, []);
}
