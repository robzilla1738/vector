import { useId, useState } from "react";
import type { PageTarget } from "@vector/contracts";
import { engineOf, type EngineInfo } from "../engine";
import { I } from "./icons";

/**
 * Which engine renders a tab — Chromium, the user's Chrome, or Vector Engine —
 * with a hover/focus card carrying the route reason and timings when the
 * runtime reports them.
 */
export function EngineBadge({ page, compact }: { page: PageTarget; compact?: boolean }) {
  const info = engineOf(page as PageTarget & { route?: EngineInfo["route"] });
  const [open, setOpen] = useState(false);
  const id = useId();
  const icon = info.backend === "vector-engine" ? I.engine : info.backend === "chrome" ? I.chromeSm : I.cpu;
  return (
    <span className={`engine-wrap ${open ? "open" : ""}`} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className={`engine-badge ${info.backend} ${compact ? "compact" : ""}`}
        aria-describedby={id}
        aria-label={`Rendered by ${info.label}`}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        {icon}
        {!compact && <span className="engine-label">{info.backend === "vector-engine" ? "Engine" : info.backend === "chrome" ? "Chrome" : "Chromium"}</span>}
      </button>
      <div role="tooltip" id={id} className="engine-card" hidden={!open}>
        <div className="engine-card-head">
          <span className={`engine-dot ${info.backend}`} />
          <b>{info.label}</b>
        </div>
        <p>{info.description}</p>
        {info.route?.routeReason && (
          <div className="engine-row">
            <span>Route</span>
            <span className="v">{info.route.routeReason}</span>
          </div>
        )}
        {(info.route?.routeMs != null || info.route?.firstPaintMs != null) && (
          <div className="engine-row nums">
            {info.route?.routeMs != null && (
              <span>
                route <b>{info.route.routeMs} ms</b>
              </span>
            )}
            {info.route?.firstPaintMs != null && (
              <span>
                first paint <b>{info.route.firstPaintMs} ms</b>
              </span>
            )}
          </div>
        )}
        {!info.route && <div className="engine-row muted">No routing detail yet — the engine track will report why this backend was chosen.</div>}
      </div>
    </span>
  );
}
