import { SearchField } from "../ui";
import type { RefObject } from "react";
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
  downloadNamingAvailable,
  profilesAvailable,
  linkRoutingAvailable,
  appleScriptAvailable,
  pluginsAvailable,
  automationsAvailable,
  servicesAvailable,
  vaultAvailable,
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
  downloadNamingAvailable: boolean;
  profilesAvailable: boolean;
  linkRoutingAvailable: boolean;
  appleScriptAvailable: boolean;
  pluginsAvailable: boolean;
  automationsAvailable: boolean;
  servicesAvailable: boolean;
  vaultAvailable: boolean;
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
      onKeyDown={(event) => {
        const rail = event.currentTarget.querySelector(".settings-category-list");
        moveListFocus(
          event,
          "button[data-category]",
          !rail || getComputedStyle(rail).flexDirection !== "row",
        );
      }}
    >
      <SearchField
        className="settings-search-box"
        controlRef={searchInput}
        label="Search settings"
        placeholder="Search settings…"
        value={query}
        clearLabel="Clear settings search"
        onClear={() => onQueryChange("")}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || !searching) return;
          if (event.key === "ArrowDown" || event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            firstSearchResult.current?.focus();
          }
        }}
      />
      <SectionRail
        category={category}
        connectionTab={connectionTab}
        searching={searching}
        memoryAvailable={memoryAvailable}
        downloadNamingAvailable={downloadNamingAvailable}
        profilesAvailable={profilesAvailable}
        linkRoutingAvailable={linkRoutingAvailable}
        appleScriptAvailable={appleScriptAvailable}
        pluginsAvailable={pluginsAvailable}
        automationsAvailable={automationsAvailable}
        servicesAvailable={servicesAvailable}
        vaultAvailable={vaultAvailable}
        permissionsAvailable={permissionsAvailable}
        extensionsAvailable={extensionsAvailable}
        firstCategory={firstCategory}
        onOpenCategory={onOpenCategory}
      />
    </nav>
  );
}
