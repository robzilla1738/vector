// Focused actual native import acceptance; importing this module performs no I/O.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

export async function proveFixtureBoundary({fixtureManifest, app, browserPid}) {
  const manifest = JSON.parse(await fs.readFile(fixtureManifest, 'utf8'));
  assert.equal(manifest.syntheticOnly, true);
  assert.equal(manifest.containsCredentials, false);
  assert(Number.isSafeInteger(browserPid) && browserPid > 1);
  const root = manifest.root;
  assert.equal(await fs.realpath(root), root);
  assert(root.startsWith('/private/tmp/aux-import-synthetic-'));
  const stat = await fs.lstat(root);
  assert(stat.isDirectory() && !stat.isSymbolicLink());
  assert.equal(stat.uid, process.getuid());
  assert.equal(stat.mode & 0o777, 0o700);
  const expectedFiles = new Set([
    'Library/Application Support/Google/Chrome/Local State',
    'Library/Application Support/Google/Chrome/Default/Preferences',
    'Library/Application Support/Google/Chrome/Default/Bookmarks',
    'Library/Application Support/Google/Chrome/Default/History',
  ]);
  async function walk(directory) {
    for (const entry of await fs.readdir(directory, {withFileTypes:true})) {
      const file = path.join(directory, entry.name);
      assert(!entry.isSymbolicLink(), 'Fixture must not contain symlinks');
      if (entry.isDirectory()) await walk(file);
      else {
        assert(entry.isFile(), 'Unexpected fixture leaf');
        assert(expectedFiles.delete(path.relative(root,file)), 'Unexpected fixture file');
      }
    }
  }
  await walk(root);
  assert.equal(expectedFiles.size,0);
  const appPath = await fs.realpath(app);
  const executable = path.join(appPath,'Contents/MacOS/Aux');
  const command = execFileSync('/bin/ps',['-p',String(browserPid),'-o','comm='],{encoding:'utf8',maxBuffer:1024*1024}).trim();
  assert.equal(command,executable,'Expected exact disposable Aux process');
  const listeners = execFileSync('/usr/sbin/lsof',['-nP','-iTCP:45203','-sTCP:LISTEN','-Fp'],{encoding:'utf8',maxBuffer:1024*1024});
  const pids = [...new Set([...listeners.matchAll(/^p(\d+)$/gm)].map(m=>Number(m[1])))];
  assert.deepEqual(pids,[browserPid],'Isolated authenticated CDP must belong to the exact process');
  // Capture this owned process's inherited environment only in memory. Never
  // return/log the raw command or environment, which may contain credentials.
  let environment = execFileSync('/bin/ps',['eww','-p',String(browserPid),'-o','command='],{encoding:'utf8',maxBuffer:4*1024*1024});
  const escaped = root.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const fixturePresent = new RegExp('(?:^|\\s)AUX_IMPORT_FIXTURE_HOME='+escaped+'(?:\\s|$)').test(environment);
  environment = undefined;
  assert(fixturePresent,'Fixture environment absent: do not invoke source discovery');
  return {fixtureBoundaryVerified:true,browserPid,app:appPath,fixtureRoot:root};
}

