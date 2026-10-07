import { useEffect, useRef, useState } from "react";
import type { TerminalPreview, TerminalListenersSchema } from "@aux/contracts/terminal";
import type { z } from "zod";
import { call } from "../../store";
import { errorMessage } from "../../error-message";
import { smallButtonProps } from "../../ui/button-props";
export default function Preview({ terminalId }: { terminalId?: string }) {
  const [listeners, setListeners] = useState<z.infer<typeof TerminalListenersSchema>["listeners"]>([]);
  const [listener, setListener] = useState("");
  const [protocol, setProtocol] = useState<"http" | "https">("http");
  const [preview, setPreview] = useState<TerminalPreview>();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const original = useRef<TerminalPreview | undefined>(undefined);
  const generation = useRef(0);
  async function close() {
    const owned = original.current;
    if (!owned) return;
    const result = await call("terminal.previewClose", {
      terminalId: owned.terminalId,
      previewId: owned.previewId,
    });
    if (!result.closed) throw new Error("Preview cleanup is not acknowledged.");
    if (original.current === owned) {
      original.current = undefined;
      setPreview(undefined);
    }
  }
  async function refresh() {
    if (!terminalId) return;
    const request = ++generation.current;
    setBusy(true);
    setError("");
    try {
      const result = await call("terminal.listeners", { terminalId });
      if (generation.current !== request) return;
      setListeners(result.listeners);
      setListener((current) =>
        result.listeners.some((item) => item.listenerId === current)
          ? current
          : (result.listeners[0]?.listenerId ?? ""),
      );
    } catch (reason) {
      if (generation.current === request) setError(errorMessage(reason));
    } finally {
      if (generation.current === request) setBusy(false);
    }
  }
  useEffect(() => {
    setListeners([]);
    setListener("");
    setPreview(undefined);
    if (terminalId) void refresh();
    return () => {
      generation.current++;
      const owned = original.current;
      original.current = undefined;
      if (owned)
        void call("terminal.previewClose", {
          terminalId: owned.terminalId,
          previewId: owned.previewId,
        }).catch((reason) =>
          console.error("Project Preview cleanup needs acknowledgement", errorMessage(reason)),
        );
    };
  }, [terminalId]);
  async function open() {
    if (!terminalId || !listener) return;
    const request = ++generation.current;
    setBusy(true);
    setError("");
    try {
      await close();
      if (generation.current !== request) return;
      const result = await call("terminal.preview", { terminalId, listenerId: listener, protocol });
      if (generation.current !== request) {
        await call("terminal.previewClose", { terminalId: result.terminalId, previewId: result.previewId });
        return;
      }
      original.current = result;
      setPreview(result);
    } catch (reason) {
      if (generation.current === request) setError(errorMessage(reason));
    } finally {
      if (generation.current === request) setBusy(false);
    }
  }
  return (
    <section aria-label="Project Preview">
      {!terminalId && <p>Start Console, then run your development server in that terminal.</p>}
      {terminalId && (
        <div className="row">
          <select
            aria-label="Project server"
            disabled={busy}
            value={listener}
            onChange={(event) => setListener(event.target.value)}
          >
            {!listeners.length && <option value="">No running server found</option>}
            {listeners.map((item) => (
              <option key={item.listenerId} value={item.listenerId}>
                {item.url}
              </option>
            ))}
          </select>
          <select
            aria-label="Project server protocol"
            disabled={busy}
            value={protocol}
            onChange={(event) => setProtocol(event.target.value as "http" | "https")}
          >
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
          </select>
          <button {...smallButtonProps} disabled={busy} onClick={() => void refresh()}>
            Find servers
          </button>
          <button {...smallButtonProps} disabled={busy || !listener} onClick={() => void open()}>
            Open Preview
          </button>
          <button
            {...smallButtonProps}
            disabled={busy || !preview}
            onClick={() => {
              setBusy(true);
              void close()
                .catch((reason) => setError(errorMessage(reason)))
                .finally(() => setBusy(false));
            }}
          >
            Close Preview
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      {preview && (
        <>
          <p>{preview.url}</p>
          <embed
            title="Project development server"
            type="application/x-chromium-surface-embed"
            data-content-id={preview.contentId}
            style={{ width: "100%", height: 480, border: 0 }}
          />
        </>
      )}
    </section>
  );
}
