export const journey={id:'applescript',title:'Native Aux AppleScript tab terms, Space focus and execution refusals',features:['appleScript'],devAcceptance:['appleScript','profiles','spaces'],needs:['accessibility','screen-recording'],model:'none',launch:{},timeoutMs:90_000,owner:'L6'};
export async function run(t){
 await t.step('count tabs, make a tab and read Arc-compatible location',{kind:'rpc',features:['appleScript']},async()=>{
  const before=await t.app.appleScript('return count tabs of front window');
  t.assert.ok(Number(before.stdout.trim())>=1);
  await t.app.appleScript(`tell front window to make new tab with properties {URL:${JSON.stringify(`${t.fixture.url}/red`)}}`);
  await t.until('AppleScript-created actual page',async()=>(await t.rpc('pages.list')).some(page=>page.url===`${t.fixture.url}/red`));
  const location=await t.app.appleScript('return location of active tab of front window');t.assert.match(location.stdout.trim(),/^(topApp|pinned|unpinned)$/);
  return {rpc:{count:Number(before.stdout.trim()),location:location.stdout.trim(),pages:await t.rpc('pages.list')}};
 });
 await t.step('Space enumeration and focus changes actual window placement',{kind:'rpc',features:['appleScript']},async()=>{
   const selected=await t.app.appleScript('tell front window\nset chosen to first space\nfocus chosen\nreturn id of active space\nend tell');
   const snapshot=await t.rpc('workspace.get');t.assert.equal(snapshot.layout.activeSpaceId,selected.stdout.trim());
   return {rpc:{spaceId:selected.stdout.trim(),layout:snapshot.layout}};
 });
 await t.step('default-off execution refusal',{kind:'rpc',features:['appleScript']},async()=>{
   const rejected=await t.app.appleScript('tell active tab of front window to execute javascript "document.title"');
   t.assert.notEqual(rejected.exitCode,0);t.assert.match(rejected.stderr,/JavaScript|javascript|not allowed|not permitted|unsupported/i);return {rpc:{executionRefused:true,exitCode:rejected.exitCode}};
 });
 await t.step('Advanced preference warning is present and opt-in remains unchecked',{kind:'ui',features:['appleScript']},async()=>{
   await t.ax.key('command+,','hid');await t.ax.press({name:'Advanced',scope:'shell',index:0});await t.ax.waitFor({name:'Allow JavaScript from Apple Events',scope:'shell'});
   const ax=await t.ax.dump();t.assert.match(JSON.stringify(ax),/off by default/);return {ax,rpc:{pages:await t.rpc('pages.list')}};
 });
}
