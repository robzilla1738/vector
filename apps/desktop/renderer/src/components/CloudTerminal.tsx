import {useEffect,useRef,useState} from 'react';
import type {Terminal as XTerminal} from '@xterm/xterm';
import type {FitAddon as XFitAddon} from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import type {CloudTerminalSession,Task} from '@aux/contracts';
import {bridge} from '../bridge';

export function CloudTerminal({task,environmentId,onClose,onEnvironmentChanged}:{task:Task;environmentId:string;onClose:()=>void;onEnvironmentChanged:()=>void}){
  const host=useRef<HTMLDivElement>(null);
  const [status,setStatus]=useState('Connecting…');
  useEffect(()=>{
    const element=host.current;if(!element)return;
    let socket:WebSocket|undefined;let disposed=false;let input:{dispose:()=>void}|undefined;let observer:ResizeObserver|undefined;let terminal:XTerminal|undefined;let fit:XFitAddon|undefined;
    const connect=async()=>{
      try{
        const [{Terminal},{FitAddon}]=await Promise.all([import('@xterm/xterm'),import('@xterm/addon-fit')]);if(disposed)return;
        terminal=new Terminal({convertEol:true,cursorBlink:true,fontFamily:'var(--font-mono)',fontSize:12,scrollback:5000,theme:{background:'#151515',foreground:'#e7e7e7',cursor:'#ededed',selectionBackground:'#4a4a4a'}});fit=new FitAddon();terminal.loadAddon(fit);terminal.open(element);fit.fit();terminal.writeln('\x1b[2mOpening task-scoped Vercel terminal…\x1b[0m');
        const session=await bridge.invoke('cloud.openTerminal',{taskId:task.taskId,expectedRevision:task.revision,environmentId}) as CloudTerminalSession;if(disposed)return;onEnvironmentChanged();
        socket=new WebSocket(`${session.url}?token=${encodeURIComponent(session.token)}`);socket.binaryType='arraybuffer';
        socket.onopen=()=>{if(disposed||!terminal)return;setStatus('Connected');terminal.clear();socket!.send(JSON.stringify({type:'start',command:'/bin/bash',args:['--noprofile','--norc'],env:['TERM=xterm-256color','PS1=aux-cloud:\\w$ '],cwd:session.cwd,cols:terminal.cols,rows:terminal.rows}));};
        socket.onmessage=event=>{if(!terminal)return;if(event.data instanceof ArrayBuffer)terminal.write(new Uint8Array(event.data));else if(event.data instanceof Blob)void event.data.arrayBuffer().then(data=>terminal?.write(new Uint8Array(data)));else{try{const message=JSON.parse(String(event.data)) as {type?:string;code?:number};if(message.type==='exit'){setStatus(`Exited${typeof message.code==='number'?` (${message.code})`:''}`);terminal.writeln(`\r\n\x1b[2mTerminal exited${typeof message.code==='number'?` with code ${message.code}`:''}.\x1b[0m`);}}catch{terminal.write(String(event.data));}}};
        socket.onerror=()=>{setStatus('Connection failed');terminal?.writeln('\r\n\x1b[31mTerminal connection failed.\x1b[0m');};socket.onclose=()=>setStatus(current=>current.startsWith('Exited')?current:'Disconnected');
        input=terminal.onData(data=>{if(socket?.readyState===WebSocket.OPEN)socket.send(new TextEncoder().encode(data));});
        observer=new ResizeObserver(()=>{fit?.fit();if(socket?.readyState===WebSocket.OPEN&&terminal)socket.send(JSON.stringify({type:'resize',cols:terminal.cols,rows:terminal.rows}));});observer.observe(element);
      }catch(error){setStatus('Connection failed');terminal?.writeln(`\r\n\x1b[31m${error instanceof Error?error.message:String(error)}\x1b[0m`);}
    };
    void connect();
    return()=>{disposed=true;observer?.disconnect();input?.dispose();socket?.close();terminal?.dispose();};
  },[task.taskId,task.revision,environmentId]);
  return <section className="cloud-terminal" aria-label="Interactive cloud terminal"><div className="cloud-terminal-head"><strong>Terminal</strong><span className="hint" role="status">{status}</span><button className="btn sm" onClick={onClose}>Close terminal</button></div><div className="cloud-terminal-host" ref={host}/></section>;
}
