import { staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Artifact } from "@aux/contracts";
import { call, useStore } from "../store";
import { bridge } from "../bridge";
import { artifactExported, useArtifactOwner } from "../artifact-export";
import { useConversationOwner } from "./ConversationControls";
import { ImageViewer } from "./ImageViewer";
import { shellIconResult } from "../ui/icons";
import { staticNumericCountProps as auxClassNumericCountProps } from "../ui/class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

// Base64 must fit the existing 16 MiB host frame, including its JSON envelope.
const MAX_PREVIEW_BYTES = 11 * 1024 * 1024;
const artifactIdentity = (artifact: Artifact) =>
  JSON.stringify([
    artifact.artifactId,
    artifact.runId,
    artifact.pageId,
    artifact.path,
    artifact.mediaType,
    artifact.size,
    artifact.status,
    artifact.createdAt,
  ]);

function RunImage({
  artifact,
  runId,
  copyAvailable,
}: {
  artifact: Artifact;
  runId: string;
  copyAvailable: boolean;
}) {
  const connected = useStore((state) => state.connected);
  const incarnation = artifactIdentity(artifact);
  const viewCurrent = useConversationOwner(JSON.stringify([runId, incarnation]), connected);
  const current = useArtifactOwner(viewCurrent);
  const [loaded, setLoaded] = useState<{ current: typeof current; url: string } | null>(null);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [copyError, setCopyError] = useState("");
  const [copied, setCopied] = useState(false);
  const [retry, setRetry] = useState(0);
  const [previewRequested, setPreviewRequested] = useState(false);
  const [saving, setSaving] = useState<object | null>(null);
  const pending = useRef<object | null>(null);
  const [copying, setCopying] = useState<object | null>(null);
  const copyPending = useRef<object | null>(null);
  const preview = artifact.size < 8_000_000 || previewRequested;
  const canPreview = artifact.size <= MAX_PREVIEW_BYTES;
  const url = loaded?.current === current ? loaded.url : "";
  const filename = artifact.path.split(/[\\/]/).at(-1) || `image.${artifact.mediaType.slice(6)}`;
  const size =
    artifact.size >= 1_000_000
      ? `${(artifact.size / 1_000_000).toFixed(1)} MB`
      : `${Math.max(1, Math.ceil(artifact.size / 1_000))} KB`;
  useLayoutEffect(() => {
    pending.current = null;
    copyPending.current = null;
    setSaving(null);
    setCopying(null);
    setSaveError("");
    setCopyError("");
    setCopied(false);
    setPreviewRequested(false);
    return () => {
      pending.current = null;
      copyPending.current = null;
    };
  }, [current]);
  useEffect(() => {
    let live = true;
    setError("");
    if (!preview || !canPreview || !current()) return;
    void call("artifacts.read", { artifactId: artifact.artifactId })
      .then((data) => {
        if (!live || !current()) return;
        if (artifactIdentity(data.artifact) !== incarnation) throw new Error("This saved image changed.");
        setLoaded({ current, url: `data:${artifact.mediaType};base64,${data.dataBase64}` });
      })
      .catch((reason) => {
        if (live && current()) setError(errorMessage(reason));
      });
    return () => {
      live = false;
    };
  }, [artifact.artifactId, artifact.mediaType, incarnation, current, preview, canPreview, retry]);
  async function save() {
    if (!current() || pending.current) return;
    const token = {};
    pending.current = token;
    setSaving(token);
    setSaveError("");
    const delivering = () => current() && pending.current === token;
    try {
      const destination = await bridge.saveStoredArtifact(artifact.artifactId, filename);
      if (destination && delivering()) artifactExported("Image saved", destination, current);
    } catch (reason) {
      if (delivering()) setSaveError(errorMessage(reason));
    } finally {
      if (pending.current === token) {
        pending.current = null;
        if (current()) setSaving(null);
      }
    }
  }
  async function copy() {
    if (!copyAvailable || !current() || copyPending.current) return;
    const token = {};
    copyPending.current = token;
    setCopying(token);
    setCopyError("");
    setCopied(false);
    const delivering = () => current() && copyPending.current === token;
    try {
      const result = await bridge.copyStoredImage(artifact.artifactId);
      if (!delivering()) return;
      if (result.copied !== true) throw new Error("The native clipboard did not confirm the copy.");
      setCopied(true);
    } catch (reason) {
      if (delivering()) setCopyError(errorMessage(reason));
    } finally {
      if (copyPending.current === token) {
        copyPending.current = null;
        if (current()) setCopying(null);
      }
    }
  }
  return (
    <figure className="conversation-image">
      {error ? (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          Couldn’t load this image. {error}{" "}
          {canPreview && preview && (
            <button
              {...smallGhostButtonProps}
              onClick={() => {
                if (current()) setRetry((value) => value + 1);
              }}
            >
              Retry image
            </button>
          )}
        </p>
      ) : url ? (
        <ImageViewer
          src={url}
          alt="Saved image from this turn"
          current={current}
          onError={() => {
            if (current()) setError("The saved image could not be displayed.");
          }}
        />
      ) : preview && canPreview ? (
        <output {...staticHintProps} data-block>
          Loading image…
        </output>
      ) : canPreview ? (
        <button
          {...smallGhostButtonProps}
          onClick={() => {
            if (current()) setPreviewRequested(true);
          }}
        >
          Preview image
        </button>
      ) : (
        <p {...staticHintProps}>
          This image is too large for inline preview. Save it to view the full image.
        </p>
      )}
      <figcaption>
        {artifact.mediaType.slice(6).toUpperCase()} · {size} · Saved{" "}
        {new Date(artifact.createdAt).toLocaleString()}
      </figcaption>
      <button {...smallButtonProps} disabled={!!saving} onClick={() => void save()}>
        {saving ? "Saving image…" : "Save image…"}
      </button>
      {copyAvailable && (
        <button {...smallGhostButtonProps} disabled={!!copying} onClick={() => void copy()}>
          {copying ? "Copying image…" : "Copy image"}
        </button>
      )}
      {copied && <output {...staticHintProps}>Image copied.</output>}
      {copyError && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          Couldn’t copy this image. {copyError}
        </p>
      )}
      {saveError && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          Couldn’t save this image. {saveError}
        </p>
      )}
    </figure>
  );
}

