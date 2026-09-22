import {createHash} from 'node:crypto';

type UnknownRecord=Record<string,unknown>;
const record=(value:unknown):UnknownRecord=>value&&typeof value==='object'&&!Array.isArray(value)?value as UnknownRecord:{};
const list=(value:unknown):unknown[]=>Array.isArray(value)?value:[];
const text=(value:unknown)=>typeof value==='string'?value:undefined;
const bool=(value:unknown)=>typeof value==='boolean'?value:undefined;
const number=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)?value:undefined;
const counts=(items:unknown[],key:string)=>items.reduce<Record<string,number>>((output,item)=>{const value=text(record(item)[key])??'unknown';output[value]=(output[value]??0)+1;return output;},{});

export interface DiagnosticInput{
  appVersion:string;packaged:boolean;platform:string;arch:string;
  versions:{electron?:string;chrome?:string;node?:string};
  runtimeConnected:boolean;runtime:unknown;settings:unknown;
  workspaces:unknown[];tasks:unknown[];runs:unknown[];pages:unknown[];extensions:unknown[];
  regularWindows:number;
  health?:unknown;
}

export function buildDiagnosticReport(input:DiagnosticInput){
  const runtime=record(input.runtime),settings=record(input.settings),probe=record(settings.modelProbe);
  const payload={
    schemaVersion:1,
    generatedAt:new Date().toISOString(),
    privacy:{
      included:['build and runtime versions','feature counts and status totals','nonsecret configuration modes','credential presence/source without values','known compatibility limits'],
      excluded:['credentials and secret references','URLs and page titles','history and bookmarks','prompts, responses and task text','account names and email addresses','local file and profile paths','page, artifact and document contents'],
    },
    build:{version:input.appVersion,packaged:input.packaged,platform:input.platform,architecture:input.arch,versions:input.versions},
    runtime:{connected:input.runtimeConnected,contractVersion:number(runtime.version),methodCount:list(runtime.methods).length,backends:list(runtime.backends).filter(value=>typeof value==='string')},
    browser:{regularWindows:input.regularWindows,pageCount:input.pages.length,pageBackends:counts(input.pages,'backend'),pageStates:counts(input.pages,'viewStatus'),extensionCount:input.extensions.length,loadedExtensions:input.extensions.filter(item=>bool(record(item).loaded)).length,extensionErrors:input.extensions.filter(item=>!!text(record(item).error)).length,health:record(input.health)},
    work:{workspaceCount:input.workspaces.length,taskCount:input.tasks.length,taskStates:counts(input.tasks,'state'),runCount:input.runs.length,runStates:counts(input.runs,'status')},
    configuration:{theme:text(settings.theme),sidebarAppearance:text(settings.sidebarAppearance),tabLayout:text(settings.tabLayout),modelProvider:text(settings.modelProvider),plannerModel:text(settings.plannerModel),modelConfigured:bool(settings.modelConfigured)??false,modelConnectionLastOk:bool(probe.ok),credentialSources:{model:text(settings.modelCredentialSource),github:text(settings.githubCredentialSource),vercel:text(settings.vercelCredentialSource),sentry:text(settings.sentryCredentialSource)}},
    compatibility:{browserShell:'Electron development shell',extensions:'Managed unpacked extensions on Electron’s supported API subset; Chrome Web Store and broad API parity are unqualified.',passkeys:'Virtual WebAuthn protocol is qualified; platform and synced passkeys require signed-bundle qualification.',passwordManagers:'1Password and Apple Passwords integration remain unqualified.',screenSharing:'Modern display capture uses the native macOS source picker when the OS supports it; legacy source-id capture and older fallback paths are denied.',packaging:input.packaged?'Packaged build identity active.':'Development build; signing, native identity and update behavior are unqualified.'},
  };
  return{...payload,integrity:{algorithm:'sha256',payloadSha256:createHash('sha256').update(JSON.stringify(payload)).digest('hex'),scope:'All fields except this integrity object.'}};
}
