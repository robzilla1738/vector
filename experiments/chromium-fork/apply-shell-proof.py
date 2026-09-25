#!/usr/bin/env python3
"""Apply the bounded native shell proof to the already-built isolated checkout."""
import argparse
from pathlib import Path
import shutil
p=argparse.ArgumentParser();p.add_argument('source',type=Path);a=p.parse_args();source=a.source.resolve();native=Path(__file__).resolve().parent/'native'
assert (source/'out/AuxProof/aux-build-metadata.txt').is_file()
assert 'completed=' in (source/'out/AuxProof/aux-build-metadata.txt').read_text(), 'Preserve the original compile until it finishes'
for name in ['aux_shell_view.cc','aux_shell_view.h']:
    shutil.copy2(native/name,source/'chrome/browser/ui/views/frame'/name)
def replace(path,old,new):
    s=path.read_text()
    if new in s:return
    assert old in s, f'Expected integration anchor missing: {path}'
    path.write_text(s.replace(old,new,1))
base=source/'chrome/browser/ui'
replace(base/'BUILD.gn','      "views/frame/browser_view.cc",','      "views/frame/aux_shell_view.cc",\n      "views/frame/aux_shell_view.h",\n      "views/frame/browser_view.cc",')
replace(base/'views/frame/browser_view.h','class BrowserViewLayout;','class AuxShellView;\nclass BrowserViewLayout;')
replace(base/'views/frame/browser_view.h','  // Returns the BrowserViewLayout.','  raw_ptr<AuxShellView> aux_shell_ = nullptr;\n\n  // Returns the BrowserViewLayout.')
replace(base/'views/frame/browser_view.cc','#include "chrome/browser/ui/views/frame/browser_view.h"','#include "chrome/browser/ui/views/frame/browser_view.h"\n#include "chrome/browser/ui/views/frame/aux_shell_view.h"')
replace(base/'views/frame/browser_view.cc','  browser_->GetFeatures().InitPostBrowserViewConstruction(this);','  browser_->GetFeatures().InitPostBrowserViewConstruction(this);\n  if (base::CommandLine::ForCurrentProcess()->HasSwitch("aux-shell-assets") &&\n      !GetProfile()->IsOffTheRecord()) {\n    aux_shell_ = AddChildView(std::make_unique<AuxShellView>(this));\n  }')
replace(base/'views/frame/browser_view.cc','  last_laid_out_size_ = size();','  last_laid_out_size_ = size();\n  if (aux_shell_) aux_shell_->ApplyLayout();')
replace(base/'views/frame/browser_view.cc','content::KeyboardEventProcessingResult BrowserView::PreHandleKeyboardEvent(\n    const NativeWebKeyboardEvent& event) {','content::KeyboardEventProcessingResult BrowserView::PreHandleKeyboardEvent(\n    const NativeWebKeyboardEvent& event) {\n  if (aux_shell_ && aux_shell_->HandleKey(event)) return content::KeyboardEventProcessingResult::HANDLED;')
replace(base/'browser_commands.cc','return *AddAndReturnTabAt(browser, GURL(), -1, /*foreground=*/true,','return *AddAndReturnTabAt(browser, base::CommandLine::ForCurrentProcess()->HasSwitch("aux-shell-assets") && !browser->GetProfile()->IsOffTheRecord() ? GURL(url::kAboutBlankURL) : GURL(), -1, /*foreground=*/true,')
replace(base/'browser_command_controller.cc','#include "chrome/browser/ui/views/frame/browser_view.h"','#include "chrome/browser/ui/views/frame/browser_view.h"\n#include "chrome/browser/ui/views/frame/aux_shell_view.h"')
replace(base/'browser_command_controller.cc','  // The order of commands in this switch statement must match the function','  if (AuxShellView::HandleBrowserCommand(browser_, id)) return;\n\n  // The order of commands in this switch statement must match the function')
print('Applied bounded shell proof to existing checkout; no build launched.')
