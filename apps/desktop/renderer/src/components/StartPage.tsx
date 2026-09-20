import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useStore } from "../store";
import { CommandBar } from "./CommandBar";
import { recentConversations } from "../conversations";
import { RunImages } from "./Conversation";
import { I } from "./icons";
import { bridge } from "../bridge";

const PROMPTS = ["Summarize the open review comments on this PR", "Compare these pricing pages", "Collect the talk titles on this schedule"];

/** A quiet landing surface; recent work comes from the persisted runtime. */
export function StartPage() {
  const runs = useStore(s => s.runs);
  const focus = useStore(s => s.focusCommandBar);
  const [suggested, setSuggested] = useState(false);
  useEffect(() => { focus("hero"); }, [focus]);
  return <div className="start aux-home"><div className="start-inner">
    <img className="aux-mark" src="./aux-icon.svg" alt="Aux" width="64" height="64" draggable={false} />
    <CommandBar hero />
    {bridge.privateMode ? <section className="private-home" aria-label="Private browsing">
      <strong>Private browsing</strong>
      <span>Aux won’t save this window’s tabs, history, site data, or permissions. Files you download remain on your Mac.</span>
    </section> : <>
    <section className="home-history">
      <div className="home-section-head"><h2>Chats & tasks</h2><button onClick={() => useStore.getState().setOverlay("tasks")}>All tasks {I.right}</button></div>
      <div className="home-cards">
        {recentConversations(runs).slice(0, 3).map(run => <button className="home-card" key={run.runId} aria-label={`Open conversation: ${run.goal}`} onClick={() => useStore.getState().openConversation(run.runId)}>
          <time dateTime={new Date(run.createdAt).toISOString()}>{new Date(run.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time>
          <strong>{run.goal}</strong><div className="home-excerpt"><Markdown remarkPlugins={[remarkGfm]} skipHtml allowedElements={["p", "strong", "em", "code"]} unwrapDisallowed>{run.statusMessage || (run.result ? Object.values(run.result).map(v => typeof v === "string" ? v : JSON.stringify(v)).join("\n") : run.status.replaceAll("_", " "))}</Markdown></div><RunImages runId={run.runId} compact/>
        </button>)}
        {!runs.length && <div className="home-empty">Your conversations will appear here.<span>Choose Ask to start working with Aux.</span></div>}
      </div>
    </section>
    <div className="home-suggestions"><button className="btn ghost" aria-expanded={suggested} onClick={() => setSuggested(v => !v)}>{I.agentSm}{suggested ? "Hide suggested tasks" : "Show suggested tasks"}</button>
      {suggested && <div className="start-suggest">{PROMPTS.map(prompt => <button key={prompt} className="start-suggest-row" onClick={() => { useStore.getState().setAgentDraft(prompt); useStore.getState().openConversation(null); }}>{I.agentSm}<span>{prompt}</span></button>)}</div>}
    </div>
    </>}
  </div></div>;
}
