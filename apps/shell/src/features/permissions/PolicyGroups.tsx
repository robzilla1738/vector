import { useRef, useState } from "react";
import { AgentPolicyCategorySchema } from "@aux/contracts/agent-policy";
import type { AgentPolicyCategory, AgentPolicySettings } from "@aux/contracts";
import { Popover } from "../../ui/popover";
import { Plus } from "../../ui/icons";
import { categoryLabels } from "./categories";
import { replacementRules } from "./PolicyTable";

type Rule = AgentPolicySettings["agentPolicies"][number];
const groups = [
  { access: "allow", label: "Allow", hint: "Run without confirmation." },
  { access: "ask", label: "Ask", hint: "Ask before running." },
  { access: "block", label: "Deny", hint: "Reject before execution." },
] as const;

/** Edit explicit category overrides; inherited mode and site policy stay authoritative. */
export function PolicyGroups({
  policy,
  busy,
  save,
}: {
  policy: AgentPolicySettings;
  busy: boolean;
  save(rules: Rule[]): Promise<boolean>;
}) {
  return (
    <div className="permission-policy-groups">
      {groups.map((group) => {
        const rules = policy.agentPolicies.filter((rule) => !rule.site && rule.access === group.access);
        return (
          <div className="permission-policy-group" key={group.access}>
            <header>
              <strong>{group.label}</strong>
              <span>{group.hint}</span>
              <AddPolicyRule
                {...group}
                busy={busy}
                save={(category) =>
                  save(replacementRules(policy, category, undefined, { category, access: group.access }))
                }
              />
            </header>
            {rules.length ? (
              <ul>
                {rules.map((rule) => (
                  <li key={rule.category}>
                    <span>
                      {categoryLabels[rule.category]}
                      {rule.amountLimit !== undefined && <small> · up to {rule.amountLimit}</small>}
                    </span>
                    <button
                      type="button"
                      className="btn ghost small"
                      disabled={busy}
                      aria-label={`Remove ${group.label.toLowerCase()} rule for ${categoryLabels[rule.category]}`}
                      onClick={() => void save(replacementRules(policy, rule.category))}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No {group.label.toLowerCase()} rules</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AddPolicyRule({
  label,
  hint,
  busy,
  save,
}: {
  label: string;
  hint: string;
  busy: boolean;
  save(category: AgentPolicyCategory): Promise<boolean>;
}) {
  const [category, setCategory] = useState<AgentPolicyCategory | "">("");
  const [error, setError] = useState("");
  const select = useRef<HTMLSelectElement>(null);
  return (
    <Popover
      label={`Add ${label.toLowerCase()} rule`}
      className="permission-add-rule"
      disabled={busy}
      initialFocusRef={select}
      trigger={
        <>
          <Plus /> Add Rule
        </>
      }
    >
      {(close) => (
        <form
          className="permission-rule-popover"
          onSubmit={(event) => {
            event.preventDefault();
            if (!category || busy) return;
            setError("");
            void save(category)
              .then((saved) => {
                if (saved) {
                  setCategory("");
                  close();
                } else setError("The rule was not saved. Refresh Settings and try again.");
              })
              .catch(() => setError("The rule was not saved. Try again."));
          }}
        >
          <strong>Add {label.toLowerCase()} rule</strong>
          <p>{hint}</p>
          <div>
            <select
              ref={select}
              aria-label="Action category"
              value={category}
              required
              disabled={busy}
              onChange={(event) => {
                const parsed = AgentPolicyCategorySchema.safeParse(event.target.value);
                setCategory(parsed.success ? parsed.data : "");
              }}
            >
              <option value="" disabled>
                Choose an action…
              </option>
              {AgentPolicyCategorySchema.options
                .filter((key) => !["account_security", "captcha"].includes(key))
                .map((key) => (
                  <option key={key} value={key}>
                    {categoryLabels[key]}
                  </option>
                ))}
            </select>
            <button type="submit" className="btn primary small" disabled={busy || !category}>
              Add
            </button>
          </div>
          {error && <p role="alert">{error}</p>}
        </form>
      )}
    </Popover>
  );
}
