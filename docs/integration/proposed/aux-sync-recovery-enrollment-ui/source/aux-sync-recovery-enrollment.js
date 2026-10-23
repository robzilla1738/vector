// Supplied modal/header/body/footer, phrase grid and word-input components reused.
import{A as ce,E as de,w as ue}from'./browser-color-scheme-Df5VSuPV.js';
import{a as Modal,c as Header,f as PhraseGrid,o as Body,p as Words,s as Footer}from'./components-BlZz2O2v.js';
import{t as Button}from'./button-82u7k4S8.js';
import{t as Checkbox}from'./checkbox-5u7RNXxY.js';
import{d as Spinner}from'./error-tracking-B1YG2RRM.js';
import{t as NextIcon}from'./arrow-corner-down-left-D9tBz26z.js';
import{i as generate,n as saveFile}from'./recovery-key-CPOQuYx2.js';
import{createAuxRecoveryEnrollment}from'./aux-sync-recovery-enrollment-controller.js';
var S=ce(de()),e=ue();
export function AuxSyncRecoveryEnrollment(props){
 const[,render]=S.useReducer(value=>value+1,0),ref=S.useRef(null),latest=S.useRef(props),formId=S.useId();latest.current=props;
 S.useEffect(()=>{const controller=createAuxRecoveryEnrollment({context:props.context,getCurrentContext:()=>latest.current.getCurrentContext(),generate,saveFile,validateContext:context=>latest.current.validateContext(context),enroll:input=>latest.current.enroll(input),onChange:()=>render(),onComplete:()=>latest.current.onComplete()});ref.current=controller;controller.start();
  const warn=event=>{if(controller.view().key){event.preventDefault();event.returnValue='';}},leave=()=>{controller.dispose();latest.current.onClose();};
  window.addEventListener('beforeunload',warn);window.addEventListener('pagehide',leave);
  return()=>{controller.dispose();if(ref.current===controller)ref.current=null;window.removeEventListener('beforeunload',warn);window.removeEventListener('pagehide',leave);};
 },[props.context.accountId,props.context.userId,props.context.generation]);
 const controller=ref.current,view=controller?.view(),confirm=view?.step==='confirm',pending=!view||view.pending;
 const close=()=>{if(!pending){controller?.dispose();props.onClose();}};
 const error=view?.error&&(0,e.jsx)('p',{role:'alert',className:'text-destructive text-sm',children:view.error});
 return(0,e.jsx)(Modal,{open:true,onOpenChange:open=>{if(!open)close();},children:(0,e.jsxs)(e.Fragment,{children:[
  (0,e.jsx)(Header,{title:confirm?'Confirm your recovery key':'Keep your recovery key',description:confirm?'Type these words from the recovery key you just saved.':'Save this key to recover your encrypted browser data.'}),
  (0,e.jsxs)(Body,{className:'max-w-105 justify-center',children:[!confirm?(view?.key?(0,e.jsxs)('div',{className:'flex w-full flex-col gap-4',children:[(0,e.jsx)(PhraseGrid,{phrase:view.key.phrase}),(0,e.jsxs)('label',{className:'flex cursor-pointer items-center gap-2 self-center text-left text-xs',children:[(0,e.jsx)(Checkbox,{checked:view.acknowledged,disabled:pending,onCheckedChange:value=>controller.acknowledge(value)}),(0,e.jsxs)('span',{children:['I understand that I need this to recover my browser data.',(0,e.jsx)('span',{className:'text-muted-foreground block',children:'Download and save it somewhere safe.'})]})]}),error]}):pending?(0,e.jsx)(Spinner,{className:'mx-auto'}):error):(0,e.jsxs)('form',{id:formId,className:'w-full space-y-4',onSubmit:event=>{event.preventDefault();controller.finish();},children:[(0,e.jsx)(Words,{className:'grid-cols-3',wordIndexes:view.indexes,value:view.words,autoFocus:true,required:true,disabled:pending,onChange:words=>controller.setWords(words)}),error]})]}),
  (0,e.jsxs)(Footer,{children:[(0,e.jsx)(Button,{variant:confirm?'outline':'secondary',size:'lg',disabled:pending,onClick:confirm?()=>controller.back():close,children:confirm?'Back':'Cancel'}),(0,e.jsxs)('div',{className:'flex items-center gap-2',children:[!confirm&&(0,e.jsx)(Button,{variant:view?.saved?'outline':'default',size:'lg',disabled:!view?.key||pending,onClick:()=>controller.save(),children:'Save file'}),(0,e.jsxs)(Button,{type:confirm?'submit':'button',form:confirm?formId:void 0,size:'lg','data-dialog-enter-action':'true',disabled:confirm?!view?.canFinish:!view?.canNext,onClick:confirm?void 0:()=>controller.next(),children:[pending&&(0,e.jsx)(Spinner,{}),(0,e.jsx)('span',{children:confirm?'Finish':'Next'}),(0,e.jsx)(NextIcon,{className:'size-4 opacity-50'})]})]})]})
 ]})});
}
