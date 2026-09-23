/**
 * Trusted credential fill — runs inside the page frame (main world) on
 * explicit user request only. The secret travels main→page; it is never
 * exposed to the renderer or model context. Field selection is deliberately
 * conservative: only visible, enabled inputs already structured like a login
 * form get touched.
 */

export interface CredentialFields {
  username?: string;
  secret: string;
}

function fillBody(credential: CredentialFields): number {
  const visible = (el: Element): el is HTMLInputElement => {
    if (!(el instanceof HTMLInputElement)) return false;
    if (el.disabled || el.readOnly) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };
  const setValue = (field: HTMLInputElement, value: string): boolean => {
    const proto = Object.getPrototypeOf(field) as typeof field & { value: string };
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (!desc?.set) return false;
    desc.set.call(field, value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  };

  const password = Array.from(document.querySelectorAll("input[type=password]")).find(visible);
  if (!password) return 0;
  let filled = 0;

  const usernameKinds = new Set(["email", "text", "tel", "url"]);
  const usernameHints = /user|login|email|e-mail|account|name|phone/i;
  if (credential.username) {
    const candidates = Array.from(document.querySelectorAll("input")).filter(field =>
      visible(field) && field !== password && usernameKinds.has(field.type || "text") &&
      usernameHints.test(`${field.name} ${field.id} ${field.autocomplete} ${field.placeholder} ${field.getAttribute("aria-label") ?? ""}`),
    );
    // Prefer the candidate closest above the password field (login-form order).
    const target = candidates.sort((a, b) => {
      const pa = a.compareDocumentPosition(password);
      const pb = b.compareDocumentPosition(password);
      const above = (pos: number) => pos & Node.DOCUMENT_POSITION_FOLLOWING ? 1 : 0;
      return above(pa) - above(pb);
    })[0];
    if (target && setValue(target, credential.username)) filled++;
  }
  if (setValue(password, credential.secret)) filled++;
  return filled;
}

/** Serialize the fill pass with the credential baked in — one executeJavaScript call. */
export function credentialFillScript(credential: CredentialFields): string {
  return `(${fillBody.toString()})(${JSON.stringify({ username: credential.username ?? "", secret: credential.secret })})`;
}

interface CapturedLogin {
  username: string;
  password: string;
}

/** Read the current login-form values — save-offer confirm path only. */
function captureBody(): CapturedLogin | null {
  const visible = (el: Element): el is HTMLInputElement => {
    if (!(el instanceof HTMLInputElement)) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };
  const password = Array.from(document.querySelectorAll("input[type=password]")).find(visible);
  if (!password || !password.value) return null;
  const hints = /user|login|email|e-mail|account|name|phone/i;
  const username = Array.from(document.querySelectorAll("input"))
    .find(field => visible(field) && field !== password && ["email", "text", "tel", "url"].includes(field.type || "text") &&
      field.value && hints.test(`${field.name} ${field.id} ${field.autocomplete} ${field.placeholder} ${field.getAttribute("aria-label") ?? ""}`));
  return { username: username?.value ?? "", password: password.value };
}

export function captureLoginScript(): string {
  return `(${captureBody.toString()})()`;
}
