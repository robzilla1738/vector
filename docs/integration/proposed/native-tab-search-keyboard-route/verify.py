#!/usr/bin/env python3
"""Check the supplied static keyboard/command route without target execution."""
import argparse
import hashlib
import json
from pathlib import Path
import struct


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--native-root', type=Path, required=True)
    args = parser.parse_args()
    here = Path(__file__).resolve().parent
    evidence = json.loads((here / 'source-evidence.json').read_text())
    binary = Path(evidence['originalBinary']['path']).read_bytes()
    assert sha(binary) == evidence['originalBinary']['sha256']
    for item in evidence['ranges']:
        start, end = int(item['start'], 16), int(item['endExclusive'], 16)
        assert sha(binary[start:end]) == item['bytesSha256']
        assert sha((here / item['file']).read_bytes()) == item['assemblySha256']
    accelerator = evidence['accelerator']
    address = int(accelerator['address'], 16)
    assert list(struct.unpack_from('<iii', binary, address)) == [52500, 18, 65]
    assert accelerator['values'] == [52500, 18, 65]
    assert sha(binary[address:address + 12]) == accelerator['bytesSha256']
    for item in evidence['windowVtable']['entries']:
        slot = int(item['slot'], 16)
        assert slot == int(evidence['windowVtable']['base'], 16) + int(item['offset'], 16)
        pointer = struct.unpack_from('<Q', binary, slot)[0]
        assert pointer == int(item['raw'], 16)
        assert pointer & 0xfffffffff == int(item['function'], 16)
    original = evidence['decompile']
    assert sha(Path(original['path']).read_bytes()) == original['sha256']
    guard = evidence['existingSearchGuard']
    assert sha((here / guard['path']).read_bytes()) == guard['sha256']
    sources = {}
    for item in evidence['nativeReadOnlyReferences']:
        data = (args.native_root / item['path']).read_bytes()
        assert sha(data) == item['sha256']
        sources[item['path']] = data.decode()
    constants = sources['chrome/app/chrome_command_ids.h']
    assert '#define IDC_TAB_SEARCH 52500' in constants
    accelerator_source = sources['chrome/browser/ui/cocoa/accelerators_cocoa.mm']
    assert '{IDC_TAB_SEARCH, ui::EF_COMMAND_DOWN | ui::EF_SHIFT_DOWN, ui::VKEY_A}' in accelerator_source
    command = sources['chrome/browser/ui/browser_command_controller.cc']
    assert 'case IDC_TAB_SEARCH:\n      ShowTabSearch(browser_);' in command
    assert 'browser_->GetType() == BrowserWindowInterface::Type::TYPE_NORMAL;\n  command_updater_->UpdateCommandEnabled(IDC_TAB_SEARCH,' in command
    commands = sources['chrome/browser/ui/browser_commands.cc']
    assert 'BrowserWindow::FromBrowser(browser)->CreateTabSearchBubble();' in commands
    view = sources['chrome/browser/ui/views/frame/browser_view.cc']
    assert 'void BrowserView::CreateTabSearchBubble() {\n#if BUILDFLAG(ENABLE_AUX_BROWSER)\n  ToggleAuxProfileSearch(browser(), GetLocationBarView());' in view
    owner = sources['chrome/browser/ui/views/frame/aux_tab_search_bubble.cc']
    assert 'extensions::ExtensionRegistry::EVERYTHING' in owner
    assert 'if (!aux::AgentInstalled(browser->GetProfile()))' in owner
    assert 'if (auto* owner = SearchOwner(browser, true))' in owner
    print('PASS: original accelerator/command/vtable and existing independent Agent-search route')


if __name__ == '__main__':
    main()
