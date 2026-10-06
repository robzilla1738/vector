import { staticRowProps } from "../../ui/class-props";
import { runCommand } from "../../commands";
import { useStore } from "../../store";
import { bridge } from "../../bridge";
import { call } from "../../store/shared";
import { SettingsField } from "../primitives";
import { nativeCheckboxTypeProps } from "../../ui/native-attribute-props";

const sections = [
  { id: "bookmarks", label: "Bookmarks" },
  { id: "chats", label: "Chats" },
  { id: "tabs", label: "Tabs" },
] as const;

export function SidebarOptions() {
  const sidebar = useStore((state) => state.sidebar);
  const autoHide = useStore((state) => state.settings.toolbarAutoHide !== false);
  const width = useStore((state) => state.sidebarWidth);
  const open = useStore((state) => state.sidebarSections);
  const setWidth = useStore((state) => state.setSidebarWidth);
  const toggle = useStore((state) => state.toggleSidebarSection);

  return (
    <>
      <SettingsField
        compact
        label="Keep sidebar open"
        hint="Turn off to reveal the sidebar from the left edge. ⌘S toggles it."
      >
        <input
          {...nativeCheckboxTypeProps}
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
        <input
          {...nativeCheckboxTypeProps}
          aria-label="Auto-hide toolbar"
          checked={autoHide}
          onChange={() =>
            void call("settings.set", { toolbarAutoHide: !autoHide }).catch((error: unknown) =>
              useStore.getState().toast(String(error), "error"),
            )
          }
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
              <input
                {...nativeCheckboxTypeProps}
                aria-label={`Expand ${section.label} in sidebar`}
                checked={open[section.id]}
                disabled={bridge.privateMode && section.id !== "tabs"}
                onChange={() => toggle(section.id)}
              />
              <span>{section.label}</span>
            </label>
          ))}
        </div>
      </SettingsField>
    </>
  );
}
