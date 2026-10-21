from pathlib import Path
import hashlib,json,difflib
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');out=Path(__file__).resolve().parent
manifest=json.loads(Path('/Users/rcourson/Documents/Vibe/web/out/native-reuse-composition-v603/manifest.json').read_text())
PINS={'extensions/browser/extension_host.h': '2431fddafc4a9f4b76c8f944bc3d3808daa8f9b9d023a24a85222a49257e67cc', 'extensions/browser/extension_host.cc': '84de72c62c9e778697c2a15f6600aae6f5642c3f792bcb945b2b6911bbe25c98', 'chrome/browser/extensions/extension_view_host.h': 'fc40f559b2737cad5fdb7454effb124cfd31d75981e36e0e63a559e8f668d241', 'chrome/browser/extensions/extension_view_host.cc': 'f907419557f45476c5d8f655aea7e307cba586d728c77a5e25248785a89d57f6', 'chrome/browser/extensions/extension_view_host_factory.h': '6dc01522a051c9789982352a4a0d1400b95b7cc91bd56170830e721c037fdc2d', 'chrome/browser/extensions/extension_view_host_factory.cc': 'd9c0ff13dc368f12e1fe546d8ce34022cf30015be001c56b48eb76ad5bc2c410', 'chrome/browser/ui/extensions/extension_side_panel_manager.h': 'e5d2cdfdca8a2c41176ae9de704aa433374573e386fc6170ea530048c8ed0307', 'chrome/browser/ui/extensions/extension_side_panel_manager.cc': '07dde6dbeae5d75cb781e419191db253c45973d70bd84533febb96945c885acb', 'chrome/browser/ui/extensions/extension_side_panel_coordinator_views.cc': 'a7d3d048903257d7a77c509c6ca7187877aa0cf7e6a52bce92af826e2980d58e'}
files=[];edits=[];patch=[]
def edit(p,rs):
 old=(root/p).read_text();s=old
 assert hashlib.sha256(old.encode()).hexdigest()==PINS[p],p
 for a,b in rs:
  assert s.count(a)==1,(p,a[:70],s.count(a));s=s.replace(a,b);edits.append({'path':p,'anchorSha256':hashlib.sha256(a.encode()).hexdigest(),'count':1})
 dest=out/'sources'/p;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(s)
 files.append({'path':p,'baselineSha256':hashlib.sha256(old.encode()).hexdigest(),'outputSha256':hashlib.sha256(s.encode()).hexdigest()})
 patch.extend(difflib.unified_diff(old.splitlines(True),s.splitlines(True),fromfile='a/'+p,tofile='b/'+p))
ns='const content::SessionStorageNamespaceHandleMap& session_storage'
edit('extensions/browser/extension_host.h',[
 ('#include "content/public/browser/web_contents_delegate.h"','#include "content/public/browser/web_contents_delegate.h"\n#include "content/public/browser/session_storage_namespace_handle.h"'),
 ('                mojom::ViewType host_type);','                mojom::ViewType host_type,\n                '+ns+' = {});')])
edit('extensions/browser/extension_host.cc',[
 ('                             mojom::ViewType host_type)\n','                             mojom::ViewType host_type,\n                             '+ns+')\n'),
 ('  host_contents_ = WebContents::Create(create_params);','''  // A supplied namespace is a sole-owner, same-profile reconstitution. Callers
  // must destroy the previous WebContents before constructing its successor.
  host_contents_ = session_storage.empty()
      ? WebContents::Create(create_params)
      : WebContents::CreateWithSessionStorage(create_params, session_storage);''')])
edit('chrome/browser/extensions/extension_view_host.h',[
 ('                    std::unique_ptr<Delegate> delegate);','                    std::unique_ptr<Delegate> delegate,\n                    '+ns+' = {});')])
edit('chrome/browser/extensions/extension_view_host.cc',[
 ('    std::unique_ptr<Delegate> delegate)\n','    std::unique_ptr<Delegate> delegate,\n    '+ns+')\n'),
 ('                    host_type),','                    host_type, session_storage),')])
