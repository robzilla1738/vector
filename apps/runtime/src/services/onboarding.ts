import {
  AuxError,
  ONBOARDING_STEPS,
  OnboardingStateSchema,
  type OnboardingState,
  type OnboardingUpdate,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";

const KEY = "onboarding.state.v2";

/** Profile-owned setup progress. Reads and replay never import, navigate or start work. */
export class OnboardingService {
  constructor(private repo: Repo) {}

  get(): OnboardingState {
    const raw = this.repo.getSetting<unknown>(KEY);
    if (raw === undefined)
      return { version: 2, revision: 0, status: "new", step: "welcome", visited: [], skipped: [] };
    const parsed = OnboardingStateSchema.safeParse(raw);
    if (!parsed.success)
      throw new AuxError("conflict", "Setup progress could not be read. Use Settings to continue.");
    return parsed.data;
  }

  private save(state: OnboardingState): OnboardingState {
    const next = OnboardingStateSchema.parse({ ...state, revision: state.revision + 1 });
    this.repo.setSetting(KEY, next);
    return next;
  }

  update(input: OnboardingUpdate): OnboardingState {
    const state = this.get();
    if (input.revision !== state.revision)
      throw new AuxError(
        "conflict",
        "Setup changed in another window. Reload its progress before continuing.",
      );
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
    }
  }
}
