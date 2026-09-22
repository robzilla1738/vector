import {useState} from 'react';
import type {ProjectFile} from '@aux/contracts';
import {bridge} from '../bridge';

/** Explicit, read-only snapshots; never automatically reads every untracked file. */
export function UntrackedFileReview({projectId,names}:{projectId:string;names:string[]}){
 const [query,setQuery]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [preview,setPreview]=useState<{file:ProjectFile;at:number}|null>(null);
 const matches=names.filter(name=>name.toLowerCase().includes(query.toLowerCase()));
 async function read(name:string){
  setBusy(true);setError('');setPreview(null);
  try{setPreview({file:await bridge.readProjectFile(projectId,name),at:Date.now()});}
  catch(error){setError(error instanceof Error?error.message:String(error));}
  finally{setBusy(false);}
 }
 return <section className="field" aria-label="Untracked file review">
  <strong>Untracked files · {names.length}</strong>
  <p className="hint">Choose a file to review its saved contents. These files are not staged or included in the tracked diff. Unsaved editor drafts are not shown.</p>
  {names.length>10&&<input aria-label="Find untracked file" placeholder="Find an untracked file" value={query} onChange={event=>setQuery(event.target.value)}/>}
  <div className="project-file-list">{matches.slice(0,100).map(name=><button className="btn sm" key={name} disabled={busy} onClick={()=>void read(name)}>{name}</button>)}</div>
  {matches.length>100&&<p className="hint">Showing 100 matches. Narrow your search.</p>}
  {!matches.length&&<p className="hint">No matching files.</p>}
  {error&&<p role="alert">{error}</p>}
  {preview&&<>
   <strong className="selectable">{preview.file.name}</strong>
   <p className="hint">Read {new Date(preview.at).toLocaleString()}. This is a snapshot; refresh checkout status after editing or staging files.</p>
   <pre className="project-diff" tabIndex={0} aria-label="Untracked file contents">{preview.file.content===''?'(Empty file)':preview.file.content}</pre>
   <button className="btn sm" onClick={()=>setPreview(null)}>Close file preview</button>
  </>}
 </section>;
}
