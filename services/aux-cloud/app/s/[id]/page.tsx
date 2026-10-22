import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPublicShare } from '../../../src/sync';
export const dynamic='force-dynamic';
export const revalidate=0;
type Tool={name:string;input:unknown;output:string;images?:{data:string;mimeType:string}[];isError:boolean};
type Message={role:'user'|'assistant';content:string;tools?:Tool[];runItems?:({type:'text';content:string}|{type:'tool';tool:Tool})[];timestamp:number;elapsedMs?:number};
function Text({children}:{children:string}){return <Markdown remarkPlugins={[remarkGfm]} components={{a:({children,href})=><a href={href} target="_blank" rel="noopener noreferrer nofollow">{children}</a>,img:({alt})=><span className="muted">[Image: {alt||'external image'}]</span>}}>{children}</Markdown>;}
function ToolResult({tool}:{tool:Tool}){return <details className="tool-result"><summary>{tool.name}{tool.isError?' · error':''}</summary><pre>{typeof tool.input==='string'?tool.input:JSON.stringify(tool.input,null,2)}</pre><pre>{tool.output}</pre>{tool.images?.map((image,index)=><img key={index} className="shared-image" src={`data:${image.mimeType};base64,${image.data}`} alt={`${tool.name} result ${index+1}`}/>)}</details>;}
export default async function Share({params}:{params:Promise<{id:string}>}){
  const {id}=await params,share=await getPublicShare(id);
  if(!share)notFound();
  return <main className="transcript"><header><a href="https://getaux.co"><img src="/arch-mark.svg" width="32" height="32" alt="Aux"/></a><span>Shared conversation</span></header><h1>{String(share.title)}</h1><p className="muted">Published by the conversation owner. This page can be revoked at any time.</p>{(share.messages as Message[]).map((message,index)=><section className={`message ${message.role}`} key={index}><h2>{message.role==='user'?'User':'Aux'}</h2>{message.runItems?.length?message.runItems.map((item,n)=>item.type==='text'?<Text key={n}>{item.content}</Text>:<ToolResult key={n} tool={item.tool}/>):<><Text>{message.content}</Text>{message.tools?.map((tool,n)=><ToolResult key={n} tool={tool}/>)}</>}<small className="muted">{new Date(message.timestamp).toISOString().replace('T',' ').replace(/\.\d+Z$/,' UTC')}</small></section>)}</main>;
}
