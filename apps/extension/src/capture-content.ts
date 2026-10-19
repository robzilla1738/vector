/** Original page-hosted capture controls; no screenshot or clipboard access until a user action. */
export function installCaptureContent() {
  if (window !== window.top) return;
  let close: (() => void) | undefined;
  chrome.runtime.onMessage.addListener((message: unknown, sender) => {
    if (
      sender.id !== chrome.runtime.id ||
      !message ||
      typeof message !== 'object'
    )
      return;
    const input = message as { type?: string; nonce?: string };
    if (input.type === 'aux.capture.error') {
      close?.();
      const panel = document.createElement('div');
      panel.style.cssText =
        'position:fixed;top:24px;right:24px;z-index:2147483647;padding:16px;border-radius:16px;background:white;color:#202020;box-shadow:0 4px 24px #0004;font:14px system-ui;max-width:360px';
      const error = (message as { error?: unknown }).error;
      panel.textContent =
        typeof error === 'string'
          ? error.slice(0, 1000)
          : 'Capture is unavailable.';
      const dismiss = document.createElement('button');
      dismiss.textContent = 'Close';
      dismiss.onclick = () => panel.remove();
      panel.append(dismiss);
      document.documentElement.append(panel);
      close = () => panel.remove();
      return;
    }
    if (input.type !== 'aux.capture.open' || typeof input.nonce !== 'string')
      return;
    close?.();
    close = openCapture(input.nonce);
  });
}
function openCapture(nonce: string) {
  const previous = document.activeElement;
  const host = document.createElement('div');
  host.style.cssText =
    'all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none';
  const root = host.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = `
    *{box-sizing:border-box}button{font:inherit;cursor:pointer;border:0;color:inherit;background:transparent;border-radius:99px}button:focus-visible{outline:2px solid #6879db;outline-offset:2px}button:disabled{cursor:wait;opacity:.45}
    .toolbar{position:absolute;top:24px;left:32px;right:32px;display:flex;justify-content:center;pointer-events:none;padding-bottom:64px;font:12px/16px system-ui;color:#202020}
    .pill{pointer-events:auto;display:flex;align-items:center;padding:4px 8px;gap:4px;background:rgba(255,255,255,.95);border:1px solid #8884;border-radius:99px;box-shadow:0 6px 24px #0002;backdrop-filter:blur(18px);max-width:100%;flex-wrap:wrap}
    .mode{width:72px;height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}.glyph{width:20px;height:16px;border:1.5px solid currentColor;border-radius:3px}.region-icon{border-style:dashed}.screen-icon:after{content:'';display:block;width:9px;height:3px;border-bottom:1.5px solid currentColor;transform:translate(4px,15px)}
    .handle{cursor:move;padding:0 8px;user-select:none}.close{width:32px;height:32px;font-size:22px}.status{position:absolute;top:90px;left:16px;right:16px;display:flex;justify-content:center;color:#202020;font:13px/18px system-ui}.status span{pointer-events:auto;max-width:520px;background:#fff;border:1px solid #8884;padding:8px 12px;border-radius:16.8px;box-shadow:0 4px 16px #0002}
    .selector{position:absolute;inset:0;pointer-events:auto;cursor:crosshair;background:#0002;touch-action:none}.selection{position:absolute;border:2px solid #fff;outline:1px solid #222;pointer-events:none;background:transparent}
    .result{position:absolute;right:20px;bottom:28px;max-width:calc(100% - 36px);display:flex;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:auto;font:13px/18px system-ui;color:#202020}.result img{max-width:min(320px,100%);max-height:240px;border:4px solid white;border-radius:11.2px;background:#eee;box-shadow:0 6px 24px #0003}.actions{display:flex;gap:2px;padding:2px;border-radius:99px;background:white;box-shadow:0 4px 16px #0002}.actions button{min-width:32px;height:32px;padding:0 10px}.result-status{max-width:320px;background:white;padding:6px 10px;border-radius:12px}
    @media(prefers-color-scheme:dark){.pill{background:rgba(41,41,41,.95);color:#f8f8f8}.status span{background:#292929;color:#f8f8f8}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}`;
  root.append(style);
  document.documentElement.append(host);
  let sequence = 0,
    disposed = false,
    busy = false,
    image: Blob | undefined,
    imageUrl: string | undefined;
  let message = 'Choose a capture mode. Escape closes without taking an image.';
  let selector: HTMLElement | undefined;
  const send = async (
    mode: string,
    region?: { x: number; y: number; width: number; height: number },
    data?: string,
  ) => {
    const reply = (await chrome.runtime.sendMessage({
      type: 'aux.capture.request',
      nonce,
      mode,
      ...(region ? { region } : {}),
      ...(data ? { data } : {}),
    })) as { error?: string; result?: unknown };
    if (reply?.error) throw new Error(reply.error);
    if (!reply || !('result' in reply))
      throw new Error('Aux did not acknowledge capture.');
    return reply.result;
  };
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    sequence++;
    void send(busy ? 'cancel' : 'dismiss').catch(() => {});
    document.removeEventListener('keydown', key, true);
    host.remove();
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    image = undefined;
    if (previous instanceof HTMLElement && previous.isConnected)
      previous.focus({ preventScroll: true });
  };
  const key = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      cleanup();
    }
  };
  document.addEventListener('keydown', key, true);
  function button(label: string, action: () => void, className = '') {
    const value = document.createElement('button');
    value.type = 'button';
    value.textContent = label;
    value.className = className;
    value.disabled = busy;
    value.addEventListener('click', action);
    return value;
  }
  async function capture(
    mode: string,
    region?: { x: number; y: number; width: number; height: number },
  ) {
    const request = ++sequence;
    busy = true;
    selector?.remove();
    selector = undefined;
    host.style.visibility = 'hidden';
    try {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      if (disposed || request !== sequence) return;
      const result = (await send(mode, region)) as {
        data: string;
        mimeType: string;
        width: number;
        height: number;
      };
      if (disposed || request !== sequence) return;
      if (
        result.mimeType !== 'image/png' ||
        typeof result.data !== 'string' ||
        result.data.length > 32 * 1024 * 1024
      )
        throw new Error('Aux returned an invalid image.');
      const bytes = Uint8Array.from(atob(result.data), (character) =>
        character.charCodeAt(0),
      );
      image = new Blob([bytes], { type: 'image/png' });
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      imageUrl = URL.createObjectURL(image);
      message = `${result.width} × ${result.height} pixels`;
    } catch (error) {
      if (!disposed && request === sequence)
        message = error instanceof Error ? error.message : 'Capture failed.';
    } finally {
      if (!disposed && request === sequence) {
        busy = false;
        host.style.visibility = 'visible';
        render();
      }
    }
  }
  function selectRegion() {
    message = 'Drag to select a page region. Escape cancels.';
    render();
    selector = document.createElement('div');
    selector.className = 'selector';
    const border = document.createElement('div');
    border.className = 'selection';
    selector.append(border);
    root.append(selector);
    let start: { x: number; y: number } | undefined;
    selector.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      start = { x: event.clientX, y: event.clientY };
      selector?.setPointerCapture(event.pointerId);
    });
    selector.addEventListener('pointermove', (event) => {
      if (!start) return;
      const x = Math.max(0, Math.min(innerWidth, event.clientX)),
        y = Math.max(0, Math.min(innerHeight, event.clientY));
      border.style.cssText = `left:${Math.min(start.x, x)}px;top:${Math.min(start.y, y)}px;width:${Math.abs(start.x - x)}px;height:${Math.abs(start.y - y)}px`;
    });
    selector.addEventListener('pointerup', (event) => {
      if (!start) return;
      const x = Math.max(0, Math.min(innerWidth, event.clientX)),
        y = Math.max(0, Math.min(innerHeight, event.clientY));
      const region = {
        x: Math.min(start.x, x),
        y: Math.min(start.y, y),
        width: Math.abs(start.x - x),
        height: Math.abs(start.y - y),
      };
      start = undefined;
      if (region.width < 2 || region.height < 2) return;
      void capture('region', region);
    });
    selector.addEventListener('pointercancel', () => {
      start = undefined;
      selector?.remove();
      selector = undefined;
      message = 'Selection cancelled.';
      render();
    });
  }
  function render() {
    for (const child of [...root.children]) if (child !== style) child.remove();
    if (image && imageUrl) {
      const result = document.createElement('section');
      result.className = 'result';
      result.setAttribute('aria-label', 'Captured image');
      const preview = document.createElement('img');
      preview.src = imageUrl;
      preview.alt = 'Your captured image';
      const actions = document.createElement('div');
      actions.className = 'actions';
      actions.append(
        button('Retake', () => {
          image = undefined;
          if (imageUrl) URL.revokeObjectURL(imageUrl);
          imageUrl = undefined;
          message = 'Choose a capture mode.';
          render();
        }),
        button('Copy', () => {
          const current = image;
          if (!current) return;
          void Promise.resolve()
            .then(() =>
              navigator.clipboard.write([
                new ClipboardItem({ 'image/png': current }),
              ]),
            )
            .then(
              () => {
                message = 'Image copied.';
                render();
              },
              (error) => {
                message = `Copy failed: ${error instanceof Error ? error.message : 'Clipboard unavailable.'}`;
                render();
              },
            );
        }),
        button('Download', () => {
          const current = image;
          if (!current) return;
          void current
            .arrayBuffer()
            .then((bytes) => {
              let binary = '';
              for (const value of new Uint8Array(bytes))
                binary += String.fromCharCode(value);
              return send('download', undefined, btoa(binary));
            })
            .then(
              () => {
                message =
                  'Download started. Check the browser downloads for completion.';
                render();
              },
              (error) => {
                message = `Download failed: ${error instanceof Error ? error.message : 'Unknown error.'}`;
                render();
              },
            );
        }),
        button('Dismiss', cleanup),
      );
      const status = document.createElement('div');
      status.className = 'result-status';
      status.role = 'status';
      status.textContent = message;
      result.append(preview, actions, status);
      root.append(result);
      return;
    }
    const toolbar = document.createElement('section');
    toolbar.className = 'toolbar';
    toolbar.setAttribute('aria-label', 'Capture controls');
    const pill = document.createElement('div');
    pill.className = 'pill';
    const handle = document.createElement('span');
    handle.className = 'handle';
    handle.textContent = 'Capture';
    let drag: { x: number; y: number; left: number; top: number } | undefined;
    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      const bounds = pill.getBoundingClientRect();
      drag = {
        x: event.clientX,
        y: event.clientY,
        left: bounds.left,
        top: bounds.top,
      };
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener('pointermove', (event) => {
      if (!drag) return;
      pill.style.position = 'fixed';
      pill.style.left = `${Math.max(0, Math.min(innerWidth - pill.offsetWidth, drag.left + event.clientX - drag.x))}px`;
      pill.style.top = `${Math.max(0, Math.min(innerHeight - pill.offsetHeight, drag.top + event.clientY - drag.y))}px`;
    });
    handle.addEventListener('pointerup', () => {
      drag = undefined;
    });
    handle.addEventListener('pointercancel', () => {
      drag = undefined;
    });
    pill.append(handle);
    for (const [label, mode, icon] of [
      ['Screen', 'screen', 'screen-icon'],
      ['Page', 'fullPage', ''],
      ['Region', 'region', 'region-icon'],
    ] as const) {
      const control = button(
        '',
        () => (mode === 'region' ? selectRegion() : void capture(mode)),
        'mode',
      );
      const glyph = document.createElement('span');
      glyph.className = `glyph ${icon}`;
      glyph.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span');
      text.textContent = label;
      control.append(glyph, text);
      pill.append(control);
    }
    const dismiss = button('×', cleanup, 'close');
    dismiss.ariaLabel = 'Close capture';
    pill.append(dismiss);
    toolbar.append(pill);
    const status = document.createElement('div');
    status.className = 'status';
    const text = document.createElement('span');
    text.role = 'status';
    text.textContent = message;
    status.append(text);
    root.append(toolbar, status);
  }
  render();
  root
    .querySelector<HTMLButtonElement>('button')
    ?.focus({ preventScroll: true });
  return cleanup;
}
