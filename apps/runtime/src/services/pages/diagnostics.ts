import {
  NativePersonCaptureReceiptSchema,
  AuxError,
  SiteOriginSchema,
  ZapPickResultSchema,
  ZapSelectorSchema,
  newStepId,
  type ZapPickResult,
} from "@aux/contracts";
import { limitCapturePng } from "../capture-size.js";
import {
  ELEMENT_PICK_TIMEOUT_MS,
  type PickedElement,
  pickElementInPage,
} from "../../execution/element-picker.js";
import { pickZapInPage } from "../../execution/zap-picker.js";
import type { ProgramExecutor } from "./executor.js";
import type { ObservationService } from "./observation.js";
import type { PageRegistry } from "./registry.js";

export class PageDiagnostics {
  constructor(
    private pages: PageRegistry,
    private observation: ObservationService,
    private executor: ProgramExecutor,
  ) {}

  private pickInFlight = new Set<string>();

  /**
   * Interactive element pick ("request edit") — the tab stays under human
   * control; a small overlay resolves on click, Escape, or timeout. The pick
   * is deliberately not enqueued: it must run while the user keeps clicking.
   */
  async pickElement(
    pageId: string,
    opts: { timeoutMs?: number } = {},
  ): Promise<{ picked: boolean; element?: PickedElement }> {
    const lp = this.pages.live.get(pageId);
    if (!lp?.driver || !lp.driver.isAttached())
      throw new AuxError("target_detached", `page ${pageId} is not attached`);
    if (lp.target.controller === "agent")
      throw new AuxError(
        "conflict",
        "The agent is driving this page. Take it over before picking an element.",
      );
    if (this.pickInFlight.has(pageId))
      throw new AuxError("conflict", "An element pick is already waiting on this page.");
    const timeoutMs = Math.min(Math.max(opts.timeoutMs ?? ELEMENT_PICK_TIMEOUT_MS, 1_000), 120_000);
    this.pickInFlight.add(pageId);
    try {
      const expression = `(${pickElementInPage.toString()})(${timeoutMs})`;
      const result = await Promise.race([
        lp.driver.evaluate(expression) as Promise<PickedElement | null>,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs + 5_000)),
      ]).catch(() => null);
      return result ? { picked: true, element: result } : { picked: false };
    } finally {
      this.pickInFlight.delete(pageId);
    }
  }

  private customizationPage(pageId: string, expectedDocumentEpoch: number) {
    const page = this.pages.get(pageId);
    if (page.documentEpoch !== expectedDocumentEpoch)
      throw new AuxError("conflict", "The page changed. Start Zap again.");
    let origin: string;
    try {
      origin = SiteOriginSchema.parse(new URL(page.url).origin);
    } catch {
      throw new AuxError("invalid_params", "Zap works on HTTP and HTTPS pages only.");
    }
    const live = this.pages.live.get(pageId);
    if (!live?.driver || !live.driver.isAttached())
      throw new AuxError("target_detached", "The page is not attached.");
    return { page, origin, driver: live.driver };
  }

  async pickZap(
    pageId: string,
    expectedDocumentEpoch: number,
    timeoutMs = ELEMENT_PICK_TIMEOUT_MS,
  ): Promise<ZapPickResult> {
    const { page, origin, driver } = this.customizationPage(pageId, expectedDocumentEpoch);
    if (page.controller === "agent")
      throw new AuxError("conflict", "Take control of this page before using Zap.");
    if (this.pickInFlight.has(pageId))
      throw new AuxError("conflict", "An element picker is already open on this page.");
    const bounded = Math.min(Math.max(timeoutMs, 1_000), 120_000);
    this.pickInFlight.add(pageId);
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    try {
      const expression = `(${pickZapInPage.toString()})(${bounded})`;
      const picked = await Promise.race([
        driver.evaluate(expression),
        new Promise((resolve) => {
          watchdog = setTimeout(() => resolve({ picked: false }), bounded + 5_000);
        }),
      ]);
      this.customizationPage(pageId, expectedDocumentEpoch);
      if (!picked || typeof picked !== "object" || !("picked" in picked) || picked.picked !== true)
        return ZapPickResultSchema.parse(picked ?? { picked: false });
      return ZapPickResultSchema.parse({ ...picked, pageId, documentEpoch: expectedDocumentEpoch, origin });
    } finally {
      if (watchdog) clearTimeout(watchdog);
      this.pickInFlight.delete(pageId);
    }
  }

  async countZapMatches(
    pageId: string,
    expectedDocumentEpoch: number,
    origin: string,
    selector: string,
  ): Promise<number> {
    const current = this.customizationPage(pageId, expectedDocumentEpoch);
    if (current.origin !== origin) throw new AuxError("conflict", "The site changed before Zap was saved.");
    const safe = ZapSelectorSchema.parse(selector);
    const count = await current.driver.evaluate(
      `(() => { try { return document.querySelectorAll(${JSON.stringify(safe)}).length; } catch { return -1; } })()`,
    );
    this.customizationPage(pageId, expectedDocumentEpoch);
    if (typeof count !== "number" || !Number.isInteger(count) || count < 1 || count > 100)
      throw new AuxError(
        "invalid_params",
        "Zap selector must match between 1 and 100 elements on this page.",
      );
    return count;
  }

  async applyUserCss(
    pageId: string,
    expectedDocumentEpoch: number,
    css: string,
  ): Promise<{ applied: boolean; origin: string }> {
    const { origin, driver } = this.customizationPage(pageId, expectedDocumentEpoch);
    await driver.evaluate(`(() => {
      let style = document.querySelector('style[data-aux-user-css="profile"]');
      if (!${JSON.stringify(css)}.length) { style?.remove(); return true; }
      if (!style) { style = document.createElement('style'); style.setAttribute('data-aux-user-css','profile'); (document.head || document.documentElement).append(style); }
      style.textContent = ${JSON.stringify(css)};
      return true;
    })()`);
    this.customizationPage(pageId, expectedDocumentEpoch);
    return { applied: true, origin };
  }

  /** Page console lines: the page's event log merged with the driver buffer (same timestamps, so no duplicates). */
  async console(
    pageId: string,
    opts?: { since?: number; limit?: number },
  ): Promise<{ lines: { level: string; message: string; atMs?: number }[] }> {
    const lp = this.pages.live.get(pageId);
    const dp = this.pages.driverPageLenient(pageId);
    let lines = lp?.consoleLines.slice() ?? [];
    if (dp.console) {
      const fromDriver = await dp.console();
      if (fromDriver.length) lines = mergeConsoleLines(lines, fromDriver);
    }
    if (opts?.since !== undefined) lines = lines.filter((l) => (l.atMs ?? 0) >= opts.since!);
    if (opts?.limit !== undefined) lines = lines.slice(-opts.limit);
    return { lines };
  }

  /** List or accept/dismiss the current dialog. */
  async dialog(
    pageId: string,
    action: "list" | "accept" | "dismiss" = "list",
    promptText?: string,
  ): Promise<{
    ok?: boolean;
    action?: "list" | "accept" | "dismiss";
    dialogs?: { type: string; message: string }[];
    pending?: { type: string; message: string } | null;
  }> {
    const lp = this.pages.live.get(pageId);
    if (action === "list") {
      const obs = await this.observation.observe(pageId, {});
      const dialogs = obs.content.dialogs.length
        ? obs.content.dialogs
        : lp?.lastDialog
          ? [lp.lastDialog]
          : [];
      return { action: "list", dialogs, pending: lp?.lastDialog ?? dialogs[0] ?? null };
    }
    const result = await this.executor.execute({
      pageId,
      steps: [{ id: newStepId(), op: "dialog", action, promptText }],
    });
    if (lp) lp.lastDialog = undefined;
    return { ok: result.status === "completed", action, pending: null };
  }

  /** Captured HTTP responses for the page (same store as `responses.list`). */
  async network(
    pageId: string,
    opts?: { since?: number; urlIncludes?: string; limit?: number },
  ): Promise<unknown[]> {
    this.pages.get(pageId);
    if (!this.pages.deps.responses) return [];
    await this.pages.deps.responses.flush();
    return this.pages.deps.responses.list(pageId, opts);
  }

  // ---------- find / zoom / capture ----------

  async find(pageId: string, text: string, forward: boolean, findNext: boolean) {
    if (!this.pages.deps.native.available())
      throw new AuxError("backend_unavailable", "find requires the desktop shell");
    return this.pages.deps.native.findInPage(pageId, text, forward, findNext);
  }
  async stopFind(pageId: string, action: "clear" | "keep") {
    if (!this.pages.deps.native.available()) return { ok: true };
    return this.pages.deps.native.stopFind(pageId, action);
  }
  async zoom(pageId: string, level?: number, delta?: number, reset?: boolean, direction?: "in" | "out") {
    if (!this.pages.deps.native.available())
      throw new AuxError("backend_unavailable", "zoom requires the desktop shell");
    return this.pages.deps.native.setZoom(pageId, level, delta, reset, direction);
  }
  async viewport(
    pageId: string,
  ): Promise<{ width: number; height: number; scale: number; documentEpoch: number }> {
    const dp = this.pages.driverPageLenient(pageId);
    const epoch = this.pages.get(pageId).documentEpoch;
    const value = (await dp.evaluate(
      "({width:innerWidth,height:innerHeight,scale:devicePixelRatio||1})",
    )) as { width: number; height: number; scale: number };
    if (this.pages.get(pageId).documentEpoch !== epoch)
      throw new AuxError("conflict", "The page changed while checking its viewport.");
    return { ...value, documentEpoch: epoch };
  }
  async capture(
    pageId: string,
    opts?: { fullPage?: boolean; format?: "dataUrl" | "artifact"; expectedDocumentEpoch?: number },
  ) {
    const live = this.pages.live.get(pageId);
    if (live && !live.driver) return this.capturePerson(pageId, opts);
    const dp = this.pages.driverPageLenient(pageId);
    const before = this.pages.get(pageId);
    const epoch = before.documentEpoch;
    const url = dp.url();
    if (opts?.expectedDocumentEpoch !== undefined && opts.expectedDocumentEpoch !== epoch)
      throw new AuxError("conflict", "The page changed before capture. Capture it again.");
    // Every capture can later enter chat or an external agent. Keep the raw
    // native preview path separate; model-visible and exported page captures
    // always mask editable pixels across frames.
    const shot = await dp.screenshot({ fullPage: opts?.fullPage });
    const after = this.pages.get(pageId);
    if (after.documentEpoch !== epoch || dp.url() !== url || !dp.isAttached())
      throw new AuxError("conflict", "The page changed during capture. Capture it again.");
    if (!shot.buffer.length || shot.width <= 0 || shot.height <= 0)
      throw new AuxError(
        "backend_unavailable",
        "The page has no image available yet. Open the tab and try again.",
      );
    const limited = limitCapturePng(shot.buffer);
    const { buffer, width: imageWidth, height: imageHeight } = limited;
    const scale = shot.scale * limited.ratio;
    const provenance = {
      documentEpoch: epoch,
      url,
      capturedAt: Date.now(),
      viewport: shot.viewport ?? { width: shot.width, height: shot.height, scale: shot.scale },
      ...(shot.extent ? { extent: shot.extent } : {}),
      ...(shot.fallbackReason ? { fallbackReason: shot.fallbackReason } : {}),
      imageWidth,
      imageHeight,
    };
    if (opts?.format === "artifact") {
      const a = this.pages.deps.artifacts?.save({ pageId, label: "capture", buffer, mediaType: "image/png" });
      return {
        artifactId: a?.artifactId,
        dataUrl: undefined,
        width: shot.width,
        height: shot.height,
        scale,
        ...provenance,
      };
    }
    return {
      dataUrl: `data:image/png;base64,${buffer.toString("base64")}`,
      artifactId: undefined,
      width: shot.width,
      height: shot.height,
      scale,
      ...provenance,
    };
  }

  private async capturePerson(
    pageId: string,
    opts?: { fullPage?: boolean; format?: "dataUrl" | "artifact"; expectedDocumentEpoch?: number },
  ) {
    const live = this.pages.live.get(pageId);
    if (
      !live ||
      live.driver ||
      live.target.backend !== "aux" ||
      live.target.ownedByRuntime ||
      live.target.agentIsolation
    )
      throw new AuxError("permission_denied", "This tab is unavailable for person capture.");
    const capture = this.pages.deps.native.personCapture;
    if (!this.pages.deps.native.available() || !capture)
      throw new AuxError("backend_unavailable", "Native page capture is unavailable.");
    const original = {
      documentEpoch: live.target.documentEpoch,
      controllerEpoch: live.target.controllerEpoch,
      url: live.target.url,
      windowId: live.target.windowId,
      targetId: live.target.targetId,
    };
    const current = () => {
      const target = live.target;
      if (
        this.pages.live.get(pageId) !== live ||
        this.pages.closing ||
        live.driver ||
        target.ownedByRuntime ||
        target.agentIsolation ||
        !["human", "none"].includes(target.controller) ||
        ["detached", "crashed"].includes(target.viewStatus) ||
        !this.pages.deps.native.available() ||
        target.backend !== "aux" ||
        Object.entries(original).some(([key, value]) => target[key as keyof typeof target] !== value)
      )
        throw new AuxError("target_detached", "The original page changed during capture.");
    };
    current();
    if (opts?.expectedDocumentEpoch !== undefined && opts.expectedDocumentEpoch !== original.documentEpoch)
      throw new AuxError("conflict", "The page changed before capture. Capture it again.");
    await this.pages.prepareReadPage(pageId);
    current();
    const documentId = live.personReadDocumentId,
      sessionId = live.target.sessionId;
    if (!documentId || !sessionId || !original.windowId || !original.targetId)
      throw new AuxError("target_detached", "The native page capture identity is unavailable.");
    const input = {
      pageId,
      documentId,
      sessionId,
      windowId: original.windowId,
      targetId: original.targetId,
      url: original.url,
    };
    const raw = await this.pages.personRead(live, () => capture.call(this.pages.deps.native, input));
    current();
    if (live.personReadDocumentId !== documentId || live.target.sessionId !== sessionId)
      throw new AuxError("target_detached", "The native page capture document retired.");
    const shot = NativePersonCaptureReceiptSchema.parse(raw);
    if (Object.entries(input).some(([key, value]) => shot[key as keyof typeof shot] !== value))
      throw new AuxError("ref_stale", "The native page capture belongs to another document.");
    const buffer = Buffer.from(shot.pngBase64, "base64");
    if (buffer.toString("base64") !== shot.pngBase64)
      throw new AuxError("backend_unavailable", "The native page capture has invalid image bytes.");
    const limited = limitCapturePng(buffer);
    if (buffer.readUInt32BE(16) !== shot.pixelWidth || buffer.readUInt32BE(20) !== shot.pixelHeight)
      throw new AuxError("backend_unavailable", "The native page capture dimensions disagree.");
    const provenance = {
      documentEpoch: original.documentEpoch,
      url: original.url,
      capturedAt: Date.now(),
      viewport: { width: shot.width, height: shot.height, scale: shot.scale },
      extent: { kind: "viewport" as const, width: shot.width, height: shot.height },
      ...(opts?.fullPage ? { fallbackReason: "native_viewport_only" as const } : {}),
      imageWidth: limited.width,
      imageHeight: limited.height,
    };
    if (opts?.format === "artifact") {
      const artifact = this.pages.deps.artifacts?.save({
        pageId,
        label: "capture",
        buffer: limited.buffer,
        mediaType: "image/png",
      });
      return {
        artifactId: artifact?.artifactId,
        dataUrl: undefined,
        width: shot.width,
        height: shot.height,
        scale: shot.scale * limited.ratio,
        ...provenance,
      };
    }
    return {
      dataUrl: `data:image/png;base64,${limited.buffer.toString("base64")}`,
      artifactId: undefined,
      width: shot.width,
      height: shot.height,
      scale: shot.scale * limited.ratio,
      ...provenance,
    };
  }
}

function mergeConsoleLines(
  a: { level: string; message: string; atMs?: number }[],
  b: { level: string; message: string; atMs?: number }[],
): { level: string; message: string; atMs?: number }[] {
  const seen = new Set(a.map((l) => `${l.level}|${l.message}|${l.atMs ?? 0}`));
  const out = a.slice();
  for (const line of b) {
    const key = `${line.level}|${line.message}|${line.atMs ?? 0}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}
