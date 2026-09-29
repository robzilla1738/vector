import { useCallback, useEffect, useState } from "react";
import type { OnboardingState } from "@aux/contracts";
import { bridge, inNativeHost } from "../bridge";
import { call, toast, useStore } from "../store";
import { OnboardingFlow } from "./OnboardingFlow";
import { ONBOARDING_REPLAY_EVENT } from "./replay";

/** Mount once in the main Aux window after runtime connection. No private/utility window RPC. */
export default function OnboardingHost({ enabled = true }: { enabled?: boolean }) {
  const connected = useStore((state) => state.connected);
  const [state, setState] = useState<OnboardingState | null>(null);
  const [open, setOpen] = useState(false);
  const eligible = enabled && inNativeHost && !bridge.privateMode;
  const load = useCallback(async (replay = false) => {
    const current = await call("onboarding.get");
    const next = replay
      ? await call("onboarding.update", { revision: current.revision, action: "replay" })
      : current;
    setState(next);
    setOpen(replay || next.status === "new" || next.status === "active");
  }, []);
  useEffect(() => {
    if (!eligible || !connected) return;
    let live = true;
    void call("onboarding.get")
      .then((next) => {
        if (!live) return;
        setState(next);
        setOpen(next.status === "new" || next.status === "active");
      })
      .catch(() => {
        /* Browsing stays usable; explicit replay reports recovery errors. */
      });
    return () => {
      live = false;
    };
  }, [eligible, connected]);
  useEffect(() => {
    if (!eligible) return;
    const replay = () => {
      void load(true).catch((error) =>
        toast(error instanceof Error ? error.message : "Setup is unavailable. Reconnect and try again."),
      );
    };
    window.addEventListener(ONBOARDING_REPLAY_EVENT, replay);
    return () => window.removeEventListener(ONBOARDING_REPLAY_EVENT, replay);
  }, [eligible, load]);
  if (!eligible || !open || !state) return null;
  return <OnboardingFlow initialState={state} onClose={() => setOpen(false)} />;
}
