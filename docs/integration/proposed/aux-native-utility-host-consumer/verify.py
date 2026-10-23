from pathlib import Path
import hashlib,json
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3];pins=json.loads((HERE/'inputs.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
for item in pins['files']:assert sha((ROOT/item['path']).read_bytes())==item['sha256'],item['path']
cc=(HERE/'source/AuxLoadedUtilityLifetime.cc').read_text();worker=(ROOT/'docs/integration/proposed/aux-development-worker-host/source/AuxDevelopmentWorkerHost.cc').read_text();recipe=(ROOT/'docs/integration/proposed/aux-development-worker-host/build.sh').read_text()
assert cc.count(pins['productionUtilityImage']['sha256'])==1 and cc.count(str(pins['productionUtilityImage']['bytes']))==2
for token in ['RTLD_NOLOAD|RTLD_LOCAL|RTLD_NOW','AuxMacUtilityCloseAdmissionAndDrain','AuxMacUtilityPendingEnvironments','OwnSymbol(close,candidates[0])','const pid_t kConsumerProcess=getpid();','InspectRetainedClosures()']:assert token in cc
assert worker.index('int32_t prepared = AuxCreateSignedDevelopmentOwner')<worker.index('captured_utility = AuxLoadedUtilityLifetime::CaptureAfterAuthenticatedOwner()')<worker.index('status = AuxAttachOwnedDispatcher')
for token in ['worker->utility = captured_utility','utility_close_requested','utility_close_unresolved','captured_utility->InspectIfClosureStarted()','AuxLoadedUtilityLifetime::InspectRetainedClosures()']:assert token in worker
assert recipe.count("units.add('aux-native-utility-host-consumer/source/AuxLoadedUtilityLifetime.cc')")==1
assert recipe.count('"$output/utility-lifetime.o"')==3
assert '"$output/pdf-lifetime.o" "$output/utility-lifetime.o"\nsh ' not in recipe
print('PASS: finite fixed utility image, actual factory-before-capture/cleanup pairing, retained closure and production recipe; shared host pins untouched')
