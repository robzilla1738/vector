let focused: HTMLInputElement | undefined;
let context:
  | {
      token: string;
      url: string;
      password: HTMLInputElement;
      username?: HTMLInputElement;
    }
  | undefined;
const host = document.createElement('aux-vault-controls');
const shadow = host.attachShadow({ mode: 'closed' });
const button = document.createElement('button');
button.textContent = 'Saved logins';
button.type = 'button';
button.setAttribute('aria-label', 'Open Aux Vault saved logins');
button.style.cssText =
  'font:12px/20px system-ui;padding:4px 8px;border:1px solid #8885;border-radius:8px;background:Canvas;color:CanvasText;cursor:pointer;box-shadow:0 2px 6px #0002';
shadow.append(button);
host.style.cssText = 'position:fixed;z-index:2147483646;display:none';
document.documentElement.append(host);
function usable(input: HTMLInputElement) {
  return (
    input.isConnected &&
    !input.disabled &&
    !input.readOnly &&
    input.checkVisibility() &&
    input.type !== 'hidden' &&
    input.getBoundingClientRect().width > 0 &&
    input.getBoundingClientRect().height > 0 &&
    input.getBoundingClientRect().bottom > 0 &&
    input.getBoundingClientRect().right > 0 &&
    input.getBoundingClientRect().top < innerHeight &&
    input.getBoundingClientRect().left < innerWidth
  );
}
function position() {
  if (!focused || !usable(focused)) {
    host.style.display = 'none';
    return;
  }
  const rect = focused.getBoundingClientRect();
  host.style.left = `${Math.min(Math.max(4, rect.right - 100), innerWidth - 112)}px`;
  host.style.top = `${Math.min(rect.bottom + 4, innerHeight - 36)}px`;
  host.style.display = 'block';
}
document.addEventListener('focusin', (event) => {
  if (
    !(event.target instanceof HTMLInputElement) ||
    !['text', 'email', 'password'].includes(event.target.type) ||
    !usable(event.target)
  )
    return;
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
function selectFields() {
  if (!focused || !usable(focused))
    throw new Error('Focus a visible login field before filling.');
  const root = focused.form ?? document;
  const passwords = [
    ...root.querySelectorAll<HTMLInputElement>('input[type=password]'),
  ].filter(usable);
  const password =
    focused.type === 'password'
      ? focused
      : passwords.length === 1
        ? passwords[0]
        : undefined;
  if (!password || password.autocomplete === 'new-password')
    throw new Error('Select the password field for this login form.');
  const usernames = [
    ...root.querySelectorAll<HTMLInputElement>(
      'input[type=text],input[type=email],input:not([type])',
    ),
  ].filter(usable);
  const username =
    focused.type !== 'password'
      ? focused
      : (usernames.find((input) => input.autocomplete === 'username') ??
        (usernames.length === 1 ? usernames[0] : undefined));
  return { password, ...(username ? { username } : {}) };
}
function verify(token?: string, url?: string) {
  if (
    !context ||
    context.token !== token ||
    context.url !== location.href ||
    url !== location.href ||
    !usable(context.password) ||
    (context.username && !usable(context.username))
  )
    throw new Error('This page changed. Open the fill menu again.');
  return context;
}
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
    username?: string;
    password?: string;
  };
  try {
    if (request.type === 'aux.vault.context') {
      const fields = selectFields();
      context = { token: crypto.randomUUID(), url: location.href, ...fields };
      respond({
        result: {
          contextToken: context.token,
          documentUrl: context.url,
          fieldType: focused?.type ?? 'password',
        },
      });
      return;
    }
    if (request.type === 'aux.vault.verify') {
      verify(request.contextToken, request.documentUrl);
      respond({ result: true });
      return;
    }
    if (request.type !== 'aux.vault.fill') return;
    const target = verify(request.contextToken, request.documentUrl);
    if (
      typeof request.username !== 'string' ||
      typeof request.password !== 'string'
    )
      throw new Error('The fill values are unavailable.');
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set;
    if (!setter) throw new Error('These fields cannot be filled.');
    const write = (input: HTMLInputElement, value: string) => {
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    if (target.username) write(target.username, request.username);
    write(target.password, request.password);
    context = undefined;
    host.style.display = 'none';
    respond({ result: { filled: true } });
  } catch (error) {
    respond({
      error:
        error instanceof Error
          ? error.message
          : 'This page could not be filled.',
    });
  }
});