edit('chrome/browser/extensions/extension_view_host_factory.h',[
 ('#include <memory>','#include <memory>\n#include "content/public/browser/session_storage_namespace_handle.h"'),
 ('      tabs::TabInterface* tab_interface);','      tabs::TabInterface* tab_interface,\n      '+ns+' = {});')])
edit('chrome/browser/extensions/extension_view_host_factory.cc',[
 ('''std::unique_ptr<ExtensionViewHost> CreateViewHostForExtension(
    const Extension* extension,
    const GURL& url,
    Profile* profile,
    mojom::ViewType view_type,
    std::unique_ptr<ExtensionViewHost::Delegate> delegate)''','''std::unique_ptr<ExtensionViewHost> CreateViewHostForExtension(
    const Extension* extension,
    const GURL& url,
    Profile* profile,
    mojom::ViewType view_type,
    std::unique_ptr<ExtensionViewHost::Delegate> delegate,
    '''+ns+' = {})'),
 ('                                             std::move(delegate));','                                             std::move(delegate), session_storage);'),
 ('''std::unique_ptr<ExtensionViewHost> CreateExtensionViewHost(
    const Extension& extension,
    const GURL& url,
    Profile* profile,
    extensions::mojom::ViewType view_type,
    std::unique_ptr<ExtensionViewHost::Delegate> delegate)''','''std::unique_ptr<ExtensionViewHost> CreateExtensionViewHost(
    const Extension& extension,
    const GURL& url,
    Profile* profile,
    extensions::mojom::ViewType view_type,
    std::unique_ptr<ExtensionViewHost::Delegate> delegate,
    '''+ns+' = {})'),
 ('  if (profile->IsOffTheRecord()) {\n    return CreateViewHostForIncognito','  if (profile->IsOffTheRecord()) {\n    CHECK(session_storage.empty());\n    return CreateViewHostForIncognito'),
 ('  return CreateViewHostForExtension(&extension, url, profile, view_type,\n                                    std::move(delegate));','  return CreateViewHostForExtension(&extension, url, profile, view_type,\n                                    std::move(delegate), session_storage);'),
 ('    tabs::TabInterface* tab_interface) {','    tabs::TabInterface* tab_interface,\n    '+ns+') {'),
 ('                                 std::move(delegate));\n}\n\n}  // namespace extensions','                                 std::move(delegate), session_storage);\n}\n\n}  // namespace extensions')])
edit('chrome/browser/ui/extensions/extension_side_panel_manager.h',[
 ('#include <optional>','#include <optional>\n#include <vector>\n#include "base/memory/weak_ptr.h"\n#include "base/scoped_multi_source_observation.h"\n#include "chrome/browser/profiles/profile_observer.h"\n#include "content/public/browser/session_storage_namespace_handle.h"'),
 ('class ExtensionSidePanelManager : public ExtensionRegistryObserver {','class ExtensionSidePanelManager : public ExtensionRegistryObserver,\n                                  public ProfileObserver {'),
 ('  void AbortForAuxProfileSwitch(Profile* source_profile);','''  void AbortForAuxProfileSwitch(Profile* source_profile);
  content::SessionStorageNamespaceHandleMap TakeAuxAgentSessionStorage(
      const Extension& extension, const GURL& url);
  void OnProfileWillBeDestroyed(Profile* profile) override;'''),
 ('  raw_ptr<Profile> aux_switch_source_profile_ = nullptr;','''  struct AuxAgentStorage {
    base::WeakPtr<Profile> profile;
    scoped_refptr<const Extension> extension;
    GURL url;
    content::SessionStorageNamespaceHandleMap namespaces;
  };
  std::vector<AuxAgentStorage> aux_agent_storage_;
  base::ScopedMultiSourceObservation<Profile, ProfileObserver>
      aux_storage_profiles_{this};
  raw_ptr<Profile> aux_switch_source_profile_ = nullptr;''')])
