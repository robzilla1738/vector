from pathlib import Path
import json,hashlib,gzip,struct,base64,difflib,tempfile,subprocess,re
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');out=Path('docs/integration/proposed/native-import-webui-resources');out.mkdir(parents=True,exist_ok=True);(out/'source').mkdir(exist_ok=True);(out/'new').mkdir(exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest();image=Path('/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64');b=image.read_bytes();assert sha(b)=='64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c'
rows=json.loads(Path('out/importer-ui-audit/pak-extraction.json').read_text());resources=[]
for i,addr in enumerate(range(0xe86f150,0xe86f2d0,0x20)):
 ptr,id=struct.unpack_from('<QQ',b,addr);ptr&=0xffffffff;path=b[ptr:].split(b'\0',1)[0].decode();row=next(x for x in rows if int(x['id'],16)==id);raw=Path(row['extracted']).read_bytes();data=gzip.decompress(raw) if raw[:2]==b'\x1f\x8b' else raw;dest=out/'source'/path;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data);output=data;anchors=[]
 if path=='index.html':
  text=data.decode();assert text.count('Aside')==2;output=text.replace('Aside','Aux').encode();anchors=[{'find':'Aside','replace':'Aux','count':2,'kind':'branding'}]
 if path in ['index.html','app.js']:
  original=Path('/Users/rcourson/Downloads/aside-rea 2/native-fork/webui')/('aside-importer.html' if path=='index.html' else 'aside-importer.js');assert data==original.read_bytes()
 resources.append({'path':path,'resourceId':hex(id),'mappingAddress':hex(addr),'stringAddress':hex(ptr),'pakOffset':row['offset'],'pakLength':row['size'],'pakPayloadSha256':row['sha256'],'gzip':raw[:2]==b'\x1f\x8b','sourceSha256':sha(data),'outputSha256':sha(output),'sourceSize':len(data),'anchors':anchors,'binary':path.endswith('.png'),'output':output})
header='''// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
// Supplied importer HTML/JS/images, source-pinned in native-import-webui-resources.
// The embedded HTML/JS/SVG retain their supplied copyright notices.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_IMPORT_WEBUI_RESOURCES_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_IMPORT_WEBUI_RESOURCES_H_

#include <optional>
#include <span>
#include <string>
#include <string_view>

#include "base/base64.h"

namespace aux_import {
namespace supplied_importer {
struct Resource {
  std::string_view path;
  std::span<const std::string_view> chunks;
  bool base64;
};
'''
for i,r in enumerate(resources):
 text=base64.b64encode(r['output']).decode() if r['binary'] else r['output'].decode();assert ')AUXIMP"' not in text
 header+='inline constexpr std::string_view kData'+str(i)+'[] = {\n'
 for start in range(0,len(text),8192):header+='R"AUXIMP('+text[start:start+8192]+')AUXIMP",\n'
 header+='};\n'
header+='inline constexpr Resource kResources[] = {\n'
for i,r in enumerate(resources):header+='  {"'+r['path']+'", kData'+str(i)+', '+str(r['binary']).lower()+'},\n'
header+='''};
inline const Resource* Find(std::string_view path) {
  if (path.empty()) path = "index.html";
  for (const auto& resource : kResources) {
    if (resource.path == path) return &resource;
  }
  return nullptr;
}
}  // namespace supplied_importer

inline bool HasSuppliedImporterResource(std::string_view path) {
  return supplied_importer::Find(path) != nullptr;
}

inline std::optional<std::string> GetSuppliedImporterResource(
    std::string_view path) {
  const auto* resource = supplied_importer::Find(path);
  if (!resource) return std::nullopt;
  std::string bytes;
  for (auto chunk : resource->chunks) bytes.append(chunk);
  if (!resource->base64) return bytes;
  std::string decoded;
  if (!base::Base64Decode(bytes, &decoded)) return std::nullopt;
  return decoded;
}
}  // namespace aux_import
#endif  // CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_IMPORT_WEBUI_RESOURCES_H_
'''
rel='chrome/browser/extensions/api/aux_browser_import/import_webui_resources.h';(out/'new/import_webui_resources.h').write_text(header)
(out/'native.patch').write_text(''.join(difflib.unified_diff([],header.splitlines(True),fromfile='/dev/null',tofile='b/'+rel)))
(out/'manifest.json').write_text(json.dumps({'version':1,'reason':'Embed all twelve positively mapped supplied importer resources; HTML visible brand only.','files':[{'path':rel,'baselineSha256':None,'outputSha256':sha(header.encode())}],'mounted':False},indent=2)+'\n')
proof={'image':{'path':str(image),'sha256':sha(b)},'mapping':{'start':'0xe86f150','endExclusive':'0xe86f2d0','sha256':sha(b[0xe86f150:0xe86f2d0]),'stride':32,'pointerEncoding':'chained pointer; original string VA in low32 bits, resource ID next uint64'},'pak':{'path':rows[0]['pak'],'sha256':rows[0]['pakSha256']},'resources':[{k:v for k,v in r.items() if k!='output'} for r in resources]};(out/'source-evidence.json').write_text(json.dumps(proof,indent=2)+'\n');(out/'evidence').mkdir(exist_ok=True);(out/'evidence/resource-table.bin').write_bytes(b[0xe86f150:0xe86f2d0])
# Verify every generated literal/chunk recovers exact served bytes and original JS refs.
for i,r in enumerate(resources):
 block=header.split('inline constexpr std::string_view kData'+str(i)+'[] = {\n')[1].split('\n};',1)[0];text=''.join(re.findall(r'R"AUXIMP\((.*?)\)AUXIMP"',block,re.S));actual=base64.b64decode(text) if r['binary'] else text.encode();assert actual==r['output']
