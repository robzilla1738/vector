#!/usr/bin/env python3
"""Apply only fixed counted capability gates to the current217 paired leaves."""
import argparse
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
PACKAGE = Path('/Users/rcourson/Documents/Vibe/web/out/provided-candidate-desktop-completion-20261024-a3/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development')
INPUTS = {'index.mjs': 'f525f457b2c08df4fd3790ffe0acacf1e86101cc8c0c1706ff9fee7235706d57',
          'aux-native-entry.mjs': 'd30e8358be489e2e4f1a43a7194e78da6a939b85e871a89c7f983e6adc9bc465'}
HELPER = '''// The immutable native observation cannot grant task execution from JS.
function auxRequireSupervisedTasks(){
 const native=process._linkedBinding('aux_owned_native');
 const d=Object.getOwnPropertyDescriptor(native,'supervisedTasksEnabled');
 if(!d||d.get||d.set||d.writable||d.configurable||d.value!==true)
  throw Object.assign(new Error('Supervised task execution is disabled in this browser build'),{code:'AUX_SUPERVISED_TASKS_DISABLED'});
}
'''
ANCHORS = [
    ('let auxMemoryV2SeedPending', HELPER + 'let auxMemoryV2SeedPending'),
    ('async function executePreparedToolCall(Cn,ei,ti){let ni=[],ri=!0;try{',
     'async function executePreparedToolCall(Cn,ei,ti){let ni=[],ri=!0;try{auxRequireSupervisedTasks();'),
    ('function createDesktopRepl(Cn){', 'function createDesktopRepl(Cn){auxRequireSupervisedTasks();'),
    ('async function runComputerUseCommand(Cn,ei={},ti={}){', 'async function runComputerUseCommand(Cn,ei={},ti={}){auxRequireSupervisedTasks();'),
    ('async send(Cn,ei,ti,ni={}){', 'async send(Cn,ei,ti,ni={}){auxRequireSupervisedTasks();'),
    ('async ensureConnected(){this.#auxLifetime?.assertOpen();', 'async ensureConnected(){auxRequireSupervisedTasks();this.#auxLifetime?.assertOpen();'),
    ('async sendCommandToExtension(Cn,ei={}){', 'async sendCommandToExtension(Cn,ei={}){auxRequireSupervisedTasks();'),
    ('async function sendCommandToExtension(Cn,ei={}){', 'async function sendCommandToExtension(Cn,ei={}){auxRequireSupervisedTasks();'),
    ('async function prepareSessionSpawn(Cn,ei){', 'async function prepareSessionSpawn(Cn,ei){auxRequireSupervisedTasks();'),
    ('function loadPdfBinding(){', 'function loadPdfBinding(){auxRequireSupervisedTasks();'),
    ('function loadAuxMacUtilityBinding(){', 'function loadAuxMacUtilityBinding(){auxRequireSupervisedTasks();'),
]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',required=True,type=Path)
    args=parser.parse_args()
    args.output.mkdir(parents=True,exist_ok=False)
    rows=[]
    for name, expected in INPUTS.items():
        source=PACKAGE/name
        data=source.read_bytes()
        assert sha(data)==expected,(name,'input changed')
        text=data.decode()
        for before,after in ANCHORS:
            assert text.count(before)==1,(name,before,text.count(before))
            text=text.replace(before,after,1)
        output=args.output/name
        output.write_text(text)
        assert ('AUX_STATE_IDENTITY_QUARANTINED' in text)==(name=='index.mjs')
        rows.append({'input':str(source),'inputSha256':expected,'output':str(output),
                     'outputSha256':sha(output.read_bytes()),'anchorCount':len(ANCHORS)})
    receipt={'format':'aux.ordinary-browser.source-controls.v1','files':rows,
             'anchorCountPerLeaf':len(ANCHORS),'baseAnchorCount':217,
             'allPredecessorBytesPreservedOutsideAnchors':True,
             'productExecuted':False,'signed':False,'sourceOnly':True}
    (args.output/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
    print(json.dumps(receipt))


if __name__=='__main__':
    main()
