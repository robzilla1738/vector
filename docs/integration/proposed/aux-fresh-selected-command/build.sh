#!/bin/sh
set -eu
proposal="$1"
output="$2"
here="$proposal/aux-fresh-selected-command"
node "$here/generate.mjs" "$output/PrivateFreshInstallationJournalStore.swift"
python3 - "$proposal" "$output" <<'PY'
from pathlib import Path
import sys
p,o=map(Path,sys.argv[1:])
s=(p/'aux-fresh-security-coordinator/check.sh').read_text()
s=s[s.index('xcrun swiftc -target'):s.index('\n"$output/check"')]
a='"$proposal/aux-fresh-installation-journal/source/PrivateFreshInstallationJournalStore.swift"'
b='"$proposal/aux-fresh-security-coordinator/tests/main.swift"'
assert s.count(a)==s.count(b)==1
s=s.replace(a,'"$output/PrivateFreshInstallationJournalStore.swift"')
extra='"$proposal/aux-runtime-target-capture/source/AuxRuntimeTargetCapture.swift" "$proposal/aux-fresh-selected-command/source/FreshAuthoritySelection.swift" "$proposal/aux-fresh-selected-command/source/PreparedFreshNativeCommandProvider.swift"'
s=s.replace('xcrun swiftc -target','xcrun swiftc -module-cache-path "$output/cache" -target',1)
production=s.replace(b,extra).replace('-o "$output/check"','-typecheck')
fixture=s.replace(b,extra+' "$proposal/aux-fresh-selected-command/tests/main.swift"').replace('xcrun swiftc ','xcrun swiftc -D AUX_FRESH_COMMAND_FIXTURE ',1)
(o/'typecheck.sh').write_text('set -eu\nproposal="$1"\noutput="$2"\n'+production+'\n')
(o/'fixture.sh').write_text('set -eu\nproposal="$1"\noutput="$2"\n'+fixture+'\n')
PY
sh "$output/typecheck.sh" "$proposal" "$output"
sh "$output/fixture.sh" "$proposal" "$output"
"$output/check"