edit('chrome/browser/ui/extensions/extension_side_panel_manager.cc',[
 ('#include "chrome/browser/ui/side_panel/side_panel_registry.h"','#include "chrome/browser/ui/side_panel/side_panel_registry.h"\n#include "chrome/browser/aux/component_bootstrap.h"\n#include "chrome/browser/extensions/extension_view_host.h"\n#include "content/public/browser/navigation_controller.h"\n#include <algorithm>'),
 ('  aux_switch_source_profile_ = browser_->GetProfile();','''  // Retain only the native namespace, never a live source-profile document or
  // its window delegates. Deregistration below destroys the sole old host.
  auto found = coordinators_.find(aux::kAgentExtensionId);
  if (found != coordinators_.end() && found->second->host()) {
    auto* host = found->second->host();
    std::erase_if(aux_agent_storage_, [this](const auto& entry) {
      return !entry.profile || entry.profile.get() == profile_;
    });
    aux_agent_storage_.push_back({profile_->GetWeakPtr(),
        scoped_refptr<const Extension>(found->second->extension()),
        host->initial_url(),
        host->host_contents()->GetController().GetSessionStorageNamespaceMap()});
    if (!aux_storage_profiles_.IsObservingSource(profile_))
      aux_storage_profiles_.AddObservation(profile_);
  }
  aux_switch_source_profile_ = browser_->GetProfile();'''),
 ('void ExtensionSidePanelManager::RebuildForAuxProfileSwitch(Profile* target_profile) {','''content::SessionStorageNamespaceHandleMap
ExtensionSidePanelManager::TakeAuxAgentSessionStorage(
    const Extension& extension, const GURL& url) {
  if (for_tab_ || aux_profile_switch_prepared_ ||
      browser_->GetProfile() != profile_ ||
      extension.id() != aux::kAgentExtensionId) return {};
  for (auto it = aux_agent_storage_.begin(); it != aux_agent_storage_.end(); ++it) {
    if (it->profile.get() != profile_) continue;
    content::SessionStorageNamespaceHandleMap result;
    // An unload/reload, option URL change, or different profile invalidates
    // reuse; Extension object identity detects even same-version reloads.
    if (it->extension.get() == &extension && it->url == url)
      result = std::move(it->namespaces);
    aux_agent_storage_.erase(it);
    if (aux_storage_profiles_.IsObservingSource(profile_))
      aux_storage_profiles_.RemoveObservation(profile_);
    return result;
  }
  return {};
}
void ExtensionSidePanelManager::OnProfileWillBeDestroyed(Profile* profile) {
  std::erase_if(aux_agent_storage_, [profile](const auto& entry) {
    return !entry.profile || entry.profile.get() == profile;
  });
  aux_storage_profiles_.RemoveObservation(profile);
}

void ExtensionSidePanelManager::RebuildForAuxProfileSwitch(Profile* target_profile) {''')])
edit('chrome/browser/ui/extensions/extension_side_panel_coordinator_views.cc',[
 ('#include "chrome/browser/aux/component_bootstrap.h"','#include "chrome/browser/aux/component_bootstrap.h"\n#include "chrome/browser/ui/extensions/extension_side_panel_manager.h"'),
 ('''    auto host = ExtensionViewHostFactory::CreateSidePanelHost(
        *coordinator_->extension(), url, coordinator_->browser(),
        coordinator_->tab_interface());''','''    content::SessionStorageNamespaceHandleMap session_storage;
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
    if (auto* browser = coordinator_->browser()) {
      if (auto* manager = ExtensionSidePanelManager::From(browser))
        session_storage = manager->TakeAuxAgentSessionStorage(
            *coordinator_->extension(), url);
    }
#endif
    auto host = ExtensionViewHostFactory::CreateSidePanelHost(
        *coordinator_->extension(), url, coordinator_->browser(),
        coordinator_->tab_interface(), session_storage);''')])
(out/'native.patch').write_text(''.join(patch));(out/'files.json').write_text(json.dumps({'baseComposition':'v603','files':files,'edits':edits},indent=2)+'\n');print(len(files),len(edits))
