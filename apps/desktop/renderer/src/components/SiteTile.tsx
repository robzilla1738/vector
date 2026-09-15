import { useState } from "react";
import { hostOf } from "../workspace";
import { I } from "./icons";

function hueOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

/** The face of a tile — favicon when it loads, otherwise a tinted letter. Inline, so it can sit inside buttons. */
export function TileFace({ url, favicon, size = "md" }: { url: string; favicon?: string; size?: "sm" | "md" | "lg" }) {
  const host = hostOf(url);
  const [broken, setBroken] = useState(false);
  let src = favicon ?? "";
  if (!src && /^https?:/.test(url)) {
    try {
      src = `${new URL(url).origin}/favicon.ico`;
    } catch {
      src = "";
    }
  }
  const first = host[0] ?? "";
  const letter = /^[a-z0-9]/i.test(first) ? first.toUpperCase() : null;
  return (
    <span className={`tile-face ${size}`} style={{ "--tile-hue": hueOf(host) } as React.CSSProperties} aria-hidden>
      {!broken && src ? (
        <img src={src} alt="" onError={() => setBroken(true)} draggable={false} />
      ) : letter ? (
        <span className="tile-letter">{letter}</span>
      ) : (
        <span className="tile-letter tile-globe">{I.globe}</span>
      )}
    </span>
  );
}

/**
 * Favicon tile button — pinned sites, the collapsed rail, the start page.
 */
export function SiteTile({
  url,
  title,
  favicon,
  size = "md",
  onClick,
  active,
  label,
  ...rest
}: {
  url: string;
  title: string;
  favicon?: string;
  size?: "sm" | "md" | "lg";
  active?: boolean;
  /** show the title beneath the tile (start page) */
  label?: boolean;
  onClick?: (e: React.MouseEvent) => void;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "title">) {
  const host = hostOf(url);
  return (
    <button className={`site-tile ${size} ${active ? "active" : ""} ${label ? "labelled" : ""}`} title={title || host} aria-label={title || host} onClick={onClick} {...rest}>
      <TileFace url={url} favicon={favicon} size={size} />
      {label && <span className="tile-label">{title || host}</span>}
    </button>
  );
}
