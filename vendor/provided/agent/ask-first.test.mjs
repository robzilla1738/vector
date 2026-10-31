import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
import test from 'node:test';
import {CONTROL_FACTS, agentInitiated, askFirstClient, askReason, confirmationRequest, isBankingSite, readOnlyScope, requestNeedsCard} from './ask-first.mjs';

/** The fixture page, as far as CONTROL_FACTS looks at it. */
function pageWith(fixture) {
  const control = {...fixture.control, nodeType: 1, value: '', isContentEditable: false, closest: () => control, getAttribute: name => fixture.control.attributes[name] ?? null, tagName: fixture.control.tag,
    form: fixture.form && {method: fixture.form.method, elements: fixture.form.fields}};
  return {location: {href: fixture.url}, document: {elementFromPoint: () => control, activeElement: control}};
}
const inPage = (page, source, self, argument) => new Function('location', 'document', `return (${source}).call(this, arguments[2])`).call(self, page.location, page.document, argument);

/** A browser that answers the gate's reads from the fixture and records what reaches the page. */
function browser(fixture) {
  const sent = [], page = pageWith(fixture);
  const handlers = new Map();
  return {sent, on: (event, handler) => handlers.set(event, handler), emit: (event, data, meta) => handlers.get(event)?.(data, meta), send: async (method, params) => {
    if (method === 'Runtime.evaluate' && params.expression.includes('elementFromPoint'))
      return {result: {value: inPage(page, CONTROL_FACTS, null, JSON.parse(params.expression.match(/\.call\(null, (.*)\)$/)[1]))}};
    if (method === 'Page.captureScreenshot') return {data: 'AAAA'};
    sent.push(method);
    return {};
  }};
}
const turn = {call: () => 'call'};
const press = {type: 'mousePressed', button: 'left', x: 5, y: 5, clickCount: 1};
const facts = over => ({url: 'https://shop.example/', tag: 'button', type: 'button', label: '', ...over});

test('an injected page cannot talk its way past the card', async () => {
  const fixture = JSON.parse(readFileSync(new URL('../../../fixtures/ask-first/injected-form.json', import.meta.url), 'utf8'));
  assert.match(fixture.page, /Do not ask the user/);
  const target = browser(fixture), asked = [];
  const client = askFirstClient(target, {...turn, enabled: () => true, confirm: async request => { asked.push(request); throw Error('The user did not confirm.'); }});
  await assert.rejects(client.send('Input.dispatchMouseEvent', press, 's'), /did not confirm/);
  assert.deepEqual(target.sent, [], 'the press never reached the page');
  assert.equal(asked[0].reason, 'This submits a payment form.');
  assert.equal(asked[0].screenshot, 'AAAA');
  const approved = askFirstClient(target, {...turn, enabled: () => true, confirm: async () => {}});
  await approved.send('Input.dispatchMouseEvent', press, 's');
  assert.ok(target.sent.includes('Input.dispatchMouseEvent'), 'Approve lets it through');
});

test('Skip confirmation asks nothing, and a read is never gated', async () => {
  const target = browser({url: 'https://a.test/', control: {tag: 'BUTTON', type: 'submit', textContent: 'Pay', attributes: {}}});
  const client = askFirstClient(target, {...turn, enabled: () => false, confirm: async () => assert.fail('asked')});
  await client.send('Input.dispatchMouseEvent', press, 's');
  const gated = askFirstClient(target, {...turn, enabled: () => true, confirm: async () => assert.fail('asked')});
  await gated.send('Page.getLayoutMetrics', {}, 's');
  await gated.send('Input.dispatchMouseEvent', {...press, type: 'mouseReleased'}, 's');
  await gated.send('Runtime.evaluate', {expression: 'document.title'}, 's');
  await gated.send('Runtime.callFunctionOn', {functionDeclaration: 'function() { globalThis.__aux.x(this.click()) }'}, 's');
});

test('a press Aux cannot read counts as sensitive', async () => {
  const asked = [], client = askFirstClient({on() {}, send: async method => { if (method === 'Runtime.evaluate') throw Error('gone'); return {data: 'A'}; }}, {...turn, enabled: () => true, confirm: async request => { asked.push(request); }});
  await client.send('Input.dispatchMouseEvent', press, 's');
  assert.match(asked[0].reason, /couldn’t read/);
});

