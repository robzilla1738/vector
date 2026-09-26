export interface SettingsDestination { category: string; label: string; description: string; target?: string }
const entry = (category: string, label: string, description: string, target = label): SettingsDestination => ({ category, label, description, target });
export const settingsDestinations: SettingsDestination[] = [
  entry("Appearance", "Website sizes", "Inspect, search and reset saved per-site page zoom."),
  entry('General', 'Keyword engines', 'Manage site search keywords and shortcuts.'),
  entry('General', 'Search engine', 'Choose where web searches go.'),
  entry('General', 'Default browser', 'Open links in Aux by default.'),
  entry('General', 'Personal info', 'Fill addresses, email and phone fields from your stored profile.'),
  entry('General', 'Import browser data', 'Preview and import bookmarks, history and live tabs from Chrome, Arc, Safari or Firefox.'),
  entry('General', 'Quick Ask', 'Keyboard shortcut for the global assistant popup.'),
  entry('General', 'Keyboard shortcuts', 'Reassign any browser or app shortcut; collisions are explained before saving.'),
  entry('General', 'Browser profiles', 'Separate accounts, sign-ins and browsing data.'),
  entry('General', 'Task data backup', 'Create a backup or restore chats, tasks, Spaces and preferences. Cookies and password stores are never copied.'),
  entry('General', 'Backup retention', 'Keep 3, 5, 10 or 20 complete runtime backups.', 'Task data backup'),
  entry('General', 'Profile credentials', 'Whole-profile restore never copies Cookies, Login Data or Web Data.', 'Task data backup'),
  entry('Vault', 'Agent vault', 'Lock, save and grant site credentials as opaque fill references.'),
  entry('General', 'Data directory', 'Reveal local storage in Finder.'),
  entry('General', 'Browser health', 'Local performance, memory, CPU and crash totals.'),
  entry('General', 'Support report', 'Export diagnostics without private content.'),
  entry('General', 'Clear browsing history', 'Remove browsing records.', 'clear-history'),
  entry('Appearance', 'Theme', 'Use light, dark or the system appearance.'),
  entry('Appearance', 'Native material', 'Choose macOS sidebar blur and transparency presets.'),
  entry('Appearance', 'Sidebar tint', 'Customize sidebar opacity without weakening native blur.'),
  entry('Appearance', 'Content opacity', 'Adjust chat and new-tab surface transparency.'),
  entry('Appearance', 'Interface text', 'Set the shell type size to 12, 13 or 14 pixels. Does not change website zoom.'),
  entry('Appearance', 'Sidebar appearance', 'Translucent native window material or solid surfaces. Respects Reduce Transparency.'),
  entry('Appearance', 'Tab layout', 'Choose horizontal or vertical tabs.'),
  entry('Models', 'Model provider', 'Choose an AI provider or a compatible local endpoint.'),
  entry('Models', 'API key', 'Manage the selected provider’s encrypted credential.', 'Model provider'),
  entry('Models', 'Planner model', 'Choose a model and test the connection.'),
  entry('Models', 'Contributor data use', 'Meta may use prompts and completions sent to the Contributor tier to improve its models.', 'Planner model'),
  entry('Models', 'Vision model', 'Model for screenshots and visual recovery.'),
  entry('Models', 'Parallel worker pages', 'Number of browser pages agents can work on.'),
  entry('Models', 'Max model turns per run', 'Limit planner calls or keep working until finished.'),
  entry('Connections', 'GitHub token', 'Connect repository access.'),
  entry('Connections', 'Connector access', 'Review Calendar, GitHub and MCP access for a saved task.'),
  entry('Connections', 'MCP servers', 'Review server sources and grant individual tools.'),
  entry('Connections', 'Vercel token', 'Connect deployment health, teams and projects.'),
  entry('Connections', 'Sentry token', 'Connect issue health, organizations and projects.'),
  entry('Agent permissions', 'What the agent may do', 'Read, write, navigate and evaluate permissions.'),
  { category: 'Memory', label: 'Memory', description: 'Privacy controls to inspect, edit, forget and exclude saved context, preferences and browsing memory.' },
  { category: 'Site permissions', label: 'Site permissions', description: 'Manage website access to camera, microphone, location and notifications.' },
  { category: 'External agents', label: 'External agents', description: 'Connect Codex, Claude Code and external coding assistants.' },
  { category: 'Extensions', label: 'Extensions', description: 'Manage installed browser extensions and their access.' },
];
export function searchSettings(query: string) {
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return words.length ? settingsDestinations.filter(item => {
    const text = `${["Models", "Connections", "External agents", "Vault"].includes(item.category) ? "Connections " : ""}${item.category} ${item.label} ${item.description}`.toLocaleLowerCase();
    return words.every(word => text.includes(word));
  }) : [];
}
