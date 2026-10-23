#!/usr/bin/env python3
"""Read-only source/pairing checks; never imports or executes the native graph."""
from pathlib import Path
import hashlib
import json
import ast

here = Path(__file__).resolve().parent
repo = here.parents[3]
pins = json.loads((here / 'inputs.json').read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
for name, digest in pins['files'].items():
    assert sha(repo / name) == digest, name
for section in ['externalStaticReferences', 'nodeLifecycleReferences']:
    for name, digest in pins[section].items():
        assert sha(Path(name)) == digest, name
main = (here / 'source/AuxNativeDaemonMain.cc').read_text()
order = ['const mach_port_t endpoint = AuxTakeNativeParentEndpointForBootstrap()',
         'const auto images_status = AuxPrepareSealedNativeDaemonImages()',
         'const auto parent_status = AuxCreateSealedOuterBrowserParentConnection(',
         'const auto bootstrap_status = AuxCreateAuthenticatedFreshColdBootstrap(',
         'const auto phase = AuxAdvanceAuthenticatedFreshColdBootstrap(',
         'if (!InstallReadyHomeEnvironment(lifetime))',
         'const auto export_status = AuxSendAuthenticatedFreshColdHome(',
         'const auto authority_status = AuxStartPreparedDaemonAuthorityServer(',
         'AuthorityLoop authority(lifetime)',
         'const auto entry_status = AuxCopySealedNativeDaemonEntry(',
         'auto initialized = node::InitializeOncePerProcess(',
         'auto setup = node::CommonEnvironmentSetup::Create(',
         'std::make_shared<AuxDevelopmentWorkerHost>(lifetime.provider)',
         'const auto result = RunAuxNativeNodeEnvironment(',
         'pulse.StopAndJoin()',
         'authority.StopAndDrain()',
         'while (drain != AuxDevelopmentWorkerDrain::drained)',
         'const int exit_code = pulse.failed()',
         'setup.reset()']
positions = [main.rindex(anchor) if anchor == 'authority.StopAndDrain()' else main.index(anchor) for anchor in order]
assert positions == sorted(positions)
assert '--disable-sigusr1' in main and '--use-system-ca' in main
assert 'uv_run(' not in main
assert 'AuxCreateSignedDevelopmentOwner' not in (here / 'source/AuxDevelopmentWorkerHost.cc').read_text()
assert 'AuxDevelopmentWorkerHost() = delete;' in (here / 'source/AuxDevelopmentWorkerHost.h').read_text()
worker = Path(next(n for n in pins['nodeLifecycleReferences'] if n.endswith('/node_worker.cc'))).read_text()
assert 'embedder_preload_(env->embedder_preload())' in worker
assert 'std::move(embedder_preload_)' in worker
ast.parse((here / 'build.py').read_text())
print('PASS: fixed native main order, source/header/reference pins, fresh-only host and actual Worker preload source; no compile/link/execution')
