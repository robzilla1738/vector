import { useEffect, useState } from "react";
import type { HistoryEntry } from "@vector/contracts";
import { inMock } from "../bridge";
import { useStore, call } from "../store";
import { hostOf, MAX_PINS } from "../workspace";
import { CommandBar } from "./CommandBar";
import { SiteTile, TileFace } from "./SiteTile";
import { I } from "./icons";

const PROMPTS = [
  "Summarise the open review comments on this PR",
  "Find the cheapest plan with SSO across these pricing pages",
  "Collect every talk title on this schedule into a table",
];

const WX_KEY = "vector.weather.v1";
const WX_TTL = 30 * 60 * 1000;

type Weather = { temp: number; code: number; city: string; unit: "F" | "C" };

function imperial(): boolean {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase().includes("-us");
  } catch {
    return true;
  }
}

function wxIcon(code: number, hour: number) {
  if (code === 0 || code === 1) return hour < 6 || hour >= 20 ? I.moon : I.sun;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return I.snowflake;
  return I.cloud;
}

function wxLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Fog";
  if (code <= 67 || (code >= 80 && code <= 82)) return "Rain";
  if (code <= 77 || code === 85 || code === 86) return "Snow";
  if (code >= 95) return "Storms";
  return "Clouds";
}

async function locate(): Promise<{ lat: number; lon: number; city: string } | null> {
  if (!inMock) {
    const geo = await new Promise<GeolocationPosition | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      const t = window.setTimeout(() => resolve(null), 1800);
      navigator.geolocation.getCurrentPosition(
        (p) => {
          window.clearTimeout(t);
          resolve(p);
        },
        () => {
          window.clearTimeout(t);
          resolve(null);
        },
        { maximumAge: 30 * 60_000, timeout: 1600 },
      );
    });
    if (geo) return { lat: geo.coords.latitude, lon: geo.coords.longitude, city: "" };
  }
  try {
    const r = await fetch("https://ipwho.is/");
    const j = (await r.json()) as { success?: boolean; latitude?: number; longitude?: number; city?: string };
    if (j.success && j.latitude != null && j.longitude != null) return { lat: j.latitude, lon: j.longitude, city: j.city ?? "" };
  } catch {
    /* offline */
  }
  return null;
}

async function loadWeather(): Promise<Weather | null> {
  const unit: "F" | "C" = imperial() ? "F" : "C";
  try {
    const raw = localStorage.getItem(WX_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as Weather & { at: number };
      if (cached.at && Date.now() - cached.at < WX_TTL && cached.unit === unit) return cached;
    }
  } catch {
    /* ignore */
  }
  const loc = await locate();
  const fallback: Weather | null = inMock ? { temp: 72, code: 2, city: "Birmingham", unit } : null;
  if (!loc) {
    if (fallback) localStorage.setItem(WX_KEY, JSON.stringify({ ...fallback, at: Date.now() }));
    return fallback;
  }
  try {
    const q = new URLSearchParams({
      latitude: String(loc.lat),
      longitude: String(loc.lon),
      current: "temperature_2m,weather_code",
      temperature_unit: unit === "F" ? "fahrenheit" : "celsius",
    });
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?${q}`);
    const j = (await r.json()) as { current?: { temperature_2m?: number; weather_code?: number } };
    const temp = j.current?.temperature_2m;
    const code = j.current?.weather_code;
    if (temp == null || code == null) return null;
    let city = loc.city;
    if (!city) {
      try {
        const g = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${loc.lat}&longitude=${loc.lon}&localityLanguage=en`);
        const gj = (await g.json()) as { city?: string; locality?: string };
        city = gj.city || gj.locality || "";
      } catch {
        city = "";
      }
    }
    const wx: Weather = { temp, code, city, unit };
    localStorage.setItem(WX_KEY, JSON.stringify({ ...wx, at: Date.now() }));
    return wx;
  } catch {
    if (fallback) localStorage.setItem(WX_KEY, JSON.stringify({ ...fallback, at: Date.now() }));
    return fallback;
  }
}

