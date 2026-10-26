#!/usr/bin/env python3
"""Join the finite host producer, actual pipe closure and shutdown ordering."""
from pathlib import Path
import difflib
import hashlib
import json

HERE=Path(__file__).resolve().parent
NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
PRIOR=HERE.parent
plan=json.loads((HERE/'changes.json').read_text())

def save(name,text,parent=None,anchors=None):
    original=(NATIVE/name).read_text() if (NATIVE/name).is_file() else ''
    for folder,content in [('baseline',original),('source',text)]:
        path=HERE/folder/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_text(content)
    row={'path':name,'input':str(NATIVE/name) if original else None,
         'before':hashlib.sha256(original.encode()).hexdigest() if original else None,
         'after':hashlib.sha256(text.encode()).hexdigest(),'anchors':anchors or []}
    if parent:row['composedParent']=str(parent);row['composedParentSha256']=hashlib.sha256(parent.read_bytes()).hexdigest()
    plan['files']=[x for x in plan['files'] if x['path']!=name]+[row]

def edit(name,replacements,prior=False):
    parent=(PRIOR/'source'/name) if prior else NATIVE/name
    text=parent.read_text();anchors=[]
    for old,new in replacements:
        count=text.count(old)
        if count!=1:raise RuntimeError(f'{name}: anchor count {count}: {old[:90]}')
        text=text.replace(old,new,1);anchors.append({'old':old,'new':new,'count':1})
    save(name,text,parent if prior else None,anchors)

for name in ['aux_native_host_lease.h','aux_native_host_lease.cc']:
    save('chrome/browser/extensions/api/messaging/'+name,(HERE/'templates'/name).read_text())

edit('net/base/file_stream.h', [('  virtual bool IsOpen() const;', '''  virtual bool IsOpen() const;

  // One actual-close observation for an already open stream. Called on the
  // file task runner after the underlying descriptor closes, including orphan
  // cleanup; it must be safe independently of this object's lifetime.
  void SetCloseObserver(base::OnceClosure observer);''')])
edit('net/base/file_stream.cc', [('bool FileStream::IsOpen() const {', '''void FileStream::SetCloseObserver(base::OnceClosure observer) {
  context_->SetCloseObserver(std::move(observer));
}

bool FileStream::IsOpen() const {''')])
edit('net/base/file_stream_context.h', [
('  bool async_in_progress() const { return async_in_progress_; }', '''  void SetCloseObserver(base::OnceClosure observer);
  bool async_in_progress() const { return async_in_progress_; }'''),
('  base::File file_;', '  base::File file_;\n  base::OnceClosure close_observer_;'),
])
edit('net/base/file_stream_context.cc', [
('void FileStream::Context::Close(CompletionOnceCallback callback) {', '''void FileStream::Context::SetCloseObserver(base::OnceClosure observer) {
  CHECK(file_.IsValid());
  CHECK(!async_in_progress_);
  CHECK(!close_observer_);
  close_observer_=std::move(observer);
}

void FileStream::Context::Close(CompletionOnceCallback callback) {'''),
('  file_.Close();\n  return IOResult(OK, 0);', '  file_.Close();\n  if(close_observer_)std::move(close_observer_).Run();\n  return IOResult(OK, 0);'),
])

