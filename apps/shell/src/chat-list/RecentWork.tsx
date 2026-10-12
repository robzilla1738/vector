import { useChatCollection } from "./use-chat-collection";
import { useChatArtifacts } from "./use-chat-artifacts";
import { staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { smallGhostButtonProps } from "../ui/button-props";
import { bridge } from "../bridge";
import { useEffect, useState } from "react";
import type { Routine } from "@aux/contracts";
import { call, errToast, useStore } from "../store";
import { ConversationDrafts } from "../components/ConversationDrafts";
import { ChatList, savedChat } from "./ChatList";
import { openSavedTask } from "../task-navigation";
import { shellIconOpen, shellIconRight, Zap } from "../ui/icons";
import { RecentWorkEmpty } from "../components/RecentWorkEmpty";
import { Tabs } from "../ui";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

/** Home previews use durable chat titles and results, never invented activity. */
export function RecentWork() {
  const [routineResult, setRoutineResult] = useState<{ workspaceId?: string; items: Routine[] }>({
    items: [],
  });
  const [tab, setTab] = useState<"chats" | "routines">("chats");
  const {
    collection,
    state: chatState,
    items,
  } = useChatCollection({ archived: false, policy: "preview" }, tab === "chats");
  const results = useChatArtifacts(collection, items, tab === "chats");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const workspaceId = useStore(
    (state) => state.layout.spaces.find((space) => space.id === state.layout.activeSpaceId)?.workspaceId,
  );
  const routines = routineResult.workspaceId === workspaceId ? routineResult.items : [];
  useEffect(() => {
    const update = () => setRefresh((value) => value + 1);
    window.addEventListener("focus", update);
    const off = bridge.onEvent((event) => {
      if (event.type === "routine.updated") update();
    });
    return () => {
      window.removeEventListener("focus", update);
      off();
    };
  }, []);
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    if (tab === "chats") {
      setLoading(false);
      return;
    }
    const fetch = (
      workspaceId ? call("routines.list", { workspaceId, includeArchived: false }) : Promise.resolve([])
    ).then((found) => {
      if (live) setRoutineResult({ workspaceId, items: found });
    });
    void fetch
      .catch((reason) => {
        if (live) setError(String(reason));
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [refresh, tab, workspaceId]);
  const count = tab === "chats" ? items.length : routines.length;
  const visibleLoading = tab === "chats" ? chatState.loading : loading;
  const visibleError = tab === "chats" ? chatState.error : error;
  return (
    <section className="home-history" aria-label="Recent work">
      <header className="home-section-head">
        <Tabs<"chats" | "routines">
          label="Recent work view"
          value={tab}
          onChange={setTab}
          panelId="recent-work-panel"
          className="history-segment"
          items={[
            { value: "chats", label: "Chats" },
            { value: "routines", label: "Routines" },
          ]}
        />
        <button
          className="home-all"
          onClick={() => {
            if (tab === "routines") useStore.getState().setOverlay("tasks");
            else {
              useStore.getState().openConversation(null);
              useStore.setState({ conversationId: "history" });
            }
          }}
        >
          {tab === "chats" ? "All Chats" : "Manage routines"}
          {shellIconRight}
        </button>
      </header>
      <div
        id="recent-work-panel"
        role="tabpanel"
        aria-labelledby={`recent-work-panel-${tab}`}
        className="home-cards"
        aria-busy={visibleLoading}
      >
        {tab === "chats" ? (
          <ChatList
            rows={items.map((item) => ({ entry: savedChat(item), card: { artifact: results[item.chatId] } }))}
            onOpen={(entry) => {
              if (entry.kind === "saved-chat")
                useStore.getState().openConversation(entry.item.latestRun.runId);
            }}
          />
        ) : (
          routines.slice(0, 3).map((item) => {
            const open = () =>
              item.sourceTaskId
                ? void openSavedTask(item.sourceTaskId).catch(errToast)
                : useStore.getState().setOverlay("tasks");
            return (
              <article className="home-card" key={item.routineId}>
                <button className="home-card-hero" onClick={open} aria-label={item.title}>
                  <span className="home-card-hero-icon">
                    <Zap width={56} height={56} />
                  </span>
                  <span className="home-card-status">
                    {item.paused ? "Paused" : item.trigger.kind === "manual" ? "On demand" : "Scheduled"}
                  </span>
                </button>
                <h3>
                  <button className="home-card-open" onClick={open}>
                    {item.title}
                  </button>
                </h3>
                <p className="home-excerpt">{item.objective}</p>
                <div className="home-card-actions">
                  <button className="home-card-cta" onClick={open}>
                    Open routine
                    {shellIconOpen}
                  </button>
                </div>
              </article>
            );
          })
        )}
        {!visibleLoading && !visibleError && !count && (
          <RecentWorkEmpty view={tab} onCreateTask={() => useStore.getState().setOverlay("tasks")} />
        )}
      </div>
      {tab === "chats" && <ConversationDrafts limit={3} compact exclude={items.map((item) => item.chatId)} />}
      {visibleLoading && !count && (
        <output {...staticHintProps} data-block>
          Loading recent work…
        </output>
      )}
      {visibleError && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          Recent work couldn’t be loaded.{" "}
          <button
            {...smallGhostButtonProps}
            title={visibleError}
            onClick={() => (tab === "chats" ? void collection.retry() : setRefresh((value) => value + 1))}
          >
            Retry
          </button>
        </p>
      )}
    </section>
  );
}
