// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_PERSON_CAPTURE_CONTROLLER_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_PERSON_CAPTURE_CONTROLLER_H_
#include <string>
#include <vector>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"
#include "base/values.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/browser/web_contents_user_data.h"
#include "content/public/browser/weak_document_ptr.h"
#include "content/public/browser/render_widget_host_view.h"
#include "content/browser/renderer_host/render_widget_host_impl.h"
namespace aux {
// Only the authenticated runtime host may supply this original native guard.
// One outstanding operation owns all masks until their same-document cleanup.
class NativePersonCaptureController final : public content::WebContentsObserver,
    public content::WebContentsUserData<NativePersonCaptureController> {
 public:
  using Reply = base::OnceCallback<void(base::DictValue)>;
  ~NativePersonCaptureController() override;
  void Capture(base::DictValue identity, base::RepeatingCallback<bool()> current, Reply reply);
  void Retire();
  base::WeakPtr<NativePersonCaptureController> GetWeakPtr() { return weak_factory_.GetWeakPtr(); }
 private:
  friend class NativePersonCaptureControllerTestPeer;
  friend class content::WebContentsUserData<NativePersonCaptureController>;
  explicit NativePersonCaptureController(content::WebContents* contents);
  bool Current();
  void Dispatch(const std::string& phase);
  void ScriptDone(std::string phase, size_t index, bool accepted);
  void Paint();
  void PaintRoot();
  void Submitted(size_t index, base::WeakPtr<content::RenderWidgetHostImpl> widget, uint32_t token);
  void Activated(size_t index, base::WeakPtr<content::RenderWidgetHostImpl> widget, uint32_t token, base::TimeTicks time);
  void Painted(bool accepted);
  void Copy();
  void Copied(const content::CopyFromSurfaceResult& result);
  void Cleanup();
  void Deadline();
  void Finish();
  void WebContentsDestroyed() override;
  std::vector<content::WeakDocumentPtr> frames_;
  std::vector<viz::SurfaceId> surfaces_;
  std::vector<uint32_t> submission_tokens_;
  std::vector<gfx::Size> widget_viewports_;
  std::vector<gfx::Size> widget_pixel_viewports_;
  std::vector<base::WeakPtr<content::RenderWidgetHostImpl>> widgets_;
  std::string capture_id_;
  base::DictValue identity_;
  base::RepeatingCallback<bool()> current_;
  Reply reply_;
  size_t pending_ = 0;
  bool failed_ = false;
  bool cleanup_debt_ = false;
  bool restoring_ = false;
  bool root_submission_ = false;
  std::string png_;
  int width_ = 0, height_ = 0;
  int viewport_width_ = 0, viewport_height_ = 0;
  gfx::Size viewport_pixels_;
  double scale_ = 0;
  base::OneShotTimer deadline_;
  base::WeakPtrFactory<NativePersonCaptureController> weak_factory_{this};
  WEB_CONTENTS_USER_DATA_KEY_DECL();
};
}
#endif
