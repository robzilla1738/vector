/** Aux doesn't download its agent runtime, memory models or CLI: the app carries all three, and the
 * Windows paths never apply. The supplied code for fetching them only ever reached a placeholder
 * address, so it's taken out, and each path now answers from what's bundled. */
const cut = (name, from, to, replace = '') => Object.freeze({name, from, to, replace});

export const CUTS = Object.freeze([
  // Memory models: an intact bundled seed or an error, already; what followed the throw never ran.
  cut('model download body', 'await mkdir(li,{recursive:!0,mode:448});let fi=await mkdtemp(path.join(li,`.download-`))', '}}}));function verifyMemoryCatalog'),
  // The agent runtime: installed from the app at first run, with no update feed.
  cut('runtime update check', 'function compareRuntimeVersions(', 'async function getLocalAgentRuntimeVersion(Cn){'),
  cut('runtime download and archive handling', 'async function fetchRelease(Cn,ei){', 'function setAgentRuntimeProgress('),
  cut('runtime replacement wait', 'async function waitForRuntimeUses(){', 'async function performInstall(Cn){'),
  cut('runtime install', 'const scope=auxRuntimeMutation();let ei=path.resolve(Cn.runtimeDir??AUX_RUNTIME_DIR),ti=resolveAgentRuntimeTarget(Cn.platform,Cn.arch);setAgentRuntimeProgress(`metadata`,0);let ni;try{ni=await fetchRelease(ti,Cn)}', 'function safeInstallError(Cn){',
    'setAgentRuntimeProgress(`metadata`,0);let ei=await getLocalAgentRuntimeVersion(Cn);if(!ei)throw Error(`Aux’s runtime is missing. Reinstall Aux.`);return agentRuntimeStatusSchema.parse({installed:!0,version:ei,latestVersion:null,updateAvailable:!1})}'),
  cut('runtime archive custody', 'function auxRuntimeRequireReleasePolicy(', 'async function auxRuntimeReadStatus('),
  cut('zip readers', 'const auxZipReaders=new Set,auxStoppedZipReaders=new WeakSet;', '// Scheduling/resource custody only;'),
  // The CLI: linked from the app, no release feed, no Windows.
  cut('CLI platform', 'function getCliPlatformConfig(Cn=process.platform,ei=process.arch,ti=process.env,ni=os.homedir()){', 'async function resolveAuxCommandPath(Cn,ei=fs.existsSync){',
    'function getCliPlatformConfig(Cn=process.platform,ei=process.arch,ni=os.homedir()){return Cn===`darwin`&&ei===`arm64`?{target:`darwin-arm64`,fallbackPaths:[path.posix.join(ni,`.local/bin/aux`),path.posix.join(ni,`.aux/bin/aux`)]}:null}'),
  cut('CLI Windows detection and version compare', 'async function getWindowsCliInstallation(Cn){', 'async function getInstalledCliVersion('),
  cut('CLI release lookup', 'async function fetchLatestCliRelease(', 'async function getCliInstallationStatus('),
  cut('CLI status', 'let ti=Cn.target===`win-x64`?await getWindowsCliInstallation(Cn):{commandPath:await resolveAuxCommandPath(Cn),currentVersion:null},ni=ti?.commandPath;', 'async function installCli(',
    'let ni=await resolveAuxCommandPath(Cn);return ni?{...ei,installed:!0,commandPath:ni,currentVersion:await getInstalledCliVersion(ni),latestVersion:null,updateAvailable:!1}:{...ei,installed:!1,commandPath:null,currentVersion:null,latestVersion:null,updateAvailable:!1}}'),
  cut('CLI Windows install', 'if(Cn.target===`win-x64`){await installWindowsCli(Cn);return}', '/* Aux ships its CLI inside the app;'),
]);

