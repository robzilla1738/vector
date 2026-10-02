import { errToast } from "../../store";
import { executeCommand } from "../../commands";
import { useFeature } from "../../use-feature";
import { SiteRulesTable } from "../../features/trust/SiteRulesTable";
import { SettingsField, SettingsSection } from "../primitives";

export function AgentsSettings({
  active,
  settings,
}: {
  active: boolean;
  settings: Record<string, unknown>;
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
}) {
  const sitePermissions = useFeature("agentSitePermissions");
  const grants = (settings.effectGrants as string[] | undefined) ?? ["effect:read"];
  return (
    <SettingsSection name="Agent permissions" hidden={!active}>
      <SettingsField
        label="What the agent may do"
        hint="These are the permissions used when you start a run. Turn Write off for read-only work. Navigation and Evaluate require separate grants. Page content and models cannot add permissions."
      >
        <div className="seg wrap" role="group" aria-label="Agent effect grants" data-testid="effect-grants">
          {([
            ["effect:read", "Read", true],
            ["effect:write", "Write", false],
            ["effect:egress", "Navigate", false],
            ["effect:destructive", "Evaluate", false],
          ] as const).map(([key, label, locked]) => {
            const on = grants.includes(key) || grants.includes("effect:*");
            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                className={on ? "on" : ""}
                disabled={locked}
                data-command-id="set-agent-effect-grants"
                onClick={() => {
                  if (locked) return;
                  const next = new Set(grants.filter(grant => grant !== "effect:*"));
                  next.add("effect:read");
                  if (on) next.delete(key);
                  else next.add(key);
                  void executeCommand("set-agent-effect-grants", { payload: { effectGrants: [...next] } }).catch(errToast);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </SettingsField>
      {active && sitePermissions && <SiteRulesTable />}
    </SettingsSection>
  );
}
