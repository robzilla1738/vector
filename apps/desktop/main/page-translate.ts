/**
 * Explicit page translation. The extract/apply/restore scripts keep node
 * references on `window.__auxTrans` between evaluate calls — text nodes can't
 * be returned over the evaluate boundary, so the array is the bridge. Only
 * visible, non-form, non-code text is collected; nothing executable, no form
 * values, no markup is ever rewritten.
 */

const STATE = "__auxTrans";
export const MAX_TRANSLATE_NODES = 400;

const SKIP_SELECTOR = "script,style,noscript,template,input,textarea,select,option,code,pre,kbd,samp,var,iframe,canvas,svg,math,[contenteditable],[translate='no'],.notranslate,[data-aux-ui]";

export function extractTextsScript(): string {
  return `(function(){
    var w=window,wAny=w;
    wAny[${JSON.stringify(STATE)}]=undefined;
    var nodes=[],texts=[];
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(node){
      var t=node.nodeValue;if(!t||!t.trim())return NodeFilter.FILTER_REJECT;
      var el=node.parentElement;if(!el||el.closest(${JSON.stringify(SKIP_SELECTOR)}))return NodeFilter.FILTER_REJECT;
      var cs=getComputedStyle(el);if(cs.display==="none"||cs.visibility!=="visible")return NodeFilter.FILTER_REJECT;
      if(el.checkVisibility&&!el.checkVisibility({checkVisibilityCSS:true}))return NodeFilter.FILTER_REJECT;
      var v=t.trim();if(v.length<2||!/[\\p{L}\\p{N}]/u.test(v))return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    var n;while((n=walker.nextNode())&&nodes.length<${MAX_TRANSLATE_NODES}){nodes.push(n);texts.push(n.nodeValue.trim());}
    wAny[${JSON.stringify(STATE)}]={doc:document,nodes:nodes,originals:texts.map(function(t){return t;})};
    return {texts:texts,title:document.title||"",lang:document.documentElement.lang||""};
  })()`;
}

/** Applies translations in place; originals live in the state for restore. */
export function applyTranslationsScript(translations: string[]): string {
  return `(function(){
    var st=window[${JSON.stringify(STATE)}];
    if(!st||st.doc!==document)return {applied:0,expired:true};
    var applied=0;
    for(var i=0;i<st.nodes.length&&i<${JSON.stringify(translations)}.length;i++){
      var node=st.nodes[i],next=${JSON.stringify(translations)}[i];
      if(!node||!node.isConnected||typeof next!=="string"||!next.trim())continue;
      if(node.nodeValue.trim()===next.trim())continue;
      node.nodeValue=node.nodeValue.replace(node.nodeValue.trim(),next);
      applied++;
    }
    document.documentElement.setAttribute("data-aux-translated","1");
    return {applied:applied,expired:false};
  })()`;
}

export function restoreOriginalScript(): string {
  return `(function(){
    var st=window[${JSON.stringify(STATE)}];
    if(!st||st.doc!==document)return 0;
    var restored=0;
    for(var i=0;i<st.nodes.length;i++){
      var node=st.nodes[i];
      if(node&&node.isConnected){node.nodeValue=st.originals[i];restored++;}
    }
    document.documentElement.removeAttribute("data-aux-translated");
    window[${JSON.stringify(STATE)}]=undefined;
    return restored;
  })()`;
}

/** Selection translation bubble — shadow DOM so page styles never leak in. */
export function translateBubbleScript(x: number, y: number, lang: string, targetLabel: string, translated: string): string {
  return `(function(){
    var old=document.getElementById("__aux-translate-bubble");if(old)old.remove();
    var host=document.createElement("div");host.id="__aux-translate-bubble";host.setAttribute("data-aux-ui","");
    var shadow=host.attachShadow({mode:"closed"});
    var css=":host{all:initial}.bubble{position:fixed;left:${Math.round(Math.max(8, x - 170))}px;top:${Math.round(y + 12)}px;z-index:2147483647;max-width:340px;max-height:260px;overflow:auto;background:#1c1c1e;color:#eee;font:13px -apple-system,sans-serif;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.45),0 0 0 .5px rgba(255,255,255,.15);padding:12px 14px}.head{font:600 11px -apple-system,sans-serif;opacity:.65;margin-bottom:6px;letter-spacing:.02em}.body{white-space:pre-wrap;line-height:1.45}.row{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}button{font:12px -apple-system,sans-serif;background:rgba(255,255,255,.12);color:#eee;border:0;border-radius:6px;padding:4px 10px;cursor:pointer}button:hover{background:rgba(255,255,255,.22)}";
    var style=document.createElement("style");style.textContent=css;shadow.appendChild(style);
    var box=document.createElement("div");box.className="bubble";
    var head=document.createElement("div");head.className="head";head.textContent=${JSON.stringify(lang)}+" → "+${JSON.stringify(targetLabel)}+" · translated by Aux";
    var body=document.createElement("div");body.className="body";body.textContent=${JSON.stringify(translated)};
    var row=document.createElement("div");row.className="row";
    var copy=document.createElement("button");copy.textContent="Copy";
    copy.onclick=function(){try{navigator.clipboard.writeText(${JSON.stringify(translated)});}catch(e){}};
    var done=document.createElement("button");done.textContent="Done";done.onclick=function(){host.remove();};
    row.appendChild(copy);row.appendChild(done);box.appendChild(head);box.appendChild(body);box.appendChild(row);shadow.appendChild(box);
    document.documentElement.appendChild(host);
    document.addEventListener("pointerdown",function h(e){if(!host.isConnected){document.removeEventListener("pointerdown",h);return;}if(!e.composedPath().includes(host)){host.remove();document.removeEventListener("pointerdown",h);}},true);
    return true;
  })()`;
}
