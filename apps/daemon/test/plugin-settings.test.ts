import assert from 'node:assert/strict';
import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { AgentEngine } from '@aux/agent';
import { BridgeRegistry } from '../src/bridge/registry.js';
import { createDeveloperSettingsRouter } from '../src/cli/developer-settings.js';
import { createSkillSettingsRouter } from '../src/cli/skill-settings.js';
import { accountSkills } from '../src/cli/skills.js';
import { createMcpRouter, mcpTools } from '../src/mcp/index.js';
import { Store } from '../src/storage/store.js';
import { procedure, t } from '../src/trpc/core.js';

test('skill settings enforce scope, customization, import conflicts and symlink boundaries', async () => {
  const home = await realpath(
    await mkdtemp(join(tmpdir(), 'aux-skill-settings-')),
  );
  const store = new Store(home);
  try {
    const accountId = store.current();
    const services = { store, t, procedure, bridge: new BridgeRegistry() };
    const caller = createSkillSettingsRouter(services).createCaller({
      store,
      clientKind: 'cli',
    });
    const input = {
      accountId,
      projectId: null,
      name: 'fixture-workflow',
      description: 'Fixture instructions',
      body: 'Use only the fixture context.',
      keywords: ['fixture'],
      urlPatterns: ['localhost/*'],
    };
    const created = await caller.createSkill(input);
    assert.equal(
      (await accountSkills(store, accountId))
        .find((item) => item.name === input.name)
        ?.body.includes(input.body),
      true,
    );
    await caller.setSkillEnabled({
      accountId,
      skillPath: created.skillPath,
      enabled: false,
    });
    assert.equal(
      (await accountSkills(store, accountId)).find(
        (item) => item.name === input.name,
      )?.enabled,
      false,
    );
    const builtin = (await caller.listSkillsForSettings({ accountId })).find(
      (item) => item.builtin,
    );
    assert.ok(builtin);
    await assert.rejects(
      caller.deleteSkill({ accountId, skillPath: builtin.path }),
      /Only skills owned/,
    );
    const customization = await caller.copySkillForCustomization({
      accountId,
      skillPath: builtin.path,
    });
    assert.notEqual(customization.skillPath, builtin.path);
    assert.equal(
      (await caller.listSkillsForSettings({ accountId })).find(
        (item) => item.path === builtin.path,
      )?.overridden,
      true,
    );
    await assert.rejects(
      caller.readSkillFile({
        accountId,
        skillPath: created.skillPath,
        fileName: '../../accounts.json',
      }),
      /outside/,
    );
    const otherId = store.add('Other', 'local').id;
    await assert.rejects(
      caller.updateSkill({
        ...input,
        accountId: otherId,
        skillPath: created.skillPath,
      }),
      /no longer available/,
    );
    const source = join(home, 'chosen');
    await mkdir(source);
    await writeFile(
      join(source, 'SKILL.md'),
      '---\nname: imported-fixture\ndescription: Import fixture\n---\nFixture body.\n',
    );
    await symlink('/etc/passwd', join(source, 'escape'));
    await assert.rejects(
      caller.importSkillFolder({
        accountId,
        folderPath: source,
        authorized: true,
      }),
      /symbolic links/,
    );
    await rm(join(source, 'escape'));
    await writeFile(join(source, 'notes.txt'), 'Supporting fixture');
    const imported = await caller.importSkillFolder({
      accountId,
      folderPath: source,
      authorized: true,
    });
    assert.equal(imported.importedFiles, 2);
    await assert.rejects(
      caller.importSkillFolder({
        accountId,
        folderPath: source,
        authorized: true,
      }),
      /already exists/,
    );
    await assert.rejects(
      caller.readSkillFile({
        accountId,
        skillPath: imported.skillPath,
        fileName: '../notes.txt',
      }),
      /outside/,
    );
    const workspace = join(home, 'workspace');
    await mkdir(workspace);
    store.set(accountId, 'projects', 'fixture', { workspacePath: workspace });
    const project = await caller.createSkill({
      ...input,
      projectId: 'fixture',
    });
    await caller.setSkillEnabled({
      accountId,
      projectId: 'fixture',
      skillPath: project.skillPath,
      enabled: false,
    });
    assert.equal(
      (await accountSkills(store, accountId, 'fixture')).find(
        (item) => item.name === input.name,
      )?.enabled,
      false,
    );
    await caller.deleteSkill({ accountId, skillPath: created.skillPath });
    assert.equal(
      (await caller.listSkillsForSettings({ accountId })).some(
        (item) => item.path === created.skillPath,
      ),
      false,
    );
    const executable = join(home, 'fixture-cli');
    await writeFile(executable, '#!/bin/sh\nexit 0\n', { mode: 0o700 });
    const developer = createDeveloperSettingsRouter(services, {
      home,
      cliExecutable: executable,
    }).createCaller({ store, clientKind: 'cli' });
    assert.equal((await developer.installCli({ accountId })).installed, true);
    assert.equal(
      (await developer.checkCliInstallation({ accountId })).installed,
      true,
    );
  } finally {
    store.close();
    await rm(home, { recursive: true, force: true });
  }
});

