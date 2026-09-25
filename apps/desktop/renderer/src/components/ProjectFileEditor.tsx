import {useEffect,useState} from 'react';
import type {ProjectFile,ProjectFileHistory,ProjectFileVersionSnapshot} from '@aux/contracts';
import {bridge} from '../bridge';
import {FileTree} from './FileTree';
import {ActionMenu, DetailPane, EmptyState} from './ui';
const key=(project:string,name:string)=>`aux.file-draft.v1:${project}:${name}`;

type Props={projectId:string;taskId:string;taskRevision:number;attached:boolean;disabled:boolean};
export function ProjectFileEditor(props:Props){return <ProjectFileEditorView key={`${props.projectId}:${props.taskId}`} {...props}/>;}
function ProjectFileEditorView({projectId,taskId,taskRevision,attached,disabled}:Props){
 const [files,setFiles]=useState<string[]>([]),[query,setQuery]=useState('');
 const [loadingFiles,setLoadingFiles]=useState(true);
 const [creating,setCreating]=useState(false),[newName,setNewName]=useState('');
 const [renaming,setRenaming]=useState(false),[renameName,setRenameName]=useState('');
 const [file,setFile]=useState<ProjectFile|null>(null),[content,setContent]=useState(''),[base,setBase]=useState('');
 const [history,setHistory]=useState<ProjectFileHistory|null>(null),[version,setVersion]=useState<ProjectFileVersionSnapshot|null>(null);
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[recovery,setRecovery]=useState('');
 const [externalFile,setExternalFile]=useState<string|null>(null),[diskConflict,setDiskConflict]=useState<ProjectFile|null>(null),[checkingDisk,setCheckingDisk]=useState(false);
 useEffect(()=>{let active=true;bridge.listProjectFiles(projectId).then(files=>{if(active)setFiles(files);}).catch(error=>{if(active)setError(String(error));}).finally(()=>{if(active)setLoadingFiles(false);});return()=>{active=false;};},[projectId]);
 async function action(work:()=>Promise<void>){const opener=document.activeElement;setBusy(true);setError('');setMessage('');try{await work();}catch(error){setError(error instanceof Error?error.message:String(error));}finally{setBusy(false);requestAnimationFrame(()=>{if(document.activeElement===document.body&&opener instanceof HTMLElement&&opener.isConnected){const target=opener.matches(":disabled")?opener.closest(".ui-detail-pane")?.querySelector<HTMLElement>("textarea:not(:disabled)"):opener;target?.focus();}});}}
 async function load(name:string,discard=false){
  const next=await bridge.readProjectFile(projectId,name);let draft:null|{content:string;sha256:string}=null;
  if(discard)localStorage.removeItem(key(projectId,name));
  else{
   try{const stored=JSON.parse(localStorage.getItem(key(projectId,name))??'null');if(stored&&typeof stored.content==='string'&&typeof stored.sha256==='string')draft=stored;}catch{throw new Error('Could not read the saved draft. It has not been deleted.');}
  }
  setFile(next);setContent(draft?.content??next.content);setBase(draft?.sha256??next.sha256);setRecovery('');setHistory(null);setVersion(null);setRenaming(false);setRenameName(next.name);setExternalFile(null);setDiskConflict(draft&&draft.sha256!==next.sha256?next:null);
  if(draft)setMessage(draft.sha256===next.sha256?'Restored your unsaved draft.':'Restored your draft. The disk file changed; saving is blocked until you choose which version to keep.');
 }
 const dirty=!!file&&(content!==file.content||base!==file.sha256);
 async function inspectDisk(silent=false){
  if(!file||checkingDisk)return;setCheckingDisk(true);
  try{
   const next=await bridge.readProjectFile(projectId,file.name);
   if(next.sha256===base){if(diskConflict){setDiskConflict(null);setMessage('The disk file returned to the version your Aux draft is based on.');}else if(!silent)setMessage('The disk file has not changed.');return;}
   if(dirty){setDiskConflict(next);setMessage('The disk file changed. Your Aux draft is preserved until you choose which version to keep.');return;}
   setFile(next);setContent(next.content);setBase(next.sha256);setDiskConflict(null);try{localStorage.removeItem(key(projectId,next.name));}catch{}
   setMessage('Loaded changes made outside Aux.');
  }catch(error){if(!silent)setError(error instanceof Error?error.message:String(error));}finally{setCheckingDisk(false);}
 }
 useEffect(()=>{
  if(!file||externalFile!==file.name)return;
  const check=()=>{void inspectDisk(true);};window.addEventListener('focus',check);return()=>window.removeEventListener('focus',check);
 },[externalFile,file?.name,file?.sha256,content,base]);
 const matches=files.filter(name=>name.toLowerCase().includes(query.toLowerCase()));
 const fileActions=file?<><button className="btn sm" disabled={disabled||busy||!dirty||!!diskConflict} onClick={()=>void action(async()=>{
    const saved=await bridge.saveProjectFile(projectId,file.name,base,content);setFile(saved);setBase(saved.sha256);setContent(saved.content);setRecovery(saved.recoveryPath);try{localStorage.removeItem(key(projectId,file.name));}catch{setError('File saved, but the stored draft could not be removed. Reopening may show the older draft.');}setMessage('File saved. Refresh checkout status to review the diff.');
   })}>Save file</button><ActionMenu label={`Actions for ${file.name}`} actions={[
    {label:'Reload disk and discard draft',disabled:busy,onSelect:()=>void action(()=>load(file.name,true))},
    {label:'Open externally',disabled:busy||!attached,onSelect:()=>void action(()=>bridge.openProjectFileExternal(projectId,file.name,{taskId,expectedRevision:taskRevision}).then(()=>{setExternalFile(file.name);setMessage('Opened for external editing. Aux will check the disk file when you return.');}))},
    {label:checkingDisk?'Checking disk…':'Check disk changes',disabled:busy||checkingDisk,onSelect:()=>void action(()=>inspectDisk(false))},
    {label:'Rename',disabled:busy||disabled||dirty,onSelect:()=>{setRenaming(true);setRenameName(file.name);}},
    {label:'Delete',danger:true,disabled:busy||disabled||dirty,onSelect:()=>void action(async()=>{
      const removed=await bridge.deleteProjectFile(projectId,file.name,file.sha256);if(!removed)return;
      try{localStorage.removeItem(key(projectId,file.name));}catch{}
      setFiles(current=>current.filter(name=>name!==file.name));setFile(null);setContent('');setBase('');setHistory(null);setVersion(null);setRecovery(removed.recoveryPath);setMessage(`Deleted ${removed.name} from this checkout. A recovery copy was retained.`);
    })},
    {label:'Recovery history',disabled:busy,onSelect:()=>void action(async()=>{setVersion(null);setHistory(await bridge.projectFileHistory(projectId,file.name));})},
    ...(recovery?[{label:'Show recovery copy',onSelect:()=>void action(()=>bridge.revealPath(recovery).then(()=>{}))}]:[]),
  ]}/></>:undefined;
 return <section className="field project-editor" aria-label="Project file editor">
  <div className="row"><input aria-label="Find project file" placeholder="Find a file by name" value={query} onChange={event=>setQuery(event.target.value)}/><button className="btn sm" disabled={busy} onClick={()=>void action(async()=>setFiles(await bridge.listProjectFiles(projectId)))}>Refresh files</button><button className="btn sm" disabled={busy||disabled} aria-expanded={creating} onClick={()=>setCreating(!creating)}>New file</button></div>
  {creating&&<form aria-label="Create project file" onSubmit={event=>{event.preventDefault();if(busy||disabled||!newName)return;void action(async()=>{
    const next=await bridge.createProjectFile(projectId,newName);
    setFiles(current=>[...new Set([...current,next.name])].sort());setQuery('');setNewName('');setCreating(false);
    // Open through the usual draft path: a previously deleted file may have a retained draft.
    setMessage('File created in this checkout. Edit it below, then save.');await load(next.name);
  });}}>
   <div className="row"><input aria-label="New file path" placeholder="src/components/example.ts" autoFocus value={newName} disabled={busy||disabled} onChange={event=>setNewName(event.target.value)}/><button className="btn sm" type="submit" disabled={busy||disabled||!newName}>Create file</button><button className="btn sm" type="button" disabled={busy} onClick={()=>setCreating(false)}>Cancel</button></div>
   <p className="hint">Creates an empty text file and any missing folders inside this checkout. Existing and ignored paths are not replaced. Failed creation may leave empty folders.</p>
  </form>}
  <p className="hint">Tracked and untracked files; ignored files are excluded. Choose a UTF-8 file up to 256 KB. No file contents are read until you open one.</p>
  <div className="project-editor-layout"><aside className="project-file-browser" aria-label="File browser"><FileTree paths={matches.slice(0,100)} selected={file?.name} disabled={busy||loadingFiles} expandAll={!!query.trim()} onSelect={name=>void action(()=>load(name))}/>
  {matches.length>100&&<p className="hint">Showing 100 of {matches.length} matches. Narrow your search.</p>}
  {loadingFiles?<p className="hint" role="status">Loading files…</p>:!matches.length&&<p className="hint">No matching files.</p>}
  </aside><div className="project-file-detail">{!file&&!error&&<EmptyState title="Choose a file" description="Open a file from the tree to inspect or edit it."/>}
  {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
  {!file&&recovery&&<button className="btn sm" onClick={()=>void action(()=>bridge.revealPath(recovery).then(()=>{}))}>Show recovery copy</button>}
  {file&&<DetailPane title={file.name} metadata={dirty?"Unsaved draft":"Saved to this checkout"} actions={fileActions}>
   <textarea className="project-file-text" aria-label="File contents" spellCheck={false} rows={16} disabled={busy||disabled} value={content} onChange={event=>{
    const value=file.content.includes('\r\n')&&!file.content.replaceAll('\r\n','').includes('\n')?event.target.value.replace(/\r?\n/g,'\r\n'):event.target.value;
    setContent(value);setMessage('');
    try{localStorage.setItem(key(projectId,file.name),JSON.stringify({content:value,sha256:base}));}catch{setError('Draft could not be saved locally. Keep this view open and copy your edits before leaving.');}
   }}/>
   <p className="hint">Unsaved drafts stay in this Aux profile. Save replaces only this checkout file and keeps a recovery copy. External edits block saving. Stop build/check commands before saving; local services can watch your edits.</p>
   {!attached&&<p className="hint">Attach this checkout to the current task before opening its files in another app.</p>}
   {diskConflict&&<section className="field project-external-conflict" aria-label="External file changes">
    <strong>Changed in another app</strong>
    <p className="hint">Aux kept your draft unchanged. Review the current disk version, then keep one version deliberately. Replacing the disk version keeps it in recovery history.</p>
    <pre role="group" className="project-diff" tabIndex={0} aria-label="External file contents">{diskConflict.content||'(Empty file)'}</pre>
    <div className="row"><button className="btn sm" disabled={busy||disabled} onClick={()=>void action(async()=>{
      const saved=await bridge.saveProjectFile(projectId,file.name,diskConflict.sha256,content);setFile(saved);setBase(saved.sha256);setContent(saved.content);setDiskConflict(null);setRecovery(saved.recoveryPath);try{localStorage.removeItem(key(projectId,file.name));}catch{}setMessage('Kept the Aux draft. The external version is available in recovery history.');
    })}>Replace disk with Aux draft</button><button className="btn sm" disabled={busy} onClick={()=>{
      setFile(diskConflict);setContent(diskConflict.content);setBase(diskConflict.sha256);setDiskConflict(null);try{localStorage.removeItem(key(projectId,diskConflict.name));}catch{}setMessage('Using the version from disk.');
    }}>Use external version</button></div>
   </section>}
   {renaming&&<form aria-label="Rename project file" onSubmit={event=>{event.preventDefault();if(busy||disabled||dirty||!renameName)return;void action(async()=>{
     const previous=file.name;const moved=await bridge.renameProjectFile(projectId,previous,renameName,file.sha256);
     try{localStorage.removeItem(key(projectId,previous));}catch{}
     setFiles(current=>current.map(name=>name===previous?moved.name:name).sort());setFile(moved);setContent(moved.content);setBase(moved.sha256);setRenameName(moved.name);setRenaming(false);setRecovery(moved.recoveryPath);setMessage(`Renamed to ${moved.name}. Refresh checkout status to review the change.`);
   });}}>
    <div className="row"><input aria-label="Renamed file path" autoFocus value={renameName} disabled={busy||disabled} onChange={event=>setRenameName(event.target.value)}/><button className="btn sm" type="submit" disabled={busy||disabled||!renameName||renameName===file.name}>Rename file</button><button className="btn sm" type="button" disabled={busy} onClick={()=>setRenaming(false)}>Cancel</button></div>
    <p className="hint">Moves this file within the isolated checkout without replacing an existing or ignored path. Its current contents are retained in recovery history under the new name.</p>
   </form>}
   {history&&<section className="field" aria-label="File recovery history">
    <strong>Saved before earlier edits</strong>
    <p className="hint">Choose a version to preview. Restoring replaces this checkout file and first saves its current contents as another recovery copy.</p>
    {history.limited&&<p className="hint">Showing matches from the newest 100 recovery copies in this project.</p>}
    {history.unreadable>0&&<p role="alert">{history.unreadable} project recovery copies could not be read or verified. They remain on disk.</p>}
    {!history.versions.length&&<p className="hint">No matching recovery versions found.</p>}
    <div className="project-file-list">{history.versions.map(item=><button className="btn sm" key={item.versionId} disabled={busy} onClick={()=>void action(async()=>setVersion(await bridge.readProjectFileVersion(projectId,file.name,item.versionId)))}>Preview {new Date(item.savedAt).toLocaleString()} · {item.byteLength.toLocaleString()} bytes</button>)}</div>
    {version&&<><pre role="group" className="project-diff" tabIndex={0} aria-label="Recovery version contents">{version.content||'(Empty file)'}</pre>
      <p className="hint">SHA-256 {version.sha256}</p>
      {dirty&&<p className="hint">Save or explicitly discard your draft before restoring a version.</p>}
      <button className="btn sm" disabled={busy||disabled||dirty||version.sha256===base} onClick={()=>void action(async()=>{
        const saved=await bridge.saveProjectFile(projectId,file.name,base,version.content);
        setFile(saved);setBase(saved.sha256);setContent(saved.content);setRecovery(saved.recoveryPath);setVersion(null);
        try{localStorage.removeItem(key(projectId,file.name));}catch{setError('Version restored, but the older draft could not be cleared.');}
        setHistory(null);setMessage('Version restored. The previous file is retained in recovery history.');
      })}>Restore this version</button>
    </>}
    <button className="btn sm" disabled={busy} onClick={()=>{setHistory(null);setVersion(null);}}>Close recovery history</button>
   </section>}
  </DetailPane>}
  </div></div>
 </section>;
}
