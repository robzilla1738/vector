import "./TabPreview.css";
import "../ui/tooltip.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PageTarget } from "@aux/contracts";
import { bridge } from "../bridge";
import { isHomeAddress } from "../chrome";
import { useStore } from "../store";
import { TabCardCaption } from "./TabCardCaption";

export function TabPreview({ page, x, y }: { page: PageTarget; x: number; y: number }) {
  const card = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: x, top: y + 8 });
  useLayoutEffect(() => {
    const place = () => {
      if (!card.current) return;
      const rect = card.current.getBoundingClientRect();
      setPosition({
        left: Math.max(8, Math.min(x, innerWidth - rect.width - 8)),
        top: Math.max(8, Math.min(y + 8, innerHeight - rect.height - 8)),
      });
    };
    place();
    const observer = new ResizeObserver(place);
    if (card.current) observer.observe(card.current);
    return () => observer.disconnect();
  }, [x, y]);
  useLayoutEffect(() => {
    useStore.setState({ tabPreviewOpen: true });
    return () => {
      useStore.setState({ tabPreviewOpen: false });
    };
  }, []);
  const [image, setImage] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    setImage(null);
    if (!isHomeAddress(page.url) || page.showBlankDocument === true)
      void bridge
        .preview(page.pageId)
        .then((value) => {
          if (live) setImage(value);
        })
        .catch(() => {});
    return () => {
      live = false;
    };
  }, [page.pageId, page.url, page.showBlankDocument]);
  return createPortal(
    <div ref={card} className="ui-tooltip solid-popover tab-preview" role="tooltip" style={position}>
      {(!isHomeAddress(page.url) || page.showBlankDocument === true) && (
        <div className="tab-preview-image">{image && <img src={image} alt="" />}</div>
      )}
      <TabCardCaption page={page} />
    </div>,
    document.body,
  );
}

/** Vertical rows place the same preview beside the sidebar. */
export function useSidebarTabPreview() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPosition(null);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (!position) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    window.addEventListener("keydown", key);
    window.addEventListener("resize", hide);
    window.addEventListener("blur", hide);
    document.addEventListener("scroll", hide, true);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", hide);
      window.removeEventListener("blur", hide);
      document.removeEventListener("scroll", hide, true);
    };
  }, [position]);
  return {
    position,
    hide,
    show: (element: HTMLElement) => {
      hide();
      const rect = element.getBoundingClientRect();
      timer.current = setTimeout(() => {
        timer.current = null;
        setPosition({ x: rect.right + 8, y: Math.max(0, Math.min(rect.top - 8, innerHeight - 270)) });
      }, 450);
    },
  };
}
