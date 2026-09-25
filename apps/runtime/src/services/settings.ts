import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { EffectSchema, ModelProviderSchema, OriginRuleSchema, SidebarMaterialSchema, type Effect, type ModelProvider, type OriginRule, type ShortcutOverrides } from "@aux/contracts";
import { z } from "zod";
import { DEFAULT_SEARCH_ENGINE } from "@aux/contracts/search-engine";
import { MODEL_REGISTRY, mergeModelCapabilities, agentModelRoute, AgentModelRouteSchema, type AgentModelCategory, type AgentModelRoute, type ModelCapability } from "@aux/contracts/model-registry";
import { DEFAULT_GRANTS, USER_RUN_GRANTS, sanitizeGrants, type GrantInput } from "../agent/permissions.js";
import { DEFAULT_MAX_MODEL_CALLS, DEFAULT_PLANNER_MODEL, modelCallBudget, type ModelClient } from "../agent/model-client.js";
import { DIRECT_PROVIDERS, PROVIDER_ENV, directModelClient, isLoopbackCompatibleEndpoint, normalizeCompatibleEndpoint, providerEndpoint } from "../agent/direct-providers.js";
import { GatewayModelClient } from "../agent/gateway-client.js";
import type { Repo } from "../store/repo.js";
import type { NativeBridge } from "../native.js";

export interface Settings {
  modelProvider?: ModelProvider;
  modelCredential?: { provider: ModelProvider; key: string };
  compatibleEndpoint?: string;
  providerModels?: Partial<Record<ModelProvider, { plannerModel?: string; recoveryModel?: string; visionModel?: string }>>;
  gatewayApiKey?: string;
  githubCredential?: string;
  vercelCredential?: string;
  vercelTeamId?: string;
  vercelProjectId?: string;
  sentryCredential?: string;
  sentryOrganization?: string;
  sentryProject?: string;
  plannerModel?: string;
  recoveryModel?: string;
  visionModel?: string;
  agentModelRoutes?: Partial<Record<AgentModelCategory, AgentModelRoute>>;
  searchEngine?: string;
  searchEngines?: { keyword: string; name: string; template: string }[];
  searchSuggestions?: boolean;
  /** Personal info offered to page forms on explicit request only. */
  autofill?: { name?: string; email?: string; phone?: string; organization?: string; street?: string; city?: string; region?: string; postal?: string; country?: string };
  maxWorkers?: number;
  perOrigin?: number;
  maxModelCalls?: number;
  theme?: "system" | "dark" | "light";
  sidebarAppearance?: "solid" | "translucent";
  sidebarMaterial?: "liquid-glass" | "titlebar" | "sidebar" | "under-window";
  sidebarTint?: number;
  contentOpacity?: number;
  sidebarBlur?: number;
  sidebarOpacity?: number;
  tabLayout?: "vertical" | "horizontal";
  /** commandId → replacement bindings; null disables the command's shortcuts. */
  shortcutOverrides?: ShortcutOverrides;
  zoomFactor?: number;
  dataDir?: string;
  /**
   * Privilege-independent agent effect grants (Gate D / Gate F).
   * The person sets these. Model text cannot expand them.
   */
  effectGrants?: GrantInput[];
  originPolicies?: OriginRule[];
  safetyCeilings?: Partial<Record<Effect, "never" | "ask" | "always">>;
  /** Nonsecret result of the latest explicit connection test. */
  modelProbe?: ModelProbeRecord;
  githubProbe?: GithubProbeRecord;
  vercelProbe?: VercelProbeRecord;
  sentryProbe?: SentryProbeRecord;
}

export interface GithubProbeRecord { login:string;accountId:number;name:string|null;avatarUrl:string;scopes:string[];checkedAt:number }
export interface GithubProjectIdentity {owner:string;repository:string;remoteUrl:string;branch:string;baseCommit:string;headCommit:string}
export interface GithubRepositoryStatus extends GithubProjectIdentity {defaultBranch:string;private:boolean;account:string;permissions:{admin:boolean;maintain?:boolean;push:boolean;triage?:boolean;pull:boolean};basePresent:boolean;headPresent:boolean;checks:{state:string;total:number;updatedAt:number}|null;checkRuns:{id:number;name:string;status:string;conclusion:string|null;detailsUrl:string|null}[];pullRequests:{number:number;title:string;url:string;draft:boolean;base:string;head:string;updatedAt:string}[];issues:{number:number;title:string;url:string;body:string|null;author:string;labels:string[];updatedAt:string}[];checkedAt:number}
export interface VercelProbeRecord {user:{id:string;name:string;email:string};teams:{id:string;name:string;slug:string}[];checkedAt:number}
export interface VercelProjectRecord {id:string;name:string;framework:string|null;updatedAt:number;teamId:string|null}
export interface VercelDeploymentRecord {id:string;name:string;url:string;state:string;target:string|null;createdAt:number;readyAt:number|null}
export interface SentryProbeRecord {organizations:{id:string;name:string;slug:string;regionUrl:string}[];checkedAt:number}
export interface SentryProjectRecord {id:string;name:string;slug:string;platform:string|null;organization:string}
export interface SentryIssueRecord {id:string;shortId:string;title:string;level:string;status:string;count:number;users:number;firstSeen:string;lastSeen:string;permalink:string}
export interface OperationsStatus {checkedAt:number;vercel?:{project:VercelProjectRecord;deployments:VercelDeploymentRecord[]};sentry?:{organization:string;project:SentryProjectRecord;issues:SentryIssueRecord[]};unavailable:string[]}

export interface ModelProbeRecord {
  provider: ModelProvider;
  modelId: string;
  ok: boolean;
  checkedAt: number;
  latencyMs?: number;
  vision?: boolean;
}

