from pathlib import Path
import hashlib,json,difflib
root=Path('/Users/rcourson/Documents/Vibe/web');proposal=Path('docs/integration/proposed/aux-async-profile-creation-admission');composition=root/'out/native-reuse-composition-aux-session-writer-close-gn';parentraw=(composition/'manifest.json').read_bytes();parent=json.loads(parentraw);assert hashlib.sha256(parentraw).hexdigest()=='2f2d89447a39710b711db114c5578b745e8b5a71a930ca0ffd9f0e7a614fd1a9';assert len(parent['files'])==778 and len(parent['binaryAssets'])==23
native=Path(parent['sourceRoot']);path='chrome/browser/profiles/profile_manager.cc';before=(native/path).read_text();record=next(x for x in parent['files'] if x['path']==path);assert hashlib.sha256(before.encode()).hexdigest()==record['outputSha256'];s=before;edits=[]
def edit(name,find,replace):
 global s
 assert s.count(find)==1,(name,s.count(find));s=s.replace(find,replace);edits.append({'name':name,'find':find,'replace':replace,'count':1})
edit('native declaration include','#include "chrome/browser/ui/aux_profile_switch_session_rebuild.h"','#include "chrome/browser/ui/aux_profile_switch_session_rebuild.h"\n#include "chrome/browser/profiles/aux_async_profile_creation_admission.h"')
start='''  TRACE_EVENT1("browser,startup", "ProfileManager::CreateProfileAsync",
               "profile_path", profile_path.AsUTF8Unsafe());
'''
extra='''
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  const uint64_t aux_generation = aux::CaptureAsyncProfileCreationGeneration();
  if (!aux::IsAsyncProfileCreationGenerationCurrent(aux_generation)) {
    if (initialized_callback)
      std::move(initialized_callback).Run(nullptr);
    return;
  }
  // Queued closures retain this generation in both nullable completion and
  // created-publication wrappers. Re-entry below also checks permanent close.
  if (initialized_callback) {
    initialized_callback = base::BindOnce(
        &aux::DeliverAsyncProfileInitialization<
            base::OnceCallback<void(Profile*)>, Profile>,
        aux_generation, std::move(initialized_callback));
  }
  if (created_callback) {
    created_callback = base::BindOnce(
        &aux::DeliverAsyncProfileCreated<base::OnceCallback<void(Profile*)>,
                                         Profile>,
        aux_generation, std::move(created_callback));
  }
#endif
'''
edit('async entry and captured queued completion generation',start,start+extra)
find='''    // Initiate asynchronous creation process.
    info = RegisterOwnedProfile(CreateProfileAsyncHelper(profile_path));'''
rep='''    // Initiate asynchronous creation process.
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
    if (!aux::RunAsyncProfileCreationDispatch(aux_generation, [&] {
          info = RegisterOwnedProfile(CreateProfileAsyncHelper(profile_path));
        })) {
      if (initialized_callback)
        std::move(initialized_callback).Run(nullptr);
      return;
    }
#else
    info = RegisterOwnedProfile(CreateProfileAsyncHelper(profile_path));
#endif'''
edit('actual async constructor/register dispatch',find,rep)
find='''      Profile* profile = info->GetCreatedProfile();
      // If this was the Guest profile, apply settings and go OffTheRecord.'''
rep='''#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
      if (!aux::RunAsyncProfileCreationDispatch(aux_generation, [&] {
#endif
      Profile* profile = info->GetCreatedProfile();
      // If this was the Guest profile, apply settings and go OffTheRecord.'''
edit('already-loaded async mutation dispatch start',find,rep)
find='''      if (!initialized_callback.is_null())
        std::move(initialized_callback).Run(profile);
    } else {'''
rep='''      if (!initialized_callback.is_null())
        std::move(initialized_callback).Run(profile);
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
      })) {
        if (initialized_callback)
          std::move(initialized_callback).Run(nullptr);
      }
#endif
    } else {'''
edit('already-loaded async mutation dispatch completion',find,rep)
find='''  DCHECK(profiles::IsDefaultAvatarIconIndex(icon_index));

  ProfileManager* profile_manager = g_browser_process->profile_manager();'''
rep='''  DCHECK(profiles::IsDefaultAvatarIconIndex(icon_index));

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  const uint64_t aux_generation = aux::CaptureAsyncProfileCreationGeneration();
  if (!aux::RunAsyncProfileCreationDispatch(aux_generation, [&] {
#endif
  ProfileManager* profile_manager = g_browser_process->profile_manager();'''
