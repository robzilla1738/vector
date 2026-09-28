import { useStore } from "../../store";
import { bridge } from "../../bridge";
import { SettingsField } from "../primitives";

const sections = [
  { id: "bookmarks", label: "Bookmarks" },
  { id: "chats", label: "Chats" },
  { id: "tabs", label: "Tabs" },
] as const;

export function SidebarOptions() {
  const width = useStore(state => state.sidebarWidth);
  const open = useStore(state => state.sidebarSections);
  const setWidth = useStore(state => state.setSidebarWidth);
  const toggle = useStore(state => state.toggleSidebarSection);

  return <>
    <SettingsField compact label="Sidebar width" hint="Applies to the vertical sidebar. You can also drag its edge." searchTerms={["resize", "aside"]}>
      <select aria-label="Sidebar width" value={width} onChange={event => setWidth(Number(event.target.value))}>
        {[240, 280, 320, 360].map(value => <option key={value} value={value}>{value} px</option>)}
        {![240, 280, 320, 360].includes(width) && <option value={width}>{width} px</option>}
      </select>
    </SettingsField>
    <SettingsField label="Sidebar sections" hint="Choose which sections start expanded. Their headings stay available so you can reopen them." searchTerms={["bookmarks", "chats", "tabs", "aside"]}>
      <div className="settings-check-list">
        {sections.map(section => <label key={section.id} className="row">
          <input type="checkbox" aria-label={`Expand ${section.label} in sidebar`} checked={open[section.id]}
            disabled={bridge.privateMode && section.id !== "tabs"}
            onChange={() => toggle(section.id)} />
          <span>{section.label}</span>
        </label>)}
      </div>
    </SettingsField>
  </>;
}
