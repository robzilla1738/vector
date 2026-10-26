#!/usr/bin/env python3
"""Read approved signed derivatives; emit pinned source/build proposal only."""
import argparse
import hashlib
import json
from pathlib import Path
import struct
import subprocess


def digest(data):
    return hashlib.sha256(data).hexdigest()


def code_identity(data):
    magic, cpu, subtype, kind = struct.unpack_from('<IIII', data)
    if (magic, cpu, subtype) != (0xfeedfacf, 0x100000c, 0) or kind not in (6, 8):
        raise ValueError('Expected thin arm64 dylib or bundle')
    count, command_bytes = struct.unpack_from('<II', data, 16)
    position = 32
    masks = []
    sections = []
    signature = None
    for _ in range(count):
        command, size = struct.unpack_from('<II', data, position)
        if size < 8 or position + size > 32 + command_bytes:
            raise ValueError('Invalid Mach-O load command')
        if command == 0x1d:
            if signature is not None:
                raise ValueError('Duplicate code signature')
            signature = struct.unpack_from('<II', data, position + 8)
            masks.append((position + 8, 8))
        if command == 0x19:
            name = data[position + 8:position + 24].rstrip(b'\0')
            if name == b'__LINKEDIT':
                masks.extend([(position + 32, 8), (position + 48, 8)])
            section_count = struct.unpack_from('<I', data, position + 64)[0]
            if size != 72 + section_count * 80:
                raise ValueError('Invalid segment section table')
            for index in range(section_count):
                start = position + 72 + index * 80
                names = data[start:start + 32].replace(b'\0', b'').decode('ascii')
                length = struct.unpack_from('<Q', data, start + 40)[0]
                offset = struct.unpack_from('<I', data, start + 48)[0]
                flags = struct.unpack_from('<I', data, start + 64)[0]
                if flags & 255 not in (1, 12, 18):
                    if offset + length > len(data):
                        raise ValueError('Section outside file')
                    sections.append({'name': names, 'offset': offset, 'bytes': length,
                                     'sha256': digest(data[offset:offset + length])})
        position += size
    if position != 32 + command_bytes or signature is None:
        raise ValueError('Missing signature or invalid load commands')
    offset, size = signature
    if offset < position or offset + size != len(data):
        raise ValueError('Code signature must be the final file region')
    prefix = bytearray(data[:offset])
    for start, length in masks:
        prefix[start:start + length] = bytes(length)
    return {'codeSignatureOffset': offset, 'maskedPrefixSha256': digest(prefix),
            'sections': sections}


