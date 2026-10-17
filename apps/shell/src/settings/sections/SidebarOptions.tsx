import { staticRowProps } from "../../ui/class-props";
import { runCommand } from "../../commands";
import { useStore } from "../../store";
import { bridge } from "../../bridge";
import { useEffect, useRef, useState } from "react";
import { SettingsField } from "../primitives";
import { Menu, Switch } from "../../ui";
import { Tooltip } from "../../ui/tooltip";
import { shellIconBookmark, shellIconChats, shellIconCheck, shellIconDown } from "../../ui/icons";

const sections = [
  { id: "bookmarks", label: "Bookmarks" },
  { id: "chats", label: "Chats" },
  { id: "tabs", label: "Tabs" },
] as const;

export function SidebarOptions({
  active,
  settings,
  onSave,
}: {
  active: boolean;
  settings: Record<string, unknown>;
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
}) {
  const vertical = settings.tabLayout !== "horizontal";
  const bookmarksVisible = settings.sidebarBookmarksVisible !== false;
  const [menuOpen, setMenuOpen] = useState(false);
  const [savingBookmarks, setSavingBookmarks] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!active || !vertical) setMenuOpen(false);
  }, [active, vertical]);

  return (
    <>
      {vertical ? (
        <>
          <SettingsField
            compact
            label="New tab position"
            hint="Choose where new tabs are added in the sidebar."
          >
            <select
              aria-label="New tab position"
              value={String(settings.verticalTabInsertionPosition ?? "top")}
              onChange={(event) => void onSave({ verticalTabInsertionPosition: event.target.value })}
            >
              <option value="top">At top</option>
              <option value="bottom">At bottom</option>
            </select>
          </SettingsField>
          <SettingsField
            compact
            label="Customize sidebar"
            hint="Choose which sections appear above your tabs."
          >
            <button
              ref={trigger}
              className="btn btn-sm settings-sidebar-menu-trigger"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              disabled={bridge.privateMode}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span>{bookmarksVisible ? "Chats, Bookmarks" : "Chats"}</span>
              {shellIconDown}
            </button>
            {menuOpen && (
              <Menu
                label="Customize sidebar"
                anchor={trigger}
                returnFocus={trigger}
                onClose={() => setMenuOpen(false)}
              >
                <Tooltip content="Chats always stay in the sidebar.">
                  {(id) => (
                    <span aria-describedby={id}>
                      <button className="menu-item" role="menuitemcheckbox" aria-checked disabled>
                        {shellIconChats}
                        <span>Chats</span>
                        {shellIconCheck}
                      </button>
                    </span>
                  )}
                </Tooltip>
                <button
                  className="menu-item"
                  role="menuitemcheckbox"
                  aria-checked={bookmarksVisible}
                  disabled={savingBookmarks}
                  onClick={async () => {
                    setSavingBookmarks(true);
                    try {
                      await onSave({ sidebarBookmarksVisible: !bookmarksVisible });
                    } finally {
                      setSavingBookmarks(false);
                    }
                  }}
                >
                  {shellIconBookmark}
                  <span>Bookmarks</span>
                  {bookmarksVisible && shellIconCheck}
                </button>
              </Menu>
            )}
          </SettingsField>
          <SettingsField
            compact
            label="Recent chats in sidebar"
            hint="How many recent chats to show in the sidebar."
          >
            <select
              aria-label="Recent chats in sidebar"
              value={Number(settings.sidebarRecentChatLimit ?? 3)}
              onChange={(event) => void onSave({ sidebarRecentChatLimit: Number(event.target.value) })}
            >
              {[3, 5, 10].map((count) => (
                <option key={count} value={count}>
                  {count} chats
                </option>
              ))}
            </select>
          </SettingsField>
        </>
      ) : (
        <SettingsField compact label="Shrink tabs to fit" hint="Tabs shrink to fit as the tab bar fills up.">
          <Switch
            aria-label="Shrink tabs to fit"
            checked={settings.horizontalTabShrinkToFit === true}
            onChange={() =>
              void onSave({ horizontalTabShrinkToFit: settings.horizontalTabShrinkToFit !== true })
            }
          />
        </SettingsField>
      )}
    </>
  );
}

export function SidebarDetails({
  settings,
  onSave,
}: {
  settings: Record<string, unknown>;
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
}) {
  const sidebar = useStore((state) => state.sidebar);
  const width = useStore((state) => state.sidebarWidth);
  const open = useStore((state) => state.sidebarSections);
  const setWidth = useStore((state) => state.setSidebarWidth);
  const toggle = useStore((state) => state.toggleSidebarSection);
  const autoHide = settings.toolbarAutoHide !== false;
  const bookmarksVisible = settings.sidebarBookmarksVisible !== false;
  return (
    <>
      <SettingsField
        compact
        label="Keep sidebar open"
        hint="Turn off to reveal the sidebar from the left edge. ⌘S toggles it."
      >
        <Switch
          aria-label="Keep sidebar open"
          checked={sidebar === "expanded"}
          data-command-id="sidebar"
          onChange={() => runCommand("sidebar")}
        />
      </SettingsField>
      <SettingsField
        compact
        label="Auto-hide toolbar"
        hint="Reveal the address field from the top edge, or keep it visible."
      >
        <Switch
          aria-label="Auto-hide toolbar"
          checked={autoHide}
          onChange={() => void onSave({ toolbarAutoHide: !autoHide })}
        />
      </SettingsField>
      <SettingsField
        compact
        label="Sidebar width"
        hint="Applies to both tab layouts. You can also drag its edge."
        searchTerms={["resize", "aside"]}
      >
        <select
          aria-label="Sidebar width"
          value={width}
          onChange={(event) => setWidth(Number(event.target.value))}
        >
          {[240, 280, 320, 360].map((value) => (
            <option key={value} value={value}>
              {value} px
            </option>
          ))}
          {![240, 280, 320, 360].includes(width) && <option value={width}>{width} px</option>}
        </select>
      </SettingsField>
      <SettingsField
        label="Sidebar sections"
        hint="Choose which sections start expanded. Their headings stay available so you can reopen them."
        searchTerms={["bookmarks", "chats", "tabs", "aside"]}
      >
        <div className="settings-check-list">
          {sections.map((section) => (
            <label key={section.id} {...staticRowProps}>
              <span>{section.label}</span>
              <Switch
                aria-label={`Expand ${section.label} in sidebar`}
                checked={open[section.id]}
                disabled={
                  (bridge.privateMode && section.id !== "tabs") ||
                  (section.id === "bookmarks" && !bookmarksVisible)
                }
                onChange={() => toggle(section.id)}
              />
            </label>
          ))}
        </div>
      </SettingsField>
    </>
  );
}
