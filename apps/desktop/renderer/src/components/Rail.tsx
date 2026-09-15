import { useEffect, useRef, useState } from "react";
import { useStore, call, errToast } from "../store";
import { ResizeHandle } from "./ResizeHandle";
import { I } from "./icons";
import type { Run, StepRecord } from "@vector/contracts";

const LIVE = new Set(["queued", "planning", "running", "paused", "needs_input"]);

function StepRow({ s }: { s: StepRecord }) {
  const failed = s.outcome?.status === "failed";
  const obsArtifactId = (s.inputs as { obsArtifactId?: string } | undefined)?.obsArtifactId;
  const inspectObs = async () => {
    if (!obsArtifactId) return;
    const res = await call<{ dataBase64: string }>("artifacts.read", { artifactId: obsArtifactId });
    const obs = JSON.parse(atob(res.dataBase64)) as unknown;
    useStore.setState({ inspectorObs: obs, overlay: "observe" });
  };
  return (
    <div className="step-row">
      <span className={`step-dot ${failed ? "err" : s.outcome?.status === "skipped" ? "skip" : "ok"}`} />
      <span className="step-op">{s.op}</span>
      <span className="step-detail" title={s.outcome?.error?.message ?? s.outcome?.detail ?? s.expected ?? ""}>
        {failed ? s.outcome?.error?.message ?? "failed" : s.outcome?.detail ?? s.expected ?? ""}
      </span>
      {s.outcome && <span className="step-ms">{s.outcome.durationMs}ms</span>}
      {obsArtifactId && (
        <button className="icon-btn step-obs" title="Inspect the observation the planner saw for this step" onClick={() => void inspectObs()}>{I.obs}</button>
      )}
    </div>
  );
}

