import { useEffect, useState } from "react";
import type { OnboardingState } from "@aux/contracts";
import { call } from "../store";

/** Settings reads the saved Profile state through the trusted human bridge. */
export function SetupProgress() {
  const [status, setStatus] = useState<OnboardingState["status"] | "unavailable" | null>(null);
  useEffect(() => {
    let current = true;
    void call("onboarding.get").then(
      (value) => {
        if (current) setStatus(value.status);
      },
      () => {
        if (current) setStatus("unavailable");
      },
    );
    return () => {
      current = false;
    };
  }, []);
  if (status === null) return null;
  const text =
    status === "later"
      ? "Setup saved for later"
      : status === "complete"
        ? "Setup complete"
        : status === "unavailable"
          ? "Saved setup progress is unavailable. Reconnect and try again."
          : status === "active"
            ? "Setup in progress"
            : "Setup has not started";
  return <output>{text}</output>;
}
