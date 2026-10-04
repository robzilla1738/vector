import assert from 'node:assert/strict';
const loading={name:'Loading image…',match:'exact',scope:'shell'};
/** Original UI observation only: no delay, forced read, or private image identity. */
export function createMountedImagePreviewLifecycle(){
 const observations={qualification:'none',privateImageIdentity:'unobserved',asyncLoadingFocus:'pending-not-observed',reopen:'pending'};
 const narrow=async c=>{await c.unchanged();const windows=(await c.ax.windows()).filter(w=>w.layer===0&&w.width>0&&w.height>0);await c.unchanged();assert.equal(windows.length,1);assert.ok(windows[0].width>=720&&windows[0].width<=900,'Original observed narrow window required for modal lifecycle');};
 const loaded=async c=>{await c.unchanged();await c.ax.waitFor(c.close,'enabled');await c.ax.waitFor(loading,'absent');await c.ax.waitFor(c.fit,'enabled');await c.unchanged();assert.equal((await c.unique(c.close)).focused,true,'Original loaded image Close must own focus');assert.equal((await c.unique(c.fit)).checked,true);};
 return {observations,
  async afterOpen(c){
   await narrow(c);const rows=await c.ax.query(loading);await c.unchanged();assert.ok(rows.length<=1,'Ambiguous original loading state');
   if(rows.length===1){await c.unique(loading);await c.capture('home-mounted-image-preview-loading','home-mounted-image-preview-loading-observed-visual-only');await c.unique(loading);await loaded(c);await c.capture('home-mounted-image-preview-loaded-focus','home-mounted-image-preview-loaded-close-focused-visual-only');assert.equal((await c.unique(c.close)).focused,true);observations.asyncLoadingFocus='observed-original-loading-to-loaded-close-focus';}
   else await loaded(c);
  },
  async beforeClose(c){
   await narrow(c);await c.unique(c.close);await c.ax.key('escape','hid');await c.ax.waitFor(c.close,'absent');await c.unchanged();assert.equal((await c.unique(c.preview)).focused,true,'Escape must return to exact original mounted Preview');
   await c.capture('home-mounted-image-preview-escaped','home-mounted-image-preview-escaped-original-tray-focused-visual-only');
   await c.click(c.preview);await loaded(c);await c.capture('home-mounted-image-preview-reopened','home-mounted-image-preview-same-original-tray-reopened-close-focused-visual-only');await c.unchanged();assert.equal((await c.unique(c.close)).focused,true);
   observations.reopen='observed-same-original-ui-control';
  },
 };
}
