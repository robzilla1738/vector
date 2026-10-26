#!/usr/bin/env python3
"""Add finite nonsecret diagnostics to existing shutdown waits; never execute them."""
import argparse
import hashlib
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PACKAGE = Path('/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development')
PINS = {'index.mjs': 'ac4719f6faf1c495727cb21c284f06d5172b15b1af288d36fc9af1a56f3a8236',
        'aux-native-entry.mjs': '6c8bafbefef34d5f8cd5c562ab1462befa411ae2f04c7b6c52e5a702358e0683'}
DIAGNOSTIC = '''function auxShutdownDiagnostic(label, counts) {
  // Do not use the file logger while diagnosing its own brokered close.
  try { console.error('[Aux shutdown stage]', label, counts ?? ''); } catch {}
}
'''
OBSERVED = '''  const observed = (label, callback) => {
    auxShutdownDiagnostic(label + '.start');
    const pending = call(callback);
    pending.then(() => auxShutdownDiagnostic(label + '.settled'),
      () => auxShutdownDiagnostic(label + '.failed'));
    return pending;
  };
'''
STOPS_BEFORE = '''    const stops=[call(deps.stopIntervals),call(deps.stopRefresh),call(deps.stopProductivity),
      call(deps.stopChannels),call(deps.stopOutbox),call(deps.stopBackground),call(deps.stopComputerUse),
      call(deps.stopCoder),call(deps.terminateExec),call(deps.killCommands)];
'''
STOPS_AFTER = '''    auxShutdownDiagnostic('daemon.start');
    const stops=[observed('intervals',deps.stopIntervals),observed('refresh',deps.stopRefresh),observed('productivity',deps.stopProductivity),
      observed('channels',deps.stopChannels),observed('outbox',deps.stopOutbox),observed('background',deps.stopBackground),observed('computer-use',deps.stopComputerUse),
      observed('coder',deps.stopCoder),observed('exec',deps.terminateExec),observed('commands',deps.killCommands)];
'''
WAIT_BEFORE = '''      await settled([...stops,call(deps.bootstrap)],'Aux producers did not settle');
      while(fetches.size)await settled([...fetches],'Aux HTTP work did not settle');
      await settled(closeTransports(),'Aux transport did not close');
      // Telemetry is a producer too; close it while admitted cleanup can write.
      await deps.stopTelemetry();
      await deps.closeBroker();
      deps.releaseHold(hold);hold=undefined;
      // Only now can NativeRun return to the retained host's real settlement loop.
      deps.exit();
'''
WAIT_AFTER = '''      await settled([...stops,observed('bootstrap',deps.bootstrap)],'Aux producers did not settle');
      auxShutdownDiagnostic('producers.settled');
      auxShutdownDiagnostic('fetches.start',{pending:fetches.size});
      while(fetches.size)await settled([...fetches],'Aux HTTP work did not settle');
      auxShutdownDiagnostic('fetches.settled');
      await settled(closeTransports(),'Aux transport did not close');
      auxShutdownDiagnostic('transports.settled');
      // Telemetry is a producer too; close it while admitted cleanup can write.
      await observed('telemetry',deps.stopTelemetry);
      await observed('broker',deps.closeBroker);
      deps.releaseHold(hold);hold=undefined;
      // Only now can NativeRun return to the retained host's real settlement loop.
      auxShutdownDiagnostic('daemon.exit');
      deps.exit();
'''
BROKER_BEFORE = ''' function beginShutdown(){
  if(shutdown)return shutdown;
  closing=true;
  shutdown=(async()=>{
   // Refuse new producer entries first. No timeout/AbortSignal is treated as
   // completion. The outer existing process timeout is NOT a drain receipt.
   // Stop future triggers before awaiting work. Calling these pinned stops
   // does not itself establish native drain; their original closure is awaited.
   const stopResults=await Promise.allSettled([...producerStops].map(stop=>{try{return stop()}catch(error){return Promise.reject(error)}}));
   const watcherResults=await Promise.allSettled([...watchers].map(watcher=>watcher.close()));
   const outcomes=await Promise.allSettled([...operations]);
   let failure=[...stopResults,...watcherResults,...outcomes].find(result=>result.status==='rejected')?.reason??operationFailure;
   if(failure)funcs.noteUntrackedBrokerWork();
   for(const database of [...databases])try{database.close()}catch(error){failure??=error}
   await Promise.all([...streams].map(stream=>new Promise(resolve=>{stream.once('close',resolve);try{if(!producerStreams.has(stream))stream.end()}catch(error){failure??=error;funcs.noteUntrackedBrokerWork();resolve()}})));
   const resourceOutcomes=await Promise.allSettled([...lifetimes]);
   failure??=resourceOutcomes.find(result=>result.status==='rejected')?.reason??lifetimeFailure;
   funcs.closeBrokerWriteAdmission();
   if(failure)throw failure;
  })();
  shutdown.catch(()=>{});return shutdown;
 }
'''
BROKER_AFTER = BROKER_BEFORE.replace('  shutdown=(async()=>{', '''  const report=label=>auxShutdownDiagnostic(label,{producers:producerStops.size,watchers:watchers.size,
   operations:operations.size,databases:databases.size,streams:streams.size,lifetimes:lifetimes.size,
   operationFailure:!!operationFailure,lifetimeFailure:!!lifetimeFailure});
  shutdown=(async()=>{
   report('broker.producers.start');''').replace(
    '   const watcherResults=', "   report('broker.producers.settled');\n   report('broker.watchers.start');\n   const watcherResults=").replace(
    '   const outcomes=', "   report('broker.watchers.settled');\n   report('broker.operations.start');\n   const outcomes=").replace(
    '   let failure=', "   report('broker.operations.settled');\n   let failure=").replace(
    '   for(const database', "   report('broker.databases.start');\n   for(const database").replace(
    '   await Promise.all([...streams]', "   report('broker.databases.settled');\n   report('broker.streams.start');\n   await Promise.all([...streams]").replace(
    '   const resourceOutcomes=', "   report('broker.streams.settled');\n   report('broker.lifetimes.start');\n   const resourceOutcomes=").replace(
    '   failure??=resourceOutcomes', "   report('broker.lifetimes.settled');\n   failure??=resourceOutcomes").replace(
    '   funcs.closeBrokerWriteAdmission();', "   report('broker.admission.start');\n   funcs.closeBrokerWriteAdmission();\n   report('broker.admission.settled');")
