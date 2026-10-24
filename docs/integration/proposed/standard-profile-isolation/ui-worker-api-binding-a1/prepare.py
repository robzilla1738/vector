"""Prepare finite worker-control registration against the actual native lineage."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
files = []

def change(name, anchors):
    original = ROOT / name
    data = original.read_text()
    for anchor in anchors:
        assert data.count(anchor['find']) == anchor['count'], name
        data = data.replace(anchor['find'], anchor['replace'], anchor['count'])
    out = HERE / 'source' / name
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(data)
    files.append({'path': name, 'inputSha256': sha(original), 'outputSha256': sha(out),
                  'anchors': anchors})

def anchor(find, replace):
    return {'find': find, 'replace': replace, 'count': 1}

change('chrome/browser/extensions/api/aux_browser_preferences/aux_browser_preferences_api.cc', [
    anchor('#include "chrome/browser/aux/ui_storage_migration_controller.h"',
           '#include "chrome/browser/aux/ui_storage_migration_controller.h"\n#include "chrome/browser/aux/ui_storage_migration_worker.h"'),
    anchor('  auto* prefs = profile()->GetPrefs();\n', '''  if (method == "replyUiMigrationWorkerControl") {
    if (args().size() != 1 || !args()[0].is_dict())
      return RespondNow(Error("A finite worker-control reply is required"));
    const auto& request = args()[0].GetDict();
    const auto* request_id = request.FindString("requestId");
    const auto* operation = request.FindString("operation");
    const auto* result_json = request.FindString("resultJson");
    if (request.size() != 3 || !request_id || !operation || !result_json ||
        request_id->size() != 36 || operation->size() > 8 ||
        result_json->size() > 65536)
      return RespondNow(Error("Malformed or oversized worker-control reply"));
    // The helper binds the actual ExtensionFunction worker, Profile, process,
    // version/start token and retained native RPC. JSON supplies no identity.
    return RespondNow(WithArguments(aux::AcceptUiStorageMigrationWorkerReply(
        *this, *request_id, *operation, *result_json)));
  }
  auto* prefs = profile()->GetPrefs();
''')])
header = '''class AuxBrowserPreferencesReplyUiMigrationWorkerControlFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.replyUiMigrationWorkerControl",
                             AUXBROWSERPREFERENCES_REPLYUIMIGRATIONWORKERCONTROL)
 protected:
  ~AuxBrowserPreferencesReplyUiMigrationWorkerControlFunction() override = default;
};
'''
change('chrome/browser/extensions/api/aux_browser_preferences/aux_browser_preferences_api.h', [
    anchor('}  // namespace extensions\n#endif\n', header + '}  // namespace extensions\n#endif\n')])
change('chrome/browser/ui/BUILD.gn', [anchor('      "../aux/ui_storage_migration_controller.h",',
    '      "../aux/ui_storage_migration_controller.h",\n      "../aux/ui_storage_migration_worker.cc",\n      "../aux/ui_storage_migration_worker.h",')])
change('chrome/browser/aux/BUILD.gn', [anchor('  public = [ "ui_storage_migration_controller.h" ]',
    '  public = [ "ui_storage_migration_controller.h", "ui_storage_migration_worker.h" ]')])
function = {
    'name': 'replyUiMigrationWorkerControl', 'type': 'function',
    'parameters': [{'name': 'request', 'type': 'object', 'properties': {
        'requestId': {'type': 'string'},
        'operation': {'type': 'string', 'enum': ['prepare', 'read', 'validate', 'release']},
        'resultJson': {'type': 'string'}}}],
    'returns_async': {'name': 'callback', 'parameters': [{'name': 'accepted', 'type': 'boolean'}]}}
event = {'name': 'onUiMigrationWorkerControl', 'type': 'function',
         'parameters': [{'name': 'request', 'type': 'object', 'properties': {
             'requestId': {'type': 'string'},
             'operation': {'type': 'string', 'enum': ['prepare', 'read', 'validate', 'release']},
             'leaseId': {'type': 'string', 'optional': True},
             'revision': {'type': 'number', 'optional': True}}}]}
def item(value):
    return '\n'.join('      ' + line for line in json.dumps(value, indent=2).splitlines()) + ',\n'
change('chrome/common/extensions/api/aux_browser_preferences.json', [
    anchor('    "functions": [\n', '    "functions": [\n' + item(function)),
    anchor('    "events": [\n', '    "events": [\n' + item(event))])
change('extensions/browser/extension_event_histogram_value.h', [anchor(
    '  AUXBROWSERPREFERENCES_ONPAGECAPTUREREQUESTED = 583,',
    '  AUXBROWSERPREFERENCES_ONPAGECAPTUREREQUESTED = 583,\n  AUXBROWSERPREFERENCES_ONUIMIGRATIONWORKERCONTROL = 584,')])
change('extensions/browser/extension_function_histogram_value.h', [anchor(
    '  AUXBROWSERPREFERENCES_CAPTURETABMENTIONSPACE = 2141,',
    '  AUXBROWSERPREFERENCES_CAPTURETABMENTIONSPACE = 2141,\n  AUXBROWSERPREFERENCES_REPLYUIMIGRATIONWORKERCONTROL = 2142,')])
change('tools/metrics/histograms/metadata/extensions/enums.xml', [
    anchor('  <int value="583" label="AUXBROWSERPREFERENCES_ONPAGECAPTUREREQUESTED"/>',
        '  <int value="583" label="AUXBROWSERPREFERENCES_ONPAGECAPTUREREQUESTED"/>\n  <int value="584" label="AUXBROWSERPREFERENCES_ONUIMIGRATIONWORKERCONTROL"/>'),
    anchor('  <int value="2141" label="AUXBROWSERPREFERENCES_CAPTURETABMENTIONSPACE"/>',
        '  <int value="2141" label="AUXBROWSERPREFERENCES_CAPTURETABMENTIONSPACE"/>\n  <int value="2142" label="AUXBROWSERPREFERENCES_REPLYUIMIGRATIONWORKERCONTROL"/>')])
json.loads((HERE / 'source/chrome/common/extensions/api/aux_browser_preferences.json').read_text())
result = {'format': 'aux.ui-worker.api-binding.source.v1', 'files': files,
          'registration': 'Actual ChromeGeneratedFunctionRegistry derives the native class from this schema; generated outputs must be rebuilt.',
          'nativeCheckoutChanged': False, 'productExecuted': False, 'runtimeAuthorityGranted': False}
(HERE / 'source-plan.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'files': len(files), 'anchors': sum(len(r['anchors']) for r in files)}))