edit('multi creation attribute/path dispatch start',find,rep)
find='''      base::BindOnce(&NukeProfileFromDisk, new_path,
                     base::BindOnce(&ProfileManager::CreateProfileAsync,
                                    profile_manager->weak_factory_.GetWeakPtr(),
                                    new_path, std::move(initialized_callback),
                                    std::move(created_callback))));
}'''
rep='''#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
      base::BindOnce(
          [](uint64_t generation, const base::FilePath& path,
             base::OnceClosure continuation) {
            if (!aux::RunAsyncProfileCreationDispatch(generation, [&] {
                  NukeProfileFromDisk(path, std::move(continuation));
                })) {
              // Nullable failure is delivered by the real UI entrypoint. Never
              // invoke a profile callback on this ThreadPool thread.
              content::GetUIThreadTaskRunner({})->PostTask(
                  FROM_HERE, std::move(continuation));
            }
          },
          aux_generation, new_path,
          base::BindOnce(&ProfileManager::CreateProfileAsync,
                         profile_manager->weak_factory_.GetWeakPtr(), new_path,
                         std::move(initialized_callback),
                         std::move(created_callback))));
  })) {
    if (initialized_callback)
      std::move(initialized_callback).Run(nullptr);
  }
#else
      base::BindOnce(&NukeProfileFromDisk, new_path,
                     base::BindOnce(&ProfileManager::CreateProfileAsync,
                                    profile_manager->weak_factory_.GetWeakPtr(),
                                    new_path, std::move(initialized_callback),
                                    std::move(created_callback))));
#endif
}'''
edit('queued multi deletion dispatch and UI completion check',find,rep)
(proposal/'source/profile_manager.cc').write_text(s)
patch='diff --git a/'+path+' b/'+path+'\n'+''.join(difflib.unified_diff(before.splitlines(True),s.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
for name in ['aux_async_profile_creation_admission.h','aux_async_profile_creation_admission.cc']:
 target='chrome/browser/profiles/'+name;text=(proposal/'source'/name).read_text();patch+='diff --git a/'+target+' b/'+target+'\nnew file mode 100644\n'+''.join(difflib.unified_diff([],text.splitlines(True),fromfile='/dev/null',tofile='b/'+target))

impl_path='chrome/browser/profiles/profile_impl.cc';impl_before=(native/impl_path).read_text();assert not any(x['path']==impl_path for x in parent['files']);assert hashlib.sha256(impl_before.encode()).hexdigest()=='e887443652d48563145855e2c525426aa44ccd1dc1023a7e1068fa4c092f06eb';impl=impl_before
impl_edits=[]
def impl_edit(name,find,replace):
 global impl
 assert impl.count(find)==1,(name,impl.count(find));impl=impl.replace(find,replace);impl_edits.append({'name':name,'find':find,'replace':replace,'count':1})
impl_edit('ProfileImpl observation declaration include','#include "chrome/common/buildflags.h"','#include "chrome/common/buildflags.h"\n#include "chrome/browser/buildflags.h"\n#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)\n#include "chrome/browser/profiles/aux_async_profile_creation_admission.h"\n#endif')
impl_edit('actual async constructor start observation','  TRACE_EVENT0("browser,startup", "ProfileImpl::ctor");','  TRACE_EVENT0("browser,startup", "ProfileImpl::ctor");\n#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)\n  if (create_mode == CreateMode::kAsynchronous)\n    aux::ObserveAsyncProfileInitializationStarted(this);\n#endif')
impl_edit('actual final-init tail completion observation',"""  // third-party cookie deprecation must be created with the profile, but after
  // the initialization of the OriginTrialsControllerDelegate, as it depends on
  // it.
}""","""  // third-party cookie deprecation must be created with the profile, but after
  // the initialization of the OriginTrialsControllerDelegate, as it depends on
  // it.
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (create_mode == CreateMode::kAsynchronous)
    aux::ObserveAsyncProfileInitializationFinished(this);
#endif
}""")
impl_edit('destruction never implies successful tail completion','ProfileImpl::~ProfileImpl() {\n  MaybeSendDestroyedNotification();','ProfileImpl::~ProfileImpl() {\n#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)\n  aux::ObserveAsyncProfileInitializationAbandoned(this);\n#endif\n  MaybeSendDestroyedNotification();')
(proposal/'source/profile_impl.cc').write_text(impl)
patch+='diff --git a/'+impl_path+' b/'+impl_path+'\n'+''.join(difflib.unified_diff(impl_before.splitlines(True),impl.splitlines(True),fromfile='a/'+impl_path,tofile='b/'+impl_path))

(proposal/'followup.patch').write_text(patch)
(proposal/'inputs.json').write_text(json.dumps({'format':'aux.async-profile-creation-admission.v1','parent':{'path':'out/native-reuse-composition-aux-session-writer-close-gn','sha256':hashlib.sha256(parentraw).hexdigest(),'sourceCount':778,'assetCount':23},'sourceRoot':str(native),'files':[{'path':path,'inputSha256':hashlib.sha256(before.encode()).hexdigest(),'outputSha256':hashlib.sha256(s.encode()).hexdigest()},{'path':impl_path,'inputSha256':hashlib.sha256(impl_before.encode()).hexdigest(),'outputSha256':hashlib.sha256(impl.encode()).hexdigest(),'additionalPinnedNativeInput':True}]+[{'path':'chrome/browser/profiles/'+name,'inputSha256':None,'outputSha256':hashlib.sha256((proposal/'source'/name).read_bytes()).hexdigest()}for name in ['aux_async_profile_creation_admission.h','aux_async_profile_creation_admission.cc']],'profileImpl':{'path':impl_path,'inputSha256':hashlib.sha256(impl_before.encode()).hexdigest(),'outputSha256':hashlib.sha256(impl.encode()).hexdigest(),'edits':impl_edits},'edits':edits,'patchSha256':hashlib.sha256(patch.encode()).hexdigest(),'appliedToCheckout':False,'ordinaryShutdownHookAdded':False},indent=2)+'\n')
