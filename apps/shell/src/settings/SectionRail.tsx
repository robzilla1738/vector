import { memoryViews, type MemoryView } from "./routes";
import type { RefObject } from "react";
import {
  shellIconDownloadSm,
  shellIconArchive,
  shellIconCode,
  shellIconCube,
  shellIconExtension,
  shellIconGear,
  shellIconGlobe,
  shellIconGrid,
  shellIconSliders,
  shellIconFilter,
  shellIconLock,
  shellIconModel,
  shellIconResult,
  shellIconPerson,
} from "../ui/icons";
import { settingsPath, type ConnectionTab } from "./routes";
import {
  settingsIconAppearance,
  settingsIconProfiles,
  settingsIconUsage,
  settingsIconUsageActive,
  settingsIconArchivedActive,
  settingsIconGeneral,
  settingsIconPrivacy,
  settingsIconAgents,
  settingsIconAgentsActive,
  settingsIconModelsActive,
  settingsIconSkills,
  settingsIconSkillsActive,
  settingsIconAwareness,
  settingsIconAwarenessActive,
  settingsIconChannels,
  settingsIconChannelsActive,
  settingsIconDevelopers,
  settingsIconDevelopersActive,
  settingsIconOverviewActive,
  settingsIconHistory,
  settingsIconHistoryActive,
  settingsIconProjects,
  settingsIconProjectsActive,
  settingsIconPasswords,
  settingsIconPasswordsActive,
  settingsIconRoutines,
  settingsIconRoutinesActive,
  settingsIconQuickAsk,
  settingsIconQuickAskActive,
} from "./rail-icons";

interface RailItem {
  label: string;
  category: string;
  group: "Personal" | "Agent" | "Features" | "Archived";
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  tab?: ConnectionTab;
  gate?:
    | "smartDownloadNames"
    | "memory"
    | "desktopContext"
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
  {
    label: "General",
    category: "General",
    group: "Personal",
    icon: settingsIconGeneral,
    activeIcon: shellIconGear,
  },
  { label: "Appearance", category: "Appearance", group: "Personal", icon: settingsIconAppearance },
  {
    label: "Profiles",
    category: "Profiles",
    group: "Personal",
    icon: settingsIconProfiles,
    activeIcon: shellIconPerson,
    gate: "profiles",
  },
  {
    label: "Usage & Budgets",
    category: "Usage & Budgets",
    group: "Personal",
    icon: settingsIconUsage,
    activeIcon: settingsIconUsageActive,
  },
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
    icon: settingsIconPrivacy,
    activeIcon: shellIconLock,
    gate: "permissions",
  },
  {
    label: "Agents",
    category: "Permissions",
    group: "Agent",
    icon: settingsIconAgents,
    activeIcon: settingsIconAgentsActive,
  },
  {
    label: "Projects",
    category: "Projects",
    group: "Agent",
    icon: settingsIconProjects,
    activeIcon: settingsIconProjectsActive,
  },
  {
    label: "Models",
    category: "Connections",
    group: "Agent",
    icon: shellIconCube,
    activeIcon: settingsIconModelsActive,
    tab: "Models",
  },
  {
    label: "Skills & MCP",
    category: "Connections",
    group: "Agent",
    icon: settingsIconSkills,
    activeIcon: settingsIconSkillsActive,
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
  {
    label: "Desktop context",
    category: "Desktop context",
    group: "Agent",
    icon: settingsIconAwareness,
    activeIcon: settingsIconAwarenessActive,
    gate: "desktopContext",
  },
  { label: "Memory", category: "Memory", group: "Agent", icon: shellIconModel, gate: "memory" },
  {
    label: "Passwords & Autofill",
    category: "Passwords & Autofill",
    group: "Features",
    icon: settingsIconPasswords,
    activeIcon: settingsIconPasswordsActive,
  },
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
    icon: settingsIconRoutines,
    activeIcon: settingsIconRoutinesActive,
    gate: "automations",
  },
  {
    label: "Channels",
    category: "Channels",
    group: "Features",
    icon: settingsIconChannels,
    activeIcon: settingsIconChannelsActive,
  },
  {
    label: "Quick Ask",
    category: "Quick Ask",
    group: "Features",
    icon: settingsIconQuickAsk,
    activeIcon: settingsIconQuickAskActive,
  },
  { label: "Selection & Capture", category: "Selection & Capture", group: "Features", icon: shellIconResult },
  {
    label: "Developers",
    category: "Connections",
    group: "Features",
    icon: settingsIconDevelopers,
    activeIcon: settingsIconDevelopersActive,
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
  {
    label: "Archived chats",
    category: "Archived chats",
    group: "Archived",
    icon: shellIconArchive,
    activeIcon: settingsIconArchivedActive,
  },
];

const memoryIcons: Record<MemoryView, { icon: React.ReactNode; activeIcon: React.ReactNode }> = {
  overview: { icon: shellIconGrid, activeIcon: settingsIconOverviewActive },
  history: { icon: settingsIconHistory, activeIcon: settingsIconHistoryActive },
  context: { icon: settingsIconAwareness, activeIcon: settingsIconAwarenessActive },
  configure: { icon: shellIconSliders, activeIcon: shellIconFilter },
};

export function SectionRail({
  category,
  connectionTab,
  memoryView = "overview",
  onOpenMemoryView,
  searching,
  memoryAvailable,
  desktopContextAvailable = false,
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
  desktopContextAvailable?: boolean;
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
      (item.gate === "desktopContext" && desktopContextAvailable) ||
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
        const selected =
          !searching &&
          !(item.category === "Memory" && onOpenMemoryView) &&
          selectedPath === settingsPath(item.category, item.tab);
        return (
          <div className="settings-rail-item" key={item.label}>
            {groupStart && <span className="settings-rail-group-title">{item.group}</span>}
            <button
              ref={item.label === "General" ? firstCategory : undefined}
              data-category={item.label}
              title={item.label}
              aria-current={selected ? "page" : undefined}
              onClick={() => onOpenCategory(item.category, item.tab)}
            >
              <span className="settings-category-icon">
                {selected ? (item.activeIcon ?? item.icon) : item.icon}
              </span>
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
                      {memoryView === view ? memoryIcons[view].activeIcon : memoryIcons[view].icon}
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
