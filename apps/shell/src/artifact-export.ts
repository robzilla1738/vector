import { useMemo } from "react";
import { bridge } from "./bridge";
import type { ChromiumHostPort } from "./chromium-bridge";
import { errToast, toast } from "./store";
import { eventStream } from "./store/shared";
import { useCommittedConversationOwner } from "./components/conversation-control-construction";

const nativePort = () => (window as Window & { auxChromiumHost?: ChromiumHostPort }).auxChromiumHost;

/** Native Profile and runtime incarnation accompany the original artifact's view owner. */
export function useArtifactOwner(viewCurrent: () => boolean) {
  const port = nativePort(),
    stream = eventStream(),
    profileId = port?.profileId;
  const identity = useMemo(
    () => ({ viewCurrent, port, stream, profileId }),
    [viewCurrent, port, stream, profileId],
  );
  return useCommittedConversationOwner(
    identity,
    () => viewCurrent() && nativePort() === port && port?.profileId === profileId && eventStream() === stream,
    [identity],
  );
}

/** Reveal only the acknowledged destination while its original view still owns it. */
export function artifactExported(text: string, destination: string, current: () => boolean) {
  if (!current()) return;
  toast(text, "info", {
    label: "Reveal",
    run: () => {
      if (!current()) return;
      void bridge
        .revealPath(destination)
        .then((revealed) => {
          if (!revealed) throw new Error("The saved file’s location could not be opened.");
        })
        .catch((reason) => {
          if (current()) errToast(reason);
        });
    },
  });
}
