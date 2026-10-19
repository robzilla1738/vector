#!/usr/bin/env python3
"""Bounded static supplied NTP service audit; never loads or executes its target."""
import argparse
import hashlib
import json
import mmap
from pathlib import Path
import struct

SHA256 = '64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c'
FUNCTIONS = {
    'resolveEligibleOverride': (0x42B14C0, 0x328),
    'getOrCreateProfileService': (0x42B17E8, 1116),
    'scheduleForBrowser': (0x42B1C64, 744),
    'takeForBrowser': (0x42B1F54, 1264),
    'checkTransferredHandle': (0x42B2454, 604),
    'startPrerender': (0x42B26D8, 1240),
    'observedPreferenceChanged': (0x42B2BCC, 0xB0),
    'resetPrerender': (0x42B34C0, 0x100),
    'sourceBrowserGone': (0x42B35E8, 0xC8),
    'activationCandidateCallback': (0x42B36B0, 0x80),
    'contentStartPrerenderEntry': (0x4057AA0, 0x150),
    'getProfileType': (0x529C24, 0x1C0),
    'isSystemProfile': (0x4CE584, 0x1B0),
    'transferredHandleDestructor': (0x42B3870, 0xA0),
    'transferredFrameChanged': (0x42B39B8, 0xD4),
    'resizeWebContents': (0x69495B8, 0xAC),
}
PREFS = ['extensions.chrome_url_overrides', 'net.network_prediction_options',
         'aside.account_user_id', 'aside.account_id',
         'aside.account_has_persisted_session', 'aside.account_auth_paused',
         'browser.theme.color_scheme2']
CALLS = {0x42B1540 - 4: 0x16A186C, 0x42B15E8: 0x3330A68,
         0x42B2120: 0x42B1C64, 0x42B23E4: 0x42B1C64,
         0x42B2AA8: 0x4057AA0, 0x42B2BE8: 0x42B34C0,
         0x42B3628: 0x42B34C0}


def audit(path):
    with path.open('rb') as source, mmap.mmap(source.fileno(), 0, access=mmap.ACCESS_READ) as raw:
        assert hashlib.sha256(raw).hexdigest() == SHA256, 'Supplied thin arm64 drift'
        assert raw[:4] == b'\xcf\xfa\xed\xfe', 'Expected little-endian Mach-O64'
        u32 = lambda address: struct.unpack_from('<I', raw, address)[0]
        pointer = lambda address: struct.unpack_from('<Q', raw, address)[0] & 0xFFFFFFFFF

        def string(address):
            end = raw.find(b'\0', address, address + 256)
            assert end >= address, 'Unbounded string'
            return raw[address:end].decode()

        # This exact pinned image maps original virtual addresses to these bytes.
        # Confirm rather than assuming it for another binary/slice.
        offset = 32
        text_mapped = False
        for _ in range(u32(16)):
            command, size = struct.unpack_from('<II', raw, offset)
            if command == 0x19 and raw[offset + 8:offset + 14] == b'__TEXT':
                vmaddr, _, fileoff = struct.unpack_from('<QQQ', raw, offset + 24)
                assert vmaddr == fileoff == 0
                text_mapped = True
            offset += size
        assert text_mapped
        # The stripped image has no LC_FUNCTION_STARTS. These are explicitly
        # bounded instruction windows, not a claim of discovered function ends.
        ranges = {}
        for label, (address, size) in FUNCTIONS.items():
            end = address + size
            ranges[label] = {'start': hex(address), 'endExclusive': hex(end),
                             'sha256': hashlib.sha256(raw[address:end]).hexdigest()}
        for address, target in CALLS.items():
            word = u32(address)
            assert word & 0xFC000000 == 0x94000000, 'Expected direct BL'
            immediate = word & 0x3FFFFFF
            if immediate & (1 << 25):
                immediate -= 1 << 26
            assert address + immediate * 4 == target, f'Call drift: {address:x}'
        assert string(pointer(0xEBAE788)) == 'AsideNtpPrerender'
        assert u32(0xEBAE790) == 1
        assert string(0xCE48949) == 'fjdhphbdlfjogobdofoaagnlnkoibdge'
        assert string(0xCBD441E) == 'chrome-extension'
        assert string(0xCED7481) == 'newtab'
        assert string(0xCEE9F53) == 'chrome://newtab/'
        assert [string(pointer(0xE8AA1F8 + index * 8)) for index in range(7)] == PREFS
        assert list(raw[0xDF50AEC:0xDF50AF0]) == [1, 1, 2, 1]
        assert u32(0x42B2118) == 0x52942402  # mov w2,#0xa120
        assert u32(0x42B211C) == 0x72A000E2  # movk w2,#7,lsl16 =>500000us
        assert u32(0x42B23E0) == 0xD2800002  # hit: schedule delay0
        assert u32(0x529D18) == 0xB9400900  # ProfileTypeUserData enum field
        assert u32(0x4CE678) == 0xB9400908  # same enum field
        assert u32(0x4CE67C) == 0x71000D1F  # system enum3
        assert pointer(0xE9DBD38) == 0xE9DBD38  # ProfileTypeUserData self-key
        assert pointer(0xE286730) == 0x42B3870
        assert pointer(0xE286760 + 0x20) == 0x42B3BC0
        assert u32(0x42B3BC0) == 0xD1002000  # WCO thunk adjusts second base
        assert u32(0x42B2A04) == 0xF900E661  # store returned Rect x1=size
        assert u32(0x42B3A60) == 0xF940C908  # RWHV fallback-copy slot+190
        assert string(0xD9ACD59) == 'WebContentsImpl::Resize'
        return {'targetSha256': SHA256, 'targetExecuted': False,
                'labelsAreAnalysisDescriptionsNotRecoveredSymbols': True,
                'boundedInstructionRanges': ranges, 'functionCoverage': 'bounded, not exhaustive',
                'directCalls': {hex(address): hex(target) for address, target in CALLS.items()},
                'feature': {'name': 'AsideNtpPrerender', 'defaultValue': 1},
                'requiredAgentId': 'fjdhphbdlfjogobdofoaagnlnkoibdge',
                'requiredOverrideScheme': 'chrome-extension', 'manifestOverrideKey': 'newtab', 'requestedURL': 'chrome://newtab/',
                'observedPreferences': PREFS, 'missDelayMicroseconds': 500000,
                'hitDelayMicroseconds': 0, 'preloadSettingLookup': [1, 1, 2, 1],
                'limitations': ['Browser-profile guest/system, container size and fallback-copy semantics recovered against155 source',
                                'Exact original content callback and scheme/effective-URL exception recovered in companion content-recovery audit',
                                'Original raw primary-root byte maps conservatively to155 initial-empty semantic API',
                                'No actual prerender activation or renderer behavior observed']}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('thin_arm64_framework', type=Path)
    options = parser.parse_args()
    print(json.dumps(audit(options.thin_arm64_framework), indent=2))
