import {repoRoot} from '../../../scripts/lib/repo-root.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {SourceTextModule, runInNewContext} from 'node:vm';
import test from 'node:test';
import {findMachOSeaSection, readSeaBlob} from '../../aside/lib/sea.mjs';
import {DAEMON_CODE_SHA256} from '../daemon-adapter.mjs';
import {applyBorrowedIdentityRemoval, DAEMON_EDITS, AGENT_EDITS, AGENT_PATH, FORBIDDEN} from './borrowed-identity-removal.mjs';

const snapshot = repoRoot + '/out/provided-source-snapshot-1.26.1016.1852';
const candidate = repoRoot + '/out/provided-candidate-completion-20261026-a1/Aux.app/Contents/Resources/aux/apps';
const sha = text => createHash('sha256').update(text).digest('hex');
const binary = readFileSync(snapshot + '/daemon/Contents/MacOS/aside-daemon'), section = findMachOSeaSection(binary);
const daemons = {
  snapshot: readSeaBlob(binary.subarray(section.offset, section.offset + section.size)).code,
  candidate: readFileSync(candidate + '/daemon/Aux Daemon.app/Contents/Resources/node-development/aux-native-entry.mjs', 'utf8'),
};
const agents = {
  snapshot: readFileSync(`${snapshot}/agent/${AGENT_PATH}`, 'utf8'),
  candidate: readFileSync(`${candidate}/extension/dist/${AGENT_PATH}`, 'utf8'),
};
const count = (text, needle) => text.split(needle).length - 1;

test('inputs are the frozen supplied daemon and the sealed candidate entry', () => {
  assert.equal(sha(daemons.snapshot), DAEMON_CODE_SHA256);
  assert.equal(sha(daemons.candidate), '101a65a26aac8a1ab2d966672ff6fdfc5475d8558f8162fd22b7f1eddb885b76');
  // The VS Code and Claude Code ids ship base64-encoded; their decoded forms are checked to stay absent.
  const decoded = new Set(['Iv1.b507a08c87ecfe98', '9d1c250a-e61b-44d9-88ed-5944d1962f5e']);
  for (const text of Object.values(daemons)) for (const marker of FORBIDDEN) assert.equal(count(text, marker) > 0, !decoded.has(marker), marker);
});

for (const [name, original] of Object.entries(daemons)) {
  test(`${name} daemon: borrowed clients and spoofed headers are gone, code still parses`, () => {
    const {text, anchors} = applyBorrowedIdentityRemoval({component: 'daemon', path: 'entry.mjs', text: original});
    assert.equal(anchors.length, DAEMON_EDITS.length);
    for (const marker of FORBIDDEN) assert.equal(count(text, marker), 0, marker);
    assert.equal(count(text, 'Sign in with the Codex CLI instead: run codex login in Terminal'), 2);
    assert.equal(count(text, 'Sign in with Claude Code instead: run claude auth login'), 2);
    new SourceTextModule(text);
    // The billing policy is now the identity: request options pass through unchanged.
    const start = text.indexOf('function withClaudeCodeBilling('), end = text.indexOf('async function claudeCodeBillingBlock(', start);
    const policy = runInNewContext(`(${text.slice(start, end)})`);
    const options = {headers: {a: '1'}};
    assert.equal(policy({provider: 'claude-code'}, options), options);
    // Unrelated providers keep their code: API-key xAI, Anthropic and Copilot model ids remain.
    for (const kept of ['function xaiProvider(){', 'function anthropicProvider(){', 'function githubCopilotProvider(){', 'auxChatGPT']) assert.equal(count(text, kept) > 0, count(original, kept) > 0, kept);
    assert.throws(() => applyBorrowedIdentityRemoval({component: 'daemon', path: 'entry.mjs', text}), /drift/);
  });
}

for (const [name, original] of Object.entries(agents)) {
  test(`${name} Agent: OAuth-only rows leave the provider list`, () => {
    const {text, anchors} = applyBorrowedIdentityRemoval({component: 'agent', path: AGENT_PATH, text: original});
    assert.equal(anchors.length, AGENT_EDITS.length);
    new SourceTextModule(text);
    const list = JSON.parse(text.slice(text.indexOf('var Zf=') + 7, text.indexOf(']', text.indexOf('var Zf=')) + 1));
    for (const id of ['meta-muse', 'xai-grok-oauth', 'kimi-code', 'github-copilot']) assert.ok(!list.includes(id), id);
    for (const id of ['claude-code', 'openai-codex', 'meta', 'xai', 'kimi-coding', 'opencode']) assert.ok(list.includes(id), id);
    assert.throws(() => applyBorrowedIdentityRemoval({component: 'agent', path: AGENT_PATH, text}), /drift/);
  });
}

test('other files pass through untouched', () => {
  assert.deepEqual(applyBorrowedIdentityRemoval({component: 'agent', path: 'background.js', text: 'x'}), {text: 'x', anchors: []});
  assert.deepEqual(applyBorrowedIdentityRemoval({component: 'cli', path: 'entry.mjs', text: 'y'}), {text: 'y', anchors: []});
});
