/** Browser-only temporary confirmation state. Not an authentication authority. */
export function buildAuxBrowserRecoveryFile(phrase,now=new Date()){
 const timestamp=now.toISOString(),words=phrase.map(word=>word.trim());
 return{filename:`aux-recovery-key-browser-${timestamp.slice(0,10)}.txt`,contents:[
  'Aux browser data recovery key','',`Generated: ${timestamp}`,'',
  'Use this key to recover your encrypted Aux browser data.',
  'Keep this file somewhere safe outside this device.',
  'Anyone with this key and access to your Aux account can recover this browser data.',
  '',
  'Copy/paste recovery key','BEGIN AUX BROWSER RECOVERY KEY',words.join(' '),'END AUX BROWSER RECOVERY KEY','',
  'Recovery key (numbered)','',...words.map((word,index)=>`  ${String(index+1).padStart(2,'0')}. ${word}`)
 ].join('\n')};
}
const same=(a,b)=>a?.accountId===b?.accountId&&a?.userId===b?.userId&&a?.generation===b?.generation;
export function createAuxRecoveryEnrollment({context,getCurrentContext,generate,saveFile,validateContext,enroll,onChange=()=>{},onComplete=()=>{}}){
 const expected={...context};let alive=true,epoch=0,key=null,saved=false,acknowledged=false,indexes=[],words=['','',''],step='key',pending=false,error='';
 const current=()=>alive&&same(expected,getCurrentContext());
 const check=()=>{if(!current())throw Error('The account changed. Open browser data recovery again.');};
 const notify=()=>{if(current())onChange();};
 const clear=()=>{if(key){key.phrase.fill('');key.entropyB64='';key=null;}words.fill('');indexes=[];saved=false;acknowledged=false;};
 return{
  view:()=>({step,pending,error,key,saved,acknowledged,indexes,words,canNext:current()&&!pending&&!!key&&saved&&acknowledged,canFinish:current()&&!pending&&!!key&&saved&&acknowledged&&step==='confirm'&&words.every(Boolean)}),
  async start(){if(!current()||key||pending)return;const turn=++epoch;pending=true;notify();try{const generated=await generate();if(!current()||turn!==epoch)return;const phrase=generated?.phrase;if(!Array.isArray(phrase)||phrase.length!==12||typeof generated.entropyB64!=='string')throw Error('Could not create your recovery key.');key={phrase:[...phrase],entropyB64:generated.entropyB64};
   // Same three unique word-index selection used by the supplied confirmation flow.
   indexes=[...phrase.keys()].sort(()=>Math.random()-.5).slice(0,3).sort((a,b)=>a-b);
  }catch(cause){if(current())error=cause instanceof Error?cause.message:'Could not create your recovery key.';}finally{if(alive&&turn===epoch){pending=false;notify();}}},
  save(){if(!current())return;if(pending||!key)return;try{const file=buildAuxBrowserRecoveryFile(key.phrase);saveFile(file.filename,file.contents);check();saved=true;error='';}catch(cause){if(current())error=cause instanceof Error?cause.message:'Could not save your recovery key.';}notify();},
  acknowledge(value){if(!current())return;if(!pending){acknowledged=value===true;notify();}},
  setWords(value){if(!current())return;if(!pending){words=Array.from({length:3},(_,index)=>String(value[index]??''));error='';notify();}},
  next(){if(!current())return;if(!pending&&key&&saved&&acknowledged){step='confirm';error='';notify();}},
  back(){if(!current())return;if(!pending){step='key';words.fill('');error='';notify();}},
  async finish(){if(!current())return;if(pending||!key||!saved||!acknowledged||step!=='confirm')return;
   if(indexes.some((index,position)=>words[position].trim().toLowerCase()!==key.phrase[index])){error='Those words don’t match your new recovery key.';notify();return;}
   const turn=epoch;pending=true;error='';notify();try{
    await validateContext({...expected});check();if(turn!==epoch)return;
    await enroll({accountId:expected.accountId,expectedUserId:expected.userId,expectedSyncGeneration:expected.generation,recoveryEntropyB64:key.entropyB64});
    check();if(turn!==epoch)return;clear();step='done';onComplete();
   }catch(cause){if(current())error=cause instanceof Error?cause.message:'Could not enable browser data recovery.';}finally{if(alive&&turn===epoch){pending=false;notify();}}
  },
  dispose(){if(!alive)return;alive=false;epoch++;clear();onChange=()=>{};onComplete=()=>{};}
 };
}
