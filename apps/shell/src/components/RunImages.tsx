import { staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useState } from "react";
import type { Artifact } from "@aux/contracts";
import { call, useStore } from "../store";
import { ImageViewer } from "./ImageViewer";
import { shellIconResult } from "./icons";
import { staticNumericCountProps as auxClassNumericCountProps } from "../ui/class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

function RunImage({ artifact }: { artifact: Artifact }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let live = true;
    setUrl("");
    setError("");
    void call("artifacts.read", { artifactId: artifact.artifactId })
      .then((data) => {
        if (live) setUrl(`data:${artifact.mediaType};base64,${data.dataBase64}`);
      })
      .catch((reason) => {
        if (live) setError(errorMessage(reason));
      });
    return () => {
      live = false;
    };
  }, [artifact.artifactId, artifact.mediaType, retry]);
  return (
    <figure className="conversation-image">
      {error ? (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          Couldn’t load this image. {error}{" "}
          <button {...smallGhostButtonProps} onClick={() => setRetry((value) => value + 1)}>
            Retry image
          </button>
        </p>
      ) : url ? (
        <ImageViewer
          src={url}
          alt="Saved image from this turn"
          onError={() => setError("The saved image could not be displayed.")}
        />
      ) : (
        <output {...staticHintProps} data-block>
          Loading image…
        </output>
      )}
      <figcaption>Saved {new Date(artifact.createdAt).toLocaleString()}</figcaption>
    </figure>
  );
}

/** Fetch image bytes only when their turn's gallery is opened. */
export function RunImages({ runId }: { runId: string }) {
  const status = useStore((state) => state.runs.find((run) => run.runId === runId)?.status);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(3);
  useEffect(() => {
    let live = true;
    void call("artifacts.list", { runId })
      .then((items) => {
        if (!live) return;
        setArtifacts(
          items
            .filter((item) => item.status === "complete" && /^image\/(png|jpeg|webp)$/.test(item.mediaType))
            .sort((a, b) => b.createdAt - a.createdAt),
        );
        setError("");
      })
      .catch((reason) => {
        if (live) setError(errorMessage(reason));
      });
    return () => {
      live = false;
    };
  }, [runId, status, retry]);
  if (!artifacts.length && !error) return null;
  const previews = artifacts.filter((item) => item.size < 8_000_000);
  const large = artifacts.length - previews.length;
  return (
    <details
      className="conversation-sources conversation-images"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        {shellIconResult}
        <span>Images</span>
        {artifacts.length > 0 && <span {...auxClassNumericCountProps}>{artifacts.length}</span>}
      </summary>
      {open && (
        <div>
          {error && (
            <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
              Couldn’t refresh images. {error}{" "}
              <button {...smallGhostButtonProps} onClick={() => setRetry((value) => value + 1)}>
                Retry
              </button>
            </p>
          )}
          {previews.slice(0, limit).map((artifact) => (
            <RunImage key={artifact.artifactId} artifact={artifact} />
          ))}
          {large > 0 && (
            <p {...staticHintProps}>
              {large} {large === 1 ? "image exceeds" : "images exceed"} the 8 MB inline preview limit.
            </p>
          )}
          {previews.length > limit && (
            <button {...smallGhostButtonProps} onClick={() => setLimit((value) => value + 3)}>
              Show more images · {previews.length - limit} remaining
            </button>
          )}
        </div>
      )}
    </details>
  );
}
