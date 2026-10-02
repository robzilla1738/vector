import type { EffectCategory, Step } from "@aux/contracts";

import type { ObservedActionTarget } from "@aux/chromium-driver";
export type { ObservedActionTarget } from "@aux/chromium-driver";

export function observedCategory(step: Step, target: ObservedActionTarget): EffectCategory | undefined {
  if (target.challenge) return target.challenge;
  const fields = target.form?.fields ?? [];
  const tokens = [target.autocomplete, ...fields.map((field) => field.autocomplete)].join(" ").toLowerCase();
  if (/\bnew-password\b/.test(tokens)) return "password_change";
  if (/\bone-time-code\b/.test(tokens)) return "two_factor";
  if (step.op === "fillCredential" || target.type === "password" || /\b(?:current-password|username)\b/.test(target.autocomplete)) return "credential";
  if (/\bcc-(?:number|csc|exp|exp-month|exp-year)\b/.test(tokens)) return "payment";
  // These labels may escalate any ordinary interaction, but never lower its tier.
  const name = target.name.trim().toLowerCase();
  if (/^(?:delete|remove)\b/.test(name)) return "delete";
  if (/^(?:buy|purchase|pay|place order)\b/.test(name)) return "purchase";
  if (/^(?:send|publish|post)\b/.test(name)) return "send";
  if (/^install\b/.test(name)) return "install";
  if (step.op === "upload" && target.tag === "input" && target.type === "file") return "upload";
  const submit =
    step.op === "click" && (target.tag === "button" || target.tag === "input") && target.type === "submit";
  let sameOrigin = false;
  try {
    sameOrigin = !!target.form && new URL(target.form.action).origin === target.origin;
  } catch {
    /* Invalid destinations cannot be preapproved. */
  }
  const login =
    sameOrigin &&
    submit &&
    target.form &&
    target.form.method === "post" &&
    fields.some((field) => field.type === "password" && /\bcurrent-password\b/.test(field.autocomplete)) &&
    fields.every((field) => !/\b(?:new-password|one-time-code|cc-)/.test(field.autocomplete)) &&
    /^(?:log\s?in|sign\s?in)(?:\s|$)/.test(name);
  return login ? "login" : undefined;
}
