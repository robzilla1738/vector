import type { WebContents } from "electron";
import { addDocumentBinding } from "./page-debugger.js";

/**
 * Login-submit detection for vault save offers. An isolated-world script
 * reports the account name (never the password) over a CDP binding when a
 * password form is submitted; main re-reads the field values only after the
 * user confirms the save.
 */

export const CREDENTIAL_BINDING = "__auxCredentialOffer";
export const CREDENTIAL_WORLD = "aux-credential-detect";

export interface CredentialOffer {
  username: string;
  origin: string;
  url: string;
}

function detectorBody(bindingName: string) {
  const USERNAME = /user|login|email|e-mail|account|name|phone/i;
  const usernameOf = (scope: ParentNode): string => {
    const fields = Array.from(scope.querySelectorAll("input"));
    const password = fields.find(f => f instanceof HTMLInputElement && f.type === "password" && f.value);
    if (!password) return "";
    const user = fields.find(f => f instanceof HTMLInputElement && f !== password && f.value &&
      ["email", "text", "tel", "url"].includes(f.type || "text") &&
      USERNAME.test(`${f.name} ${f.id} ${f.autocomplete} ${f.placeholder}`));
    return user?.value.slice(0, 200) ?? "";
  };
  // A submit-button click produces both a click and a submit — report once.
  let lastReport = 0;
  const report = (username: string) => {
    if (Date.now() - lastReport < 800) return;
    lastReport = Date.now();
    try {
      const binding = (globalThis as Record<string, unknown>)[bindingName];
      if (typeof binding === "function") (binding as (payload: string) => void)(JSON.stringify({ username, origin: location.origin, url: location.href }));
    } catch { /* binding unavailable — nothing to report */ }
  };

  document.addEventListener("submit", event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    report(usernameOf(form));
  }, true);

  // JS-driven logins never emit submit — a submit-ish control click while a
  // filled password field exists in its form (or the page, for formless UIs).
  document.addEventListener("click", event => {
    const control = (event.target as Element | null)?.closest("button,[role=button],input[type=submit],a");
    if (!control) return;
    const label = `${control.getAttribute("aria-label") ?? ""} ${control.textContent ?? ""} ${(control as HTMLButtonElement).value ?? ""}`;
    if (!/sign ?in|log ?in|continue|submit|next/i.test(label)) return;
    const form = control.closest("form");
    report(usernameOf(form ?? document));
  }, true);
}

export function credentialDetectScript(bindingName: string): string {
  return `(${detectorBody.toString()})(${JSON.stringify(bindingName)})`;
}

export function installCredentialWatch(wc: WebContents, onOffer: (offer: CredentialOffer) => void) {
  void addDocumentBinding(wc, CREDENTIAL_BINDING, payload => {
    try {
      const parsed = JSON.parse(payload || "{}") as CredentialOffer;
      if (parsed.origin && /^https?:\/\//.test(parsed.origin)) onOffer({ username: parsed.username ?? "", origin: parsed.origin, url: parsed.url ?? "" });
    } catch { /* not our payload */ }
  }, { source: credentialDetectScript(CREDENTIAL_BINDING), worldName: CREDENTIAL_WORLD });
}
