import { useEffect, useMemo, useState } from "react";
import { faviconCandidates, hostLetter } from "../favicon";
import { hostOf } from "../workspace";
import { I } from "./icons";

export function FavIcon({
  url,
  src,
  className,
  fallback = "globe",
  size = "md",
}: {
  url: string;
  src?: string;
  className?: string;
  fallback?: "globe" | "letter";
  size?: "sm" | "md" | "lg";
}) {
  const candidates = useMemo(() => faviconCandidates(url, src), [url, src]);
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [url, src]);
  const icon = candidates[i];
  if (!icon) {
    if (fallback === "letter") {
      const letter = hostLetter(url);
      if (letter) return <span className={`tile-letter ${className ?? ""}`.trim()}>{letter}</span>;
    }
    return <span className={`tile-globe ${className ?? ""}`.trim()}>{size === "sm" ? I.globe : I.globeLg}</span>;
  }
  return (
    <img
      key={icon}
      className={className}
      src={icon}
      alt=""
      draggable={false}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setI((n) => n + 1)}
    />
  );
}

/** The face of a tile — favicon when it loads, otherwise a letter. Inline, so it can sit inside buttons. */
export function TileFace({ url, favicon, size = "md" }: { url: string; favicon?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`tile-face ${size}`} aria-hidden>
      <FavIcon url={url} src={favicon} fallback="letter" size={size} />
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
