import { ActivationPolicy } from "./pages/activation.js";
import { ControlAuthority } from "./pages/control.js";
import { PageDiagnostics } from "./pages/diagnostics.js";
import { ProgramExecutor } from "./pages/executor.js";
import { PageLanes } from "./pages/lanes.js";
import { NativeViewSync } from "./pages/native-sync.js";
import { PageNavigation } from "./pages/navigation.js";
import { ObservationService } from "./pages/observation.js";
import { PageOpener } from "./pages/opener.js";
import { PageRegistry } from "./pages/registry.js";
import { TabSessionRestore } from "./pages/session-restore.js";
import type { PageServiceDeps } from "./pages/types.js";
import type { Observation } from "@aux/contracts";
import type { MethodParams } from "@aux/contracts";
import { SiteAdapters } from "../agent/site-adapters.js";

export type { DriverSet, ExecuteResult, PageServiceDeps } from "./pages/types.js";

/**
 * Owns the page registry: identity, lifecycle, per-page serialization,
 * observations with revisions, human takeover, and driver wiring. A facade
 * over the page components in ./pages — callers keep this one surface.
 */
export class PageService {
  private readonly pages: PageRegistry;
  private readonly lanes: PageLanes;
  private readonly activation: ActivationPolicy;
  private readonly opener: PageOpener;
  private readonly restore: TabSessionRestore;
  private readonly navigation: PageNavigation;
  private readonly nativeSync: NativeViewSync;
  private readonly observation: ObservationService;
  private readonly control: ControlAuthority;
  private readonly executor: ProgramExecutor;
  private readonly diagnostics: PageDiagnostics;

  constructor(deps: PageServiceDeps) {
    this.pages = new PageRegistry(deps);
    this.lanes = new PageLanes(this.pages);
    this.activation = new ActivationPolicy(this.pages);
    this.opener = new PageOpener(this.pages, this.activation);
    this.restore = new TabSessionRestore(this.pages, this.opener, this.activation);
    this.navigation = new PageNavigation(this.pages, this.lanes, this.activation);
    this.nativeSync = new NativeViewSync(this.pages, this.opener, this.activation);
    this.observation = new ObservationService(this.pages, this.lanes);
    this.control = new ControlAuthority(this.pages);
    this.executor = new ProgramExecutor(this.pages, this.lanes, this.observation, this.control);
    this.diagnostics = new PageDiagnostics(this.pages, this.observation, this.executor);
  }

  shuttingDown() {
    this.pages.closing = true;
  }

  get activePageId(): string | null {
    return this.pages.activeId;
  }

  activePageIdFor(windowId = "main"): string | null {
    return this.pages.activeByWindow.get(windowId) ?? null;
  }

  get isRestoringTabs() { return this.pages.restoring; }

  list: PageRegistry["list"] = (...args) => this.pages.list(...args);
  get: PageRegistry["get"] = (...args) => this.pages.get(...args);
  isAttached: PageRegistry["isAttached"] = (...args) => this.pages.isAttached(...args);
  livePageIds: PageRegistry["livePageIds"] = (...args) => this.pages.livePageIds(...args);

  currentObservation(pageId: string): Observation | undefined {
    const page = this.pages.live.get(pageId);
    const obs = page?.lastObs?.obs;
    return obs?.documentEpoch === page?.target.documentEpoch ? obs : undefined;
  }

  open: PageOpener["open"] = (...args) => this.opener.open(...args);
  registerExternal: PageOpener["registerExternal"] = (...args) => this.opener.registerExternal(...args);

  restoreTabs: TabSessionRestore["restoreTabs"] = (...args) => this.restore.restoreTabs(...args);
  recoveryTabs: TabSessionRestore["recoveryTabs"] = (...args) => this.restore.recoveryTabs(...args);
  retryRestore: TabSessionRestore["retryRestore"] = (...args) => this.restore.retryRestore(...args);

  activate: ActivationPolicy["activate"] = (...args) => this.activation.activate(...args);
  onNativeWindowFocused: ActivationPolicy["onNativeWindowFocused"] = (...args) => this.activation.onNativeWindowFocused(...args);

