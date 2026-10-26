from pathlib import Path
import hashlib,json,subprocess,sys
HERE=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
p=HERE/'plan.json';plan=json.loads(p.read_text());out=Path(sys.argv[1]).resolve();assert not out.exists();prepared=[]
for row in plan['resources']:
 data=Path(row['path']).read_bytes();assert sha(data)==row['beforeSha256'];text=data.decode()
 for rule in plan['rules']:assert text.count(rule['find'])==rule['count'];text=text.replace(rule['find'],rule['replace'])
 reverse=text
 for rule in reversed(plan['rules']):assert reverse.count(rule['replace'])==rule['count'];reverse=reverse.replace(rule['replace'],rule['find'])
 assert reverse.encode()==data and sha(text.encode())==row['afterSha256'];prepared.append((row,text))
out.mkdir(mode=0o700);results=[]
for row,text in prepared:
 path=out/row['kind']/row['name'];path.parent.mkdir(exist_ok=True);path.write_text(text)
 subprocess.run(['node','--check',str(path)],check=True,capture_output=True)
 results.append({**row,'output':str(path),'syntaxPassed':True,'reverseReplayExact':True})
(out/'receipt.json').write_text(json.dumps({'format':'aux.settled-browser-rejection-prepared.v1','planSha256':sha(p.read_bytes()),'resources':results,'passed':True,'nativeBuild':False,'signed':False,'appModified':False},indent=2)+'\n')
print(out/'receipt.json')
