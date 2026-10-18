import type { DesktopContextRemoval } from "./desktop-context-retirement.js";
import {
  DesktopContextQuotesSchema,
  type DesktopContextQuote,
} from "@aux/contracts/desktop-context-admission";
import { MemoryRecall } from "./memory-recall.js";
import { AuxError } from "@aux/contracts";
import { digest } from "@aux/contracts/util/digest";
import {
  desktopContextExcludedApps,
  DesktopContextCaptureSchema,
  DesktopContextReadSchema,
  DesktopContextSearchSchema,
  DesktopContextSettingsSchema,
  type DesktopContextCapture,
  type DesktopContextNativePort,
  type DesktopContextRead,
  type DesktopContextSearch,
  type DesktopContextSearchResult,
  type DesktopContextSettings,
  type DesktopContextSnapshot,
  type DesktopContextSource,
} from "@aux/contracts/desktop-context";
import type { DesktopContextStore } from "./desktop-context-store.js";

export type DesktopContextDependencies = {
  store: DesktopContextStore;
  native: DesktopContextNativePort;
  /** Final shutdown only: the original authenticated native channel has permanently closed. */
  nativeOwnerDisconnected?(): boolean;
  settings(): DesktopContextSettings;
  saveSettings(settings: DesktopContextSettings): void;
  workspaceEligible(workspaceId: string): boolean;
  sourceEligible(capture: DesktopContextCapture): boolean;
  beforeRemoval(scope: DesktopContextRemoval): Promise<void>;
  beforeChange?(scope: DesktopContextRemoval): Promise<void>;
  changed(): void;
  now?: () => number;
};
const source = (capture: DesktopContextCapture): DesktopContextSource => {
  const {
    text: _text,
    selection: _selection,
    ...metadata
  } = DesktopContextCaptureSchema.strip().parse(capture);
  return metadata;
};
const fail = (message = "Desktop context changed; refresh and try again."): never => {
  throw new AuxError("conflict", message);
};
const normalized = (value: string) => value.normalize("NFKC").replace(/\s+/gu, " ").trim();

