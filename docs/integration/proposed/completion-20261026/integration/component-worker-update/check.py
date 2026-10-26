import json,subprocess,sys,tempfile
from pathlib import Path
helper=Path(__file__).with_name('prepare.py')
with tempfile.TemporaryDirectory(prefix='aux-worker-version-fixture-') as tmp:
 root=Path(tmp);candidate=root/'extension';candidate.mkdir();manifest=candidate/'manifest.json';worker=candidate/'background.js'
 original={'version':'1.26.1016.1885','version_name':'1.26.1016.1852','background':{'service_worker':'background.js'}}
 manifest.write_text(json.dumps(original));worker.write_text('const fixture=1;')
 def run(output,*args):
  subprocess.run([sys.executable,str(helper),'--candidate',str(candidate),'--output',str(output),*args],check=True,capture_output=True)
  return json.loads((output/'receipt.json').read_text())
 first=root/'first';a=run(first,'--bootstrap-version',original['version']);assert a['version']=='1.26.1016.1886'
 manifest.write_bytes((first/'manifest.json').read_bytes())
 second=root/'second';b=run(second,'--previous-receipt',str(first/'receipt.json'));assert not b['versionAdvanced'];assert (second/'manifest.json').read_bytes()==manifest.read_bytes()
 worker.write_text('const fixture=2;');third=root/'third';c=run(third,'--previous-receipt',str(second/'receipt.json'));assert c['version']=='1.26.1016.1887';assert c['sourceVersionName']==original['version_name']
 changed=json.loads((third/'manifest.json').read_text());changed['version']=original['version'];assert changed==original
print('Changed payload advances once; unchanged payload retains version; source provenance preserved.')
