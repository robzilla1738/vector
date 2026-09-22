import {sidebarAction} from "./sidebar-action.mjs";
// Real development Electron shell; synthetic history, no credentials or model calls.
import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';
import { openDb, Repo } from '../../apps/runtime/dist/index.js';
const root = resolve(import.meta.dirname, '../..');
const { _electron } = createRequire(join(root, 'packages/chromium-driver/package.json'))('playwright-core');
const electron = createRequire(join(root, 'apps/desktop/package.json'))('electron');
const dir = mkdtempSync(join(tmpdir(), 'aux-history-ui-'));
mkdirSync(join(dir, 'data'));
const db = openDb(join(dir, 'data/aux-state.sqlite'));
const repo = new Repo(db);
const now = Date.now();
for (let i = 0; i < 620; i++) repo.saveRun({runId:`saved-${String(i).padStart(4,'0')}`,goal:`Review note ${i}`,status:'completed',pageIds:[],createdAt:now-i*60000,startedAt:now-i*60000,endedAt:now-i*60000+1000,statusMessage:'Saved research findings.'});
for (let i = 0; i < 55; i++) repo.saveRun({runId:`old-${String(i).padStart(4,'0')}`,goal:i===0?'Find the archived needle':`Continue archived research ${i}`,status:'completed',pageIds:[],config:{chatId:'old-thread'},createdAt:now-(1000-i)*60000,startedAt:now-(1000-i)*60000,endedAt:now-(1000-i)*60000+1000,statusMessage:'Earlier notes remain available.'});
db.close();
let app;
try {
  app = await _electron.launch({executablePath:electron,args:[join(root,'apps/desktop'),'--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'}});
  let page;
  for (let i=0;i<100;i++){page=app.windows().find(p=>p.url().includes('renderer/index.html'));if(page)break;await new Promise(r=>setTimeout(r,100));}
  assert.ok(page);
  await app.evaluate(({BaseWindow})=>BaseWindow.getAllWindows()[0].setSize(1200,944));
  await sidebarAction(page, "Chats");
  await page.locator('.history-conversation').nth(39).waitFor();
  await page.getByRole('button',{name:'Load more conversations',exact:true}).click();
  await page.locator('.history-conversation').nth(79).waitFor();
  const search=page.getByRole('textbox',{name:'Search conversations',exact:true});
  await search.fill('archived needle');
  await page.locator('.history-conversation').filter({hasText:'Continue archived research 54'}).waitFor();
  assert.equal(await page.locator('.history-conversation').count(),1);
  await page.screenshot({path:join(root,'release/test-artifacts/aux-history-search.png')});
  await page.locator('.history-conversation').click();
  await page.getByRole('button',{name:'Load earlier messages',exact:true}).waitFor();
  await page.getByRole('button',{name:'Load earlier messages',exact:true}).click();
  await page.locator('.user-message').getByText('Find the archived needle',{exact:true}).waitFor();
  assert.equal(await page.locator('.conversation-turn').count(),55);
  await page.screenshot({path:join(root,'release/test-artifacts/aux-history-earlier.png')});
  await sidebarAction(page, "Chats");
  await page.getByRole('textbox',{name:'Search conversations',exact:true}).fill('no matching synthetic history');
  await page.getByText('No conversations match your search.',{exact:true}).waitFor();
  console.log('Development app finds history beyond 500 turns, pages chats, opens the latest thread state, and loads earlier messages.');
} finally {await app?.close();rmSync(dir,{recursive:true,force:true});}
