/** Ask first in code (roadmap decision 1). A page can talk a model out of calling
 * request_action_confirmation, so under Ask first every CDP command the agent sends passes through
 * here: a click or Enter on a submit, send or pay control, or any of them on a banking-class site,
 * raises the confirmation card whatever the model chose. Nothing else asks: no per-click or per-site
 * prompt. The page is read for facts only; its text never decides anything but a control's label.
 *
 * A script can send without touching a control, however it spells that, so while an agent command
 * runs the Fetch domain pauses its requests. The extension continues reads itself. A form post or
 * navigation asks. So does a fetch, XHR or beacon whose initiator stack has a frame with no URL,
 * which is what Runtime.evaluate code looks like; the page's own scripts all have URLs, so its
 * analytics go on. A plain click's own fetch stays with the control check, because plenty of sites
 * read over POST and asking there would be the per-click prompt decision 1 rules out. */

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
const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
// A request a command caused can start just after the command returns.
const SETTLE_MS = 150, WATCH_LINGER_MS = 1000, INITIATOR_WAIT_MS = 300, MAX_INITIATORS = 256;

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

/** Whether a stack ran code the page didn't load: evaluated code has no script URL. */
export function agentInitiated(initiator) {
  for (let stack = initiator?.stack; stack; stack = stack.parent)
    if (stack.callFrames?.some(frame => !frame.url)) return true;
  return false;
}

/** Whether a paused request needs the card. initiator: undefined when Network never reported it. */
export function requestNeedsCard({request, resourceType}, initiator, scripted) {
  if (READ_METHODS.has(request.method)) return false;
  if (resourceType === 'Document') return true;
  return initiator === undefined ? scripted : agentInitiated(initiator);
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/** Pauses what a command sends. A session stays enabled briefly between commands, so a run of them
 * doesn't switch interception on and off, and anything paused outside a command just continues. */
function requestWatch(object, {confirm, shot}) {
  const sessions = new Map(), initiators = new Map(), waiting = new Map();
  let listening = false;
  const listen = () => {
    if (listening) return;
    listening = true;
    object.on('Network.requestWillBeSent', data => {
      initiators.set(data.requestId, data.initiator);
      if (initiators.size > MAX_INITIATORS) initiators.delete(initiators.keys().next().value);
      waiting.get(data.requestId)?.();
    });
    object.on('Fetch.requestPaused', (data, meta) => decide(data, meta?.sessionId));
  };
  const initiatorOf = async id => {
    if (!initiators.has(id)) await Promise.race([new Promise(resolve => waiting.set(id, resolve)), delay(INITIATOR_WAIT_MS)]);
    waiting.delete(id);
    return initiators.get(id);
  };
  async function decide(data, sessionId) {
    const state = sessions.get(sessionId), command = state && [...state.commands].at(-1), resume = () => object.send('Fetch.continueRequest', {requestId: data.requestId}, sessionId).catch(() => {});
    if (!command || command.confirmed) return resume();
    const work = (async () => {
      if (!requestNeedsCard(data, await initiatorOf(data.networkId), command.scripted)) return resume();
      try {
        const {data: screenshot} = await shot(sessionId);
        await confirm({reason: `This sends data to ${new URL(data.request.url).hostname}.`, url: data.request.url, screenshot}, command.call);
        command.confirmed = true;
      } catch (error) {
        command.refused ??= error;
        return object.send('Fetch.failRequest', {requestId: data.requestId, errorReason: 'BlockedByClient'}, sessionId).catch(() => {});
      }
      return resume();
    })();
    command.pending.add(work);
    await work;
  }
  /** Runs one command inside a window, and holds its result until what it sent has been answered. */
  async function during(sessionId, options, command, send) {
    let state = sessions.get(sessionId);
    if (!state) {
      listen();
      state = {commands: new Set(), ready: Promise.all([object.send('Network.enable', {}, sessionId, options), object.send('Fetch.enable', {patterns: [{urlPattern: '*', requestStage: 'Request'}]}, sessionId, options)])};
      sessions.set(sessionId, state);
    }
    clearTimeout(state.linger);
    await state.ready;
    state.commands.add(command);
    try {
      const result = await send();
      await delay(SETTLE_MS);
      await Promise.all(command.pending);
      if (command.refused) throw command.refused;
      return result;
    } finally {
      state.commands.delete(command);
      if (!state.commands.size) state.linger = setTimeout(() => {
        sessions.delete(sessionId);
        object.send('Fetch.disable', {}, sessionId).catch(() => {});
      }, WATCH_LINGER_MS);
    }
  }
  return during;
}

/** The client every page command goes through. enabled(): Ask first holds for this session.
 * confirm({reason, url, screenshot}, call) raises the card for tool call `call` and throws unless
 * the user confirms. Facts that can't be read count as sensitive, since a page must not be able to
 * dodge the check by breaking it. */
export function askFirstClient(client, {enabled, confirm, call}) {
  const during = requestWatch(client, {confirm, shot: sessionId => client.send('Page.captureScreenshot', {format: 'png'}, sessionId)});
  const read = async (object, sessionId, options, params) => {
    const call = params.objectId ? ['Runtime.callFunctionOn', {objectId: params.objectId, functionDeclaration: CONTROL_FACTS, arguments: [{value: null}], returnByValue: true}]
      : ['Runtime.evaluate', {expression: `(${CONTROL_FACTS}).call(null, ${JSON.stringify(params.point ?? null)})`, returnByValue: true}];
    return (await object.send(...call, sessionId, options)).result?.value;
  };
  async function ask(object, sessionId, options, params, enter, command) {
    const facts = await read(object, sessionId, options, params).catch(() => null);
    const reason = facts ? askReason(facts, {enter}) : 'Aux couldn’t read what this control does.';
    if (!reason) return;
    const {data: screenshot} = await object.send('Page.captureScreenshot', {format: 'png'}, sessionId, options);
    await confirm({reason, url: facts?.url ?? '', screenshot}, command.call);
    command.confirmed = true;
  }
  return new Proxy(client, {get(object, key) {
    if (key !== 'send') {
      const value = Reflect.get(object, key, object);
      return typeof value === 'function' ? value.bind(object) : value;
    }
    return async (method, params = {}, sessionId, options) => {
      const source = script(method, params), own = !!source && source.includes(OWN_HELPER);
      const pressed = method === 'Input.dispatchMouseEvent' && isPress(params), entered = method === 'Input.dispatchKeyEvent' && isEnter(params);
      if (!sessionId || !(pressed || entered || source && !own) || !enabled()) return object.send(method, params, sessionId, options);
      const command = {call: call(), scripted: !!source, pending: new Set()};
      if (pressed) await ask(object, sessionId, options, {point: point(params)}, false, command);
      else if (entered) await ask(object, sessionId, options, {}, true, command);
      else if (SCRIPTED.test(source)) await ask(object, sessionId, options, {objectId: params.objectId}, false, command);
      return during(sessionId, options, command, () => object.send(method, params, sessionId, options));
    };
  }});
}

/** The card for a gated action; its screenshot is the page as the action would land on it. */
export const confirmationRequest = ({reason, url}, path) => ({title: 'Confirm before Aux continues', message: `${reason}${url ? ` ${new URL(url).hostname}` : ''}`,
  artifact: {type: 'screenshot', path, alt: 'The page Aux is about to act on'}});
