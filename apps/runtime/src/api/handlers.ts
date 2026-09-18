import { EventTypes, MethodSchemas, newProgramId, VectorError, type MethodName } from "@vector/contracts";
import type { PageService } from "../services/pages.js";
import type { SetService } from "../services/sets.js";
import type { RunService } from "../services/runs.js";
import type { ArtifactStore } from "../services/artifacts.js";
import type { SettingsService } from "../services/settings.js";
import type { ResponseStore } from "../services/responses.js";
import type { OperationService } from "../services/operations.js";
import type { StateService } from "../services/state.js";
import type { Tracer } from "../services/tracing.js";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";
import type { EngineAvailability } from "@vector/browser-driver";
import { compactObservation } from "../services/observation-render.js";
import type { DriverSet } from "../services/pages.js";
import type { Router } from "../services/router.js";

export interface Services {
  pages: PageService;
  sets: SetService;
  runs: RunService;
  artifacts: ArtifactStore;
  settings: SettingsService;
  events: EventBus;
  repo: Repo;
  responses?: ResponseStore;
  operations?: OperationService;
  state?: StateService;
  tracer?: Tracer;
  drivers: () => DriverSet;
  /** engine router + native availability, for runtime.describe (absent = engine off) */
  router?: Router;
  engine?: () => EngineAvailability;
  chromeAttach: (port: number) => Promise<unknown>;
  chromeDetach: () => Promise<unknown>;
  chromeTabs: () => Promise<unknown>;
  importCookies: (opts: { source?: "auto" | "attached" | "profile" }) => Promise<unknown>;
  benchRun: (task?: string, repeats?: number) => Promise<unknown>;
}

