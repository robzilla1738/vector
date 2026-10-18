import type { MemoryView } from "./routes";
import { SearchField } from "../ui";
import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { moveListFocus } from "../keyboard-list";
import { SectionRail } from "./SectionRail";
import type { ConnectionTab } from "./routes";

export function SettingsNav({
  query,
  onQueryChange,
  category,
  connectionTab,
  memoryView = "overview",
  onOpenMemoryView,
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
  searchResults,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  category: string;
  connectionTab: ConnectionTab;
  memoryView?: MemoryView;
  onOpenMemoryView?: (view: MemoryView) => void;
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
  searchResults?: ReactNode;
}) {
  const results = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const panel = results.current;
    const input = searchInput.current;
    if (!searching || !panel || !input) return;
    const place = () => {
      const anchor = input.closest(".settings-search-box")!.getBoundingClientRect();
      panel.style.left = `${Math.max(8, Math.min(anchor.left, window.innerWidth - 232))}px`;
      panel.style.top = `${anchor.bottom + 4}px`;
      panel.style.maxHeight = `${Math.max(40, window.innerHeight - anchor.bottom - 12)}px`;
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [searching, searchInput]);
  return (
    <nav
      className="settings-nav"
      aria-label="Settings categories"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onQueryChange("");
      }}
      onKeyDown={(event) => {
        if (searching && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onQueryChange("");
          searchInput.current?.focus();
          return;
        }
        if (results.current?.contains(event.target as Node)) {
          event.stopPropagation();
          if (event.key === "ArrowUp" && event.target === firstSearchResult.current) {
            event.preventDefault();
            searchInput.current?.focus();
          } else moveListFocus(event, ".settings-search-result");
          return;
        }
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
      {searching && (
        <div ref={results} className="settings-search-popup">
          {searchResults}
        </div>
      )}
      <SectionRail
        category={category}
        connectionTab={connectionTab}
        memoryView={memoryView}
        onOpenMemoryView={onOpenMemoryView}
        searching={false}
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
