"""Inventory actual delivered Mach-O requirements without running any artifact."""
from pathlib import Path
import argparse
import hashlib
import importlib.util
import json
import plistlib
import sys

sys.dont_write_bytecode = True
parser = argparse.ArgumentParser()
parser.add_argument('app', type=Path)
parser.add_argument('output', type=Path)
args = parser.parse_args()
app = args.app.resolve(strict=True)
if app.name != 'Aux.app' or args.output.exists():
    raise ValueError('Actual Aux app and fresh audit output required')
decoder = Path(__file__).resolve().parents[2] / 'aux-native-compatibility-metadata/inspect.py'
spec = importlib.util.spec_from_file_location('aux_macho_metadata', decoder)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
records = []
magics = {b'\xca\xfe\xba\xbe', b'\xca\xfe\xba\xbf', b'\xcf\xfa\xed\xfe',
          b'\xce\xfa\xed\xfe', b'\xfe\xed\xfa\xcf', b'\xfe\xed\xfa\xce'}
for file in sorted(app.rglob('*')):
    if file.is_symlink() or not file.is_file():
        continue
    with file.open('rb') as stream:
        if stream.read(4) not in magics:
            continue
        stream.seek(0)
        data = stream.read()
    records.append({'path': str(file.relative_to(app)), 'bytes': len(data),
                    'sha256': hashlib.sha256(data).hexdigest(), 'slices': module.slices(data)})
architectures = sorted({item['architecture'] for row in records for item in row['slices']})
summary = {}
for architecture in architectures:
    minima = [(tuple(map(int, version['minimumOS'].split('.'))), row['path'])
              for row in records for item in row['slices'] if item['architecture'] == architecture
              for version in item['build'] if version['platform'] == 1]
    maximum = max(value for value, _ in minima) if minima else None
    summary[architecture] = {
        'files': sum(any(item['architecture'] == architecture for item in row['slices']) for row in records),
        'maximumDeclaredMinimum': '.'.join(map(str, maximum)) if maximum else None,
        'limitingPaths': [path for value, path in minima if value == maximum],
        'missingArchitecturePaths': [row['path'] for row in records
                                     if not any(item['architecture'] == architecture for item in row['slices'])]}
declared = plistlib.loads((app / 'Contents/Info.plist').read_bytes()).get('LSMinimumSystemVersion')
result = {'format': 'aux.completion.delivered-compatibility.v1', 'app': str(app),
          'decoderSha256': hashlib.sha256(decoder.read_bytes()).hexdigest(),
          'declaredAppMinimum': declared, 'machOFiles': len(records),
          'architectures': summary, 'records': records, 'nativeExecution': False,
          'runtimeCompatibilityProven': False,
          'scope': 'Actual packaged regular files only; symlink aliases omitted. Metadata does not prove runtime support.'}
with args.output.open('x') as stream:
    json.dump(result, stream, indent=2)
    stream.write('\n')
print(json.dumps({key: result[key] for key in ('app', 'declaredAppMinimum', 'machOFiles', 'architectures')}))
