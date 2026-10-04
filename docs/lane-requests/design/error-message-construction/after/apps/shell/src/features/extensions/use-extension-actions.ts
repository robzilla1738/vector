import { errorMessage } from "../../error-message";
import { useEffect, useState } from "react";
import type { HostMethodResult } from "@aux/contracts";
import { bridge } from "../../bridge";

export function useExtensionActions(enabled: boolean) {
  const [items, setItems] = useState<HostMethodResult<"extensionActions">>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!enabled) return;
    let current = true;
    let generation = 0;
    const refresh = () => {
      const request = ++generation;
      void bridge.extensionActions().then(
        (next) => {
          if (current && request === generation) {
            setItems(next);
            setError("");
          }
        },
        (reason) => {
          if (current && request === generation)
            setError(errorMessage(reason));
        },
      );
    };
    // Action badges are tab-specific: a Profile-wide event invalidates this
    // window's snapshot rather than copying another window's active-tab badge.
    const stop = bridge.onExtensionActionsChanged(refresh);
    refresh();
    return () => {
      current = false;
      stop();
    };
  }, [enabled]);
  return { items: enabled ? items : [], error: enabled ? error : "" };
}