refs=set(re.findall(r'(?:icons|images)/[^"` )<>]+',next(r for r in resources if r['path']=='app.js')['output'].decode()));assert refs=={r['path'] for r in resources if r['path'].startswith(('icons/','images/'))}
html=next(r for r in resources if r['path']=='index.html');assert re.findall(rb'<style>(.*?)</style>',html['output'],re.S)==re.findall(rb'<style>(.*?)</style>',(out/'source/index.html').read_bytes(),re.S);assert b'<aside class="browser-list' in html['output'];assert next(r for r in resources if r['path']=='app.js')['anchors']==[]
# Independent patch only: constants and datasource filter, Handler byte-for-byte retained.
page=Path('docs/integration/proposed/native-import-webui-provided-page');page.mkdir(exist_ok=True);ccrel='chrome/browser/extensions/api/aux_browser_import/import_webui.cc';cc=(root/ccrel).read_text();start=cc.index('constexpr char kHTML[]');end=cc.index('class Handler final');constants=cc[start:end]
find='''        return path.empty() || path == "index.html" || path == "index.js";'''
find2='''            std::move(callback).Run(
                base::MakeRefCounted<base::RefCountedString>(
                    path == "index.js" ? kJS : kHTML));'''
replace2='''            auto resource = GetSuppliedImporterResource(path);
            if (!resource) {
              std::move(callback).Run(nullptr);
              return;
            }
            std::move(callback).Run(
                base::MakeRefCounted<base::RefCountedString>(
                    std::move(*resource)));'''
anchors=[{'find':'#include "chrome/browser/extensions/api/aux_browser_import/import_service.h"\n','replace':'#include "chrome/browser/extensions/api/aux_browser_import/import_service.h"\n#include "chrome/browser/extensions/api/aux_browser_import/import_webui_resources.h"\n','count':1},{'find':constants,'replace':'','count':1},{'find':find,'replace':'        return HasSuppliedImporterResource(path);','count':1},{'find':find2,'replace':replace2,'count':1}];result=cc
for a in anchors:assert result.count(a['find'])==1;result=result.replace(a['find'],a['replace'])
assert cc[cc.index('class Handler final'):cc.index('}  // namespace\nImportWebUI')]==result[result.index('class Handler final'):result.index('}  // namespace\nImportWebUI')]
(page/'manifest.json').write_text(json.dumps({'version':1,'reason':'Serve supplied importer resources instead of independent page; Handler unchanged.','files':[{'path':ccrel,'baselineSha256':sha(cc.encode()),'outputSha256':sha(result.encode()),'anchors':anchors}],'mounted':False,'requiredPrerequisites':['native-import-webui-resources new header','Root original Handler/lifecycle/selection wiring and installedBrowsers/UseStringsJs provisioning']},indent=2)+'\n');(page/'native.patch').write_text(''.join(difflib.unified_diff(cc.splitlines(True),result.splitlines(True),fromfile='a/'+ccrel,tofile='b/'+ccrel)))
with tempfile.TemporaryDirectory(prefix='aux-importer-resources-') as td:
 p=Path(td);f=p/ccrel;f.parent.mkdir(parents=True);f.write_text(cc);subprocess.run(['git','init','-q',td],check=True)
 for patch in [out/'native.patch',page/'native.patch']:
  subprocess.run(['git','apply','--check',str(patch.resolve())],cwd=p,check=True);subprocess.run(['git','apply',str(patch.resolve())],cwd=p,check=True)
 assert f.read_text()==result;assert (p/rel).read_text()==header
assert (root/ccrel).read_text()==cc
verification={'allResources':12,'referencedIconImages':10,'missingResources':[],'exactPakHtmlJsDownloadsEquality':'PASS','allServedByteRecovery':'PASS','originalCssUnchanged':'PASS','htmlAsideRetained':'PASS','javascriptUnchanged':'PASS','handlerUnchanged':'PASS','disposablePatchCheckReplay':'PASS','sharedNativeUnchanged':True,'buildRun':False,'runtimeRun':False};(out/'verification.json').write_text(json.dumps(verification,indent=2)+'\n');print(json.dumps({'resourcesHeaderOutputSha256':sha(header.encode()),'pageBaselineSha256':sha(cc.encode()),'pageOutputSha256':sha(result.encode()),'servedBytes':sum(len(r['output']) for r in resources),'headerBytes':len(header.encode())},indent=2))
