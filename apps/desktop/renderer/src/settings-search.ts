export interface SettingsDestination { category: string; label: string; description: string; target?: string }
const entry = (category: string, label: string, description: string, target = label): SettingsDestination => ({ category, label, description, target });
export const settingsDestinations: SettingsDestination[] = [
  entry("Appearance", "Website sizes", "Inspect, search and reset saved per-site page zoom."),
  entry('General', 'Search engine', 'Choose where web searches go.'),
  entry('General', 'Import Chrome sign-ins', 'Bring available cookies and website sessions from Chrome.'),
  entry('General', 'Quick Ask', 'Keyboard shortcut for the global assistant popup.'),
  entry('General', 'Browser profiles', 'Separate accounts, sign-ins and browsing data.'),
  entry('General', 'Task data backup', 'Create a backup or restore chats, tasks, Spaces and preferences. Cookies and password stores are never copied.'),
  entry('General', 'Backup retention', 'Keep 3, 5, 10 or 20 complete runtime backups.', 'Task data backup'),
  entry('General', 'Profile credentials', 'Whole-profile restore never copies Cookies, Login Data or Web Data.', 'Task data backup'),
  entry('General', 'Vector data', 'Copy legacy Vector task data into Aux without moving credentials.'),
  entry('Vault', 'Agent vault', 'Lock, save and grant site credentials as opaque fill references.'),
  entry('General', 'Data directory', 'Reveal local storage in Finder.'),
  entry('General', 'Browser health', 'Local performance, memory, CPU and crash totals.'),
  entry('General', 'Support report', 'Export diagnostics without private content.'),
  entry('General', 'Clear browsing history', 'Remove browsing records.', 'clear-history'),
  entry('Appearance', 'Theme', 'Use light, dark or the system appearance.'),
  entry('Appearance', 'Sidebar appearance', 'Solid or custom surfaces, with opacity and blur controls.'),
  entry('Appearance', 'Tab layout', 'Choose horizontal or vertical tabs.'),
  entry('Models', 'Model provider', 'Choose an AI provider or a compatible local endpoint.'),
  entry('Models', 'API key', 'Manage the selected provider’s encrypted credential.', 'Model provider'),
  entry('Models', 'Planner model', 'Choose a model and test the connection.'),
  entry('Models', 'Vision model', 'Model for screenshots and visual recovery.'),
  entry('Models', 'Parallel worker pages', 'Number of browser pages agents can work on.'),
  entry('Models', 'Max model turns per run', 'Limit planner calls or keep working until finished.'),
  entry('Connections', 'GitHub token', 'Connect repository access.'),
  entry('Connections', 'Vercel token', 'Connect deployment health, teams and projects.'),
  entry('Connections', 'Sentry token', 'Connect issue health, organizations and projects.'),
  entry('Agent permissions', 'What the agent may do', 'Read, write, navigate and evaluate permissions.'),
  entry('Engine', 'Aux Engine', 'Choose off, auto or always.'),
  entry('Engine', 'Qualified engine sites', 'Sites and domains using Aux Engine in Auto mode.'),
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
