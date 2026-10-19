const runId = location.pathname.split('/').at(-1),
  base = `/api/${runId}`;
const status = document.querySelector('#status'),
  report = document.querySelector('#report');
let pending;
const supported =
  isSecureContext &&
  typeof navigator.credentials?.create === 'function' &&
  typeof globalThis.PublicKeyCredential?.parseCreationOptionsFromJSON ===
    'function' &&
  typeof globalThis.PublicKeyCredential?.parseRequestOptionsFromJSON ===
    'function';
document.querySelector('#capability').textContent = supported
  ? `Secure context confirmed at ${location.origin}. Native WebAuthn methods available.`
  : 'This browser is not a usable secure WebAuthn context; acceptance cannot run.';
if (new URL(location.href).searchParams.has('navigation'))
  document.querySelector('#navigation').textContent =
    'The RP document navigated. Inspect the old Vault request and record cancellation only if observed.';
function show(value) {
  status.textContent =
    typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}
async function api(path, input) {
  const response = await fetch(
    `${base}/${path}`,
    input === undefined
      ? {}
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        },
  );
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'RP request failed.');
  return result;
}
async function refresh() {
  const data = await api('report');
  report.textContent = JSON.stringify(data, null, 2);
  return data;
}
function busy(value) {
  for (const button of document.querySelectorAll('[data-action]'))
    button.disabled = value || !supported;
  document.querySelector('#abort').disabled = !value;
}
async function ceremony(action) {
  if (pending || !supported) return;
  const caseName = document.querySelector('#case').value;
  const fixtureCase = ['fallback', 'cancel', 'navigation'].includes(action)
    ? `${action}-${Date.now().toString(36)}`
    : caseName;
  busy(true);
  let start, timer;
  const controller = new AbortController();
  pending = controller;
  try {
    start = await api('begin', { action, case: fixtureCase });
    const publicKey =
      start.kind === 'create'
        ? PublicKeyCredential.parseCreationOptionsFromJSON(start.publicKey)
        : PublicKeyCredential.parseRequestOptionsFromJSON(start.publicKey);
    show(
      `${action}: real browser request started. Choose Aux Vault except in the provider fallback case.`,
    );
    if (action === 'cancel')
      timer = setTimeout(() => controller.abort(), 15000);
    if (action === 'navigation')
      timer = setTimeout(
        () =>
          location.assign(
            `${base}/navigation?ceremony=${encodeURIComponent(start.ceremonyId)}`,
          ),
        15000,
      );
    const credential = await (start.kind === 'create'
      ? navigator.credentials.create({ publicKey, signal: controller.signal })
      : navigator.credentials.get({ publicKey, signal: controller.signal }));
    if (!credential || typeof credential.toJSON !== 'function')
      throw new Error('No serializable real browser credential returned.');
    show(
      await api('finish', {
        ceremonyId: start.ceremonyId,
        credential: credential.toJSON(),
      }),
    );
  } catch (error) {
    if (start && error instanceof DOMException) {
      try {
        show(
          await api('error', {
            ceremonyId: start.ceremonyId,
            name: error.name,
          }),
        );
      } catch (verificationError) {
        show(verificationError.message);
      }
    } else
      show(error instanceof Error ? error.message : 'Browser ceremony failed.');
  } finally {
    clearTimeout(timer);
    pending = undefined;
    busy(false);
    await refresh();
  }
}
for (const button of document.querySelectorAll('[data-action]'))
  button.addEventListener('click', () => void ceremony(button.dataset.action));
for (const button of document.querySelectorAll('[data-observation]'))
  button.addEventListener('click', () => {
    void api('observe', { observation: button.dataset.observation })
      .then(refresh)
      .catch((error) => show(error.message));
  });
document
  .querySelector('#abort')
  .addEventListener('click', () => pending?.abort());
document
  .querySelector('#refresh')
  .addEventListener(
    'click',
    () => void refresh().catch((error) => show(error.message)),
  );
document.querySelector('#download').addEventListener('click', () => {
  void refresh()
    .then((data) => {
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      );
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'aux-passkey-rp-evidence.json';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    })
    .catch((error) => show(error.message));
});
busy(false);
void refresh().catch((error) => show(error.message));
