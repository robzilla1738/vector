/** Aux provider CLI integration (owner decision 1): detect the official CLIs, report their
 * login state, and drive them headlessly with the user's own login. See design.md in
 * docs/integration/proposed/completion-20261026/runtime/provider-cli-a1. */
export {PROVIDERS, API_KEY_ONLY, providerById, parseAuthStatus, settingsRow, maskEmail} from './catalog.mjs';
export {detectAll, detectProvider, loginShellPath, userLoginPath, resolveCommand, childEnvironment, fallbackDirectories} from './detect.mjs';
export {runTurn, prepareRunDirectory, removeRunDirectory, mcpSetup, buildArgs, MCP_SERVER_NAME, MCP_TOKEN_ENV} from './drivers.mjs';
export {terminateAll, installExitCleanup, liveChildren} from './process.mjs';
export {PARSERS} from './stream.mjs';