name='chrome/browser/extensions/api/messaging/aux_native_messaging_lifetime.h'
text=(PRIOR/'source'/name).read_text()
text=text.replace('#include "base/process/kill.h"', '''#include "base/process/kill.h"
#include "base/functional/callback.h"
#include "chrome/browser/aux/ordinary_startup_build.h"
#include "chrome/browser/extensions/api/messaging/aux_native_host_lease.h"''')
start=text.index('  static std::shared_ptr<AuxNativeMessagingLifetime> Reserve(')
end=text.index('  void BindLaunch',start)
text=text[:start]+'''  static std::shared_ptr<AuxNativeMessagingLifetime> Reserve(
      std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner,
      std::string extension_origin, std::string native_host_name,
      const base::FilePath& image) {
    if(!profile_owner||extension_origin.empty()||native_host_name.empty())return nullptr;
    auto entry=std::shared_ptr<AuxNativeMessagingLifetime>(
        new AuxNativeMessagingLifetime(std::move(profile_owner),
            std::move(extension_origin),std::move(native_host_name)));
    {
      std::lock_guard<std::mutex> lock(RegistryMutex());
      if(getpid()!=RegistryOwner()||Closed()||Registry().size()>=4096) {
        if(getpid()!=RegistryOwner()||Registry().size()>=4096)AccountingUnknown()=true;
        return nullptr;
      }
#if !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
      entry->cohort=aux::browser_custody::Reserve(aux::browser_custody::Family::kNativeMessaging);
      if(!entry->cohort)return nullptr;
      if(!aux::browser_custody::MaySpawn(entry->cohort)) {
        aux::browser_custody::DidFailBeforeChild(entry->cohort);return nullptr;
      }
#endif
      Registry().push_back(entry); // Retain before any durable preparation.
    }
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
    // No registry/entry lock crosses authenticated native callbacks.
    bool durable_attempted=false;
    auto lease=AuxNativeHostLease::Prepare(entry->profile_owner_->profile_path(),
        entry->extension_origin_,entry->native_host_name_,image,durable_attempted);
    {
      std::lock_guard<std::mutex> lock(entry->mutex);
      entry->ordinary_lease_=lease;
      if(!lease){
        if(durable_attempted)entry->uncertain=true;
        else{entry->bound=true;entry->ReleaseLocked();}
        return nullptr;
      }
      if(entry->cancel_requested_)lease->Cancel();
    }
#endif
    return entry;
  }
  base::Process LaunchOrdinary(const base::CommandLine& command,
                               const base::LaunchOptions& options) {
    return ordinary_lease_?ordinary_lease_->Launch(command,options):base::Process();
  }
  void ObservePipeClosed(uint32_t mask) {
    if(ordinary_lease_)ordinary_lease_->ObservePipeClosed(mask);
  }
  bool ReapOrdinary(base::Process& process) {
    if(!ordinary_lease_)return false;
    ordinary_lease_->Reap(std::move(process));return true;
  }
  void InstallCancellation(base::OnceClosure callback) {
    base::OnceClosure dispatch;
    {
      std::lock_guard<std::mutex> lock(mutex);
      if(cancel_requested_)dispatch=std::move(callback);
      else cancellation_=std::move(callback);
    }
    if(dispatch)std::move(dispatch).Run();
  }
  void RequestStop() {
    base::OnceClosure dispatch;std::shared_ptr<AuxNativeHostLease> lease;
    {
      std::lock_guard<std::mutex> lock(mutex);
      cancel_requested_=true;lease=ordinary_lease_;dispatch=std::move(cancellation_);
    }
    if(lease)lease->Cancel();
    if(dispatch)std::move(dispatch).Run();
  }
'''+text[end:]
text=text.replace('    if (pid > 0) {', '    if(ordinary_lease_)return;\n    if (pid > 0) {',1)
start=text.index('  static void CloseAdmission() {');end=text.index('  static Snapshot Inspect()',start)
text=text[:start]+'''  static void CloseAdmission() {
    std::vector<std::shared_ptr<AuxNativeMessagingLifetime>> entries;
    {
      std::lock_guard<std::mutex> lock(RegistryMutex());
      Closed()=true;
      if(getpid()!=RegistryOwner())AccountingUnknown()=true;
      entries=Registry();
    }
    for(const auto& entry:entries)entry->RequestStop();
  }
'''+text[end:]
text=text.replace('const auto descendants = aux::browser_custody::Inspect(entry->cohort);', 'const auto descendants = entry->ordinary_lease_?entry->ordinary_lease_->Inspect():\n#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)\n          aux::browser_custody::Result::kPending;\n#else\n          aux::browser_custody::Inspect(entry->cohort);\n#endif')
text=text.replace('  const std::string native_host_name_;', '''  const std::string native_host_name_;
  std::shared_ptr<AuxNativeHostLease> ordinary_lease_;
  base::OnceClosure cancellation_;
  bool cancel_requested_=false;''')
