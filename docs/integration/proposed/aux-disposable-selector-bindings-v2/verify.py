#!/usr/bin/env python3
"""Pure public selector review; never imports Security or invokes helper/Keychain."""
from pathlib import Path
import hashlib,json,subprocess,tempfile,uuid
root=Path(__file__).resolve().parents[4]
review_dir=Path(__file__).resolve().parent
pins=json.loads((review_dir/'source-pins.json').read_text())
sha=lambda value:hashlib.sha256(value).hexdigest()
for pin in pins['sources']:
    assert sha((root/pin['path']).read_bytes())==pin['sha256'],pin['path']
review=json.loads((review_dir/'review.json').read_text())
assert sha((review_dir/'review.json').read_bytes())==pins['reviewFileSha256']
assert uuid.UUID(review['reviewId'])
assert review['reviewOnly'] and not review['runtimeAuthorization']
assert not any(review[k] for k in ['ownershipProved','custodyProved','currentSignerGroupValidityProved'])
bindings=review['bindings']
canonical=json.dumps(bindings,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
assert canonical==(review_dir/'bindings.canonical.json').read_bytes()
assert sha(canonical)==review['bindingsSha256']==pins['canonicalBindingsSha256']
assert [b['row'] for b in bindings]==['metadata','signing','kem','wrappedRoot']
prefix='aux.'+review['scope']+'.'
group='9F2JXY8TCK.dev.aux.dp.'+review['scope']
public=json.loads((root/'docs/integration/proposed/aux-dp-access-group-review/public-artifacts.json').read_text())
assert {a['firstDeclaredKeychainGroup'] for a in public['artifacts']}=={group}
assert all(a['signatureVerified'] is False for a in public['artifacts'])
old_accounts=['aside.install.meta','aside.install.sig','aside.install.kem','aside.dk']
new_suffixes=['meta','sig','kem','dk']
for b,old,new in zip(bindings,old_accounts,new_suffixes):
    assert set(b)=={'row','original','target'}
    assert b['original']==dict(service=prefix+'aside.install',account=prefix+old,accessGroup=group)
    assert b['target']==dict(service=prefix+'installation.v2',account=prefix+'installation.v2.'+new,accessGroup=group)
    assert all(set(b[k])=={'service','account','accessGroup'} for k in ['original','target'])
triples=lambda k:{tuple(b[k][field] for field in ['service','account','accessGroup']) for b in bindings}
assert len(triples('original'))==len(triples('target'))==4
assert triples('original').isdisjoint(triples('target'))

# Extract the ACTUAL production pure initializer and value types, byte unchanged.
# Do not compile the enclosing executor or its Security imports/operations.
executor=(root/'docs/integration/proposed/aux-installation-security-executor/source/InstallationSecurityExecutor.swift').read_text()
transaction=(root/'docs/integration/proposed/aux-installation-additive-transaction/source/AdditiveInstallationTransaction.swift').read_text()
rows=(root/'docs/integration/proposed/aux-native-four-row-preparation/source/CapturedInstallation.swift').read_text()
value_types=transaction[transaction.index('struct TransactionSelector:'):transaction.index('struct AssertedDurableCheckpoint')]
predicate=executor[executor.index('enum InstallationSecurityExecutorError:'):executor.index('enum ExternalInstallationSecurityExecutor')]
row_enum=next(line for line in rows.splitlines() if line.startswith('enum InstallationRow:'))
pure='import Foundation\nimport CryptoKit\n'+value_types+row_enum+'\n'+predicate
assert 'import Security' not in pure and 'SecItem' not in pure and 'SecKey' not in pure
harness=r'''
let data=try Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[1]))
let object=try JSONSerialization.jsonObject(with:data) as! [String:Any]
let id=object["reviewId"] as! String, hash=object["bindingsSha256"] as! String
let bytes=try JSONSerialization.data(withJSONObject:object["bindings"]!)
let bindings=try JSONDecoder().decode([InstallationRowBinding].self,from:bytes)
let checked=try ReviewedInstallationSelectorBindings(reviewId:id,bindings:bindings,expectedReviewSha256:hash)
precondition(checked.reviewSha256==hash)
func rejects(_ values:[InstallationRowBinding],_ expected:String) {
    do { _=try ReviewedInstallationSelectorBindings(reviewId:id,bindings:values,expectedReviewSha256:expected);fatalError("invalid review accepted") } catch {}
}
rejects(bindings,String(repeating:"0",count:64))
rejects(Array(bindings.reversed()),hash)
var overlap=bindings
let first=bindings[0]
overlap[0]=InstallationRowBinding(row:first.row,original:first.target,target:first.target)
rejects(overlap,hash)
var oldBrand=bindings
oldBrand[0]=InstallationRowBinding(row:first.row,original:first.original,target:TransactionSelector(service:"aux.aside.v2",account:first.target.account,accessGroup:first.target.accessGroup))
rejects(oldBrand,hash)
print("Actual pure Swift selector constructor accepted canonical SHA; four negative reviews rejected")
'''
with tempfile.TemporaryDirectory(prefix='aux-selector-pure-') as tmp:
    source=Path(tmp)/'main.swift';source.write_text(pure+harness)
    executable=Path(tmp)/'check'
    subprocess.run(['xcrun','swiftc',str(source),'-o',str(executable)],check=True)
    subprocess.run([str(executable),str(review_dir/'review.json')],check=True)
print('Public pins, eight explicit triples, same-group binding and source/target disjointness verified; no Security code compiled or called')
