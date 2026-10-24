// Static, count-checked projection of the exact packaged macOS CLI only.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {AUX_COLD_ENTRY_REFUSAL} from '../../../../../../vendor/provided/aux-cold-entry-admission.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex');
const helper=readFileSync(new URL('./cli-boundary.js',import.meta.url),'utf8');
export const CLI_PREDECESSOR_SOURCE_SHA256='6016a13426719597b2d64838425bfeb813e3092a911621836a18585dc1908cd5';
export function projectOwnedCliEntry(source){
 if(hash(source)!==CLI_PREDECESSOR_SOURCE_SHA256)throw Error('Exact latest packaged CLI source required');
 let text=source;const anchors=[];
 const edit=(name,find,replace)=>{if(!find||text.split(find).length!==2)throw Error('CLI anchor drift: '+name);text=text.replace(find,replace);anchors.push({name,find,replace,count:1})};
 const prefix='#!/usr/bin/env node\n'+AUX_COLD_ENTRY_REFUSAL;
 if(!source.startsWith(prefix))throw Error('Existing ordinary CLI refusal required');
 edit('Actual CLI native embedding before mutable initialization',prefix,
  '#!/usr/bin/env node\n/* aux-owned-cli-entry-v1 */\nif(process.platform!=="darwin"||process.arch!=="arm64")throw Error("AUX_CLI_NATIVE_PLATFORM_UNAVAILABLE");\nconst __auxCliBoundary=auxCreateCliBoundary(process._linkedBinding("aux_owned_native"),process.env,path);\n');
 const extract=name=>{const marker=(source.includes('async function '+name+'(')?'async ':'')+'function '+name+'(';const start=source.indexOf(marker),end=source.indexOf('\n}\n',start);if(start<0||end<0)throw Error('Missing actual CLI function: '+name);return source.slice(start,end+2)};
 const wrap=(name,quiet=false)=>{const before=extract(name),at=before.indexOf('{'),head=before.slice(0,at+1);let body=before.slice(at+1,-1);
  // Custody retains the complete body; every later mutation also rechecks
  // current ownership after preceding awaits or user interaction.
  body=body.replace(/(\n[\t ]*)(await fsp\.(?:mkdir|writeFile|chmod|rm)\(|writeFileSync\(|const temporaryDirectory = await fsp\.mkdtemp\()/g,(_,indent,call)=>indent+'__auxCliBoundary.assertCurrent();'+indent+call);
  body=body.replace('if (current !== AUX_BROWSER_SKILL) await fsp.writeFile(skillFile, AUX_BROWSER_SKILL, "utf-8");','if (current !== AUX_BROWSER_SKILL) { __auxCliBoundary.assertCurrent(); await fsp.writeFile(skillFile, AUX_BROWSER_SKILL, "utf-8"); }');
  edit('Retain actual '+name+' writer',before,
  head+(quiet?'\n\ttry { return await ':'\n\treturn ')+'__auxCliBoundary.awaited(async () => {'+body+'\n\t});'+(quiet?' } catch {}':'')+'\n}')};
 const materialize=extract('materializeEmbeddedBinding');
 edit('No executable asset extraction in native embedded CLI',materialize,'function materializeEmbeddedBinding() {\n\tthrow new Error("AUX_CLI_EMBEDDED_MODULE_EXTRACTION_REFUSED");\n}');
 edit('Aux embedded module identity','const EMBEDDED_BINDING_ASSET = "aside-native.node";','const EMBEDDED_BINDING_ASSET = "aux-native.node";');
 edit('Fixed CLI linked-owner loader path',extract('candidateBindingPaths'),'function candidateBindingPaths() {\n\treturn [fileURLToPath(new URL("../native/aux-owned-cli.cjs", import.meta.url))];\n}');
 edit('Actual linked owner loader without original addon fallback',extract('loadBinding'),
  'function loadBinding() {\n\tif (binding !== undefined) return binding;\n\t__auxCliBoundary.assertCurrent();\n\tloadedBindingPath = candidateBindingPaths()[0];\n\ttry { return binding = require$1(loadedBindingPath); }\n\tcatch (error) { bindingLoadError = error instanceof Error ? error.message : String(error); throw error; }\n}');
 edit('Captured CLI data root','const CLI_DATA_DIR = process.env.AUX_CLI_INSTALL_DIR || path.join(os.homedir(), ".aux", "cli");','const CLI_DATA_DIR = __auxCliBoundary.data;');
 edit('Captured CLI credential root','const CLI_AUTH_PATH = process.env.AUX_CLI_AUTH_PATH ?? path.join(CLI_DATA_DIR, "auth.json");','const CLI_AUTH_PATH = __auxCliBoundary.auth;');
 for(const name of ['writeAuxBrowserSkill','writeCliConfig','writeCliAuth','clearCliAuth','runUpdate'])wrap(name);
 wrap('writeUpdateCheckCache',true);
 for(const name of ['readCliConfig','readCliAuth','readUpdateCheckCache']){
  const before=extract(name);edit('Revalidate captured '+name+' private read',before,before.replace('try {','try {\n\t\t__auxCliBoundary.assertCurrent();'));
 }
 edit('Account for actual queued log append',
  'const next = (logDumpQueues.get(path) ?? Promise.resolve()).catch(() => undefined).then(() => fsp.appendFile(path, `${JSON.stringify(event)}\\n`));',
  'const next = (logDumpQueues.get(path) ?? Promise.resolve()).catch(() => undefined).then(() => __auxCliBoundary.awaited(() => fsp.appendFile(path, `${JSON.stringify(event)}\\n`)));');
 const diagnostic='if(process.env.AUX_PROVIDED_NATIVE_LOAD_ONLY===`1`||process.env.AUX_PROVIDED_DP_PROBE===`1`){await import(`node:module`).then(({createRequire:Cn})=>{let ei=Cn(process.execPath),ti=ei(`node:path`);return ei(ti.resolve(ti.dirname(process.execPath),`../Resources/native/native-load-diagnostic.cjs`))()});}else ';
 edit('No original addon diagnostic in owned CLI',diagnostic,'');
 const tail=text.slice(-160);edit('Include native owner consumer',tail,tail+'\n'+helper+'\n');
 return{text,anchors,outputSha256:hash(text)};
}
