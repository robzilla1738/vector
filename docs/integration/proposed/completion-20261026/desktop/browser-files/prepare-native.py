#!/usr/bin/env python3
from pathlib import Path
import argparse,hashlib,json,difflib
H=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('--source-root',type=Path,default=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src'));p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
path='chrome/browser/extensions/api/debugger/debugger_api.cc';source=a.source_root/path;s=source.read_text();before=s;anchors=[]
def change(old,new):
 global s
 assert s.count(old)==1,(old[:100],s.count(old))
 s=s.replace(old,new);anchors.append({'before':old,'after':new,'count':1})
includes='''#include <cmath>
#include <fcntl.h>
#include <sys/stat.h>
#include "base/base64.h"
#include "base/files/file.h"
#include "base/files/file_util.h"
#include "base/files/scoped_file.h"
#include "base/memory/weak_ptr.h"
#include "base/supports_user_data.h"
#include "base/task/thread_pool.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "chrome/browser/aux/profile_identity.h"
#include "components/download/public/common/download_item.h"
#include "content/public/browser/devtools_manager_delegate.h"
#include "content/public/browser/download_item_utils.h"
#include "content/public/browser/download_manager.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/weak_document_ptr.h"
'''
change('#include <algorithm>','#include <algorithm>\n'+includes)
change('class ExtensionDevToolsClientHost : public content::DevToolsAgentHostClient,',(H/'source/aux_debugger_downloads.inc').read_text()+'\nclass ExtensionDevToolsClientHost : public content::DevToolsAgentHostClient,')
change('  base::ScopedObservation<Profile, ProfileObserver> profile_observation_{this};','  base::ScopedObservation<Profile, ProfileObserver> profile_observation_{this};\n  base::RepeatingCallback<bool()> aux_download_document_guard_;\n  base::WeakPtrFactory<ExtensionDevToolsClientHost> aux_download_weak_{this};')
old='''  base::DictValue protocol_request;
  int request_id = ++last_request_id_;'''
new='''  base::DictValue protocol_request;
  int request_id = ++last_request_id_;
  if (method == "Aux.beginDownloads" || method == "Aux.listOwnedDownloads" ||
      method == "Aux.readOwnedDownload" || method == "Aux.releaseDownloads") {
    auto refuse = [&]() {
      auto result = AuxDownloadFault(); result.Set("id", request_id);
      function->SendResponseBody(base::Value(std::move(result)));
    };
    if (!MayUseAuxDocumentCapabilities() || session_id.has_value() || !command_params) {
      refuse(); return;
    }
    const auto& params = command_params->additional_properties;
    if (const auto* marker = params.Find("__auxDocumentCapability")) {
      const auto* token = marker->GetIfString();
      auto* delegate = static_cast<content::DevToolsManagerDelegate*>(ChromeDevToolsManagerDelegate::GetInstance());
      if (!token || token->empty() || token->size() > 64 || !delegate) { refuse(); return; }
      auto guard = delegate->GetAuxDocumentCommandGuard(agent_host_.get(), *token);
      if (!guard || !guard.Run()) { refuse(); return; }
      aux_download_document_guard_ = std::move(guard);
    }
    if (method != "Aux.releaseDownloads" && aux_download_document_guard_ && !aux_download_document_guard_.Run()) { refuse(); return; }
    auto* downloads = AuxDebuggerDownloads::For(profile_);
    base::DictValue result;
    const auto* lease = params.FindString("lease");
    if (method == "Aux.beginDownloads") {
      auto captured = downloads->Capture(agent_host_.get(), aux_download_document_guard_);
      if (captured.empty()) { refuse(); return; }
      result.Set("result", base::DictValue().Set("lease", captured));
    } else if (!lease || lease->empty()) { refuse(); return;
    } else if (method == "Aux.listOwnedDownloads") {
      result = downloads->List(*lease);
    } else if (method == "Aux.releaseDownloads") {
      downloads->Release(*lease); result.Set("result", base::DictValue());
    } else {
      downloads->Read(params, base::BindOnce(
          [](base::WeakPtr<ExtensionDevToolsClientHost> host,
             scoped_refptr<DebuggerSendCommandFunction> retained, int id,
             base::RepeatingCallback<bool()> guard, base::DictValue body) {
            // Detach requests cancellation; the original promise settles only
            // after the actual file read has closed its descriptors.
            if (!host) { retained->SendDetachedError(); return; }
            if (guard && !guard.Run()) body = AuxDownloadFault();
            body.Set("id", id);
            retained->SendResponseBody(base::Value(std::move(body)));
          }, aux_download_weak_.GetWeakPtr(), base::WrapRefCounted(function),
          request_id, aux_download_document_guard_));
      return;
    }
    result.Set("id", request_id); function->SendResponseBody(base::Value(std::move(result))); return;
  }'''
change(old,new)
out=a.out/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(s)
plan={'path':path,'inputPath':str(source),'inputSha256':hashlib.sha256(before.encode()).hexdigest(),'outputSha256':hashlib.sha256(s.encode()).hexdigest(),'outputPath':str(out),'anchors':anchors}
(a.out/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n')
(a.out/'native.patch').write_text(''.join(difflib.unified_diff(before.splitlines(True),s.splitlines(True),fromfile='a/'+path,tofile='b/'+path)))
gn_path='chrome/browser/extensions/api/debugger/BUILD.gn';gn_source=a.source_root/gn_path;gn_before=gn_source.read_text()
gn_old='    "//components/pdf/common:util",';gn_new='    "//components/download/public/common:public",\n'+gn_old
assert gn_before.count(gn_old)==1 and '//components/download/public/common:public' not in gn_before
gn_after=gn_before.replace(gn_old,gn_new)
gn_out=a.out/gn_path;gn_out.parent.mkdir(parents=True,exist_ok=True);gn_out.write_text(gn_after)
gn_plan={'path':gn_path,'inputPath':str(gn_source),'inputSha256':hashlib.sha256(gn_before.encode()).hexdigest(),'outputSha256':hashlib.sha256(gn_after.encode()).hexdigest(),'outputPath':str(gn_out),'anchors':[{'before':gn_old,'after':gn_new,'count':1}]}
(a.out/'native-gn-source-plan.json').write_text(json.dumps(gn_plan,indent=2)+'\n')
(a.out/'native-final-projection.json').write_text(json.dumps({'format':'aux.browser-files.native.v1','sourceRoot':str(a.source_root),'files':[plan,gn_plan],'nativeProjected':False,'appExecuted':False},indent=2)+'\n')
with (a.out/'native.patch').open('a') as patch:patch.write(''.join(difflib.unified_diff(gn_before.splitlines(True),gn_after.splitlines(True),fromfile='a/'+gn_path,tofile='b/'+gn_path)))
