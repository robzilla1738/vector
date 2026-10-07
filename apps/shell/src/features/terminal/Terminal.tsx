import { useEffect, useRef, useState } from "react";
import { Terminal as Xterm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import type { TerminalSession } from "@aux/contracts/terminal";
import { call } from "../../store";
import { Button } from "../../ui";
import { errorMessage } from "../../error-message";
import "./terminal.css";

export default function Terminal({
  workspaceId,
  folderId,
  path,
  onSession,
}: {
  workspaceId: string;
  folderId: string;
  path: string;
  onSession?: (terminalId: string | undefined) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const close = useRef<() => Promise<void>>(async () => {});
  const [client, setClient] = useState<"claude" | "codex">("claude");
  const [running, setRunning] = useState(false),
    [error, setError] = useState("");
  const [launch, setLaunch] = useState(0);
  useEffect(() => {
    if (!launch || !container.current) return;
    let current = true,
      session: TerminalSession | undefined,
      timer: ReturnType<typeof setTimeout> | undefined;
    let closing: Promise<void> | undefined;
    let stopping = false,
      stopped = false;
    let offset = 0,
      sequence = 0,
      inputQueue = Promise.resolve();
    const terminal = new Xterm({
      cursorBlink: true,
      scrollback: 2000,
      fontFamily: "Geist Mono, monospace",
      fontSize: 13,
      convertEol: false,
    });
    const fit = new FitAddon();
    terminal.loadAddon(fit);
    terminal.open(container.current);
    fit.fit();
    const started = call("terminal.start", {
      workspaceId,
      folderId,
      client,
      cols: terminal.cols,
      rows: terminal.rows,
    });
    const stop = () => {
      if (stopped) return Promise.resolve();
      if (closing) return closing;
      stopping = true;
      if (timer) clearTimeout(timer);
      closing = (async () => {
        const owned = session ?? (await started.catch(() => undefined));
        if (owned) {
          const acknowledgement = await call("terminal.close", { terminalId: owned.terminalId });
          if (acknowledgement.state !== "closed")
            throw new Error("Terminal termination is not acknowledged.");
          if (session === owned) session = undefined;
          if (current) onSession?.(undefined);
        }
        stopped = true;
        if (current) setRunning(false);
      })().finally(() => {
        closing = undefined;
      });
      return closing;
    };
    close.current = stop;
    const fail = (reason: unknown) => {
      if (current) {
        setError(errorMessage(reason));
      }
      void stop().catch((cleanupError) => {
        if (current) setError(`Terminal needs attention: ${errorMessage(cleanupError)}`);
      });
    };
    const poll = async () => {
      const owned = session;
      if (!current || stopping || !owned) return;
      try {
        const result = await call("terminal.read", { terminalId: owned.terminalId, offset });
        if (!current || stopping || session !== owned) return;
        if (result.offset !== offset || result.nextOffset < offset)
          throw new Error("Terminal output sequence changed.");
        offset = result.nextOffset;
        const bytes = Uint8Array.from(atob(result.data), (character) => character.charCodeAt(0));
        terminal.write(bytes, () => {
          if (!current || stopping || session !== owned) return;
          if (result.state === "closed") {
            setRunning(false);
            onSession?.(undefined);
            terminal.write(
              `\r\n[Process exited${result.exitCode === undefined ? "" : ` ${result.exitCode}`} ]\r\n`,
            );
          } else timer = setTimeout(() => void poll(), 50);
        });
      } catch (reason) {
        fail(reason);
      }
    };
    const input = terminal.onData((data) => {
      const owned = session;
      if (!current || stopping || !owned) return;
      for (let index = 0; index < data.length;) {
        let end = Math.min(index + 16384, data.length);
        if (end < data.length && /[\uD800-\uDBFF]/.test(data[end - 1]!)) end--;
        const chunk = data.slice(index, end);
        index = end;
        inputQueue = inputQueue.then(async () => {
          if (!current || stopping || session !== owned) return;
          const ack = await call("terminal.input", { terminalId: owned.terminalId, sequence, data: chunk });
          if (!current || stopping || session !== owned) return;
          if (ack.nextSequence !== sequence + 1) throw new Error("Terminal input acknowledgement changed.");
          sequence = ack.nextSequence;
        });
      }
      void inputQueue.catch(fail);
    });
    const resize = new ResizeObserver(() => {
      if (!current || stopping || !container.current?.clientWidth || !container.current.clientHeight) return;
      fit.fit();
      const owned = session;
      if (owned)
        void call("terminal.resize", {
          terminalId: owned.terminalId,
          cols: terminal.cols,
          rows: terminal.rows,
        }).catch(fail);
    });
    resize.observe(container.current);
    void started
      .then(async (started) => {
        session = started;
        if (!current || stopping) {
          await stop();
          return;
        }
        onSession?.(started.terminalId);
        setRunning(true);
        terminal.focus();
        await poll();
      })
      .catch(fail);
    return () => {
      current = false;
      if (timer) clearTimeout(timer);
      input.dispose();
      resize.disconnect();
      terminal.dispose();
      void stop().catch((reason) =>
        console.error("Terminal termination needs acknowledgement", errorMessage(reason)),
      );
    };
  }, [launch, workspaceId, folderId]);
  return (
    <section className="aux-terminal" aria-label="Project Terminal">
      <p>
        {path}. Uses your own {client === "claude" ? "Claude Code" : "Codex"} login. This local terminal can
        run commands with your account's permissions.
      </p>
      <div className="aux-terminal-controls">
        <select
          aria-label="Terminal client"
          value={client}
          disabled={running}
          onChange={(event) => setClient(event.target.value as "claude" | "codex")}
        >
          <option value="claude">Claude Code</option>
          <option value="codex">Codex</option>
        </select>
        <Button
          size={28}
          disabled={running}
          onClick={() => {
            setError("");
            setRunning(true);
            setLaunch((value) => value + 1);
          }}
        >
          Start
        </Button>
        <Button
          size={28}
          disabled={!running}
          onClick={() => void close.current().catch((reason) => setError(errorMessage(reason)))}
        >
          Stop
        </Button>
      </div>
      <div ref={container} className="aux-terminal-screen" />
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
