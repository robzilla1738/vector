import { useEffect, useRef, useState } from "react";
import type { WorkspaceMemory } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import { SpaceMemoryEditor } from "./SpaceMemoryEditor";

export function MemorySettings() {
  const layout = useStore(state => state.layout);
  const spaces = [...layout.spaces, ...(layout.archivedSpaces ?? [])].filter(space => space.workspaceId);
  const [spaceId, setSpaceId] = useState(()=>spaces.find(space=>space.workspaceId===useStore.getState().memoryWorkspaceId)?.id??layout.activeSpaceId);
  useEffect(()=>{useStore.setState({memoryWorkspaceId:null});},[]);
  const [query, setQuery] = useState("");
  const [memory, setMemory] = useState<WorkspaceMemory | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [matches,setMatches]=useState<{workspaceId:string;name:string;excerpt:string;enabled:boolean}[]>([]);
  const [searching,setSearching]=useState(false);
  const [searchError,setSearchError]=useState("");
  const space = spaces.find(space => space.id === spaceId) ?? spaces[0];
  const selectedWorkspace=useRef(space?.workspaceId);
  selectedWorkspace.current=space?.workspaceId;
  const matchingSpaces = query.trim()?spaces.filter(item=>matches.some(match=>match.workspaceId===item.workspaceId)):spaces;
  useEffect(()=>{
    if(bridge.privateMode||!query.trim()){setMatches([]);setSearching(false);setSearchError("");return;}
    let live=true;setSearching(true);setSearchError("");
    const timer=window.setTimeout(()=>{
      void call<typeof matches>("workspaces.memory.search",{query:query.trim()}).then(items=>{if(live)setMatches(items);})
        .catch(reason=>{if(live)setSearchError(String(reason));}).finally(()=>{if(live)setSearching(false);});
    },140);
    return()=>{live=false;window.clearTimeout(timer);};
  },[query,refresh]);
  useEffect(() => {
    if (bridge.privateMode || !space?.workspaceId) return;
    let live = true;
    setMemory(current => current?.workspaceId === space.workspaceId ? current : null); setError(""); setLoading(true);
    void call<WorkspaceMemory>("workspaces.memory.get", { workspaceId: space.workspaceId })
      .then(value => { if (live) setMemory(value); })
      .catch(reason => { if (live) setError(reason instanceof Error ? reason.message : String(reason)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [space?.workspaceId, refresh]);
  useEffect(()=>bridge.onEvent(event=>{
    if(event.type==="workspace.memory.updated"&&event.payload.workspaceId===selectedWorkspace.current)setRefresh(value=>value+1);
  }),[]);
  if (bridge.privateMode) return <p className="hint">Space memory is unavailable in private browsing.</p>;
  return <div className="memory-settings">
    <p className="hint">Keep useful preferences and project context in one place. Write notes yourself or opt in to remembering page titles and addresses below. Browsing memory is off by default.</p>
    <label className="memory-space-search">Search saved memory<input className="field-input" aria-label="Search Space names and saved notes" value={query} placeholder="Search Space names and saved notes…" onChange={event => setQuery(event.target.value)} /></label>
    {searching&&<p className="hint" role="status">Searching saved notes…</p>}
    {searchError&&<p className="field-error" role="alert">{searchError} <button className="btn sm ghost" onClick={()=>setRefresh(value=>value+1)}>Retry</button></p>}
    <div className={`memory-space-list ${query.trim()?"memory-search-results":""}`} role="group" aria-label="Space memory selection">
      {matchingSpaces.map(item => <button key={item.id} className="btn sm" aria-pressed={item.id === space?.id} onClick={() => setSpaceId(item.id)}><span>{item.name}{layout.archivedSpaces?.some(archived => archived.id === item.id) ? " · Archived" : ""}</span>{query.trim()&&<small>{matches.find(match=>match.workspaceId===item.workspaceId)?.excerpt||"No saved notes"}{matches.find(match=>match.workspaceId===item.workspaceId)?.enabled===false?" · Paused":""}</small>}</button>)}
      {!!spaces.length && !matchingSpaces.length && !searching && !searchError && <p className="hint" role="status">No saved memory matches “{query.trim()}”.</p>}
    </div>
    {space && <h4>{space.name}</h4>}
    {loading && !memory && <p className="hint" role="status">Loading saved notes…</p>}
    {error && <p className="field-error" role="alert">{error} <button className="btn sm" onClick={() => setRefresh(value => value + 1)}>Retry</button></p>}
    {memory && <SpaceMemoryEditor key={memory.workspaceId} memory={memory} onSaved={value=>{if(value.workspaceId!==selectedWorkspace.current)return;setMemory(value);if(query.trim())setRefresh(current=>current+1);}} />}
    {!spaces.length && <p className="hint">Create a Space to save shared notes.</p>}
  </div>;
}
