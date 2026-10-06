import { randomUUID } from "node:crypto";
import {
  AuxError,
  DEFAULT_BROWSER_COOLDOWN_MS,
  ONBOARDING_DISCLOSURE_VERSION,
  ONBOARDING_POSTCARDS,
  ONBOARDING_STEPS,
  OnboardingStateSchema,
  type OnboardingState,
  type OnboardingStart,
  type OnboardingUpdate,
  type PageTarget,
  type Run,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";

const KEY = "onboarding.state.v1";
interface Dependencies {
  repo: Repo;
  configured(): boolean;
  maxModelCalls?(): number;
  page(id: string): PageTarget;
  start(input: {
    goal: string;
    deliveryRunId: string;
    chatId: string;
    pageIds: string[];
    contextPageRefs: OnboardingStart["page"][];
    maxModelCalls: number;
  }): Promise<Run>;
  now?: () => number;
}

/** Profile-owned progress. Reads/replay never import, navigate or call a model. */
export class OnboardingService {
  private inFlight: Promise<{ state: OnboardingState; run: Run | null }> | null = null;
  constructor(private deps: Dependencies) {}
  private read(): OnboardingState {
    const raw = this.deps.repo.getSetting<unknown>(KEY);
    if (raw === undefined)
      return {
        version: 1,
        revision: 0,
        status: "new",
        step: "welcome",
        visited: [],
        skipped: [],
        disclosureVersion: 0,
      };
    const parsed = OnboardingStateSchema.safeParse(raw);
    if (!parsed.success)
      throw new AuxError(
        "conflict",
        "Setup progress could not be read. Existing imports and chats are unchanged; use Settings to continue.",
      );
    return parsed.data;
  }
  private save(state: OnboardingState): OnboardingState {
    const next = OnboardingStateSchema.parse({ ...state, revision: state.revision + 1 });
    this.deps.repo.setSetting(KEY, next);
    return next;
  }
  get(): OnboardingState {
    const state = this.read(),
      first = state.firstTask;
    if (!first || this.inFlight) return state;
    const run = this.deps.repo.getRun(first.runId);
    if (run && first.status !== "started")
      return this.save({ ...state, status: "complete", firstTask: { ...first, status: "started" } });
    if (!run && first.status === "pending" && !this.inFlight)
      return this.save({ ...state, firstTask: { ...first, status: "interrupted" } });
    if (!run && first.status === "started")
      return this.save({ ...state, firstTask: { ...first, status: "unavailable" } });
    return state;
  }
  update(input: OnboardingUpdate): OnboardingState {
    const state = this.get();
    if (input.revision !== state.revision)
      throw new AuxError(
        "conflict",
        "Setup changed in another window. Reload its progress before continuing.",
      );
    if (this.inFlight)
      throw new AuxError("conflict", "The first chat is starting. Check its progress before changing setup.");
    switch (input.action) {
      case "visit":
        if (!input.step) throw new AuxError("invalid_params", "Choose a setup step.");
        return this.save({
          ...state,
          status: "active",
          step: input.step,
          visited: [...new Set([...state.visited, input.step])],
        });
      case "skip": {
        const index = ONBOARDING_STEPS.indexOf(state.step);
        return this.save({
          ...state,
          skipped: [...new Set([...state.skipped, state.step])],
          step: ONBOARDING_STEPS[Math.min(index + 1, ONBOARDING_STEPS.length - 1)]!,
          status: index === ONBOARDING_STEPS.length - 1 ? "complete" : "active",
        });
      }
      case "later":
        return this.save({ ...state, status: "later" });
      case "finish":
        return this.save({ ...state, status: "complete" });
      case "replay":
        return this.save({ ...state, status: "active", step: "welcome" });
      case "disclosure":
        return this.save({ ...state, disclosureVersion: ONBOARDING_DISCLOSURE_VERSION });
      case "default-prompt": {
        const now = (this.deps.now ?? Date.now)();
        if (
          state.defaultBrowserPromptedAt !== undefined &&
          now - state.defaultBrowserPromptedAt < DEFAULT_BROWSER_COOLDOWN_MS
        )
          throw new AuxError(
            "conflict",
            "The setup default-browser prompt is on cooldown. You can change the default in Settings at any time.",
          );
        return this.save({ ...state, defaultBrowserPromptedAt: now });
      }
    }
  }
  private reviewedPage(reviewed: OnboardingStart["page"]): PageTarget {
    const page = this.deps.page(reviewed.pageId);
    let url: URL;
    try {
      url = new URL(page.url);
    } catch {
      throw new AuxError("invalid_params", "Choose an available HTTP or HTTPS page.");
    }
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      page.ownedByRuntime ||
      page.loading ||
      page.controller === "agent" ||
      page.controller === "external" ||
      ["detached", "crashed"].includes(page.viewStatus) ||
      page.url !== reviewed.url ||
      page.documentEpoch !== reviewed.documentEpoch ||
      page.sessionId !== reviewed.sessionId
    )
      throw new AuxError(
        "conflict",
        "The selected page changed or is unavailable. Review the page again before starting.",
      );
    return page;
  }

  async start(input: OnboardingStart): Promise<{ state: OnboardingState; run: Run | null }> {
    // Stable server-minted delivery identity survives lost responses and runtime restarts.
    const state = this.read();
    if (state.firstTask && state.firstTask.postcardId !== input.postcardId)
      throw new AuxError(
        "conflict",
        "Setup already has a first chat. Open it or start a different chat outside setup.",
      );
    if (this.inFlight) return this.inFlight;
    if (state.firstTask) {
      const run = this.deps.repo.getRun(state.firstTask.runId);
      if (run) return { state: this.get(), run };
      if (["started", "unavailable"].includes(state.firstTask.status))
        throw new AuxError(
          "conflict",
          "This setup chat was removed. Start a new chat outside setup; replay will not recreate it.",
        );
    }
    if (input.revision !== state.revision)
      throw new AuxError("conflict", "Setup changed. Reload its progress before starting the chat.");
    if (state.disclosureVersion !== ONBOARDING_DISCLOSURE_VERSION)
      throw new AuxError(
        "permission_denied",
        "Review how model requests use your data before starting a chat.",
      );
    if (!this.deps.configured())
      throw new AuxError("backend_unavailable", "Set up a model connection first. No chat has started.");
    const page = this.reviewedPage(input.page);
    const postcard = ONBOARDING_POSTCARDS.find((item) => item.id === input.postcardId)!;
    const first = {
      postcardId: postcard.id,
      runId: state.firstTask?.runId ?? randomUUID(),
      chatId: state.firstTask?.chatId ?? randomUUID(),
      status: "pending" as const,
    };
    const pending = this.save({ ...state, firstTask: first });
    // Defer dispatch until inFlight is installed, including for synchronously throwing adapters.
    this.inFlight = Promise.resolve()
      .then(async () => {
        let identityMismatch = false;
        try {
          // Admission may have changed while the durable receipt was being reserved.
          this.reviewedPage(input.page);
          if (!this.deps.configured())
            throw new AuxError(
              "backend_unavailable",
              "The model connection changed. Review it before retrying.",
            );
          const run = await this.deps.start({
            goal: postcard.prompt,
            deliveryRunId: first.runId,
            chatId: first.chatId,
            pageIds: [page.pageId],
            contextPageRefs: [input.page],
            maxModelCalls: this.deps.maxModelCalls?.() ?? 0,
          });
          if (run.runId !== first.runId) {
            identityMismatch = true;
            throw new AuxError(
              "conflict",
              "The first chat returned an unexpected identity. Check Chats before trying again.",
            );
          }
          return {
            state: this.save({ ...pending, status: "complete", firstTask: { ...first, status: "started" } }),
            run,
          };
        } catch (error) {
          const run = this.deps.repo.getRun(first.runId);
          if (run)
            return {
              state: this.save({
                ...pending,
                status: "complete",
                firstTask: { ...first, status: "started" },
              }),
              run,
            };
          this.save({
            ...pending,
            firstTask: { ...first, status: identityMismatch ? "unavailable" : "failed" },
          });
          throw error;
        }
      })
      .finally(() => {
        this.inFlight = null;
      });
    return this.inFlight;
  }
}
