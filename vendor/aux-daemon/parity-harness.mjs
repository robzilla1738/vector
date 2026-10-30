// Test-only child process for parity.test.mjs: loads a daemon entry staged by parity-stage.mjs with
// a stand-in native authority, runs the scenarios of parity-scenarios.mjs through the supplied
// routers or through the dispatcher, and writes the outputs and the resulting account state as
// JSON. Runs with HOME set to a temporary directory; child processes and network requests are
// refused, so nothing reaches the Keychain, the network or the user's state.
//
//   node parity-harness.mjs <staged entry> <supplied|aux> <out.json> [scenarios module]
import {mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {pathToFileURL} from 'node:url';

const [entry, mode, out, scenariosModule = './parity-scenarios.mjs'] = process.argv.slice(2);
const home = process.env.HOME;
const controlHome = path.join(home, 'control'), taskHome = path.join(home, 'task');

// Both the ESM imports and the bundle's require() calls resolve child_process to this refusal.
const refused = path.join(home, 'child-process-refused.cjs');
writeFileSync(refused, ['spawn', 'exec', 'execFile', 'fork', 'spawnSync', 'execSync', 'execFileSync']
  // The refusal names the command, so a port that runs a different one shows a different error.
  .map(name => `exports.${name}=(...args)=>{throw Error('parity harness: child_process.${name} refused: '+JSON.stringify(args.filter(arg=>typeof arg==='string'||Array.isArray(arg))))};`).join('\n'));
registerHooks({resolve: (specifier, context, next) => /^(node:)?child_process$/.test(specifier)
  ? {url: pathToFileURL(refused).href, format: 'commonjs', shortCircuit: true} : next(specifier, context)});
// The hosted Aux service as a signed-out client sees it: every account route answers 401 without
// a bearer token (services/aux-cloud/src/auth.ts, requireUser). Anything else is refused.
globalThis.fetch = async (url, options = {}) => {
  if (new URL(url).origin === 'https://api.getaux.co' && !new Headers(options.headers).has('authorization'))
    return Response.json({error: 'Sign in to continue.', code: 'ACCESS_TOKEN_INVALID'}, {status: 401});
  throw Error(`parity harness: network request to ${new URL(url).origin} refused`);
};

// The native host's authority, reduced to what these namespaces touch. Locks run their callback;
// anything that would reach native code beyond that throws.
const storageRoots = Object.freeze({format: 'aux.native.storage-roots.v1', layoutVersion: 1, ownerGeneration: '1', transportGeneration: '1', controlHome, taskHome});
const native = {};
for (const [name, value] of Object.entries({
  captureStorageRoots: () => storageRoots, supervisedTasksEnabled: false,
  assertBrokerOwner: () => {}, withBrokerSync: work => work(), withBrokerAwaited: work => work(), closeBrokerWriteAdmission: () => {},
  noteUntrackedBrokerWork: () => {}, withAccountRegistryLock: work => work(), validateMemoryRegistryTarget: () => {}, finishMemoryRegistryTarget: () => {},
  captureSelectedBuiltinSession: () => { throw Error('parity harness: no native session'); },
  run: () => { throw Error('parity harness: no native commands'); },
  ...Object.fromEntries(['beginChatGPTCredentialLock', 'withChatGPTCredentialLockSync', 'closeChatGPTCredentialLock']
    .map(name => [name, () => { throw Error('parity harness: no ChatGPT credentials'); }])),
})) Object.defineProperty(native, name, {value, enumerable: true});
const linkedBinding = process._linkedBinding.bind(process);
process._linkedBinding = name => name === 'aux_owned_native' ? native : linkedBinding(name);

// One clock for both runs: each call happens one second after the last.
let clock = Date.parse('2026-01-01T00:00:00.000Z');
const SystemDate = Date;
globalThis.Date = class extends SystemDate {
  constructor(...value) { super(...value.length ? value : [clock]); }
  static now() { return clock; }
};

const {SCENARIOS} = await import(new URL(scenariosModule, import.meta.url));
const daemon = await import(pathToFileURL(entry).href);
daemon.init_accounts();
const roots = [...new Set(Object.keys(SCENARIOS).map(namespace => namespace.split('.')[0]))];
for (const root of roots) daemon[`initRouter_${root}`]();
await daemon.tryMigrateStateDb(0);
const supplied = Object.fromEntries(roots.map(root => [root, daemon[`supplied_${root}`]]));
const bindings = daemon.auxOwnedDaemonBindings();
const routers = mode === 'aux' ? daemon.auxOwnedDaemon.compose(supplied, bindings) : supplied;
const harness = {daemon, home, advance: ms => { clock += ms; }};
// Agent file change notifications (settings and Project writes send them), in order.
const agentFileChanges = [];
daemon.agentFileListeners.add((accountId, kind) => agentFileChanges.push([accountId, kind]));

const outputs = {}, snapshots = {};
for (const [namespace, scenario] of Object.entries(SCENARIOS)) {
  const caller = namespace.split('.').reduce((node, name) => node[name], bindings.router(routers).createCaller(scenario.context?.(harness) ?? {}));
  outputs[namespace] = [];
  for (const call of scenario.calls) {
    if (typeof call === 'function') {
      const value = await call(harness);
      if (value !== undefined) outputs[namespace].push({step: value});
      continue;
    }
    const [procedure, input, context] = call;
    clock += 1000;
    try {
      const target = context ? namespace.split('.').reduce((node, name) => node[name], bindings.router(routers).createCaller(context(harness))) : caller;
      const value = await procedure.split('.').reduce((node, name) => node[name], target)(typeof input === 'function' ? input(outputs[namespace], harness) : input);
      // A streamed reply (lasso) is compared by what it sends.
      outputs[namespace].push({procedure, value: value instanceof Response ? {status: value.status, headers: [...value.headers], body: await value.text()} : value});
    } catch (error) {
      outputs[namespace].push({procedure, error: {code: error.code, message: error.message, appCode: daemon.getAppErrorCode(error.cause)}});
    }
  }
  if (scenario.snapshot) snapshots[namespace] = await scenario.snapshot(harness);
}

// The daemon's own root router, built through the integration edit: which procedures it serves
// from Aux's modules rather than the supplied routers.
let wired;
if (mode === 'aux') {
  daemon.init_router();
  const suppliedProcedures = new Set(Object.values(supplied).flatMap(router => Object.values(router._def.procedures)));
  const procedures = Object.entries(daemon.auxRouter._def.procedures);
  wired = {total: procedures.length, aux: procedures.filter(([path, procedure]) => roots.includes(path.split('.')[0]) && !suppliedProcedures.has(procedure)).map(([path]) => path).sort()};
  // Each Aux procedure against the supplied one it replaces: kind, route meta, and every input and
  // output schema as JSON Schema (zod's own conversion, which includes field meta).
  const schema = parser => {
    try {
      return JSON.stringify(daemon.toJSONSchema(parser, {unrepresentable: 'any'}));
    } catch (error) {
      return `unconvertible: ${error.message}`;
    }
  };
  const shape = procedure => JSON.stringify({type: procedure._def.type, meta: procedure._def.meta, inputs: procedure._def.inputs.map(schema),
    output: procedure._def.output ? schema(procedure._def.output) : null});
  wired.schemaMismatches = wired.aux.filter(path => {
    const [root, ...rest] = path.split('.');
    return shape(daemon.auxRouter._def.procedures[path]) !== shape(supplied[root]._def.procedures[rest.join('.')]);
  });
}

daemon.stateDb.close(0);
/** Every table of a SQLite file, row by row, with its schema. */
const dump = file => {
  const database = new DatabaseSync(file, {readOnly: true});
  const tables = database.prepare(`select name from sqlite_master where type = 'table' order by name`).all();
  const contents = {
    userVersion: database.prepare('pragma user_version').get().user_version,
    schema: database.prepare('select type, name, tbl_name, sql from sqlite_master order by type, name').all(),
    rows: Object.fromEntries(tables.map(({name}) => [name, database.prepare(`select * from "${name}" order by rowid`).all()])),
  };
  database.close();
  return contents;
};
const state = dump(path.join(controlHome, 'u', '0', 'state.db'));
// The Context Awareness ledger, which its own store writes.
daemon.ledgerDb(0).$client.exec('PRAGMA wal_checkpoint(FULL)');
const ledger = dump(path.join(controlHome, 'u', '0', 'context-awareness', 'ledger.db'));
// Logs are the daemon's own diagnostics, not effects of the namespaces.
const files = readdirSync(home, {recursive: true}).filter(file => !file.split(path.sep).includes('logs')).sort();
// The JSON and JSONL files the account keeps (settings.json, accounts.json, task transcripts and
// the like), byte for byte.
const jsonFiles = Object.fromEntries(files.filter(file => /\.jsonl?$/.test(file)).map(file => [file, readFileSync(path.join(home, file), 'utf8')]));

mkdirSync(path.dirname(out), {recursive: true});
writeFileSync(out, JSON.stringify({owned: mode === 'aux' ? daemon.auxOwnedDaemon.owned() : {}, storesInUse: daemon.auxOwnedDaemon.storesInUse(), wired, outputs, snapshots, agentFileChanges, state, ledger, files, jsonFiles}));
process.exit(0);
