import type { FieldKey, PageFillContext } from './autofill-protocol';

// MV3 content scripts are classic scripts: keep their runtime vocabulary local.
const fieldLabels = {
  username: 'Username',
  password: 'Password',
  'cc-name': 'Name on card',
  'cc-number': 'Card number',
  'cc-exp': 'Expiry',
  'cc-csc': 'Security code',
  'given-name': 'Given name',
  'family-name': 'Family name',
  email: 'Email address',
  tel: 'Phone number',
  'street-address': 'Address',
  organization: 'Organization',
} as const;

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type Selection = {
  token: string;
  url: string;
  form: HTMLFormElement | null;
  fields: Map<FieldKey, Field>;
  fingerprints: Map<Field, string>;
  category: PageFillContext['category'];
};
let focused: Field | undefined;
let context: Selection | undefined;
let submission:
  | {
      token: string;
      url: string;
      form: HTMLFormElement;
      username: string;
      password: string;
    }
  | undefined;
const host = document.createElement('aux-vault-controls');
const shadow = host.attachShadow({ mode: 'closed' });
const button = document.createElement('button');
button.textContent = 'Open Aux Vault';
button.type = 'button';
button.setAttribute('aria-label', 'Open Aux Vault for this form');
button.style.cssText =
  'font:12px/20px system-ui;padding:4px 8px;border:1px solid #8885;border-radius:8px;background:Canvas;color:CanvasText;cursor:pointer;box-shadow:0 2px 6px #0002';
shadow.append(button);
host.style.cssText = 'position:fixed;z-index:2147483646;display:none';
document.documentElement.append(host);
function isField(value: unknown): value is Field {
  return (
    value instanceof HTMLInputElement ||
    value instanceof HTMLTextAreaElement ||
    value instanceof HTMLSelectElement
  );
}
function usable(input: Field) {
  const rect = input.getBoundingClientRect();
  return (
    input.isConnected &&
    !input.disabled &&
    !('readOnly' in input && input.readOnly) &&
    input.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) &&
    !(
      input instanceof HTMLInputElement &&
      ['hidden', 'submit', 'button', 'checkbox', 'radio', 'file'].includes(
        input.type,
      )
    ) &&
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < innerHeight &&
    rect.left < innerWidth
  );
}
function keyOf(field: Field): FieldKey | undefined {
  const token = field.autocomplete.split(/\s+/).at(-1);
  if (token && Object.hasOwn(fieldLabels, token)) return token as FieldKey;
  if (
    field instanceof HTMLInputElement &&
    field.type === 'password' &&
    token !== 'new-password'
  )
    return 'password';
  return undefined;
}
function position() {
  if (!focused || !usable(focused)) {
    host.style.display = 'none';
    return;
  }
  const rect = focused.getBoundingClientRect();
  host.style.left = `${Math.min(Math.max(4, rect.right - 112), innerWidth - 132)}px`;
  host.style.top = `${Math.min(rect.bottom + 4, innerHeight - 36)}px`;
  host.style.display = 'block';
}
document.addEventListener('focusin', (event) => {
  if (!isField(event.target) || !usable(event.target)) return;
  focused = event.target;
  context = undefined;
  position();
  void chrome.runtime.sendMessage({ type: 'aux.vault.focus' }).catch(() => {
    host.style.display = 'none';
  });
});
addEventListener('scroll', position, { passive: true, capture: true });
addEventListener('resize', position, { passive: true });
button.addEventListener('click', (event) => {
  if (!event.isTrusted) return;
  void chrome.runtime.sendMessage({ type: 'aux.vault.open' }).catch(() => {
    button.textContent = 'Open the Vault toolbar button';
  });
});
function selectFields(): Selection {
  if (!focused || !usable(focused))
    throw new Error('Focus a visible field before filling.');
  const form = focused.form;
  // Unowned fields never cause a document-wide fill.
  const candidates = form
    ? Array.from(form.elements).filter(isField).filter(usable)
    : [focused];
  const selectedKey = keyOf(focused);
  const category = selectedKey?.startsWith('cc-')
    ? 'card'
    : selectedKey && !['username', 'password'].includes(selectedKey)
      ? 'identity'
      : 'login';
  const fields = new Map<FieldKey, Field>();
  const keys =
    category === 'card'
      ? Object.keys(fieldLabels).filter((key) => key.startsWith('cc-'))
      : category === 'identity'
        ? Object.keys(fieldLabels).filter(
            (key) =>
              !key.startsWith('cc-') && !['username', 'password'].includes(key),
          )
        : ['username', 'password'];
  for (const key of keys as FieldKey[]) {
    const matches = candidates.filter((field) => keyOf(field) === key);
    if (matches.length === 1 && matches[0]) fields.set(key, matches[0]);
    else if (matches.includes(focused)) fields.set(key, focused);
  }
  if (category === 'login') {
    if (!fields.has('password'))
      throw new Error('Select the current password field for this login form.');
    if (!fields.has('username')) {
      const names = candidates.filter(
        (field) =>
          field instanceof HTMLInputElement &&
          ['text', 'email'].includes(field.type) &&
          !keyOf(field),
      );
      if (names.length === 1 && names[0]) fields.set('username', names[0]);
    }
  }
  if (!fields.size)
    throw new Error('This field needs a supported autocomplete attribute.');
  return {
    token: crypto.randomUUID(),
    url: location.href,
    form,
    fields,
    fingerprints: new Map(
      [...fields.values()].map((field) => [field, fingerprint(field)]),
    ),
    category,
  };
}
function fingerprint(field: Field) {
  return [
    field.tagName,
    field.type,
    field.autocomplete,
    field.name,
    field.id,
  ].join('\0');
}
function verify(token?: string, url?: string) {
  if (
    !context ||
    context.token !== token ||
    context.url !== location.href ||
    url !== location.href ||
    [...context.fields].some(
      ([, field]) =>
        !usable(field) ||
        field.form !== context?.form ||
        context.fingerprints.get(field) !== fingerprint(field),
    )
  )
    throw new Error('This page changed. Open the fill menu again.');
  return context;
}
let submitGesture: { form: HTMLFormElement; at: number } | undefined;
for (const type of ['click', 'keydown'] as const)
  document.addEventListener(
    type,
    (event) => {
      if (!event.isTrusted || !(event.target instanceof HTMLElement)) return;
      if (event instanceof KeyboardEvent && event.key !== 'Enter') return;
      const element = event.target.closest('input,button');
      if (
        !(
          element instanceof HTMLInputElement ||
          element instanceof HTMLButtonElement
        ) ||
        !element.form
      )
        return;
      if (event.type === 'click' && !['submit', 'image'].includes(element.type))
        return;
      submitGesture = { form: element.form, at: Date.now() };
    },
    true,
  );
