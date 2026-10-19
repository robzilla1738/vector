import type { FieldKey } from './autofill-protocol';
import type { InlineCandidate, InlineReply } from './inline-autofill';

/** Closed-shadow DOM only: no credentials, page storage or HTML interpolation. */
export function createInlinePanel(
  shadow: ShadowRoot,
  actions: {
    fill: (itemId: string, keys: FieldKey[]) => Promise<void>;
    unlock: () => Promise<void>;
    close: () => void;
  },
) {
  const style = document.createElement('style');
  style.textContent = `
    :host{color-scheme:light dark;font-family:system-ui,sans-serif}
    *{box-sizing:border-box}
    .suggestions{width:308px;padding:0 24px 24px;max-width:100vw;max-height:calc(100vh - 36px);overflow:auto;color:CanvasText}
    .card{background:Canvas;border:.5px solid color-mix(in srgb,CanvasText 15%,transparent);border-radius:16.8px;box-shadow:0 4px 16px #0002;padding:0}
    .heading{padding:8px;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;overflow-wrap:anywhere}
    .fields{display:flex;gap:10px;flex-wrap:wrap;margin:8px;font-size:12px}
    label{display:flex;align-items:center;gap:4px}
    .results{max-height:min(240px,calc(100vh - 160px));overflow:auto}
    button{font:inherit;color:inherit;cursor:pointer}
    button:focus-visible{outline:2px solid Highlight;outline-offset:-2px}
    button:disabled{cursor:default;opacity:.55}
    .option{display:flex;align-items:center;gap:10px;width:100%;padding:6px 8px;border:0;border-radius:16.8px;background:transparent;text-align:left}
    .option:hover{background:color-mix(in srgb,CanvasText 8%,transparent)}
    .option span{min-width:0;overflow-wrap:anywhere}
    strong,small{display:block}
    strong{font-size:14px;font-weight:500}
    small,.status{font-size:12px;line-height:18px}
    small{color:oklch(14.5% 0 0 / .55)}
    .suggestions[data-theme=light]{color-scheme:light}
    .suggestions[data-theme=dark]{color-scheme:dark}
    .suggestions[data-theme=dark] small{color:oklch(98.5% 0 0 / .55)}
    @media(prefers-color-scheme:dark){.suggestions[data-theme=system] small{color:oklch(98.5% 0 0 / .55)}}
    .close{border:0;background:transparent;padding:4px 8px}
    .status{margin:8px 0}
    .footnote{font-size:11px;margin:8px 0 0}
  `;
  const panel = document.createElement('section');
  panel.className = 'suggestions';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Aux login suggestions');
  shadow.append(style, panel);
  let busy = false;
  const checkboxKeys = () =>
    [...panel.querySelectorAll<HTMLInputElement>('input:checked')].map(
      (input) => input.value as FieldKey,
    );
  async function act(operation: () => Promise<void>) {
    if (busy) return;
    busy = true;
    for (const button of panel.querySelectorAll('button'))
      button.disabled = true;
    try {
      await operation();
    } catch (error) {
      notice(
        error instanceof Error ? error.message : 'The Vault action failed.',
      );
    } finally {
      busy = false;
      for (const button of panel.querySelectorAll('button'))
        button.disabled = false;
      for (const button of panel.querySelectorAll<HTMLButtonElement>(
        '[data-unavailable]',
      ))
        button.disabled = true;
    }
  }
  function notice(message: string) {
    let status = panel.querySelector<HTMLParagraphElement>('[role=status]');
    if (!status) {
      status = document.createElement('p');
      status.className = 'status';
      status.setAttribute('role', 'status');
      panel.querySelector('.card')?.append(status);
    }
    if (status) status.textContent = message;
  }
  function render(reply: InlineReply) {
    panel.dataset.theme = reply.theme;
    const card = document.createElement('div');
    card.className = 'card';
    const heading = document.createElement('header');
    heading.className = 'heading';
    const label = document.createElement('span');
    label.textContent = `Aux · ${new URL(reply.documentUrl).hostname}`;
    const close = document.createElement('button');
    close.className = 'close';
    close.type = 'button';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Close login suggestions');
    close.onclick = (event) => {
      if (event.isTrusted) actions.close();
    };
    heading.append(label, close);
    card.append(heading);
    if (reply.state === 'locked') {
      const unlock = document.createElement('button');
      unlock.type = 'button';
      unlock.className = 'option';
      unlock.textContent = 'Unlock Aux Vault';
      unlock.onclick = (event) => {
        if (event.isTrusted) void act(actions.unlock);
      };
      card.append(unlock);
    } else {
      const fields = document.createElement('div');
      fields.className = 'fields';
      for (const field of reply.fields) {
        const label = document.createElement('label'),
          input = document.createElement('input');
        input.type = 'checkbox';
        input.value = field.key;
        input.checked = true;
        label.append(input, document.createTextNode(field.label));
        fields.append(label);
      }
      card.append(fields);
      const results = document.createElement('div');
      results.className = 'results';
      results.setAttribute('aria-label', 'Matching saved logins');
      for (const item of reply.items ?? []) results.append(option(item));
      if (!reply.items?.length) {
        const empty = document.createElement('p');
        empty.className = 'status';
        empty.textContent = 'No matching saved logins. Open Vault to add one.';
        results.append(empty);
      }
      card.append(results);
      const footnote = document.createElement('p');
      footnote.className = 'footnote';
      footnote.textContent =
        'Choose a login to fill only the checked fields. Aux never submits this form.';
      card.append(footnote);
    }
    panel.replaceChildren(card);
    panel.hidden = false;
  }
  function option(item: InlineCandidate) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option';
    const text = document.createElement('span'),
      title = document.createElement('strong'),
      username = document.createElement('small');
    title.textContent = item.title || 'Saved login';
    username.textContent = item.username || 'No username';
    text.append(title, username);
    button.append(text);
    if (item.reprompt) {
      button.disabled = true;
      button.dataset.unavailable = 'true';
      button.title =
        'Additional authorization is required; this protected item is unavailable for page fill.';
    }
    button.onclick = (event) => {
      if (!event.isTrusted) return;
      const keys = checkboxKeys();
      if (!keys.length) {
        notice('Choose the fields you want to fill.');
        return;
      }
      void act(() => actions.fill(item.id, keys));
    };
    return button;
  }
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      actions.close();
      return;
    }
    const options = [
      ...panel.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
        'button:not(:disabled),input',
      ),
    ];
    const active = shadow.activeElement;
    const current =
      active instanceof HTMLButtonElement || active instanceof HTMLInputElement
        ? options.indexOf(active)
        : -1;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      options[
        (current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) %
          options.length
      ]?.focus();
    }
  });
  return {
    element: panel,
    render,
    notice,
    close() {
      panel.replaceChildren();
      panel.hidden = true;
    },
    get open() {
      return !panel.hidden;
    },
  };
}
