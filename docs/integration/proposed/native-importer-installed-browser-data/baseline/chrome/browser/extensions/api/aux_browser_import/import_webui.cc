// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#include "chrome/browser/extensions/api/aux_browser_import/import_webui.h"

#include "base/functional/bind.h"
#include "base/memory/ref_counted_memory.h"
#include "chrome/browser/extensions/api/aux_browser_import/import_service.h"
#include "chrome/browser/profiles/profile.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
#include "content/public/browser/web_ui_data_source.h"
#include "content/public/browser/web_ui_message_handler.h"
#include "services/network/public/mojom/content_security_policy.mojom.h"
namespace aux_import {
namespace {
constexpr char kHTML[] =
    R"HTML(<!doctype html><meta charset=utf-8><title>Import browser data into Aux</title><style>body{font:16px system-ui;max-width:760px;margin:10vh auto;padding:24px;color-scheme:light dark}select,button{font:inherit;padding:10px;margin:8px 0}label{display:block;margin:12px 0}pre{white-space:pre-wrap}#error{color:#d33}fieldset{border:1px solid #8885;margin:16px 0}</style><h1>Import browser data</h1><p>Select a browser profile and the data you want to bring into this Aux profile. Source data is read from a consistent snapshot and is never changed.</p><label>Browser <select id=source></select></label><label>Profile <select id=profile></select></label><fieldset><legend>Available categories</legend><div id=categories></div></fieldset><label id=archiveLabel hidden>Safari ZIP <input id=archive type=file accept=".zip,application/zip"></label><p id=notice></p><label><input id=consent type=checkbox>I authorize reading the selected source profile and adding these categories to Aux.</label><button id=start>Start import</button><button id=cancel disabled>Cancel remaining work</button><button id=refresh>Refresh sources</button><p id=error role=alert></p><pre id=progress aria-live=polite></pre><script src=index.js></script>)HTML";
constexpr char kJS[] =
    R"JS('use strict';const $=id=>document.getElementById(id),pending=new Map;let seq=0,sources=[],job=null;window.cr={webUIResponse:(id,ok,value)=>{const request=pending.get(id);if(request){pending.delete(id);ok?request.resolve(value):request.reject(Error(value))}}};function call(method,args=[]){return new Promise((resolve,reject)=>{const id='import-'+(++seq);pending.set(id,{resolve,reject});chrome.send('auxImport',[id,method,args])})}async function action(fn){$('error').textContent='';try{await fn()}catch(error){$('error').textContent=error.message}}
 function choose(){const source=sources.find(x=>x.id===$('source').value);$('profile').replaceChildren();$('categories').replaceChildren();$('consent').checked=false;if(!source)return;$('archiveLabel').hidden=source.id!=='safari';for(const profile of source.profiles){const option=document.createElement('option');option.value=profile.id;option.textContent=profile.name;$('profile').append(option)}for(const category of source.categories??[]){const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.value=category;check.checked=true;label.append(check,document.createTextNode(' '+category));$('categories').append(label)}$('notice').textContent=source.unsupportedReason??'Passwords, cookies, extensions and archive formats appear here only when their authorized native migrator is available.';$('start').disabled=!source.installed||!source.profiles.length||!(source.categories??[]).length;}
 async function refresh(){sources=await call('getImportSources');$('source').replaceChildren();for(const source of sources){const option=document.createElement('option');option.value=source.id;option.textContent=source.name+(source.installed?'':' — not installed');option.disabled=!source.installed;$('source').append(option)}const first=sources.find(x=>x.installed&&x.profiles.length);if(first)$('source').value=first.id;choose()}
 async function poll(){if(!job)return;const progress=await call('getImportProgress',[job]);$('progress').textContent=JSON.stringify(progress,null,2);const running=progress.status==='running'||progress.status==='queued';$('cancel').disabled=!running;$('start').disabled=running;if(running)setTimeout(()=>action(poll),300)}
 $('archive').onchange=()=>$('consent').checked=false;$('source').onchange=choose;$('profile').onchange=()=>$('consent').checked=false;$('refresh').onclick=()=>action(refresh);$('start').onclick=()=>action(async()=>{if(!$('consent').checked)throw Error('Authorize the selected source before starting.');const categories=[...$('categories').querySelectorAll('input:checked')].map(x=>x.value);if(!categories.length)throw Error('Select at least one category.');const options={sourceId:$('source').value,sourceProfileId:$('profile').value,categories};if(options.sourceId==='safari'){const file=$('archive').files[0];if(!file||!file.size||file.size>16*1024*1024)throw Error('Choose a Safari ZIP up to16MiB.');options.safariArchive={fileName:file.name,data:Array.from(new Uint8Array(await file.arrayBuffer()))};}const result=await call('startImport',[options]);job=result.jobId;await poll()});$('cancel').onclick=()=>action(async()=>{if(job){await call('cancelImport',[job]);await poll()}});action(refresh);
)JS";
class Handler final : public content::WebUIMessageHandler {
 public:
  void RegisterMessages() override {
    web_ui()->RegisterMessageCallback(
        "auxImport",
        base::BindRepeating(&Handler::Invoke, base::Unretained(this)));
  }

 private:
  void Invoke(const base::ListValue& args) {
    if (args.size() != 3 || !args[0].is_string() || !args[1].is_string() ||
        !args[2].is_list()) {
      return;
    }
    AllowJavascript();
    ImportService::Get(Profile::FromWebUI(web_ui()))
        ->Invoke(args[1].GetString(), args[2].GetList().Clone(),
                 "native-import-webui",
                 base::BindOnce(
                     [](base::WeakPtr<Handler> self, std::string id,
                        std::optional<base::Value> result, std::string error) {
                       if (!self || !self->IsJavascriptAllowed()) {
                         return;
                       }
                       if (result) {
                         self->ResolveJavascriptCallback(base::Value(id),
                                                         *result);
                       } else {
                         self->RejectJavascriptCallback(base::Value(id),
                                                        base::Value(error));
                       }
                     },
                     weak_.GetWeakPtr(), args[0].GetString()));
  }
  base::WeakPtrFactory<Handler> weak_{this};
};
}  // namespace
ImportWebUI::ImportWebUI(content::WebUI* web_ui)
    : content::WebUIController(web_ui) {
  auto* source = content::WebUIDataSource::CreateAndAdd(
      web_ui->GetWebContents()->GetBrowserContext(), "aux-import-data");
  source->OverrideContentSecurityPolicy(
      network::mojom::CSPDirectiveName::StyleSrc,
      "style-src 'self' 'unsafe-inline';");
  source->SetRequestFilter(
      base::BindRepeating([](const std::string& path) {
        return path.empty() || path == "index.html" || path == "index.js";
      }),
      base::BindRepeating(
          [](const std::string& path,
             content::WebUIDataSource::GotDataCallback callback) {
            std::move(callback).Run(
                base::MakeRefCounted<base::RefCountedString>(
                    path == "index.js" ? kJS : kHTML));
          }));
  web_ui->AddMessageHandler(std::make_unique<Handler>());
}
ImportWebUI::~ImportWebUI() = default;
}  // namespace aux_import
