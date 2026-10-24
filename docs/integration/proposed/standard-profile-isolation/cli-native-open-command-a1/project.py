#!/usr/bin/env python3
"""Counted source-only successor. Does not edit the native checkout."""
from pathlib import Path
import difflib,hashlib,json
HERE=Path(__file__).resolve().parent;ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda b:hashlib.sha256(b).hexdigest();rows=[]
def project(name,edits):
 original=(ROOT/name).read_bytes();text=original.decode()
 for item in edits:
  assert text.count(item['find'])==item['count']==1,(name,item['find']);text=text.replace(item['find'],item['replace'])
 target=HERE/'source'/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
 assert (ROOT/name).read_bytes()==original
 rows.append({'path':name,'inputSha256':sha(original),'outputSha256':sha(text.encode()),'source':str(target),'anchors':edits})
def edit(name,find,replace):return{'name':name,'find':find,'replace':replace,'count':1}
project('chrome/browser/ui/views/frame/aux_profile_switch_request.cc',[
 edit('Native open profile exclusion dependency','#include "chrome/browser/aux/profile_identity.h"','#include "chrome/browser/aux/profile_identity.h"\n#include "chrome/browser/aux/cli/AuxCliOpenCommand.h"'),
 edit('Refuse switches before preview/load side effects','      browser_shutdown::HasShutdownStarted() || browser_shutdown::IsTryingToQuit()) return nullptr;','      browser_shutdown::HasShutdownStarted() || browser_shutdown::IsTryingToQuit() ||\n      aux::cli::IsNativeCliOpenPendingForProfile(expected.get())) return nullptr;')])
project('chrome/browser/ui/views/frame/aux_profile_switch_transaction.cc',[
 edit('Native open profile exclusion dependency','#include "chrome/browser/ui/views/frame/aux_profile_switch_transaction.h"','#include "chrome/browser/ui/views/frame/aux_profile_switch_transaction.h"\n#include "chrome/browser/aux/cli/AuxCliOpenCommand.h"'),
 edit('Native transaction source and target exclusion before mutation','  if (target == previous) {','  if (aux::cli::IsNativeCliOpenPendingForProfile(previous) ||\n      aux::cli::IsNativeCliOpenPendingForProfile(target)) {\n    LOG(ERROR) << "Aux profile transition rejected: native-cli-open-pending";\n    return Result::kRejected;\n  }\n  if (target == previous) {')])
project('chrome/browser/aux/profile_identity.cc',[
 edit('Finite Mac native open exclusion dependency','#include "base/uuid.h"','#include "base/uuid.h"\n#include "build/build_config.h"\n#if BUILDFLAG(IS_MAC)\n#include "chrome/browser/aux/cli/AuxCliOpenCommand.h"\n#endif'),
 edit('Refuse new cookie restore while actual profile command is pending','bool BeginProfileCookieRestore(Profile* profile, const std::string& epoch) {','bool BeginProfileCookieRestore(Profile* profile, const std::string& epoch) {\n#if BUILDFLAG(IS_MAC)\n  if (aux::cli::IsNativeCliOpenPendingForProfile(profile)) return false;\n#endif')])
(HERE/'native-hooks.json').write_text(json.dumps({'format':'aux.cli-open.native-hooks.v1','files':rows,'nativeCheckoutChanged':False},indent=2)+'\n')
patch=''.join(''.join(difflib.unified_diff((ROOT/r['path']).read_text().splitlines(True),Path(r['source']).read_text().splitlines(True),fromfile='a/'+r['path'],tofile='b/'+r['path']))for r in rows)
(HERE/'native-hooks.patch').write_text(patch)
print(json.dumps({'nativeOverlays':len(rows),'anchors':sum(len(r['anchors'])for r in rows),'nativeCheckoutChanged':False}))
