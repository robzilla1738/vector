import {
  CLIPBOARD_LIFETIME_MS,
  type ClipboardLease,
  clipboardDigest,
  isClipboardLease,
} from './clipboard-state';

let lease: ClipboardLease | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let operations: Promise<unknown> = Promise.resolve();
// Offscreen documents cannot focus. Clipboard permissions enable the legacy
// synchronous copy/paste commands without depending on document focus.
function writeText(value: string) {
  const input = document.createElement('textarea');
  input.value = value;
  document.body.append(input);
  input.select();
  try {
    if (!document.execCommand('copy'))
      throw new Error('Clipboard write was refused.');
  } finally {
    input.value = '';
    input.remove();
  }
}
function readText() {
  const input = document.createElement('textarea');
  document.body.append(input);
  input.select();
  let value: string | undefined;
  const paste = (event: ClipboardEvent) => {
    event.preventDefault();
    value = event.clipboardData?.getData('text/plain');
  };
  input.addEventListener('paste', paste);
  try {
    if (!document.execCommand('paste') || value === undefined)
      throw new Error('Clipboard comparison was refused.');
    return value;
  } finally {
    input.value = '';
    input.remove();
  }
}
function schedule() {
  clearTimeout(timer);
  if (!lease) return;
  const generation = lease.generation;
  timer = setTimeout(
    () => {
      void enqueue(() => expire(generation))
        .then((result) =>
          result.done
            ? chrome.runtime.sendMessage({
                type: 'aux.vault.clipboard.expired',
                generation,
              })
            : undefined,
        )
        .catch(() => {
          /* Alarm retries; no secret/error payload logging. */
        });
    },
    Math.max(0, lease.deadline - Date.now()),
  );
}
function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const result = operations.then(operation);
  operations = result.catch(() => undefined);
  return result;
}
async function expire(generation: string) {
  if (!lease || lease.generation !== generation || Date.now() < lease.deadline)
    return { done: false };
  const current = readText();
  if ((await clipboardDigest(current, lease.salt)) === lease.digest)
    writeText('');
  // A newer unrelated value is preserved. This is an independent Aux choice.
  lease = undefined;
  clearTimeout(timer);
  return { done: true };
}
chrome.runtime.onMessage.addListener((message: unknown, sender, respond) => {
  if (
    sender.id !== chrome.runtime.id ||
    sender.tab ||
    (sender.url && sender.url !== chrome.runtime.getURL('background.js')) ||
    !message ||
    typeof message !== 'object'
  )
    return;
  const request = message as {
    type?: string;
    target?: string;
    value?: string;
    lease?: ClipboardLease;
  };
  if (request.target !== 'aux-vault-clipboard-offscreen') return;
  void enqueue(async () => {
    if (request.type === 'aux.vault.clipboard.write') {
      if (
        typeof request.value !== 'string' ||
        request.value.length > 1048576 ||
        !request.value.length
      )
        throw new Error('The sensitive field is unavailable.');
      const salt = crypto.randomUUID();
      const next = {
        generation: crypto.randomUUID(),
        salt,
        digest: await clipboardDigest(request.value, salt),
        deadline: Date.now() + CLIPBOARD_LIFETIME_MS,
      };
      writeText(request.value);
      lease = next;
      schedule();
      return { lease: next };
    }
    if (
      request.type !== 'aux.vault.clipboard.expire' ||
      !isClipboardLease(request.lease)
    )
      throw new Error('Clipboard action is unavailable.');
    if (!lease) {
      lease = request.lease;
      schedule();
    }
    return expire(request.lease.generation);
  })
    .then((result) => respond({ result }))
    .catch(() =>
      respond({
        error:
          'The clipboard operation was refused. Copy again from the Vault popup.',
      }),
    );
  return true;
});
