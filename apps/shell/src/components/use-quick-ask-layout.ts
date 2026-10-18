import { useLayoutEffect, type RefObject } from "react";
import { bridge, inNativeHost } from "../bridge";
import { onStageReport } from "../stage-obstruction";
import { ownedDialogs } from "../ui/modal-stack";

/** Follow actual controls from this composer; unrelated global dialogs never resize it. */
function composerDialogs(panel: HTMLElement): Set<HTMLDialogElement> {
  const roots: HTMLElement[] = [panel];
  const dialogs = new Set<HTMLDialogElement>();
  for (const root of roots) {
    for (const trigger of root.querySelectorAll('[aria-expanded="true"][aria-controls]')) {
      for (const id of trigger.getAttribute("aria-controls")!.split(/\s+/)) {
        const dialog = document.getElementById(id);
        if (
          dialog instanceof HTMLDialogElement &&
          dialog.open &&
          dialog.isConnected &&
          ownedDialogs.has(dialog) &&
          !dialogs.has(dialog)
        ) {
          dialogs.add(dialog);
          roots.push(dialog);
        }
      }
    }
  }
  return dialogs;
}

/** Keep the native draft compact; a submitted conversation gets room for its transcript. */
export function useQuickAskLayout(input: RefObject<HTMLTextAreaElement | null>, chatId: string | null) {
  useLayoutEffect(() => {
    const textarea = input.current;
    const panel = textarea?.closest<HTMLElement>(".quick-ask-panel");
    if (!inNativeHost || bridge.windowKind !== "quick-ask" || !textarea || !panel) return;
    let frame = 0,
      last = "",
      live = true;
    const windowId = bridge.windowId,
      privateMode = bridge.privateMode;
    const current = () => {
      if (
        bridge.windowId !== windowId ||
        bridge.privateMode !== privateMode ||
        bridge.windowKind !== "quick-ask"
      )
        live = false;
      return live;
    };
    type Layout = Parameters<typeof bridge.quickAskLayout>[0];
    let desired: Layout | undefined,
      sending = false;
    const publish = () => {
      if (!current() || sending || !desired) return;
      const original = desired;
      sending = true;
      void Promise.resolve()
        .then(() => {
          if (current() && desired === original) return bridge.quickAskLayout(original);
        })
        .catch(() => {
          if (current()) last = "";
        })
        .finally(() => {
          sending = false;
          if (current() && desired !== original) publish();
        });
    };
    const observedDialogs = new Set<HTMLDialogElement>();
    const measure = () => {
      frame = 0;
      if (!current()) return;
      const conversation = panel.querySelector(".conversation");
      if (!conversation) return;
      for (const item of panel.querySelectorAll(".composer-context, .composer-footer, .quick-ask-connection"))
        resize.observe(item);
      const dialogs = composerDialogs(panel);
      for (const dialog of observedDialogs) {
        if (!dialogs.has(dialog)) {
          resize.unobserve(dialog);
          observedDialogs.delete(dialog);
        }
      }
      for (const dialog of dialogs) {
        if (!observedDialogs.has(dialog)) {
          resize.observe(dialog);
          observedDialogs.add(dialog);
        }
      }
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
        // The same native draft window temporarily makes room for its owned picker.
        for (const dialog of dialogs)
          draftHeight = Math.max(draftHeight, Math.min(360, Math.ceil(dialog.scrollHeight + footer + 24)));
      }
      const key = `${expanded}:${draftHeight}`;
      if (last === key) return;
      last = key;
      desired = { conversation: expanded, draftHeight };
      publish();
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
    const stopStageReport = onStageReport(schedule);
    textarea.addEventListener("input", schedule);
    schedule();
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
      stopStageReport();
      textarea.removeEventListener("input", schedule);
    };
  }, [input, chatId]);
}
