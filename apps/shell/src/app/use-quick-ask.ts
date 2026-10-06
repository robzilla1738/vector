import { useEffect, useRef, useState } from "react";
import { bridge } from "../bridge";
import { useStore, errToast } from "../store";
import type { Overlay } from "../store/types";

export function useQuickAsk(overlay: Overlay) {
  const [quickAsk, setQuickAsk] = useState(bridge.windowKind === "quick-ask");
  const quickAskReady = useRef(false);
  const conversationId = useStore((state) => state.conversationId);
  const expandQuickAsk = () => {
    const chatId = useStore.getState().conversationId;
    try {
      if (chatId) localStorage.setItem("aux.quick-ask.expand", chatId);
    } catch {}
    void bridge.quickAsk("expand").catch((error) => {
      try {
        if (localStorage.getItem("aux.quick-ask.expand") === chatId)
          localStorage.removeItem("aux.quick-ask.expand");
      } catch {}
      errToast(error);
    });
  };
  useEffect(() => {
    if (bridge.windowKind !== "normal" || bridge.privateMode) return;
    let chatId: string | null = null;
    try {
      chatId = localStorage.getItem("aux.quick-ask.expand");
      if (chatId) localStorage.removeItem("aux.quick-ask.expand");
    } catch {}
    if (chatId && /^[\w-]{1,128}$/.test(chatId)) useStore.getState().openConversationDraft(chatId);
  }, []);
  useEffect(() => {
    if (bridge.windowKind !== "quick-ask") return;
    void bridge
      .quickAsk("status")
      .then((compact) => {
        setQuickAsk(compact);
        if (!compact) return;
        let saved: string | null = null;
        try {
          saved = localStorage.getItem("aux.quick-ask.chat");
        } catch {}
        quickAskReady.current = true;
        useStore.getState().openConversationDraft(saved || crypto.randomUUID());
      })
      .catch(errToast);
    return bridge.onQuickAskState(setQuickAsk);
  }, []);
  useEffect(() => {
    if (quickAskReady.current && quickAsk && conversationId)
      try {
        localStorage.setItem("aux.quick-ask.chat", conversationId);
      } catch {}
  }, [quickAsk, conversationId]);
  useEffect(() => {
    if (quickAsk && overlay) expandQuickAsk();
  }, [quickAsk, overlay]);
  return { quickAsk, expandQuickAsk };
}