export class SettingsService {
  /** Test hook — inject a mock model instead of the real Gateway client. */
  modelOverride: ModelClient | null = null;
  private gatewayClient: ModelClient | null = null;
  private fileSettings: Settings = {};
  private native: NativeBridge | null = null;
  private savedKey: string | undefined;
  private directKeys: Partial<Record<ModelProvider, string>> = {};
  private directErrors: Partial<Record<ModelProvider, string>> = {};
  private credentialError: string | undefined;
  private githubKey: string | undefined;
  private githubCredentialVersion = 0;
  private githubError: string | undefined;
  private vercelKey: string | undefined;
  private vercelError: string | undefined;
  private sentryKey: string | undefined;
  private sentryError: string | undefined;
  private writes: Promise<unknown> = Promise.resolve();

  constructor(
    private repo: Repo,
    private settingsPath: string,
    private env: NodeJS.ProcessEnv = process.env,
  ) {
    if (existsSync(settingsPath)) {
      try {
        this.fileSettings = JSON.parse(readFileSync(settingsPath, "utf8")) as Settings;
      } catch {
        this.fileSettings = {};
      }
    }
  }

  attachNative(native: NativeBridge): void {
    this.native = native;
  }

  async initializeCredentials(): Promise<void> {
    if (!this.native?.available()) return;
    try {
      this.savedKey = (await this.native.readSecret("gatewayApiKey")).value;
      this.credentialError = undefined;
    } catch {
      this.credentialError = "Saved credential is unavailable. Unlock the OS credential store or re-enter the key in Settings.";
    }
    for (const provider of DIRECT_PROVIDERS) {
      try {
        this.directKeys[provider] = (await this.native.readSecret(`modelKey-${provider}`)).value;
        delete this.directErrors[provider];
      } catch { this.directErrors[provider] = "Saved credential is unavailable. Re-enter this provider's key in Settings."; }
    }
    try { this.githubKey=(await this.native.readSecret('githubToken')).value;this.githubCredentialVersion++;this.githubError=undefined; }
    catch { this.githubKey=undefined;this.githubCredentialVersion++;this.githubError='Saved GitHub credential is unavailable. Re-enter it in Settings.'; }
    try { this.vercelKey=(await this.native.readSecret('vercelToken')).value;this.vercelError=undefined; }
    catch { this.vercelError='Saved Vercel credential is unavailable. Re-enter it in Settings.'; }
    try { this.sentryKey=(await this.native.readSecret('sentryToken')).value;this.sentryError=undefined; }
    catch { this.sentryError='Saved Sentry credential is unavailable. Re-enter it in Settings.'; }
  }

  get(key: keyof Settings): unknown {
    if (key === "gatewayApiKey" || key === "modelCredential" || key === 'githubCredential' || key === 'vercelCredential' || key === 'sentryCredential') return undefined;
    return this.repo.getSetting(key) ?? this.fileSettings[key];
  }

  all(): Settings & { dataDir: string; gatewayCredentialError?: string; gatewayCredentialSource: string; modelConfigured: boolean; modelApiKey?: string; modelCredentialSource: string; modelCredentialError?: string; modelEndpoint: string; modelProbe?: ModelProbeRecord; githubCredential?:string;githubCredentialSource:string;githubCredentialError?:string;githubProbe?:GithubProbeRecord;vercelCredential?:string;vercelCredentialSource:string;vercelCredentialError?:string;vercelProbe?:VercelProbeRecord;sentryCredential?:string;sentryCredentialSource:string;sentryCredentialError?:string;sentryProbe?:SentryProbeRecord } {
    const modelProbe = this.get("modelProbe") as ModelProbeRecord | undefined;
    const localCompatible = this.modelProvider() === "openai-compatible" && isLoopbackCompatibleEndpoint(this.compatibleEndpoint());
    return {
      gatewayApiKey: (this.savedKey || this.env.AI_GATEWAY_API_KEY) ? "••••••••" : undefined,
      gatewayCredentialSource: this.savedKey ? "saved" : this.env.AI_GATEWAY_API_KEY ? "environment" : "none",
      gatewayCredentialError: this.credentialError ?? (this.hasLegacyCredential() ? "A legacy credential is present. Re-enter it in Settings to replace plaintext storage with encrypted storage." : undefined),
      modelProvider: this.modelProvider(),
      compatibleEndpoint: this.compatibleEndpoint(),
      modelApiKey: this.selectedKey() ? "••••••••" : undefined,
      modelCredentialSource: this.modelProvider() === "gateway" ? (this.savedKey ? "saved" : this.env.AI_GATEWAY_API_KEY ? "environment" : "none")
        : this.directKeys[this.modelProvider()] ? "saved" : this.selectedKey() ? "environment" : "none",
      modelCredentialError: this.modelProvider() === "gateway" ? this.credentialError : this.directErrors[this.modelProvider()],
      modelEndpoint: providerEndpoint(this.modelProvider(), this.compatibleEndpoint()),
      modelProbe: modelProbe?.provider === this.modelProvider() && modelProbe.modelId === this.plannerModel() ? modelProbe : undefined,
      githubCredential:this.githubKey?'••••••••':undefined,
      githubCredentialSource:this.githubKey?'saved':'none',
      githubCredentialError:this.githubError,
      githubProbe:this.get('githubProbe') as GithubProbeRecord|undefined,
      vercelCredential:this.vercelKey?'••••••••':undefined,vercelCredentialSource:this.vercelKey?'saved':'none',vercelCredentialError:this.vercelError,vercelProbe:this.get('vercelProbe') as VercelProbeRecord|undefined,
      sentryCredential:this.sentryKey?'••••••••':undefined,sentryCredentialSource:this.sentryKey?'saved':'none',sentryCredentialError:this.sentryError,sentryProbe:this.get('sentryProbe') as SentryProbeRecord|undefined,
      modelConfigured: !!(this.modelOverride || (this.plannerModel() && (this.selectedKey() || localCompatible) && (this.modelProvider() !== "openai-compatible" || this.compatibleEndpoint()))),
      plannerModel: this.plannerModel(),
      recoveryModel: this.recoveryModel(),
      visionModel: this.visionModel(),
      agentModelRoutes: {
        fast: this.agentRoute("fast"), standard: this.agentRoute("standard"),
        deep: this.agentRoute("deep"), visual: this.agentRoute("visual"),
      },
      searchEngine: this.searchEngine(),
      searchEngines: (this.get("searchEngines") as Settings["searchEngines"]) ?? [],
      searchSuggestions: (this.get("searchSuggestions") as boolean | undefined) ?? false,
      maxWorkers: this.maxWorkers(),
      perOrigin: this.perOrigin(),
      maxModelCalls: this.maxModelCalls(),
      theme: (this.get("theme") as "system" | "dark" | "light") ?? "dark",
      sidebarAppearance: (this.get("sidebarAppearance") as "solid" | "translucent") ?? "translucent",
      sidebarMaterial: SidebarMaterialSchema.catch("liquid-glass").parse(this.get("sidebarMaterial")),
      sidebarTint: Number(this.get("sidebarTint") ?? 0),
      contentOpacity: Number(this.get("contentOpacity") ?? 95),
      sidebarBlur: Number(this.get("sidebarBlur") ?? 0),
      sidebarOpacity: Number(this.get("sidebarOpacity") ?? 90),
      tabLayout: (this.get("tabLayout") as "vertical" | "horizontal") ?? "horizontal",
      shortcutOverrides: (this.get("shortcutOverrides") as Settings["shortcutOverrides"]) ?? {},
      autofill: (this.get("autofill") as Settings["autofill"]) ?? {},
      zoomFactor: (this.get("zoomFactor") as number) ?? 1,
      effectGrants: [...this.effectGrantsForRun()],
      originPolicies: this.originPolicies(),
      safetyCeilings: this.get("safetyCeilings") as Settings["safetyCeilings"] ?? {},
      dataDir: this.settingsPath.replace(/\/settings\.json$/, ""),
    };
  }