def replace_once(text, old, new, count=1):
    if text.count(old) != count:
        raise ValueError(f'Unexpected source anchor count: {old}')
    return text.replace(old, new)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    here = Path(__file__).resolve().parent
    review = json.loads((here / 'review.json').read_text())
    policy_bytes = (here / 'policy-preimage.json').read_bytes()
    if digest(policy_bytes) != review['descriptor']['sha256']:
        raise ValueError('Descriptor preimage changed')
    policy = json.loads(policy_bytes)
    signed_rows = []
    for addon in review['addons']:
        raw = Path(addon['input']).read_bytes()
        preserved = Path(addon['rawPreservationTarget']).read_bytes()
        if digest(raw) != addon['rawSha256'] or raw != preserved:
            raise ValueError('Raw original/preserved bytes changed')
        signed_path = Path(addon['derivativeTarget'])
        if signed_path.is_symlink() or not signed_path.is_file():
            raise ValueError('Expected regular derivative')
        signed = signed_path.read_bytes()
        subprocess.run(addon['verifyCommand'], check=True)
        info = subprocess.run(['/usr/bin/codesign', '--display', '--verbose=4', str(signed_path)],
                              capture_output=True, text=True, check=True).stderr
        if (f"Identifier={addon['identifier']}\n" not in info or
                f"TeamIdentifier={review['team']}\n" not in info or 'adhoc' in info):
            raise ValueError('Unexpected signed identity')
        entitlement = subprocess.run(['/usr/bin/codesign', '--display', '--entitlements', ':-',
                                      str(signed_path)], capture_output=True, check=True)
        if entitlement.stdout.strip():
            raise ValueError('Unexpected addon entitlements')
        raw_proof = code_identity(raw)
        signed_proof = code_identity(signed)
        if raw_proof != signed_proof:
            raise ValueError('Native code, section or non-signature metadata changed')
        measured = {'sha256': digest(signed), 'bytes': len(signed)}
        policy[addon['key']].update(measured)
        signed_rows.append({**measured, 'path': str(signed_path), 'rawSha256': addon['rawSha256'],
                            'nativeCodeUnchanged': raw_proof, 'signatureMetadata': info})
    args.output.mkdir(parents=True, exist_ok=False)
    source_output = args.output / 'source'
    source_output.mkdir()
    overlays = {}
    for role, pin in review['sourcePins'].items():
        original = (here / pin['snapshot']).read_bytes()
        if digest(original) != pin['sha256']:
            raise ValueError(f'Source preimage changed: {role}')
        text = original.decode()
        for index, addon in enumerate(review['addons']):
            if role.endswith('policy') or role == ('pdf-lifetime' if index == 0 else 'utility-lifetime'):
                row = signed_rows[index]
                text = replace_once(text, addon['rawSha256'], row['sha256'])
                if role.endswith('policy'):
                    text = replace_once(text, f"static let bytes={addon['rawBytes']:_}",
                                        f"static let bytes={row['bytes']:_}")
                else:
                    text = replace_once(text, str(addon['rawBytes']), str(row['bytes']), 2)
        if role.endswith('policy'):
            text = text.replace('// Actual retained unsigned production build; signing requires a new review.',
                                '// Exact derivative authorized by the two-addon local signing review.')
        target = source_output / Path(pin['snapshot']).name
        target.write_text(text)
        overlays[role] = {'preimage': pin, 'path': str(target), 'sha256': digest(target.read_bytes())}
    policy_path = args.output / 'AuxFreshBootstrapPolicy.json'
    policy_path.write_text(json.dumps(policy, sort_keys=True, separators=(',', ':')) + '\n')
    recipes = {}
    for role, pin in review['buildRecipes'].items():
        raw = (here / pin['snapshot']).read_bytes()
        if digest(raw) != pin['sha256']:
            raise ValueError('Build recipe preimage changed')
        recipes[role] = json.loads(raw)
    for pin in review['compileHeaders'].values():
        header = (here / pin['snapshot']).read_bytes()
        if digest(header) != pin['sha256']:
            raise ValueError('Lifetime header preimage changed')
        (source_output / Path(pin['snapshot']).name).write_bytes(header)
    build_dir = args.output / 'build'
    commands = []
    objects = {}
    for role, index in [('pdf-lifetime', 4), ('utility-lifetime', 5)]:
        command = recipes['lifetimeCompile']['commands'][index].copy()
        source_index = command.index('-c') + 1
        command[source_index] = overlays[role]['path']
        target = str(build_dir / ('pdf-lifetime.o' if index == 4 else 'utility-lifetime.o'))
        command[command.index('-o') + 1] = target
        commands.append(command)
        objects[role] = target
    link = recipes['aclRepairedDaemon']['commands'][0].copy()
    for index, value in enumerate(link):
        if value == review['sourcePins']['daemon-policy']['originalPath']:
            link[index] = overlays['daemon-policy']['path']
        elif value.endswith('/pdf-lifetime.o'):
            link[index] = objects['pdf-lifetime']
        elif value.endswith('/utility-lifetime.o'):
            link[index] = objects['utility-lifetime']
    link[link.index('-o') + 1] = str(build_dir / 'Aux Daemon')
    commands.append(link)
    result = {'format': 'aux.two-addon.signed-successor-source.v1', 'signedInputs': signed_rows,
              'overlays': overlays, 'descriptor': {'path': str(policy_path), 'sha256': digest(policy_path.read_bytes())},
              'commands': commands, 'buildDirectoryMustBeCreatedByRoot': str(build_dir),
              'inheritedLinkInputPins': recipes['aclRepairedDaemon']['inputHashes'],
              'browserProjection': {'relative': 'chrome/browser/aux/native_peer_policy/AuxFreshBootstrapPolicy.swift',
                                    **overlays['browser-policy'], 'target': '//chrome/browser/aux/native_peer_policy:aux_parent_sealed_policy'},
              'browserGNChanges': False, 'workerOrComputerUseRecompile': False,
              'nativeBuildPerformed': False, 'candidateChanged': False, 'runtimeAccepted': False}
    (args.output / 'source-and-build-plan.json').write_text(json.dumps(result, indent=2) + '\n')


if __name__ == '__main__':
    main()
