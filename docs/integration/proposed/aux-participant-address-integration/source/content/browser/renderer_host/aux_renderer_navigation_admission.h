#ifndef CONTENT_BROWSER_RENDERER_HOST_AUX_RENDERER_NAVIGATION_ADMISSION_H_
#define CONTENT_BROWSER_RENDERER_HOST_AUX_RENDERER_NAVIGATION_ADMISSION_H_

#include <cstdint>
#include "content/public/browser/aux_renderer_navigation_admission.h"

namespace content::aux_migration {

class ScopedRendererInitAdmission final {
 public:
  ScopedRendererInitAdmission();
  ~ScopedRendererInitAdmission();
  ScopedRendererInitAdmission(const ScopedRendererInitAdmission&) = delete;
  ScopedRendererInitAdmission& operator=(const ScopedRendererInitAdmission&) = delete;
  bool admitted() const { return admitted_; }
 private:
  const bool admitted_;
};

// Starts the observation before any launch/reentrant embedder callback.
void ObserveRendererLaunchStarted(const void* host, bool in_process);
void ObserveRendererHostDestruction(const void* host);
class ScopedRendererLaunchCallback final {
 public:
  explicit ScopedRendererLaunchCallback(const void* host);
  ~ScopedRendererLaunchCallback();
  ScopedRendererLaunchCallback(const ScopedRendererLaunchCallback&) = delete;
  ScopedRendererLaunchCallback& operator=(const ScopedRendererLaunchCallback&) = delete;
 private:
  const uintptr_t host_identity_;
  const uint64_t token_;
};

// Native owner-keyed entry/resume acquisition. Repeated queued resumes retain
// the same request observation; closure cannot be reopened by a new request.
class ScopedNavigationAdmission final {
 public:
  ScopedNavigationAdmission(const void* request, bool first_entry);
  ~ScopedNavigationAdmission();
  ScopedNavigationAdmission(const ScopedNavigationAdmission&) = delete;
  ScopedNavigationAdmission& operator=(const ScopedNavigationAdmission&) = delete;
  bool admitted() const { return admitted_; }
 private:
  const bool admitted_;
};
void ObserveNavigationDestruction(const void* request);
void ObserveUnsupportedNavigationCancellation();

}  // namespace content::aux_migration
#endif
