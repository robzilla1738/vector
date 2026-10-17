export interface SettingsSearchItem {
  category: string;
  label: string;
  description: string;
  target?: string;
  subview?: string;
  feature?: string;
  searchTerms?: readonly string[];
}

export function collectSettingsFields(root: ParentNode | null): SettingsSearchItem[] {
  if (!root) return [];
  return [...root.querySelectorAll<HTMLElement>("[data-settings-field]")].flatMap((field) => {
    const category = field.closest<HTMLElement>("[data-settings-section]")?.dataset.settingsSection;
    const label = field.dataset.settingsField;
    if (!category || !label) return [];
    let searchTerms: string[] = [];
    try {
      const value: unknown = JSON.parse(field.dataset.settingsTerms ?? "[]");
      if (Array.isArray(value))
        searchTerms = value.filter((term): term is string => typeof term === "string");
    } catch {
      /* Malformed metadata does not hide the field itself. */
    }
    return [
      {
        category,
        label,
        description: field.dataset.settingsDescription ?? "",
        target: field.dataset.setting ?? label,
        searchTerms,
      },
    ];
  });
}

const normalize = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase().trim();

function matchScore(value: string, token: string): number {
  const text = normalize(value);
  if (!text || !token) return 0;
  if (text === token) return 120;
  const words = text.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  if (words.includes(token)) return 105;
  if (text.startsWith(token)) return 90;
  if (words.some((word) => word.startsWith(token))) return 80;
  return text.includes(token) ? 65 : 0;
}

export function searchSettingsIndex<T extends SettingsSearchItem>(
  items: readonly T[],
  query: string,
  limit = 12,
): T[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  return items
    .map((item, index) => {
      const section = ["Models", "Connections", "External agents", "Vault"].includes(item.category)
        ? `Connections ${item.category}`
        : item.category === "Permissions"
          ? "Agents Permissions"
          : item.category;
      const score = tokens.reduce((total, token) => {
        if (total < 0) return -1;
        const best = Math.max(
          matchScore(section, token) * 3,
          matchScore(item.label, token) * 3,
          matchScore(item.searchTerms?.join(" ") ?? "", token) * 2,
          matchScore(item.description, token),
        );
        return best ? total + best : -1;
      }, 0);
      return { item, index, score };
    })
    .filter((result) => result.score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((result) => result.item);
}
