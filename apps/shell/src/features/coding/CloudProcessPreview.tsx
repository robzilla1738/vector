import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CodingProcessView, MethodResult } from "@aux/contracts";
import { bridge, inMock, inNativeHost } from "../../bridge";
import { call, errToast, useStore } from "../../store";
import { errorMessage } from "../../error-message";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";

type OwnedPreview = {
  runId: string;
  port: number;
  value: MethodResult<"coding.preview">;
  closing?: Promise<void>;
};

export function CloudProcessPreview({ process }: { process: CodingProcessView }) {
  // A receipt belongs to its original VM and command, even if a later row reuses an ID.
  const owner = JSON.stringify([process.runId, process.processId, process.execution]);
  return <ProcessPreview key={owner} process={process} />;
}

function ProcessPreview({ process }: { process: CodingProcessView }) {
  const connected = useStore((state) => state.connected);
  const [available, setAvailable] = useState<boolean | undefined>(() =>
    inNativeHost && !inMock ? undefined : false,
  );
  const [port, setPort] = useState("3000");
  const [preview, setPreview] = useState<OwnedPreview>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const original = useRef<OwnedPreview | undefined>(undefined);
  const [cleanupPending, setCleanupPending] = useState(false);
  const active = useRef(false);
  const pending = useRef(false);
  const running = process.state === "running";
  const runningNow = useRef(running);
  useLayoutEffect(() => {
    runningNow.current = running;
  }, [running]);
  const selectedPort = Number(port);
  const validPort = Number.isInteger(selectedPort) && selectedPort > 0 && selectedPort <= 65535;

  const close = useCallback((owned: OwnedPreview): Promise<void> => {
    if (owned.closing) return owned.closing;
    owned.closing = call("coding.previewClose", { runId: owned.runId, previewId: owned.value.previewId })
      .then((result) => {
        if (!result.closed) throw new Error("Preview cleanup is not acknowledged. Try closing it again.");
        if (original.current === owned) {
          original.current = undefined;
          if (active.current) {
            setPreview(undefined);
            setCleanupPending(false);
          }
        }
      })
      .catch((reason) => {
        if (active.current && original.current === owned) setCleanupPending(true);
        throw reason;
      })
      .finally(() => {
        owned.closing = undefined;
      });
    return owned.closing;
  }, []);
  useEffect(() => {
    active.current = true;
    if (inNativeHost && !inMock) {
      void bridge
        .capabilities()
        .then((capabilities) => {
          if (active.current)
            setAvailable(
              capabilities.methods.includes("native.cloudPreview") &&
                capabilities.methods.includes("native.cloudPreviewClose"),
            );
        })
        .catch(() => {
          if (active.current) setAvailable(false);
        });
    }
    return () => {
      active.current = false;
      if (original.current) void close(original.current).catch(errToast);
    };
  }, [close]);

  const closePreview = useCallback(async () => {
    if (pending.current || !original.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await close(original.current);
    } catch (reason) {
      if (active.current) setError(errorMessage(reason));
    } finally {
      pending.current = false;
      if (active.current) setBusy(false);
    }
  }, [close]);
  useEffect(() => {
    if (!running && original.current) void closePreview();
  }, [running, closePreview]);

  async function open() {
    if (!active.current || pending.current || !connected || !available || !running || !validPort) return;
    const request = { runId: process.runId, processId: process.processId, port: selectedPort };
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      if (original.current) await close(original.current);
      if (!active.current || !runningNow.current) return;
      const value = await call("coding.preview", request);
      const owned = { runId: request.runId, port: request.port, value };
      original.current = owned;
      let matched = false;
      try {
        const url = new URL(value.url);
        matched =
          value.processId === request.processId &&
          url.protocol === "https:" &&
          !url.username &&
          !url.password;
      } catch {
        /* The unexpected guest is closed before displaying any response. */
      }
      if (!matched) {
        await close(owned);
        throw new Error("The preview did not match the original cloud process.");
      }
      if (!active.current || !runningNow.current) {
        await close(owned);
        return;
      }
      setPreview(owned);
    } catch (reason) {
      if (active.current) setError(errorMessage(reason));
      else errToast(reason);
    } finally {
      pending.current = false;
      if (active.current) setBusy(false);
    }
  }

  return (
    <section className="coding-cloud-preview" aria-label="Cloud process Preview" aria-busy={busy}>
      <form
        className="coding-preview-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void open();
        }}
      >
        <label>
          Server port
          <input
            type="number"
            min={1}
            max={65535}
            step={1}
            value={port}
            disabled={busy}
            onChange={(event) => setPort(event.target.value)}
          />
        </label>
        <button
          type="submit"
          {...smallButtonProps}
          disabled={busy || !connected || !available || !running || !validPort}
        >
          {busy && !preview ? "Opening…" : "Open Preview"}
        </button>
        {(preview || cleanupPending) && (
          <button
            type="button"
            {...smallGhostButtonProps}
            disabled={busy || !connected}
            onClick={() => void closePreview()}
          >
            Close Preview
          </button>
        )}
      </form>
      {available === false && <p className="hint">Cloud Preview is unavailable in this Aux build.</p>}
      {!running && <p className="hint">Preview is available while this server is running.</p>}
      {error && <p role="alert">{error}</p>}
      {preview && (
        <>
          <p className="coding-preview-address">
            Port {preview.port} · {preview.value.url}
          </p>
          <embed
            title={`Cloud development server on port ${preview.port}`}
            type="application/x-chromium-surface-embed"
            data-content-id={preview.value.contentId}
            className="coding-preview-content"
          />
        </>
      )}
    </section>
  );
}
