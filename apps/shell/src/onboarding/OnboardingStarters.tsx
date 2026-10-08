import { ONBOARDING_STARTERS, type PageTarget } from "@aux/contracts";
import { bridge } from "../bridge";
import { sourceRef } from "../browser-context-sources";
import { draftKey } from "../conversation-drafts";
import { useStore } from "../store";
import { Button } from "../ui";
import "./onboarding.css";

function availablePage(page: PageTarget): boolean {
  try {
    const url = new URL(page.url);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      page.windowId === bridge.windowId &&
      !page.ownedByRuntime &&
      !page.loading &&
      page.controller !== "agent" &&
      page.controller !== "external" &&
      !["detached", "crashed"].includes(page.viewStatus)
    );
  } catch {
    return false;
  }
}

/** Suggestions only edit the ordinary composer. Sending retains its context and task-mode controls. */
export function OnboardingStarters({
  chatId,
  onChoose,
}: {
  chatId: string | null;
  onChoose(prompt: string): void;
}) {
  const key = chatId ? draftKey(chatId) : "new";
  const draft = useStore((state) => (chatId ? state.conversationDrafts[key] : state.agentDraft));
  const hasRuns = useStore((state) => state.runs.length > 0);
  const source = useStore((state) => {
    const selected = state.conversationBrowserSources[key]?.[0]?.pageId ?? state.conversationContexts[key];
    if (selected) {
      const page = state.pages.byId[selected];
      return page && availablePage(page) ? page : null;
    }
    let latest: PageTarget | null = null;
    for (const id of state.pages.allIds) {
      const page = state.pages.byId[id]!;
      if (availablePage(page) && (!latest || page.lastActiveAt > latest.lastActiveAt)) latest = page;
    }
    return latest;
  });
  if (bridge.privateMode || hasRuns || draft?.trim()) return null;
  return (
    <section className="onboarding-starters" aria-label="Ideas for your first chat">
      <p>
        {source
          ? `Try a question about ${source.title || new URL(source.url).hostname}`
          : "Try a question. Add a tab or link for context."}
      </p>
      <div>
        {ONBOARDING_STARTERS.map((card) => (
          <Button
            key={card.id}
            tone="ghost"
            onClick={() => {
              const state = useStore.getState();
              if (
                source &&
                !state.conversationBrowserSources[key]?.length &&
                !state.conversationContexts[key]
              ) {
                state.setConversationContext(chatId, source.pageId);
                state.setConversationBrowserSources(chatId, [sourceRef(source)]);
              }
              onChoose(card.prompt);
            }}
          >
            {card.question}
          </Button>
        ))}
      </div>
    </section>
  );
}