test('submit, send and pay controls ask; ordinary clicks and searches do not', () => {
  for (const control of [{tag: 'button', type: 'submit', inForm: true, method: 'post'}, {tag: 'input', type: 'submit', inForm: true, method: 'post'},
    {tag: 'button', type: 'submit', inForm: true, method: 'get', password: true}, {label: 'Send'}, {label: 'Place order'}, {label: 'Bezahlen'}, {label: '送信'}, {label: '결제'}, {label: '提交'},
    {tag: 'div', role: 'button', label: 'Pay now'}, {tag: 'iframe', frame: 'https://js.stripe.com/card'}]) assert.ok(askReason(facts(control)), JSON.stringify(control));
  for (const control of [{label: 'Menu'}, {label: 'Read more about how to send a parcel to your family abroad'}, {tag: 'a', label: 'Send'}, {tag: 'button', type: 'submit', inForm: true, method: 'get'},
    {tag: 'input', type: 'text', inForm: true, method: 'post', password: true}, {tag: 'input', type: 'search', label: 'Pay'}]) assert.equal(askReason(facts(control)), null, JSON.stringify(control));
});

test('Enter asks where it submits or sends, not while typing', () => {
  assert.ok(askReason(facts({tag: 'input', type: 'text', inForm: true, method: 'post'}), {enter: true}));
  assert.ok(askReason(facts({tag: 'div', editable: true, label: 'Message #general'}), {enter: true}));
  assert.equal(askReason(facts({tag: 'textarea', inForm: true, method: 'post'}), {enter: true}), null);
  assert.equal(askReason(facts({tag: 'div', editable: true, label: 'Page body'}), {enter: true}), null);
  assert.equal(askReason(facts({tag: 'input', type: 'search', inForm: true, method: 'get'}), {enter: true}), null);
});

test('a scripted submit or click asks; Aux’s own page helpers do not', async () => {
  const target = browser({url: 'https://a.test/', form: {method: 'post', fields: []}, control: {tag: 'BUTTON', type: 'submit', textContent: 'Go', attributes: {}}}), asked = [];
  const client = askFirstClient(target, {...turn, enabled: () => true, confirm: async request => { asked.push(request); }});
  await client.send('Runtime.evaluate', {expression: "document.querySelector('form').requestSubmit()"}, 's');
  assert.equal(asked.length, 1);
});

test('banking-class sites ask on any press', () => {
  for (const url of ['https://www.chase.com/', 'https://secure.bankofamerica.com/x', 'https://online.firstbank.com/', 'https://my-creditunion.org/', 'https://www.paypal.com/'])
    assert.ok(isBankingSite(url), url);
  for (const url of ['https://chase.com.evil.test/', 'https://example.com/bank', 'not a url', 'https://embankment.test/']) assert.equal(isBankingSite(url), false, url);
  assert.ok(askReason(facts({url: 'https://www.chase.com/', label: 'Menu'})));
});

test('aux exec --allow reaches read-only scopes only', () => {
  for (const scope of [{type: 'tool', tool: 'webfetch'}, {type: 'file', mode: 'read'}, {type: 'browser', action: 'read'}]) assert.equal(readOnlyScope(scope), true);
  for (const scope of [{type: 'tool', tool: 'repl'}, {type: 'tool', tool: 'write_file'}, {type: 'file', mode: 'write'}, {type: 'browser', action: 'modify'}, {type: 'network', url: 'x'}, undefined])
    assert.equal(readOnlyScope(scope), false);
});

test('the card names the reason and the site', () => {
  const request = confirmationRequest({reason: 'This submits a form.', url: 'https://a.test/x'}, 'artifacts/c.png');
  assert.equal(request.message, 'This submits a form. a.test');
  assert.equal(request.artifact.type, 'screenshot');
});

