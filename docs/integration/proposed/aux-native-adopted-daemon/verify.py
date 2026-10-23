#!/usr/bin/env python3
"""Verify frozen successor bytes and narrow source integration invariants."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]


def main():
    manifest = json.loads((HERE / 'inputs.json').read_text())
    for relative, expected in (manifest['workspaceInputs'] | manifest['transportInputs']).items():
        if hashlib.sha256((ROOT / relative).read_bytes()).hexdigest() != expected:
            raise SystemExit('Changed input: ' + relative)
    sources = sorted((HERE / 'source').iterdir())
    assert len(sources) == manifest['sourceFiles'] == 9
    assert len(list((HERE / 'baseline').iterdir())) == manifest['baselineFiles'] == 9
    patch = ''.join(''.join(difflib.unified_diff(
        (HERE / 'baseline' / source.name).read_text().splitlines(True),
        source.read_text().splitlines(True), fromfile='baseline/' + source.name,
        tofile='source/' + source.name)) for source in sources)
    assert patch == (HERE / 'change.patch').read_text()
    supervisor = (HERE / 'source/daemon_supervisor.cc').read_text()
    holder = (HERE / 'source/AuxSelectedStateHome.cc').read_text()
    platform = (HERE / 'source/browser_platform.cc').read_text()
    auth = (HERE / 'source/installation_auth.cc').read_text()
    assert 'DaemonSupervisor::AdoptInstalledNativeChild(' in supervisor
    assert 'Never launch/restart/reap a second Process' in supervisor
    assert 'ObserveNativeDaemonChallenge' in supervisor
    assert '&DaemonSupervisor::ObserveNativeSignature' in supervisor
    assert supervisor.index('native_completed_signature_ = std::move(reply.signature)') < supervisor.index('  if (!CheckNativeSelection()) return;\n  switch (reply.status)')
    assert 'DidSignChallenge(*native_challenge_id_, native_completed_signature_)' in supervisor
    assert 'health->FindInt("pid") == *owned_pid' in supervisor
    assert 'peer::CloseNativeSelectedStateHome()' in supervisor
    assert 'closed.child_close->exit_observed_and_reaped' in supervisor
    assert 'DaemonSupervisor::AdoptInstalledNativeChild(' in platform
    assert 'Run(startup_state_ == StartupState::kReady)' in platform
    assert 'Selected native route refuses legacy' in auth or 'SelectedStateHomeRoute::unselected' in auth
    assert 'LoadAgentInboxV2MasterKey' in auth
    assert "owner->AcceptAuthorityReply(reply, 2'000)" in holder
    assert 'after->generation != before->generation' in holder
    assert "after->exports < before->exports" in holder
    print('PASS: exact 9-source/9-baseline patch and static adoption invariants; no compilation or execution')


if __name__ == '__main__':
    main()