/** One assistant turn: the run's live status, steps, answer, and Q&A. */
function AgentCard({ r }: { r: Run }) {
  const live = LIVE.has(r.status);
  const [open, setOpen] = useState(live);
  const steps = useStore((s) => s.steps[r.runId]);
  const prompt = useStore((s) => s.prompt);
  const [answer, setAnswer] = useState("");
  const act = (m: string) => void call(m, { runId: r.runId }).catch(errToast);

  useEffect(() => {
    if (live) setOpen(true);
  }, [live]);

  const liveCount = useStore((s) => s.modelCalls[r.runId]);
  // live events > stamped config (set at finish) — runs.get merges into the map too
  const modelCalls = liveCount ?? (r.config as { modelCalls?: number } | undefined)?.modelCalls;

  const toggleSteps = async () => {
    if (!open && !steps) {
      try {
        const d = await call<{ run: Run; steps: StepRecord[]; modelCalls?: number }>("runs.get", { runId: r.runId });
        useStore.setState((s) => ({
          steps: { ...s.steps, [r.runId]: d.steps },
          modelCalls: d.modelCalls != null ? { ...s.modelCalls, [r.runId]: d.modelCalls } : s.modelCalls,
        }));
      } catch (e) {
        errToast(e);
      }
    }
    setOpen(!open);
  };

  const asksMe = prompt?.runId === r.runId;
  const stepCount = steps?.length ?? 0;

  return (
    <div className={`chat-card ${live ? "live" : ""}`}>
      <div className="chat-card-head" onClick={() => void toggleSteps()}>
        <span className={`st ${r.status}`}>{r.status.replace("_", " ")}</span>
        {r.config?.implementation && (
          <span
            className="impl-badge"
            title={r.config.routeReason ?? r.config.implementation}
          >
            {r.config.implementation}
          </span>
        )}
        {modelCalls != null && modelCalls === 0 && (
          <span className="impl-badge zero" title="completed without any model calls — zero-model reuse">
            0-model
          </span>
        )}
        <span className="chat-card-meta">
          {live
            ? modelCalls
              ? `working · ${modelCalls} call${modelCalls === 1 ? "" : "s"}`
              : "working…"
            : stepCount
              ? `${stepCount} step${stepCount === 1 ? "" : "s"}${modelCalls ? ` · ${modelCalls} call${modelCalls === 1 ? "" : "s"}` : ""}`
              : ""}
        </span>
        <span className="chat-card-acts" onClick={(e) => e.stopPropagation()}>
          {r.status === "paused" && <button className="icon-btn sm" title="Resume" onClick={() => act("runs.resume")}>{I.play}</button>}
          {r.status === "running" && <button className="icon-btn sm" title="Pause" onClick={() => act("runs.pause")}>{I.pause}</button>}
          {LIVE.has(r.status) && <button className="icon-btn sm" title="Cancel" onClick={() => act("runs.cancel")}>{I.close}</button>}
          {["failed", "partially_completed", "cancelled"].includes(r.status) && (
            <button className="icon-btn sm" title="Try again" onClick={() => void useStore.getState().sendChat(r.goal)}>{I.reload}</button>
          )}
          {stepCount > 0 && <span className={`chev ${open ? "open" : ""}`}>{I.down}</span>}
        </span>
      </div>
      {r.statusMessage && <div className="chat-reply">{r.statusMessage}</div>}
      {r.result && Object.keys(r.result).length > 0 && (
        <div className="chat-result">
          {Object.entries(r.result).map(([k, v]) => (
            <div className="chat-result-row" key={k}>
              <div className="k">{k.replace(/_/g, " ")}</div>
              {Array.isArray(v) ? (
                <ul>{v.map((item, i) => <li key={i}>{typeof item === "object" ? JSON.stringify(item) : String(item)}</li>)}</ul>
              ) : (
                <div className="v">{typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)}</div>
              )}
            </div>
          ))}
        </div>
      )}
      {r.error && <div className="chat-reply err">{r.error}</div>}
      {asksMe && (
        <div className="chat-question">
          <div className="q">{prompt!.question}</div>
          <div className="chat-answer">
            <input
              autoFocus
              value={answer}
              placeholder="Answer…"
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && answer.trim()) {
                  void call("runs.answer", { runId: r.runId, answer: answer.trim() }).catch(errToast);
                  setAnswer("");
                  useStore.setState({ prompt: null });
                }
              }}
            />
            <button
              className="icon-btn sm send"
              title="Send answer"
              disabled={!answer.trim()}
              onClick={() => {
                if (!answer.trim()) return;
                void call("runs.answer", { runId: r.runId, answer: answer.trim() }).catch(errToast);
                setAnswer("");
                useStore.setState({ prompt: null });
              }}
            >
              {I.send}
            </button>
          </div>
        </div>
      )}
      {open && (steps ?? []).length > 0 && (
        <div className="run-steps">
          {(steps ?? []).map((s) => <StepRow key={s.stepId} s={s} />)}
        </div>
      )}
    </div>
  );
}

