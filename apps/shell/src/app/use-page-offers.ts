import { useEffect } from "react";
import { bridge } from "../bridge";
import { useStore } from "../store";

export function usePageOffers() {
  useEffect(() => {
    const offVault = bridge.onVaultOffer((offer) => useStore.getState().setVaultOffer(offer));
    const offTranslation = bridge.onTranslationChanged((payload) => {
      const s = useStore.getState();
      if (payload.pending) {
        s.setTranslationPending(payload.pageId);
        return;
      }
      if (s.translationPending === payload.pageId) s.setTranslationPending(null);
      if (payload.error) {
        s.toast(payload.error, "error");
        return;
      }
      s.setTranslation(
        payload.lang
          ? {
              pageId: payload.pageId,
              lang: payload.lang,
              count: payload.count ?? 0,
              truncated: !!payload.truncated,
            }
          : null,
      );
    });
    return () => {
      offVault();
      offTranslation();
    };
  }, []);
}