  close: PageNavigation["close"] = (...args) => this.navigation.close(...args);
  moveToWindow: PageNavigation["moveToWindow"] = (...args) => this.navigation.moveToWindow(...args);
  navigate: PageNavigation["navigate"] = (...args) => this.navigation.navigate(...args);
  back: PageNavigation["back"] = (...args) => this.navigation.back(...args);
  forward: PageNavigation["forward"] = (...args) => this.navigation.forward(...args);
  reload: PageNavigation["reload"] = (...args) => this.navigation.reload(...args);
  stop: PageNavigation["stop"] = (...args) => this.navigation.stop(...args);

  observe: ObservationService["observe"] = (...args) => this.observation.observe(...args);
  extract: ObservationService["extract"] = (...args) => this.observation.extract(...args);

  execute: ProgramExecutor["execute"] = (...args) => this.executor.execute(...args);
  waitFor: ProgramExecutor["waitFor"] = (...args) => this.executor.waitFor(...args);

  takeover: ControlAuthority["takeover"] = (...args) => this.control.takeover(...args);
  resume: ControlAuthority["resume"] = (...args) => this.control.resume(...args);
  onNativeTakeover: ControlAuthority["onNativeTakeover"] = (...args) => this.control.onNativeTakeover(...args);
  releaseAgent: ControlAuthority["releaseAgent"] = (...args) => this.control.releaseAgent(...args);

  pickElement: PageDiagnostics["pickElement"] = (...args) => this.diagnostics.pickElement(...args);
  console: PageDiagnostics["console"] = (...args) => this.diagnostics.console(...args);
  dialog: PageDiagnostics["dialog"] = (...args) => this.diagnostics.dialog(...args);
  network: PageDiagnostics["network"] = (...args) => this.diagnostics.network(...args);
  readSiteContent(input: MethodParams<"sites.read">, allowOrigin: (url: URL) => boolean) {
    return new SiteAdapters(this.pages, allowOrigin).read(input);
  }
  find: PageDiagnostics["find"] = (...args) => this.diagnostics.find(...args);
  stopFind: PageDiagnostics["stopFind"] = (...args) => this.diagnostics.stopFind(...args);
  zoom: PageDiagnostics["zoom"] = (...args) => this.diagnostics.zoom(...args);
  capture: PageDiagnostics["capture"] = (...args) => this.diagnostics.capture(...args);
  viewport: PageDiagnostics["viewport"] = (...args) => this.diagnostics.viewport(...args);

  syncCatalog: NativeViewSync["syncCatalog"] = (...args) => this.nativeSync.syncCatalog(...args);
  onNativeRemoved: NativeViewSync["onNativeRemoved"] = (...args) => this.nativeSync.onNativeRemoved(...args);
  onNativeNavigated: NativeViewSync["onNativeNavigated"] = (...args) => this.nativeSync.onNativeNavigated(...args);
  onNativeNavigationError: NativeViewSync["onNativeNavigationError"] = (...args) => this.nativeSync.onNativeNavigationError(...args);
  onNativeCrashed: NativeViewSync["onNativeCrashed"] = (...args) => this.nativeSync.onNativeCrashed(...args);
  onNativeTitle: NativeViewSync["onNativeTitle"] = (...args) => this.nativeSync.onNativeTitle(...args);
  onNativeFavicon: NativeViewSync["onNativeFavicon"] = (...args) => this.nativeSync.onNativeFavicon(...args);
  onNativeNavState: NativeViewSync["onNativeNavState"] = (...args) => this.nativeSync.onNativeNavState(...args);
  onNativeLoading: NativeViewSync["onNativeLoading"] = (...args) => this.nativeSync.onNativeLoading(...args);
  onNativeDownloadStarted: NativeViewSync["onNativeDownloadStarted"] = (...args) => this.nativeSync.onNativeDownloadStarted(...args);
  onNativeDownload: NativeViewSync["onNativeDownload"] = (...args) => this.nativeSync.onNativeDownload(...args);
}
