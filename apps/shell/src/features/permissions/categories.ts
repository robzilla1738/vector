import type { AgentPolicyCategory } from "@aux/contracts";
export const categoryLabels: Record<AgentPolicyCategory, string> = {
  read: "Read",
  navigate: "Navigate",
  input: "Enter text",
  click: "Click",
  scroll: "Scroll",
  dialog: "Page dialogs",
  download: "Download",
  tabs: "Manage tabs",
  submit: "Submit forms",
  send: "Send messages",
  post: "Publish posts",
  delete: "Delete",
  install: "Install",
  upload: "Upload",
  file_write: "Write files",
  file_delete: "Delete files",
  bash: "Shell commands",
  mcp: "MCP tools",
  external_tool: "External tools",
  money: "Payments and purchases",
  credentials: "Passwords, passkeys and codes",
  account_security: "Account security",
  captcha: "CAPTCHA",
};
export const dispositionLabels = {
  allow: "Allow",
  ask: "Ask",
  block: "Block",
  touch_id: "Touch ID",
  handoff: "Take over",
};

export function isAgentPolicyCategory(value: unknown): value is AgentPolicyCategory {
  return typeof value === "string" && Object.hasOwn(categoryLabels, value);
}

export function isPolicySite(value: unknown): value is string {
  if (value === "") return true;
  if (typeof value !== "string") return false;
  try {
    const site = new URL(value);
    return (
      ["http:", "https:"].includes(site.protocol) && !site.username && !site.password && site.origin === value
    );
  } catch {
    return false;
  }
}
