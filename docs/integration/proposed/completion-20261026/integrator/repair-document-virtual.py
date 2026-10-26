"""Move the new virtual method bodies to their existing implementation files."""
from pathlib import Path
import hashlib
import json
import os
from counted_projection import counted_anchors

HERE = Path(__file__).resolve().parent
PRIOR = Path('/private/tmp/aux-completion-browser-build-20261026-a5')
OUT = Path('/private/tmp/aux-completion-browser-build-20261026-a6')
sha = lambda data: hashlib.sha256(data).hexdigest()
plan = json.loads((PRIOR / 'projection.json').read_text())
native = Path(plan['source'])
rows = {row['path']: row for row in plan['files']}
for row in plan['files']:
    if sha((native / row['path']).read_bytes()) != row['outputSha256']:
        raise ValueError('Frozen native source changed: ' + row['path'])
changes = {
    'content/public/browser/devtools_agent_host_client.h': [
        ('  virtual bool MayUseAuxDocumentCapabilities() { return false; }',
         '  virtual bool MayUseAuxDocumentCapabilities();')],
    'content/public/browser/devtools_agent_host_client.cc': [
        ('bool DevToolsAgentHostClient::IsAuthenticatedRemoteDebuggingSession() {\n  return false;\n}',
         'bool DevToolsAgentHostClient::IsAuthenticatedRemoteDebuggingSession() {\n  return false;\n}\n\nbool DevToolsAgentHostClient::MayUseAuxDocumentCapabilities() {\n  return false;\n}')],
    'chrome/browser/extensions/api/debugger/debugger_api.cc': [
        ('  bool MayUseAuxDocumentCapabilities() override {\n    return extension_->id() == aux::kAgentExtensionId &&\n           Manifest::IsComponentLocation(extension_->location()) &&\n           profile_->IsRegularProfile() && !profile_->IsOffTheRecord();\n  }',
         '  bool MayUseAuxDocumentCapabilities() override;'),
        ('bool ExtensionDevToolsClientHost::IsTrusted() {\n  return ExtensionIsTrusted(*extension_);\n}',
         'bool ExtensionDevToolsClientHost::IsTrusted() {\n  return ExtensionIsTrusted(*extension_);\n}\n\nbool ExtensionDevToolsClientHost::MayUseAuxDocumentCapabilities() {\n  return extension_->id() == aux::kAgentExtensionId &&\n         Manifest::IsComponentLocation(extension_->location()) &&\n         profile_->IsRegularProfile() && !profile_->IsOffTheRecord();\n}')],
}
prepared = []
for name, rules in changes.items():
    before = (native / name).read_bytes()
    text = before.decode()
    for find, replacement in rules:
        if text.count(find) != 1:
            raise ValueError('Virtual repair anchor changed: ' + name)
        text = text.replace(find, replacement)
    prepared.append((name, before, text.encode(), counted_anchors(before.decode(), text)))
if OUT.exists():
    raise ValueError('Fresh virtual repair directory required')
OUT.mkdir(mode=0o700)
for name, before, after, anchors in prepared:
    live = native / name
    mode = live.stat().st_mode & 0o777
    backup = OUT / 'preimages' / name
    backup.parent.mkdir(parents=True, exist_ok=True)
    backup.write_bytes(before)
    temporary = live.with_name(live.name + '.aux-virtual-a6')
    with temporary.open('xb') as stream:
        stream.write(after)
    temporary.chmod(mode)
    os.replace(temporary, live)
    if name not in rows:
        rows[name] = dict(path=name, inputSha256=sha(before), mode=mode, origins=[])
    rows[name]['outputSha256'] = sha(after)
    rows[name]['origins'].append(dict(plan=str(Path(__file__)), anchors=anchors))
for name, row in rows.items():
    target = OUT / 'source' / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes((native / name).read_bytes())
    target.chmod(row['mode'])
plan.update(files=list(rows.values()), output=str(OUT),
            parentProjectionSha256=sha((PRIOR / 'projection.json').read_bytes()),
            failedPredecessorReceipt=str(PRIOR / 'build-result.json'))
(OUT / 'projection.json').write_text(json.dumps(plan, indent=2) + '\n')
(HERE / 'browser-virtual-repair-projection.json').write_text(json.dumps(plan, indent=2) + '\n')
print(json.dumps(dict(passed=True, nativeFiles=len(rows), repairedFiles=len(prepared), output=str(OUT))))
