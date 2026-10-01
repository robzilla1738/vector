import assert from 'node:assert/strict';

/** Disposable API data, never a real GitHub bearer. Endpoints stay on the fixture server. */
export function createGithubFixture(fixture, { user = 'aux-fixture', repositories = [], pulls = [], notifications = [] } = {}) {
  const removers = [];
  let failure;
  const install = (path, value) => removers.push(fixture.route(path, (_request, response) => {
    if (failure) { response.statusCode = failure; return { message: 'Fixture API failure' }; }
    return typeof value === 'function' ? value() : value;
  }, { headers: { 'content-type': 'application/json' } }));
  install('/user', { login: user, id: 1, name: 'Aux fixture person' });
  install('/user/repos', () => repositories);
  install('/notifications', () => notifications);
  install('/search/issues', () => ({ total_count: pulls.length, incomplete_results: false, items: pulls }));
  for (const repo of repositories) {
    assert.match(repo.full_name, /^[\w.-]+\/[\w.-]+$/);
    install(`/repos/${repo.full_name}/pulls`, () => pulls.filter(pull => pull.repository?.full_name === repo.full_name));
  }
  return { endpoint: fixture.url, token: 'aux-loopback-fixture-token',
    fail(status) { assert.ok(status === undefined || [401, 403, 429, 500].includes(status)); failure = status; },
    close() { removers.forEach(remove => remove()); } };
}