text=text.replace('  std::unique_lock<std::mutex> lock;\n  if (custody)', '  if(custody&&custody->ReapOrdinary(process))return;\n  std::unique_lock<std::mutex> lock;\n  if (custody)')
text=text.replace('// Invoked by the existing blocking-pool termination task, not a new reaper.', '''// UI-only finite ordinary shutdown observation, while the authenticated
// journal owner remains alive. False remains an unresolved failure.
bool CloseAuxNativeMessagingAndWaitForSettlement();
// Invoked by the existing blocking-pool termination task, not a new reaper.''')
save(name,text,PRIOR/'source'/name,[{'kind':'finite ordinary native-host producer composition','count':1}])

name='chrome/browser/extensions/api/messaging/launch_context_posix.cc'
text=(PRIOR/'source'/name).read_text().replace('std::move(profile_owner), origin.spec(), native_host_name);', 'std::move(profile_owner), origin.spec(), native_host_name, command_line.GetProgram());')
text=text.replace('  base::Process local_process = base::LaunchProcess(*sandboxed_host, options);', '''#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
  base::Process local_process = custody->LaunchOrdinary(*sandboxed_host,options);
#else
  base::Process local_process = base::LaunchProcess(*sandboxed_host, options);
#endif''')
text=text.replace('    LOG(ERROR) << "Error launching process";', '''#if BUILDFLAG(IS_MAC)
    read_pipe_read_fd.reset();read_pipe_write_fd.reset();
    write_pipe_read_fd.reset();write_pipe_write_fd.reset();
    custody->ObservePipeClosed(3);
#endif
    LOG(ERROR) << "Error launching process";''')
old='''  OnSuccess(read_file_unowned,
            std::make_unique<net::FileStream>(base::File(std::move(read_file)),
                                              background_task_runner_),
            std::make_unique<net::FileStream>(base::File(std::move(write_file)),
                                              background_task_runner_));'''
new='''  auto read_stream=std::make_unique<net::FileStream>(base::File(std::move(read_file)),background_task_runner_);
  auto write_stream=std::make_unique<net::FileStream>(base::File(std::move(write_file)),background_task_runner_);
#if BUILDFLAG(IS_MAC)
  read_stream->SetCloseObserver(base::BindOnce(
      &AuxNativeMessagingLifetime::ObservePipeClosed,aux_child_lifetime_,1));
  write_stream->SetCloseObserver(base::BindOnce(
      &AuxNativeMessagingLifetime::ObservePipeClosed,aux_child_lifetime_,2));
#endif
  OnSuccess(read_file_unowned,std::move(read_stream),std::move(write_stream));'''
