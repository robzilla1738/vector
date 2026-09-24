import { steppedZoomLevel } from "@aux/contracts/page-zoom";
import { DEFAULT_SEARCH_ENGINE } from "@aux/contracts/search-engine";
import { MODEL_REGISTRY, modelPickerEntries } from "@aux/contracts/model-registry";
import { workspaceMemoryText } from "@aux/contracts/memory-context";
import { textContextShares } from "@aux/contracts/text-context";
/**
 * Scripted AuxBridge for `vite --mode mock`. Runs the whole shell in a
 * plain browser with no Electron and no runtime — for visual review, screenshot
 * baselines, and poking at states that are hard to reproduce live.
 *
 * Scenario is chosen by URL query:
 *   ?scenario=start         no tabs — start page
 *   ?scenario=browsing      6 tabs, Google unfiled and active (default)
 *   ?scenario=run           6 tabs + a live run with steps and an observation, rail open
 *   ?scenario=takeover      run scenario with the human holding the page
 *   ?scenario=needs-input   run scenario waiting on a question
 *   ?scenario=set           a set mapping over 12 members
 *   ?scenario=many          45 tabs
 *   ?scenario=disconnected  runtime unreachable → degraded banner
 *   &theme=dark|light  &sidebar=expanded|rail  &live=1 (stream new steps)
 */
import type { MethodName, Download, BrowsingMemoryPage, BrowsingMemoryPolicy, ContentMemoryPolicy, WorkspaceMemory, ConversationImage, ConversationSummary, BrowserSpace, PageTarget, Run, StepRecord, AuxEvent } from "@aux/contracts";
import type { BrowserExtension, AuxBridge } from "../bridge";
import { DEFAULT_SPACE } from "../workspace";
import { BOOKMARKS, HISTORY, MEMBERS, OBSERVATION, PAST_RUNS, PROGRAMS, RUN_ID, SET, SIDEBAR_TABS, makePage, makeRun, makeSteps } from "./fixtures";

type Listener<T> = (v: T) => void;

