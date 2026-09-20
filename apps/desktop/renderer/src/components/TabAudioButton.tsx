import {useState} from 'react';
import {bridge} from '../bridge';
import {useStore,errToast} from '../store';
import {I} from './icons';

export function TabAudioButton({pageId,title,menu=false,onDone}:{pageId:string;title:string;menu?:boolean;onDone?:()=>void}){
 const audio=useStore(state=>state.tabAudio[pageId]);
 const [busy,setBusy]=useState(false);
 if(!audio||(!menu&&!audio.muted&&!audio.audible))return null;
 const label=audio.muted?'Unmute tab':'Mute tab';
 return <button className={menu?'menu-item':'icon-btn xs tab-audio'} role={menu?'menuitem':undefined} aria-label={menu?label:`${label}: ${title}`} title={audio.muted?'Tab muted':`Playing audio · ${label}`} disabled={busy}
  onKeyDown={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();setBusy(true);void bridge.setTabMuted(pageId,!audio.muted).then(onDone).catch(errToast).finally(()=>setBusy(false));}}>
  {audio.muted?I.volumeOff:I.volume}{menu&&<span className="t">{label}</span>}
 </button>;
}
