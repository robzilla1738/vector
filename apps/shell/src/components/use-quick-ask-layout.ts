import { useLayoutEffect, type RefObject } from "react";
import { bridge, inNativeHost } from "../bridge";

/** Keep the native draft compact; a submitted conversation gets room for its transcript. */
export function useQuickAskLayout(input: RefObject<HTMLTextAreaElement | null>, chatId: string | null) {
  useLayoutEffect(() => {
    const textarea = input.current;
    const panel = textarea?.closest<HTMLElement>(".quick-ask-panel");
    if (!inNativeHost || bridge.windowKind !== "quick-ask" || !textarea || !panel) return;
    let frame = 0,
      last = "",
      live = true;
    const windowId = bridge.windowId;
    const measure = () => {
      frame = 0;
      if (!live || bridge.windowId !== windowId || bridge.windowKind !== "quick-ask") return;
      const conversation = panel.querySelector(".conversation");
      if (!conversation) return;
      for (const item of panel.querySelectorAll(".composer-context, .composer-footer, .quick-ask-connection"))
        resize.observe(item);
      const expanded = !conversation.hasAttribute("data-empty-transcript");
      let draftHeight = 92;
      if (!expanded) {
        const style = getComputedStyle(textarea);
        const mirror = document.createElement("textarea");
        mirror.value = textarea.value;
        mirror.rows = 1;
        mirror.inert = true;
        mirror.tabIndex = -1;
        mirror.setAttribute("aria-hidden", "true");
        Object.assign(mirror.style, {
          position: "fixed",
          visibility: "hidden",
          pointerEvents: "none",
          boxSizing: "border-box",
          width: `${textarea.clientWidth}px`,
          height: "0",
          minHeight: "0",
          maxHeight: "none",
          font: style.font,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
          padding: style.padding,
          border: "0",
          fieldSizing: "fixed",
        });
        document.body.append(mirror);
        const header = panel.querySelector<HTMLElement>(".quick-ask-header")?.offsetHeight ?? 0;
        const footer = panel.querySelector<HTMLElement>(".composer-footer")?.offsetHeight ?? 36;
        const context = panel.querySelector<HTMLElement>(".composer-context")?.offsetHeight ?? 0;
        const notice = panel.querySelector<HTMLElement>(".quick-ask-connection")?.offsetHeight ?? 0;
        draftHeight = Math.max(
          92,
          Math.min(360, Math.ceil(header + footer + context + notice + mirror.scrollHeight + 12)),
        );
        mirror.remove();
      }
      const key = `${expanded}:${draftHeight}`;
      if (last === key) return;
      last = key;
      void bridge.quickAskLayout({ conversation: expanded, draftHeight }).catch(() => {
        // A retired window has no result surface. Keep the editor usable if native sizing fails.
        if (live) last = "";
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(panel);
    const mutations = new MutationObserver(schedule);
    mutations.observe(panel, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-empty-transcript"],
    });
    textarea.addEventListener("input", schedule);
    schedule();
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
      textarea.removeEventListener("input", schedule);
    };
  }, [input, chatId]);
}