const ago = (ts: number) => {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

export function Rail() {
  const runs = useStore((s) => s.runs);
  const steps = useStore((s) => s.steps);
  const sendChat = useStore((s) => s.sendChat);
  const chatQueue = useStore((s) => s.chatQueue);
  const prompt = useStore((s) => s.prompt);
  const activeChatId = useStore((s) => s.activeChatId);
  const newChat = useStore((s) => s.newChat);
  const selectChat = useStore((s) => s.selectChat);
  const connected = useStore((s) => s.connected);
  const railWidth = useStore((s) => s.railWidth);
  const setRailWidth = useStore((s) => s.setRailWidth);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const live = runs.filter((r) => LIVE.has(r.status));

  // chat order — oldest at top, newest at the bottom near the composer;
  // scoped to the active thread (null = all activity)
  const turns = [...runs]
    .filter((r) => activeChatId === null || r.config?.chatId === activeChatId)
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-40);

  // threads for the history list — runs grouped by chatId, newest first
  const threads = [...runs]
    .filter((r) => r.config?.chatId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .reduce<{ chatId: string; label: string; runs: number; last: number }[]>((acc, r) => {
      const id = r.config!.chatId!;
      const t = acc.find((x) => x.chatId === id);
      if (t) {
        t.runs += 1;
        t.last = Math.max(t.last, r.createdAt);
        // label comes from the *first* message — older runs sort later in the
        // descending pass, so keep the oldest goal we see
        t.label = r.goal;
      } else {
        acc.push({ chatId: id, label: r.goal, runs: 1, last: r.createdAt });
      }
      return acc;
    }, []);

  // keep the newest turn in view while work streams in
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [runs.length, steps, prompt, live.length]);

  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    setText("");
    try {
      await sendChat(t);
    } catch (e) {
      errToast(e);
      setText(t);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="rail">
      <div className="rail-head">
        <span className="title">{listOpen ? "Chats" : "Agent"}</span>
        {(!connected || live.length > 0 || chatQueue.length > 0) && (
          <span className="sub">
            {[
              !connected ? "offline" : live.length ? `${live.length} active` : "",
              chatQueue.length ? `${chatQueue.length} queued` : "",
            ].filter(Boolean).join(" · ")}
          </span>
        )}
        <span className="sp" />
        <button
          className={`icon-btn ${listOpen ? "on" : ""}`}
          title="Chat history"
          onClick={() => setListOpen(!listOpen)}
        >
          {I.chats}
        </button>
        <button className="icon-btn" title="New chat" onClick={() => { newChat(); setListOpen(false); inputRef.current?.focus(); }}>
          {I.plus}
        </button>
      </div>
      {listOpen ? (
        <div className="rail-body chat-list">
          <button className="chat-row new" onClick={() => { newChat(); setListOpen(false); }}>
            {I.plus} New chat
          </button>
          {activeChatId !== null && (
            <button className="chat-row" onClick={() => { selectChat(null); setListOpen(false); }}>
              <span className="chat-row-ico">{I.chats}</span>
              <span className="chat-row-main">
                <span className="chat-row-label">All activity</span>
                <span className="chat-row-sub">every run across all conversations</span>
              </span>
            </button>
          )}
          {threads.map((t) => (
            <button
              key={t.chatId}
              className={`chat-row ${t.chatId === activeChatId ? "on" : ""}`}
              onClick={() => { selectChat(t.chatId); setListOpen(false); }}
            >
              <span className="chat-row-ico">{I.chat}</span>
              <span className="chat-row-main">
                <span className="chat-row-label">{t.label}</span>
                <span className="chat-row-sub">
                  {t.runs} turn{t.runs === 1 ? "" : "s"} · {ago(t.last)}
                </span>
              </span>
            </button>
          ))}
          {threads.length === 0 && <div className="hint" style={{ padding: "12px 6px" }}>No conversations yet — send a message to start one.</div>}
        </div>
      ) : (
        <div className="rail-body" ref={bodyRef}>
          {turns.length === 0 && (
            <div className="rail-empty">
              Ask Vector to work this page. Browsing stays in the address field.
            </div>
          )}
          {turns.map((r) => (
            <div className="chat-turn" key={r.runId}>
              <div className="chat-bubble user">{r.goal}</div>
              <AgentCard r={r} />
            </div>
          ))}
          {chatQueue.map((q, i) => (
            <div className="chat-turn" key={`q${i}`}>
              <div className="chat-bubble user queued">{q}<span className="queued-tag">queued</span></div>
            </div>
          ))}
        </div>
      )}
      <div className="composer">
        <textarea
          ref={inputRef}
          value={text}
          rows={1}
          placeholder="Ask or tell the agent…"
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <button className="composer-send" title="Send" disabled={!text.trim() || sending} onClick={() => void send()}>
          {I.send}
        </button>
      </div>
      <ResizeHandle side="right" value={railWidth} min={272} max={560} reset={340} onResize={setRailWidth} />
    </div>
  );
}
