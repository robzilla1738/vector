import { useEffect, useState } from "react";
import { bridge } from "../bridge";
import { patchPageFields } from "../store";

export function usePageStatus() {
  const [linkStatus, setLinkStatus] = useState<{ pageId: string; text: string } | null>(null);
  useEffect(() => {
    const offLoading = bridge.onLoading(({ pageId, loading }) => {
      patchPageFields(pageId, { loading });
      if (loading) setLinkStatus((current) => (current?.pageId === pageId ? null : current));
    });
    const offLinkStatus = bridge.onLinkStatus((payload) => setLinkStatus(payload.text ? payload : null));
    return () => {
      offLoading();
      offLinkStatus();
    };
  }, []);
  return linkStatus;
}