// [what, exact text, replacement]: the declarations and options the cuts leave unused.
export const REMOVALS = Object.freeze([
  ['model URL declaration', 'var MODEL_DOWNLOAD_BASE_URL,MAX_MODEL_BYTES', 'var MAX_MODEL_BYTES'],
  ['model URL', 'MODEL_DOWNLOAD_BASE_URL=`http://127.0.0.1:9/aux-unavailable/releases/dev-updater/models`,', ''],
  ['memory runtime test host', ',baseUrl:process.env.AUX_MEMORY_TEST_RUNTIME_BASE_URL', ''],
  ['memory model test host', ',baseUrl:process.env.AUX_MEMORY_TEST_MODEL_BASE_URL', ''],
  ['runtime status', 'return ei?withInstalledUpdateStatus(ei,Cn):', 'return ei?agentRuntimeStatusSchema.parse({installed:!0,version:ei,latestVersion:null,updateAvailable:!1}):'],
  ['runtime release URL', 'RELEASE_BASE_URL$1=`http://127.0.0.1:9/aux-unavailable/releases`,', ''],
  ['runtime archive declarations', 'var import_yauzl,RELEASE_BASE_URL$1,FETCH_TIMEOUT_MS,ARCHIVE_STALL_TIMEOUT_MS,ARCHIVE_DOWNLOAD_RETRIES,SYMLINK_TARGET_MAX_BYTES,', 'var '],
  ['runtime archive reader', 'import_yauzl=/* @__PURE__ */ __toESM(require_yauzl(),1),', ''],
  ['runtime archive limits', 'FETCH_TIMEOUT_MS=3e4,ARCHIVE_STALL_TIMEOUT_MS=3e4,ARCHIVE_DOWNLOAD_RETRIES=2,SYMLINK_TARGET_MAX_BYTES=4096,', ''],
  ['runtime archive modes', 'S_IFMT=61440,S_IFIFO=4096,S_IFCHR=8192,S_IFDIR=16384,S_IFBLK=24576,S_IFREG=32768,S_IFLNK=40960,S_IFSOCK=49152,WRITABLE_DIRECTORIES=[`home`,`tmp`],MACOS_AT_SIGNER=[],MACOS_NODE_SIGNER=[`Authority=Developer ID Application: Node.js Foundation (HX7739G8FX)`,`TeamIdentifier=HX7739G8FX`],', ''],
  ['runtime archive mode declarations', 'S_IFMT,S_IFIFO,S_IFCHR,S_IFDIR,S_IFBLK,S_IFREG,S_IFLNK,S_IFSOCK,WRITABLE_DIRECTORIES,MACOS_AT_SIGNER,MACOS_NODE_SIGNER,', ''],
  ['runtime download helpers', 'execFileAsync$3=promisify(execFile),NonRetryableDownloadError=class extends Error{},', ''],
  ['runtime download helper declarations', 'execFileAsync$3,NonRetryableDownloadError,', ''],
  ['CLI release schemas', 'AUX_CLI_RELEASE_FETCH_TIMEOUT_MS=3e3,cliReleaseSchema=object({version:string$3().min(1),platform:string$3().optional()}),windowsCliReleaseSchema=cliReleaseSchema.extend({schemaVersion:literal(1),platform:literal(`win-x64`),arch:literal(`x64`),installUrl:string$3().url(),installerSha256:string$3().regex(/^[0-9a-f]{64}$/iu)})', ''],
]);

export function withoutDownloads(text) {
  let result = text;
  for (const {name, from, to, replace} of CUTS) {
    const start = result.indexOf(from), end = result.indexOf(to, start);
    if (start < 0 || end < 0 || result.split(from).length !== 2) throw Error(`Download removal drift: ${name}`);
    result = result.slice(0, start) + replace + result.slice(end);
  }
  for (const [what, find, replace] of REMOVALS) {
    if (result.split(find).length !== 2) throw Error(`Download removal drift: ${what}`);
    result = result.replace(find, () => replace);
  }
  return result.replace(/,WINDOWS_CLI_PUBLISHER=`[^`]*`,WINDOWS_ROOT_CA_HINT=`[^`]*`,WINDOWS_INSTALL_COMMAND=`[^`]*`/, '').replace('RELEASE_BASE_URL=`http://127.0.0.1:9/aux-unavailable/releases`,', '')
    .replace('RELEASE_BASE_URL,WINDOWS_CLI_PUBLISHER,WINDOWS_ROOT_CA_HINT,WINDOWS_INSTALL_COMMAND,', '').replace('AUX_CLI_VERSION_TIMEOUT_MS=3e3,})', 'AUX_CLI_VERSION_TIMEOUT_MS=3e3})')
    .replace(/AUX_CLI_RELEASE_FETCH_TIMEOUT_MS,cliReleaseSchema,windowsCliReleaseSchema,?/, '');
}
