/** Ask first in code (roadmap decision 1). A page can talk a model out of calling
 * request_action_confirmation, so under Ask first every CDP command the agent sends passes through
 * here: a click or Enter on a submit, send or pay control, or any of them on a banking-class site,
 * raises the confirmation card whatever the model chose. Nothing else asks: no per-click or per-site
 * prompt. The page is read for facts only; its text never decides anything but a control's label. */

const BANKING_HOSTS = ['ally.com', 'americanexpress.com', 'bankofamerica.com', 'barclays.com', 'capitalone.com', 'chase.com', 'chime.com', 'citi.com', 'citibank.com',
  'coinbase.com', 'discover.com', 'etrade.com', 'fidelity.com', 'hsbc.com', 'kraken.com', 'paypal.com', 'pnc.com', 'regions.com', 'revolut.com', 'robinhood.com', 'santander.com',
  'schwab.com', 'sofi.com', 'truist.com', 'usbank.com', 'vanguard.com', 'venmo.com', 'wellsfargo.com', 'wise.com'];
const BANK_NAME = /(?:^|[.-])(?:[a-z0-9]*bank(?:ing)?|[a-z0-9]*creditunion)[.-]/;
const WESTERN_LABEL = /\b(?:send|submit|pay|pay now|purchase|buy|buy now|place order|checkout|check out|confirm|transfer|delete|publish|post|enviar|pagar|comprar|confirmar|envoyer|payer|acheter|confirmer|senden|absenden|bezahlen|kaufen|bestätigen|invia|paga|acquista|conferma)\b/i;
const EASTERN_LABEL = /送信|購入|支払|確定|보내기|전송|결제|구매|发送|發送|提交|支付|付款|购买|購買/;
const MESSAGE_FIELD = /message|reply|comment|tweet|post|compose|mensaje|nachricht|メッセージ|메시지|消息|訊息/i;
const PAYMENT_FRAME = /pay|checkout|stripe|card/i;
const BUTTONS = new Set(['button', 'input']);
const MAX_LABEL = 40;
// A script that presses or submits by itself, as opposed to Aux's own page helpers.
const SCRIPTED = /\.(?:submit|requestSubmit|click)\s*\(/;
const OWN_HELPER = 'globalThis.__aux';

export const READ_ONLY_TOOLS = Object.freeze(['read_file', 'webfetch', 'websearch', 'get_time', 'memory_search', 'history_search', 'history_read']);

export function isBankingSite(url) {
  let host;
  try { host = new URL(url).hostname.toLowerCase(); } catch { return false; }
  return BANKING_HOSTS.some(known => host === known || host.endsWith(`.${known}`)) || BANK_NAME.test(`${host}.`);
}

/** What a chat with nobody watching may approve ahead of time: `aux exec --allow` (decision 16). */
export function readOnlyScope(scope) {
  if (scope?.type === 'file') return scope.mode === 'read';
  if (scope?.type === 'browser') return scope.action === 'read';
  return scope?.type === 'tool' && READ_ONLY_TOOLS.includes(scope.tool);
}

/** Runs in the page, on the element itself or at a point; with neither, on the focused element. */
export const CONTROL_FACTS = `function(point) {
  const hit = point ? document.elementFromPoint(point.x, point.y) : this && this.nodeType === 1 ? this : document.activeElement;
  const control = hit && hit.closest ? hit.closest('button,input,a,select,textarea,iframe,[role=button],[contenteditable],[role=textbox]') || hit : null;
  if (!control) return {url: location.href, tag: '', label: ''};
  const form = control.form || (control.closest && control.closest('form')), fields = form ? [...form.elements] : [control];
  const payment = /cc-|card|cvv|cvc|iban|routing/i, type = String(control.type || '').toLowerCase(), tag = control.tagName.toLowerCase();
  const pays = field => [field.autocomplete, field.name, field.id].some(value => payment.test(value || ''));
  return {url: location.href, tag, type, role: control.getAttribute('role') || '', inForm: !!form, method: form ? String(form.method || 'get').toLowerCase() : '',
    editable: control.isContentEditable === true || control.getAttribute('role') === 'textbox', password: fields.some(field => field.type === 'password'), payment: fields.some(pays),
    label: [control.getAttribute('aria-label'), control.title, control.value, control.textContent].filter(Boolean).join(' ').trim().replace(/\\s+/g, ' ').slice(0, 200),
    frame: tag === 'iframe' ? [control.src, control.title].filter(Boolean).join(' ') : ''};
}`;

const labelled = label => label.length <= MAX_LABEL && (WESTERN_LABEL.test(label) || EASTERN_LABEL.test(label));
const submits = ({tag, type}) => tag === 'button' && (type === 'submit' || !type) || tag === 'input' && (type === 'submit' || type === 'image');
const sendsForm = facts => facts.inForm && (facts.method !== 'get' || facts.password || facts.payment);

/** Why this click or Enter needs the card, or null. A GET form with no secret is a search: a read. */
export function askReason(facts, {enter = false} = {}) {
  if (isBankingSite(facts.url)) return 'This acts on a banking site.';
  const button = BUTTONS.has(facts.tag) || facts.role === 'button';
  if (enter && facts.tag === 'textarea') return null;
  if (enter && facts.editable) return MESSAGE_FIELD.test(facts.label) ? 'Enter sends this message.' : null;
  const activates = enter ? facts.tag === 'input' || button : submits(facts);
  if (activates && sendsForm(facts)) {
    if (facts.payment) return 'This submits a payment form.';
    return facts.password ? 'This submits a sign-in form.' : 'This submits a form.';
  }
  if (button && !['text', 'search', 'email', 'password', 'tel', 'url', 'number'].includes(facts.type) && labelled(facts.label)) return `This presses “${facts.label}”.`;
  if (facts.frame && PAYMENT_FRAME.test(facts.frame)) return 'This acts inside a payment frame.';
  return null;
}

const point = ({x, y}) => ({x, y});
const isEnter = ({type, key}) => (type === 'keyDown' || type === 'rawKeyDown') && (key === 'Enter' || key === '\r');
const isPress = ({type, button, clickCount}) => type === 'mousePressed' && (button === 'left' || button === undefined) && (clickCount ?? 1) === 1;
const script = (method, params) => method === 'Runtime.evaluate' ? params.expression : method === 'Runtime.callFunctionOn' ? params.functionDeclaration : undefined;

/** The client every page command goes through. enabled(): Ask first holds for this session.
 * confirm({reason, url, screenshot}) raises the card and throws unless the user confirms. Facts that
 * can't be read count as sensitive, since a page must not be able to dodge the check by breaking it. */
export function askFirstClient(client, {enabled, confirm}) {
  const read = async (object, sessionId, options, params) => {
    const call = params.objectId ? ['Runtime.callFunctionOn', {objectId: params.objectId, functionDeclaration: CONTROL_FACTS, arguments: [{value: null}], returnByValue: true}]
      : ['Runtime.evaluate', {expression: `(${CONTROL_FACTS}).call(null, ${JSON.stringify(params.point ?? null)})`, returnByValue: true}];
    return (await object.send(...call, sessionId, options)).result?.value;
  };
  async function ask(object, sessionId, options, params, enter) {
    const facts = await read(object, sessionId, options, params).catch(() => null);
    const reason = facts ? askReason(facts, {enter}) : 'Aux couldn’t read what this control does.';
    if (!reason) return;
    const {data: screenshot} = await object.send('Page.captureScreenshot', {format: 'png'}, sessionId, options);
    await confirm({reason, url: facts?.url ?? '', screenshot});
  }
  return new Proxy(client, {get(object, key) {
    if (key !== 'send') {
      const value = Reflect.get(object, key, object);
      return typeof value === 'function' ? value.bind(object) : value;
    }
    return async (method, params = {}, sessionId, options) => {
      if (enabled()) {
        const source = script(method, params);
        if (method === 'Input.dispatchMouseEvent' && isPress(params)) await ask(object, sessionId, options, {point: point(params)}, false);
        else if (method === 'Input.dispatchKeyEvent' && isEnter(params)) await ask(object, sessionId, options, {}, true);
        else if (source && SCRIPTED.test(source) && !source.includes(OWN_HELPER)) await ask(object, sessionId, options, {objectId: params.objectId}, false);
      }
      return object.send(method, params, sessionId, options);
    };
  }});
}

/** The card for a gated action; its screenshot is the page as the action would land on it. */
export const confirmationRequest = ({reason, url}, path) => ({title: 'Confirm before Aux continues', message: `${reason}${url ? ` ${new URL(url).hostname}` : ''}`,
  artifact: {type: 'screenshot', path, alt: 'The page Aux is about to act on'}});
