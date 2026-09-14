import { I } from "./icons";

/** favicon tile — letter fallback for domains, globe glyph for hosts without one */
export function SiteTile({ url, title, onClick }: { url: string; title: string; onClick: () => void }) {
  let host = url;
  let fav = "";
  try {
    const u = new URL(url);
    host = u.hostname.replace(/^www\./, "");
    fav = `${u.origin}/favicon.ico`;
  } catch { /* keep the raw string */ }
  const first = host[0] ?? "";
  const letter = /^[a-z]/i.test(first) ? first.toUpperCase() : null;
  return (
    <button className="site-tile" title={title || host} onClick={onClick}>
      {letter ? <span className="tile-letter">{letter}</span> : <span className="tile-letter tile-globe">{I.globe}</span>}
      {fav && <img src={fav} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
    </button>
  );
}
