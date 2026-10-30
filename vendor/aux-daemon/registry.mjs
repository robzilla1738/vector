/** tRPC namespaces Aux implements itself (root routers, or nested ones as `sessions.tabs`), each a
 * module beside this file whose `create(bindings)` returns procedures. Every other namespace, and any procedure a module leaves out, is served by
 * the supplied router unchanged. Add a namespace here only with a parity test against the supplied one. */
export const NAMESPACES = Object.freeze({
  inbox: './namespaces/inbox.mjs',
  uiAttention: './namespaces/uiAttention.mjs',
  fullDiskAccess: './namespaces/fullDiskAccess.mjs',
  agentRuntime: './namespaces/agentRuntime.mjs',
  capture: './namespaces/capture.mjs',
  routines: './namespaces/routines.mjs',
  projects: './namespaces/projects.mjs',
  billing: './namespaces/billing.mjs',
  referrals: './namespaces/referrals.mjs',
  settings: './namespaces/settings.mjs',
  developers: './namespaces/developers.mjs',
  onboarding: './namespaces/onboarding.mjs',
  meta: './namespaces/meta.mjs',
  'sessions.tabs': './namespaces/sessions.tabs.mjs',
  mcp: './namespaces/mcp.mjs',
  channels: './namespaces/channels.mjs',
  cli: './namespaces/cli.mjs',
  memory: './namespaces/memory.mjs',
  contextAwareness: './namespaces/contextAwareness.mjs',
  models: './namespaces/models.mjs',
  accounts: './namespaces/accounts.mjs',
  sessions: './namespaces/sessions.mjs',
  analytics: './namespaces/analytics.mjs',
  sync: './namespaces/sync.mjs',
  lasso: './namespaces/lasso.mjs',
});

/** Supplied stores Aux implements itself, each a module beside this file whose `create(bindings)`
 * returns the store; a count-checked edit (integration.mjs) makes the bundle's own store reach it,
 * so every supplied caller uses Aux's store too. */
export const STORES = Object.freeze({
  settings: './stores/settings.mjs',
  projects: './stores/projects.mjs',
  transcripts: './stores/transcripts.mjs',
  sessions: './stores/sessions.mjs',
  inbox: './stores/inbox.mjs',
  recentSessions: './stores/recentSessions.mjs',
  routines: './stores/routines.mjs',
  channels: './stores/channels.mjs',
  memoryFiles: './stores/memoryFiles.mjs',
  contextLedger: './stores/contextLedger.mjs',
  contextHistory: './stores/contextHistory.mjs',
  toolFiles: './tools/files.mjs',
  toolSession: './tools/session.mjs',
  toolShell: './tools/shell.mjs',
  toolWeb: './tools/web.mjs',
  toolMemory: './tools/memory.mjs',
  toolAgents: './tools/agents.mjs',
  toolsets: './tools/toolsets.mjs',
  bridgeCommands: './bridge/commands.mjs',
  bridgeServer: './bridge/server.mjs',
  browserBinding: './bridge/binding.mjs',
  mcpManager: './mcp/manager.mjs',
  mcpConnections: './mcp/connections.mjs',
});

/** Modules the namespaces and stores import, copied with them. */
export const SUPPORT_FILES = Object.freeze(['tools/common.mjs', 'tools/prompts.mjs', 'tools/schemas.mjs']);