document.addEventListener(
  'submit',
  (event) => {
    if (!event.isTrusted || !(event.target instanceof HTMLFormElement)) return;
    const form = event.target;
    if (submitGesture?.form !== form || Date.now() - submitGesture.at > 2000)
      return;
    submitGesture = undefined;
    const fields = Array.from(form.elements).filter(isField).filter(usable);
    const passwords = fields.filter((field) => keyOf(field) === 'password');
    if (passwords.length !== 1 || !passwords[0]?.value) return;
    const names = fields.filter(
      (field) =>
        keyOf(field) === 'username' ||
        (field instanceof HTMLInputElement &&
          ['email', 'text'].includes(field.type) &&
          !keyOf(field)),
    );
    const username = names.length === 1 ? (names[0]?.value ?? '') : '';
    if (passwords[0].value.length > 4096 || username.length > 4096) return;
    const token = crypto.randomUUID();
    submission = {
      token,
      url: location.href,
      form,
      username,
      password: passwords[0].value,
    };
    setTimeout(() => {
      if (submission?.token === token) submission = undefined;
    }, 120000);
    // No plaintext leaves this isolated actor until the popup explicitly accepts.
    void chrome.runtime
      .sendMessage({ type: 'aux.vault.submitted', suggestionToken: token })
      .catch(() => {
        submission = undefined;
      });
  },
  true,
);
chrome.runtime.onMessage.addListener((message: unknown, sender, respond) => {
  if (
    sender.id !== chrome.runtime.id ||
    !message ||
    typeof message !== 'object'
  )
    return;
  const request = message as {
    type?: string;
    contextToken?: string;
    documentUrl?: string;
    suggestionToken?: string;
    values?: Partial<Record<FieldKey, string>>;
  };
  try {
    if (request.type === 'aux.vault.context') {
      context = selectFields();
      respond({
        result: {
          contextToken: context.token,
          documentUrl: context.url,
          fieldType:
            focused instanceof HTMLInputElement ? focused.type : 'text',
          category: context.category,
          fields: [...context.fields.keys()].map((key) => ({
            key,
            label: fieldLabels[key],
          })),
        },
      });
      return;
    }
    if (
      request.type === 'aux.vault.saveMetadata' ||
      request.type === 'aux.vault.captureSubmission'
    ) {
      if (
        !submission ||
        submission.token !== request.suggestionToken ||
        submission.url !== location.href ||
        !submission.form.isConnected
      )
        throw new Error(
          'This submitted form changed. Submit it again to save.',
        );
      respond({
        result:
          request.type === 'aux.vault.saveMetadata'
            ? {
                username: submission.username,
                title: document.title.slice(0, 200) || location.hostname,
              }
            : { username: submission.username, password: submission.password },
      });
      return;
    }
    if (request.type === 'aux.vault.dismissSubmission') {
      if (submission?.token === request.suggestionToken) submission = undefined;
      respond({ result: true });
      return;
    }
    if (request.type === 'aux.vault.verify') {
      verify(request.contextToken, request.documentUrl);
      respond({ result: true });
      return;
    }
    if (request.type !== 'aux.vault.fill') return;
    const target = verify(request.contextToken, request.documentUrl);
    const entries = Object.entries(request.values ?? {}) as [
      FieldKey,
      string,
    ][];
    if (
      !entries.length ||
      entries.some(
        ([key, value]) => !target.fields.has(key) || typeof value !== 'string',
      )
    )
      throw new Error('Choose matching fields before filling.');
    for (const [key, value] of entries) {
      verify(request.contextToken, request.documentUrl);
      const field = target.fields.get(key);
      if (!field) throw new Error('The selected field changed.');
      const prototype =
        field instanceof HTMLInputElement
          ? HTMLInputElement.prototype
          : field instanceof HTMLTextAreaElement
            ? HTMLTextAreaElement.prototype
            : HTMLSelectElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
      if (
        !setter ||
        (field instanceof HTMLSelectElement &&
          !Array.from(field.options).some((option) => option.value === value))
      )
        throw new Error('The selected field cannot accept this value.');
      setter.call(field, value);
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      if (field.value !== value)
        throw new Error(
          'The page did not keep a selected value. Some fields may already have been filled.',
        );
    }
    if (entries.some(([key, value]) => target.fields.get(key)?.value !== value))
      throw new Error(
        'The page changed a selected value. Some fields may already have been filled.',
      );
    context = undefined;
    host.style.display = 'none';
    respond({ result: { filled: true, fieldCount: entries.length } });
  } catch (error) {
    respond({
      error: error instanceof Error ? error.message : 'The page action failed.',
    });
  }
});
