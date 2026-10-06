import { AgentPolicyCategorySchema, policyFor } from "@aux/contracts/agent-policy";
import type { AgentPolicySettings } from "@aux/contracts";
import { categoryLabels, dispositionLabels } from "./categories";
type Rule = AgentPolicySettings["agentPolicies"][number];
export function replacementRules(
  policy: AgentPolicySettings,
  category: Rule["category"],
  site?: string,
  rule?: Rule,
) {
  const retained = policy.agentPolicies.filter((value) => value.category !== category || value.site !== site);
  return rule ? [...retained, rule] : retained;
}
/** Settings and page site controls edit the same canonical category/site policy. */
export function PolicyTable({
  policy,
  site,
  busy,
  save,
}: {
  policy: AgentPolicySettings;
  site?: string;
  busy: boolean;
  save(rules: Rule[]): void;
}) {
  return (
    <table className="permission-categories">
      <thead>
        <tr>
          <th scope="col">Action</th>
          <th scope="col">Permission</th>
        </tr>
      </thead>
      <tbody>
        {AgentPolicyCategorySchema.options.map((key) => {
          const rule = policy.agentPolicies.find((value) => value.category === key && value.site === site);
          const locked = key === "account_security" || key === "captcha";
          const inherited = policyFor({
            mode: policy.agentMode,
            category: key,
            site,
            overrides: policy.agentPolicies.filter((value) => value !== rule),
          });
          return (
            <tr key={key}>
              <th scope="row">{categoryLabels[key]}</th>
              <td>
                <select
                  aria-label={`${categoryLabels[key]} permission`}
                  disabled={busy || locked}
                  value={rule?.access ?? "default"}
                  onChange={(event) => {
                    const access = event.target.value;
                    save(
                      replacementRules(
                        policy,
                        key,
                        site,
                        access === "default"
                          ? undefined
                          : {
                              category: key,
                              ...(site ? { site } : {}),
                              access: access === "ask" ? "ask" : access === "block" ? "block" : "allow",
                            },
                      ),
                    );
                  }}
                >
                  <option value="default">
                    {site ? "Category default" : "Mode default"} · {dispositionLabels[inherited.disposition]}
                  </option>
                  <option value="allow">Allow</option>
                  <option value="ask">Ask</option>
                  <option value="block">Block</option>
                </select>
                {rule?.amountLimit !== undefined && <span>Up to {rule.amountLimit}</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
