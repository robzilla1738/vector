#!/usr/bin/env python3
"""Apply the bounded ordinary Computer Use lifecycle repair to both real leaves."""
import argparse
import hashlib
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PACKAGE = Path('/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development')
PINS = {'index.mjs': 'a5f207fe3a36dd5fec2ee32a4b84eae0a49371364fa66c530d95f1af987509f6',
        'aux-native-entry.mjs': '89f61dded0775d30c4bb3f88d347219d5eda80ed1a8c1be1f69c3f44a7237317'}
PREDICATE = '''function auxComputerUseRuntimeDisabled(){
 if(process.platform!=='darwin')return false;
 try{
  const binding=process._linkedBinding('aux_owned_native');
  const mode=Object.getOwnPropertyDescriptor(binding,'supervisedTasksEnabled');
  return !!mode&&!mode.get&&!mode.set&&!mode.writable&&!mode.configurable&&mode.value===false;
 }catch{return false}
}
'''
BEFORE_PREPARE = 'function prepareComputerUseHelperRuntime(){return process.platform!==`darwin`&&process.platform!==`win32`?Promise.resolve():shuttingDown$1?Promise.reject(/* @__PURE__ */ Error(`Computer Use Helper is shutting down.`)):(preparePromise??=(process.platform===`win32`?refreshWindowsRuntime():refreshRuntimeApp()).catch(Cn=>{throw preparePromise=void 0,Cn}),preparePromise)}'
AFTER_PREPARE = PREDICATE + 'function prepareComputerUseHelperRuntime(){if(auxComputerUseRuntimeDisabled())return Promise.reject(Object.assign(new Error(`Computer Use is disabled in this browser build`),{code:`AUX_SUPERVISED_TASKS_DISABLED`}));return process.platform!==`darwin`&&process.platform!==`win32`?Promise.resolve():shuttingDown$1?Promise.reject(/* @__PURE__ */ Error(`Computer Use Helper is shutting down.`)):(preparePromise??=(auxComputerUseRuntimeAttempted=true,(process.platform===`win32`?refreshWindowsRuntime():refreshRuntimeApp())).catch(Cn=>{throw preparePromise=void 0,Cn}),preparePromise)}'
TRANSFORMS = [
    (BEFORE_PREPARE, AFTER_PREPARE),
    ('async function shutdownComputerUseHelper(){if(process.platform!==`darwin`&&process.platform!==`win32`)return;shuttingDown$1=true;const errors=[];',
     'async function shutdownComputerUseHelper(){if(process.platform!==`darwin`&&process.platform!==`win32`)return;shuttingDown$1=true;if(auxComputerUseRuntimeDisabled()&&!auxComputerUseRuntimeAttempted&&preparePromise==null)return;const errors=[];'),
    ('var execFileAsync$2,RUNTIME_DIR,STAGING_APP_PATH,PREVIOUS_APP_PATH,preparePromise,shuttingDown$1,WINDOWS_IDENTITY_SCRIPT,',
     'var execFileAsync$2,RUNTIME_DIR,STAGING_APP_PATH,PREVIOUS_APP_PATH,preparePromise,auxComputerUseRuntimeAttempted,shuttingDown$1,WINDOWS_IDENTITY_SCRIPT,'),
    ('shuttingDown$1=!1,WINDOWS_IDENTITY_SCRIPT=String.raw`',
     'auxComputerUseRuntimeAttempted=false,shuttingDown$1=!1,WINDOWS_IDENTITY_SCRIPT=String.raw`'),
    ('async#T(){if(process.platform!==`darwin`&&process.platform!==`win32`){this.#i=`unsupported`;return}',
     'async#T(){if(process.platform!==`darwin`&&process.platform!==`win32`||auxComputerUseRuntimeDisabled()){this.#i=`unsupported`;return}'),
    ('#D(){this.#i=`starting`;let Cn=globalThis.process.platform===`win32`;',
     '#D(){if(auxComputerUseRuntimeDisabled()){this.#i=`unsupported`;return}auxComputerUseRuntimeAttempted=true;this.#i=`starting`;let Cn=globalThis.process.platform===`win32`;'),
    ('process.platform===`darwin`&&prepareComputerUseHelperRuntime().catch(Cn=>{logger.warn(`[Main] Computer Use runtime app could not be refreshed`,{error:Cn})})',
     'process.platform===`darwin`&&!auxComputerUseRuntimeDisabled()&&prepareComputerUseHelperRuntime().catch(Cn=>{logger.warn(`[Main] Computer Use runtime app could not be refreshed`,{error:Cn})})'),
]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    if args.output:
        output = args.output
        output.mkdir(parents=True, exist_ok=False)
    else:
        output = Path(tempfile.mkdtemp(prefix='aux-computer-use-lifecycle-a48-', dir='/private/tmp'))
    rows = []
    for leaf, pin in PINS.items():
        source = PACKAGE / leaf
        original = source.read_bytes()
        assert sha(original) == pin, f'Input changed: {source}'
        before = original.decode()
        after = before
        for old, new in TRANSFORMS:
            assert after.count(old) == 1, f'Anchor count changed: {leaf}: {old[:80]}'
            after = after.replace(old, new, 1)
        restored = after
        for old, new in reversed(TRANSFORMS):
            assert restored.count(new) == 1
            restored = restored.replace(new, old, 1)
        assert restored == before
        target = output / leaf
        target.write_text(after)
        rows.append({'input': str(source), 'inputSha256': pin, 'output': str(target),
                     'outputSha256': sha(after.encode()),
                     'anchors': [{'before': old, 'after': new, 'count': 1} for old, new in TRANSFORMS]})
    plan = {'format': 'aux.ordinary-computer-use-lifecycle.v1', 'files': rows,
            'fullModeOriginalLifecycle': True, 'generalExecChanged': False,
            'nativeGuardsChanged': False, 'productExecuted': False}
    (HERE / 'source-plan.json').write_text(json.dumps(plan, indent=2) + '\n')
    (HERE / 'checks.json').write_text(json.dumps({'exactInputHashes': True,
        'singleCountAnchorsPerLeaf': len(TRANSFORMS), 'forwardReplay': True,
        'reverseReplay': True, 'syntax': 'pending node --check only',
        'runtimeAcceptance': 'parent-owned actual normal Quit remains pending'}, indent=2) + '\n')
    print(json.dumps({'directory': str(output), 'files': [
        {key: row[key] for key in ('output', 'outputSha256')} for row in rows]}))


if __name__ == '__main__':
    main()