function pageProbe({mode,extensionId}) {
  return `(async()=>{
    const fail = stage => { throw new Error('AUX_SYNTHETIC_IMPORT_'+stage); };
    if (!globalThis.chrome || chrome.runtime?.id !== ${JSON.stringify(extensionId)}) fail('WRONG_EXTENSION');
    if (!chrome.auxBrowserImport || !chrome.bookmarks || !chrome.history) fail('API_UNAVAILABLE');
    const expected = [
      {url:'https://aux-import.test/history-one',title:'Aux Synthetic History One',count:2},
      {url:'https://aux-import.test/history-two',title:'Aux Synthetic History Two',count:1}
    ];
    const verifyData = async()=>{
      const found = await chrome.bookmarks.search({url:'https://aux-import.test/bookmark'});
      const bookmark = found.find(x=>x.title==='Aux Synthetic Bookmark');
      if (!bookmark) return false;
      const parent = await chrome.bookmarks.get(bookmark.parentId);
      if (!parent.some(x=>x.title==='Aux Import Fixture')) return false;
      const history = await chrome.history.search({text:'aux-import.test',startTime:0,maxResults:50});
      return expected.every(e=>history.some(x=>x.url===e.url && x.title===e.title && x.visitCount===e.count));
    };
    const report = {mode:${JSON.stringify(mode)},passwordRejected:false,importSucceeded:false,bookmarkHierarchy:false,historyRows:false};
    if (${JSON.stringify(mode)} === 'import') {
      const priorBookmarks=await chrome.bookmarks.search({url:'https://aux-import.test/bookmark'});
      const priorHistory=await chrome.history.search({text:'aux-import.test',startTime:0,maxResults:50});
      if(priorBookmarks.length || priorHistory.some(x=>expected.some(e=>e.url===x.url))) fail('FIXTURE_ALREADY_IMPORTED');
      const sources = await chrome.auxBrowserImport.getImportSources();
      const available = sources.filter(s=>s.id!=='safari' && (s.profiles?.length??0)>0);
      if (available.length!==1 || available[0].id!=='chrome') fail('UNEXPECTED_SOURCE_INVENTORY');
      const source=available[0];
      if (source.profiles.length!==1) fail('UNEXPECTED_PROFILE_COUNT');
      const profile=source.profiles[0];
      if (profile.name!=='Aux Synthetic Import') fail('UNEXPECTED_SOURCE_PROFILE');
      if (source.supportedDataKinds?.includes('passwords')) fail('PASSWORD_ADVERTISED');
      let unintended;
      try {
        unintended=await chrome.auxBrowserImport.startImport({sourceId:'chrome',sourceProfileId:profile.id,dataKinds:['passwords']});
      } catch(error) {
        report.passwordRejected=String(error.message??error).includes('Password import is disabled; use your existing password manager');
      }
      if (unintended?.jobId) await chrome.auxBrowserImport.cancelImport(unintended.jobId);
      if (!report.passwordRejected) fail('PASSWORD_REJECTION_MISSING');
      let job,terminal=false;
      try {
        job=await chrome.auxBrowserImport.startImport({sourceId:'chrome',sourceProfileId:profile.id});
        if (!job?.jobId) fail('JOB_MISSING');
        const deadline=Date.now()+30000;
        while(Date.now()<deadline){
          const progress=await chrome.auxBrowserImport.getImportProgress(job.jobId);
          if(progress.currentDataKind==='passwords') fail('PASSWORD_PROGRESS');
          if(progress.state==='succeeded'){terminal=true;report.importSucceeded=true;break;}
          if(progress.state==='failed'||progress.state==='cancelled'){terminal=true;fail('IMPORT_FAILED');}
          await new Promise(r=>setTimeout(r,250));
        }
        if(!report.importSucceeded) fail('IMPORT_TIMEOUT');
      } finally { if(job?.jobId&&!terminal) await chrome.auxBrowserImport.cancelImport(job.jobId); }
    }
    const deadline=Date.now()+15000;
    do {
      if(await verifyData()){report.bookmarkHierarchy=true;report.historyRows=true;break;}
      await new Promise(r=>setTimeout(r,250));
    } while(Date.now()<deadline);
    if(!report.bookmarkHierarchy||!report.historyRows) fail('DESTINATION_DATA_MISSING');
    report.paidRequest=false;
    return report;
  })()`;
}

// evaluate(expression) must use the existing authenticated Aux CDP connection
// and an actual supplied Agent page/default execution context, awaitPromise,
// returnByValue. It returns result.value only and suppresses exception payloads.
export async function runSyntheticImportProbe({mode,extensionId,evaluate,fixtureManifest,app,browserPid}) {
  assert(['import','after-restart'].includes(mode));
  assert(/^[a-p]{32}$/.test(extensionId));
  // Repeat live boundary proof for each run, before any extension API call.
  const proof = await proveFixtureBoundary({fixtureManifest,app,browserPid});
  const result = await evaluate(pageProbe({mode,extensionId}));
  assert(result && result.mode===mode && result.bookmarkHierarchy && result.historyRows,'Synthetic destination verification failed');
  if(mode==='import')assert(result.passwordRejected&&result.importSucceeded);
  return {...result,fixtureBoundaryVerified:proof.fixtureBoundaryVerified};
}
