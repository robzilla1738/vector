// Original local acceptance tooling. Product artifacts never import this module.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, join, relative } from 'node:path';
import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('node scripts/parity.mjs --manifest <json> --out <directory>\nRequires explicit thresholds and disposable live-reference/live-aux evidence per light/dark surface. Incomplete coverage exits 1.');
  process.exit(0);
}
const option = name => { const i = args.indexOf(name); return i < 0 ? undefined : args[i + 1]; };
const manifestPath = resolve(option('--manifest') ?? 'docs/acceptance/visual-manifest.json');
const output = resolve(option('--out') ?? 'out/parity');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.version !== 1 || !Array.isArray(manifest.surfaces) || !manifest.surfaces.length) throw Error('Invalid or empty surface manifest');
await mkdir(output, { recursive: true });

// Decode ordinary lossless browser screenshots without installing image dependencies.
function png(bytes) {
  if (!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw Error('Not PNG');
  let width, height, channels; const data = [];
  for (let offset=8; offset < bytes.length;) {
    const size=bytes.readUInt32BE(offset), type=bytes.toString('ascii',offset+4,offset+8);
    const body=bytes.subarray(offset+8,offset+8+size);
    if (body.length !== size || offset+size+12 > bytes.length) throw Error('Truncated PNG');
    if (type === 'IHDR') {
      width=body.readUInt32BE(0); height=body.readUInt32BE(4);
      channels=body[9] === 6 ? 4 : body[9] === 2 ? 3 : 0;
      if (body[8] !== 8 || !channels || body[10] || body[11] || body[12]) throw Error('Requires non-interlaced 8-bit RGB/RGBA PNG');
      if (!width || !height || width*height > 40000000) throw Error('Invalid or oversized PNG');
    }
    if (type === 'IDAT') data.push(body);
    offset += size+12;
    if (type === 'IEND') break;
  }
  const stride=width*channels, raw=inflateSync(Buffer.concat(data), {maxOutputLength:(stride+1)*height});
  if(raw.length !== (stride+1)*height) throw Error('Invalid PNG scanlines');
  const pixels=Buffer.alloc(width*height*4), rows=Buffer.alloc(stride*height);
  const paeth=(a,b,c)=>{const p=a+b-c, x=Math.abs(p-a), y=Math.abs(p-b), z=Math.abs(p-c);return x<=y&&x<=z?a:y<=z?b:c;};
  for(let y=0;y<height;y++) {
    const filter=raw[y*(stride+1)]; if(filter>4) throw Error('Invalid PNG filter');
    for(let x=0;x<stride;x++) {
      const pos=y*stride+x, a=x>=channels?rows[pos-channels]:0, b=y?rows[pos-stride]:0, c=y&&x>=channels?rows[pos-stride-channels]:0;
      rows[pos]=(raw[y*(stride+1)+1+x]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;
    }
    for(let x=0;x<width;x++) {const p=y*stride+x*channels, q=(y*width+x)*4;pixels[q]=rows[p];pixels[q+1]=rows[p+1];pixels[q+2]=rows[p+2];pixels[q+3]=channels===4?rows[p+3]:255;}
  }
  return {width,height,pixels};
}
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const validEvidence = (e,kind) => e && e.kind===kind && e.disposableProfile===true && e.version && e.capturedAt && Number.isFinite(e.deviceScaleFactor) && e.deviceScaleFactor>0 && e.viewport?.width>0 && e.viewport?.height>0;
const results=[]; const keys=new Set();
for(const surface of manifest.surfaces) {
  if(typeof surface.id!=='string' || !/^[a-z0-9][a-z0-9-]*$/.test(surface.id)) throw Error('Invalid surface id');
  for(const theme of ['light','dark']) {
    const key=`${surface.id}:${theme}`;if(keys.has(key))throw Error(`Duplicate surface ${key}`);keys.add(key);
    const entry=surface[theme], result={id:surface.id,theme,spec:surface.spec,status:'missing',reason:'No capture pair supplied'};
    results.push(result);
    if(!entry?.reference || !entry?.candidate) continue;
    if(!validEvidence(entry.referenceEvidence,'live-reference') || !validEvidence(entry.candidateEvidence,'live-aux')) {result.status='invalid-evidence';result.reason='Both captures require versioned live-host evidence from disposable profiles';continue;}
    const a=entry.referenceEvidence,b=entry.candidateEvidence;
    if(a.deviceScaleFactor!==b.deviceScaleFactor || a.viewport.width!==b.viewport.width || a.viewport.height!==b.viewport.height || a.theme!==theme || b.theme!==theme) {result.status='invalid-evidence';result.reason='Theme, viewport or scale mismatch';continue;}
    const threshold=entry.threshold;
    if(!threshold || !Number.isInteger(threshold.pixelDelta) || threshold.pixelDelta<0 || threshold.pixelDelta>255 || !Number.isFinite(threshold.maxChangedFraction) || threshold.maxChangedFraction<0 || threshold.maxChangedFraction>1 || !threshold.reason) {result.status='missing-threshold';result.reason='Explicit pixelDelta, maxChangedFraction and rationale required';continue;}
    try {
      const referencePath=resolve(dirname(manifestPath),entry.reference),candidatePath=resolve(dirname(manifestPath),entry.candidate);
      const [rbytes,cbytes]=await Promise.all([readFile(referencePath),readFile(candidatePath)]);
      const ref=png(rbytes),candidate=png(cbytes);
      Object.assign(result,{reference:referencePath,candidate:candidatePath,referenceSha256:digest(rbytes),candidateSha256:digest(cbytes),threshold});
      if(ref.width!==candidate.width||ref.height!==candidate.height) throw Error('Image dimensions differ');
      if(ref.width!==Math.round(a.viewport.width*a.deviceScaleFactor)||ref.height!==Math.round(a.viewport.height*a.deviceScaleFactor)) throw Error('PNG dimensions differ from declared viewport and scale');
      const masks=entry.masks??[];
      for(const m of masks) if(!m.reviewed || !m.reason || ![m.x,m.y,m.width,m.height].every(Number.isInteger) || m.x<0||m.y<0||m.width<=0||m.height<=0||m.x+m.width>ref.width||m.y+m.height>ref.height) throw Error('Invalid/unreviewed mask');
      let changed=0,compared=0,absolute=0,masked=0;
      for(let y=0;y<ref.height;y++)for(let x=0;x<ref.width;x++) {
        if(masks.some(m=>x>=m.x&&x<m.x+m.width&&y>=m.y&&y<m.y+m.height)){masked++;continue;}
        const q=(y*ref.width+x)*4;let delta=0;
        for(let channel=0;channel<4;channel++){const d=Math.abs(ref.pixels[q+channel]-candidate.pixels[q+channel]);delta=Math.max(delta,d);absolute+=d;}
        compared++;if(delta>threshold.pixelDelta)changed++;
      }
      if(!compared || masked/(ref.width*ref.height)>0.2) throw Error('Mask excludes all or over20% of pixels; split/review surface instead');
      const fraction=changed/compared;
      const referencePreview=`${surface.id}-${theme}-reference.png`,candidatePreview=`${surface.id}-${theme}-candidate.png`;
      await Promise.all([writeFile(join(output,referencePreview),rbytes),writeFile(join(output,candidatePreview),cbytes)]);
      result.previews={reference:referencePreview,candidate:candidatePreview};
      Object.assign(result,{status:fraction<=threshold.maxChangedFraction?'passed':'different',reason:'Compared decoded RGBA pixels; no antialiasing suppression',width:ref.width,height:ref.height,changedPixels:changed,comparedPixels:compared,maskedPixels:masked,changedFraction:fraction,meanAbsoluteChannelDifference:absolute/(compared*4),masks});
    } catch(error){result.status='invalid-capture';result.reason=error.message;}
  }
}
const summary={total:results.length,passed:results.filter(r=>r.status==='passed').length};summary.incomplete=summary.total-summary.passed;
const report={version:1,generatedAt:new Date().toISOString(),manifest:manifestPath,summary,results};
await writeFile(join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rows=results.map(r=>`<tr><td>${escape(r.id)}</td><td>${r.theme}</td><td>${r.status}</td><td>${escape(r.reason)}</td><td>${r.changedFraction===undefined?'':(100*r.changedFraction).toFixed(3)+'%'}</td><td>${r.previews?`<a href="${r.previews.reference}"><img alt="Reference" loading="lazy" width="180" src="${r.previews.reference}"></a> <a href="${r.previews.candidate}"><img alt="Aux" loading="lazy" width="180" src="${r.previews.candidate}"></a>`:''}</td></tr>`).join('');
await writeFile(join(output,'report.html'),`<!doctype html><meta charset="utf-8"><title>Aux visual acceptance</title><style>body{font:14px system-ui;margin:32px;color:#222}table{border-collapse:collapse;width:100%}td,th{padding:8px;border:1px solid #ddd;text-align:left}th{background:#eee}</style><h1>Aux visual acceptance</h1><p>${summary.passed}/${summary.total} comparisons passed. ${summary.incomplete} remain incomplete or different.</p><table><thead><tr><th>Surface</th><th>Theme</th><th>Status</th><th>Evidence</th><th>Changed</th><th>Reference / Aux</th></tr></thead><tbody>${rows}</tbody></table>`);
console.log(JSON.stringify({summary,report:relative(process.cwd(),join(output,'report.json'))}));
process.exitCode=summary.incomplete?1:0;
