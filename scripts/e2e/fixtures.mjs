import { createServer } from 'node:http';
import { createHash, randomUUID } from 'node:crypto';

export async function fixtures(options = {}) {
  const nonce = randomUUID();
  const marker = options.marker ?? `CEDAR-${randomUUID().slice(0, 8)}`;
  if (!/^CEDAR-[a-f0-9]{8}$/.test(marker)) throw Error('Invalid disposable fixture marker');
  const events = new Map();
  const record = (id, value) => events.set(id, [...(events.get(id) ?? []), value]);
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    const [_, suite, token, id, action] = url.pathname.split('/');
    if (suite !== 'suite' || token !== nonce || !/^[\w-]+$/.test(id ?? '')) { response.writeHead(404).end(); return; }
    response.setHeader('Cache-Control', 'no-store');
    if (request.method === 'POST' && action === 'event') {
      let bytes = '';
      for await (const chunk of request) { bytes += chunk; if (bytes.length > 10000) { response.writeHead(413).end(); return; } }
      try { record(id, JSON.parse(bytes)); response.writeHead(200, { 'Content-Type': 'application/json' }).end('{}'); }
      catch { response.writeHead(400).end(); }
      return;
    }
    if (request.method !== 'GET') { response.writeHead(405).end(); return; }
    record(id, { action: 'visit', path: url.pathname });
    const pages = {
      read: `<h1>Cedar dispatch</h1><p>Project code: ${marker}</p><p>Delivery is Wednesday at 14:30.</p>`,
      form: '<h1>Disposable delivery form</h1><label>Name<input id="name"></label><label>City<input id="city"></label><button id="save">Save delivery</button><p id="result" role="status"></p>',
      toggle: '<h1>Test notifications</h1><p id="result">Disabled</p><button id="toggle">Enable test notifications</button>',
      filter: '<h1>Test catalog</h1><label>Search catalog<input id="query"></label><button id="filter">Filter catalog</button><ul id="results"><li>Azure notebook</li><li>Amber pencil</li><li>Scarlet folder</li></ul><p id="result"></p>',
      pagination: '<h1>Dispatch records</h1><p id="result">Record 1: Birch, 12 crates</p><button id="next">Next record</button>',
      sort: '<h1>Inventory quantities</h1><ul id="results"><li>Birch: 18</li><li>Cedar: 4</li><li>Maple: 11</li></ul><button id="sort">Sort by quantity</button>',
      basket: '<h1>Disposable basket</h1><button id="notebook">Add notebook to test basket</button><button id="pencil">Add pencil to test basket</button><p id="result">Notebook: 0, Pencil: 0</p>',
      todo: '<h1>Local task list</h1><label>Task title<input id="title"></label><button id="add">Add test task</button><ul id="results"></ul>',
      details: `<h1>Dispatch details</h1><button id="expand">Show dispatch reference</button><p id="result" hidden>Reference ${marker}, gate 7.</p>`,
      directory: `<h1>Team directory</h1><a href="/suite/${nonce}/detail">Open Cedar team details</a>`,
      detail: `<h1>Cedar team</h1><p>Contact code ${marker}. Storage room 42.</p>`,
    };
    if (!(id in pages)) { response.writeHead(404).end(); return; }
    const js = `
      const $=id=>document.getElementById(id);
      const emit=data=>fetch(location.pathname+'/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      if($('save')) $('save').onclick=()=>{const name=$('name').value,city=$('city').value; $('result').textContent='Saved '+name+' in '+city;emit({action:'saved',name,city});};
      if($('toggle')) $('toggle').onclick=()=>{$('result').textContent='Enabled';emit({action:'enabled'});};
      if($('filter')) $('filter').onclick=()=>{const query=$('query').value;const rows=['Azure notebook','Amber pencil','Scarlet folder'].filter(x=>x.toLowerCase().includes(query.toLowerCase()));$('results').replaceChildren(...rows.map(x=>Object.assign(document.createElement('li'),{textContent:x})));$('result').textContent=rows.length+' matching items';emit({action:'filtered',query,rows});};
      if($('next')) $('next').onclick=()=>{$('result').textContent='Record 2: Cedar, 27 crates';emit({action:'page',page:2});};
      if($('sort')) $('sort').onclick=()=>{$('results').innerHTML='<li>Cedar: 4</li><li>Maple: 11</li><li>Birch: 18</li>';emit({action:'sorted',order:['Cedar','Maple','Birch']});};
      if($('notebook')){let n=0,p=0;const update=()=>{$('result').textContent='Notebook: '+n+', Pencil: '+p;emit({action:'basket',notebook:n,pencil:p});};$('notebook').onclick=()=>{n++;update();};$('pencil').onclick=()=>{p++;update();};}
      if($('add')) $('add').onclick=()=>{const title=$('title').value;$('results').append(Object.assign(document.createElement('li'),{textContent:title}));$('title').value='';emit({action:'added',title});};
      if($('expand')) $('expand').onclick=()=>{$('result').hidden=false;emit({action:'expanded'});};
    `;
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Aux disposable acceptance fixture</title><style>body{font:18px system-ui;max-width:700px;margin:48px auto;padding:24px}label{display:block;margin:16px 0}input,button{font:inherit;padding:8px;margin:6px}li{margin:12px}</style></head><body>${pages[id]}<script>${js}</script></body></html>`);
  });
  await new Promise((done, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', done); });
  const origin = `http://127.0.0.1:${server.address().port}/suite/${nonce}`;
  return { marker, url: id => `${origin}/${id}`, events: id => events.get(id) ?? [], close: () => new Promise(done => server.close(done)) };
}

// Deterministic synthetic context, bounded below the supplied256000-character
// command cap. Several real turns may be needed to reach its64000-token floor.
export function compactionBackground(runId, round) {
  return Array.from({ length: 1800 }, (_, index) =>
    `${round}:${index} ${createHash('sha256').update(`${runId}:${round}:${index}`).digest('hex')}`).join('\n');
}
