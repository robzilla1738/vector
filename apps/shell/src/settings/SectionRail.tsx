import { memoryViews, type MemoryView } from "./routes";
import type { RefObject } from "react";
import {
  shellIconDownloadSm,
  shellIconAgent,
  shellIconArchive,
  shellIconChats,
  shellIconClock,
  shellIconCode,
  shellIconCube,
  shellIconExtension,
  shellIconFolder,
  shellIconGear,
  shellIconGlobe,
  shellIconLock,
  shellIconModel,
  shellIconResult,
  shellIconPerson,
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
    | "plugins"
    | "vault"
    | "services"
    | "profiles"
    | "automations"
    | "linkRouting"
    | "appleScript";
}

const items: readonly RailItem[] = [
  { label: "General", category: "General", group: "Personal", icon: shellIconGear },
  { label: "Appearance", category: "Appearance", group: "Personal", icon: shellIconSun },
  { label: "Profiles", category: "Profiles", group: "Personal", icon: shellIconPerson, gate: "profiles" },
  { label: "Usage & Budgets", category: "Usage & Budgets", group: "Personal", icon: shellIconModel },
  {
    label: "Downloads",
    category: "Downloads",
    group: "Personal",
    icon: shellIconDownloadSm,
    gate: "smartDownloadNames",
  },
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
  { label: "Agents", category: "Permissions", group: "Agent", icon: shellIconAgent },
  { label: "Projects", category: "Projects", group: "Agent", icon: shellIconFolder },
  { label: "Models", category: "Connections", group: "Agent", icon: shellIconCube, tab: "Models" },
  {
    label: "Skills & MCP",
    category: "Connections",
    group: "Agent",
    icon: shellIconExtension,
    tab: "Plugins",
    gate: "plugins",
  },
  {
    label: "Connected services",
    category: "Connections",
    group: "Agent",
    icon: shellIconGlobe,
    tab: "Services",
    gate: "services",
  },
  { label: "Memory", category: "Memory", group: "Agent", icon: shellIconModel, gate: "memory" },
  { label: "Passwords & Autofill", category: "Passwords & Autofill", group: "Features", icon: shellIconLock },
  {
    label: "Vault",
    category: "Connections",
    group: "Features",
    icon: shellIconLock,
    tab: "Vault",
    gate: "vault",
  },
  {
    label: "Routines",
    category: "Routines",
    group: "Features",
    icon: shellIconClock,
    gate: "automations",
  },
  { label: "Quick Ask", category: "Quick Ask", group: "Features", icon: shellIconChats },
  { label: "Selection & Capture", category: "Selection & Capture", group: "Features", icon: shellIconResult },
  {
    label: "Developers",
    category: "Connections",
    group: "Features",
    icon: shellIconCode,
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
  onOpenCategory,
}: {
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
      (item.gate === "plugins" && pluginsAvailable) ||
      (item.gate === "automations" && automationsAvailable) ||
      (item.gate === "services" && servicesAvailable) ||
      (item.gate === "vault" && vaultAvailable),
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
              title={item.label}
              aria-current={
                !searching &&
                !(item.category === "Memory" && onOpenMemoryView) &&
                selectedPath === settingsPath(item.category, item.tab)
                  ? "page"
                  : undefined
              }
              onClick={() => onOpenCategory(item.category, item.tab)}
            >
              <span className="settings-category-icon">{item.icon}</span>
              <span className="settings-category-label">{item.label}</span>
            </button>
            {item.category === "Memory" && category === "Memory" && !searching && onOpenMemoryView && (
              <div className="settings-memory-subnav">
                {memoryViews.map(({ view, label }) => (
                  <button
                    type="button"
                    key={view}
                    data-category={`Memory ${label}`}
                    aria-current={memoryView === view ? "page" : undefined}
                    onClick={() => onOpenMemoryView(view)}
                  >
                    <span className="settings-category-icon">
                      {view === "history"
                        ? shellIconClock
                        : view === "configure"
                          ? shellIconGear
                          : view === "context"
                            ? shellIconSun
                            : shellIconModel}
                    </span>
                    <span className="settings-category-label">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
