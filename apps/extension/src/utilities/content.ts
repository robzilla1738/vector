import {
  languages,
  record,
  translationResult,
  type UtilityRequest,
  UtilityRun,
  type UtilityUpdate,
  utilityPort,
} from './contracts';
import { utilityStyles } from './styles';
import {
  captureSelection,
  type SelectionTarget,
  TranslationTarget,
} from './targets';

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text = '',
) {
  const value = document.createElement(tag);
  value.className = className;
  value.textContent = text;
  return value;
}
function button(text: string, run: () => void) {
  const b = element('button', '', text);
  b.type = 'button';
  b.addEventListener('click', run);
  return b;
}
let installed = false;
/** Install once in each isolated committed frame. Page scripts receive no privileged bridge. */
export function installPageUtilities() {
  if (installed) return;
  installed = true;
  // Keep the installation sentinel in the isolated script, not page-defined globals.
  const documentToken = crypto.randomUUID();
  let selectionTarget: SelectionTarget | null = null,
    translationTarget: TranslationTarget | undefined;
  let currentKind: 'selection' | 'translation' = 'selection',
    panelOpen = false,
    connected = true;
  const run = new UtilityRun(documentToken);
  const host = element('div');
  host.dataset.auxUtility = 'true';
  const shadow = host.attachShadow({ mode: 'closed' });
  const style = element('style');
  style.textContent = utilityStyles;
  shadow.append(style);
  document.documentElement.append(host);
  const handle = button('', () => openSelection());
  handle.className = 'handle';
  handle.title = 'Transform selected text (Alt+Shift+L)';
  handle.ariaLabel = handle.title;
  handle.hidden = true;
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  const path = document.createElementNS(icon.namespaceURI, 'path');
  path.setAttribute('d', 'M4 5h10M9 5v14M5 19h8M17 7v10M13 12h8');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.8');
  path.setAttribute('fill', 'none');
  icon.append(path);
  handle.append(icon);
  shadow.append(handle);
  const card = element('section', 'card');
  card.role = 'dialog';
  card.ariaLabel = 'Transform selected text';
  card.hidden = true;
  const header = element('div', 'bar');
  header.append(
    element('span', '', 'Selection'),
    button('Close', () => dismiss()),
  );
  const body = element('div', 'body'),
    source = element('div', 'source'),
    output = element('div', 'output'),
    error = element('div', 'error');
  output.ariaLive = 'polite';
  body.append(source, output, error);
  const input = element('input');
  input.placeholder = 'Describe a change';
  input.ariaLabel = 'Transformation instruction';
  input.maxLength = 2000;
  const send = button('Run', () => void transform()),
    followup = element('div', 'followup');
  followup.append(input, send);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      void transform();
    }
  });
  const cancel = button('Cancel', () => cancelRequest()),
    apply = button('Apply', () => {
      try {
        if (
          run.phase !== 'complete' ||
          currentKind !== 'selection' ||
          !selectionTarget
        )
          throw new Error('Wait for a completed transformation.');
        selectionTarget.apply(run.text);
        dismiss();
      } catch (e) {
        showError(e);
      }
    }),
    copy = button('Copy', () => void copyResult()),
    openTask = button('Open task', () => {
      if (run.sessionId)
        port.postMessage({
          type: 'open-session',
          sessionId: run.sessionId,
          requestId: run.requestId,
          documentToken,
        });
    });
  const actions = element('div', 'actions');
  actions.append(cancel, copy, apply, openTask);
  card.append(header, body, followup, actions);
  shadow.append(card);
  const pill = element('section', 'pill');
  pill.ariaLabel = 'Page translation';
  pill.hidden = true;
  const symbol = element('span', 'symbol', '文'),
    sourceLanguage = element('select'),
    targetLanguage = element('select'),
    status = element('span', 'status', 'Ready'),
    translationError = element('div', 'error');
  sourceLanguage.ariaLabel = 'Source language';
  targetLanguage.ariaLabel = 'Target language';
  sourceLanguage.append(new Option('Detect source', 'auto'));
  for (const language of languages) {
    sourceLanguage.append(new Option(language, language));
    targetLanguage.append(new Option(language, language));
  }
  const translate = button('Translate', () => void translatePage()),
    restore = button('Restore original', () => {
      cancelRequest();
      restorePage();
    });
  const translationCancel = button('Cancel', () => cancelRequest());
  pill.append(
    symbol,
    sourceLanguage,
    targetLanguage,
    translate,
    status,
    translationCancel,
    restore,
    button('Close', () => {
      cancelRequest();
      restorePage();
      releaseRequest();
      pill.hidden = true;
    }),
    translationError,
  );
  shadow.append(pill);
  const port = chrome.runtime.connect({ name: utilityPort });
  port.onMessage.addListener((raw) => {
    try {
      const message = record(raw);
      if (message.type === 'invalid') {
        showError(new Error(String(message.error)));
        return;
      }
      if (!run.accept(raw as UtilityUpdate)) return;
      if (currentKind === 'selection') {
        output.textContent = run.text;
        error.textContent = run.error;
      } else {
        status.textContent =
          run.phase === 'streaming' ? 'Translating…' : run.phase;
        translationError.textContent = run.error;
        if (run.phase === 'complete' && translationTarget) {
          try {
            const result = translationResult(
              run.text,
              translationTarget.segments,
            );
            translationTarget.apply(result.translated);
            status.textContent = `Translated${result.detectedSource ? ` from ${result.detectedSource}` : ''}`;
          } catch (e) {
            run.phase = 'error';
            showError(e);
          }
        }
      }
      refreshButtons();
    } catch (e) {
      showError(e);
    }
  });
  port.onDisconnect.addListener(() => {
    connected = false;
    run.abort();
    showError(
      new Error(
        'The utility connection closed. Original content was preserved.',
      ),
    );
    refreshButtons();
  });
  chrome.runtime.onMessage.addListener((raw, sender, respond) => {
    if (sender.id !== chrome.runtime.id) return;
    if (raw?.type === 'aux.utility.verify') {
      const valid =
        raw.documentToken === documentToken &&
        raw.documentUrl === location.href &&
        (currentKind === 'selection'
          ? selectionTarget?.valid()
          : translationTarget?.valid());
      respond({ ok: !!valid, documentToken, documentUrl: location.href });
      return;
    }
    if (raw?.type === 'aux.utility.open-selection') {
      openSelection();
      respond({ ok: true });
    }
    if (raw?.type === 'aux.utility.translate-page') {
      openTranslation();
      respond({ ok: true });
    }
  });
  function refreshButtons() {
    const live = run.phase === 'pending' || run.phase === 'streaming';
    cancel.disabled = !live;
    send.disabled = live || !connected;
    copy.disabled = run.phase !== 'complete';
    apply.disabled = run.phase !== 'complete' || !selectionTarget?.editable;
    openTask.hidden = !run.sessionId;
    translate.disabled = live || !connected;
    translationCancel.disabled = !live || currentKind !== 'translation';
    sourceLanguage.disabled = live;
    targetLanguage.disabled = live;
    restore.disabled = !translationTarget;
  }
  function showError(value: unknown) {
    const message = value instanceof Error ? value.message : String(value);
    if (currentKind === 'translation') translationError.textContent = message;
    else error.textContent = message;
  }
  function sendRequest(
    request: Omit<
      UtilityRequest,
      'type' | 'requestId' | 'documentToken' | 'documentUrl'
    >,
    url: string,
  ) {
    if (!connected) throw new Error('Reconnect the page to use this utility.');
    cancelRequest();
    const requestId = crypto.randomUUID();
    run.begin(requestId);
    copy.textContent = 'Copy';
    port.postMessage({
      type: 'start',
      requestId,
      documentToken,
      documentUrl: url,
      ...request,
    });
    refreshButtons();
  }
  function cancelRequest() {
    if (run.requestId && ['pending', 'streaming'].includes(run.phase)) {
      port.postMessage({
        type: 'cancel',
        requestId: run.requestId,
        documentToken,
      });
      run.abort();
      if (currentKind === 'translation')
        status.textContent = 'Cancelled — original preserved';
      else
        error.textContent = 'Cancelled. The original selection was preserved.';
    }
    refreshButtons();
  }
  function releaseRequest() {
    if (run.requestId && connected)
      port.postMessage({
        type: 'release',
        requestId: run.requestId,
        documentToken,
      });
  }
  function dismiss() {
    cancelRequest();
    releaseRequest();
    panelOpen = false;
    card.hidden = true;
    handle.hidden = true;
    selectionTarget = null;
  }
  function openSelection() {
    const selected = captureSelection(document);
    if (selected) selectionTarget = selected;
    if (!selectionTarget?.valid()) return;
    cancelRequest();
    currentKind = 'selection';
    panelOpen = true;
    source.textContent = selectionTarget.text;
    output.textContent = '';
    error.textContent = '';
    run.phase = 'idle';
    run.requestId = '';
    run.sessionId = '';
    run.text = '';
    run.error = '';
    card.hidden = false;
    handle.hidden = true;
    const rect = selectionTarget.rect;
    card.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - 344))}px`;
    card.style.top = `${Math.max(8, Math.min(rect.bottom + 8, innerHeight - 400))}px`;
    input.focus();
    refreshButtons();
  }
  async function transform() {
    try {
      if (!selectionTarget?.valid())
        throw new Error(
          'The original selection changed. Select the text again.',
        );
      if (!input.value.trim())
        throw new Error('Describe the transformation first.');
      currentKind = 'selection';
      sendRequest(
        {
          kind: 'selection',
          source: selectionTarget.text,
          instruction: input.value,
        },
        selectionTarget.url,
      );
      output.textContent = '';
      error.textContent = '';
    } catch (e) {
      showError(e);
    }
  }
  async function copyResult() {
    try {
      if (run.phase !== 'complete')
        throw new Error('Only completed output can be copied.');
      if (!navigator.clipboard)
        throw new Error(
          'Clipboard access is unavailable here. Select and copy the completed preview.',
        );
      await navigator.clipboard.writeText(run.text);
      copy.textContent = 'Copied';
    } catch (e) {
      showError(e);
    }
  }
  function openTranslation() {
    cancelRequest();
    currentKind = 'translation';
    panelOpen = false;
    card.hidden = true;
    handle.hidden = true;
    run.phase = 'idle';
    run.requestId = '';
    run.sessionId = '';
    run.text = '';
    run.error = '';
    pill.hidden = false;
    translationError.textContent = '';
    status.textContent = 'Ready';
    refreshButtons();
  }
  async function translatePage() {
    try {
      restorePage();
      currentKind = 'translation';
      translationTarget = new TranslationTarget(document);
      sendRequest(
        {
          kind: 'translation',
          source: JSON.stringify(translationTarget.segments),
          instruction: 'Translate captured page text',
          segments: translationTarget.segments,
          sourceLanguage: sourceLanguage.value,
          targetLanguage: targetLanguage.value,
        },
        translationTarget.url,
      );
      status.textContent = 'Requesting…';
      translationError.textContent = '';
    } catch (e) {
      showError(e);
    }
  }
  function restorePage() {
    if (translationTarget) {
      const result = translationTarget.restore();
      status.textContent = result.skipped
        ? `Restored ${result.restored}; ${result.skipped} changed passages kept`
        : `Original restored (${result.restored} passages)`;
      if (!result.skipped) translationTarget = undefined;
    }
    refreshButtons();
  }
  let selectionTimer: ReturnType<typeof setTimeout> | undefined;
  function scheduleSelection(event: Event) {
    if (event.composedPath().includes(host) || panelOpen) return;
    clearTimeout(selectionTimer);
    selectionTimer = setTimeout(() => {
      const selected = captureSelection(document);
      selectionTarget = selected;
      if (!selected) {
        handle.hidden = true;
        return;
      }
      handle.hidden = false;
      handle.style.left = `${Math.max(4, Math.min(selected.rect.right + 4, innerWidth - 36))}px`;
      handle.style.top = `${Math.max(4, Math.min(selected.rect.bottom + 4, innerHeight - 36))}px`;
    }, 120);
  }
  document.addEventListener('pointerup', scheduleSelection);
  document.addEventListener('keyup', scheduleSelection);
  document.addEventListener('keydown', (event) => {
    if (event.altKey && event.shiftKey && event.code === 'KeyL') {
      event.preventDefault();
      openSelection();
    }
    if (event.altKey && event.shiftKey && event.code === 'KeyT') {
      event.preventDefault();
      openTranslation();
    }
    if (event.key === 'Escape' && (panelOpen || !pill.hidden)) {
      dismiss();
      cancelRequest();
      restorePage();
      pill.hidden = true;
    }
  });
  addEventListener(
    'pagehide',
    () => {
      cancelRequest();
      translationTarget?.restore();
      port.disconnect();
      host.remove();
    },
    { once: true },
  );
  refreshButtons();
}