/** Validates params against MethodSchemas and dispatches to services. */
export function makeInvoker(s: Services) {
  return async function invoke(method: string, rawParams: unknown): Promise<unknown> {
    const schema = MethodSchemas[method as MethodName];
    if (!schema) throw new VectorError("not_found", `unknown method ${method}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = schema.parse(rawParams ?? {});

    switch (method as MethodName) {
      // pages
      case "pages.list": return s.pages.list(params as never);
      case "pages.open": return s.pages.open(params as never);
      case "pages.close": return s.pages.close(params.pageId);
      case "pages.activate": return s.pages.activate(params.pageId);
      case "pages.navigate": return s.pages.navigate(params.pageId, params["url" as never]);
      case "pages.back": return s.pages.back(params.pageId);
      case "pages.forward": return s.pages.forward(params.pageId);
      case "pages.reload": return s.pages.reload(params.pageId);
      case "pages.stop": return s.pages.stop(params.pageId);
      case "pages.observe": {
        const { format, ...req } = params as { format?: "full" | "compact" } & Record<string, unknown>;
        const obs = await s.pages.observe(params.pageId, req as never);
        return format === "compact" ? { observation: compactObservation(obs) } : obs;
      }
      case "pages.execute": {
        // `call` nodes dispatch through PageService's operation-registry
        // hook ("host/name" explicitly, or bare name → page's host).
        // API callers hold the bearer token and author the program directly —
        // a trusted source, so evaluate/eval stay available to them.
        const p = params as { program: { pageId: string }; returnObservation?: { format?: "full" | "compact" } & Record<string, unknown> };
        // act-and-observe (speed P0-2): the caller sees the resulting state in
        // the same round trip — one native call on the engine backend, a
        // same-lane follow-up observe on Chromium (PageService.execute).
        const { format, ...req } = p.returnObservation ?? {};
        const { observation, ...result } = await s.pages.execute(p.program as never, { allowEval: true }, {
          returnObservation: p.returnObservation ? (req as never) : undefined,
        });
        if (!p.returnObservation) return result;
        return { ...result, observation: observation ? (format === "compact" ? compactObservation(observation) : observation) : undefined };
      }
      case "pages.engineInput": {
        const p = params as {
          pageId: string;
          type: string;
          x?: number;
          y?: number;
          button?: number;
          key?: string;
          text?: string;
          direction?: "up" | "down" | "top" | "bottom";
          amount?: number;
          start?: number;
          end?: number;
          width?: number;
          height?: number;
          name?: string;
        };
        await s.pages.onEngineInput(p.pageId, p);
        return { ok: true };
      }
      case "pages.scene": return s.pages.scene(params.pageId);
      case "pages.capture": return s.pages.capture(params.pageId, params as never);
      case "pages.find": {
        const p = params as { pageId: string; text: string; forward: boolean; findNext: boolean };
        return s.pages.find(p.pageId, p.text, p.forward, p.findNext);
      }
      case "pages.stopFind": {
        const p = params as { pageId: string; action: "clear" | "keep" };
        return s.pages.stopFind(p.pageId, p.action);
      }
      case "pages.zoom": {
        const p = params as { pageId: string; level?: number; delta?: number; reset?: boolean };
        return s.pages.zoom(p.pageId, p.level, p.delta, p.reset);
      }
      case "pages.takeover": return s.pages.takeover(params.pageId);
      case "pages.resume": return s.pages.resume(params.pageId);
      case "pages.openLive": {
        const page = s.pages.get(params.pageId);
        const chrome = s.drivers().chrome;
        if (page.backend === "chrome" && chrome?.activateTarget) {
          await chrome.activateTarget(page.targetId);
          return { ok: true };
        }
        if (page.backend === "vector" || page.backend === "vector-engine") {
          await s.pages.activate(page.pageId);
          return { ok: true };
        }
        throw new VectorError("capability_unsupported", `cannot focus a ${page.backend} page's native surface`);
      }

      // sets
      case "sets.create": return s.sets.create(params as never);
      case "sets.get": return s.sets.get(params.setId);
      case "sets.list": return s.sets.list();
      case "sets.map": return s.runs.mapSet(params as never);
      case "sets.results": {
        const p = params as { setId: string; status?: "ok" | "partial" | "error" };
        return s.sets.results(p.setId, p.status);
      }

      // runs
      case "runs.start": return s.runs.start(params as never);
      case "runs.get": {
        const run = s.runs.coordinator.get(params.runId);
        return {
          run,
          steps: s.repo.listSteps(run.runId),
          modelCalls: s.repo.listModelCalls(run.runId).length,
        };
      }
      case "runs.list": return s.runs.coordinator.list((params as { limit?: number }).limit ?? 50);
      case "runs.pause": return s.runs.pause(params.runId);
      case "runs.resume": return s.runs.resume(params.runId);
      case "runs.cancel": return s.runs.cancel(params.runId);
      case "runs.answer": {
        const p = params as { runId: string; answer: string };
        return s.runs.coordinator.answer(p.runId, p.answer);
      }
      case "runs.events":
      case "events.since": {
        const p = params as { runId?: string; sinceSeq: number; limit: number };
        return s.events.since(p.sinceSeq, p.limit, p.runId);
      }

      // artifacts
      case "artifacts.list": return s.artifacts.list(params as never);
      case "artifacts.read": return s.artifacts.read(params.artifactId);

      // programs
      case "programs.list": return s.repo.listPrograms();
      case "programs.run": return s.runs.runProgram(params as never);
      case "programs.save": {
        const p = params as { name: string; description?: string; siteKey: string; steps?: unknown[]; nodes?: unknown[]; parameters: string[] };
        if (!p.steps?.length && !p.nodes?.length)
          throw new VectorError("invalid_params", "programs.save needs steps or nodes");
        const program = {
          programId: newProgramId(),
          name: p.name,
          description: p.description,
          version: 1,
          siteKey: p.siteKey,
          parameters: p.parameters,
          // stepsJson holds {steps,nodes} — legacy rows hold a bare steps array
          stepsJson: JSON.stringify(p.nodes?.length ? { steps: p.steps ?? [], nodes: p.nodes } : (p.steps ?? [])),
          useCount: 0,
          createdAt: Date.now(),
        };
        s.repo.saveProgram(program);
        return program;
      }
      case "programs.delete": {
        s.repo.deleteProgram(params.programId);
        return { ok: true };
      }

      // sessions / chrome
      case "sessions.list": return s.repo.listSessions();
      case "chrome.attach": return s.chromeAttach((params as { port: number }).port);
      case "chrome.detach": return s.chromeDetach();
      case "chrome.tabs": return s.chromeTabs();
      case "chrome.importCookies": return s.importCookies(params);
      case "chrome.openLive": {
        const page = s.pages.get(params.pageId);
        const chrome = s.drivers().chrome;
        if (page.backend !== "chrome") throw new VectorError("invalid_params", "not a chrome page");
        await chrome?.activateTarget?.(page.targetId);
        return { ok: true };
      }

      // models / settings
      case "models.list": return s.settings.listModels();
      case "models.probe": return s.settings.probe((params as { modelId?: string }).modelId);
      case "settings.get": return s.settings.all();
      case "settings.set": {
        const r = s.settings.set(params as never);
        // worker limits apply live — no restart needed
        s.runs.refreshPool();
        s.events.emit(EventTypes.SettingsChanged, { settings: s.settings.all() });
        return r;
      }

      // history / bookmarks
      case "history.list": {
        const p = params as { query?: string; limit: number };
        return s.repo.listHistory(p.query, p.limit);
      }
      case "history.clear": {
        s.repo.clearHistory();
        return { ok: true };
      }
      case "bookmarks.list": return s.repo.listBookmarks();
      case "bookmarks.add": {
        const p = params as { url: string; title: string };
        s.repo.addBookmark(p.url, p.title);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return { ok: true };
      }
      case "bookmarks.remove": {
        s.repo.removeBookmark((params as { url: string }).url);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return { ok: true };
      }
      case "downloads.list": return s.repo.listDownloads();

      case "workspace.get":
        return {
          pages: s.pages.list(),
          sets: s.sets.list(),
          members: s.sets.list().flatMap((set) => s.repo.listMembers(set.setId)),
          runs: s.runs.coordinator.list(50),
          sessions: s.repo.listSessions(),
          activePageId: s.pages.activePageId,
          lastSeq: s.repo.lastSeq(),
        };

      case "bench.run": {
        const p = params as { task?: string; repeats?: number };
        return s.benchRun(p.task, p.repeats);
      }

      // ---- runtime-vnext: response capture / state / datasets / operations / traces ----
      case "responses.list": {
        if (!s.responses) throw new VectorError("backend_unavailable", "response capture not wired");
        await s.responses.flush(); // capture persists asynchronously — readers see everything landed so far
        return s.responses.list(params.pageId, params as never);
      }
      case "responses.body": {
        if (!s.responses) throw new VectorError("backend_unavailable", "response capture not wired");
        await s.responses.flush();
        const b = s.responses.body(params.requestId);
        if (!b) throw new VectorError("not_found", `no captured body for ${params.requestId}`);
        return { mediaType: b.mediaType, dataBase64: b.buffer.toString("base64") };
      }
      case "state.query": {
        if (!s.state) throw new VectorError("backend_unavailable", "state index not wired");
        if (params.entity === "responses") await s.responses?.flush();
        return s.state.query(params);
      }
      case "state.datasets": {
        if (!s.state) throw new VectorError("backend_unavailable", "state index not wired");
        return s.state.listDatasets(params as never);
      }
      case "datasets.rows": {
        if (!s.state) throw new VectorError("backend_unavailable", "state index not wired");
        const p = params as { datasetId: string; limit?: number };
        return s.state.rows(p.datasetId).slice(0, p.limit ?? 5000);
      }
      case "datasets.transform": {
        if (!s.state) throw new VectorError("backend_unavailable", "state index not wired");
        const p = params as { datasetId: string; op: string; args?: Record<string, unknown> };
        return s.state.transform(p.datasetId, p.op, p.args);
      }
      case "datasets.save": {
        if (!s.state) throw new VectorError("backend_unavailable", "state index not wired");
        return s.state.saveDataset(params as never);
      }
      case "operations.list": {
        if (!s.operations) throw new VectorError("backend_unavailable", "operation registry not wired");
        return s.operations.list((params as { siteKey?: string }).siteKey);
      }
      case "operations.get": {
        if (!s.operations) throw new VectorError("backend_unavailable", "operation registry not wired");
        const p = params as { siteKey: string; name: string };
        return s.operations.get(p.siteKey, p.name);
      }
      case "operations.saveProgram": {
        if (!s.operations) throw new VectorError("backend_unavailable", "operation registry not wired");
        return s.operations.saveFromProgram(params as never);
      }
      case "operations.saveRequest": {
        if (!s.operations) throw new VectorError("backend_unavailable", "operation registry not wired");
        return s.operations.saveRequestImpl(params as never);
      }
      case "operations.invoke": {
        if (!s.operations) throw new VectorError("backend_unavailable", "operation registry not wired");
        return s.operations.invoke(params as never);
      }
      case "operations.explain": {
        if (!s.operations) throw new VectorError("backend_unavailable", "operation registry not wired");
        const p = params as { siteKey: string; name: string; pageId?: string };
        return s.operations.explain(p.siteKey, p.name, { pageId: p.pageId });
      }
      case "operations.setImplState": {
        if (!s.operations) throw new VectorError("backend_unavailable", "operation registry not wired");
        const p = params as { implId: string; state: "candidate" | "validated" | "shadow" | "quarantined" };
        return s.operations.setImplState(p.implId, p.state);
      }
      case "operations.disable": {
        // quarantine is the disable — the impl stays on record but never routes
        if (!s.operations) throw new VectorError("backend_unavailable", "operation registry not wired");
        return s.operations.setImplState((params as { implId: string }).implId, "quarantined");
      }
      case "operations.forget": {
        if (!s.operations) throw new VectorError("backend_unavailable", "operation registry not wired");
        const p = params as { siteKey: string; name: string };
        const op = s.operations.get(p.siteKey, p.name);
        s.repo.deleteOperation(op.operationId);
        return { ok: true };
      }
      case "operations.compile": {
        if (!s.operations) throw new VectorError("backend_unavailable", "operation registry not wired");
        return s.operations.compileFromRun(params as { runId: string; siteKey?: string; name?: string });
      }
      case "programs.validate": {
        // schema already parsed — add structural checks the schema can't express
        const p = (params as { program: unknown }).program;
        const errors: string[] = [];
        const prog = p as { steps?: { id: string; op: string }[]; nodes?: unknown[] };
        if (!prog.steps?.length && !prog.nodes?.length) errors.push("program has neither steps nor nodes");
        const ids = new Set<string>();
        for (const st of prog.steps ?? []) {
          if (ids.has(st.id)) errors.push(`duplicate step id ${st.id}`);
          ids.add(st.id);
        }
        (prog.steps ?? []).forEach((st, i, arr) => {
          if (st.op === "expectDownload" && i === arr.length - 1)
            errors.push("expectDownload must precede the trigger step");
        });
        return { ok: errors.length === 0, errors };
      }
      case "traces.list": {
        if (!s.tracer) throw new VectorError("backend_unavailable", "tracing not wired");
        const p = params as { since?: number; runId?: string; limit?: number };
        return s.tracer.spansSince(p.since ?? 0, p.limit ?? 500, p.runId);
      }
      case "traces.summary": {
        if (!s.tracer) throw new VectorError("backend_unavailable", "tracing not wired");
        return s.tracer.summary((params as { runId: string }).runId);
      }
      case "traces.counters": {
        if (!s.tracer) throw new VectorError("backend_unavailable", "tracing not wired");
        return s.tracer.counters(); // flushes the in-memory increments first
      }
      case "runtime.describe": {
        // capability surface for external clients — what this runtime can do (§16.2)
        const backends = [...new Set(s.repo.listPages({ includeDetached: true }).map((p) => p.backend))];
        const engineInfo = s.engine?.() ?? { available: false, error: "engine not wired" };
        return {
          version: 1,
          // Vector Engine (architecture §11): whether the native module loaded,
          // its version, the routing mode and the needs-chromium table size
          engine: {
            ...engineInfo,
            mode: s.router?.mode() ?? s.settings.engineMode?.() ?? "auto",
            routingMode:
              (s.router?.mode() ?? s.settings.engineMode?.() ?? "auto") === "off"
                ? "chromium-only"
                : (s.router?.mode() ?? "auto") === "always"
                  ? "native-only"
                  : "hybrid",
            connected: !!s.drivers().engine?.isConnected(),
            needsChromiumOrigins: s.router?.entries().length ?? 0,
          },
          methods: Object.keys(MethodSchemas).sort(),
          entities: ["pages", "sets", "runs", "programs", "operations", "datasets", "responses", "artifacts", "observations", "spans"],
          programForms: { steps: true, nodes: true },
          nodeKinds: ["step", "let", "if", "forEach", "until", "observe", "assert", "emit", "checkpoint", "return", "call"],
          implKinds: ["browser-program", "session-request"],
          effectClasses: ["read", "write", "destructive"],
          implStates: ["candidate", "validated", "shadow", "quarantined"],
          stateEntities: ["controls", "records", "responses", "artifacts", "operations", "datasets"],
          // §16.2 — clients must not assume capabilities the backend lacks
          backends,
          limits: {
            maxStepsPerProgram: 200,
            maxNodesPerProgram: 400,
            maxForEachConcurrency: 8,
            defaultNodeBudget: 2000,
            defaultIterationBudget: 500,
            observeMaxElements: 120,
            observeMaxTextChars: 6000,
          },
          features: {
            responseCapture: !!s.responses,
            operationRegistry: !!s.operations,
            stateIndex: !!s.state,
            tracing: !!s.tracer,
            chromeAttach: true,
            takeover: true,
            // Runs are crash-safe (the ledger marks them interrupted) but NOT
            // resumable after a restart; program checkpoints (`resumeFrom`)
            // are the only resume primitive. Advertise exactly that.
            checkpointResume: true,
            programCheckpoints: true,
            invocationIdempotency: true,
            routeFallback: true,
            webmcpTools: false,
            bidi: true,
            crashReview: true,
            nativeOnly: s.router?.isNativeOnly() ?? process.env.VECTOR_NATIVE_ONLY === "1",
          },
        };
      }
    }
  };
}
