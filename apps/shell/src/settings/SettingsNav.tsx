import type { RefObject } from "react";
import { shellIconClose, shellIconSearch } from "../components/icons";
import { moveListFocus } from "../keyboard-list";
import { SectionRail } from "./SectionRail";
import type { ConnectionTab } from "./routes";

export function SettingsNav({
  query,
  onQueryChange,
  category,
  connectionTab,
  searching,
  memoryAvailable,
  profilesAvailable,
  linkRoutingAvailable,
  appleScriptAvailable,
  skillsAvailable,
  automationsAvailable,
  servicesAvailable,
  permissionsAvailable,
  extensionsAvailable,
  firstCategory,
  firstSearchResult,
  searchInput,
  onOpenCategory,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  category: string;
  connectionTab: ConnectionTab;
  searching: boolean;
  memoryAvailable: boolean;
  profilesAvailable: boolean;
  linkRoutingAvailable: boolean;
  appleScriptAvailable: boolean;
  skillsAvailable: boolean;
  automationsAvailable: boolean;
  servicesAvailable: boolean;
  permissionsAvailable: boolean;
  extensionsAvailable: boolean;
  firstCategory: RefObject<HTMLButtonElement | null>;
  firstSearchResult: RefObject<HTMLButtonElement | null>;
  searchInput: RefObject<HTMLInputElement | null>;
  onOpenCategory: (category: string, tab?: ConnectionTab) => void;
}) {
  return (
    <nav
      className="settings-nav"
      aria-label="Settings categories"
      onKeyDown={event => moveListFocus(event, "button[data-category]")}
    >
      <div className="settings-search-box">
        {shellIconSearch}
        <input
          ref={searchInput}
          aria-label="Search settings"
          placeholder="Search settings…"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          onKeyDown={event => {
            if (event.nativeEvent.isComposing || !searching) return;
            if (event.key === "ArrowDown" || event.key === "Enter") {
              event.preventDefault();
              event.stopPropagation();
              firstSearchResult.current?.focus();
            }
          }}
        />
        {query && (
          <button
            className="icon-btn"
            aria-label="Clear settings search"
            onClick={() => {
              onQueryChange("");
              searchInput.current?.focus();
            }}
          >
            {shellIconClose}
          </button>
        )}
      </div>
      <SectionRail
        category={category}
        connectionTab={connectionTab}
        searching={searching}
        memoryAvailable={memoryAvailable}
        profilesAvailable={profilesAvailable}
        linkRoutingAvailable={linkRoutingAvailable}
        appleScriptAvailable={appleScriptAvailable}
        skillsAvailable={skillsAvailable}
        automationsAvailable={automationsAvailable}
        servicesAvailable={servicesAvailable}
        permissionsAvailable={permissionsAvailable}
        extensionsAvailable={extensionsAvailable}
        firstCategory={firstCategory}
        onOpenCategory={onOpenCategory}
      />
    </nav>
  );
}
