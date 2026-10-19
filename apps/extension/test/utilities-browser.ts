/** Disposable public-Chromium DOM smoke. No real provider or extension authority. */
import { installPageUtilities } from '../src/utilities/content';
import { captureSelection, TranslationTarget } from '../src/utilities/targets';

const results: string[] = [];
function check(value: unknown, label: string) {
  if (!value) throw new Error(label);
  results.push(label);
}
function rejects(operation: () => unknown, label: string) {
  let rejected = false;
  try {
    operation();
  } catch {
    rejected = true;
  }
  check(rejected, label);
}
const required = <T extends HTMLElement>(id: string) => {
  const value = document.getElementById(id);
  if (!value) throw new Error(id);
  return value as T;
};
async function smoke() {
  const field = required<HTMLTextAreaElement>('field');
  field.focus();
  field.setSelectionRange(6, 10);
  const selected = captureSelection(document);
  check(
    selected?.text === 'beta' && selected.editable,
    'editable selection captured',
  );
  selected?.apply('BETA');
  check(
    field.value === 'alpha BETA gamma',
    'only exact editable slice replaced',
  );
  field.setSelectionRange(6, 10);
  const stale = captureSelection(document);
  field.value = 'User changed the field';
  rejects(() => stale?.apply('must not overwrite'), 'changed field refused');
  const password = required<HTMLInputElement>('password');
  password.focus();
  password.setSelectionRange(0, 6);
  check(captureSelection(document) === null, 'password selection excluded');
  const sensitive = required<HTMLInputElement>('sensitive');
  sensitive.focus();
  sensitive.setSelectionRange(0, 4);
  check(
    captureSelection(document) === null,
    'sensitive payment selection excluded',
  );
  const editor = required('editor'),
    node = editor.firstChild as Text;
  const range = document.createRange();
  range.setStart(node, 0);
  range.setEnd(node, 8);
  getSelection()?.removeAllRanges();
  getSelection()?.addRange(range);
  editor.focus();
  const editable = captureSelection(document);
  check(editable?.editable, 'single text-node editor eligible');
  editable?.apply('<b>Literal</b>');
  check(
    editor.textContent === '<b>Literal</b> words' && !editor.querySelector('b'),
    'editor output is literal text, never HTML',
  );
  field.blur();
  getSelection()?.removeAllRanges();
  const translation = new TranslationTarget(document);
  check(
    !translation.segments.some(
      (row) => row.text.includes('Form label') || row.text.includes('Literal'),
    ),
    'translation excludes forms and editable editors',
  );
  const original = required('paragraph').textContent;
  translation.apply(
    new Map(
      translation.segments.map((row) => [row.id, `Translated ${row.text}`]),
    ),
  );
  check(
    required('paragraph').textContent?.startsWith('Translated'),
    'completed translation applies text nodes',
  );
  check(
    password.value === 'secret-fixture' &&
      field.value === 'User changed the field',
    'translation never changes input values',
  );
  const restored = translation.restore();
  check(
    !restored.skipped && required('paragraph').textContent === original,
    'translation restores exact original DOM text',
  );
  const stalePage = new TranslationTarget(document);
  required('paragraph').textContent = 'Live page update';
  rejects(
    () =>
      stalePage.apply(
        new Map(stalePage.segments.map((row) => [row.id, 'Do not overwrite'])),
      ),
    'stale page translation refused atomically',
  );
  // The only browser API mock is an isolated frame's runtime port. Actual
  // daemon protocol and policy shapes are verified separately in boundary tests.
  const incoming: ((value: unknown) => void)[] = [],
    posted: Record<string, unknown>[] = [];
  (globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: {
      id: 'fixture-extension',
      connect: () => ({
        postMessage: (value: Record<string, unknown>) => posted.push(value),
        onMessage: {
          addListener: (listener: (value: unknown) => void) =>
            incoming.push(listener),
        },
        onDisconnect: { addListener: () => {} },
        disconnect: () => {},
      }),
      onMessage: { addListener: () => {} },
    },
  };
  const attach = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function (init) {
    return attach.call(this, { ...init, mode: 'open' });
  };
  installPageUtilities();
  const host = document.querySelector<HTMLElement>('[data-aux-utility]');
  const root = host?.shadowRoot;
  check(root, 'utility overlay mounts in isolated shadow DOM');
  field.value = 'alpha beta gamma';
  field.focus();
  field.setSelectionRange(6, 10);
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      altKey: true,
      shiftKey: true,
      code: 'KeyL',
      bubbles: true,
    }),
  );
  const instruction = root?.querySelector<HTMLInputElement>('.followup input');
  check(instruction, 'selection keyboard equivalent opens overlay');
  if (!instruction) throw new Error('instruction');
  instruction.value = 'Uppercase';
  root?.querySelector<HTMLButtonElement>('.followup button')?.click();
  const request = posted.find((row) => row.type === 'start');
  check(request, 'selection uses a request ID and frame document token');
  const sessionId = 'fixture-session';
  for (const listener of incoming)
    listener({
      type: 'started',
      requestId: request?.requestId,
      documentToken: request?.documentToken,
      sessionId,
    });
  for (const listener of incoming)
    listener({
      type: 'chunk',
      requestId: request?.requestId,
      documentToken: request?.documentToken,
      sessionId,
      text: 'Partial',
    });
  const apply = [...(root?.querySelectorAll('button') ?? [])].find(
    (b) => b.textContent === 'Apply',
  ) as HTMLButtonElement;
  check(
    apply.disabled && field.value === 'alpha beta gamma',
    'streaming never enables partial apply',
  );
  for (const listener of incoming)
    listener({
      type: 'complete',
      requestId: request?.requestId,
      documentToken: request?.documentToken,
      sessionId,
      text: 'BETA',
    });
  check(!apply.disabled, 'completed response enables safe apply');
  apply.click();
  check(
    field.value === 'alpha BETA gamma',
    'overlay applies only completed result',
  );
  // Leave a real overlay visible for light/dark geometry smoke screenshots.
  field.focus();
  field.setSelectionRange(0, 5);
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      altKey: true,
      shiftKey: true,
      code: 'KeyL',
      bubbles: true,
    }),
  );
  if (new URL(location.href).searchParams.get('surface') === 'translation') {
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        altKey: true,
        shiftKey: true,
        code: 'KeyT',
        bubbles: true,
      }),
    );
    const translate = [...(root?.querySelectorAll('button') ?? [])].find(
      (button) => button.textContent === 'Translate',
    );
    translate?.click();
    const translationRequest = posted
      .filter((row) => row.type === 'start')
      .at(-1);
    check(
      translationRequest?.kind === 'translation',
      'translation keyboard equivalent binds captured page segments',
    );
    const segments = translationRequest?.segments as {
      id: string;
      text: string;
    }[];
    const response = {
      detectedSource: 'English',
      segments: segments.map((row) => ({
        id: row.id,
        text: `Translated ${row.text}`,
      })),
    };
    for (const listener of incoming)
      listener({
        type: 'started',
        requestId: translationRequest?.requestId,
        documentToken: translationRequest?.documentToken,
        sessionId: 'translation-fixture',
      });
    for (const listener of incoming)
      listener({
        type: 'chunk',
        requestId: translationRequest?.requestId,
        documentToken: translationRequest?.documentToken,
        sessionId: 'translation-fixture',
        text: '{"segments":[',
      });
    check(
      required('paragraph').textContent === 'Live page update',
      'partial translation never mutates DOM',
    );
    for (const listener of incoming)
      listener({
        type: 'complete',
        requestId: translationRequest?.requestId,
        documentToken: translationRequest?.documentToken,
        sessionId: 'translation-fixture',
        text: JSON.stringify(response),
      });
    check(
      required('paragraph').textContent === 'Translated Live page update',
      'completed translation commits bound segments',
    );
    const restore = [...(root?.querySelectorAll('button') ?? [])].find(
      (button) => button.textContent === 'Restore original',
    );
    restore?.click();
    check(
      required('paragraph').textContent === 'Live page update',
      'translation overlay restores originals without form mutation',
    );
  }
  document.documentElement.dataset.smoke = 'passed';
  required('results').textContent = JSON.stringify({
    passed: true,
    checks: results,
  });
}
void smoke().catch((error) => {
  document.documentElement.dataset.smoke = 'failed';
  required('results').textContent = JSON.stringify({
    passed: false,
    error: error.message,
    checks: results,
  });
});
