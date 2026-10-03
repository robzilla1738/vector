/** Runs only in an isolated world. Secret controls are classified before value access. */
export const RECORDER_SOURCE = String.raw`(() => {
  if (globalThis.__auxRecorderInstalled) return;
  globalThis.__auxRecorderInstalled = true;
  const sensitive = el => {
    const tokens=(el.autocomplete || '').toLowerCase().split(/\s+/);
    if(tokens.includes('new-password')) return 'sensitive';
    if(el.type === 'password') return 'password';
    if(tokens.some(token=>token.startsWith('cc-'))) return 'payment';
    if(tokens.includes('one-time-code')) return 'otp';
    return /password|passphrase|secret|token|cvv|cvc|ssn/i.test([el.name,el.id,el.getAttribute('aria-label')].join(' ')) ? 'sensitive' : null;
  };
  const label = el => (el.labels?.[0]?.textContent || el.getAttribute('aria-label') || el.name || el.id || '').trim().slice(0,200);
  const target = el => {
    const candidates = [];
    const add = (selector,count) => { if (selector && selector.length <= 2000) candidates.push({selector,matches:count}); };
    if (el.id) add('css:#'+CSS.escape(el.id), document.querySelectorAll('#'+CSS.escape(el.id)).length);
    const testid = el.getAttribute('data-testid');
    if (testid) add('testid:'+testid, [...document.querySelectorAll('[data-testid]')].filter(x=>x.getAttribute('data-testid')===testid).length);
    if (el.name) add('name:'+el.name,[...document.querySelectorAll('[name]')].filter(x=>x.name===el.name).length);
    const name = (el.labels?.[0]?.textContent || el.getAttribute('aria-label') || '').trim().slice(0,200);
    if (name) add('label:'+name,[...document.querySelectorAll('input,textarea,select,button')].filter(x=>label(x)===name).length);
    const role = el.getAttribute('role') || ({BUTTON:'button',A:'link',INPUT:'textbox',TEXTAREA:'textbox'})[el.tagName];
    const text = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0,200);
    if (text) add('text:'+text,[...document.querySelectorAll(el.tagName)].filter(x=>(x.textContent||'').trim()===text).length);
    if (role && text) add('role:'+role+'|'+text,[...document.querySelectorAll(el.tagName)].filter(x=>(x.getAttribute('aria-label')||x.textContent||'').trim()===text).length);
    return candidates.length ? {candidates:candidates.slice(0,12)} : null;
  };
  const listeners = [];
  globalThis.__auxRecorderStop = () => { for (const [event, listener] of listeners) document.removeEventListener(event, listener, true); globalThis.__auxRecorderInstalled = false; };
  let entered;
  for (const event of ['click','input','change','keydown']) { const listener=e=>{
    if (!e.isTrusted || !(e.target instanceof Element)) return;
    const el=e.target.closest('input,textarea,select,button,a,[role]') || e.target;
    if(event==='click' && e.detail===0 && entered && Date.now()-entered.at<300 && (entered.el===el || entered.form && entered.form===el.form)) return;
    const t=target(el); if (!t) return;
    let step;
    if (event==='input'||event==='change') { if(['checkbox','radio'].includes(el.type)) return; const secretType=sensitive(el); step=secretType?{kind:'credentialFill',secretType,target:t}:{kind:'input',control:el.tagName==='SELECT'?'select':'text',target:t,value:String(el.value||'').slice(0,4000),label:label(el)}; }
    else if(event==='keydown') { if(!['Enter','Tab','Escape'].includes(e.key))return; if(e.key==='Enter')entered={at:Date.now(),el,form:el.form}; step={kind:'key',target:t,key:e.key}; }
    else step={kind:event,target:t};
    globalThis.__auxRec(JSON.stringify(step));
  }; listeners.push([event,listener]); document.addEventListener(event,listener,true); }
})()`;
