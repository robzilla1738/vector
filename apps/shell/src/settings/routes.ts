export type MemoryView = "overview" | "history" | "context" | "configure";
export const memoryViews: readonly { view: MemoryView; label: string }[] = [
  { view: "overview", label: "Overview" },
  { view: "history", label: "History" },
  { view: "context", label: "Context awareness" },
  { view: "configure", label: "Configure" },
];

export type ConnectionTab = "Models" | "Services" | "Agents" | "Vault" | "Plugins";

export interface SettingsRoute {
  memoryView?: MemoryView;
  category: string;
  connectionTab?: ConnectionTab;
  slug: string;
}

const routes: readonly SettingsRoute[] = [
  { slug: "downloads", category: "Downloads" },
  { slug: "general", category: "General" },
  { slug: "labs", category: "Labs" },
  { slug: "appearance", category: "Appearance" },
  { slug: "profiles", category: "Profiles" },
  { slug: "link-routing", category: "Link Routing" },
  { slug: "advanced", category: "Advanced" },
  { slug: "passwords-autofill", category: "Passwords & Autofill" },
  { slug: "privacy-security", category: "Site permissions" },
  { slug: "vault", category: "Connections", connectionTab: "Vault" },
  { slug: "permissions", category: "Permissions" },
  { slug: "agents", category: "Permissions" },
  { slug: "models", category: "Connections", connectionTab: "Models" },
  { slug: "usage-budgets", category: "Usage & Budgets" },
  { slug: "routines", category: "Routines" },
  { slug: "quick-ask", category: "Quick Ask" },
  { slug: "selection-capture", category: "Selection & Capture" },
  { slug: "archived-chats", category: "Archived chats" },
  { slug: "skills-plugins", category: "Connections", connectionTab: "Plugins" },
  { slug: "mcp-connectors", category: "Connections", connectionTab: "Services" },
  { slug: "memory", category: "Memory" },
  ...memoryViews
    .filter(({ view }) => view !== "overview")
    .map(({ view }) => ({ slug: `memory-${view}`, category: "Memory", memoryView: view })),
  { slug: "projects", category: "Projects" },
  { slug: "developers-external-agents", category: "Connections", connectionTab: "Agents" },
  { slug: "extensions", category: "Extensions" },
];

export function settingsRouteFromPath(pathname: string): SettingsRoute | null {
  const match = /^\/settings\/([a-z-]+)\/?$/.exec(pathname);
  return routes.find((route) => route.slug === match?.[1]) ?? null;
}

/** Internal shell URLs must stay in the top WebUI, never open as guest tabs. */
export function auxShellPathFromUrl(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "chrome:" || url.hostname !== "aux") return null;
  if (url.search || url.hash) throw new Error("This Aux page isn't available.");
  if (url.pathname === "/") return "/";
  const route = settingsRouteFromPath(url.pathname);
  if (!route) throw new Error("This Aux page isn't available.");
  return `/settings/${route.slug}`;
}

export function settingsPath(
  category: string,
  connectionTab: ConnectionTab = "Services",
  memoryView: MemoryView = "overview",
): string {
  if (category === "Memory" && memoryView !== "overview") return `/settings/memory-${memoryView}`;
  const legacyTab: ConnectionTab | null =
    category === "Models"
      ? "Models"
      : category === "External agents"
        ? "Agents"
        : category === "Vault"
          ? "Vault"
          : null;
  const route =
    category === "Connections" || legacyTab
      ? routes.find(
          (item) => item.category === "Connections" && item.connectionTab === (legacyTab ?? connectionTab),
        )
      : routes.find((item) => item.category === category);
  return `/settings/${route?.slug ?? "general"}`;
}

export function pushSettingsPath(category: string, connectionTab?: ConnectionTab, memoryView?: MemoryView) {
  const path = settingsPath(category, connectionTab, memoryView);
  if (window.location.pathname !== path) window.history.pushState(null, "", path);
}
