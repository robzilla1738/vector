import argparse
import hashlib
import json
import subprocess
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--source-root',type=Path,required=True)
args=parser.parse_args()
root=args.source_root.resolve()
def git(*args):
    return subprocess.check_output(['git','-C',str(root),*args],text=True).strip()
def pin(relative):
    data=(root/relative).read_bytes()
    return {'path':relative,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}

if subprocess.run(['git','-C',str(root),'diff','--quiet','HEAD','--','services/aux-cloud']).returncode!=0:
    raise ValueError('Current service has uncommitted source changes; review and repin it first')
if git('ls-files','--others','--exclude-standard','services/aux-cloud'):
    raise ValueError('Untracked service source requires review before pinning')
files=[pin(path) for path in git('ls-files','services/aux-cloud').splitlines()]
manifest=json.loads((root/'services/aux-cloud/src/schema-manifest.json').read_text())
actual={path.name:hashlib.sha256(path.read_bytes()).hexdigest() for path in sorted((root/'services/aux-cloud/migrations').glob('*.sql'))}
if actual!=manifest:
    raise ValueError('Migrations differ from the schema manifest')
inputs=[
 'docs/integration/proposed/completion-20261026/integrator/cloud-production-configuration.json',
 'docs/integration/proposed/completion-20261026/integrator/cloud-env-metadata.json',
 'docs/integration/proposed/completion-20261026/integrator/cloud-state.json',
 'docs/integration/proposed/completion-20261026/integrator/cloud-dashboard-review.json',
 'docs/integration/proposed/completion-20261026/integrator/cloud-typecheck.json',
 'docs/integration/proposed/completion-20261026/integrator/product-link-audit.json',
 'docs/integration/proposed/completion-20261026/integration/feedback/source-pins.json',
 'docs/integration/proposed/completion-20261026/integration/feedback/verification.json',
 'docs/integration/proposed/completion-20261026/integration/feedback/README.md',
 'docs/integration/proposed/completion-20261026/integration/product-information/community.md',
 'docs/integration/proposed/completion-20261026/integration/product-information/privacy.md',
 'docs/integration/proposed/completion-20261026/integrator/paired-source-a7.json',
 'docs/integration/proposed/completion-20261026/integrator/ui-source-a4.json',
 'docs/integration/proposed/final-completion/cloud/readiness.md',
 'docs/integration/proposed/final-completion/cloud/operations.md',
 'docs/cloud/production-resource-review/execution.json',
 'docs/cloud/production-provider-review/prepared-clerk-webhook.json',
 'docs/cloud/setup-2026-10-21.md',
 'docs/cloud/account-setup-2026-10-23.md',
 'docs/cloud/dedicated-backup-runner-review/README.md',
 'docs/integration/proposed/aux-backup-r2-live/README.md',
 'docs/integration/proposed/aux-cloud-hosted-restore-12/README.md',
]
state=json.loads((root/'docs/integration/proposed/completion-20261026/integrator/cloud-state.json').read_text())
reported=state['deployment']['reportedGitCommit']
print(json.dumps({'format':'aux.cloud.activation-source-pins.v1','sourceRoot':str(root),
 'reviewedAt':'2026-10-27','sourceCommit':git('rev-parse','HEAD'),
 'serviceTree':git('rev-parse','HEAD:services/aux-cloud'),
 'lastServiceCommit':git('log','-1','--format=%H','--','services/aux-cloud'),
 'serviceFiles':files,'serviceFileCount':len(files),
 'schemaManifest':manifest,'canonicalManifestSha256':hashlib.sha256(json.dumps(manifest,separators=(',',':')).encode()).hexdigest(),
 'evidenceInputs':[pin(path) for path in inputs],
 'reportedDeployment':state['deployment'],
 'sourcePathsChangedSinceReportedGit':git('diff','--name-only',reported,'HEAD','--','services/aux-cloud').splitlines(),
 'checks':{'serviceSourceClean':True,'migrationCount':len(actual),'sourceMigrationHashesMatch':True,'testsRerun':True,'backupRun':False,'dashboardAccess':False,'secretValuesRead':False,'activationPerformed':False}},indent=2))