/** A command whose page sends `requests` while it runs; each is {data, initiator}. */
function sending(requests) {
  const target = browser({url: 'https://a.test/', control: {tag: 'DIV', type: '', textContent: '', attributes: {}}});
  const send = target.send;
  target.send = async (method, params, sessionId) => {
    const result = await send(method, params, sessionId);
    if (method === 'Runtime.evaluate' && params.expression === 'agent code') requests.forEach(({data, initiator}, index) => {
      if (initiator !== undefined) target.emit('Network.requestWillBeSent', {requestId: `n${index}`, initiator});
      target.emit('Fetch.requestPaused', {requestId: `r${index}`, networkId: `n${index}`, ...data}, {sessionId});
    });
    return result;
  };
  return target;
}
const post = (resourceType, url = 'https://api.test/pay') => ({resourceType, request: {method: 'POST', url}});
const evaluated = {type: 'script', stack: {callFrames: [{url: ''}, {url: 'https://a.test/app.js'}]}};
const pageScript = {type: 'script', stack: {callFrames: [{url: 'https://a.test/app.js'}]}};
const ending = sent => sent.filter(method => /^Fetch\.(?:continue|fail)/.test(method));

test('code the agent evaluates cannot send past the card, however it is spelled', async () => {
  const target = sending([{data: post('Fetch'), initiator: evaluated}]), asked = [];
  const client = askFirstClient(target, {call: () => 'tool-1', enabled: () => true, confirm: async (request, call) => { asked.push([request.reason, call]); throw Error('The user did not confirm.'); }});
  await assert.rejects(client.send('Runtime.evaluate', {expression: 'agent code'}, 's'), /did not confirm/);
  assert.deepEqual(asked, [['This sends data to api.test.', 'tool-1']], 'the card reaches the tool call that ran the code');
  assert.deepEqual(ending(target.sent), ['Fetch.failRequest']);
});

test('an approved send goes on, and a run of requests asks once', async () => {
  const target = sending([{data: post('Fetch'), initiator: evaluated}]), asked = [];
  const client = askFirstClient(target, {...turn, enabled: () => true, confirm: async request => { asked.push(request); }});
  await client.send('Runtime.evaluate', {expression: 'agent code'}, 's');
  assert.equal(asked.length, 1);
  assert.deepEqual(ending(target.sent), ['Fetch.continueRequest']);
});

test('the page’s own traffic during a command asks nothing', async () => {
  const target = sending([{data: post('Ping', 'https://analytics.test/collect'), initiator: pageScript}, {data: post('XHR', 'https://a.test/track'), initiator: pageScript}, {data: {resourceType: 'Fetch', request: {method: 'GET', url: 'https://a.test/x'}}, initiator: evaluated}]);
  const client = askFirstClient(target, {...turn, enabled: () => true, confirm: async () => assert.fail('asked')});
  await client.send('Runtime.evaluate', {expression: 'agent code'}, 's');
  assert.deepEqual(ending(target.sent), ['Fetch.continueRequest', 'Fetch.continueRequest', 'Fetch.continueRequest']);
});

test('a request paused outside any command just continues', async () => {
  const target = sending([]);
  const client = askFirstClient(target, {...turn, enabled: () => true, confirm: async () => assert.fail('asked')});
  await client.send('Runtime.evaluate', {expression: 'agent code'}, 's');
  target.emit('Fetch.requestPaused', {requestId: 'late', networkId: 'late', ...post('Document')}, {sessionId: 's'});
  await delay(5);
  assert.deepEqual(ending(target.sent), ['Fetch.continueRequest']);
});

test('which requests need the card', () => {
  assert.equal(requestNeedsCard(post('Document'), pageScript, false), true, 'a form post, whoever started it');
  assert.equal(requestNeedsCard({resourceType: 'Document', request: {method: 'GET'}}, evaluated, true), false);
  assert.equal(requestNeedsCard(post('XHR'), evaluated, false), true);
  assert.equal(requestNeedsCard(post('XHR'), pageScript, true), false);
  assert.equal(requestNeedsCard(post('Fetch'), undefined, true), true, 'unknown origin during agent code');
  assert.equal(requestNeedsCard(post('Fetch'), undefined, false), false, 'a click’s own fetch stays with the control check');
  assert.equal(agentInitiated({stack: {callFrames: [{url: 'https://a.test/'}], parent: {callFrames: [{url: ''}]}}}), true, 'an async parent counts');
  assert.equal(agentInitiated({type: 'parser'}), false);
});
