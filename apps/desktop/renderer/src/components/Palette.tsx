import { conversationDraftEntries } from "../conversation-drafts";
import type { PreparedConversation, SavedResult, ConversationSummary, HistoryEntry, Task } from "@aux/contracts";
import { openSavedTask } from "../task-navigation";
import { savePagePdf, printCurrentPage } from "../page-export";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useStore, call, toast, errToast, tabCommand } from "../store";
import { bridge } from "../bridge";
import { detectIntent } from "../intent";
import { canSplitPage, hostOf } from "../workspace";
import { FavIcon } from "./SiteTile";
import { I } from "./icons";
import { openLocalFile } from "../open-local-file";

interface Cmd {
  id: string;
  section: "go" | "tabs" | "agent" | "window" | "chrome" | "sets" | "bookmarks" | "spaces" | "chats" | "tasks" | "history" | "memory" | "results";
  k?: string;
  t: string;
  d?: string;
  icon?: React.ReactNode;
  aliases?: string[];
  /** keep the palette open (two-level pickers manage their own close) */
  keep?: boolean;
  run: () => unknown | Promise<unknown>;
}

interface ChromeTab { targetId?: string; id?: string; url: string; title?: string }

const SECTION: Record<Cmd["section"], string> = {
  go: "",
  tabs: "Tabs",
  agent: "Agent",
  window: "Window",
  chrome: "Chrome",
  sets: "Sets",
  bookmarks: "Bookmarks",
  spaces: "Spaces",
  chats:"Chats", tasks:"Tasks", history:"History", memory:"Saved notes", results:"Saved results",
};

