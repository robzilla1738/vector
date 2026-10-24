// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/aux_file_operation_lifetime.h"
#include <map>
#include <utility>
#include "base/check.h"
#include "base/no_destructor.h"
#include "content/public/browser/browser_thread.h"
namespace aux::files {
namespace {
struct Fence { size_t pending = 0; base::RepeatingClosureList settled; };
Fence& ForPath(const base::FilePath& path) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  static base::NoDestructor<std::map<base::FilePath, Fence>> fences;
  return (*fences)[path];
}
}  // namespace
FileOperationLifetime::FileOperationLifetime(base::FilePath path)
    : path_(std::move(path)), authorized_(std::make_shared<std::atomic_bool>(true)) {}
FileOperationLifetime::~FileOperationLifetime() {
  Revoke();
  // If a completion is discarded during shutdown, retain the pending fence.
  // Losing an owner is not proof that its worker or durable write finished.
}
void FileOperationLifetime::Revoke() { authorized_->store(false, std::memory_order_release); }
void FileOperationLifetime::Begin() {
  CHECK(!pending_); pending_ = true; ++ForPath(path_).pending;
}
void FileOperationLifetime::End() {
  CHECK(pending_); pending_ = false;
  auto& fence = ForPath(path_); CHECK_GT(fence.pending, 0u);
  if (--fence.pending == 0) fence.settled.Notify();
}
bool HasFileOperationsPending(const base::FilePath& path) { return ForPath(path).pending != 0; }
base::CallbackListSubscription ObserveFileOperationsSettled(const base::FilePath& path, base::RepeatingClosure callback) {
  return ForPath(path).settled.Add(std::move(callback));
}
}  // namespace aux::files