assert text.count(old)==1;text=text.replace(old,new)
text=text.replace('#include "base/command_line.h"', '#include "base/command_line.h"\n#include "base/functional/bind.h"')
save(name,text,PRIOR/'source'/name,[{'kind':'finite suspended producer and actual stream observers','count':1}])
name='chrome/browser/extensions/api/messaging/launch_context.cc'
text=(PRIOR/'source'/name).read_text().replace('write_file.reset();\n                                   ReapAuxNativeMessagingProcess', 'write_file.reset();\n                                   if(lifetime)lifetime->ObservePipeClosed(3);\n                                   ReapAuxNativeMessagingProcess')
save(name,text,PRIOR/'source'/name,[{'kind':'cancelled raw-pipe physical observation','count':1}])
name='chrome/browser/extensions/api/messaging/native_message_process_host.cc'
text=(PRIOR/'source'/name).read_text().replace('#include "base/task/thread_pool.h"', '#include "base/task/thread_pool.h"\n#include "base/run_loop.h"\n#include "base/timer/timer.h"')
text=text.replace('  WaitRead();\n  DoWrite();\n}', '''#if BUILDFLAG(IS_MAC)
  if(aux_child_lifetime_)aux_child_lifetime_->InstallCancellation(base::BindOnce(
      [](scoped_refptr<base::SingleThreadTaskRunner> runner,
         base::WeakPtr<NativeMessageProcessHost> host) {
        runner->PostTask(FROM_HERE,base::BindOnce(
            &NativeMessageProcessHost::Close,host,std::string("Native host stopped for browser shutdown")));
      },task_runner_,weak_factory_.GetWeakPtr()));
#endif
  WaitRead();
  DoWrite();
}''',1)
insert='''bool CloseAuxNativeMessagingAndWaitForSettlement() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  AuxNativeMessagingLifetime::CloseAdmission();
  bool settled=false;
  base::RunLoop loop; base::RepeatingTimer poll;
  const auto deadline=base::TimeTicks::Now()+base::Seconds(5);
  auto inspect=base::BindRepeating(
      [](bool* settled,base::RunLoop* loop,base::TimeTicks deadline) {
        const auto status=AuxNativeMessagingLifetime::Inspect();
        *settled=status.admission_closed&&!status.wrong_process&&!status.accounting_unknown&&
            !status.unresolved&&!status.unbound&&!status.uncertain&&!status.unobserved_descendant_cohorts;
        if(*settled||base::TimeTicks::Now()>=deadline)loop->Quit();
      },base::Unretained(&settled),base::Unretained(&loop),deadline);
  inspect.Run();
  if(!settled){poll.Start(FROM_HERE,base::Milliseconds(10),inspect);loop.Run();}
  return settled;
}
'''
text=text.replace('AuxNativeMessagingLifetime::~AuxNativeMessagingLifetime() = default;', 'AuxNativeMessagingLifetime::~AuxNativeMessagingLifetime() = default;\n'+insert)
save(name,text,PRIOR/'source'/name,[{'kind':'native shutdown cancellation and finite settlement pump','count':1}])
# Unchanged parts of the first ownership slice are carried explicitly.
for name in ['launch_context.h','native_process_launcher.cc']:
    path='chrome/browser/extensions/api/messaging/'+name
    save(path,(PRIOR/'source'/path).read_text(),PRIOR/'source'/path)

edit('chrome/browser/extensions/api/messaging/BUILD.gn', [('  if (is_win) {\n    sources += [ "launch_context_win.cc" ]\n  }', '''  if (is_win) {
    sources += [ "launch_context_win.cc" ]
  }
  if (is_mac) {
    sources += [ "aux_native_host_lease.cc", "aux_native_host_lease.h" ]
  }''')])
name='chrome/browser/chrome_browser_main.cc'
edit(name,[('  aux::features::CloseNativeFeatureIoAdmission();\n  extensions::ShutdownAuxMiniPopup();', '''  aux::features::CloseNativeFeatureIoAdmission();
  if(!extensions::CloseAuxNativeMessagingAndWaitForSettlement())
    LOG(ERROR)<<"Aux native messaging remains unresolved before daemon shutdown";
  extensions::ShutdownAuxMiniPopup();'''),
('#include "chrome/browser/ui/aux_browser_shutdown_drain.h"', '#include "chrome/browser/ui/aux_browser_shutdown_drain.h"\n#include "chrome/browser/extensions/api/messaging/aux_native_messaging_lifetime.h"')])

patch=[]
for row in plan['files']:
    name=row['path']
    patch.extend(difflib.unified_diff((HERE/'baseline'/name).read_text().splitlines(True),
        (HERE/'source'/name).read_text().splitlines(True),fromfile='a/'+name,tofile='b/'+name))
(HERE/'native-host.patch').write_text(''.join(patch))
(HERE/'changes.json').write_text(json.dumps(plan,indent=2)+'\n')
print(json.dumps({'pairedFiles':len(plan['files'])}))