/** Capture has no model/network path. Existing governed runs may consume exact source reads. */
export class DesktopContextService {
  private readonly recall = new MemoryRecall();
  private epoch = 0;
  private closed = false;
  private retiring = false;
  private serial: Promise<unknown> = Promise.resolve();
  private work = new Set<{ controller: AbortController; done: Promise<unknown> }>();
  private recent = new Map<string, { text: string; at: number }>();
  private polling?: Promise<void>;
  private starting = new Set<Promise<void>>();
  private closing?: Promise<void>;
  constructor(private readonly deps: DesktopContextDependencies) {}
  private now() {
    return this.deps.now?.() ?? Date.now();
  }
  private settings() {
    return DesktopContextSettingsSchema.parse(this.deps.settings());
  }
  private enqueue<T>(action: () => Promise<T>): Promise<T> {
    const guarded = () => {
      this.checkOpen();
      return action();
    };
    const pending = this.serial.then(guarded, guarded);
    this.serial = pending.catch(() => {});
    return pending;
  }
  private checkOpen() {
    if (this.closed) throw new AuxError("cancelled", "Desktop context is closed.");
  }
  private async checkOwner(checkOwner: () => Promise<void>) {
    this.checkOpen();
    await checkOwner();
    this.checkOpen();
  }
  private check(
    epoch: number,
    settings: DesktopContextSettings,
    workspaceId?: string,
    signal?: AbortSignal,
    inspection = false,
  ) {
    const current = this.settings();
    if (this.closed || this.epoch !== epoch || signal?.aborted || current.revision !== settings.revision)
      fail();
    if (
      !current.enabled ||
      (current.paused && !inspection) ||
      !current.workspaceId ||
      (workspaceId && current.workspaceId !== workspaceId) ||
      !this.deps.workspaceEligible(current.workspaceId)
    )
      throw new AuxError("permission_denied", "Desktop context is off, paused, or its Space is unavailable.");
  }
  private eligible(capture: DesktopContextCapture, settings: DesktopContextSettings) {
    return (
      !desktopContextExcludedApps.includes(capture.app.bundleId) &&
      capture.workspaceId === settings.workspaceId &&
      capture.expiresAt > this.now() &&
      capture.capturedAt <= this.now() + 5000 &&
      capture.expiresAt === capture.capturedAt + 14 * 86400000 &&
      settings.selectedApps.some((app) => app.bundleId === capture.app.bundleId) &&
      (!settings.ocrEnabled ? capture.kind !== "ocr" : true) &&
      this.deps.sourceEligible(capture)
    );
  }
  private async trusted(
    settings: DesktopContextSettings,
    epoch: number,
    workspaceId: string,
    signal?: AbortSignal,
    inspection = false,
  ) {
    const status = await this.deps.native.status();
    this.check(epoch, settings, workspaceId, signal, inspection);
    if (
      !status.supported ||
      !status.accessibilityTrusted ||
      (status.phase === "running" && !status.leaseId) ||
      status.configurationRevision !== settings.revision ||
      ["off", "permission-required", ...(!inspection ? ["paused"] : []), "locked", "unavailable"].includes(
        status.phase,
      )
    )
      throw new AuxError("permission_denied", "Desktop context is suspended or OS access is unavailable.");
  }
  private owned<T>(
    workspaceId: string,
    signal: AbortSignal | undefined,
    checkOwner: (() => void) | undefined,
    action: (
      settings: DesktopContextSettings,
      check: () => void,
      publish: (captures: DesktopContextCapture[]) => void,
      signal: AbortSignal,
    ) => Promise<T>,
    inspection = false,
    inventorySnapshot = true,
  ): Promise<T> {
    const settings = this.settings();
    const epoch = this.epoch;
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) controller.abort();
    const check = () => {
      this.check(epoch, settings, workspaceId, controller.signal, inspection);
      checkOwner?.();
    };
    const done = (async () => {
      check();
      await this.trusted(settings, epoch, workspaceId, controller.signal, inspection);
      const revision = this.deps.store.revision(workspaceId);
      let published: DesktopContextCapture[] = [];
      let sourceVersions: (string | undefined)[] = [];
      const result = await action(
        settings,
        check,
        (captures) => {
          published = captures;
          sourceVersions = captures.map((capture) =>
            this.deps.store.sourceVersion(workspaceId, capture.captureId),
          );
        },
        controller.signal,
      );
      await this.trusted(settings, epoch, workspaceId, controller.signal, inspection);
      check();
      if (
        (inventorySnapshot && this.deps.store.revision(workspaceId) !== revision) ||
        published.some(
          (capture, index) =>
            !this.eligible(capture, settings) ||
            !sourceVersions[index] ||
            this.deps.store.sourceVersion(workspaceId, capture.captureId) !== sourceVersions[index],
        )
      )
        fail("Desktop sources changed or expired before publication.");
      return result;
    })();
    const entry = { controller, done };
    this.work.add(entry);
    void done
      .finally(() => {
        this.work.delete(entry);
        signal?.removeEventListener("abort", abort);
      })
      .catch(() => {});
    return done;
  }
  async snapshot(): Promise<DesktopContextSnapshot> {
    const settings = this.settings();
    const status = await this.deps.native.status();
    if (settings.revision !== this.settings().revision) fail();
    return {
      settings,
      status,
      ...(settings.workspaceId
        ? this.deps.store.stats(settings.workspaceId)
        : { storedCount: 0, storedBytes: 0 }),
    };
  }
  async apps(ownerToken: string) {
    return (await this.deps.native.apps(ownerToken))
      .filter((app) => !desktopContextExcludedApps.includes(app.bundleId))
      .slice(0, 200);
  }
  /** No prompting on startup. Native saved consent must match before attaching. */
  start(): Promise<void> {
    const pending = this.startOwned();
    this.starting.add(pending);
    void pending.finally(() => this.starting.delete(pending)).catch(() => {});
    return pending;
  }
  private async startOwned() {
    this.checkOpen();
    const epoch = this.epoch;
    const check = () => {
      this.checkOpen();
      if (this.epoch !== epoch) fail("Original desktop startup was retired.");
    };
    await this.deps.store.retireKeys();
    check();
    const settings = this.settings();
    if (
      settings.enabled &&
      !settings.paused &&
      settings.workspaceId &&
      this.deps.workspaceEligible(settings.workspaceId)
    )
      await this.deps.native.attach(settings);
    check();
    this.retiring = false;
  }
  async reconcilePolicy() {
    this.checkOpen();
    await this.retire();
    await this.start();
  }
  private abortWork() {
    this.retiring = true;
    this.epoch++;
    this.recent.clear();
    this.recall.invalidate();
    const original = [...this.work];
    for (const entry of original) entry.controller.abort();
    return original.map((entry) => entry.done);
  }
  private async retire(finalShutdown = false) {
    const original = this.abortWork();
    const disconnected = () => finalShutdown && this.deps.nativeOwnerDisconnected?.() === true;
    try {
      if (!disconnected()) await this.deps.native.stop();
    } catch (error) {
      // Only the original transport's permanent close proves the producer retired.
      // Live pause/Forget and ordinary backend failures still need a stop receipt.
      if (!disconnected()) throw error;
    } finally {
      await Promise.allSettled(original);
    }
  }
  async configure(
    expectedRevision: number,
    raw: DesktopContextSettings,
    ownerToken: string,
    checkOwner: () => Promise<void>,
  ) {
    return this.enqueue(async () => {
      const previous = this.settings();
      if (previous.revision !== expectedRevision || raw.revision !== expectedRevision) fail();
      const settings = DesktopContextSettingsSchema.parse({ ...raw, revision: expectedRevision + 1 });
      if (settings.selectedApps.some((app) => desktopContextExcludedApps.includes(app.bundleId)))
        throw new AuxError(
          "permission_denied",
          "Credential stores and browser apps cannot be desktop context sources.",
        );
      if (settings.workspaceId && !this.deps.workspaceEligible(settings.workspaceId))
        throw new AuxError("permission_denied", "Choose an available normal Space.");
      await this.checkOwner(checkOwner);
      await this.retire();
      await this.checkOwner(checkOwner);
      if (previous.workspaceId) await this.deps.beforeChange?.({ workspaceId: previous.workspaceId });
      await this.checkOwner(checkOwner);
      if (previous.workspaceId) {
        for (const app of previous.selectedApps.filter(
          (app) => !settings.selectedApps.some((selected) => selected.bundleId === app.bundleId),
        ))
          await this.deps.store.forgetScope(previous.workspaceId, app.bundleId, async () => {
            await this.checkOwner(checkOwner);
            await this.deps.beforeRemoval({
              workspaceId: previous.workspaceId!,
              appBundleIds: [app.bundleId],
            });
          });
      }
      try {
        const status = await this.deps.native.configure(settings, ownerToken);
        this.checkOpen();
        await this.checkOwner(checkOwner);
        if (
          this.settings().revision !== expectedRevision ||
          status.configurationRevision !== settings.revision
        )
          fail();
        this.deps.saveSettings(settings);
        this.retiring = false;
      } catch (error) {
        await this.deps.native.stop();
        throw error;
      }
      this.deps.changed();
      return this.snapshot();
    });
  }
  async pause(
    expectedRevision: number,
    paused: boolean,
    ownerToken: string,
    checkOwner: () => Promise<void>,
  ) {
    return this.configure(expectedRevision, { ...this.settings(), paused }, ownerToken, checkOwner);
  }
  async permission(
    expectedRevision: number,
    kind: "accessibility" | "ocr-picker",
    ownerToken: string,
    checkOwner: () => Promise<void>,
  ) {
    const settings = this.settings();
    if (
      settings.revision !== expectedRevision ||
      !settings.enabled ||
      (kind === "ocr-picker" && !settings.ocrEnabled)
    )
      fail();
    await this.checkOwner(checkOwner);
    await this.deps.native.permission(kind, expectedRevision, ownerToken);
    await this.checkOwner(checkOwner);
    if (this.settings().revision !== expectedRevision) fail();
    return this.snapshot();
  }
  /** Idle/event hook; bounded native queue is acknowledged only after durable encryption. */
  poll(): Promise<void> {
    if (this.polling) return this.polling;
    const epoch = this.epoch;
    const settings = this.settings();
    this.polling = this.enqueue(async () => {
      if (settings.workspaceId && !this.deps.workspaceEligible(settings.workspaceId)) {
        await this.retire();
        return;
      }
      this.check(epoch, settings);
      const status = await this.deps.native.status();
      this.check(epoch, settings);
      if (!status.leaseId || !status.accessibilityTrusted || status.phase !== "running") return;
      const raw = await this.deps.native.take(status.leaseId);
      this.check(epoch, settings);
      if (!raw) return;
      const capture = DesktopContextCaptureSchema.parse(raw);
      const check = () => {
        this.check(epoch, settings, capture.workspaceId);
        if (!this.eligible(capture, settings)) fail("This desktop source is no longer eligible.");
      };
      check();
      if (
        capture.leaseId !== status.leaseId ||
        capture.configurationRevision !== settings.revision ||
        capture.capturedAt < this.now() - 60000 ||
        digest(capture.text + "\0" + capture.selection) !== capture.sha256
      )
        fail("Desktop capture admission identity differs.");
      if (!(await this.deps.native.validate(source(capture))))
        fail("Desktop capture foreground ownership changed.");
      check();
      const text = normalized(capture.text + "\0" + capture.selection);
      const prior = this.recent.get(capture.app.bundleId);
      const duplicate =
        prior?.text === text ||
        (prior && this.now() - prior.at < 15000) ||
        (prior && this.nearDuplicate(prior.text, text));
      if (!duplicate) {
        // The native validation must survive the key lookup; validate again immediately
        // before append and fence the synchronous commit with the original epoch.
        if (!(await this.deps.native.validate(source(capture)))) fail();
        await this.deps.store.append(capture, check, async () => {
          if (!(await this.deps.native.validate(source(capture)))) fail();
          check();
        });
        this.recent.set(capture.app.bundleId, { text, at: this.now() });
        this.deps.changed();
      }
      check();
      await this.deps.native.acknowledge(capture.leaseId, capture.captureId);
    }).finally(() => {
      this.polling = undefined;
    });
    return this.polling;
  }
  private nearDuplicate(left: string, right: string) {
    const [leftText, leftSelection] = left.split("\0"),
      [rightText, rightSelection] = right.split("\0");
    if (
      leftSelection !== rightSelection ||
      !leftText ||
      !rightText ||
      Math.min(leftText.length, rightText.length) / Math.max(leftText.length, rightText.length) < 0.98
    )
      return false;
    const a = new Set(leftText.split(/\s+/u)),
      b = new Set(rightText.split(/\s+/u));
    return [...a].filter((word) => b.has(word)).length / new Set([...a, ...b]).size >= 0.98;
  }
  sources(
    workspaceId: string,
    appBundleId?: string,
    cursor?: string,
    limit = 50,
    signal?: AbortSignal,
    checkOwner?: () => void,
    inspection = false,
  ) {
    return this.owned(
      workspaceId,
      signal,
      checkOwner,
      async (settings, check, publish) => {
        const captures = (await this.deps.store.read(workspaceId, check)).filter(
          (capture) =>
            this.eligible(capture, settings) && (!appBundleId || capture.app.bundleId === appBundleId),
        );
        const page = this.page(
          captures,
          cursor,
          limit,
          digest(JSON.stringify({ revision: settings.revision, workspaceId, appBundleId })),
        );
        publish(page.items);
        return { items: page.items.map(source), nextCursor: page.nextCursor };
      },
      inspection,
    );
  }
  private page<T extends { captureId: string; sha256: string }>(
    items: T[],
    cursor: string | undefined,
    limit: number,
    query: string,
  ) {
    const inventory = digest(items.map((item) => `${item.captureId}:${item.sha256}`).join("\n"));
    let offset = 0;
    if (cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
        if (
          decoded.query !== query ||
          decoded.inventory !== inventory ||
          !Number.isSafeInteger(decoded.offset) ||
          decoded.offset < 0
        )
          fail();
        offset = decoded.offset;
      } catch {
        fail("Desktop source pagination changed; start again.");
      }
    }
    const count = Math.max(1, Math.min(50, limit));
    return {
      items: items.slice(offset, offset + count),
      nextCursor:
        offset + count < items.length
          ? Buffer.from(JSON.stringify({ query, inventory, offset: offset + count })).toString("base64url")
          : null,
    };
  }
  search(
    raw: DesktopContextSearch,
    signal?: AbortSignal,
    checkOwner?: () => void,
    inspection = false,
  ): Promise<DesktopContextSearchResult> {
    const input = DesktopContextSearchSchema.parse(raw);
    return this.owned(
      input.workspaceId,
      signal,
      checkOwner,
      async (settings, check, publish, originalSignal) => {
        const captures = (await this.deps.store.read(input.workspaceId, check)).filter(
          (capture) =>
            this.eligible(capture, settings) &&
            (!input.appBundleIds || input.appBundleIds.includes(capture.app.bundleId)),
        );
        const byId = new Map(captures.map((capture) => [capture.captureId, capture]));
        const result = await this.recall.search(
          captures.map((capture) => ({
            sourceId: capture.captureId,
            kind: "desktop" as const,
            path: `desktop/${capture.app.bundleId}/${capture.captureId}`,
            title: capture.windowTitle || capture.app.displayName,
            text: capture.text,
            revision: `${settings.revision}:${capture.sha256}`,
            sha256: capture.sha256,
            updatedAt: capture.capturedAt,
            url: capture.documentUrl,
            sourceRefs: [],
          })),
          {
            workspaceId: input.workspaceId,
            queries: input.queries,
            from: input.from,
            to: input.to,
            limit: input.limit,
            cursor: input.cursor,
            mode: input.mode,
          },
          originalSignal,
          check,
        );
        const published = result.matches.map((match) => byId.get(match.sourceId)!);
        publish(published);
        return {
          items: result.matches.map((match) => ({
            source: source(byId.get(match.sourceId)!),
            startLine: match.startLine,
            endLine: match.endLine,
            text: match.text,
            score: match.score,
          })),
          nextCursor: result.nextCursor,
          mode: result.mode,
          modelId: result.modelId,
          fallbackReason: result.fallbackReason,
          truncated: Boolean(result.fallbackReason && result.mode === "semantic"),
        };
      },
      inspection,
    );
  }
  read(raw: DesktopContextRead, signal?: AbortSignal, checkOwner?: () => void, inspection = false) {
    const input = DesktopContextReadSchema.parse(raw);
    return this.owned(
      input.workspaceId,
      signal,
      checkOwner,
      async (settings, check, publish) => {
        const capture = (await this.deps.store.read(input.workspaceId, check)).find(
          (item) =>
            item.captureId === input.captureId &&
            item.sha256 === input.sha256 &&
            this.eligible(item, settings),
        );
        if (!capture) throw new AuxError("not_found", "Desktop source expired, changed, or was forgotten.");
        const lines = capture.text.split("\n");
        const start = input.startLine - 1;
        check();
        publish([capture]);
        return {
          source: source(capture),
          text: lines.slice(start, start + input.limitLines).join("\n"),
          selection: capture.selection,
          startLine: input.startLine,
          endLine: Math.min(lines.length, start + input.limitLines),
          totalLines: lines.length,
        };
      },
      inspection,
    );
  }
  /** Durable tool results contain recipes only; quotes are hydrated for each actual model request. */
  async modelSearch(raw: DesktopContextSearch, signal: AbortSignal, checkOwner: () => void) {
    const revision = this.settings().revision;
    const result = await this.search(raw, signal, checkOwner);
    if (this.settings().revision !== revision) fail();
    const quotes = await this.quoteRecipes(
      raw.workspaceId,
      result.items.map((item) => ({ ...item, includeSelection: false })),
      signal,
      checkOwner,
    );
    return { ...result, items: quotes.map((quote, index) => ({ quote, score: result.items[index]!.score })) };
  }
  async modelRead(raw: DesktopContextRead, signal: AbortSignal, checkOwner: () => void) {
    const revision = this.settings().revision;
    const result = await this.read(raw, signal, checkOwner);
    if (this.settings().revision !== revision) fail();
    const [quote] = await this.quoteRecipes(
      raw.workspaceId,
      [{ ...result, includeSelection: true }],
      signal,
      checkOwner,
    );
    return { quote: quote!, totalLines: result.totalLines };
  }
  private quoteRecipes(
    workspaceId: string,
    items: {
      source: DesktopContextSource;
      text: string;
      selection?: string;
      startLine: number;
      endLine: number;
      includeSelection: boolean;
    }[],
    signal: AbortSignal,
    checkOwner: () => void,
  ) {
    return this.owned(
      workspaceId,
      signal,
      checkOwner,
      async (settings, check, publish) => {
        const captures = await this.deps.store.read(
          workspaceId,
          check,
          items.map((item) => item.source.captureId),
        );
        const quotes = items.map((item) => {
          const capture = captures.find(
            (capture) => capture.captureId === item.source.captureId && capture.sha256 === item.source.sha256,
          );
          if (!capture || !this.eligible(capture, settings))
            throw new AuxError("ref_stale", "The desktop quote source retired.");
          const lines = capture.text.split("\n");
          if (item.startLine > lines.length || !item.text)
            throw new AuxError("invalid_params", "Choose existing nonempty desktop source lines.");
          const first = lines
            .slice(0, item.startLine - 1)
            .reduce((offset, line) => offset + line.length + 1, 0);
          const startOffset = capture.text.indexOf(item.text, first),
            endOffset = startOffset + item.text.length;
          const through = lines.slice(0, item.endLine).join("\n").length;
          const version = this.deps.store.sourceVersion(workspaceId, capture.captureId);
          if (
            !version ||
            startOffset < first ||
            endOffset > through ||
            (item.includeSelection && item.selection !== capture.selection)
          )
            fail("The exact desktop quote changed.");
          return {
            workspaceId,
            captureId: capture.captureId,
            sha256: capture.sha256,
            version,
            appBundleId: capture.app.bundleId,
            expiresAt: capture.expiresAt,
            consentRevision: settings.revision,
            startLine: item.startLine,
            endLine: item.endLine,
            startOffset,
            endOffset,
            includeSelection: item.includeSelection,
            quoteSha256: digest(JSON.stringify([item.text, item.includeSelection ? capture.selection : ""])),
          };
        });
        check();
        publish(captures);
        return DesktopContextQuotesSchema.parse(quotes);
      },
      false,
      false,
    );
  }
  assertQuotes(raw: readonly DesktopContextQuote[]) {
    const quotes = DesktopContextQuotesSchema.parse(raw),
      settings = this.settings();
    if (this.retiring) throw new AuxError("cancelled", "The desktop source owner is retiring.");
    for (const quote of quotes) {
      this.check(this.epoch, settings, quote.workspaceId);
      if (
        quote.consentRevision !== settings.revision ||
        quote.expiresAt <= this.now() ||
        !settings.selectedApps.some((app) => app.bundleId === quote.appBundleId) ||
        this.deps.store.sourceVersion(quote.workspaceId, quote.captureId) !== quote.version
      )
        fail("An admitted desktop source changed or was forgotten.");
    }
  }
  materializeQuotes(raw: readonly DesktopContextQuote[], signal: AbortSignal, checkOwner: () => void) {
    const quotes = DesktopContextQuotesSchema.parse(raw);
    this.assertQuotes(quotes);
    const workspaceId = quotes[0]?.workspaceId;
    if (!workspaceId) return Promise.resolve([]);
    if (quotes.some((quote) => quote.workspaceId !== workspaceId))
      throw new AuxError("permission_denied", "Desktop quotes must belong to one original Space.");
    return this.owned(
      workspaceId,
      signal,
      checkOwner,
      async (settings, check, publish) => {
        const captures = await this.deps.store.read(
          workspaceId,
          check,
          quotes.map((quote) => quote.captureId),
        );
        const output = quotes.map((quote) => {
          const capture = captures.find(
            (capture) => capture.captureId === quote.captureId && capture.sha256 === quote.sha256,
          );
          if (!capture || !this.eligible(capture, settings))
            throw new AuxError("ref_stale", "An admitted desktop source retired.");
          const text = capture.text.slice(quote.startOffset, quote.endOffset),
            selection = quote.includeSelection ? capture.selection : "";
          if (digest(JSON.stringify([text, selection])) !== quote.quoteSha256)
            fail("The admitted desktop quote does not match its exact recipe.");
          return { quote, source: source(capture), text, selection };
        });
        this.assertQuotes(quotes);
        check();
        publish(captures);
        return output;
      },
      false,
      false,
    );
  }
  async forget(
    workspaceId: string,
    expectedRevision: number,
    appBundleId?: string,
    captureId?: string,
    checkOwner: () => Promise<void> = async () => {},
    ownerToken = "",
  ) {
    this.checkOpen();
    await this.retire();
    return this.enqueue(async () => {
      await this.checkOwner(checkOwner);
      if (this.settings().revision !== expectedRevision) fail();
      const beforeRemoval = async () => {
        await this.checkOwner(checkOwner);
        const appBundleIds = appBundleId
          ? [appBundleId]
          : captureId
            ? (await this.deps.store.read(workspaceId))
                .filter((capture) => capture.captureId === captureId)
                .map((capture) => capture.app.bundleId)
            : undefined;
        await this.deps.beforeRemoval({ workspaceId, appBundleIds });
      };
      const removed = captureId
        ? await this.deps.store.remove(
            workspaceId,
            (capture) =>
              (!appBundleId || capture.app.bundleId === appBundleId) && capture.captureId === captureId,
            beforeRemoval,
          )
        : await this.deps.store.forgetScope(workspaceId, appBundleId, beforeRemoval);
      this.deps.changed();
      // Forget leaves native collection stopped. The owner must explicitly resume it.
      const current = this.settings();
      const settings = { ...current, revision: current.revision + 1, paused: true };
      await this.checkOwner(checkOwner);
      await this.deps.native.configure(settings, ownerToken);
      this.checkOpen();
      this.deps.saveSettings(settings);
      return { removed, ...(await this.snapshot()) };
    });
  }
  async expire() {
    this.checkOpen();
    if (!this.deps.store.expiredCount(this.now())) return { removed: 0 };
    await this.retire();
    return this.enqueue(async () => {
      let removed = 0;
      for (const workspaceId of this.deps.store.workspaceIds())
        removed += await this.deps.store.remove(
          workspaceId,
          (capture) => capture.expiresAt <= this.now(),
          async () => {
            const expired = (await this.deps.store.read(workspaceId)).filter(
              (capture) => capture.expiresAt <= this.now(),
            );
            await this.deps.beforeRemoval({
              workspaceId,
              appBundleIds: [...new Set(expired.map((capture) => capture.app.bundleId))],
            });
          },
        );
      await this.start();
      return { removed };
    });
  }
  async retireWorkspace(workspaceId: string) {
    this.checkOpen();
    if (this.settings().workspaceId === workspaceId) await this.retire();
  }
  shutdown(): Promise<void> {
    if (this.closing) return this.closing;
    this.closed = true;
    this.abortWork();
    this.closing = (async () => {
      const failures: unknown[] = [];
      // A prior configure/attach must settle before the final stop; it cannot
      // re-enable capture after that stop has been acknowledged.
      await Promise.allSettled([this.serial, ...this.starting]);
      try {
        await this.retire(true);
      } catch (error) {
        failures.push(error);
      }
      try {
        await this.recall.close();
      } catch (error) {
        failures.push(error);
      }
      if (failures.length === 1) throw failures[0];
      if (failures.length) throw new AggregateError(failures, "Desktop context shutdown awaits cleanup.");
    })();
    return this.closing;
  }
}
