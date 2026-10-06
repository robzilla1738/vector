import type { ReactNode } from "react";
import { PreferenceAction } from "../../settings/sections/preference-command";
import { nativeAlertRoleProps, nativeButtonTypeProps } from "../../ui/native-attribute-props";
import { shellIconSend } from "../../ui/icons";
import { SearchResultRow } from "../SearchResultRow";
import type { Suggestion } from "../command-provider-types";

export const PROVIDER_SCOPES = [
  "all",
  "tabs",
  "closed",
  "bookmarks",
  "history",
  "extensions",
  "sites",
  "work",
] as const;
export type ProviderScope = (typeof PROVIDER_SCOPES)[number];
const sections: Record<Suggestion["section"], string> = {
  intent: "",
  browser: "Browser",
  suggest: "Suggestions",
  tabs: "Open tabs",
  domains: "Top sites",
  bookmarks: "Bookmarks",
  closed: "Recently Closed",
  history: "History",
  extensions: "Extensions",
  recent: "Recent",
  programs: "Saved programs",
  runs: "Conversations",
  results: "Saved results",
  skills: "Skills",
  chats: "Conversations",
  tasks: "Tasks",
  memory: "Saved notes",
  sets: "Sets",
};
const scopes: Record<ProviderScope, string> = {
  all: "All",
  tabs: "Open Tabs",
  closed: "Recently Closed",
  bookmarks: "Bookmarks",
  history: "History",
  extensions: "Extensions",
  sites: "Sites",
  work: "Work",
};

type Props = {
  popup: { above: boolean; height: number };
  privateMode: boolean;
  extensionEnabled: boolean;
  providerScope: ProviderScope;
  onScope: (scope: ProviderScope) => void;
  rankingOpen: boolean;
  onRankingToggle: () => void;
  searchSuggestions: boolean;
  status: ReactNode;
  browserError: string | null;
  retry: () => void;
  listId: string;
  generation: number;
  resultSource?: "registry" | "history";
  suggestions: Suggestion[];
  selected: number;
  onHover: (index: number) => void;
  onSelect: (suggestion: Suggestion) => void;
  onOptionRef: (index: number, element: HTMLDivElement | null) => void;
  commandQuery: boolean;
  query: string;
  rankingDetails: ReactNode;
};

/** Result presentation is independent of browser and saved-work query lifetimes. */
export function OmniboxResults(p: Props) {
  return (
    <div
      className="cb-pop"
      style={{
        maxHeight: p.popup.height,
        ...(p.popup.above ? { top: "auto", bottom: "calc(100% + 6px)" } : {}),
      }}
      onMouseDown={(event) => event.preventDefault()}
    >
      {p.status}
      <div className="cb-provider-scopes" role="group" aria-label="Search providers">
        {PROVIDER_SCOPES.filter((scope) => scope !== "extensions" || p.extensionEnabled).map((scope) => (
          <button
            key={scope}
            {...nativeButtonTypeProps}
            aria-pressed={p.providerScope === scope}
            title={`Alt+${PROVIDER_SCOPES.indexOf(scope) + 1}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => p.onScope(scope)}
          >
            {scopes[scope]}
          </button>
        ))}
        {!p.privateMode && (
          <button
            {...nativeButtonTypeProps}
            className="cb-ranking-toggle"
            aria-expanded={p.rankingOpen}
            onMouseDown={(event) => event.preventDefault()}
            onClick={p.onRankingToggle}
          >
            Ranking
          </button>
        )}
      </div>
      {p.searchSuggestions && (
        <p className="cb-suggestion-privacy">
          Search suggestions may be sent to your configured search provider.
        </p>
      )}
      {p.browserError && (
        <div className="cb-provider-error" {...nativeAlertRoleProps}>
          Browser suggestions couldn’t load. You can still search.
          <PreferenceAction
            type="button"
            command="retry-browser-autocomplete"
            scopeId={p.listId}
            invoke={p.retry}
          >
            Try again
          </PreferenceAction>
        </div>
      )}
      {p.suggestions.length === 0 && (
        <p className="cb-empty">
          No {p.providerScope === "all" ? "results" : p.providerScope} matches. Choose another provider or
          edit the query.
        </p>
      )}
      <div
        role="listbox"
        id={p.listId}
        data-command-results-source={p.resultSource}
        data-command-results-generation={p.resultSource ? p.generation : undefined}
      >
        {p.suggestions.map((suggestion, index) => {
          const first = index === 0 || p.suggestions[index - 1]!.section !== suggestion.section;
          const source =
            p.resultSource &&
            (p.resultSource === "registry"
              ? "commandId" in suggestion
              : suggestion.section === "history" || suggestion.providerType === "history")
              ? p.resultSource
              : undefined;
          return (
            <div
              key={suggestion.id}
              data-command-id={
                p.commandQuery && "commandId" in suggestion ? String(suggestion.commandId) : undefined
              }
            >
              {first && suggestion.section !== "intent" && (
                <div className="cb-section">{sections[suggestion.section]}</div>
              )}
              <SearchResultRow
                id={`${p.listId}-opt-${index}`}
                resultSource={source}
                resultGeneration={source ? p.generation : undefined}
                selected={index === p.selected}
                className={`cb-opt ${suggestion.section}`}
                title={suggestion.title}
                detail={suggestion.detail}
                icon={suggestion.icon}
                query={p.query}
                elementRef={(node) => p.onOptionRef(index, node)}
                onHover={() => p.onHover(index)}
                onSelect={() => p.onSelect(suggestion)}
                trailing={
                  suggestion.hint === "↵" ? (
                    <span className="cb-go" aria-hidden="true">
                      {shellIconSend}
                    </span>
                  ) : suggestion.hint ? (
                    <kbd>{suggestion.hint}</kbd>
                  ) : null
                }
              />
            </div>
          );
        })}
      </div>
      {p.rankingDetails}
      <div className="cb-search-keys">
        <span>
          <kbd>Enter</kbd> choose
        </span>
        <span>
          <kbd>Esc</kbd> {p.providerScope === "all" ? "close" : "all results"}
        </span>
      </div>
    </div>
  );
}
