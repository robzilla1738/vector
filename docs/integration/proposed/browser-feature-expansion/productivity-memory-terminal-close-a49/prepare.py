#!/usr/bin/env python3
"""Pair the existing native physical close with stale-account terminal cleanup."""
import argparse
import hashlib
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PACKAGE = Path('/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development')
PINS = {'index.mjs': '0d7c4f82f8f3dbb4e22999447a3ebeae2bd4ba48c82320c9b108ea687ef4931e',
        'aux-native-entry.mjs': '704f1918c1c46f517872a93f6c32230af92d7f887a8f82a794af7728549c47a1'}
TRANSFORMS = [
    ('MemoryProcess=class{#e;#t;#n;#r;#i=/* @__PURE__ */ new Map;#a=0;#o=[];#s=0;#c=[];#l;constructor(Cn){this.#e=Cn}get pid(){return this.#t?.pid}',
     'MemoryProcess=class{#e;#t;#n;#r;#i=/* @__PURE__ */ new Map;#a=0;#o=[];#s=0;#c=[];#l;#auxNativeClose;constructor(Cn){this.#e=Cn}get pid(){return this.#t?.pid}get hasNativeClose(){return typeof this.#auxNativeClose===`function`}'),
    ('close(){if(this.#n)return this.#n;let Cn=this.#t;if(!Cn)return Promise.resolve();this.#r&&clearTimeout(this.#r),this.#r=void 0;if(typeof Cn.auxClose===\'function\')return this.#n=Cn.auxClose().finally(()=>{this.#n=void 0});',
     'close(){if(this.#n)return this.#n;let Cn=this.#t;if(!Cn&&!this.#auxNativeClose)return Promise.resolve();this.#r&&clearTimeout(this.#r),this.#r=void 0;if(this.#auxNativeClose)return this.#n=this.#auxNativeClose().finally(()=>{this.#n=void 0});'),
    ('#f(){let Cn=this.#e,ei=auxSpawnMemoryProcess(Cn);return this.#t=ei,this.#o=[],this.#s=0,',
     '#f(){let Cn=this.#e,ei=auxSpawnMemoryProcess(Cn);return this.#auxNativeClose=typeof ei.auxClose===`function`?ei.auxClose:void 0,this.#t=ei,this.#o=[],this.#s=0,'),
    ('let ei=Promise.allSettled([...this.#o,...this.#c?[this.#c]:[],...this.#a?[this.#a]:[]]);try{this.#g.pid&&await this.#g.request(`close`,{directory:this.#h})}finally{await ei,await this.#g.close()}',
     'let ei=Promise.allSettled([...this.#o,...this.#c?[this.#c]:[],...this.#a?[this.#a]:[]]),auxNativeClose=this.#g.hasNativeClose;try{this.#g.pid&&await this.#g.request(`close`,{directory:this.#h})}catch(error){if(!auxNativeClose||error?.code!==`AUX_MEMORY_INPUT_REFUSED`||error?.message!==`Memory account owner is unavailable`)throw error;this.#u=!0}finally{if(auxNativeClose){try{await this.#g.close()}finally{await ei}}else{await ei,await this.#g.close()}}'),
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
        output = Path(tempfile.mkdtemp(prefix='aux-memory-terminal-close-a49-', dir='/private/tmp'))
    rows = []
    for leaf, pin in PINS.items():
        source = PACKAGE / leaf
        original = source.read_bytes()
        assert sha(original) == pin, f'Input changed: {source}'
        before = original.decode()
        after = before
        for old, new in TRANSFORMS:
            assert after.count(old) == 1, f'Anchor count changed: {leaf}'
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
    (HERE / 'source-plan.json').write_text(json.dumps({
        'format': 'aux.memory.native-terminal-close.v1', 'files': rows,
        'ordinaryRequestGuardChanged': False, 'nativeSettlementChanged': False,
        'fullModeOriginalClose': True, 'productExecuted': False}, indent=2) + '\n')
    (HERE / 'checks.json').write_text(json.dumps({'exactInputHashes': True,
        'singleCountAnchorsPerLeaf': len(TRANSFORMS), 'forwardReplay': True,
        'reverseReplay': True, 'syntax': 'pending node --check only',
        'runtimeAcceptance': 'parent-owned actual normal Quit remains pending'}, indent=2) + '\n')
    print(json.dumps({'directory': str(output), 'files': [
        {key: row[key] for key in ('output', 'outputSha256')} for row in rows]}))


if __name__ == '__main__':
    main()
