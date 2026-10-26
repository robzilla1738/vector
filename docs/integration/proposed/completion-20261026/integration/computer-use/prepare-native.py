import argparse
import hashlib
import json
import shutil
import tempfile
from pathlib import Path

HERE=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('--host',type=Path,required=True)
parser.add_argument('--selected-header',type=Path,required=True)
args=parser.parse_args()
sha=lambda data:hashlib.sha256(data).hexdigest()
inventory=json.loads((HERE/'native-source-inventory.json').read_text())
for row in inventory['derivedSources']:
    path=HERE/'source'/row['name']
    if sha(path.read_bytes())!=row['sha256']:
        raise ValueError('Computer Use source inventory changed: '+row['name'])
header=args.selected_header.read_text()
for symbol in ['AuxCaptureSelectedAccount(', 'AuxValidateSelectedAccount(', 'AuxCopySelectedAccountDirectory(', 'AuxSelectedAccountStopRequested(', 'AuxPrepareComputerUseAccountLaunch(', 'AuxPublishSuspendedComputerUseAccountLaunch(', 'AuxObserveComputerUseAccountTerminal(', 'AuxReleaseRegisteredComputerUseAccount(']:
    if header.count(symbol)!=1:
        raise ValueError('Selected native owner ABI changed: '+symbol)
overlay=json.loads((HERE/'native-host-overlay.json').read_text())
source=Path(overlay['source']).read_bytes()
if sha(source)!=overlay['sourceSha256']:
    raise ValueError('Selected host baseline changed')
text=args.host.read_text()
for rule in overlay['rules']:
    if source.decode().count(rule['find'])!=rule['count'] or text.count(rule['find'])!=rule['count'] or rule['replace'] in text:
        raise ValueError('Unknown or repeated Computer Use host join: '+rule['scope'])
    text=text.replace(rule['find'],rule['replace'])
output=Path(tempfile.mkdtemp(prefix='aux-fixed-computer-use-native-'))
files=[]
for row in inventory['derivedSources']:
    path=HERE/'source'/row['name'];shutil.copy2(path,output/path.name)
    files.append({'name':path.name,'sha256':row['sha256']})
(output/'AuxDevelopmentWorkerHost.cc').write_text(text)
shutil.copy2(args.selected_header,output/'AuxSelectedAccountScope.h')
files.extend([{'name':'AuxDevelopmentWorkerHost.cc','sha256':sha(text.encode())},{'name':'AuxSelectedAccountScope.h','sha256':sha(header.encode())}])
print(json.dumps({'format':'aux.fixed-computer-use.native-source.v1','output':str(output),'hostInput':str(args.host),'hostInputSha256':sha(args.host.read_bytes()),'files':files,'compiled':False,'productExecuted':False,'signingChanged':False},indent=2))
