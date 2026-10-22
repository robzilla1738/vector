#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../../../.."
proposal="$PWD/docs/integration/proposed"
snapshot=/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/runtime/node
output=$(mktemp -d /tmp/aux-pdf-host-consumer.XXXXXX)
trap 'rm -rf "$output"' EXIT
mkdir -p "$output/Probe.app/Contents/MacOS" "$output/Probe.app/Contents/Resources/native" "$output/home"
cp "$snapshot/bin/node" "$output/Probe.app/Contents/MacOS/node"
cp /Users/rcourson/Documents/Vibe/web/out/provided-candidate-aux-carrier-pdf-lifetime/Aux.app/Contents/Resources/aux/apps/daemon/'Aux Daemon.app'/Contents/Resources/native/aux-pdf.node "$output/Probe.app/Contents/Resources/native/aux-pdf.node"
# Exact source/module/runtime pins are checked before compilation or execution.
python3 "$proposal/aux-native-pdf-host-consumer/verify-inputs.py" "$output/Probe.app/Contents/MacOS/node" "$output/Probe.app/Contents/Resources/native/aux-pdf.node"
python3 scripts/native-build.py bash "$proposal/aux-native-pdf-host-consumer/compile.sh" "$proposal" "$snapshot/include/node" "$output"
cp "$proposal/aux-native-pdf-host-consumer/tests/check.cjs" "$output/check.cjs"
python3 - "$output/Probe.app/Contents/Resources/synthetic.pdf" <<'PY'
from pathlib import Path
import sys
stream='BT /F1 12 Tf 20 250 Td (Aux PDF Host Consumer) Tj ET\n'
objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',f'<< /Length {len(stream)} >>\nstream\n{stream}endstream','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
b='%PDF-1.7\n';offsets=[]
for i,o in enumerate(objects):offsets.append(len(b));b+=f'{i+1} 0 obj\n{o}\nendobj\n'
x=len(b);b+='xref\n0 6\n0000000000 65535 f \n'+''.join(f'{o:010} 00000 n \n' for o in offsets)+f'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{x}\n%%EOF\n';Path(sys.argv[1]).write_text(b)
PY
env -i HOME="$output/home" TMPDIR="$output" PATH=/usr/bin:/bin "$output/Probe.app/Contents/MacOS/node" "$output/check.cjs" absent
env -i HOME="$output/home" TMPDIR="$output" PATH=/usr/bin:/bin "$output/Probe.app/Contents/MacOS/node" "$output/check.cjs" current
env -i HOME="$output/home" TMPDIR="$output" PATH=/usr/bin:/bin "$output/Probe.app/Contents/MacOS/node" "$output/check.cjs" late
python3 - "$output/Probe.app/Contents/Resources/native/aux-pdf.node" <<'PYCODE'
from pathlib import Path
import hashlib,sys
source=Path('/Users/rcourson/Documents/Vibe/web/out/provided-candidate-aux-pdf-native/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/native/aux-pdf.node')
raw=source.read_bytes()
assert hashlib.sha256(raw).hexdigest()=='6febb242a074317dba3edc1848fdfb77da468e32bb87acffdaa7f6143afece8e'
Path(sys.argv[1]).write_bytes(raw)
PYCODE
env -i HOME="$output/home" TMPDIR="$output" PATH=/usr/bin:/bin "$output/Probe.app/Contents/MacOS/node" "$output/check.cjs" legacy