/** ⌘K — commands, tabs, sets, bookmarks, and the same intent routing as the command bar. */
export function Palette() {
  const setOverlay = useStore((s) => s.setOverlay);
  const setMode = useStore((s) => s.setMode);
  const pages = useStore((s) => s.pages);
  const sets = useStore((s) => s.sets);
  const bookmarks = useStore((s) => s.bookmarks);
  const sessions = useStore((s) => s.sessions);
  const closedTabs = useStore((s) => s.closedTabs);
  const activePageId = useStore((s) => s.activePageId);
  const splitPageId = useStore((s) => s.splitPageId);
  const railOpen = useStore((s) => s.railOpen);
  const layout = useStore((s) => s.layout);
  const settings = useStore((s) => s.settings);
  const drafts = useStore(s => s.conversationDrafts);
  const runs = useStore(s => s.runs);
  const refreshResults = useStore((s) => s.refreshResults);
  const startRun = useStore((s) => s.startRun);
  const newTab = useStore((s) => s.newTab);
  const activate = useStore((s) => s.activate);
  const [q, setQ] = useState(() => {
    const seed = useStore.getState().paletteSeed;
    if (seed) useStore.setState({ paletteSeed: "" });
    return seed;
  });
  const [sel, setSel] = useState(0);
  const [filter,setFilter]=useState<"all"|"tabs"|"work"|"pages">("all");
  const [searching,setSearching]=useState(false);
  const [searchError,setSearchError]=useState(false);
  const [searchRefresh,setSearchRefresh]=useState(0);
  const [matches,setMatches]=useState<{query:string;prepared:PreparedConversation[];results:SavedResult[];chats:ConversationSummary[];tasks:Task[];history:HistoryEntry[];memory:{workspaceId:string;name:string;excerpt:string;enabled:boolean}[]}>({query:"",prepared:[],results:[],chats:[],tasks:[],history:[],memory:[]});
  const [chromeTabs, setChromeTabs] = useState<ChromeTab[] | null>(null);
  const [splitPick, setSplitPick] = useState(false);
  const [vaultItems, setVaultItems] = useState<import("@aux/contracts").VaultItem[] | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<Element | null>(document.activeElement);
  const close = () => {
    setOverlay(null);
    (restoreFocus.current as HTMLElement | null)?.focus?.();
  };
  const chromeConnected = sessions.some((s) => s.backend === "chrome" && s.status === "connected");
  const activePage = pages.find((p) => p.pageId === activePageId);
  const lastClosed = closedTabs[closedTabs.length - 1];
  const hasPage = !!activePage && activePage.url !== "about:blank";

  const exec = (c: Cmd) => {
    if (!c.keep) close();
    void Promise.resolve().then(c.run).catch(errToast);
  };

  useEffect(()=>{
    const query=q.trim();
    if(query.length<2||query.startsWith("/")||query.startsWith("@")||chromeTabs||vaultItems||splitPick||filter==="tabs") {setSearching(false);setSearchError(false);return;}
    let live=true;setSearching(true);setSearchError(false);
    const timer=window.setTimeout(()=>{
      const work=!bridge.privateMode&&filter!=="pages",history=filter!=="work";
      void Promise.allSettled([
        work?call<ConversationSummary[]>("conversations.list",{query,limit:12,archived:false}):Promise.resolve([]),
        work?call<Task[]>("tasks.list",{query,limit:12}):Promise.resolve([]),
        history?call<HistoryEntry[]>("history.list",{query,limit:20}):Promise.resolve([]),
        work?call<{workspaceId:string;name:string;excerpt:string;enabled:boolean}[]>("workspaces.memory.search",{query}):Promise.resolve([]),
        work?call<SavedResult[]>("results.search",{query,limit:12}):Promise.resolve([]),
        work?call<PreparedConversation[]>("conversations.prepared",{}):Promise.resolve([]),
      ]).then(([chats,tasks,history,memory,results,prepared])=>{
        if(!live)return;
        setMatches({query,prepared:prepared.status==="fulfilled"?prepared.value:[],results:results.status==="fulfilled"?results.value:[],chats:chats.status==="fulfilled"?chats.value:[],tasks:tasks.status==="fulfilled"?tasks.value:[],history:history.status==="fulfilled"?history.value:[],memory:memory.status==="fulfilled"?memory.value.slice(0,8):[]});
        setSearchError([chats,tasks,history,memory,results,prepared].some(result=>result.status==="rejected"));setSearching(false);
      });
    },160);
    return()=>{live=false;window.clearTimeout(timer);};
  },[q,filter,chromeTabs,splitPick,searchRefresh]);

  const cmds = useMemo<Cmd[]>(() => {
    const out: Cmd[] = [];
    const v = q.trim();
    const commandOnly = v.startsWith("/");
    const tabOnly = v.startsWith("@");
    const term = commandOnly || tabOnly ? v.slice(1).trim() : v;
    const match = (s: string) => !term || s.toLocaleLowerCase().includes(term.toLocaleLowerCase());
    const tabDescription = (pageId: string, url: string) => {
      const spaceId = layout.tabSpace[pageId];
      const space = [...layout.spaces, ...(layout.archivedSpaces ?? [])].find(space => space.id === spaceId);
      const folder = layout.folders.find(folder => folder.id === layout.tabFolder[pageId]);
      return [space?.name, folder?.name, hostOf(url)].filter(Boolean).join(" · ");
    };
    const matchingTabs = pages.filter(page => !page.ownedByRuntime && page.viewStatus !== "detached"
      && match(`${page.title} ${page.url} ${tabDescription(page.pageId, page.url)}`))
      .sort((a,b) => Number(layout.tabSpace[b.pageId] === layout.activeSpaceId) - Number(layout.tabSpace[a.pageId] === layout.activeSpaceId));
    if (tabOnly || (filter === "tabs" && !commandOnly && !chromeTabs && !splitPick)) return matchingTabs.map(page => ({
      id: `tab-${page.pageId}`, section: "tabs" as const, icon: <FavIcon url={page.url} src={page.favicon} size="sm" />,
      t: page.title || (page.url === "about:blank" ? "New Tab" : hostOf(page.url)),
      d: `${tabDescription(page.pageId, page.url)}${page.pageId === activePageId ? " · Current" : ""}`,
      run: () => activate(page.pageId),
    }));

    if (chromeTabs) {
      for (const t of chromeTabs) {
        if (!match(`${t.title ?? ""} ${t.url}`)) continue;
        const id = t.targetId ?? t.id;
        if (!id) continue;
        out.push({ id: `ct-${id}`, section: "chrome", t: t.title || t.url, d: hostOf(t.url), icon: I.chromeSm, run: () => call("pages.open", { backend: "chrome", targetId: id, activate: true }) });
      }
      if (out.length === 0) out.push({ id: "none", section: "chrome", t: "No attachable Chrome tabs", run: () => setChromeTabs(null) });
      return out;
    }
    if (vaultItems) {
      for (const item of vaultItems) {
        if (!match(`${item.label} ${item.username ?? ""}`)) continue;
        out.push({ id: `vf-${item.itemId}`, section: "window", t: item.username ? `${item.label} — ${item.username}` : item.label, d: item.origin, icon: I.lock, run: async () => { if (activePageId) await bridge.vaultFill(activePageId, item.itemId); } });
      }
      if (out.length === 0) out.push({ id: "none", section: "window", t: "No vault credentials for this site", run: () => setVaultItems(null) });
      return out;
    }
    if (splitPick) {
      for (const p of pages) {
        if (p.pageId === activePageId || !canSplitPage(p) || !canSplitPage(activePage) || layout.tabSpace[p.pageId] !== layout.activeSpaceId || !match(`${p.title} ${p.url}`)) continue;
        out.push({ id: `sp-${p.pageId}`, section: "tabs", icon: <FavIcon url={p.url} src={p.favicon} size="sm" />, t: p.title || p.url, d: hostOf(p.url), run: () => useStore.getState().setSplitPage(p.pageId) });
      }
      if (out.length === 0) out.push({ id: "none", section: "tabs", t: "No other available browser pages in this Space", run: () => setSplitPick(false) });
      return out;
    }

    if (v) {
      const intent = detectIntent(v, { hasPage, searchEngine: settings.searchEngine as string | undefined });
      if (intent.kind === "navigate" || intent.kind === "search") {
        out.push({
          id: "go",
          section: "go",
          icon: intent.kind === "navigate" ? I.open : I.search,
          t: intent.kind === "navigate" ? `Open ${intent.display}` : `Search for “${intent.query}”`,
          k: "↵",
          run: async () => {
            if (activePage) await useStore.getState().navigatePage(activePage.pageId, intent.url);
            else await newTab(intent.url);
          },
        });
      }
      if (intent.kind !== "command" && intent.kind !== "empty") {
        const goal = intent.kind === "run" ? intent.goal : v;
        out.push({ id: "ask", section: "go", icon: I.agentSm, t: `Ask Aux: “${goal}”`, d: hasPage ? `on ${hostOf(activePage!.url)}` : "in a new tab", k: intent.kind === "run" ? "↵" : undefined, run: () => startRun(goal) });
      }
      // switch to an open tab
      for (const p of commandOnly ? [] : matchingTabs.filter(page => page.pageId !== activePageId).slice(0, 8)) {
        out.push({ id: `tab-${p.pageId}`, section: "tabs", icon: <FavIcon url={p.url} src={p.favicon} size="sm" />, t: p.title || hostOf(p.url), d: tabDescription(p.pageId, p.url), run: () => activate(p.pageId) });
      }
    }

    const w: Cmd[] = [
      { id: "tabs", section: "window", t: "Search open tabs", aliases: ["tabs", "switch tab"], d: "Across Spaces · type @", icon: I.search, keep: true, run: () => setQ("@") },
      { id: "new", section: "window", t: "New tab", k: "⌘T", icon: I.plusSm, run: () => newTab() },
      ...(lastClosed ? [{ id: "reopen", section: "window" as const, t: `Reopen closed tab — ${lastClosed.title || lastClosed.url}`, k: "⌘⇧T", icon: I.reopen, run: async () => { await useStore.getState().reopenClosedTab(); } }] : []),
      { id: "ov", section: "window", t: "Tab overview", k: "⌘⇧O", icon: I.grid, run: async () => setMode("overview") },
      { id: "rail", section: "agent", t: railOpen ? "Hide agent rail" : "Show agent rail", k: "⌘⇧A", icon: I.agentSm, run: () => useStore.getState().toggleRail() },
      { id: "obs", section: "agent", t: "Inspect what the agent sees", d: "observe the active page", icon: I.obs, run: async () => { useStore.setState({ inspectorObs: null }); setOverlay("observe"); } },
      { id: "collect", section: "agent", t: "Collect open tabs into a set", d: "map a task over every tab", icon: I.layersSm, run: async () => {
        const ids = pages.filter((p) => !p.ownedByRuntime).map((p) => p.pageId);
        if (!ids.length) return toast("No open tabs to collect", "error");
        await call("sets.create", { name: `Tabs ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`, source: "tabs", pageIds: ids });
        toast(`Set created from ${ids.length} tabs`);
      } },
      { id: "reload", section: "window", t: "Reload page", k: "⌘R", icon: I.reloadSm, run: async () => { if (activePageId) await tabCommand({ kind: "reload", pageId: activePageId }); } },
      { id: "reader", section: "window", t: "Reader view", d: "Read this page with fewer distractions", k: "⌥⌘R", icon: I.result, run: () => setOverlay("reader") },
      { id: "hard", section: "window", t: "Hard reload", k: "⇧⌘R", icon: I.reloadSm, run: async () => { if (activePageId) await bridge.hardReload(activePageId); } },
      { id: "find", section: "window", t: "Find in page", k: "⌘F", icon: I.findSm, run: async () => setOverlay("find") },
      { id: "sb", section: "window", t: "Toggle sidebar", k: "⌘S", icon: I.sidebarSm, run: async () => useStore.getState().toggleSidebar() },
      { id: "hide-sb", section: "window", t: useStore.getState().sidebar === "hidden" ? "Show sidebar" : "Hide sidebar completely", icon: I.sidebarCloseSm, run: async () => useStore.getState().setSidebar(useStore.getState().sidebar === "hidden" ? "expanded" : "hidden") },
      { id: "bm", section: "window", t: activePage && bookmarks.some((b) => b.url === activePage.url) ? "Remove bookmark" : "Bookmark this page", k: "⌘D", icon: I.bookmarkSm, run: async () => {
        if (!activePage || !activePage.url.startsWith("http")) return;
        await useStore.getState().toggleBookmark(activePage.url, activePage.title);
      } },
      { id: "rl", section: "window", t: activePage && bookmarks.some((b) => b.url === activePage.url && b.readingList) ? "Remove from reading list" : "Read later", d: "Save this page to your reading list", icon: I.clockSm, run: async () => {
        if (!activePage || !activePage.url.startsWith("http")) return;
        await useStore.getState().toggleReadingList(activePage.url, activePage.title);
      } },
      ...(activePage?.backend === "aux" && !bridge.privateMode ? [{ id: "autofill", section: "window" as const, t: "Fill personal info", d: "Fill this form with your saved contact and address details", icon: I.person, run: async () => {
        if (!activePage) return;
        await bridge.autofill(activePage.pageId);
      } }] : []),
      ...(activePage?.backend === "aux" ? [
        { id: "translate", section: "window" as const, t: "Translate this page", d: "Sends visible page text to your model provider", icon: I.globe, run: async () => {
          if (!activePage || !activePage.url.startsWith("http")) return;
          useStore.getState().setTranslationPending(activePage.pageId);
          try { await bridge.translatePage(activePage.pageId); }
          finally { if (useStore.getState().translationPending === activePage.pageId) useStore.getState().setTranslationPending(null); }
        } },
        ...(useStore.getState().translation?.pageId === activePage.pageId ? [{ id: "translate-original", section: "window" as const, t: "Show original page", d: "Restore the untranslated text", icon: I.reopen, run: async () => {
          if (!activePage) return;
          await bridge.showOriginal(activePage.pageId);
        } }] : []),
      ] : []),
      ...(activePage?.backend === "aux" && !bridge.privateMode ? [{ id: "vault-fill", section: "window" as const, t: "Fill sign-in…", d: "Fill this login form with a vault credential", icon: I.lock, keep: true, run: async () => {
        if (!activePage || !activePage.url.startsWith("http")) return;
        let origin: string;
        try { origin = new URL(activePage.url).origin; } catch { return; }
        setVaultItems(await call<import("@aux/contracts").VaultItem[]>("vault.itemsForOrigin", { origin }));
        setQ("");
      } }] : []),
      { id: "pin", section: "window", t: "Pin this site to the space", icon: I.pin, run: async () => { if (activePage && activePage.url.startsWith("http")) useStore.getState().togglePin({ url: activePage.url, title: activePage.title || hostOf(activePage.url) }); } },
      ...(canSplitPage(activePage) ? [{ id: "split", section: "window" as const, t: "Split view with page…", d: "two pages side by side", icon: I.split, keep: true, run: async () => { setSplitPick(true); setQ(""); } }] : []),
      ...(splitPageId ? [{ id: "unsplit", section: "window" as const, t: "Close split view", icon: I.split, run: () => useStore.getState().setSplitPage(null) }] : []),
      { id: "open", section: "window", t: "Open file…", k: "⌘O", icon: I.folder, run: openLocalFile },
      ...(activePage?.backend === "aux" ? [{ id: "pdf", section: "window" as const, t: "Save page as PDF…", k: "⌘⇧P", icon: I.downloadSm, run: async () => savePagePdf(activePageId) }] : []),
      { id: "print", section: "window", t: "Print…", k: "⌘P", icon: I.print, run: async () => printCurrentPage(activePageId) },
      { id: "dev", section: "window", t: "Developer tools", k: "⌥⌘I", icon: I.code, run: async () => { if (activePageId) await bridge.devTools(activePageId); } },
      { id: "settings", section: "window", t: "Settings", k: "⌘,", icon: I.gear, run: async () => setOverlay("settings") },
      { id: "bookmarks", section: "window", t: "Bookmarks and history", icon: I.bookmark, run: async () => setOverlay("bookmarks") },
      { id: "history", section: "window", t: "History", k: "⌘Y", icon: I.clockSm, run: async () => setOverlay("history") },
      { id: "downloads", section: "window", t: "Downloads", k: "⌘⇧J", icon: I.downloadSm, run: async () => setOverlay("downloads") },
      { id: "attach", section: "chrome", t: "Attach Chrome", d: "your signed-in Chrome, port 9222", icon: I.chromeSm, run: async () => { await call("chrome.attach", { port: 9222 }); toast("Chrome attached"); } },
      ...(chromeConnected ? [{ id: "borrow", section: "chrome" as const, t: "Add a Chrome tab…", d: "borrow a tab from your Chrome", icon: I.chromeSm, keep: true, run: async () => { setChromeTabs((await call("chrome.tabs")) as ChromeTab[]); setQ(""); } }] : []),
      { id: "detach", section: "chrome", t: "Detach Chrome", icon: I.unplug, run: async () => { await call("chrome.detach"); toast("Chrome detached"); } },
      { id: "cookies", section: "chrome", t: "Import cookies from Chrome", d: chromeConnected ? "via attached Chrome" : "from your Chrome profile", icon: I.cookie, run: async () => {
        const r = await call<{ imported: number; domains: number }>("chrome.importCookies", { source: "auto" });
        toast(`${r.imported} cookies imported from ${r.domains} domains`);
      } },
      ...(activePage?.backend === "chrome" ? [{ id: "live", section: "chrome" as const, t: "Open live in Chrome", icon: I.external, run: async () => { await call("pages.openLive", { pageId: activePage.pageId }); } }] : []),
    ];
    for (const s of layout.spaces) {
      if (s.id !== layout.activeSpaceId) w.push({ id: `space-${s.id}`, section: "spaces", t: `Switch to ${s.name}`, icon: <span className="space-dot" data-space={s.color} />, run: () => useStore.getState().switchSpace(s.id) });
    }
    w.push({ id: "space-new", section: "spaces", t: "New space", icon: I.plusSm, run: () => useStore.getState().addSpace(`Space ${layout.spaces.length + 1}`) });
    for (const s of sets) w.push({ id: `set-${s.setId}`, section: "sets", t: s.name, d: `${s.memberIds.length} members`, icon: I.layersSm, run: async () => { await refreshResults(s.setId); setMode("table"); } });
    for (const b of commandOnly ? [] : term ? bookmarks : bookmarks.slice(0, 30)) w.push({ id: `bm-${b.url}`, section: "bookmarks", t: b.title || b.url, d: hostOf(b.url), icon: <FavIcon url={b.url} size="sm" />, run: () => newTab(b.url) });

    const saved:Cmd[]=[];
    if(!commandOnly&&matches.query===term&&term.length>=2){
      const taskIds=new Set(matches.tasks.map(task=>task.taskId));
      for(const chat of matches.chats){
        if(chat.taskId&&taskIds.has(chat.taskId))continue;
        saved.push({id:`chat-${chat.chatId}`,section:"chats",t:chat.title,d:chat.latestRun.statusMessage||`${chat.turnCount} turns`,icon:I.chats,run:()=>{
          useStore.setState(state=>({runs:state.runs.some(run=>run.runId===chat.latestRun.runId)?state.runs:[chat.latestRun,...state.runs]}));
          useStore.getState().openConversation(chat.latestRun.runId);
        }});
      }
      for(const task of matches.tasks)saved.push({id:`task-${task.taskId}`,section:"tasks",t:task.title,d:task.objective,icon:I.layersSm,run:()=>openSavedTask(task.taskId)});
      for (const result of matches.results) saved.push({id:`result-${result.artifactId}`,section:"results",t:result.filename,d:`${result.conversationTitle} · ${Math.max(1,Math.ceil(result.byteLength/1024))} KB`,icon:I.result,run:()=>{useStore.getState().openConversationDraft(result.chatId);useStore.setState({resultPreview:result.artifactId});}});
      const seen=new Set([...(filter==="pages"?[]:matchingTabs.map(page=>page.url)),...bookmarks.filter(page=>match(`${page.title} ${hostOf(page.url)}`)).map(page=>page.url)]);
      for(const visit of matches.history){if(seen.has(visit.url)||!/^https?:\/\//i.test(visit.url))continue;seen.add(visit.url);saved.push({id:`history-${visit.url}`,section:"history",t:visit.title||hostOf(visit.url),d:hostOf(visit.url),icon:I.clockSm,run:()=>newTab(visit.url)});}
      for(const note of matches.memory.filter(note=>[...layout.spaces,...(layout.archivedSpaces??[])].some(space=>space.workspaceId===note.workspaceId)))saved.push({id:`memory-${note.workspaceId}`,section:"memory",t:note.name,d:`${note.enabled?"":"Paused · "}${note.excerpt||"Space notes"}`,icon:I.result,run:()=>{useStore.setState({settingsCategory:"Memory",memoryWorkspaceId:note.workspaceId});setOverlay("settings");}});
    }
    if (!bridge.privateMode && !commandOnly && !tabOnly && term.length >= 2 && filter !== "pages" && filter !== "tabs") {
      const entries = conversationDraftEntries(drafts, runs, matches.query === term ? matches.prepared : []);
      for (const draft of entries.filter(item => match(`${item.title} ${item.text}`))) {
        const existing = saved.find(item => item.id === `chat-${draft.id}`);
        if (existing) { existing.d = `Draft · ${draft.text || `${draft.count} saved attachments`}`; continue; }
        saved.push({id:`draft-${draft.key}`,section:"chats",t:draft.title,
          d:`Unsent draft${draft.count ? ` · ${draft.count} saved ${draft.count === 1 ? "attachment" : "attachments"}` : ""}`,
          icon:I.pencil,run:()=>useStore.getState().openConversationDraft(draft.id)});
      }
    }
    const ORDER: Cmd["section"][] = ["go", "tabs", "agent", "window", "spaces", "sets", "chrome", "bookmarks"];
    const rest = (v ? w.filter((c) => match(`${c.t} ${c.d ?? ""} ${c.aliases?.join(" ") ?? ""}`)) : w).sort((a, b) => ORDER.indexOf(a.section) - ORDER.indexOf(b.section));
    const exact = rest.filter(c => [c.t.replace(/[…]+$/g, ""), ...(c.aliases ?? [])].some(label => label.toLocaleLowerCase() === term.toLocaleLowerCase()));
    const combined=[...exact,...out,...saved,...rest.filter(c=>!exact.includes(c))];
    return combined.filter(command=>filter==="all"||commandOnly||(filter==="tabs"?command.section==="tabs":filter==="work"?["chats","tasks","memory","results"].includes(command.section):["bookmarks","history"].includes(command.section)));
  }, [q, filter, matches, drafts, runs, pages, sets, bookmarks, activePageId, splitPageId, railOpen, chromeConnected, chromeTabs, vaultItems, splitPick, activePage, lastClosed, layout, hasPage, settings.searchEngine, setMode, setOverlay, refreshResults, startRun, newTab, activate]);

  useEffect(() => setSel(0), [q, filter, chromeTabs, vaultItems, splitPick]);
  const previousCommands=useRef<string[]>([]);
  useLayoutEffect(()=>{
    const previous=previousCommands.current;previousCommands.current=cmds.map(command=>command.id);
    setSel(index=>{const next=cmds.findIndex(command=>command.id===previous[index]);return Math.max(0,Math.min(next>=0?next:index,cmds.length-1,39));});
  },[cmds]);
  useEffect(() => {
    listRef.current?.querySelectorAll<HTMLElement>("[role=option]")[sel]?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const back = () => {
    if (chromeTabs) return setChromeTabs(null);
    if (vaultItems) return setVaultItems(null);
    if (splitPick) return setSplitPick(false);
    if (q.trim().startsWith("@")) return setQ("");
    close();
  };
  const shown = cmds.slice(0, 40);

  return (
    <div className="overlay-scrim fade-in" onMouseDown={close}>
      <div className="palette pop-in" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(e) => e.stopPropagation()} onKeyDown={event => {
        if (event.key !== "Tab") return;
        const controls = [...event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled),input:not(:disabled)")];
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}>
        <div className="palette-field">
          {chromeTabs || vaultItems || splitPick || q.trim().startsWith("@") ? <button className="icon-btn sm" aria-label="Back" onClick={back}>{I.left}</button> : <span className="palette-ico">{I.searchLg}</span>}
          <input
            autoFocus
            value={q}
            role="combobox"
            aria-expanded
            aria-controls="palette-list"
            aria-activedescendant={shown[sel] ? `pal-${shown[sel]!.id}` : undefined}
            aria-label="Command palette"
            placeholder={chromeTabs ? "Pick a Chrome tab to borrow…" : vaultItems ? "Pick a credential to fill…" : splitPick ? "Pick a page for split view…" : "Search tabs, chats, tasks, pages… / for commands"}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); back(); }
              if (e.key === "ArrowDown") { e.preventDefault(); setSel(Math.max(0, Math.min(sel + 1, shown.length - 1))); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSel(Math.max(sel - 1, 0)); }
              if (e.key === "Enter" && shown[sel]) exec(shown[sel]!);
            }}
          />
          <kbd>esc</kbd>
        </div>
        {!chromeTabs&&!vaultItems&&!splitPick&&!/^[/@]/.test(q.trim())&&<div className="palette-filters" aria-label="Search types">{([['all','All'],['tabs','Tabs'],['work','Work'],['pages','Saved pages']] as const).filter(([type])=>!bridge.privateMode||type!=="work").map(([type,label])=><button key={type} className="btn sm ghost" aria-pressed={filter===type} onClick={()=>setFilter(type)}>{label}</button>)}</div>}
        {searching&&<p className="palette-search-status hint" role="status">Searching saved work…</p>}
        {searchError&&<p className="palette-search-status hint" role="status">Some saved results couldn’t be searched. <button className="btn sm ghost" onClick={()=>setSearchRefresh(value=>value+1)}>Retry</button></p>}
        <div className="palette-list" ref={listRef} role="listbox" id="palette-list">
          {shown.map((c, i) => {
            const first = i === 0 || shown[i - 1]!.section !== c.section;
            return (
              <div key={c.id}>
                {first && SECTION[c.section] && <div className="pal-section">{SECTION[c.section]}</div>}
                <div id={`pal-${c.id}`} role="option" aria-selected={i === sel} className={`pal-item ${i === sel ? "sel" : ""}`} onMouseMove={() => sel !== i && setSel(i)} onClick={() => exec(c)}>
                  <span className="pal-ico">{c.icon ?? I.command}</span>
                  <span className="t">{c.t}</span>
                  {c.d && <span className="d">{c.d}</span>}
                  {c.k && <kbd>{c.k}</kbd>}
                </div>
              </div>
            );
          })}
          {shown.length === 0 && <div className="pal-empty">{q.trim().startsWith("@") ? "No open tabs match. Search by title, address, Space or folder." : searching ? "" : q.trim().length<2&&filter!=="all" ? "Type at least two characters to search saved work." : "No matches"}</div>}
          {cmds.length > shown.length && <p className="palette-result-count">Showing {shown.length} of {cmds.length} results. Keep typing to narrow them.</p>}
        </div>
      </div>
    </div>
  );
}