function WeatherChip() {
  const [wx, setWx] = useState<Weather | null>(null);
  useEffect(() => {
    let gone = false;
    void loadWeather().then((w) => {
      if (!gone) setWx(w);
    });
    return () => {
      gone = true;
    };
  }, []);
  if (!wx) return null;
  const hour = new Date().getHours();
  return (
    <div className="start-wx" title={`${wxLabel(wx.code)}${wx.city ? ` · ${wx.city}` : ""}`}>
      <span className="start-wx-ico">{wxIcon(wx.code, hour)}</span>
      <span className="start-wx-temp">{Math.round(wx.temp)}°</span>
      <span className="start-wx-meta">
        <span className="start-wx-cond">{wxLabel(wx.code)}</span>
        {wx.city && <span className="start-wx-city">{wx.city}</span>}
      </span>
    </div>
  );
}

/**
 * New tab: greeting + weather, a hero search/ask field, then pins and a
 * quiet recent/runs shelf. The field is the page — not a caption pointing elsewhere.
 */
export function StartPage() {
  const layout = useStore((s) => s.layout);
  const bookmarks = useStore((s) => s.bookmarks);
  const programs = useStore((s) => s.programs);
  const runs = useStore((s) => s.runs);
  const newTab = useStore((s) => s.newTab);
  const startRun = useStore((s) => s.startRun);
  const focusCommandBar = useStore((s) => s.focusCommandBar);
  const activePageId = useStore((s) => s.activePageId);
  const [recent, setRecent] = useState<HistoryEntry[]>([]);
  const space = layout.spaces.find((s) => s.id === layout.activeSpaceId) ?? layout.spaces[0]!;
  const pins = (layout.pins[space.id] ?? []).slice(0, MAX_PINS);

  useEffect(() => {
    focusCommandBar("hero");
    void call<HistoryEntry[]>("history.list", { limit: 40 })
      .then((h) => {
        const seen = new Set<string>();
        setRecent(h.filter((e) => /^https?:/.test(e.url) && !seen.has(hostOf(e.url)) && seen.add(hostOf(e.url))).slice(0, 5));
      })
      .catch(() => setRecent([]));
  }, [focusCommandBar]);

  const open = (url: string) => (activePageId ? call("pages.navigate", { pageId: activePageId, url }) : newTab(url));
  const sites = (pins.length ? pins : bookmarks.slice(0, 5)).map((b) => ({ url: b.url, title: b.title }));
  const lastRuns = runs.slice(0, 3);
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Late night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const prompts = [...PROMPTS.slice(0, programs[0] ? 2 : 3), ...(programs[0] ? [programs[0].name] : [])];

  return (
    <div className="start" data-space={space.color}>
      <div className="start-inner">
        <div className="start-top">
          <div className="start-head">
            <h1>{greeting}.</h1>
            <p className="start-date">{today}</p>
          </div>
          <WeatherChip />
        </div>

        <div className="start-hero">
          <CommandBar hero />
          <div className="start-suggest">
            {prompts.map((p) => (
              <button
                key={p}
                className="start-suggest-row"
                onClick={() => void startRun(p, { scope: "new" })}
              >
                {I.agent}
                <span>{p}</span>
              </button>
            ))}
          </div>
        </div>

        {sites.length > 0 && (
          <section className="start-section start-pins">
            <h2>{pins.length ? "Pinned" : "Favourites"}</h2>
            <div className="start-tiles">
              {sites.map((b) => (
                <SiteTile key={b.url} url={b.url} title={b.title || hostOf(b.url)} size="md" label onClick={() => void open(b.url)} />
              ))}
            </div>
          </section>
        )}

        {(recent.length > 0 || lastRuns.length > 0) && (
          <div className="start-cols">
            {recent.length > 0 && (
              <section className="start-section">
                <h2>Recent</h2>
                <div className="start-recent">
                  {recent.map((h) => (
                    <button key={h.url} className="start-recent-row" onClick={() => void open(h.url)} title={h.url}>
                      <TileFace url={h.url} size="sm" />
                      <span className="t">{h.title || hostOf(h.url)}</span>
                      <span className="h">{hostOf(h.url)}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
            {lastRuns.length > 0 && (
              <section className="start-section">
                <h2>Runs</h2>
                <div className="start-runs">
                  {lastRuns.map((r) => (
                    <button key={r.runId} className="start-run" onClick={() => useStore.getState().openRail({ kind: "run", runId: r.runId })}>
                      <span className={`st ${r.status}`}>{r.status.replace("_", " ")}</span>
                      <span className="t">{r.goal}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
