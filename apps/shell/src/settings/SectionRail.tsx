import type { RefObject } from "react";
import {
  shellIconDownloadSm,
  shellIconArchive,
  shellIconChats,
  shellIconClock,
  shellIconCode,
  shellIconExtension,
  shellIconFolder,
  shellIconGear,
  shellIconGlobe,
  shellIconLock,
  shellIconModel,
  shellIconResult,
  shellIconSun,
} from "../ui/icons";
import { settingsPath, type ConnectionTab } from "./routes";

interface RailItem {
  label: string;
  category: string;
  group: "Personal" | "Agent" | "Features" | "Archived";
  icon: React.ReactNode;
  tab?: ConnectionTab;
  gate?:
    | "smartDownloadNames"
    | "memory"
    | "permissions"
    | "extensions"
    | "skills"
    | "services"
    | "profiles"
    | "automations"
    | "linkRouting"
    | "appleScript";
}

const items: readonly RailItem[] = [
  {
    label: "Downloads",
    category: "Downloads",
    group: "Personal",
    icon: shellIconDownloadSm,
    gate: "smartDownloadNames",
  },
  { label: "General", category: "General", group: "Personal", icon: shellIconGear },
  { label: "Appearance", category: "Appearance", group: "Personal", icon: shellIconSun },
  { label: "Profiles", category: "Profiles", group: "Personal", icon: shellIconChats, gate: "profiles" },
  {
    label: "Link Routing",
    category: "Link Routing",
    group: "Personal",
    icon: shellIconGlobe,
    gate: "linkRouting",
  },
  { label: "Advanced", category: "Advanced", group: "Personal", icon: shellIconCode, gate: "appleScript" },
  {
    label: "Privacy & Security",
    category: "Site permissions",
    group: "Personal",
    icon: shellIconLock,
    gate: "permissions",
  },
  { label: "Passwords & Autofill", category: "Passwords & Autofill", group: "Personal", icon: shellIconLock },
  { label: "Agents", category: "Agent permissions", group: "Agent", icon: shellIconChats },
  { label: "Models", category: "Connections", group: "Agent", icon: shellIconModel, tab: "Models" },
  { label: "Usage & Budgets", category: "Usage & Budgets", group: "Agent", icon: shellIconModel },
  {
    label: "Skills & Plugins",
    category: "Connections",
    group: "Agent",
    icon: shellIconExtension,
    tab: "Plugins",
    gate: "skills",
  },
  {
    label: "MCP & Connectors",
    category: "Connections",
    group: "Agent",
    icon: shellIconGlobe,
    tab: "Services",
    gate: "services",
  },
  { label: "Memory", category: "Memory", group: "Agent", icon: shellIconChats, gate: "memory" },
  { label: "Workspaces", category: "Workspaces", group: "Agent", icon: shellIconFolder },
  {
    label: "Automations",
    category: "Automations",
    group: "Features",
    icon: shellIconClock,
    gate: "automations",
  },
  { label: "Quick Ask", category: "Quick Ask", group: "Features", icon: shellIconChats },
  { label: "Selection & Capture", category: "Selection & Capture", group: "Features", icon: shellIconResult },
  {
    label: "Developers & External Agents",
    category: "Connections",
    group: "Features",
    icon: shellIconGlobe,
    tab: "Agents",
  },
  {
    label: "Extensions",
    category: "Extensions",
    group: "Features",
    icon: shellIconExtension,
    gate: "extensions",
  },
  { label: "Labs", category: "Labs", group: "Features", icon: shellIconGear },
  { label: "Archived chats", category: "Archived chats", group: "Archived", icon: shellIconArchive },
];

export function SectionRail({
  category,
  connectionTab,
  searching,
  memoryAvailable,
  downloadNamingAvailable,
  profilesAvailable,
  linkRoutingAvailable,
  appleScriptAvailable,
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
  downloadNamingAvailable: boolean;
  profilesAvailable: boolean;
  linkRoutingAvailable: boolean;
  appleScriptAvailable: boolean;
  skillsAvailable: boolean;
  automationsAvailable: boolean;
  servicesAvailable: boolean;
  permissionsAvailable: boolean;
  extensionsAvailable: boolean;
  firstCategory: RefObject<HTMLButtonElement | null>;
  onOpenCategory: (category: string, tab?: ConnectionTab) => void;
}) {
  const selectedPath = settingsPath(category, connectionTab);
  const available = items.filter(
    (item) =>
      !item.gate ||
      (item.gate === "memory" && memoryAvailable) ||
      (item.gate === "smartDownloadNames" && downloadNamingAvailable) ||
      (item.gate === "profiles" && profilesAvailable) ||
      (item.gate === "linkRouting" && linkRoutingAvailable) ||
      (item.gate === "appleScript" && appleScriptAvailable) ||
      (item.gate === "permissions" && permissionsAvailable) ||
      (item.gate === "extensions" && extensionsAvailable) ||
      (item.gate === "skills" && skillsAvailable) ||
      (item.gate === "automations" && automationsAvailable) ||
      (item.gate === "services" && servicesAvailable),
  );
  return (
    <div className="settings-category-list">
      {available.map((item, index) => {
        const groupStart = item.group !== available[index - 1]?.group;
        return (
          <div className="settings-rail-item" key={item.label}>
            {groupStart && <span className="settings-rail-group-title">{item.group}</span>}
            <button
              ref={item.label === "General" ? firstCategory : undefined}
              data-category={item.label}
              aria-current={
                !searching && selectedPath === settingsPath(item.category, item.tab) ? "page" : undefined
              }
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
