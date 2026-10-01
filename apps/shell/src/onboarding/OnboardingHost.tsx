import { useCallback, useEffect, useRef, useState } from "react";
import type { OnboardingState } from "@aux/contracts";
import { bridge, inNativeHost } from "../bridge";
import { call, toast, useStore } from "../store";
import { OnboardingFlow } from "./OnboardingFlow";
import { ONBOARDING_REPLAY_EVENT } from "./replay";

/** Profile progress is loaded only in a connected normal browser window. */
export default function OnboardingHost({ enabled = true }: { enabled?: boolean }) {
  const connected = useStore((state) => state.connected);
  const [state, setState] = useState<OnboardingState | null>(null);
  const [open, setOpen] = useState(false);
  const [instance, setInstance] = useState(0);
  const generation = useRef(0),
    replaying = useRef(false),
    dismissed = useRef(false);
  const invalidate = useCallback(() => {
    generation.current++;
  }, []);
  const eligible = enabled && inNativeHost && !bridge.privateMode && bridge.windowKind === "normal";
  useEffect(() => {
    const attempt = ++generation.current;
    replaying.current = false;
    if (!eligible || !connected || dismissed.current) return;
    void call("onboarding.get")
      .then((next) => {
        if (generation.current !== attempt) return;
        setState(next);
        setInstance((value) => value + 1);
        setOpen(next.status === "new" || next.status === "active");
      })
      .catch(() => {
        // Browsing stays usable; explicit replay reports recovery errors.
      });
    return () => {
      invalidate();
    };
  }, [eligible, connected, invalidate]);
  useEffect(() => {
    if (!eligible) return;
    const replay = () => {
      if (!connected) {
        toast("Reconnect to Aux before replaying setup. Saved progress is unchanged.");
        return;
      }
      if (replaying.current) return;
      replaying.current = true;
      const attempt = ++generation.current;
      // Replaying is explicit: the old view must not continue editing its obsolete revision.
      setOpen(false);
      void (async () => {
        try {
          const current = await call("onboarding.get");
          if (generation.current !== attempt) return;
          const next = await call("onboarding.update", { revision: current.revision, action: "replay" });
          if (generation.current !== attempt) return;
          dismissed.current = false;
          setState(next);
          setInstance((value) => value + 1);
          setOpen(true);
        } catch (error) {
          if (generation.current === attempt)
            toast(error instanceof Error ? error.message : "Setup is unavailable. Reconnect and try again.");
        } finally {
          if (generation.current === attempt) replaying.current = false;
        }
      })();
    };
    window.addEventListener(ONBOARDING_REPLAY_EVENT, replay);
    return () => {
      window.removeEventListener(ONBOARDING_REPLAY_EVENT, replay);
      invalidate();
    };
  }, [eligible, connected, invalidate]);
  if (!eligible || !open || !state) return null;
  return (
    <OnboardingFlow
      key={instance}
      initialState={state}
      onClose={() => {
        dismissed.current = true;
        generation.current++;
        setOpen(false);
      }}
    />
  );
}
