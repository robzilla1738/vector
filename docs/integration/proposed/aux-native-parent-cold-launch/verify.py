#!/usr/bin/env python3
"""Verify the inactive caller's exact inputs and default-off source patch."""
import difflib
import hashlib
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]


def main():
    inputs = json.loads((HERE / 'inputs.json').read_text())
    for relative, expected in inputs['files'].items():
        if hashlib.sha256((ROOT / relative).read_bytes()).hexdigest() != expected:
            raise SystemExit('Changed input: ' + relative)
    assert len(list((HERE / 'source').iterdir())) == inputs['sourceFiles'] == 3
    assert len(list((HERE / 'baseline').iterdir())) == inputs['baselineFiles'] == 2
    source = (HERE / 'source/AuxNativeParentColdLaunch.cc').read_text()
    policy = (ROOT / 'docs/integration/proposed/aux-native-embedded-image-preparation/source/AuxFreshBootstrapPolicy.swift').read_text()
    certificate = bytes(int(byte, 16) for byte in re.findall(r'0x([0-9a-f]{2})', source.split('kCertificate = {', 1)[1].split('};', 1)[0]))
    expected_certificate = re.search(r'leafCertificateSha256="([0-9a-f]+)"', policy).group(1)
    assert certificate.hex() == expected_certificate
    assert 'constexpr char kTeam[] = "' + re.search(r'static let team="([A-Z0-9]+)"', policy).group(1) + '";' in source
    assert 'PrepareCurrentSealedChild()' in source
    assert 'SecCodeCopySelf(' in source and 'SecCodeCheckValidity(' in source
    assert 'ExactCodePolicy::CopyNativePolicy(child_requirement.get(), selected->cd_hash)' in source
    assert 'AuxValidateEmbeddedNativeDaemonLaunchPolicy(child.get()' in source
    assert source.index('AuxValidateEmbeddedNativeDaemonLaunchPolicy(child.get()') < source.index('options.clear_environment = true')
    assert 'options.environment["AUX_PORT"] = "21520"' in source
    assert 'child->LaunchOnce()' in source and 'child->TakeSelectedHome()' in source
    assert 'InstallNativeSelectedStateHome(std::move(home))' in source
    assert 'attempt.attempted = true' in source
    assert 'SetVar(' not in source and 'kill(' not in source
    reader_name = 'AuxAuthenticatedChildParentPolicyReader.swift'
    baseline = (HERE / 'baseline' / reader_name).read_text()
    reader = (HERE / 'source' / reader_name).read_text()
    assert reader.startswith(baseline)
    assert 'policy.role == .daemon, policy.embeddedDaemon' in reader[len(baseline):]
    expected_patch = ''.join(difflib.unified_diff(
        baseline.splitlines(True), reader.splitlines(True),
        fromfile='baseline/' + reader_name, tofile='source/' + reader_name))
    assert expected_patch == (HERE / 'parent-reader.patch').read_text()
    startup = (HERE / 'baseline/chrome_browser_main.cc').read_text()
    lines = startup.splitlines()
    assert 'BrowserPlatform::Get().Start(' in lines[1918]
    assert 'PreProfileInit();' in lines[1927]
    hook = (HERE / 'chrome-main-hook.patch').read_text()
    assert hook.count('+#if defined(AUX_SEALED_NATIVE_COLD_ENTRY)') == 2
    assert 'StartSealedNativeDaemonBeforeProfiles().route' in hook
    assert inputs['productDefineEnabled'] is False
    print('PASS: exact source/policy lineage and default-off startup hook; no compilation or execution')


if __name__ == '__main__':
    main()
