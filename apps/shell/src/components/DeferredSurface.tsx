import { staticRowProps } from "../ui/class-props";
import { smallGhostButtonProps } from "../ui/button-props";
import { Component, Suspense, lazy, useEffect, useLayoutEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { useStore } from "../store";
import { SurfaceSkeleton } from "./Skeleton";

class SurfaceBoundary extends Component<{children:ReactNode; fallback(error:Error):ReactNode}, {error:Error|null}> {
  override state: {error:Error|null} = {error:null};
  static getDerivedStateFromError(error:Error) { return {error}; }
  override render() { return this.state.error ? this.props.fallback(this.state.error) : this.props.children; }
}

function SurfaceStatus({label, error, retry, pane, onClose}: {label:string; error?:Error; retry?:()=>void; pane:boolean; onClose?:()=>void}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pane) return;
    root.current?.focus();
  }, [pane]);
  const close = onClose ?? (() => pane ? useStore.getState().setMode("focus") : useStore.getState().setOverlay(null));
  return <div className={`surface-status${pane ? " pane" : " overlay"}`} role={pane ? "region" : "dialog"} aria-modal={pane ? undefined : true} aria-label={label} tabIndex={-1} ref={root} onKeyDown={event => {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); }
    if (!pane && event.key === "Tab") {
      const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button")];
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      event.preventDefault(); buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
    }
  }}>{error ? <div>
    <h2>{label} couldn’t open</h2>
    <p>Try again. Your browser tabs and saved work stay available.</p><div {...staticRowProps}><button className="btn primary" onClick={retry}>Try again</button><button className="btn" onClick={close}>Close</button></div><details><summary>Details</summary><p>{error.message}</p></details>
  </div> : <div className="surface-loading">
    <SurfaceSkeleton label={`Opening ${label.toLowerCase()}…`} />
    <button {...smallGhostButtonProps} onClick={close}>Cancel</button>
  </div>}</div>;
}

export type DeferredSurface<Props extends object> = ComponentType<Props> & { preload(): void };

/**
 * A failed surface can retry without reloading the browser or discarding its drafts.
 * `preload()` fetches the chunk ahead of use; once loaded the surface renders
 * synchronously, so a prefetched first open never shows the loading state.
 * `quiet` surfaces render nothing while loading (always-mounted chrome).
 */
export function deferSurface<Props extends object>(load:()=>Promise<{default:ComponentType<Props>}>, label:string, pane=false, quiet=false, onClose?:()=>void): DeferredSurface<Props> {
  let loaded: ComponentType<Props> | undefined;
  let pending: Promise<{default:ComponentType<Props>}> | undefined;
  const fetch = () => pending ??= load().then(module => { loaded = module.default; return module; }, (error: unknown) => { pending = undefined; throw error; });
  // One component per attempt: switching from the lazy wrapper to the loaded
  // module mid-life would remount the surface and drop its state.
  function Loader(props:Props) {
    const [Surface] = useState<ComponentType<Props>>(() => loaded ?? lazy(fetch));
    return <Suspense fallback={quiet ? null : <SurfaceStatus label={label} pane={pane} onClose={onClose} />}><Surface {...props}/></Suspense>;
  }
  function DeferredSurface(props:Props) {
    const [attempt, setAttempt] = useState(0);
    const previousFocus = useRef(document.activeElement as HTMLElement | null);
    useLayoutEffect(() => () => {
      if (pane) return;
      const original = document.activeElement;
      queueMicrotask(() => {
        const previous = previousFocus.current, active = document.activeElement;
        if (original && !original.isConnected && (active === document.body || active === null) &&
            previous?.isConnected && !previous.closest("[inert]")) previous.focus();
      });
    }, []);
    return <SurfaceBoundary key={attempt} fallback={error => <SurfaceStatus label={label} error={error} pane={pane} onClose={onClose} retry={() => setAttempt(value => value + 1)} />}>
      <Loader {...props}/>
    </SurfaceBoundary>;
  }
  return Object.assign(DeferredSurface, { preload: () => { void fetch().catch(() => {}); } });
}

/** Warm deferred chunks once the shell has painted and gone idle. */
export function preloadWhenIdle(surfaces: readonly { preload(): void }[]) {
  const run = () => { for (const surface of surfaces) surface.preload(); };
  if (typeof requestIdleCallback === "function") { const id = requestIdleCallback(run, { timeout: 3000 }); return () => cancelIdleCallback(id); }
  const timer = setTimeout(run, 1500); return () => clearTimeout(timer);
}

/** Preserve the original deferred boundary while sharing its named-module adapter. */
type NamedSurfaceProps<T> = T extends ComponentType<infer Props> ? NonNullable<Props> extends object ? NonNullable<Props> : never : never;
export function deferNamedSurface<Module, Name extends keyof Module>(load: () => Promise<Module>, name: Name, label: string, pane = false, quiet = false, onClose?: () => void): DeferredSurface<NamedSurfaceProps<Module[Name]>> {
  return deferSurface(async () => ({ default: (await load())[name] as ComponentType<NamedSurfaceProps<Module[Name]>> }), label, pane, quiet, onClose);
}
