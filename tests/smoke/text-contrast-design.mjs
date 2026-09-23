import {closeAux} from "./launch.mjs";
import {launchAux,root} from './launch.mjs';
import {mkdtempSync} from 'node:fs';
import assert from 'node:assert/strict';
const dir=mkdtempSync('/tmp/aux-text-contrast-');
const {app,page}=await launchAux({args:['--use-mock-keychain'],env:{...process.env,AUX_PROFILE_DIR:dir+'/profile',AUX_DATA_DIR:dir+'/data',AUX_LOAD_DOTENV:'0'}});
try {
 await page.locator('.aux-home').waitFor();
 if(await page.getByRole('button',{name:'Show sidebar',exact:true}).isVisible())await page.getByRole('button',{name:'Show sidebar',exact:true}).click();
 await page.getByRole('button',{name:'New chat project',exact:true}).click();
 for(const theme of ['dark','light']) {
  await page.evaluate(theme=>window.aux.invoke('settings.set',{theme}),theme);
  await page.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme);
  await page.locator('.session-editor').evaluate(async el=>{await Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished));});
  // Model the glass backdrop in the supplied screenshot; native wallpaper is not in the DOM.
  const values=await page.evaluate(theme=>{
   const base=theme==='dark'?'#555470':'#cacada';
   const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d');
   const rgba=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].map((v,i)=>i===3?v/255:v);};
   const blend=(front,back)=>front.slice(0,3).map((v,i)=>v*front[3]+back[i]*(1-front[3]));
   const lum=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
   return ['.session-editor input','.session-heading span','.session-editor .btn:disabled'].map(selector=>{
    const el=document.querySelector(selector);let bg=rgba(base);const parents=[];for(let n=el;n&&!n.matches('.chat-sidebar');n=n.parentElement)parents.unshift(n);
    for(const n of parents)bg=blend(rgba(getComputedStyle(n).backgroundColor),bg);
    const style=getComputedStyle(el,el.matches('input')?'::placeholder':null);const fg=blend(rgba(style.color),bg);const l=[lum(fg),lum(bg)].sort((a,b)=>b-a);
    return {selector,ratio:(l[0]+.05)/(l[1]+.05),opacity:style.opacity};
   });
  },theme);
  console.log(theme,values);
  for(const value of values){assert.ok(value.ratio>=4.5,`${theme} ${value.selector}: ${value.ratio}`);assert.equal(value.opacity,'1');}
  await page.screenshot({path:root+`/release/test-artifacts/tabs/text-contrast-${theme}.png`});
 }
 console.log('PASS project placeholder, section labels and disabled button text contrast on representative dark/light glass backdrops.');
} finally {await closeAux(app);}
