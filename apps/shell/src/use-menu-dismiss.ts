import { useCallback, useEffect, useRef, type RefObject } from "react";

export function useMenuDismiss(ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const close = useRef(onClose);
  close.current = onClose;
  const animation = useRef<Animation | null>(null);
  const closing = useRef(false);
  useEffect(() => () => {
    if (animation.current) {
      animation.current.onfinish = null;
      animation.current.cancel();
    }
  }, []);

  return useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const menu = ref.current;
    if (!menu || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      close.current();
      return;
    }
    menu.inert = true;
    const style = getComputedStyle(menu);
    animation.current = menu.animate([
      { opacity: style.opacity, transform: style.transform },
      { opacity: 0, transform: "scale(.95)" },
    ], { duration: 100, easing: style.getPropertyValue("--ease-out").trim() || "ease-out", fill: "forwards" });
    animation.current.onfinish = () => close.current();
  }, [ref]);
}
