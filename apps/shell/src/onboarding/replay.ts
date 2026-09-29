export const ONBOARDING_REPLAY_EVENT = "aux:onboarding:replay";
/** Called only by an explicit Settings action; the mounted host owns RPC/recovery. */
export function requestOnboardingReplay() {
  window.dispatchEvent(new Event(ONBOARDING_REPLAY_EVENT));
}
