#!/usr/bin/env python3
"""Execute one reviewed static assembly plan; never sign, launch, or grant authority."""
import argparse
import copy
import importlib.util
import json
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
RES = Path('Contents/Resources/aux')
BASE_NAME = 'provided-candidate-local-completion-20261025-a38'
OUT_NAME = 'provided-candidate-completion-20261026-a1'
A18 = Path('docs/integration/proposed/browser-feature-expansion/local-completion-package-a38/disposable-location-review-a4/actual-integration-signing-a18.json')
A18_SHA = '9d8514ca917fcf8f0b4a0c54bb2089894385fd13862686679f1d8ebf05837ba5'
A18_INVENTORY = '03542e0336ecd93ee2f0b790905219d454288292f6ceeb236dc211e2b7852bab'
BROWSER_INVENTORY = '1e0ecaac4cb75bf08f7961db76faeab15b2cb47584e283546b8689f2d5416d58'
RUNTIME_PACKAGE = Path('docs/integration/proposed/standard-profile-isolation/runtime-package-a1/runtime_package.py')
GENERATOR = Path('docs/integration/proposed/completion-20261026/integration/successor-assembly/prepare-assembly-plan.py')
STALE_SEALS = [RES/'apps/daemon/Aux Daemon.app/Contents/_CodeSignature/CodeResources',
               RES/'apps/cli/Aux CLI.app/Contents/_CodeSignature/CodeResources']
DAEMON_RES = RES/'apps/daemon/Aux Daemon.app/Contents/Resources'
MEMORY_POLICY = DAEMON_RES/'AuxMemoryHelperLaunchPolicy.json'
MEMORY_HELPER = DAEMON_RES/'memory-helper/aux-memory'
CU_POLICY = DAEMON_RES/'AuxComputerUseHelperLaunchPolicy.json'
BOOTSTRAP = DAEMON_RES/'AuxFreshBootstrapPolicy.json'
FALSE_FLAGS = dict(testable=False, signed=False, productSigned=False, executed=False,
                   appExecuted=False, productExecuted=False, runtimeAccepted=False,
                   runtimeAuthorityGranted=False, productionReady=False, fullIdentityComplete=False,
                   acceptedAppReplaced=False, release=False)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def read(path):
    return json.loads(Path(path).read_text())


def write_new(path, value):
    with Path(path).open('x') as stream:
        stream.write(json.dumps(value, indent=2) + '\n')