TRANSFORMS = [
    ('function auxCreateDaemonShutdown(deps) {\n', DIAGNOSTIC + 'function auxCreateDaemonShutdown(deps) {\n'),
    ('  const call = callback => {try{return Promise.resolve(callback())}catch(error){return Promise.reject(error)}};\n',
     '  const call = callback => {try{return Promise.resolve(callback())}catch(error){return Promise.reject(error)}};\n' + OBSERVED),
    ('    const closeTransports=()=>[closeWebSockets(deps.websockets()),closeHttp(deps.http())];',
     "    const closeTransports=()=>[observed('websockets',()=>closeWebSockets(deps.websockets())),observed('http',()=>closeHttp(deps.http()))];"),
    (STOPS_BEFORE, STOPS_AFTER), (WAIT_BEFORE, WAIT_AFTER), (BROKER_BEFORE, BROKER_AFTER),
    ('if(this.#auxNativeClose)return this.#n=this.#auxNativeClose().finally(()=>{this.#n=void 0});',
     "if(this.#auxNativeClose){auxDaemonClosing&&auxShutdownDiagnostic('memory.native-close.start');return this.#n=this.#auxNativeClose().then(value=>{auxDaemonClosing&&auxShutdownDiagnostic('memory.native-close.settled');return value},error=>{auxDaemonClosing&&auxShutdownDiagnostic('memory.native-close.failed');throw error}).finally(()=>{this.#n=void 0})}"),
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
        output = Path(tempfile.mkdtemp(prefix='aux-shutdown-stages-a50-', dir='/private/tmp'))
    rows = []
    for leaf, pin in PINS.items():
        source = PACKAGE / leaf
        original = source.read_bytes()
        assert sha(original) == pin, f'Input changed: {source}'
        before = original.decode()
        after = before
        for old, new in TRANSFORMS:
            assert after.count(old) == 1, f'Anchor count changed: {leaf}: {old[:60]}'
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
    (HERE / 'source-plan.json').write_text(json.dumps({'format': 'aux.shutdown-stage-diagnostics.v1',
        'files': rows, 'diagnosticsOnly': True, 'timeoutsAdded': False, 'guardsChanged': False,
        'productExecuted': False}, indent=2) + '\n')
    (HERE / 'checks.json').write_text(json.dumps({'exactInputHashes': True,
        'singleCountAnchorsPerLeaf': len(TRANSFORMS), 'forwardReplay': True,
        'reverseReplay': True, 'syntax': 'pending node --check only',
        'runtimeAcceptance': 'parent-owned actual Quit diagnosis pending'}, indent=2) + '\n')
    print(json.dumps({'directory': str(output), 'files': [
        {key: row[key] for key in ('output', 'outputSha256')} for row in rows]}))


if __name__ == '__main__':
    main()