  /** Live grant list. settings.set is the only expander. */
  effectGrants(): readonly GrantInput[] {
    return sanitizeGrants(this.get("effectGrants") ?? this.fileSettings.effectGrants ?? DEFAULT_GRANTS);
  }

  /**
   * Grants for a user-started run. Starting the run is the write grant.
   * An explicit settings.effectGrants list still wins (permission sheet).
   */
  effectGrantsForRun(): readonly GrantInput[] {
    const explicit = this.get("effectGrants") ?? this.fileSettings.effectGrants;
    if (explicit !== undefined) return sanitizeGrants(explicit);
    return sanitizeGrants([...USER_RUN_GRANTS]);
  }

  originPolicies(): OriginRule[] {
    return OriginRuleSchema.array().parse(this.get("originPolicies") ?? []);
  }

  safetyCeiling(effect: Effect): "never" | "ask" | "always" {
    return (this.get("safetyCeilings") as Settings["safetyCeilings"] | undefined)?.[effect] ?? "ask";
  }

  set(patch: Settings): Promise<{ ok: true }> {
    const write = this.writes.then(() => this.save(patch));
    this.writes = write.catch(() => {});
    return write;
  }

  private async save(patch: Settings): Promise<{ ok: true }> {
    const next: Settings = { ...patch };
    if (next.modelCredential && next.gatewayApiKey !== undefined) throw new Error("Save one provider credential at a time.");
    const connectionChange = ["modelProvider", "modelCredential", "gatewayApiKey", "compatibleEndpoint", "plannerModel", "recoveryModel", "visionModel"].some(key => key in next);
    if (connectionChange && this.repo.db.prepare("SELECT 1 FROM runs WHERE status IN ('queued','planning','running','paused','needs_input') LIMIT 1").get()) {
      throw new Error("Stop active runs before changing model connections.");
    }
    const cloudRecords = this.repo.getSetting<unknown>("cloudEnvironments");
    const retainedCloud = Array.isArray(cloudRecords) && cloudRecords.some(item =>
      item && typeof item === "object" && (item as Record<string, unknown>).status !== "deleted"
    );
    const disconnectingVercel = next.vercelCredential !== undefined && !next.vercelCredential.trim();
    const changingVercelScope =
      (next.vercelTeamId !== undefined && next.vercelTeamId !== (this.get("vercelTeamId") as string | undefined)) ||
      (next.vercelProjectId !== undefined && next.vercelProjectId !== (this.get("vercelProjectId") as string | undefined));
    if (retainedCloud && (disconnectingVercel || changingVercelScope)) {
      throw new Error("Delete or reconcile every retained Aux cloud environment before disconnecting Vercel or changing its selected team/project. You may replace the token to restore access.");
    }
    const selectedProvider = ModelProviderSchema.parse(next.modelProvider ?? this.modelProvider());
    if (next.compatibleEndpoint !== undefined) next.compatibleEndpoint = normalizeCompatibleEndpoint(next.compatibleEndpoint);
    if (next.modelCredential) {
      const { provider, key } = next.modelCredential;
      if (provider === "gateway") await this.writeGatewayKey(key);
      else {
        if (!this.native?.available()) throw new Error("Secure credential storage requires the desktop; supply the provider key through the process environment for standalone use.");
        if (key === "••••••••") throw new Error("Enter the actual key; a masked placeholder cannot be saved.");
        await this.native.storeSecret(`modelKey-${provider}`, key);
        this.directKeys[provider] = key || undefined;
        delete this.directErrors[provider];
      }
      delete next.modelCredential;
    }
    if(next.githubCredential!==undefined){
      if(!this.native?.available())throw new Error('Secure GitHub credential storage requires the Aux desktop app.');
      if(next.githubCredential==='••••••••')throw new Error('Enter the actual token; the masked placeholder cannot be saved.');
      const token=next.githubCredential.trim();await this.native.storeSecret('githubToken',token);this.githubKey=token||undefined;this.githubCredentialVersion++;this.githubError=undefined;
      this.repo.deleteSetting('githubProbe');delete next.githubCredential;
    }
    if(next.vercelCredential!==undefined){await this.saveServiceCredential('Vercel','vercelToken',next.vercelCredential,value=>{this.vercelKey=value;this.vercelError=undefined;});this.repo.deleteSetting('vercelProbe');delete next.vercelCredential;}
    if(next.sentryCredential!==undefined){await this.saveServiceCredential('Sentry','sentryToken',next.sentryCredential,value=>{this.sentryKey=value;this.sentryError=undefined;});this.repo.deleteSetting('sentryProbe');delete next.sentryCredential;}
    if (selectedProvider !== "gateway") {
      const profile = { ...this.profiles()[selectedProvider] };
      for (const key of ["plannerModel", "recoveryModel", "visionModel"] as const) {
        if (next[key] !== undefined) { profile[key] = next[key]; delete next[key]; }
      }
      next.providerModels = { ...this.profiles(), [selectedProvider]: profile };
    }
    if (next.effectGrants !== undefined) next.effectGrants = sanitizeGrants(next.effectGrants);
    if (next.originPolicies !== undefined) next.originPolicies = OriginRuleSchema.array().max(500).parse(next.originPolicies);
    if (next.safetyCeilings !== undefined) next.safetyCeilings = z.partialRecord(EffectSchema, z.enum(["never", "ask", "always"])).parse(next.safetyCeilings);
    if (next.gatewayApiKey !== undefined) await this.writeGatewayKey(next.gatewayApiKey);
    if (connectionChange) this.repo.deleteSetting("modelProbe");
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined) continue;
      if (k === "gatewayApiKey") continue;
      this.repo.setSetting(k, v);
    }
    // persist non-secret prefs to settings.json for transparency
    const { gatewayApiKey, ...rest } = next;
    if (Object.keys(rest).length) {
      this.fileSettings = { ...this.fileSettings, ...rest };
      try {
        // Keep an existing legacy file untouched until explicit credential
        // replacement/removal; never copy its secret into a new preferences file.
        if (this.fileSettings.gatewayApiKey === undefined) writeFileSync(this.settingsPath, JSON.stringify(this.fileSettings, null, 2));
      } catch {
        /* settings.json is a convenience, not the source of truth */
      }
    }
    if (connectionChange) this.gatewayClient = null; // rebuild on next use
    return { ok: true };
  }

  async probeGithub():Promise<GithubProbeRecord>{
    if(!this.githubKey){if(this.githubError)throw new Error(this.githubError);throw new Error('Save a GitHub token before testing the connection.');}
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15_000);
    try{
      const response=await fetch('https://api.github.com/user',{headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${this.githubKey}`,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'Aux-Browser'},signal:controller.signal,redirect:'error'});
      if(!response.ok)throw new Error(response.status===401?'GitHub rejected the token. Replace it and try again.':response.status===403?'GitHub denied the request. Check token access and account policy.':`GitHub connection failed with HTTP ${response.status}.`);
      const value=await response.json() as {login?:unknown;id?:unknown;name?:unknown;avatar_url?:unknown};
      if(typeof value.login!=='string'||typeof value.id!=='number'||typeof value.avatar_url!=='string')throw new Error('GitHub returned an unexpected account response.');
      const record:GithubProbeRecord={login:value.login,accountId:value.id,name:typeof value.name==='string'?value.name:null,avatarUrl:value.avatar_url,scopes:(response.headers.get('x-oauth-scopes')??'').split(',').map(item=>item.trim()).filter(Boolean),checkedAt:Date.now()};
      this.repo.setSetting('githubProbe',record);return record;
    }catch(error){if((error as {name?:string}).name==='AbortError')throw new Error('GitHub did not respond within 15 seconds.');throw error;}
    finally{clearTimeout(timeout);}
  }

  /** Non-secret identity for the reviewed connector catalog. A saved token is required for use. */
  githubConnector(): { connected: boolean; account?: string; credentialVersion: number } {
    const probe = this.get('githubProbe') as GithubProbeRecord | undefined;
    return { connected: !!this.githubKey, credentialVersion: this.githubCredentialVersion,
      ...(this.githubKey && probe?.login ? { account: probe.login } : {}) };
  }

  async githubRepository(identity:GithubProjectIdentity):Promise<GithubRepositoryStatus>{
    if(!this.githubKey){if(this.githubError)throw new Error(this.githubError);throw new Error('Connect GitHub in Settings before checking this repository.');}
    const token = this.githubKey;
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15_000);
    const headers={Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'Aux-Browser'};
    const request=async(path:string,allowMissing=false)=>{
      const response=await fetch(`https://api.github.com${path}`,{headers,signal:controller.signal,redirect:'error'});
      if(allowMissing&&response.status===404)return null;
      if(!response.ok)throw new Error(response.status===401?'GitHub rejected the saved token. Reconnect it in Settings.':response.status===403?'The saved GitHub token cannot inspect this repository. Check its repository access and organization policy.':response.status===404?'The repository is unavailable to the connected GitHub account.':`GitHub repository check failed with HTTP ${response.status}.`);
      const declared=Number(response.headers.get('content-length')??0);if(declared>2_000_000)throw new Error('GitHub returned more repository data than Aux will accept.');
      const body=await response.text();if(Buffer.byteLength(body,'utf8')>2_000_000)throw new Error('GitHub returned more repository data than Aux will accept.');
      try{return JSON.parse(body) as Record<string,unknown>;}catch{throw new Error('GitHub returned an invalid repository response.');}
    };
    try{
      const slug=`/${encodeURIComponent(identity.owner)}/${encodeURIComponent(identity.repository)}`;
      const repo=await request(`/repos${slug}`);if(!repo)throw new Error('GitHub repository was not found.');
      const pullsQuery=new URLSearchParams({state:'open',head:`${identity.owner}:${identity.branch}`,per_page:'20'});
      const issueQuery=new URLSearchParams({state:'open',sort:'updated',direction:'desc',per_page:'20'});
      const [base,head,combined,checkRunsValue,pullsValue,issuesValue]=await Promise.all([request(`/repos${slug}/commits/${identity.baseCommit}`,true),request(`/repos${slug}/commits/${identity.headCommit}`,true),request(`/repos${slug}/commits/${identity.headCommit}/status`,true),request(`/repos${slug}/commits/${identity.headCommit}/check-runs?per_page=100`,true),request(`/repos${slug}/pulls?${pullsQuery}`,true),request(`/repos${slug}/issues?${issueQuery}`,true)]);
      const permissions=repo.permissions&&typeof repo.permissions==='object'?repo.permissions as Record<string,unknown>:{};
      const probe=this.get('githubProbe') as GithubProbeRecord|undefined;
      const checkRuns=Array.isArray(checkRunsValue?.check_runs)?checkRunsValue.check_runs.flatMap(value=>{if(!value||typeof value!=='object')return[];const item=value as Record<string,unknown>;return typeof item.id==='number'&&typeof item.name==='string'?[{id:item.id,name:item.name,status:typeof item.status==='string'?item.status:'unknown',conclusion:typeof item.conclusion==='string'?item.conclusion:null,detailsUrl:typeof item.details_url==='string'?item.details_url:null}]:[];}):[];
      const pullRequests=Array.isArray(pullsValue)?pullsValue.flatMap(value=>{if(!value||typeof value!=='object')return[];const item=value as Record<string,unknown>,baseValue=item.base&&typeof item.base==='object'?item.base as Record<string,unknown>:{},headValue=item.head&&typeof item.head==='object'?item.head as Record<string,unknown>:{};return typeof item.number==='number'&&typeof item.title==='string'&&typeof item.html_url==='string'?[{number:item.number,title:item.title,url:item.html_url,draft:item.draft===true,base:typeof baseValue.ref==='string'?baseValue.ref:'',head:typeof headValue.ref==='string'?headValue.ref:identity.branch,updatedAt:typeof item.updated_at==='string'?item.updated_at:''}]:[];}):[];
      const issues=Array.isArray(issuesValue)?issuesValue.flatMap(value=>{if(!value||typeof value!=='object')return[];const item=value as Record<string,unknown>;if(item.pull_request||typeof item.number!=='number'||typeof item.title!=='string'||typeof item.html_url!=='string')return[];const user=item.user&&typeof item.user==='object'?item.user as Record<string,unknown>:{},labels=Array.isArray(item.labels)?item.labels.flatMap(label=>typeof label==='string'?[label]:label&&typeof label==='object'&&typeof (label as Record<string,unknown>).name==='string'?[(label as Record<string,unknown>).name as string]:[]).slice(0,20):[];return[{number:item.number,title:item.title.slice(0,500),url:item.html_url,body:typeof item.body==='string'?item.body.replace(/\0/g,'').slice(0,8000):null,author:typeof user.login==='string'?user.login:'unknown',labels,updatedAt:typeof item.updated_at==='string'?item.updated_at:''}];}):[];
      if(this.githubKey!==token)throw new Error('The GitHub connection changed during the read. Try again.');
      return {...identity,defaultBranch:typeof repo.default_branch==='string'?repo.default_branch:'',private:repo.private===true,account:probe?.login??'unverified',permissions:{admin:permissions.admin===true,...(typeof permissions.maintain==='boolean'?{maintain:permissions.maintain}:{}),push:permissions.push===true,...(typeof permissions.triage==='boolean'?{triage:permissions.triage}:{}),pull:permissions.pull===true},basePresent:!!base,headPresent:!!head,checks:combined?{state:typeof combined.state==='string'?combined.state:'unknown',total:typeof combined.total_count==='number'?combined.total_count:0,updatedAt:Date.now()}:null,checkRuns,pullRequests,issues,checkedAt:Date.now()};
    }catch(error){if((error as {name?:string}).name==='AbortError')throw new Error('GitHub did not respond within 15 seconds.');throw error;}
    finally{clearTimeout(timeout);}
  }

  private async serviceJson(base:string,path:string,token:string,service:string):Promise<unknown>{
    const endpoint=new URL(path,base);
    const allowed=service==='Sentry'?(endpoint.protocol==='https:'&&(endpoint.hostname==='sentry.io'||endpoint.hostname.endsWith('.sentry.io'))):(endpoint.protocol==='https:'&&endpoint.hostname==='api.vercel.com');
    if(!allowed)throw new Error(`${service} API destination was rejected.`);
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15_000);
    try{
      const response=await fetch(endpoint,{headers:{Accept:'application/json',Authorization:`Bearer ${token}`,'User-Agent':'Aux-Browser'},signal:controller.signal,redirect:'error'});
      if(!response.ok)throw new Error(response.status===401?`${service} rejected the saved token. Reconnect it in Settings.`:response.status===403?`${service} denied this read-only request. Check the token scopes and account policy.`:response.status===404?`${service} could not find the selected resource.`:`${service} request failed with HTTP ${response.status}.`);
      const size=Number(response.headers.get('content-length')??0);if(size>2_000_000)throw new Error(`${service} returned more data than Aux will accept.`);
      const body=await response.text();if(Buffer.byteLength(body,'utf8')>2_000_000)throw new Error(`${service} returned more data than Aux will accept.`);
      try{return JSON.parse(body) as unknown;}catch{throw new Error(`${service} returned an invalid response.`);}
    }catch(error){if((error as {name?:string}).name==='AbortError')throw new Error(`${service} did not respond within 15 seconds.`);throw error;}
    finally{clearTimeout(timeout);}
  }

  async probeVercel():Promise<VercelProbeRecord>{
    if(!this.vercelKey){if(this.vercelError)throw new Error(this.vercelError);throw new Error('Save a Vercel token before testing the connection.');}
    const [userValue,teamsValue]=await Promise.all([this.serviceJson('https://api.vercel.com','/v2/user',this.vercelKey,'Vercel'),this.serviceJson('https://api.vercel.com','/v2/teams?limit=100',this.vercelKey,'Vercel')]);
    const raw=(userValue as {user?:Record<string,unknown>}).user??userValue as Record<string,unknown>;
    if(typeof raw.id!=='string')throw new Error('Vercel returned an unexpected account response.');
    const teams=Array.isArray((teamsValue as {teams?:unknown}).teams)?(teamsValue as {teams:unknown[]}).teams.flatMap(value=>{if(!value||typeof value!=='object')return[];const team=value as Record<string,unknown>;return typeof team.id==='string'&&typeof team.name==='string'&&typeof team.slug==='string'?[{id:team.id,name:team.name,slug:team.slug}]:[];}):[];
    const record:VercelProbeRecord={user:{id:raw.id,name:typeof raw.name==='string'?raw.name:typeof raw.username==='string'?raw.username:'Vercel user',email:typeof raw.email==='string'?raw.email:''},teams,checkedAt:Date.now()};this.repo.setSetting('vercelProbe',record);return record;
  }

  async vercelProjects(teamId?:string):Promise<VercelProjectRecord[]>{
    if(!this.vercelKey)throw new Error(this.vercelError??'Connect Vercel in Settings first.');
    const query=new URLSearchParams({limit:'100'});if(teamId)query.set('teamId',teamId);
    const value=await this.serviceJson('https://api.vercel.com',`/v9/projects?${query}`,this.vercelKey,'Vercel');
    return Array.isArray((value as {projects?:unknown}).projects)?(value as {projects:unknown[]}).projects.flatMap(item=>{if(!item||typeof item!=='object')return[];const project=item as Record<string,unknown>;return typeof project.id==='string'&&typeof project.name==='string'?[{id:project.id,name:project.name,framework:typeof project.framework==='string'?project.framework:null,updatedAt:typeof project.updatedAt==='number'?project.updatedAt:0,teamId:teamId??null}]:[];}):[];
  }

  async vercelDeployments(projectId:string,teamId?:string):Promise<VercelDeploymentRecord[]>{
    if(!this.vercelKey)throw new Error(this.vercelError??'Connect Vercel in Settings first.');
    const query=new URLSearchParams({projectId,limit:'10'});if(teamId)query.set('teamId',teamId);
    const value=await this.serviceJson('https://api.vercel.com',`/v6/deployments?${query}`,this.vercelKey,'Vercel');
    return Array.isArray((value as {deployments?:unknown}).deployments)?(value as {deployments:unknown[]}).deployments.flatMap(item=>{if(!item||typeof item!=='object')return[];const deployment=item as Record<string,unknown>;if(typeof deployment.uid!=='string'||typeof deployment.name!=='string'||typeof deployment.url!=='string')return[];return [{id:deployment.uid,name:deployment.name,url:`https://${deployment.url}`,state:typeof deployment.state==='string'?deployment.state:'UNKNOWN',target:typeof deployment.target==='string'?deployment.target:null,createdAt:typeof deployment.createdAt==='number'?deployment.createdAt:0,readyAt:typeof deployment.ready==='number'?deployment.ready:null}];}):[];
  }

  async probeSentry():Promise<SentryProbeRecord>{
    if(!this.sentryKey){if(this.sentryError)throw new Error(this.sentryError);throw new Error('Save a Sentry token before testing the connection.');}
    const value=await this.serviceJson('https://sentry.io','/api/0/organizations/?per_page=100',this.sentryKey,'Sentry');
    if(!Array.isArray(value))throw new Error('Sentry returned an unexpected organization response.');
    const organizations=value.flatMap(item=>{if(!item||typeof item!=='object')return[];const org=item as Record<string,unknown>;const links=org.links&&typeof org.links==='object'?org.links as Record<string,unknown>:{};return typeof org.id==='string'&&typeof org.name==='string'&&typeof org.slug==='string'?[{id:org.id,name:org.name,slug:org.slug,regionUrl:typeof links.regionUrl==='string'?links.regionUrl:'https://sentry.io'}]:[];});
    const record:SentryProbeRecord={organizations,checkedAt:Date.now()};this.repo.setSetting('sentryProbe',record);return record;
  }

  private sentryBase(organization:string):string{const probe=this.get('sentryProbe') as SentryProbeRecord|undefined;return probe?.organizations.find(item=>item.slug===organization)?.regionUrl??'https://sentry.io';}
  async sentryProjects(organization:string):Promise<SentryProjectRecord[]>{
    if(!this.sentryKey)throw new Error(this.sentryError??'Connect Sentry in Settings first.');
    const value=await this.serviceJson(this.sentryBase(organization),`/api/0/organizations/${encodeURIComponent(organization)}/projects/?per_page=100`,this.sentryKey,'Sentry');
    if(!Array.isArray(value))return[];return value.flatMap(item=>{if(!item||typeof item!=='object')return[];const project=item as Record<string,unknown>;return typeof project.id==='string'&&typeof project.name==='string'&&typeof project.slug==='string'?[{id:project.id,name:project.name,slug:project.slug,platform:typeof project.platform==='string'?project.platform:null,organization}]:[];});
  }
  async sentryIssues(organization:string,project:string):Promise<SentryIssueRecord[]>{
    if(!this.sentryKey)throw new Error(this.sentryError??'Connect Sentry in Settings first.');
    const value=await this.serviceJson(this.sentryBase(organization),`/api/0/organizations/${encodeURIComponent(organization)}/issues/?project=${encodeURIComponent(project)}&query=is%3Aunresolved&sort=date&limit=25&statsPeriod=24h&collapse=stats`,this.sentryKey,'Sentry');
    if(!Array.isArray(value))return[];return value.flatMap(item=>{if(!item||typeof item!=='object')return[];const issue=item as Record<string,unknown>;if(typeof issue.id!=='string'||typeof issue.title!=='string')return[];return [{id:issue.id,shortId:typeof issue.shortId==='string'?issue.shortId:issue.id,title:issue.title,level:typeof issue.level==='string'?issue.level:'error',status:typeof issue.status==='string'?issue.status:'unresolved',count:Number(issue.count??0)||0,users:Number(issue.userCount??0)||0,firstSeen:typeof issue.firstSeen==='string'?issue.firstSeen:'',lastSeen:typeof issue.lastSeen==='string'?issue.lastSeen:'',permalink:typeof issue.permalink==='string'?issue.permalink:''}];});
  }
  async operationsStatus():Promise<OperationsStatus>{
    const unavailable:string[]=[];const checkedAt=Date.now();let vercel:OperationsStatus['vercel'];let sentry:OperationsStatus['sentry'];
    const vercelProjectId=this.get('vercelProjectId');const vercelTeamId=this.get('vercelTeamId');
    if(this.vercelKey&&typeof vercelProjectId==='string'&&vercelProjectId){try{const projects=await this.vercelProjects(typeof vercelTeamId==='string'?vercelTeamId:undefined);const project=projects.find(item=>item.id===vercelProjectId);if(project)vercel={project,deployments:await this.vercelDeployments(project.id,project.teamId??undefined)};else unavailable.push('The selected Vercel project is no longer available.');}catch(error){unavailable.push(error instanceof Error?error.message:'Vercel health could not be read.');}}else unavailable.push('Select a Vercel project in Settings to include deployment health.');
    const sentryOrganization=this.get('sentryOrganization');const sentryProject=this.get('sentryProject');
    if(this.sentryKey&&typeof sentryOrganization==='string'&&sentryOrganization&&typeof sentryProject==='string'&&sentryProject){try{const projects=await this.sentryProjects(sentryOrganization);const project=projects.find(item=>item.slug===sentryProject);if(project)sentry={organization:sentryOrganization,project,issues:await this.sentryIssues(sentryOrganization,sentryProject)};else unavailable.push('The selected Sentry project is no longer available.');}catch(error){unavailable.push(error instanceof Error?error.message:'Sentry health could not be read.');}}else unavailable.push('Select a Sentry project in Settings to include unresolved issues.');
    return {checkedAt,...(vercel?{vercel}:{}),...(sentry?{sentry}:{}),unavailable};
  }

  vercelSandboxCredentials():{token:string;teamId:string;projectId:string}{
    const teamId=this.get('vercelTeamId'),projectId=this.get('vercelProjectId');
    if(!this.vercelKey)throw new Error(this.vercelError??'Connect Vercel in Settings first.');
    if(typeof teamId!=='string'||!teamId||typeof projectId!=='string'||!projectId)throw new Error('Select a Vercel team and project in Settings before creating a cloud environment.');
    return {token:this.vercelKey,teamId,projectId};
  }

  gatewayKey(): string | undefined {
    if (this.savedKey) return this.savedKey;
    if (this.env.AI_GATEWAY_API_KEY) return this.env.AI_GATEWAY_API_KEY;
    if (this.credentialError) throw new Error(this.credentialError);
    if (this.hasLegacyCredential()) throw new Error("Legacy plaintext credentials are disabled. Re-enter the key in Settings to save it securely.");
    return undefined;
  }

  plannerModel(): string {
    if (this.modelProvider() !== "gateway") return this.profiles()[this.modelProvider()]?.plannerModel ?? "";
    return (
      (this.get("plannerModel") as string | undefined) ||
      this.env.AUX_PLANNER_MODEL ||
      DEFAULT_PLANNER_MODEL
    );
  }
  recoveryModel(): string | undefined {
    if (this.modelProvider() !== "gateway") return this.profiles()[this.modelProvider()]?.recoveryModel || undefined;
    return (this.get("recoveryModel") as string) ?? this.env.AUX_RECOVERY_MODEL ?? this.plannerModel();
  }
  visionModel(): string | undefined {
    if (this.modelProvider() !== "gateway") return this.profiles()[this.modelProvider()]?.visionModel || undefined;
    return (this.get("visionModel") as string) || this.env.AUX_VISION_MODEL || this.plannerModel();
  }
  /** Existing model choices remain the category defaults; explicit routes can tune model and effort. */
  agentRoute(category: AgentModelCategory): AgentModelRoute {
    const explicit = (this.get("agentModelRoutes") as Settings["agentModelRoutes"] | undefined)?.[category];
    const valid = AgentModelRouteSchema.safeParse(explicit);
    if (valid.success) return valid.data;
    const baseline = agentModelRoute(category);
    const modelId = category === "visual" ? this.visionModel() : category === "deep" ? this.recoveryModel() : this.plannerModel();
    return { ...baseline, modelId: modelId || baseline.modelId };
  }
  searchEngine(): string {
    return (this.get("searchEngine") as string) ?? DEFAULT_SEARCH_ENGINE;
  }
  maxWorkers(): number {
    return (this.get("maxWorkers") as number) ?? 4;
  }
  perOrigin(): number {
    return (this.get("perOrigin") as number) ?? 2;
  }
  maxModelCalls(): number {
    return modelCallBudget(this.get("maxModelCalls"), DEFAULT_MAX_MODEL_CALLS);
  }

  model(): ModelClient | null {
    if (this.modelOverride) return this.modelOverride;
    const provider = this.modelProvider();
    const endpoint = this.compatibleEndpoint();
    const key = provider === "gateway" ? this.gatewayKey() : this.selectedKey() ?? (provider === "openai-compatible" && isLoopbackCompatibleEndpoint(endpoint) ? "aux-local" : undefined);
    if (!key || !this.plannerModel() || (provider === "openai-compatible" && !endpoint)) return null;
    if (provider !== "gateway") {
      if (!this.gatewayClient) this.gatewayClient = directModelClient(provider, key, undefined, endpoint);
      return this.gatewayClient;
    }
    if (!this.gatewayClient) {
      const t = Number(this.env.AUX_MODEL_CALL_TIMEOUT_MS);
      const only = this.env.AUX_GATEWAY_ONLY?.split(",").map((s) => s.trim()).filter(Boolean);
      this.gatewayClient = new GatewayModelClient(key, {
        callTimeoutMs: Number.isFinite(t) && t > 0 ? t : undefined,
        only: only?.length ? only : undefined,
      });
    }
    return this.gatewayClient;
  }

  async listModels(): Promise<{ models: ModelCapability[]; source: "gateway" | "static" | "configured" }> {
    const provider = this.modelProvider();
    if (provider !== "gateway") {
      const configured = [...new Set([this.plannerModel(), this.visionModel()].filter((value): value is string => !!value))].map(id => ({ id, source: "configured" as const }));
      if (provider !== "openai-compatible") return { models: configured, source: "configured" };
      const endpoint = this.compatibleEndpoint();
      const key = this.selectedKey();
      if (!endpoint || (!key && !isLoopbackCompatibleEndpoint(endpoint))) return { models: configured, source: "configured" };
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      try {
        const response = await fetch(`${endpoint}/models`, {
          headers: { Accept: "application/json", ...(key ? { Authorization: `Bearer ${key}` } : {}) },
          signal: controller.signal,
          redirect: "error",
        });
        if (!response.ok) throw new Error(`Model discovery failed with HTTP ${response.status}.`);
        const declared = Number(response.headers.get("content-length") ?? 0);
        if (declared > 2_000_000) throw new Error("The model endpoint returned more data than Aux will accept.");
        const body = await response.text();
        if (Buffer.byteLength(body, "utf8") > 2_000_000) throw new Error("The model endpoint returned more data than Aux will accept.");
        let value: unknown;
        try { value = JSON.parse(body); }
        catch { throw new Error("The model endpoint returned an invalid response."); }
        const data = value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data) ? (value as { data: unknown[] }).data : null;
        if (!data) throw new Error("The model endpoint did not return an OpenAI-compatible model list.");
        const discovered = data.flatMap(item => {
          if (!item || typeof item !== "object" || typeof (item as { id?: unknown }).id !== "string") return [];
          const id = (item as { id: string }).id.trim();
          return id && id.length <= 500 ? [{ id, source: "configured" as const }] : [];
        });
        const seen = new Set<string>();
        const unique = discovered.filter(item => !seen.has(item.id) && !!seen.add(item.id)).slice(0, 500);
        return { models: [...unique, ...configured.filter(item => !seen.has(item.id))], source: "configured" };
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") throw new Error("Model discovery timed out after 10 seconds.");
        throw error;
      } finally { clearTimeout(timeout); }
    }
    const m = this.model();
    let extra: { id: string; name?: string; inputUsdPerMTok?: number; outputUsdPerMTok?: number }[] = [];
    let source: "gateway" | "static" = "static";
    if (m) {
      try {
        extra = await m.listModels();
        source = "gateway";
      } catch {
        extra = [];
      }
    }
    const catalog = extra.map((x) => ({ ...x, source: "catalog" as const }));
    return {
      models: mergeModelCapabilities(MODEL_REGISTRY, catalog),
      source,
    };
  }

  /** Tiny structured-output + optional screenshot-understanding probe. */
  async probe(modelId?: string): Promise<{ ok: boolean; modelId: string; latencyMs?: number; vision?: boolean; error?: string }> {
    const m = this.model();
    const target = modelId ?? this.plannerModel();
    if (!m) return { ok: false, modelId: target, error: "Configure a provider connection and planner model in Settings first" };
    try {
      const { z } = await import("zod");
      const res = await m.generateStructured({
        modelId: target,
        system: "You answer probes with strict JSON.",
        prompt: 'Return {"ok":true}',
        schema: z.object({ ok: z.boolean() }),
        // generous budget — reasoning models spend tokens thinking before emitting
        maxOutputTokens: 1024,
      });
      const ok = res.object.ok === true;
      let vision: boolean | undefined;
      try {
        // 1x1 png
        const png =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
        await m.generateText({ modelId: target, prompt: "What color dominates this image? One word.", imageDataUrl: png, maxOutputTokens: 512 });
        vision = true;
      } catch {
        vision = false;
      }
      const result = { ok, modelId: target, latencyMs: res.durationMs, vision };
      this.repo.setSetting("modelProbe", { provider: this.modelProvider(), modelId: target, ok, checkedAt: Date.now(), latencyMs: res.durationMs, vision } satisfies ModelProbeRecord);
      return result;
    } catch (e) {
      this.repo.setSetting("modelProbe", { provider: this.modelProvider(), modelId: target, ok: false, checkedAt: Date.now() } satisfies ModelProbeRecord);
      return { ok: false, modelId: target, error: e instanceof Error ? e.message : String(e) };
    }
  }

  modelProvider(): ModelProvider { return ModelProviderSchema.parse(this.get("modelProvider") ?? "gateway"); }
  compatibleEndpoint(): string | undefined {
    const value = this.get("compatibleEndpoint");
    if (typeof value !== "string" || !value) return undefined;
    try { return normalizeCompatibleEndpoint(value); }
    catch { return undefined; }
  }
  private profiles(): NonNullable<Settings["providerModels"]> { return (this.get("providerModels") as Settings["providerModels"]) ?? {}; }
  private selectedKey(): string | undefined {
    const provider = this.modelProvider();
    return provider === "gateway" ? this.savedKey || this.env.AI_GATEWAY_API_KEY : this.directKeys[provider] || this.env[PROVIDER_ENV[provider]];
  }

  private gatewayKeyPath(): string {
    return join(dirname(this.settingsPath), "gateway.key");
  }

  private hasLegacyCredential(): boolean {
    return existsSync(this.gatewayKeyPath()) || this.repo.hasSetting("gatewayApiKey") || this.fileSettings.gatewayApiKey !== undefined;
  }

  private async writeGatewayKey(key: string): Promise<void> {
    if (!this.native?.available()) throw new Error("Secure credential storage requires the desktop. Supply AI_GATEWAY_API_KEY in the process environment for standalone use.");
    if (key === "••••••••") throw new Error("Enter the actual key; a masked placeholder cannot be saved.");
    await this.native.storeSecret("gatewayApiKey", key);
    this.savedKey = key || undefined;
    this.credentialError = undefined;
    this.gatewayClient = null;
    // Only an explicit save/remove retires legacy plaintext storage. Never read
    // gateway.key or silently use a legacy value as the encryption input.
    try { unlinkSync(this.gatewayKeyPath()); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    this.repo.deleteSetting("gatewayApiKey");
    const { gatewayApiKey: legacyKey, ...preferences } = this.fileSettings;
    this.fileSettings = preferences;
    writeFileSync(this.settingsPath, JSON.stringify(preferences, null, 2), { mode: 0o600 });
  }

  private async saveServiceCredential(service:string,secretName:string,key:string,assign:(value:string|undefined)=>void):Promise<void>{
    if(!this.native?.available())throw new Error(`Secure ${service} credential storage requires the Aux desktop app.`);
    if(key==='••••••••')throw new Error('Enter the actual token; a masked placeholder cannot be saved.');
    const value=key.trim();await this.native.storeSecret(secretName,value);assign(value||undefined);
  }
}
