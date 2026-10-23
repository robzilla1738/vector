#!/usr/bin/env python3
import pathlib,json,hashlib,difflib
p=pathlib.Path(__file__).resolve().parent;repo=p.parents[3]
def sha(f):return hashlib.sha256(f.read_bytes()).hexdigest()
for name,digest in json.loads((p/'inputs.json').read_text()).items():assert sha(repo/name)==digest,name
pins=json.loads((p/'source-pins.json').read_text())
assert len(pins['swiftInputs'])==39
for group in ('swiftInputs','nativePeerDependencies','ownNativeHeader'):
 for name,digest in pins[group].items():assert sha(repo/name)==digest,name
patch=''.join(''.join(difflib.unified_diff(f.read_text().splitlines(True),(p/'source'/f.name).read_text().splitlines(True),fromfile='baseline/'+f.name,tofile='source/'+f.name)) for f in sorted((p/'baseline').iterdir()))
assert patch==(p/'successors.patch').read_text()
stage=(p/'source/AuxNativeFreshStageCoordinator.swift').read_text()
assert 'private let coldGuard:AuxFreshColdInstallerGuard' in stage
assert 'prepare(capture:AuxFreshNativeSecureCapture,coldGuard:AuxFreshColdInstallerGuard)' in stage
assert 'static func resume(coldGuard:AuxFreshColdInstallerGuard)' in stage
assert 'func revalidateNativeStageBinding() throws {\n        try coldGuard.revalidate()' in stage
assert stage.count('try coldGuard.revalidate()')>=3
factory=(p/'source/AuxNativeFreshBootstrapFactory.swift').read_text()
assert factory.index('try capture.takeAbsentForGeneration()')<factory.index('try coldGuard.revalidate()')<factory.index('let material=try generate')
assert factory.count('try coldGuard.revalidate()')==9
service=(p/'source/AuxAuthenticatedFreshColdBootstrap.swift').read_text()
assert service.index('set(.generationStopped(capture,')<service.index('AuxNativeFreshStageCoordinator.prepare')
assert service.index('set(.attempted(coordinator))')<service.index('coordinator.submitStageOnce()')
assert 'guardOwner.createFreshHome()' in service
assert 'NativeFreshStagedContext.resume(coldGuard:guardOwner)' in service
assert 'case .prepared' in service and 'case .attempted' in service
bridge=(repo/'docs/integration/proposed/aux-native-child-handoff/source/AuxNativeParentConnectionBridge.cc').read_text()
for symbol in ('AuxRetainNativeParentConnection','AuxReleaseNativeParentConnection','AuxRevalidateNativeParentConnection'):assert symbol in bridge
print('PASS:39 exact Swift inputs, actual5file native peer dependencies and mandatory guard/factory/Add-context source pairs')

for name in ('AuxFreshNativeHome.swift','AuxResumedFreshNativeHome.swift'):
 source=(p/'source'/name).read_text()
 assert 'retainedParentDescriptor:Int32? = nil' in source
 assert 'if let retainedParentDescriptor{parentFD=fcntl(retainedParentDescriptor,F_DUPFD_CLOEXEC,0)}' in source
assert 'AuxFreshNativeHome.create(inCanonicalPrivateParent:policy.contents.canonicalPrivateParent,retainedParentDescriptor:parentFD)' in (p/'source/AuxFreshColdInstallerGuard.swift').read_text()
print('PASS: actual retained-parent fresh/resumed writer producers; no supplied-invalid-FD fallback')