/** Fetch image bytes only when their turn's gallery is opened. */
function RunImageGallery({ runId }: { runId: string }) {
  const status = useStore((state) => state.runs.find((run) => run.runId === runId)?.status);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(3);
  const [copyAvailable, setCopyAvailable] = useState(false);
  const windowId = bridge.windowId,
    windowKind = bridge.windowKind,
    privateMode = bridge.privateMode;
  useEffect(() => {
    let live = true;
    const current = () =>
      live &&
      bridge.windowId === windowId &&
      bridge.windowKind === windowKind &&
      bridge.privateMode === privateMode;
    setCopyAvailable(false);
    if (open)
      void bridge
        .capabilities()
        .then((capabilities) => {
          if (current()) setCopyAvailable(capabilities.methods.includes("copyStoredImage"));
        })
        .catch(() => {
          if (current()) setCopyAvailable(false);
        });
    return () => {
      live = false;
    };
  }, [open, windowId, windowKind, privateMode]);
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
          {artifacts.slice(0, limit).map((artifact) => (
            <RunImage
              key={artifact.artifactId}
              artifact={artifact}
              runId={runId}
              copyAvailable={copyAvailable}
            />
          ))}
          {artifacts.length > limit && (
            <button {...smallGhostButtonProps} onClick={() => setLimit((value) => value + 3)}>
              Show more images · {artifacts.length - limit} remaining
            </button>
          )}
        </div>
      )}
    </details>
  );
}

export function RunImages({ runId }: { runId: string }) {
  return <RunImageGallery key={runId} runId={runId} />;
}