test('MCP real stdio discovery preserves write-only secrets and disables execution', async () => {
  const home = await realpath(
    await mkdtemp(join(tmpdir(), 'aux-mcp-settings-')),
  );
  const store = new Store(home);
  const bridge = new BridgeRegistry();
  const engine = new AgentEngine(store, bridge);
  try {
    const script = join(home, 'mcp-fixture.cjs');
    await writeFile(
      script,
      `const readline = require('node:readline');\nreadline.createInterface({input:process.stdin}).on('line', line => { const q=JSON.parse(line); if(q.id===undefined)return; let result; if(q.method==='initialize')result={protocolVersion:q.params.protocolVersion,capabilities:{tools:{}},serverInfo:{name:'fixture',version:'1'}}; else if(q.method==='tools/list')result={tools:[{name:'fixture',inputSchema:{type:'object',properties:{}}}]}; else if(q.method==='tools/call')result={content:[{type:'text',text:process.env.AUX_FIXTURE_SECRET}]}; else result={}; process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:q.id,result})+'\\n'); });`,
    );
    const accountId = store.current();
    const caller = createMcpRouter(
      { store, bridge, t, procedure },
      engine,
    ).createCaller({ store, clientKind: 'cli' });
    const server = {
      type: 'stdio' as const,
      command: process.execPath,
      args: [script],
      env: { AUX_FIXTURE_SECRET: 'private-fixture-value' },
    };
    assert.equal(
      (await caller.testConnection({ accountId, name: 'fixture', server }))
        .tools.length,
      1,
    );
    assert.equal((await caller.listServers({ accountId })).length, 0);
    await caller.saveServer({ accountId, name: 'fixture', server });
    const inventory = await caller.listServers({ accountId });
    assert.equal(
      JSON.stringify(inventory).includes('private-fixture-value'),
      false,
    );
    await caller.saveServer({
      accountId,
      name: 'renamed',
      previousName: 'fixture',
      server: { ...server, env: {} },
      preserveEnvKeys: ['AUX_FIXTURE_SECRET'],
    });
    assert.equal(
      (await caller.listServers({ accountId })).some(
        (item) => item.name === 'fixture',
      ),
      false,
    );
    const response = await caller.callTool({
      accountId,
      name: 'renamed',
      toolName: 'fixture',
      arguments: {},
    });
    assert.equal(
      JSON.stringify(response).includes('private-fixture-value'),
      true,
    );
    const readonly = engine.create({ accountId, permissionMode: 'read-only' });
    const readonlyTool = mcpTools(
      engine,
      readonly,
      new AbortController().signal,
    ).mcp_call?.execute;
    assert.ok(readonlyTool);
    await assert.rejects(
      async () =>
        readonlyTool(
          { server: 'renamed', toolName: 'fixture', arguments: {} },
          { toolCallId: 'read-only' },
        ),
      /Read-only/,
    );
    const session = engine.create({ accountId, permissionMode: 'full-access' });
    const tool = mcpTools(engine, session, new AbortController().signal)
      .mcp_call?.execute;
    assert.ok(tool);
    const operation = tool(
      { server: 'renamed', toolName: 'fixture', arguments: {} },
      { toolCallId: 'pending-mcp' },
    );
    const blocked = assert.rejects(async () => operation, /disabled/);
    for (
      let attempt = 0;
      attempt < 100 && engine.get(accountId, session.id).status !== 'suspended';
      attempt++
    )
      await new Promise((resolve) => setTimeout(resolve, 5));
    assert.equal(
      engine.get(accountId, session.id).suspensions.at(-1)?.kind,
      'action-confirmation',
    );
    await caller.setEnabled({ accountId, name: 'renamed', enabled: false });
    engine.resolve(accountId, session.id, 'pending-mcp', {
      verdict: 'confirm',
    });
    await blocked;

    await assert.rejects(
      caller.callTool({
        accountId,
        name: 'renamed',
        toolName: 'fixture',
        arguments: {},
      }),
      /disabled/,
    );
    await caller.deleteServer({ accountId, name: 'renamed' });
    assert.equal((await caller.listServers({ accountId })).length, 0);
    assert.equal(
      (await readFile(script, 'utf8')).includes('AUX_FIXTURE_SECRET'),
      true,
    );
  } finally {
    await engine.close();
    store.close();
    await rm(home, { recursive: true, force: true });
  }
});
