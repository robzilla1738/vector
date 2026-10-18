import { captureSheetsNavigation } from "../agent/sheets-navigation.js";
import { NativeRecorderObserver } from "./native-recorder-observer.js";
import type { ValidatedTaskRead } from "@aux/contracts";
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
import { AuxError, type Observation } from "@aux/contracts";
import type { MethodParams } from "@aux/contracts";
import { SiteAdapters } from "../agent/site-adapters.js";
import { InlineAssist } from "./pages/inline-assist.js";

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
  private readonly inlineAssist: InlineAssist;

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
    this.inlineAssist = new InlineAssist(this.pages, this.lanes);
  }

  /** Actual agent read producer; person shell reads continue to use the ordinary page facade. */
  async authorizeAgentRead(
    runId: string,
    pageId: string,
    action = "page.read",
    taskRead?: ValidatedTaskRead,
  ): Promise<() => void> {
    const run = this.pages.deps.repo.getRun(runId);
    const page = this.pages.get(pageId);
    if (!run || !["queued", "running", "planning", "needs_input", "paused"].includes(run.status))
      throw new AuxError("permission_denied", "This agent read turn has ended.");
    if (!page.sessionId || page.viewStatus === "detached" || page.viewStatus === "crashed")
      throw new AuxError("target_detached", "The agent read attachment is unavailable.");
    if (!this.pages.deps.safetyGate)
      throw new AuxError("capability_unsupported", "Site agent read policy is unavailable for this runtime.");
    const taskId = run.config?.taskId;
    return this.pages.deps.safetyGate.checkRead({
      action,
      origin: new URL(page.url).origin,
      document: { pageId, sessionId: page.sessionId, documentEpoch: page.documentEpoch, url: page.url },
      context: {
        taskRead,
        profileId: this.pages.deps.profileId ?? "default",
        scope: taskId
          ? { kind: "task", id: taskId }
          : { kind: "workspace", id: run.config?.contextWorkspaceId ?? "default" },
        actor: run.config?.implementation === "external-agent" ? "external_token" : "builtin_agent",
        runId,
        pageId,
        turnId: runId,
        threadId: run.config?.chatId ?? runId,
        sessionId: page.sessionId,
      },
    });
  }

  /** A captured cross-origin response retains its initiating page fence and its own actual site policy. */
  async authorizeAgentResponseRead(
    runId: string,
    requestId: string,
    taskRead?: ValidatedTaskRead,
  ): Promise<() => void> {
    const record = this.pages.deps.repo.getResponse(requestId);
    if (!record) throw new AuxError("not_found", "The captured response is unavailable.");
    const page = this.pages.get(record.pageId);
    if (
      !page.sessionId ||
      record.sessionId !== page.sessionId ||
      record.documentEpoch !== page.documentEpoch ||
      record.documentUrl !== page.url
    )
      throw new AuxError("ref_stale", "This response belongs to another initiating document.");
    const pagePolicy = await this.authorizeAgentRead(runId, page.pageId, "responses.read", taskRead);
    const run = this.pages.deps.repo.getRun(runId);
    if (!run || !this.pages.deps.safetyGate)
      throw new AuxError("permission_denied", "This response read turn has ended.");
    const taskId = run.config?.taskId;
    const responsePolicy = await this.pages.deps.safetyGate.checkRead({
      action: "responses.read",
      origin: new URL(record.url).origin,
      document: {
        pageId: page.pageId,
        sessionId: page.sessionId,
        documentEpoch: page.documentEpoch,
        url: page.url,
      },
      context: {
        taskRead,
        profileId: this.pages.deps.profileId ?? "default",
        scope: taskId
          ? { kind: "task", id: taskId }
          : { kind: "workspace", id: run.config?.contextWorkspaceId ?? "default" },
        actor: run.config?.implementation === "external-agent" ? "external_token" : "builtin_agent",
        runId,
        pageId: page.pageId,
        turnId: runId,
        threadId: run.config?.chatId ?? runId,
        sessionId: page.sessionId,
      },
    });
    const check = () => {
      pagePolicy();
      responsePolicy();
      const current = this.pages.get(page.pageId);
      const saved = this.pages.deps.repo.getResponse(requestId);
      if (
        current.sessionId !== page.sessionId ||
        current.documentEpoch !== page.documentEpoch ||
        current.url !== page.url ||
        !saved ||
        saved.url !== record.url ||
        saved.sessionId !== page.sessionId ||
        saved.documentEpoch !== page.documentEpoch ||
        saved.documentUrl !== page.url
      )
        throw new AuxError("ref_stale", "The response or initiating attachment changed.");
    };
    check();
    return check;
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

  get isRestoringTabs() {
    return this.pages.restoring;
  }

  list: PageRegistry["list"] = (...args) => this.pages.list(...args);
  get: PageRegistry["get"] = (...args) => this.pages.get(...args);
  isAttached: PageRegistry["isAttached"] = (...args) => this.pages.isAttached(...args);
  livePageIds: PageRegistry["livePageIds"] = (...args) => this.pages.livePageIds(...args);

  async recorderObserver(pageId: string) {
    const page = this.get(pageId);
    if (page.ownedByRuntime || page.controller === "agent" || page.controller === "external")
      throw new AuxError("permission_denied", "Recording needs a person-controlled tab.");
    const native = this.pages.deps.native;
    if (native.available()) {
      if (!native.recorderStart || !native.recorderDrain || !native.recorderStop)
        throw new AuxError("backend_unavailable", "Native recording is unavailable in this build.");
      const originalPage = this.pages.live.get(pageId);
      const current = () => {
        const next = this.pages.live.get(pageId);
        // Native UUID/document receipts own capture; a driver session cannot
        // authorize this closed producer or substitute for native attachment.
        return (
          !this.pages.closing &&
          !!originalPage &&
          next === originalPage &&
          next.target.backend === "aux" &&
          !next.target.ownedByRuntime &&
          next.target.controller !== "agent" &&
          next.target.controller !== "external"
        );
      };
      return new NativeRecorderObserver(
        {
          start: native.recorderStart.bind(native),
          drain: native.recorderDrain.bind(native),
          stop: native.recorderStop.bind(native),
        },
        pageId,
        current,
      );
    }
    const driver = this.pages.driverPageLenient(pageId);
    if (!driver.openRecorderObserver)
      throw new AuxError("feature_unavailable", "This page cannot record demonstrations.");
    return driver.openRecorderObserver();
  }

  currentObservation(pageId: string): Observation | undefined {
    const page = this.pages.live.get(pageId);
    const obs = page?.lastObs?.obs;
    return obs?.documentEpoch === page?.target.documentEpoch ? obs : undefined;
  }

  open: PageOpener["open"] = (...args) => this.opener.open(...args);
  registerExternal: PageOpener["registerExternal"] = (...args) => this.opener.registerExternal(...args);

  restoreTabs: TabSessionRestore["restoreTabs"] = (...args) => this.restore.restoreTabs(...args);
  recoveryTabs: TabSessionRestore["recoveryTabs"] = (...args) => this.restore.recoveryTabs(...args);

  /** Hide a tab that still had a renderer until this process has loaded it again. */
  restoredTabShown(
    pageId: string,
    lifecycle: "live" | "placeholder" | "frozen" | "discarded" | undefined,
  ): boolean {
    if (!this.pages.awakeOnRestore.has(pageId)) return true;
    return lifecycle !== "placeholder" && lifecycle !== "discarded";
  }
  retryRestore: TabSessionRestore["retryRestore"] = (...args) => this.restore.retryRestore(...args);

  activate: ActivationPolicy["activate"] = (...args) => this.activation.activate(...args);
  onNativeWindowFocused: ActivationPolicy["onNativeWindowFocused"] = (...args) =>
    this.activation.onNativeWindowFocused(...args);

  closeCreated(original: import("@aux/contracts").PageTarget, runId: string): Promise<void> {
    return this.pages.closeCreator(original, runId);
  }
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
  /** Owner-requested local form restore, serialized with agent commands on this page. */
  undoFormChange(input: {
    pageId: string;
    target: string;
    url: string;
    documentEpoch: number;
    before: { value?: string; checked?: boolean; selected?: string };
    after: { value?: string; checked?: boolean; selected?: string };
  }): Promise<void> {
    return this.lanes.enqueue(input.pageId, async () => {
      const page = this.pages.get(input.pageId);
      const driver = this.pages.driverPageLenient(input.pageId);
      if (page.documentEpoch !== input.documentEpoch || driver.url() !== input.url)
        throw new AuxError("conflict", "The page changed; the recorded form edit cannot be undone safely");
      if (!driver.fieldState) throw new AuxError("backend_unavailable", "Form state is unavailable");
      const same = (left: Record<string, unknown> | undefined, right: Record<string, unknown>) =>
        !!left &&
        Object.keys(right).length === 1 &&
        Object.keys(left).length === 1 &&
        Object.keys(right).every((key) => left[key] === right[key]);
      const live = await driver.fieldState(input.target);
      if (!same(live, input.after))
        throw new AuxError("conflict", "The form changed since this run; reload the receipt and review it");
      if (typeof input.before.value === "string") await driver.fill(input.target, input.before.value);
      else if (typeof input.before.checked === "boolean") {
        if (input.before.checked) await driver.check(input.target);
        else await driver.uncheck(input.target);
      } else if (typeof input.before.selected === "string")
        await driver.select(input.target, input.before.selected.split("|"));
      else throw new AuxError("invalid_params", "No restorable prior form state was recorded");
      if (
        page.documentEpoch !== input.documentEpoch ||
        driver.url() !== input.url ||
        !same(await driver.fieldState(input.target), input.before)
      )
        throw new AuxError(
          "conflict",
          "The page changed during restore; inspect the form before trying again",
        );
    });
  }
  /** Close an unused tab created by a completed model run. Foreground/taken-over tabs require human review. */
  undoOpenedTab(pageId: string, expected: { url: string; documentEpoch: number }): Promise<void> {
    return this.lanes.enqueue(pageId, async () => {
      const page = this.pages.get(pageId);
      if (!page.ownedByRuntime) throw new AuxError("conflict", "This tab is no longer run-owned");
      if (page.url !== expected.url || page.documentEpoch !== expected.documentEpoch)
        throw new AuxError("conflict", "This tab navigated after the run opened it");
      if (
        this.pages.activeId === pageId ||
        this.pages.activeByWindow.get(page.windowId ?? "main") === pageId ||
        !["background", "hidden"].includes(page.viewStatus) ||
        page.controller !== "none"
      )
        throw new AuxError("conflict", "This tab was taken over or activated");
      const closed = await this.navigation.close(pageId);
      if (!closed.ok) throw new AuxError("conflict", "The browser did not close this run-owned tab");
    });
  }
  waitFor: ProgramExecutor["waitFor"] = (...args) => this.executor.waitFor(...args);

  takeover: ControlAuthority["takeover"] = (...args) => this.control.takeover(...args);
  takeoverFromNative: ControlAuthority["takeoverFromNative"] = (...args) =>
    this.control.takeoverFromNative(...args);
  resume: ControlAuthority["resume"] = (...args) => this.control.resume(...args);
  releaseAgent: ControlAuthority["releaseAgent"] = (...args) => this.control.releaseAgent(...args);

  pickElement: PageDiagnostics["pickElement"] = (...args) => this.diagnostics.pickElement(...args);
  pickZap: PageDiagnostics["pickZap"] = (...args) => this.diagnostics.pickZap(...args);
  countZapMatches: PageDiagnostics["countZapMatches"] = (...args) =>
    this.diagnostics.countZapMatches(...args);
  applyUserCss: PageDiagnostics["applyUserCss"] = (...args) => this.diagnostics.applyUserCss(...args);
  console: PageDiagnostics["console"] = (...args) => this.diagnostics.console(...args);
  dialog: PageDiagnostics["dialog"] = (...args) => this.diagnostics.dialog(...args);
  network: PageDiagnostics["network"] = (...args) => this.diagnostics.network(...args);
  supportsSheetsNavigation(pageId: string): boolean {
    const page = this.pages.live.get(pageId);
    return !!(
      page?.target.backend === "aux" &&
      page.target.sessionId &&
      page.target.windowId &&
      this.pages.deps.native.available() &&
      this.pages.deps.safetyGate &&
      this.pages.deps.durableWrites &&
      page.driver?.isAttached() &&
      page.driver.actionTarget &&
      page.driver.withActionTarget
    );
  }
  captureSheetsNavigation(input: MethodParams<"sites.read">, a1: string) {
    const gate = this.pages.deps.safetyGate;
    if (!gate || !this.supportsSheetsNavigation(input.pageId))
      throw new AuxError("capability_unsupported", "Original governed native Sheets input is unavailable.");
    const fence = gate.policyFence();
    return captureSheetsNavigation(this.pages, input, a1, (url) => {
      fence();
      return url.origin === "https://docs.google.com";
    });
  }
  readSiteContent(input: MethodParams<"sites.read">, allowOrigin: (url: URL) => boolean) {
    return new SiteAdapters(this.pages, allowOrigin).read(input);
  }
  captureInlineAssist: InlineAssist["capture"] = (...args) => this.inlineAssist.capture(...args);
  draftInlineAssist: InlineAssist["draft"] = (...args) => this.inlineAssist.draft(...args);
  applyInlineAssist: InlineAssist["apply"] = (...args) => this.inlineAssist.apply(...args);
  cancelInlineAssist: InlineAssist["cancel"] = (...args) => this.inlineAssist.cancel(...args);
  find: PageDiagnostics["find"] = (...args) => this.diagnostics.find(...args);
  stopFind: PageDiagnostics["stopFind"] = (...args) => this.diagnostics.stopFind(...args);
  zoom: PageDiagnostics["zoom"] = (...args) => this.diagnostics.zoom(...args);
  capture: PageDiagnostics["capture"] = (...args) => this.diagnostics.capture(...args);
  viewport: PageDiagnostics["viewport"] = (...args) => this.diagnostics.viewport(...args);

  prepareReadPage: PageRegistry["prepareReadPage"] = (...args) => this.pages.prepareReadPage(...args);
  admitSessionPage: PageRegistry["admitSessionPage"] = (...args) => this.pages.admitSessionPage(...args);
  retireSessionPage: PageRegistry["retireSessionPage"] = (...args) => this.pages.retireSessionPage(...args);

  syncCatalog: NativeViewSync["syncCatalog"] = (...args) => this.nativeSync.syncCatalog(...args);
  onNativeRemoved: NativeViewSync["onNativeRemoved"] = (...args) => this.nativeSync.onNativeRemoved(...args);
  onNativeNavigated: NativeViewSync["onNativeNavigated"] = (...args) =>
    this.nativeSync.onNativeNavigated(...args);
  onNativeNavigationError: NativeViewSync["onNativeNavigationError"] = (...args) =>
    this.nativeSync.onNativeNavigationError(...args);
  onNativeCrashed: NativeViewSync["onNativeCrashed"] = (...args) => this.nativeSync.onNativeCrashed(...args);
  onNativeTitle: NativeViewSync["onNativeTitle"] = (...args) => this.nativeSync.onNativeTitle(...args);
  onNativeFavicon: NativeViewSync["onNativeFavicon"] = (...args) => this.nativeSync.onNativeFavicon(...args);
  onNativeNavState: NativeViewSync["onNativeNavState"] = (...args) =>
    this.nativeSync.onNativeNavState(...args);
  onNativeLoading: NativeViewSync["onNativeLoading"] = (...args) => this.nativeSync.onNativeLoading(...args);
  onNativeDownloadStarted: NativeViewSync["onNativeDownloadStarted"] = (...args) =>
    this.nativeSync.onNativeDownloadStarted(...args);
  onNativeDownload: NativeViewSync["onNativeDownload"] = (...args) =>
    this.nativeSync.onNativeDownload(...args);
}
