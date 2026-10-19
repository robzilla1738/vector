"""Static supplied-IDL/current-native shape inventory; no browser or supplied code execution."""
import hashlib,json,re
from pathlib import Path
old=Path('/Users/rcourson/Downloads/aside-rea 2/native-fork/idl')
native=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
rows=[]
for p in sorted(old.glob('idl-aside*.json')):
 a=json.loads(p.read_text());stem='aux_'+re.sub(r'(?<!^)(?=[A-Z])','_',a['namespace'][5:]).lower()
 q=native/'chrome/common/extensions/api'/f'{stem}.json';b=json.loads(q.read_text())[0]
 aa={f['name']:f for f in a.get('functions',[])};bb={f['name']:f for f in b.get('functions',[])}
 assert aa.keys()==bb.keys(),(p,aa.keys()^bb.keys())
 for name in aa:assert len(aa[name].get('parameters',[]))==len(bb[name].get('parameters',[])),name
 rows.append({'suppliedNamespace':a['namespace'],'auxNamespace':b['namespace'],'suppliedIdlPath':str(p),'suppliedIdlSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'nativeSchemaPath':str(q.relative_to(native)),'nativeSchemaSha256':hashlib.sha256(q.read_bytes()).hexdigest(),'methods':[{'name':name,'suppliedParameters':aa[name].get('parameters',[]),'auxParameters':bb[name].get('parameters',[]),'suppliedReturns':aa[name].get('returns_async'),'auxReturns':bb[name].get('returns_async')}for name in aa]})
output=Path(__file__).resolve().parents[2]/'docs/integration/provided-private-api-shapes.json'
output.write_text(json.dumps({'note':'Matching method inventory and arity does not establish object field or runtime behavior compatibility. Source/result mismatches documented separately.','namespaces':rows},indent=2)+'\n')
print(json.dumps({'namespaces':len(rows),'methods':sum(len(r['methods'])for r in rows)}))