def load_inventory(repository):
    path = repository/RUNTIME_PACKAGE
    spec = importlib.util.spec_from_file_location('aux_reviewed_runtime_package', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def confined(relative):
    value = Path(relative)
    require(isinstance(relative, str) and not value.is_absolute() and
            str(value) == relative and value.parts and
            all(part not in ('', '.', '..') for part in value.parts),
            'Canonical confined relative path required: ' + str(relative))
    return value


def leaf_map(rows):
    result = {row['path']: row for row in rows}
    require(len(result) == len(rows), 'Duplicate inventory path')
    return result


def private_destination(app, relative):
    target = app/relative
    # No copied symlink may redirect a replacement or metadata write.
    for parent in [target, *target.parents]:
        if parent == app.parent:
            break
        require(not parent.is_symlink(), 'Destination crosses a copied symlink: ' + str(parent))
    require(target.is_relative_to(app), 'Destination escaped staged app')
    return target


def verify_source(p, action):
    path = Path(action['source'])
    require(p.ref(path)['sha256'] == action['sha256'] and
            path.stat().st_size == action['bytes'] and
            stat.S_IMODE(path.lstat().st_mode) == action['mode'],
            'Declared replacement input changed: ' + str(path))
    return path


def replay_plan(repository, plan, stage, p):
    roles = ['browser', 'daemon', 'resources', 'ui', 'relocation']
    require(len(plan['receiptPins']) == len(roles), 'Exact five actual receipt pins required')
    arguments = [sys.executable, str(repository/GENERATOR), '--repository', str(repository)]
    for role, item in zip(roles, plan['receiptPins']):
        require(p.ref(item['path']) == item, 'Actual receipt changed: ' + item['path'])
        arguments += ['--'+role+'-receipt', item['path']]
    actions = plan['orderedActions'][2:]
    policy = next((item for item in actions if item['relative'] == str(BOOTSTRAP)), None)
    require(policy is not None, 'Explicit v10 bootstrap resource required')
    arguments += ['--bootstrap-policy', policy['source']]
    cu = [item for item in actions if item['relative'] == str(CU_POLICY)]
    require(len(cu) <= 1 and plan.get('CUlaunchPolicyPending') is (not bool(cu)) and
            plan.get('CUtestable') is False, 'Explicit unsigned Computer Use pending state required')
    if cu:
        arguments += ['--computer-use-policy', cu[0]['source']]
    replay = stage/'assembly-plan-replayed.json'
    arguments += ['--output', str(replay)]
    result = subprocess.run(arguments, cwd=repository, text=True, capture_output=True)
    require(result.returncode == 0, 'Authoritative plan replay failed: ' + result.stderr[-4000:])
    require(read(replay) == plan, 'Ordered actions differ from current verified plan producer')
    delivered_replay={**p.ref(replay),'path':str(Path(plan['proposedApp']).parent/replay.name)}
    return dict(producer=p.ref(repository/GENERATOR), replay=delivered_replay,
                receiptPins=copy.deepcopy(plan['receiptPins']))


def metadata(bundle, app, replacements, removed, baseline, provenance, p):
    previous = copy.deepcopy(bundle)
    records = {row['path']: copy.deepcopy(row) for row in bundle['files']}
    require(len(records) == len(bundle['files']), 'Duplicate active package metadata path')
    for item in removed:
        records.pop(str(Path(item['path']).relative_to(RES)), None)
    delivered = p.inventory(app/RES)
    active = []
    for item in delivered:
        relative = item['path']
        if relative == 'bundle.json':
            continue  # The external whole-app receipt covers the marker without a self-hash cycle.
        row = records.get(relative, dict(path=relative,
                    source=str(baseline/RES/relative) if str(RES/relative) in provenance['acceptedRows'] else
                           next(change['source'] for change in replacements if change['relative'] == str(RES/relative)),
                    changeKinds=['integration']))
        row.update(mode=item['mode'])
        if item['type'] == 'file':
            row.update(type='file', sha256=item['sha256'], bytes=(app/RES/relative).stat().st_size)
            row.pop('linkTarget', None)
            row.pop('target', None)
        else:
            row.update(type='symlink', linkTarget=item['target'])
            row.pop('sha256', None)
            row.pop('bytes', None)
        active.append(row)
    expected = {row['path'] for row in records}
    actual = {row['path'] for row in active}
    require(expected <= actual, 'Historical delivered leaf disappeared outside declared removals')
    bundle['files'] = active
    bundle['finalApp'] = provenance['proposedApp']
    bundle.update(productionReady=False, runtimeAccepted=False, fullIdentityComplete=False)
    bundle['currentCompletionIntegration'] = dict(
        format='aux.completion.current-package.v1', assemblyPlan=provenance['plan'],
        acceptedInventory=provenance['acceptedInventory'],
        predecessorBundle=provenance['predecessorBundle'],
        historicalProvenanceScope='All earlier source manifests, signatures, receipts and source fields remain historical. Current delivered rows and this completion section supersede them for current bytes.',
        browser=provenance['browser'], sources=provenance['sources'],
        replacements=copy.deepcopy(replacements), removedCopiedSignatureResources=copy.deepcopy(removed),
        activeManifestSha256=p.digest(active), activeManifestLeaves=len(active),
        completeAuxCoverageExceptSelf=True,
        wholeAppInventoryReceipt=str(Path(provenance['proposedApp']).parent/'receipt.json'),
        CUlaunchPolicyPending=provenance['CUlaunchPolicyPending'], CUtestable=False,
        memoryPolicyRetainedForUnchangedHelper=True,
        **FALSE_FLAGS)
    # Historical origin/projection fields are not rewritten to pretend they produced new bytes.
    require(all(bundle[key] == value for key, value in previous.items()
                if key not in {'files', 'finalApp', 'productionReady', 'runtimeAccepted',
                               'fullIdentityComplete', 'currentCompletionIntegration'}),
            'Historical source provenance changed')
    return bundle


def verify_marker(app, bundle, rows):
    prefix=str(RES)+'/'
    actual = leaf_map([{**row,'path':row['path'][len(prefix):]} for row in rows if row['path'].startswith(prefix)])
    require(set(actual)-{'bundle.json'} == {row['path'] for row in bundle['files']},
            'Current package metadata coverage differs from actual leaves')
    for row in bundle['files']:
        leaf = actual[row['path']]
        kind = 'link' if row['type'] == 'symlink' else row['type']
        require(kind == leaf['type'] and row['mode'] == leaf['mode'], 'Metadata type/mode differs: '+row['path'])
        require(row['sha256'] == leaf['sha256'] and row['bytes'] == (app/RES/row['path']).stat().st_size
                if kind == 'file' else row['linkTarget'] == leaf['target'],
                'Metadata delivered content differs: '+row['path'])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repository', type=Path, required=True)
    parser.add_argument('--plan', type=Path, required=True)
    parser.add_argument('--plan-sha256', required=True)
    parser.add_argument('--browser-inventory', type=Path, required=True)
    args = parser.parse_args()
    repository = args.repository.resolve(strict=True)
    p = load_inventory(repository)
    plan_ref = p.ref(args.plan)
    require(plan_ref['sha256'] == args.plan_sha256, 'Reviewed assembly plan pin differs')
    plan = read(args.plan)
    accepted = repository/'out'/BASE_NAME/'Aux.app'
    output = repository/'out'/OUT_NAME
    final = output/'Aux.app'
    require(plan.get('format') == 'aux.completion.successor-assembly-plan.v1' and
            plan.get('acceptedApp') == str(accepted) and plan.get('proposedApp') == str(final) and
            all(plan.get(key) is False for key in ['assembled', 'signed', 'executed', 'runtimeAccepted']),
            'Exact unexecuted/unaccepted successor plan required')
    require(not output.exists() and not output.is_symlink(), 'Fresh reserved successor directory required')
    require(p.ref(repository/A18)['sha256'] == A18_SHA, 'Exact actual A18 acceptance receipt required')
    acceptance = read(repository/A18)
    require(acceptance['passed'] is True and acceptance['app'] == str(accepted) and
            len(acceptance['files']) == 11201 and
            p.digest(acceptance['files']) == acceptance['inventorySha256'] == A18_INVENTORY,
            'Actual accepted 11,201-leaf A38 inventory differs')
    accepted_rows = acceptance['files']
    require(p.inventory(accepted) == accepted_rows, 'Accepted app changed since actual A18 inventory')
    actions = plan['orderedActions']
    require(len(actions) > 2 and [item['operation'] for item in actions[:2]] ==
            ['clone-tree-preserving-links', 'clone-tree-preserving-links'] and
            all(item['operation'] == 'replace-regular-file' for item in actions[2:]),
            'Only two declared clones then finite regular replacements are supported')
    browser_inventory_ref=p.ref(args.browser_inventory)
    browser_inventory=read(args.browser_inventory)
    require(browser_inventory.get('format')=='aux.completion.frozen-browser-inventory.v1' and
            browser_inventory.get('productExecuted') is False and browser_inventory.get('productSigned') is False and
            p.digest(browser_inventory['files'])==browser_inventory['inventorySha256']==BROWSER_INVENTORY,
            'Exact actual frozen a7 whole-browser inventory required')
    require(p.ref(browser_inventory['buildReceipt']['path'])==browser_inventory['buildReceipt'] and
            p.ref(repository/RUNTIME_PACKAGE)==browser_inventory['inventoryHelper'],
            'Frozen browser build/inventory implementation changed')
    browser = Path(actions[0]['source'])
    require(browser_inventory['app']==str(browser), 'Frozen browser inventory belongs to another app')
    require(browser.is_dir() and not browser.is_symlink() and
            actions[0]['destination'] == str(final) and
            actions[1]['source'] == str(accepted/RES) and
            actions[1]['destination'] == str(final/RES), 'Exact browser/accepted Aux clone order required')
    require(not (browser/RES).exists() and not (browser/RES).is_symlink(),
            'Raw frozen browser must not already contain an undeclared Aux package')
    require(not output.is_relative_to(browser) and not output.is_relative_to(accepted),
            'Output must be separate from both frozen inputs')
    replacements = actions[2:]
    paths = [str(confined(item['relative'])) for item in replacements]
    require(len(paths) == len(set(paths)) and str(RES/'bundle.json') not in paths and
            all(Path(path).is_relative_to(RES) for path in paths), 'Unique confined Aux replacements required')
    for item in replacements:
        require(item['destination'] == str(final/item['relative']), 'Destination does not match the reviewed successor')
        verify_source(p, item)
    before = leaf_map(accepted_rows)
    source_refs = [p.ref(__file__), p.ref(repository/RUNTIME_PACKAGE), p.ref(p.LEGACY),
                   p.ref(repository/GENERATOR), plan_ref, p.ref(repository/A18), browser_inventory_ref,
                   browser_inventory['buildReceipt'], browser_inventory['inventoryHelper']]
    source_refs += [copy.deepcopy(item) for item in plan['receiptPins']]
    source_refs += [p.ref(item['source']) for item in replacements]
    stage = Path(tempfile.mkdtemp(prefix='.aux-completion-assembly-', dir=output.parent))
    try:
        replay = replay_plan(repository, plan, stage, p)
        browser_receipt = read(plan['receiptPins'][0]['path'])
        require(browser_receipt['app'] == str(browser) and
                plan['receiptPins'][0]['sha256']==browser_inventory['buildReceipt']['sha256'],
                'Raw browser does not belong to the exact inventoried successful build receipt')
        browser_rows=browser_inventory['files']
        require(p.inventory(browser)==browser_rows, 'Actual frozen whole-browser inventory differs before clone')
        for item in browser_receipt['artifacts']:
            require(p.ref(item['path'])['sha256'] == item['sha256'] and
                    Path(item['path']) == browser/item['relative'], 'Frozen browser native artifact differs')
        app = stage/'Aux.app'
        shutil.copytree(browser, app, symlinks=True)
        require(p.inventory(app) == browser_rows, 'Raw browser copy differs')
        shutil.copytree(accepted/RES, app/RES, symlinks=True)
        require(p.inventory(app/RES) == p.inventory(accepted/RES), 'Copied accepted Aux subtree differs')
        for item in replacements:
            target = private_destination(app, confined(item['relative']))
            old = before.get(item['relative'])
            if old:
                require(old['type'] == 'file' and target.is_file() and not target.is_symlink() and
                        p.sha(target) == old['sha256'] and stat.S_IMODE(target.lstat().st_mode) == old['mode'],
                        'Copied replacement preimage differs: '+item['relative'])
            else:
                require(not target.exists() and not target.is_symlink(), 'New leaf already exists: '+item['relative'])
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(verify_source(p, item), target)
            target.chmod(item['mode'])
            require(p.sha(target) == item['sha256'], 'Copied replacement differs: '+item['relative'])
        removed = []
        for relative in STALE_SEALS:
            require(str(relative) not in paths, 'Replacement cannot target a stale code seal')
            original = before[str(relative)]
            target = private_destination(app, relative)
            require(original['type'] == 'file' and target.is_file() and not target.is_symlink() and
                    p.sha(target) == original['sha256'] and stat.S_IMODE(target.lstat().st_mode) == original['mode'],
                    'Only exact copied daemon/CLI stale CodeResources may be removed')
            target.unlink()
            removed.append(copy.deepcopy(original))
        memory = read(app/MEMORY_POLICY)
        require(memory['format']=='aux.memory.fixed-helper-launch.v1' and
                str(MEMORY_POLICY) not in paths and str(MEMORY_HELPER) not in paths and
                p.sha(app/MEMORY_POLICY) == before[str(MEMORY_POLICY)]['sha256'] and
                p.sha(app/MEMORY_HELPER) == before[str(MEMORY_HELPER)]['sha256'] == memory['sha256'] and
                (app/MEMORY_HELPER).stat().st_size == memory['bytes'],
                'Retained memory policy requires unchanged exact helper image bytes')
        require(read(app/BOOTSTRAP)['format'] == 'aux.fresh.bootstrap.policy.v10', 'Explicit v10 policy absent')
        require((not (app/CU_POLICY).exists()) if plan['CUlaunchPolicyPending'] else
                read(app/CU_POLICY)['format'] == 'aux.computer-use.fixed-helper-launch.v1',
                'Unsigned CU policy pending state differs; no signed digest may be fabricated')
        marker = private_destination(app, RES/'bundle.json')
        provenance = dict(proposedApp=str(final), plan=plan_ref, acceptedRows=before,
            acceptedInventory=dict(receipt=p.ref(repository/A18), inventorySha256=A18_INVENTORY, leaves=11201),
            predecessorBundle=dict(path=str(accepted/RES/'bundle.json'), sha256=before[str(RES/'bundle.json')]['sha256']),
            browser=dict(receipt=plan['receiptPins'][0], inventorySha256=p.digest(browser_rows),
                         leaves=len(browser_rows), frozenInventory=browser_inventory_ref,
                         frozenInventoryVerifiedBeforeClone=True),
            sources=source_refs, CUlaunchPolicyPending=plan['CUlaunchPolicyPending'])
        updated = metadata(read(marker), app, replacements, removed, accepted, provenance, p)
        marker.write_text(json.dumps(updated, indent=2)+'\n')
        marker.chmod(before[str(RES/'bundle.json')]['mode'])
        after = p.inventory(app)
        verify_marker(app, updated, after)
        actual = leaf_map(after)
        delta = set(paths) | {str(item) for item in STALE_SEALS} | {str(RES/'bundle.json')}
        require({key: value for key, value in before.items() if key.startswith(str(RES)+'/') and key not in delta} ==
                {key: value for key, value in actual.items() if key.startswith(str(RES)+'/') and key not in delta},
                'Unchanged accepted Aux leaf differs outside the explicit delta')
        require([item for item in browser_rows if not Path(item['path']).is_relative_to(RES)] ==
                [item for item in after if not Path(item['path']).is_relative_to(RES)],
                'Frozen browser framework/resource leaf changed outside Aux')
        for item in replacements:
            require(actual[item['relative']] == dict(path=item['relative'], type='file',
                    sha256=item['sha256'], mode=item['mode']), 'Final replacement bytes/mode differ')
        require(all(str(path) not in actual for path in STALE_SEALS), 'Copied stale seal remains')
        require(p.inventory(accepted) == accepted_rows and p.inventory(browser) == browser_rows,
                'A frozen source tree changed during assembly')
        for item in source_refs:
            require(p.ref(item['path']) == item, 'A frozen assembly source changed')
        receipt = dict(format='aux.completion.unsigned-static-package.v1', passed=True,
            app=str(final), plan=plan_ref, planReplay=replay, sources=source_refs,
            files=after, inventorySha256=p.digest(after), leaves=len(after),
            acceptedInventorySha256=A18_INVENTORY, unchangedAuxOutsideExplicitDelta=True,
            rawBrowserOutsideAuxUnchanged=True, allActiveManifestRowsMatchActual=True,
            exactReplacementCount=len(replacements), removedCopiedSignatureResources=removed,
            currentManifestSha256=p.digest(updated['files']),
            CUlaunchPolicyPending=plan['CUlaunchPolicyPending'], CUtestable=False,
            historicalSignaturesDoNotCertifySuccessor=True, **FALSE_FLAGS)
        write_new(stage/'receipt.json', receipt)
        require(not output.exists() and not output.is_symlink(), 'Reserved output appeared during assembly')
        stage.rename(output)
    except Exception as error:
        write_new(stage/'failure.json', dict(passed=False, error=str(error),
                  plan=plan_ref, retainedStaging=str(stage), **FALSE_FLAGS))
        print('Failed static candidate retained at '+str(stage), file=sys.stderr)
        raise
    print(json.dumps(dict(output=str(output), receipt=p.ref(output/'receipt.json'),
                         inventorySha256=receipt['inventorySha256'], leaves=len(after), **FALSE_FLAGS)))


if __name__ == '__main__':
    main()
