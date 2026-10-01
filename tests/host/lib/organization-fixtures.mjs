import assert from 'node:assert/strict';
import { createGithubFixture } from './github-fixture.mjs';

/** OAuth goes through the owner's connect UI and the real local callback listener. */
export function organizationFixtures(fixture) {
  const github = createGithubFixture(fixture, { pulls: [{ id: 42, number: 42, title: 'Review Aux work', html_url: `${fixture.url}/red`, updated_at: '2026-01-01T00:00:00Z' }] });
  const removers = [];
  const route = (path, handler, options = {}) => removers.push(fixture.route(path, handler, { headers: { 'content-type': 'application/json' }, ...options }));
  route('/calendar/auth', (_request, response, url) => {
    assert.equal(url.searchParams.get('client_id'), 'aux-loopback-calendar-client');
    assert.equal(url.searchParams.get('scope'), 'https://www.googleapis.com/auth/calendar.readonly');
    assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
    assert.ok(url.searchParams.get('code_challenge'));
    const callback = new URL(url.searchParams.get('redirect_uri'));
    assert.equal(callback.protocol, 'http:'); assert.equal(callback.hostname, '127.0.0.1');
    assert.ok(callback.port); assert.equal(callback.pathname, '/oauth/google-calendar');
    assert.ok(url.searchParams.get('state'));
    callback.searchParams.set('state', url.searchParams.get('state'));
    callback.searchParams.set('code', 'aux-fixture-calendar-code');
    response.statusCode = 302; response.setHeader('location', callback.href); return '';
  });
  route('/calendar/token', async request => {
    let body = ''; for await (const chunk of request) { body += chunk; assert.ok(body.length <= 4096); }
    const params = new URLSearchParams(body);
    assert.equal(params.get('client_id'), 'aux-loopback-calendar-client');
    assert.ok(['authorization_code', 'refresh_token'].includes(params.get('grant_type')));
    if (params.get('grant_type') === 'authorization_code') { assert.equal(params.get('code'), 'aux-fixture-calendar-code'); assert.ok(params.get('code_verifier')); }
    return { access_token: 'aux-fixture-calendar-access', refresh_token: 'aux-fixture-calendar-refresh', expires_in: 3600, scope: 'https://www.googleapis.com/auth/calendar.readonly' };
  }, { method: 'POST' });
  const calendar = request => assert.equal(request.headers.authorization, 'Bearer aux-fixture-calendar-access');
  route('/calendar/v3/users/me/calendarList/primary', request => { calendar(request); return { id: 'fixture@calendar.test', primary: true, summary: 'Aux Calendar fixture' }; });
  route('/calendar/v3/calendars/primary/events', request => {
    calendar(request); const start = new Date(); start.setHours(12, 0, 0, 0);
    return { items: [{ id: 'fixture-review', summary: 'Review the browser', start: { dateTime: start.toISOString() }, end: { dateTime: new Date(start.getTime() + 3_600_000).toISOString() }, htmlLink: `${fixture.url}/blue` }] };
  });
  route('/calendar/revoke', () => ({}), { method: 'POST' });
  route('/organization/feed', `<rss><channel><item><guid>red-row</guid><title>Read Red</title><link>${fixture.url}/red</link></item><item><guid>blue-row</guid><title>Read Blue</title><link>${fixture.url}/blue</link></item></channel></rss>`, { headers: { 'content-type': 'application/rss+xml' } });
  return { github, close() { github.close(); removers.forEach(remove => remove()); } };
}
