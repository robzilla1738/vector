import { SessionRecovery } from "./SessionRecovery";
import { AuxMark } from "./AuxMark";
import { useEffect, useState } from "react";
import { useStore } from "../store";
import { CommandBar } from "./CommandBar";
import { bridge } from "../bridge";
import { RecentWork } from "./RecentWork";

/** Browsing starts with one input; saved work stays one step away. */
export function StartPage() {
  const focus = useStore(s => s.focusCommandBar);
  const [recentOpen, setRecentOpen] = useState(false);
  useEffect(() => { focus("hero"); }, [focus]);
  return <div className="start aux-home"><div className="start-inner">
    <AuxMark />
    <CommandBar hero />
    {bridge.privateMode ? <section className="private-home" aria-label="Private browsing">
      <strong>Private browsing</strong>
      <span>Aux won’t save this window’s tabs, history, site data, or permissions. Files you download remain on your Mac.</span>
    </section> : <>
      <SessionRecovery compact />
      <nav className="home-shortcuts" aria-label="Saved work">
        <button aria-expanded={recentOpen} onClick={() => setRecentOpen(value => !value)}>Recent</button>
        <button onClick={() => { useStore.getState().openConversation(null); useStore.setState({ conversationId: "history" }); }}>Chats & drafts</button>
        <button onClick={() => useStore.getState().setOverlay("tasks")}>Tasks</button>
      </nav>
      {recentOpen && <RecentWork />}
    </>}
  </div></div>;
}
