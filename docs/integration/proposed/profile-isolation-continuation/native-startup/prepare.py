from pathlib import Path
import difflib,json,hashlib
H=Path(__file__).resolve().parent;N=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
mods={}
def baseline(name):
 text=(N/name).read_text()
 if name=='chrome/browser/aux/BUILD.gn':
  needle='      "AuxNativeParentColdLaunch.h",\n'
  assert text.count(needle)==1
  text=text.replace(needle,needle+'      "AuxBrowserPrivateRoots.cc",\n      "AuxBrowserPrivateRoots.h",\n      "AuxChromiumBrowserRootProducer.cc",\n')
 return text
def modify(name,old,new):
 text=mods.get(name,baseline(name));assert text.count(old)==1,(name,text.count(old));mods[name]=text.replace(old,new)
modify('content/public/browser/content_browser_client.h','  // Returns the parent paths that contain all the network service\'s', '''  // Final synchronous admission before the NetworkService receives persistent
  // paths, after embedder and DevTools configuration. False creates no network
  // context; callers receive disconnected endpoints without automatic retry.
  // This callback must not mutate preferences or substitute fallback paths.
  virtual bool CanCreateNetworkContext(
      BrowserContext* context,
      const network::mojom::NetworkContextParams& network_context_params);

  // Returns the parent paths that contain all the network service's''')
modify('content/public/browser/content_browser_client.cc','std::vector<base::FilePath>\nContentBrowserClient::GetNetworkContextsParentDirectory()', '''bool ContentBrowserClient::CanCreateNetworkContext(
    BrowserContext* context,
    const network::mojom::NetworkContextParams& network_context_params) {
  return true;
}

std::vector<base::FilePath>
ContentBrowserClient::GetNetworkContextsParentDirectory()''')
modify('chrome/browser/chrome_content_browser_client.h','  std::vector<base::FilePath> GetNetworkContextsParentDirectory() override;', '''  bool CanCreateNetworkContext(
      content::BrowserContext* context,
      const network::mojom::NetworkContextParams& network_context_params) override;
  std::vector<base::FilePath> GetNetworkContextsParentDirectory() override;''')
name='chrome/browser/chrome_content_browser_client.cc'
modify(name,'#include "chrome/browser/aux/ntp_prerender_service.h"','''#include "chrome/browser/aux/ntp_prerender_service.h"
#if defined(AUX_SEALED_NATIVE_COLD_ENTRY)
#include "chrome/browser/aux/AuxBrowserNetworkPaths.h"
#endif''')
modify(name,'std::vector<base::FilePath>\nChromeContentBrowserClient::GetNetworkContextsParentDirectory()', '''bool ChromeContentBrowserClient::CanCreateNetworkContext(
    content::BrowserContext* context,
    const network::mojom::NetworkContextParams& params) {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && defined(AUX_SEALED_NATIVE_COLD_ENTRY)
  // Inspect the actual final paths, including Local State kDiskCacheDir and
  // DevTools overrides. Never widen roots held by already-running children.
  std::vector<std::string> paths;
  if (params.file_paths) {
    const auto& files = *params.file_paths;
    const auto append = [&paths](const auto& directory) {
      if (directory) paths.push_back(directory->path().value());
    };
    append(files.shared_dictionary_directory);
    append(files.http_cache_directory);
    append(files.no_vary_search_directory);
    append(files.logical_invalidation_directory);
    if (!files.data_directory.path().empty())
      paths.push_back(files.data_directory.path().value());
    if (files.unsandboxed_data_path)
      paths.push_back(files.unsandboxed_data_path->value());
  }
  return aux::peer::CanCreateContainedBrowserNetworkContext(paths);
#else
  return true;
#endif
}

std::vector<base::FilePath>
ChromeContentBrowserClient::GetNetworkContextsParentDirectory()''')
modify('content/browser/storage_partition_impl.cc','  network_context_owner_->network_context.reset();\n  CreateNetworkContextInNetworkService(','''  if (!GetContentClient()->browser()->CanCreateNetworkContext(
          browser_context_, *context_params)) {
    // Keep endpoints bound, but disconnected. Consumers get transport failure
    // rather than a null endpoint, fallback context or automatic reconnect loop.
    // This also closes the already-created verifier's client endpoint when
    // context_params is destroyed; no denied NetworkContext receives its paths.
    network_context_owner_->network_context.reset();
    auto rejected_context =
        network_context_owner_->network_context.BindNewPipeAndPassReceiver();
    cert_verifier_service_updater_.reset();
    auto rejected_updater =
        cert_verifier_service_updater_.BindNewPipeAndPassReceiver();
    network_context_client_receiver_.reset();
    return;
  }

  network_context_owner_->network_context.reset();
  CreateNetworkContextInNetworkService(''')
# prior root producer patch must be applied first for these native new files.
modify('chrome/browser/aux/BUILD.gn','    "AuxNativeParentColdLaunch.cc",','    "AuxNativeParentColdLaunch.cc",\n    "AuxBrowserNetworkPaths.cc",')
patch='';pins={}
for name,text in mods.items():
 old=baseline(name);p=H/'source'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
 patch+=''.join(difflib.unified_diff(old.splitlines(True),text.splitlines(True),fromfile='a/'+name,tofile='b/'+name,n=3));pins[name]={'before':hashlib.sha256(old.encode()).hexdigest(),'after':hashlib.sha256(text.encode()).hexdigest()}
(H/'native.patch').write_text(patch);(H/'patch-inputs.json').write_text(json.dumps(pins,indent=2)+'\n')
