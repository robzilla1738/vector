import type { RefObject } from "react";
import { I } from "../components/icons";
import { settingsPath, type ConnectionTab } from "./routes";

interface RailItem {
  label: string;
  category: string;
  group: "Personal" | "Agent" | "Features" | "Archived";
  icon: React.ReactNode;
  tab?: ConnectionTab;
  gate?: "memory" | "permissions" | "extensions" | "skills" | "services" | "profiles" | "automations";
}

const items: readonly RailItem[] = [
  { label: "General", category: "General", group: "Personal", icon: I.gear },
  { label: "Appearance", category: "Appearance", group: "Personal", icon: I.sun },
  { label: "Profiles", category: "Profiles", group: "Personal", icon: I.chats, gate: "profiles" },
  { label: "Privacy & Security", category: "Site permissions", group: "Personal", icon: I.lock, gate: "permissions" },
  { label: "Passwords & Autofill", category: "Passwords & Autofill", group: "Personal", icon: I.lock },
  { label: "Agents", category: "Agent permissions", group: "Agent", icon: I.chats },
  { label: "Models", category: "Connections", group: "Agent", icon: I.model, tab: "Models" },
  { label: "Usage & Budgets", category: "Usage & Budgets", group: "Agent", icon: I.model },
  { label: "Skills & Plugins", category: "Connections", group: "Agent", icon: I.extension, tab: "Plugins", gate: "skills" },
  { label: "MCP & Connectors", category: "Connections", group: "Agent", icon: I.globe, tab: "Services", gate: "services" },
  { label: "Memory", category: "Memory", group: "Agent", icon: I.chats, gate: "memory" },
  { label: "Workspaces", category: "Workspaces", group: "Agent", icon: I.folder },
  { label: "Automations", category: "Automations", group: "Features", icon: I.clock, gate: "automations" },
  { label: "Quick Ask", category: "Quick Ask", group: "Features", icon: I.chats },
  { label: "Selection & Capture", category: "Selection & Capture", group: "Features", icon: I.result },
  { label: "Developers & External Agents", category: "Connections", group: "Features", icon: I.globe, tab: "Agents" },
  { label: "Extensions", category: "Extensions", group: "Features", icon: I.extension, gate: "extensions" },
  { label: "Archived chats", category: "Archived chats", group: "Archived", icon: I.archive },
];

export function SectionRail({
  category,
  connectionTab,
  searching,
  memoryAvailable,
  profilesAvailable,
  skillsAvailable,
  automationsAvailable,
  servicesAvailable,
  permissionsAvailable,
  extensionsAvailable,
  firstCategory,
  onOpenCategory,
}: {
  category: string;
  connectionTab: ConnectionTab;
  searching: boolean;
  memoryAvailable: boolean;
  profilesAvailable: boolean;
  skillsAvailable: boolean;
  automationsAvailable: boolean;
  servicesAvailable: boolean;
  permissionsAvailable: boolean;
  extensionsAvailable: boolean;
  firstCategory: RefObject<HTMLButtonElement | null>;
  onOpenCategory: (category: string, tab?: ConnectionTab) => void;
}) {
  const selectedPath = settingsPath(category, connectionTab);
  const available = items.filter(item =>
    (!item.gate || (item.gate === "memory" && memoryAvailable) ||
      (item.gate === "profiles" && profilesAvailable) ||
      (item.gate === "permissions" && permissionsAvailable) ||
      (item.gate === "extensions" && extensionsAvailable) ||
      (item.gate === "skills" && skillsAvailable) ||
      (item.gate === "automations" && automationsAvailable) ||
      (item.gate === "services" && servicesAvailable)));
  let lastGroup: RailItem["group"] | null = null;
  return (
    <div className="settings-category-list">
      {available.map(item => {
        const groupStart = item.group !== lastGroup;
        lastGroup = item.group;
        return (
          <div className="settings-rail-item" key={item.label}>
            {groupStart && <span className="settings-rail-group-title">{item.group}</span>}
            <button
              ref={item.label === "General" ? firstCategory : undefined}
              data-category={item.label}
              aria-current={!searching && selectedPath === settingsPath(item.category, item.tab) ? "page" : undefined}
              onClick={() => onOpenCategory(item.category, item.tab)}
            >
              <span className="settings-category-icon">{item.icon}</span>
              {item.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}
