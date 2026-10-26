import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
source=Path('/private/tmp/aux-direct-fixed-dispatch-20261026-a2/aux-native-entry.mjs')
s=source.read_text();start=s.index('async function captureFullPage(');end=s.index('async function captureViewport(',start)
code=s[start:end];code=code[:code.index('var MAX_SCREENSHOT_TEXTURE_SIZE')]
rules=[('ei.push(Buffer.from(ri,`base64`))','ei.push(Uint8Array.from(atob(ri),value=>value.charCodeAt(0)))'),('ti.readUInt32BE(16)','new DataView(ti.buffer,ti.byteOffset,ti.byteLength).getUint32(16)'),('`data:image/png;base64,${composePngTiles({tiles:ei,plan:fi,scaleMultiplier:ii>0?ni/ii:1,pageWidthCss:Math.max(1,ii||ui),pageHeightCss:di}).toString(`base64`)}`','await composePngTiles({tiles:ei,plan:fi,scaleMultiplier:ii>0?ni/ii:1,pageWidthCss:Math.max(1,ii||ui),pageHeightCss:di})')]
for old,new in rules:assert code.count(old)==1;code=code.replace(old,new)
plan=s[s.index('function planVerticalTiles('):s.index('function composePngTiles(')]
constants='''const MAX_SCREENSHOT_TEXTURE_SIZE=16384,CAPTURE_SCREENSHOT_TIMEOUT_MS$1=15000,STITCH_STYLE_ID='aux-fullpage-stitch',STITCH_FIXED_ATTR='data-aux-stitch-fixed',STITCH_BASE_CSS='html { scroll-behavior: auto !important; }\\naux-capture-toolbar, aux-capture-backdrop, aux-capture-anchor { visibility: hidden !important; }',STITCH_FIXED_CSS='[data-aux-stitch-fixed] { visibility: hidden !important; }';'''
owner=(HERE/'owner.js').read_text().replace('/* SUPPLIED_ALGORITHM */',constants+'\n'+plan+'\n'+code)
(HERE/'composed.js').write_text(owner)
p=Path('/private/tmp/aux-profile-binding-diagnostic-20261026-a1/background.js');before=p.read_text()
find='input=>D.capture.fullPage.mutate(input)';replace='input=>auxCaptureFullPageFixed(input,t.tab.id)';assert before.count(find)==1
anchor='async function zg(e,t){';assert before.count(anchor)==1
patch=[{'find':anchor,'replace':owner+'\n'+anchor,'count':1},{'find':find,'replace':replace,'count':1}]
after=before
for row in patch:after=after.replace(row['find'],row['replace'])
sha=lambda b:hashlib.sha256(b).hexdigest()
(HERE/'proposal.json').write_text(json.dumps({'format':'aux.fullpage-fixed.v1','algorithmSource':{'path':str(source),'sha256':sha(source.read_bytes()),'countedAdaptations':rules},'resources':[{'path':str(p),'name':'background.js','beforeSha256':sha(p.read_bytes()),'afterSha256':sha(after.encode())}],'rules':patch},indent=2)+'\n')
prep=(HERE.parent/'direct-fixed-dispatch/prepare.py').read_text().replace('aux.direct-fixed-dispatch-preparation.v1','aux.fullpage-fixed-preparation.v1');(HERE/'prepare.py').write_text(prep)