export function installMockBridge(q: URLSearchParams) {
  let recoveryTabs=q.get("recovery")==="1"?[{pageId:"saved-fixture-tab",title:"Saved project research",url:"https://example.com/research",windowId:"main",error:"The browser connection was interrupted while restoring this tab.",retrying:false}]:[];
  let bookmarks: {url:string;title:string;folderPath?:string[]}[] = [...BOOKMARKS];
  const bookmarkFolders: string[][] = [];
  const imageReferences = new Map<string, { image: ConversationImage; dataUrl: string }[]>();
  const imageList = (chatId: string) => ({ chatId, images: (imageReferences.get(chatId) ?? []).map(item => item.image) });
  const conversationSpaces = new Map<string, string | null>();
  const memoryNotes=new Map<string,WorkspaceMemory>();
  const browsingMemory = new Map<string, {workspaceId: string; policy: BrowsingMemoryPolicy; pages: BrowsingMemoryPage[]}>();
  const contentMemory = new Map<string, ContentMemoryPolicy>();
  let history = [...HISTORY];
  const zoomLevels = new Map<string, number>();
  const zoomListeners = new Set<() => void>();
  let spaces: BrowserSpace[] = [{ ...DEFAULT_SPACE, workspaceId: `workspace:${DEFAULT_SPACE.id}`, archived: false }];
  const scenario = q.get("scenario") ?? "browsing";
  type DictationEvent = Parameters<Parameters<AuxBridge["onDictation"]>[0]>[0];
  const dictationListeners = new Set<(event: DictationEvent) => void>();
  const dictationEvent = (event: DictationEvent) => dictationListeners.forEach(listener => listener(event));

  let extensions: BrowserExtension[] = scenario === "extensions" ? [
    {key:"synthetic-reader",name:"Synthetic reading helper",version:"1.0.0",permissions:["storage", "https://example.com/*"],enabled:true,loaded:true,managed:true,source:"managed"},
    {key:"synthetic-disabled",name:"Synthetic disabled helper",version:"1.0.0",permissions:[],enabled:false,loaded:false,managed:true,source:"managed"},
  ] : [];
  let downloads: Download[] = scenario === "downloads" ? [
    {id:"download-active",filename:"Project assets.zip",path:"/tmp/Project assets.zip",state:"progressing",size:4000000,totalBytes:16000000,startedAt:Date.now(),canCancel:true,canResume:false},
    {id:"download-done",filename:"Research report.pdf",path:"/tmp/Research report.pdf",state:"completed",size:840000,startedAt:Date.now()-10000,endedAt:Date.now()-9000},
    {id:"download-failed",filename:"Quarterly comparison.xlsx",path:"/tmp/Quarterly comparison.xlsx",sourceUrl:"https://example.com/report.xlsx",state:"interrupted",size:400,startedAt:Date.now()-20000,endedAt:Date.now()-19000},
    {id:"download-cancelled",filename:"Previous export.csv",path:"/tmp/Previous export.csv",state:"cancelled",size:0,startedAt:Date.now()-30000,endedAt:Date.now()-29000},
  ] : [];
  const live = q.get("live") === "1";
  const theme = q.get("theme") ?? "dark";
  if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
  const sidebar = q.get("sidebar");
  if (sidebar) localStorage.setItem("aux.sidebar", sidebar);
  else localStorage.removeItem("aux.sidebar");
  localStorage.setItem(
    "aux.layout.v1",
    JSON.stringify({
      spaces: [DEFAULT_SPACE],
      activeSpaceId: DEFAULT_SPACE.id,
      tabSpace: {},
      order: ["page-1", "page-2", "page-3", "page-4", "page-6", "page-5"],
      pins: { [DEFAULT_SPACE.id]: BOOKMARKS },
      folders: [
        { id: "folder-dev", name: "Dev", spaceId: DEFAULT_SPACE.id, collapsed: false },
        { id: "folder-social", name: "Social", spaceId: DEFAULT_SPACE.id, collapsed: true },
        { id: "folder-design", name: "Design", spaceId: DEFAULT_SPACE.id, collapsed: true },
        { id: "folder-rhema", name: "Rhema", spaceId: DEFAULT_SPACE.id, collapsed: true },
        { id: "folder-ai", name: "AI", spaceId: DEFAULT_SPACE.id, collapsed: true },
      ],
      tabFolder: {
        "page-1": "folder-dev",
        "page-2": "folder-dev",
        "page-3": "folder-dev",
        "page-4": "folder-dev",
        "page-6": "folder-social",
      },
    }),
  );
  localStorage.setItem("aux.sb-w", q.get("sbw") ?? "260");
  localStorage.setItem("aux.rail-w", q.get("railw") ?? "380");
  if (q.get("rail")) localStorage.setItem("aux.mock.rail", q.get("rail")!);
  else localStorage.removeItem("aux.mock.rail");

  // ---- state ----
  let seq = 100;
  const eventListeners = new Set<Listener<AuxEvent>>();
  const loadingListeners = new Set<Listener<{ pageId: string; loading: boolean }>>();
  const emit = (type: string, payload: Record<string, unknown>, runId?: string) => {
    const ev: AuxEvent = { seq: ++seq, type, payload, ts: Date.now(), ...(runId ? { runId } : {}) };
    for (const l of eventListeners) l(ev);
  };

  const tabCount = scenario === "start" ? 0 : scenario === "many" ? 45 : 6;
  let pages: PageTarget[] = tabCount === 6
    ? SIDEBAR_TABS.map((s, i) => makePage(i, {}, s))
    : Array.from({ length: tabCount }, (_, i) => makePage(i));
  let activePageId: string | null = pages[4]?.pageId ?? pages[0]?.pageId ?? null;
  const withRun = ["run", "takeover", "needs-input"].includes(scenario);
  let runs: Run[] = [...PAST_RUNS];
  const resultFormat = q.get("resultFormat") ?? "markdown";
  const resultFixture = {artifactId:"mock-report",runId:"mock-report-run",chatId:"mock-report-chat",filename:`comparison.${resultFormat === "csv" ? "csv" : resultFormat === "json" ? "json" : "md"}`,mediaType:resultFormat === "csv" ? "text/csv" : resultFormat === "json" ? "application/json" : "text/markdown",byteLength:180,createdAt:Date.now(),conversationTitle:"Compare browser choices",turnGoal:"Create a comparison report"};
  const resultContent = resultFormat === "csv" ? 'Area,Priority,Notes\nEveryday browsing,High,"Fast, calm navigation"\nHelpful assistance,High,"Clear answers"\n' : resultFormat === "json" ? JSON.stringify({priorities:[{area:"Everyday browsing",priority:"High"},{area:"Helpful assistance",priority:"High"}]}) : "# Browser comparison\n\nA saved report with clear next steps.\n\n| Area | Priority |\n| --- | --- |\n| Everyday browsing | High |\n| Helpful assistance | High |\n\nKeep the browsing experience calm and predictable.";
  if (scenario === "results") runs.unshift(makeRun({runId:resultFixture.runId,goal:resultFixture.turnGoal,status:"completed",config:{chatId:resultFixture.chatId},result:{answer:"Saved comparison.md"}}));
  const chatMetadata = new Map<string,{title:string;archived:boolean;updatedAt:number}>();
  if(scenario==="results"&&q.get("archived")==="1")chatMetadata.set(resultFixture.chatId,{title:resultFixture.conversationTitle,archived:true,updatedAt:Date.now()});
  const chatSummaries = ():ConversationSummary[] => {
    const groups = new Map<string,Run[]>();
    for (const run of runs) { const key=run.config?.chatId??run.runId; groups.set(key,[...(groups.get(key)??[]),run]); }
    return [...groups].map(([chatId,turns])=>{
      turns.sort((a,b)=>b.createdAt-a.createdAt); const latestRun=turns[0]!, saved=chatMetadata.get(chatId);
      return {chatId,title:saved?.title??turns.at(-1)!.goal,archived:saved?.archived??false,createdAt:turns.at(-1)!.createdAt,updatedAt:saved?.updatedAt??latestRun.createdAt,turnCount:turns.length,latestRun};
    }).sort((a,b)=>b.updatedAt-a.updatedAt||b.chatId.localeCompare(a.chatId));
  };
  const documents = new Map<string, {attachmentId:string;filename:string;sourceUrl?:string;sourceTruncated?:boolean;content:string;byteLength:number;createdAt:number;included:boolean}[]>();
  const artifactChips = new Map<string, {artifactId:string;runId:string;filename:string;mediaType:string;excerpt:string;byteLength:number;createdAt:number;turnGoal:string;included:boolean}[]>();
  const documentList = (chatId:string) => ({chatId,attachments:(documents.get(chatId)??[]).map(({content,...item})=>({...item,excerpt:content.slice(0,1000)}))});
  let steps: Record<string, StepRecord[]> = {};
  const settings: Record<string, unknown> = {
    theme,
    searchEngine: DEFAULT_SEARCH_ENGINE,
    plannerModel: "alibaba/qwen3.8-27b",
    maxWorkers: 4,
    maxModelCalls: 8,
    gatewayApiKey: "••••••••",
    effectGrants: ["effect:read", "effect:write", "effect:destructive", "effect:egress"],
  };

  if (withRun) {
    activePageId = "page-1";
    const run = makeRun(
      scenario === "takeover"
        ? { status: "paused", statusMessage: "Paused — you're in control of this page" }
        : scenario === "needs-input"
          ? { status: "needs_input", statusMessage: "Two comment threads are marked resolved but still discuss focus rings. Include resolved threads too?" }
          : {},
    );
    runs = [run, ...runs];
    steps[RUN_ID] = makeSteps(RUN_ID, scenario === "run" ? 6 : 8);
    pages = pages.map((p) => (p.pageId === "page-1" ? { ...p, controller: scenario === "takeover" ? "human" : "agent", controllerEpoch: 2 } : p));
  } else if (scenario !== "start" && pages.length) {
    pages = pages.map((p, i) => (i === 4 ? { ...p, backend: "chrome" } : p));
  }
  if (scenario === "many") pages = pages.map((p, i) => (i === 7 ? { ...p, loading: true } : i === 21 ? { ...p, viewStatus: "crashed" } : p));

  const sets = scenario === "set" || withRun ? [SET] : [];
  const members = sets.length ? MEMBERS : [];

  const workspace = () => ({ pages, sets, members, runs, sessions: [{ sessionId: "sess-1", backend: "aux", label: "Aux", status: "connected" }], activePageId, lastSeq: seq });

  const page = (id: string) => {
    const p = pages.find((x) => x.pageId === id);
    if (!p) throw new Error(`no page ${id}`);
    return p;
  };
  const patch = (id: string, fields: Partial<PageTarget>) => {
    pages = pages.map((p) => (p.pageId === id ? { ...p, ...fields } : p));
    emit("page.updated", { page: page(id) });
  };
  const patchRun = (id: string, fields: Partial<Run>, status = false) => {
    runs = runs.map((r) => (r.runId === id ? { ...r, ...fields } : r));
    emit(status ? "run.status" : "run.updated", { run: runs.find((r) => r.runId === id) }, id);
  };

  let nextId = pages.length + 1;
  type MockHandler = (p: Record<string, unknown>, method: string) => Promise<unknown>;
  const mockWorkspacesBrowsingMemoryGet: MockHandler = async (p, method) => {
    const workspaceId = String(p.workspaceId);
    const prior = browsingMemory.get(workspaceId) ?? { workspaceId, policy: { enabled: false, retentionDays: 7 as const }, pages: [] };
    const policy = method === "workspaces.browsingMemory.set" ? p.policy as BrowsingMemoryPolicy : prior.policy;
    const pages = prior.pages.filter(page => page.lastVisitedAt > Date.now() - policy.retentionDays * 86_400_000 && (method !== "workspaces.browsingMemory.forget" || (p.memoryId && page.memoryId !== p.memoryId)));
    const next = { workspaceId, policy, pages };
    browsingMemory.set(workspaceId, next);
    if (method !== "workspaces.browsingMemory.get") emit("workspace.browsingMemory.updated", { workspaceId });
    return next;
  };
  const mockConversationsRename: MockHandler = async (p, method) => {
    const item=chatSummaries().find(item=>item.chatId===p.chatId);if(!item)throw new Error("Conversation not found");
    const changed={...item,title:method.endsWith("rename")?String(p.title):item.title,archived:method.endsWith("archive")?!!p.archived:item.archived,updatedAt:Date.now()};
    chatMetadata.set(item.chatId,changed);emit("conversation.changed",{chatId:item.chatId,title:changed.title,archived:changed.archived});return changed;
  };
  const mockConversationsWorkspaceGet: MockHandler = async (p, method) => {
    const chatId = String(p.chatId);
    if (method === "conversations.workspace.set") { conversationSpaces.set(chatId, p.workspaceId as string | null); emit("conversation.changed", {chatId}); }
    const workspaceId = conversationSpaces.get(chatId);
    const space = spaces.find(item => item.workspaceId === workspaceId);
    const workspace = space ? {workspaceId: space.workspaceId!, name: space.name, createdAt: 0} : null;
    const memory = workspace ? memoryNotes.get(workspace.workspaceId) ?? {workspaceId: workspace.workspaceId, content: "", revision: 0, enabled: true} : null;
    return {chatId, workspace, memory, assigned: conversationSpaces.has(chatId), memoryPreview: workspaceMemoryText(memory), browsingPreview: ""};
  };
  const mockConversationsImagesToggle: MockHandler = async (p, method) => {
    const chatId=String(p.chatId),items=imageReferences.get(chatId)??[];
    imageReferences.set(chatId,method.endsWith("remove")?items.filter(item=>item.image.imageId!==p.imageId):items.map(item=>item.image.imageId===p.imageId?{...item,image:{...item.image,included:!!p.included}}:item));return imageList(chatId);
  };
  const mockConversationsAttachmentsToggle: MockHandler = async (p, method) => {
    const chatId=String(p.chatId),items=documents.get(chatId)??[];
    documents.set(chatId,method.endsWith("remove")?items.filter(item=>item.attachmentId!==p.attachmentId):items.map(item=>item.attachmentId===p.attachmentId?{...item,included:!!p.included}:item));emit("conversation.context.changed",{chatId});return documentList(chatId);
  };
  const mockPagesBack: MockHandler = async p => {
    return page(p.pageId as string);
  };
  const handlers = {
    "workspace.get": async () => {
      return workspace();
    },
    "spaces.import": async p => {
      for (const input of p.spaces as { id: string; name: string; color: BrowserSpace["color"] }[]) {
        if (!spaces.some(space => space.id === input.id)) spaces.push({ ...input, workspaceId: `workspace:${input.id}`, archived: false });
      }
      return spaces;
    },
    "spaces.list": async () => {
      return spaces;
    },
    "spaces.create": async p => {
      const id = crypto.randomUUID();
      spaces = [...spaces, { id, workspaceId: `workspace:${id}`, name: String(p.name), color: p.color as BrowserSpace["color"], archived: false }];
      emit("spaces.updated", { spaces });
      return spaces;
    },
    "spaces.update": async p => {
      spaces = spaces.map(space => space.id === p.id ? { ...space, ...p } as BrowserSpace : space);
      emit("spaces.updated", { spaces });
      return spaces;
    },
    "workspaces.browsingMemory.get": mockWorkspacesBrowsingMemoryGet,
    "workspaces.browsingMemory.set": mockWorkspacesBrowsingMemoryGet,
    "workspaces.browsingMemory.forget": mockWorkspacesBrowsingMemoryGet,
    "workspaces.browsingMemory.record": async () => {
      return { recorded: false };
    },
    "workspaces.contentMemory.policy": async p => contentMemory.get(String(p.workspaceId)) ?? { enabled: false, retentionDays: 30, allowedOrigins: [] },
    "workspaces.contentMemory.setPolicy": async p => {
      const policy = p.policy as ContentMemoryPolicy;
      contentMemory.set(String(p.workspaceId), policy);
      emit("workspace.contentMemory.updated", { workspaceId: String(p.workspaceId) });
      return policy;
    },
    "workspaces.contentMemory.capture": async () => { throw new Error("Article capture needs a native Aux tab."); },
    "workspaces.contentMemory.search": async () => [],
    "workspaces.contentMemory.get": async () => null,
    "workspaces.contentMemory.forget": async p => { emit("workspace.contentMemory.updated", { workspaceId: String(p.workspaceId) }); return { forgotten: 0 }; },
    "workspaces.memory.get": async p => {
      return memoryNotes.get(String(p.workspaceId))??{workspaceId:String(p.workspaceId),content:"",revision:0,enabled:true};
    },
    "workspaces.memory.set": async p => {
      const workspaceId=String(p.workspaceId),prior=memoryNotes.get(workspaceId);
      if((prior?.revision??0)!==p.expectedRevision)throw new Error("Workspace memory changed; reload it before saving.");
      const next={workspaceId,excludedOrigins:(p.excludedOrigins as string[]|undefined)??prior?.excludedOrigins??[],content:String(p.content),items:(p.items as WorkspaceMemory["items"])??prior?.items??[],revision:(prior?.revision??0)+1,enabled:typeof p.enabled==="boolean"?p.enabled:prior?.enabled??true,updatedAt:Date.now()};
      memoryNotes.set(workspaceId,next);emit("workspace.memory.updated",{workspaceId,revision:next.revision});return next;
    },
    "workspaces.memory.search": async p => {
      return [...memoryNotes.values()].filter(memory=>[memory.content,...(memory.items??[]).map(item=>`${item.content} ${item.sourceUrl??""}`)].join("\n").toLowerCase().includes(String(p.query).toLowerCase())||spaces.find(space=>space.workspaceId===memory.workspaceId)?.name.toLowerCase().includes(String(p.query).toLowerCase())).map(memory=>({workspaceId:memory.workspaceId,name:spaces.find(space=>space.workspaceId===memory.workspaceId)?.name??"Space",excerpt:memory.content.slice(0,240),enabled:memory.enabled}));
    },
    "workspaces.list": async () => {
      return spaces.map(space => ({ workspaceId: space.workspaceId, name: space.name, createdAt: 0 }));
    },
    "plugins.inspect": async () => {
      return { name: "Example bundle", version: "1.0", routineCount: 1, routineTitles: ["Weekly digest"] };
    },
    "plugins.install": async p => {
      return { plugin: { pluginId: "plg-1", name: "Example bundle", workspaceId: p.workspaceId, routineIds: [], installedAt: Date.now() }, imported: 0, skipped: 1 };
    },
    "plugins.list": async () => {
      return [];
    },
    "plugins.uninstall": async p => {
      return { plugin: { pluginId: p.pluginId, name: "Example bundle", workspaceId: "", routineIds: [], installedAt: Date.now(), uninstalledAt: Date.now() }, archivedRoutines: 0 };
    },
    "tasks.list": async () => {
      return [];
    },
    "conversations.prepared": async () => {
      return [];
    },
    "conversations.list": async p => {
      const query=String(p.query??"").toLowerCase(),before=p.before as {updatedAt:number;chatId:string}|undefined;
      return chatSummaries().filter(item=>(p.workspaceId===undefined||conversationSpaces.get(item.chatId)===p.workspaceId)&&item.archived===!!p.archived&&(!query||`${item.title} ${item.latestRun.goal} ${String(item.latestRun.result?.answer??"")}`.toLowerCase().includes(query))&&(!before||item.updatedAt<before.updatedAt||(item.updatedAt===before.updatedAt&&item.chatId<before.chatId))).slice(0,Number(p.limit??40));
    },
    "conversations.get": async p => {
      return chatSummaries().find(item=>item.chatId===p.chatId)??null;
    },
    "conversations.rename": mockConversationsRename,
    "conversations.archive": mockConversationsRename,
    "conversations.delete": async p => {
      const before=runs.length;runs=runs.filter(run=>(run.config?.chatId??run.runId)!==p.chatId);chatMetadata.delete(String(p.chatId));documents.delete(String(p.chatId));emit("conversation.deleted",{chatId:p.chatId});return {ok:true,deletedRuns:before-runs.length};
    },
    "runs.context.get": async p => ({chatId:p.chatId,historyEnabled:true,entries:[]}),
    "runs.context.set": async p => ({chatId:p.chatId,historyEnabled:p.historyEnabled ?? true,entries:[]}),
    "results.search": async p => {
      return scenario === "results" && `${resultFixture.filename} ${resultFixture.conversationTitle}`.toLowerCase().includes(String(p.query).toLowerCase()) ? [resultFixture] : [];
    },
    "results.read": async p => {
      if(scenario!=="results"||p.artifactId!==resultFixture.artifactId)throw new Error("Saved result is unavailable.");return {...resultFixture,content:resultContent};
    },
    "conversations.artifacts.get": async p => {
      return {chatId:p.chatId,artifacts:[...(artifactChips.get(String(p.chatId)) ?? [])]};
    },
    "conversations.artifacts.toggle": async p => {
      const chatId=String(p.chatId);
      const list=artifactChips.get(chatId)??[];
      for(const item of list)if(item.artifactId===p.artifactId)item.included=!!p.included;
      return {chatId,artifacts:[...list]};
    },
    "conversations.sources.get": async p => {
      return {chatId:p.chatId,sources:[]};
    },
    "conversations.workspace.get": mockConversationsWorkspaceGet,
    "conversations.workspace.set": mockConversationsWorkspaceGet,
    "pages.capture": async () => {
      const canvas = document.createElement("canvas"); canvas.width = 1280; canvas.height = 800;
      const ctx = canvas.getContext("2d")!; ctx.fillStyle = "#f5f6fa"; ctx.fillRect(0, 0, 1280, 800);
      ctx.fillStyle = "#202532"; ctx.font = "40px system-ui"; ctx.fillText("Project research — sample page", 90, 120);
      ctx.font = "24px system-ui"; ctx.fillText("Mock capture for reviewing the attachment interface", 90, 180);
      for (let i=0;i<3;i++) { ctx.fillStyle=["#dae7ff", "#e7defa", "#dbece5"][i]!; ctx.fillRect(90+i*365, 260, 330, 360); }
      return {dataUrl:canvas.toDataURL("image/png"),width:1280,height:800,scale:1};
    },
    "conversations.images.get": async p => {
      return imageList(String(p.chatId));
    },
    "conversations.images.add": async p => {
      const chatId=String(p.chatId), items=imageReferences.get(chatId)??[];
      if(items.length>=4)throw new Error("A conversation can hold four image references.");
      const bitmap=new Image();bitmap.src=String(p.dataUrl);await bitmap.decode();
      const image: ConversationImage={imageId:crypto.randomUUID(),artifactId:crypto.randomUUID(),filename:String(p.filename),sourceUrl:p.sourceUrl as string|undefined,sourcePage:p.sourcePage as ConversationImage["sourcePage"],width:bitmap.naturalWidth,height:bitmap.naturalHeight,byteLength:Math.floor(String(p.dataUrl).length*.75),createdAt:Date.now(),included:true};
      items.push({image,dataUrl:String(p.dataUrl)});imageReferences.set(chatId,items);return imageList(chatId);
    },
    "conversations.images.read": async p => {
      const item=(imageReferences.get(String(p.chatId))??[]).find(item=>item.image.imageId===p.imageId);
      if(!item)throw new Error("Image reference not found.");return item;
    },
    "conversations.images.toggle": mockConversationsImagesToggle,
    "conversations.images.remove": mockConversationsImagesToggle,
    "conversations.attachments.get": async p => {
      return documentList(String(p.chatId));
    },
    "conversations.attachments.page": async p => {
      const page=pages.find(page=>page.pageId===p.pageId);
      if(!page)throw new Error("This tab is no longer available.");
      const chatId=String(p.chatId),items=documents.get(chatId)??[];
      if(items.length>=5)throw new Error("Remove a snapshot before adding another.");
      const content=`Page: ${page.title}\nSource: ${page.url}\n\nMock page text for reviewing page attachments.`;
      items.push({attachmentId:crypto.randomUUID(),filename:`${page.title.slice(0,180)}.txt`,sourceUrl:page.url,sourceTruncated:false,content,byteLength:content.length,createdAt:Date.now(),included:true});
      documents.set(chatId,items);emit("conversation.context.changed",{chatId});return documentList(chatId);
    },
    "conversations.attachments.add": async p => {
      const chatId=String(p.chatId),items=documents.get(chatId)??[];
      items.push({attachmentId:crypto.randomUUID(),filename:String(p.filename),content:String(p.content),byteLength:new TextEncoder().encode(String(p.content)).length,createdAt:Date.now(),included:true});
      documents.set(chatId,items);emit("conversation.context.changed",{chatId});return documentList(chatId);
    },
    "conversations.attachments.toggle": mockConversationsAttachmentsToggle,
    "conversations.attachments.remove": mockConversationsAttachmentsToggle,
    "conversations.attachments.read": async p => {
      const items=documents.get(String(p.chatId))??[];
      const shares=textContextShares(items.map(item=>item.included?item.content.length:0),6000);
      for(const [index,item] of items.entries()){
        const contextCharacters=shares[index]!;
        if(item.attachmentId===p.attachmentId)return {attachment:documentList(String(p.chatId)).attachments.find(entry=>entry.attachmentId===item.attachmentId),content:item.content,contextCharacters};
      }
      throw new Error("Document attachment not found.");
    },
    "settings.get": async () => {
      return { ...settings };
    },
    "settings.set": async p => {
      Object.assign(settings, p);
      emit("settings.changed", { settings: { ...settings } });
      return { ok: true };
    },
    "browser.recovery.list": async () => {
      return recoveryTabs;
    },
    "browser.recovery.retry": async p => {
      const saved=recoveryTabs.find(tab=>tab.pageId===p.pageId);if(!saved)throw new Error("This tab has already been restored.");
      const page=makePage(pages.length,{...saved,backend:"aux",viewStatus:"visible"});pages.push(page);
      recoveryTabs=recoveryTabs.filter(tab=>tab.pageId!==p.pageId);
      emit("page.added",{page});emit("browser.recovery.changed",{});
      return {ok:true,pageId:page.pageId};
    },
    "bookmarks.folders.list": async () => {
      return bookmarkFolders;
    },
    "bookmarks.list": async () => {
      return bookmarks;
    },
    "downloads.list": async () => {
      return downloads;
    },
    "downloads.remove": async p => {
      const ids = new Set(p.ids as string[]);
      const removed = downloads.filter(item => ids.has(item.id) && !item.canCancel && ["completed", "cancelled", "interrupted"].includes(item.state)).map(item => item.id);
      downloads = downloads.filter(item => !removed.includes(item.id));
      emit("downloads.removed", {ids:removed});
      return {removed};
    },
    "programs.list": async () => {
      return PROGRAMS;
    },
    "history.list": async p => {
      const query = ((p.query as string) ?? "").toLowerCase();
      const before = p.before as {visitedAt:number;url:string}|undefined;
      return history.filter(h => (!query || `${h.title} ${h.url}`.toLowerCase().includes(query))
        && (p.since === undefined || h.visitedAt >= Number(p.since))
        && (!before || h.visitedAt < before.visitedAt || (h.visitedAt === before.visitedAt && h.url < before.url)))
        .sort((a,b) => b.visitedAt-a.visitedAt || (a.url < b.url ? 1 : a.url > b.url ? -1 : 0)).slice(0, Number(p.limit ?? 100));
    },
    "models.list": async () => {
      return { models: modelPickerEntries(MODEL_REGISTRY), source: "static" };
    },
    "models.probe": async p => {
      return { ok: true, modelId: (p.modelId as string) || "alibaba/qwen3.8-27b", latencyMs: 42, vision: false };
    },
    "chrome.importCookies": async () => {
      return { ok: true, source: "mock", imported: 0, skipped: 0, domains: 0, detail: "Cookie import is not available in mock." };
    },
    "programs.run": async p => {
      const id = `run-${Math.random().toString(36).slice(2, 6)}`;
      const run: Run = { runId: id, goal: `program ${(p.programId as string) ?? ""}`, status: "running", pageIds: p.pageId ? [p.pageId as string] : [], createdAt: Date.now(), startedAt: Date.now(), statusMessage: "Running saved program" };
      runs = [run, ...runs];
      emit("run.status", { run }, id);
      steps[id] = [];
      void scriptRun(id);
      return { runId: id };
    },
    "sets.results": async () => {
      return MEMBERS.filter((m) => m.resultId).map((m, i) => ({
        resultId: m.resultId!,
        memberId: m.memberId,
        sourceUrl: m.url!,
        values: { plan: ["Free", "Pro", "Business"][i % 3], price_usd: [0, 8, 15, 10, 12, 20][i], seats: i % 2 ? "per seat" : "flat" },
        observedAt: Date.now() - i * 30_000,
        status: "ok",
      }));
    },
    "pages.open": async p => {
      const url = (p.url as string) ?? "about:blank";
      const np: PageTarget = { ...makePage(nextId - 1), pageId: `page-${nextId}`, url, title: url === "about:blank" ? "" : hostTitle(url), favicon: undefined, canGoBack: false, loading: url !== "about:blank" };
      nextId++;
      pages = [...pages, np];
      emit("page.added", { page: np });
      if (p.activate) {
        activePageId = np.pageId;
        emit("page.updated", { pageId: np.pageId, activePageId });
      }
      if (np.loading) setTimeout(() => patch(np.pageId, { loading: false, title: hostTitle(url) }), 900);
      return np;
    },
    "pages.close": async p => {
      const id = p.pageId as string;
      pages = pages.filter((x) => x.pageId !== id);
      if (activePageId === id) activePageId = null;
      emit("page.removed", { pageId: id });
      return { ok: true };
    },
    "pages.activate": async p => {
      activePageId = p.pageId as string;
      return page(activePageId);
    },
    "pages.navigate": async p => {
      const id = p.pageId as string;
      const url = p.url as string;
      patch(id, { url, loading: true, title: hostTitle(url) });
      for (const l of loadingListeners) l({ pageId: id, loading: true });
      setTimeout(() => {
        patch(id, { loading: false, canGoBack: true });
        for (const l of loadingListeners) l({ pageId: id, loading: false });
      }, 1100);
      return page(id);
    },
    "pages.reload": async p => {
      const id = p.pageId as string;
      patch(id, { loading: true });
      setTimeout(() => patch(id, { loading: false }), 700);
      return page(id);
    },
    "pages.back": mockPagesBack,
    "pages.forward": mockPagesBack,
    "pages.stop": mockPagesBack,
    "pages.resume": async p => {
      patch(p.pageId as string, { controller: "agent" });
      emit("page.takeover", { pageId: p.pageId, controller: "agent" });
      runs.filter((r) => r.status === "paused").forEach((r) => patchRun(r.runId, { status: "running", statusMessage: "Resuming — re-observing the page" }, true));
      return page(p.pageId as string);
    },
    "pages.takeover": async p => {
      patch(p.pageId as string, { controller: "human" });
      emit("page.takeover", { pageId: p.pageId, controller: "human" });
      return page(p.pageId as string);
    },
    "pages.observe": async p => {
      return { observation: { ...OBSERVATION, pageId: p.pageId as string } };
    },
    "pages.find": async () => {
      return { matches: 7, activeMatch: 2 };
    },
    "pages.pickElement": async () => {
      return { picked: false };
    },
    "pages.stopFind": async () => {
      return { ok: true };
    },
    "bookmarks.add": async p => {
      bookmarks = [{ url: String(p.url), title: String(p.title) }, ...bookmarks.filter(item => item.url !== p.url)];
      emit("bookmarks.changed", { bookmarks }); return { ok: true };
    },
    "bookmarks.update": async p => {
      const previous=bookmarks.find(item=>item.url===p.originalUrl);
      if(!previous)throw new Error("This bookmark was removed.");
      if(p.url!==p.originalUrl&&bookmarks.some(item=>item.url===p.url))throw new Error("That address is already bookmarked. Both bookmarks have been kept.");
      bookmarks=bookmarks.map(item=>item===previous?{...item,url:String(p.url),title:String(p.title),folderPath:p.folderPath as string[]}:item);
      emit("bookmarks.changed",{bookmarks});return {ok:true};
    },
    "bookmarks.folders.create": async p => {
      const path = p.path as string[];
      for (let depth = 1; depth <= path.length; depth++) {
        const parent = path.slice(0, depth);
        if (!bookmarkFolders.some(folder => JSON.stringify(folder) === JSON.stringify(parent))) bookmarkFolders.push(parent);
      }
      emit("bookmarks.changed", {bookmarks}); return bookmarkFolders;
    },
    "bookmarks.move": async p => {
      const selected = p.bookmarks as {url:string;folderPath:string[]}[];
      const destination = p.folderPath as string[];
      for (const item of selected) {
        const current = bookmarks.find(bookmark => bookmark.url === item.url);
        if (!current || JSON.stringify(current.folderPath ?? []) !== JSON.stringify(item.folderPath)) throw new Error("A selected bookmark changed. Select it again; nothing was moved.");
      }
      if (p.createFolder) {
        if (!destination.length || bookmarkFolders.some(path => JSON.stringify(path) === JSON.stringify(destination))) throw new Error("A folder with this name already exists. Choose another name.");
        const parent = destination.slice(0, -1);
        if (parent.length && !bookmarkFolders.some(path => JSON.stringify(path) === JSON.stringify(parent))) throw new Error("The parent folder no longer exists. Choose another folder.");
        bookmarkFolders.push(destination);
      }
      if (destination.length && !bookmarkFolders.some(path => JSON.stringify(path) === JSON.stringify(destination))) throw new Error("The destination folder no longer exists.");
      const urls = new Set(selected.map(item => item.url)); let moved = 0;
      bookmarks = bookmarks.map(item => {
        if (!urls.has(item.url) || JSON.stringify(item.folderPath ?? []) === JSON.stringify(destination)) return item;
        moved++; return {...item, folderPath:destination};
      });
      emit("bookmarks.changed", {bookmarks}); return {moved};
    },
    "bookmarks.remove": async p => {
      bookmarks = bookmarks.filter(item => item.url !== p.url);
      emit("bookmarks.changed", { bookmarks }); return { ok: true };
    },
    "bookmarks.saveFolder": async p => {
      const name=String(p.name);
      if(bookmarkFolders.some(path=>path.length===1&&path[0]===name))throw new Error("A bookmark folder already has this name.");
      const incoming=p.bookmarks as {url:string;title:string}[];let added=0;
      if(incoming.every(item=>bookmarks.some(old=>old.url===item.url)))throw new Error("These pages are already bookmarked. Find them in Library to organize their folders.");
      bookmarkFolders.push([name]);
      for(const item of incoming)if(!bookmarks.some(old=>old.url===item.url)){bookmarks.push({...item,folderPath:[name]});added++;}
      emit("bookmarks.changed",{bookmarks});return {added,skipped:incoming.length-added};
    },
    "bookmarks.import": async p => {
      const incoming = p.bookmarks as { url: string; title: string }[];
      let added = 0;
      for (const item of incoming) if (!bookmarks.some(old => old.url === item.url)) { bookmarks.push(item); added++; }
      emit("bookmarks.changed", { bookmarks }); return { added, skipped: incoming.length - added };
    },
    "history.clear": async p => {
      const previous = history.length;
      history = history.filter(item => (p.since !== undefined && item.visitedAt < Number(p.since)) || (p.before !== undefined && item.visitedAt >= Number(p.before)));
      emit("history.changed", {}); return { ok: true, removed: previous - history.length };
    },
    "history.remove": async p => {
      const size = history.length;
      history = history.filter(item => item.url !== p.url || item.visitedAt !== p.visitedAt);
      emit("history.changed", {}); return { removed: history.length < size };
    },
    "pages.zoom": async p => {
      const id = String(p.pageId);
      const current = zoomLevels.get(id) ?? 0;
      const requested = p.reset ? 0 : p.direction === "in" || p.direction === "out" ? steppedZoomLevel(current, p.direction)
        : typeof p.level === "number" ? p.level : current + Number(p.delta ?? 0);
      const level = Math.max(Math.log(0.25) / Math.log(1.2), Math.min(Math.log(5) / Math.log(1.2), requested));
      zoomLevels.set(id, level); if (p.reset || p.direction || p.level !== undefined || p.delta !== undefined) for (const listener of zoomListeners) listener(); return { level };
    },
    "artifacts.read": async p => {
      return { artifact: { artifactId: p.artifactId, path: "", mediaType: "application/json", size: 0, status: "complete", createdAt: Date.now() }, dataBase64: btoa(unescape(encodeURIComponent(JSON.stringify(OBSERVATION)))) };
    },
    "runs.get": async p => {
      const run = runs.find((r) => r.runId === p.runId);
      if (!run) throw new Error("no such run");
      return { run, steps: steps[run.runId] ?? [], modelCalls: run.config?.modelCalls ?? 3 };
    },
    "runs.list": async p => {
      const key = (run: Run) => run.config?.chatId ?? run.runId;
      const query = String(p.query ?? "").trim().toLowerCase();
      const matches = new Set(runs.filter(run => `${run.goal} ${run.statusMessage ?? ""}`.toLowerCase().includes(query)).map(key));
      const seen = new Set<string>();
      const before = p.before as { createdAt: number; runId: string } | undefined;
      return [...runs].sort((a, b) => b.createdAt - a.createdAt || b.runId.localeCompare(a.runId)).filter(run => {
        if (p.groupByChat && seen.has(key(run))) return false;
        seen.add(key(run));
        return (!p.chatId || key(run) === p.chatId) && matches.has(key(run)) && (!before || run.createdAt < before.createdAt || (run.createdAt === before.createdAt && run.runId < before.runId));
      }).slice(0, Number(p.limit ?? 50));
    },
    "runs.start": async p => {
      const id = `run-${Math.random().toString(36).slice(2, 6)}`;
      const run: Run = { runId: id, goal: p.goal as string, status: "planning", pageIds: (p.pageIds as string[]) ?? [], createdAt: Date.now(), startedAt: Date.now(), statusMessage: "Observing the page" };
      runs = [run, ...runs];
      emit("run.status", { run }, id);
      steps[id] = [];
      void scriptRun(id);
      return run;
    },
    "runs.retry": async p => {
      const prior = runs.find((r) => r.runId === p.runId);
      if (!prior) throw new Error("no such run");
      const id = `run-${Math.random().toString(36).slice(2, 6)}`;
      const run: Run = { runId: id, goal: prior.goal, status: "planning", pageIds: prior.pageIds, config: { ...prior.config, chatId: prior.config?.chatId ?? prior.runId, retryOfRunId: prior.runId }, createdAt: Date.now(), startedAt: Date.now(), statusMessage: "Retrying the turn" };
      runs = [run, ...runs];
      emit("run.status", { run }, id);
      steps[id] = [];
      void scriptRun(id);
      return run;
    },
    "runs.pause": async p => {
      patchRun(p.runId as string, { status: "paused", statusMessage: "Paused" }, true);
      return runs.find((r) => r.runId === p.runId);
    },
    "runs.resume": async p => {
      patchRun(p.runId as string, { status: "running", statusMessage: "Resumed" }, true);
      return runs.find((r) => r.runId === p.runId);
    },
    "runs.cancel": async p => {
      patchRun(p.runId as string, { status: "cancelled", statusMessage: "Cancelled", endedAt: Date.now() }, true);
      return runs.find((r) => r.runId === p.runId);
    },
    "runs.answer": async p => {
      patchRun(p.runId as string, { status: "running", statusMessage: `Answer received — continuing` }, true);
      return runs.find((r) => r.runId === p.runId);
    },
    "sets.create": async () => {
      return SET;
    },
  } satisfies Partial<Record<MethodName, MockHandler>>;

  const invoke = async (method: string, params: unknown = {}): Promise<unknown> => {
    if (scenario === "disconnected") throw new Error("runtime not connected");
    await sleep(method.startsWith("pages.") ? 20 : 8);
    const handler = (handlers as Partial<Record<string, MockHandler>>)[method];
    if (!handler) throw new Error(`mock: ${method} not implemented`);
    return handler(params as Record<string, unknown>, method);
  };

  // a freshly started run plays out a short script so the rail can be watched live
  async function scriptRun(id: string) {
    const script = makeSteps(id, 5);
    const target = runs.find((r) => r.runId === id)?.pageIds[0] ?? "page-1";
    await sleep(700);
    patchRun(id, { status: "running", statusMessage: "Opening the files tab" }, true);
    if (pages.some((x) => x.pageId === target)) {
      patch(target, { controller: "agent" });
      emit("page.takeover", { pageId: target, controller: "agent" });
    }
    for (const st of script) {
      await sleep(900);
      emit("model.call", { runId: id, modelId: "alibaba/qwen3.8-27b", role: "planner", durationMs: 1200 + Math.round(Math.random() * 800), costUsd: 0.0031, inputTokens: 2100, outputTokens: 180 }, id);
      steps[id] = [...(steps[id] ?? []), { ...st, pageId: target, startedAt: Date.now() }];
      emit("step.finished", { step: steps[id]![steps[id]!.length - 1] }, id);
      emit("observation.new", { runId: id, observation: { ...OBSERVATION, pageId: target, revision: OBSERVATION.revision + steps[id]!.length } }, id);
      if (!runs.some((r) => r.runId === id && r.status === "running")) return;
    }
    await sleep(800);
    patchRun(id, { status: "completed", statusMessage: "Done — 2 threads still need changes", endedAt: Date.now(), result: { unresolved_accessibility_threads: 2, summary: "Focus ring on the tab strip and aria-selected on sidebar tabs are still open. Reduced-motion handling was accepted." } }, true);
    if (pages.some((x) => x.pageId === target)) {
      patch(target, { controller: "none" });
      emit("page.takeover", { pageId: target, controller: "none" });
    }
  }

  if (withRun && live && scenario === "run") {
    void (async () => {
      await sleep(2000);
      const more = makeSteps(RUN_ID, 9).slice(6);
      for (const st of more) {
        await sleep(2200);
        steps[RUN_ID] = [...(steps[RUN_ID] ?? []), st];
        emit("model.call", { runId: RUN_ID, modelId: "alibaba/qwen3.8-27b", role: "planner", durationMs: 1400, costUsd: 0.0029, inputTokens: 2400, outputTokens: 160 }, RUN_ID);
        emit("step.finished", { step: st }, RUN_ID);
      }
    })();
  }

  const bridge: AuxBridge = {
    browserProfiles:async()=>[],
    createBrowserProfile:async()=>{throw new Error("Profiles require the native browser.");},
    renameBrowserProfile:async()=>[],
    archiveBrowserProfile:async()=>[],
    deleteBrowserProfile:async()=>[],
    openBrowserProfile:async()=>false,
    openBrowserProfileUrl:async()=>false,
    defaultBrowser:async()=>({isDefault:false}),
    setDefaultBrowser:async()=>({isDefault:false}),
    autofill:async()=>0,
    vaultFill:async()=>false,
    vaultSave:async()=>({ok:false,updated:false}),
    vaultDismiss:async()=>false,
    vaultExport:async()=>null,
    vaultImport:async()=>null,
    onVaultOffer:()=>()=>{},
    privateMode: false,
    windowId: "main",
    platform: "darwin",
    setShortcutOverrides: async () => ({}),
    invoke: invoke as AuxBridge["invoke"],
    onEvent: (cb) => (eventListeners.add(cb), () => eventListeners.delete(cb)),
    onRuntimeStatus: () => () => {},
    onShortcut: () => () => {},
    onToolbarEdge: () => () => {},
    onSidebarEdge: () => () => {},
    quickAskShortcut: async enabled => ({enabled:!!enabled,registered:!!enabled,error:""}),
    quickAskMode: q.get("quickAsk") === "1",
    quickAsk: async action => action === "status" && q.get("quickAsk") === "1",
    onQuickAskState: () => () => {},
    onPageAction: () => () => {},
    retryDownload: async()=>{throw new Error("Download retry requires Aux desktop");},
    tabAudio:async()=>({}),
    setTabMuted:async()=>{throw new Error("Tab audio requires Aux desktop");},
    // Mock tab commands reuse the local page list — the real surface is the
    // main-owned catalog; visual dev only needs the pages themselves to move.
    tabCommand:async(command)=>{
      const p=command as {kind:string;pageId?:string;url?:string;background?:boolean;activate?:boolean;muted?:boolean;windowId?:string};
      await sleep(12);
      switch(command.kind){
        case"open":{
          const result=await invoke("pages.open",{url:p.url??"about:blank",background:p.background,activate:p.activate??!p.background}) as PageTarget;
          return{commandId:"",status:"applied" as const,catalogVersion:0,pageId:result.pageId};
        }
        case"close":await invoke("pages.close",{pageId:p.pageId});return{commandId:"",status:"applied" as const,catalogVersion:0,pageId:p.pageId};
        case"activate":await invoke("pages.activate",{pageId:p.pageId});emit("page.updated",{pageId:p.pageId,activePageId});return{commandId:"",status:"applied" as const,catalogVersion:0,pageId:p.pageId};
        case"navigate":await invoke("pages.navigate",{pageId:p.pageId,url:p.url});return{commandId:"",status:"applied" as const,catalogVersion:0,pageId:p.pageId};
        case"reload":await invoke("pages.reload",{pageId:p.pageId});return{commandId:"",status:"applied" as const,catalogVersion:0,pageId:p.pageId};
        case"move":return{commandId:"",status:"applied" as const,catalogVersion:0,pageId:p.pageId,windowId:p.windowId??"mock-window"};
        case"back":case"forward":case"stop":case"setMuted":case"reorder":return{commandId:"",status:"applied" as const,catalogVersion:0,pageId:p.pageId};
        default:return{commandId:"",status:"rejected" as const,catalogVersion:0,error:{code:"unknown",message:"Unknown mock command."}};
      }
    },
    bindTabSpace:async(_pageId,spaceId)=>{
      const space=spaces.find(item=>item.id===spaceId&&!item.archived);
      if(!space?.workspaceId)throw new Error("Choose an active Space.");
      return{spaceId,workspaceId:space.workspaceId};
    },
    migrateTabSpaces:async()=>({migrated:0}),
    tabsSnapshot:async()=>({version:1,tabs:pages.map(p=>({pageId:p.pageId,windowId:"main",url:p.url,title:p.title,favicon:p.favicon,loading:!!p.loading,muted:false,audible:false,canGoBack:!!p.canGoBack,canGoForward:!!p.canGoForward,popup:false,crashed:p.viewStatus==="crashed",runtimeOwned:p.ownedByRuntime,generation:0,createdAt:p.createdAt,lastActiveAt:p.lastActiveAt})),windows:[{windowId:"main",order:pages.map(p=>p.pageId),activePageId}]}),
    tabsSince:async()=>({kind:"snapshot" as const,snapshot:await bridge.tabsSnapshot()}),
    onTabsPatch:()=>()=>{},
    onTabsPlacement:()=>()=>{},
    onAudio:()=>()=>{},
    downloadFolder: async()=>({path:"~/Downloads",custom:false}),
    chooseDownloadFolder: async()=>{throw new Error("Download folders require Aux desktop");},
    downloadsSnapshot: async () => downloads.filter(item=>item.canCancel),
    controlDownload: async () => { throw new Error("No live download in this preview"); },
    onDownload: () => () => {},
    onLoading: (cb) => (loadingListeners.add(cb), () => loadingListeners.delete(cb)),
    setStage: async () => true,
    overlay: async () => true,
    windowDrag: () => {},
    sidebarGlass: async () => true,
    toolbarGlass: async () => true,
    toolbarTone: async () => "dark",
    toolbarOverlay: async () => true,
    trafficLights: async () => true,
    forwardPagePointer: () => {},
    onPageCursor: () => () => {},
    sidebarPeek: async () => true,
    focusShell: async () => {},
    preview: async () => null,
    watchPreview: async () => false,
    unwatchPreview: async () => true,
    onPreviewFrame: () => () => {},
    contextMenu: async () => true,
    openExternal: async () => true,
    registerCloudPreview:async()=>true,
    revealPath: async () => true,
    openPath: async () => "",
    saveFile: async () => null,
    saveWorkbook: async () => null,
    saveCloudExport:async()=>null,
    saveStoredArtifact:async()=>null,
    savePagePdf: async () => { throw new Error("PDF export requires the desktop browser"); },
    printPage: async () => true,
    devTools: async () => true,
    readArticle:async()=>{
      if(scenario!=="reader")throw new Error("No article is available in this preview");
      return {title:"A calmer way to browse",byline:"Aux design notes",site:"example.com",url:"https://example.com/article",minutes:4,
        content:{tag:"div",children:[
          {tag:"p",children:["A good browser gives the page room to breathe. Reading should feel calm, with deliberate spacing and typography."]},
          {tag:"h2",sourceId:"keep-reading",children:["Keep the article in view"]},
          {tag:"p",children:["Search should help you find a detail without losing the article or your place. A calm interface keeps the controls close and the text clear."]},
          ...Array.from({length:8},(_,index)=>({tag:"p",children:[`Section ${index+1}. Familiar keyboard controls, readable line lengths, and stable layouts make long articles easier to explore. The browser should preserve your place as you move between reading and research.`]})),
          {tag:"h2",sourceId:"continue-reading",children:["Continue without losing your place"]},
          {tag:"p",children:["The result is a calm reading experience that carries your work forward. ",{tag:"a",href:"https://example.com/article#keep-reading",children:["Return to the first section"]}]},
        ]}};
    },
    navigationMenu: async()=>false,
    hardReload: async () => true,
    windows: async () => [],
    closeWindow: async () => true,
    openFile: async () => null,
    selectRepository: async () => null,
    createProject: async () => { throw new Error("Local projects require Aux desktop"); },
    createBlankProject: async () => { throw new Error("Local projects require Aux desktop"); },
    checkLocalPreview: async () => {throw new Error('Preview checks require Aux desktop');},
    projectFileHistory: async () => {throw new Error('File recovery requires Aux desktop');},
    readProjectFileVersion: async () => {throw new Error('File recovery requires Aux desktop');},
    listProjectFiles: async () => [],
    createProjectFile: async () => {throw new Error("File creation requires Aux desktop");},
    readProjectFile: async () => {throw new Error('File editing requires Aux desktop');},
    saveProjectFile: async () => {throw new Error('File editing requires Aux desktop');},
    renameProjectFile: async () => {throw new Error('File editing requires Aux desktop');},
    deleteProjectFile: async () => {throw new Error('File editing requires Aux desktop');},
    openProjectFileExternal: async () => {throw new Error('External editing requires Aux desktop');},
    prepareProjectReview: async () => {throw new Error('Project review requires Aux desktop');},
    commitProject: async () => {throw new Error('Local commits require Aux desktop');},
    listProjectCommands: async () => [],
    runProjectCommand: async () => { throw new Error("Local commands require Aux desktop"); },
    stopProjectCommand: async () => { throw new Error("Local commands require Aux desktop"); },
    runProjectServiceStack: async () => { throw new Error("Local service stacks require Aux desktop"); },
    stopProjectServiceStack: async () => { throw new Error("Local service stacks require Aux desktop"); },
    listProjects: async () => [],
    inspectProject: async () => { throw new Error("Local projects require Aux desktop"); },
    pickEvidenceImage: async () => {
      const canvas = document.createElement("canvas"); canvas.width = 800; canvas.height = 500;
      const ctx = canvas.getContext("2d")!; ctx.fillStyle = "#dbe7fa"; ctx.fillRect(0, 0, 800, 500);
      ctx.fillStyle = "#25334c"; ctx.font = "30px system-ui"; ctx.fillText("Sample local image", 70, 110);
      ctx.fillStyle = "#6394e0"; ctx.fillRect(70, 180, 660, 230);
      return { filename: "sample-image.png", dataUrl: canvas.toDataURL("image/png") };
    },
    pickEvidenceDocument: async () => ({filename:"project-brief.md",content:"# Project brief\n\nUse a calm cobalt accent and keep browser controls minimal.\n\n"+"Reference notes for the attached project.\n".repeat(180)}),
    agentConfig: async input => ({ command: "/Applications/Aux.app/Contents/MacOS/Aux", args: ["/mock/aux-mcp.mjs"], env: { ELECTRON_RUN_AS_NODE: "1", AUX_DATA_DIR: "/mock/aux", AUX_MCP_TOKEN:"auxc_mock" }, connection:{connectionId:"11111111-1111-4111-8111-111111111111",name:input.name,client:input.client,scope:input.scope,createdAt:Date.now()} }),
    agentConnections:async()=>[],
    agentClients:async()=>[{client:'codex',installed:true,version:'codex-cli mock'},{client:'claude',installed:false}],
    revokeAgentConnection:async connectionId=>({connectionId,name:"Revoked",client:"codex",scope:{kind:"workspace",workspaceId:"mock"},createdAt:Date.now(),revokedAt:Date.now()}),
    dictationStatus:async()=>({available:q.get("dictation")==="fixture",reason:"Live dictation requires the Aux macOS app."}),
    startDictation:async sessionId=>{
      if(q.get("dictation")!=="fixture")return false;
      dictationEvent({sessionId,type:"recording"});
      dictationEvent({sessionId,type:"transcript",text:"Compare these pages and summarize the differences."});return true;
    },
    stopDictation:async sessionId=>{dictationEvent({sessionId,type:"final",text:"Compare these pages and summarize the differences."});return true;},
    cancelDictation:async()=>{},
    onDictation:callback=>{dictationListeners.add(callback);return()=>{dictationListeners.delete(callback);};},
    extensions:async()=>extensions,
    installUnpackedExtension:async()=>null,
    updateUnpackedExtension:async key=>{
      const current=extensions.find(item=>item.key===key);if(!current)return null;
      const updated={...current,version:"2.0.0"};extensions=extensions.map(item=>item.key===key?updated:item);return updated;
    },
    setExtensionEnabled:async()=>{throw new Error("No mock extension");},
    removeExtension:async()=>false,
    dataDir: async () => "/Users/you/Library/Application Support/Aux Browser",
    exportDiagnostics:async()=>null,
    exportRuntimeBackup:async()=>null,
    stageRuntimeRestore:async()=>null,
    cancelRuntimeRestore:async()=>({cancelled:true}),
    runtimeRestoreStatus:async()=>({pending:false}),
    healthSummary:async()=>({recordingSince:Date.now()-86_400_000,latestAt:Date.now(),samples:1440,sessions:3,observedMinutes:520,spanDays:1,sevenDaySpan:false,startupMs:820,cpuPercent:{p50:1.8,p95:14.2,max:35.1},memoryMb:{p50:410,p95:612,max:680},eventLoopLagMs:{p50:2,p95:18,max:90},maxWindows:2,maxPages:12,maxSuspendedPages:7,pageCrashes:0,pageUnresponsive:0,suspensionFailures:0}),
    clearHealth:async()=>({samples:0,sessions:0,observedMinutes:0,spanDays:0,sevenDaySpan:false,cpuPercent:{p50:0,p95:0,max:0},memoryMb:{p50:0,p95:0,max:0},eventLoopLagMs:{p50:0,p95:0,max:0},maxWindows:0,maxPages:0,maxSuspendedPages:0,pageCrashes:0,pageUnresponsive:0,suspensionFailures:0}),
    httpAuthRequests: async()=>[],
    respondHttpAuth: async()=>false,
    onHttpAuthChanged: ()=>()=>{},
    clearSiteData: async () => { throw new Error("Website data controls require the desktop browser."); },
    siteInfo: async (pageId: string) => ({pageId,url:"https://example.com/",origin:"https://example.com",title:"Example",security:"secure" as const,cookieCount:2,permissions:{notifications:"deny" as const},trackersAllowed:false}),
    onSiteZoomChanged: cb => { zoomListeners.add(cb); return () => { zoomListeners.delete(cb); }; },
    siteZoom: async origin => {
      const sizes = new Map<string, number>();
      for (const [pageId, level] of zoomLevels) {
        const page = pages.find(page => page.pageId === pageId);
        if (!page || !/^https?:/.test(page.url)) continue;
        const site = new URL(page.url).origin;
        if (origin === site) zoomLevels.delete(pageId);
        else if (level) sizes.set(site, Math.round(100 * 1.2 ** level));
      }
      if (origin) for (const listener of zoomListeners) listener();
      return [...sizes].map(([origin, percentage]) => ({origin, percentage}));
    },
    sitePermissions: async () => ({}),
    clearSitePermission: async () => true,
    privacy: async () => ({ trackerBlock: true, blocked: 0, allowedHosts: [], httpsUpgrade: true }),
    setTrackerBlock: async () => ({ trackerBlock: true, blocked: 0 }),
    setSiteTrackers: async () => { throw new Error("Site controls require the desktop browser."); },
    removeAllowedHost: async () => [],
    filterLists: async () => ({ sources: [], hosts: 0, builtinHosts: 0 }),
    updateFilters: async () => ({ sources: [], hosts: 0, builtinHosts: 0 }),
    addFilterSource: async () => [],
    removeFilterSource: async () => [],
    proceedInsecure: async () => true,
    useHttp: async () => true,
    setHttpsUpgrade: async () => true,
    translatePage: async () => { throw new Error("Translation is unavailable in the preview."); },
    showOriginal: async () => 0,
    onTranslationChanged: () => () => {},
    setAppearance: async () => true,
  };
  (window as unknown as { aux: AuxBridge; __auxMock: boolean }).aux = bridge;
  (window as unknown as { __auxMock: boolean }).__auxMock = true;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const hostTitle = (url: string) => {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "") + (u.pathname !== "/" ? ` — ${decodeURIComponent(u.pathname).slice(1, 40)}` : "");
  } catch {
    return url;
  }
};
