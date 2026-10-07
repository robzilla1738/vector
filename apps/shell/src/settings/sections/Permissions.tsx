import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AgentPolicyCategorySchema, AgentPolicySettingsSchema } from "@aux/contracts/agent-policy";
import { FileAccessSettingsSchema } from "@aux/contracts/api";
import type { AgentPolicyCategory, AgentPolicySettings, FileAccessSettings } from "@aux/contracts";
import { SettingsField, SettingsSection } from "../primitives";
import { Segmented } from "../../ui";
import { useConfirm } from "../../ui/dialog";
import { smallButtonProps } from "../../ui/button-props";
import { staticHintProps } from "../../ui/class-props";
import { pushSettingsPath } from "../routes";
import { useStore } from "../../store";
import "./Permissions.css";
import { AgentModeControl } from "../../features/permissions/AgentModeControl";
import { McpPermissions } from "../../features/mcp/Permissions";
import { ActivityLog } from "../../features/permissions/ActivityLog";
import { PolicyTable, replacementRules } from "../../features/permissions/PolicyTable";

import { bridge } from "../../bridge";
import { categoryLabels } from "../../features/permissions/categories";
type Rule = AgentPolicySettings["agentPolicies"][number];
export function PermissionsSettings({
  active,
  settings,
  onSave,
}: {
  active: boolean;
  settings: Record<string, unknown>;
  onSave(patch: Record<string, unknown>): Promise<boolean>;
}) {
  const policy = useMemo(
    () =>
      AgentPolicySettingsSchema.parse({
        agentMode: settings.agentMode,
        agentPolicies: settings.agentPolicies,
        agentPolicyRevision: settings.agentPolicyRevision,
      }),
    [settings.agentMode, settings.agentPolicies, settings.agentPolicyRevision],
  );
  const fileAccess = useMemo(
    () =>
      FileAccessSettingsSchema.parse({
        fileAccessMode: settings.fileAccessMode,
        fileAccessRevision: settings.fileAccessRevision,
      }),
    [settings.fileAccessMode, settings.fileAccessRevision],
  );
  const windowId = bridge.windowId,
    windowKind = bridge.windowKind,
    privateMode = bridge.privateMode;
  const owner = useMemo(
    () => ({ active, windowId, windowKind, privateMode, policy, fileAccess }),
    [active, windowId, windowKind, privateMode, policy, fileAccess],
  );
  const ownerRef = useRef<typeof owner | null>(null);
  useLayoutEffect(() => {
    ownerRef.current = owner;
    return () => {
      if (ownerRef.current === owner) ownerRef.current = null;
    };
  }, [owner]);
  const current = (original: typeof owner) =>
    original.active &&
    ownerRef.current === original &&
    bridge.windowId === original.windowId &&
    bridge.windowKind === original.windowKind &&
    bridge.privateMode === original.privateMode;
  const { confirm, confirmation } = useConfirm();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const pending = useRef(false);
  const [site, setSite] = useState(""),
    [category, setCategory] = useState<AgentPolicyCategory>("money");
  const [access, setAccess] = useState<Rule["access"]>("allow"),
    [amount, setAmount] = useState("");
  async function save(patch: { agentPolicies?: Rule[] }, original = owner) {
    if (pending.current || !current(original)) return false;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const saved = await onSave({ ...patch, agentPolicyRevision: policy.agentPolicyRevision });
      if (!saved && current(original))
        setError("Permissions could not be saved. Refresh Settings before trying again.");
      return saved;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  async function changeFileAccess(mode: FileAccessSettings["fileAccessMode"]) {
    const original = owner;
    if (pending.current || !current(original) || mode === fileAccess.fileAccessMode) return;
    if (
      mode === "full" &&
      !(await confirm({
        title: "Use Full file access?",
        description:
          "Aux can read and change files throughout your Home folder and explicitly reviewed external folders. Aux Profile credentials and permission data remain protected. All file access stays sandboxed.",
        confirmLabel: "Use Full file access",
        cancelLabel: "Keep current access",
      }))
    )
      return;
    if (pending.current || !current(original)) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const saved = await onSave({ fileAccessMode: mode, fileAccessRevision: fileAccess.fileAccessRevision });
      if (!saved && current(original))
        setError("File access could not be saved. Refresh Settings before trying again.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  function replaceRule(rule: Rule) {
    return replacementRules(policy, rule.category, rule.site, rule);
  }
  async function addSite(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    let origin: string;
    try {
      const url = new URL(site.trim());
      if (
        !["https:", "http:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.pathname !== "/" ||
        url.search ||
        url.hash
      )
        throw new Error("Enter an HTTP or HTTPS origin, such as https://example.com.");
      origin = url.origin;
      const limit = amount.trim() ? Number(amount) : undefined;
      if (limit !== undefined && (!Number.isFinite(limit) || limit < 0))
        throw new Error("Enter a nonnegative amount limit.");
      const rule: Rule = {
        site: origin,
        category,
        access,
        ...(category === "money" && access === "allow" && limit !== undefined ? { amountLimit: limit } : {}),
      };
      if (await save({ agentPolicies: replaceRule(rule) })) {
        setSite("");
        setAmount("");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }
  function openSettings(name: string, tab?: "Services") {
    useStore.setState({ settingsCategory: name });
    pushSettingsPath(name, tab);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  return (
    <SettingsSection name="Permissions" hidden={!active}>
      <SettingsField
        label="Agent mode"
        hint="Auto lets Aux work freely and uses Touch ID for payments and the first credential use on a site."
        searchTerms={["auto", "ask first", "full auto", "Touch ID"]}
      >
        <AgentModeControl active={active} disabled={busy} policy={policy} onSave={onSave} />
      </SettingsField>
      {error && <p role="alert">{error}</p>}
      <SettingsField
        label="Action categories"
        hint="Site rules take precedence over category rules. Account security and CAPTCHA always need you to take over."
        searchTerms={[
          "allow",
          "ask",
          "block",
          "read",
          "navigate",
          "input",
          "click",
          "scroll",
          "dialog",
          "download",
          "tabs",
          "submit",
          "send",
          "post",
          "delete",
          "install",
          "upload",
          "bash",
          "MCP",
          "external tools",
          "payments",
          "money",
          "credentials",
          "account security",
          "CAPTCHA",
          "shell commands",
        ]}
      >
        <PolicyTable policy={policy} busy={busy} save={(rules) => void save({ agentPolicies: rules })} />
      </SettingsField>
      <SettingsField
        label="Site permissions"
        hint="Rules apply to an exact site origin. Revoke a rule to return to the category or mode default."
        searchTerms={["always allow", "amount limit", "revoke", "origin"]}
      >
        <div className="permission-site-rules">
          {policy.agentPolicies
            .filter((rule) => rule.site)
            .map((rule) => (
              <div className="permission-site-rule" key={`${rule.site}|${rule.category}`}>
                <div>
                  <strong>{rule.site}</strong>
                  <span>
                    {categoryLabels[rule.category]} · {rule.access}
                    {rule.amountLimit !== undefined ? ` · up to ${rule.amountLimit}` : ""}
                  </span>
                </div>
                <button
                  {...smallButtonProps}
                  disabled={busy}
                  onClick={() =>
                    void save({ agentPolicies: policy.agentPolicies.filter((value) => value !== rule) })
                  }
                >
                  Revoke
                </button>
              </div>
            ))}
        </div>
        {!policy.agentPolicies.some((rule) => rule.site) && <p {...staticHintProps}>No saved site rules.</p>}
        <form className="permission-site-form" onSubmit={(event) => void addSite(event)}>
          <input
            aria-label="Site origin"
            type="url"
            required
            placeholder="https://example.com"
            value={site}
            onChange={(event) => setSite(event.target.value)}
            disabled={busy}
          />
          <select
            aria-label="Site action category"
            value={category}
            onChange={(event) => {
              const found = AgentPolicyCategorySchema.options.find((key) => key === event.target.value);
              if (found) setCategory(found);
            }}
            disabled={busy}
          >
            {AgentPolicyCategorySchema.options
              .filter((key) => key !== "account_security" && key !== "captcha")
              .map((key) => (
                <option key={key} value={key}>
                  {categoryLabels[key]}
                </option>
              ))}
          </select>
          <select
            aria-label="Site access"
            value={access}
            onChange={(event) =>
              setAccess(
                event.target.value === "ask" ? "ask" : event.target.value === "block" ? "block" : "allow",
              )
            }
            disabled={busy}
          >
            <option value="allow">Allow</option>
            <option value="ask">Ask</option>
            <option value="block">Block</option>
          </select>
          {category === "money" && access === "allow" && (
            <input
              aria-label="Optional payment amount limit"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="No amount limit"
              disabled={busy}
            />
          )}
          <button {...smallButtonProps} type="submit" disabled={busy || !site.trim()}>
            Save site rule
          </button>
        </form>
      </SettingsField>
      <SettingsField
        label="File access"
        hint="Guard reads Home except sensitive files and writes Documents, Downloads, Desktop, Projects, and reviewed writable Space folders. Read-only uses the same exclusions and keeps user files unchanged; Aux can still write its own scratch files and artifacts. Full reads and writes Home and reviewed external folders. Aux credentials and permission data remain protected in every mode."
        searchTerms={[
          "guard",
          "read-only",
          "full",
          "filesystem",
          "sandbox",
          "SSH",
          "Keychain",
          "sensitive folders",
        ]}
      >
        <Segmented<FileAccessSettings["fileAccessMode"]>
          label="File access"
          value={fileAccess.fileAccessMode}
          onChange={(mode) => void changeFileAccess(mode)}
          items={[
            { value: "guard", label: "Guard", disabled: busy },
            { value: "read-only", label: "Read-only", disabled: busy },
            { value: "full", label: "Full", disabled: busy },
          ]}
        />
      </SettingsField>
      <SettingsField label="Local folders" hint="Review the folders shared with Aux in each Space.">
        <button {...smallButtonProps} onClick={() => openSettings("Projects")}>
          Manage folders
        </button>
      </SettingsField>
      <SettingsField
        label="Connected tools"
        hint="Adding a server enables its tools. Disable individual tools here."
        searchTerms={["MCP", "tools", "connections", "enable", "disable"]}
      >
        <McpPermissions active={active} />
        <button {...smallButtonProps} onClick={() => openSettings("Connections", "Services")}>
          Manage MCP tools
        </button>
      </SettingsField>
      <SettingsField
        label="Activity log"
        hint="Review recorded permission decisions and the original task receipts."
        searchTerms={["history", "undo", "blocked", "allowed"]}
      >
        <ActivityLog active={active} />
      </SettingsField>
      {confirmation}
    </SettingsSection>
  );
}
