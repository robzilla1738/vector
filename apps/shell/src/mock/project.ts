import type { AuxBridge } from '../bridge';

/** In-memory visual fixture only; no filesystem or command execution. */
export function projectFixture(): Pick<AuxBridge,'listProjects'|'listProjectFiles'|'readProjectFile'|'saveProjectFile'> {
  const projectId='4b7d8390-3885-471e-9e68-dace00205721';
  const project={projectId,name:'Research workspace',sourcePath:'/preview/research',path:'/preview/research-checkout',branch:'aux/research',baseCommit:'a'.repeat(40),createdAt:Date.now(),state:'ready' as const};
  const files=new Map([
    ['README.md','# Research workspace\n\nEvery finding includes a recorded source and a clear outcome.\n'],
    ['src/App.tsx','export function App() {\n  return <main>Research notes</main>;\n}\n'],
    ['src/components/SourceCard.tsx','export function SourceCard({ title }: { title: string }) {\n  return <article>{title}</article>;\n}\n'],
    ['notes/qualification.md','# Qualification\n\n- Preserve source identity\n- Review uncertain outcomes\n'],
  ]);
  const revisions=new Map<string,string>();
  const read=(id:string,name:string)=>{if(id!==projectId||!files.has(name))throw new Error('Preview file unavailable');return {projectId,name,content:files.get(name)!,sha256:revisions.get(name)??'a'.repeat(64)};};
  return {
    listProjects:async()=>[project],
    listProjectFiles:async id=>id===projectId?[...files.keys()]:[],
    readProjectFile:async(id,name)=>read(id,name),
    saveProjectFile:async(id,name,sha,content)=>{const before=read(id,name);if(before.sha256!==sha)throw new Error('Preview file changed');files.set(name,content);revisions.set(name,crypto.randomUUID().replaceAll('-','').repeat(2));return {...read(id,name),recoveryPath:'/preview/recovery/copy'};},
  };
}
