// Reuse Chromium's media-session action, including site policy and user gesture.
#include "chrome/browser/ui/aux_media_commands.h"
#include <algorithm>
#include "content/public/browser/media_session.h"
#include "content/public/browser/web_contents.h"
#include "services/media_session/public/mojom/media_session.mojom.h"
namespace {
bool Supports(content::WebContents* contents,
              media_session::mojom::MediaSessionAction action) {
  auto* session = contents ? content::MediaSession::GetIfExists(contents) : nullptr;
  if (!session || contents->IsBeingDestroyed()) return false;
  const auto actions = session->GetMediaSessionActionsSync();
  return std::ranges::find(actions, action) != actions.end();
}
}
base::DictValue GetAuxVideoPictureInPictureState(content::WebContents* contents) {
  const bool active = contents && contents->HasPictureInPictureVideo();
  const auto action = active ? media_session::mojom::MediaSessionAction::kExitPictureInPicture
                             : media_session::mojom::MediaSessionAction::kEnterPictureInPicture;
  return base::DictValue().Set("active", active).Set("available", Supports(contents, action));
}
base::DictValue ToggleAuxVideoPictureInPicture(content::WebContents* contents) {
  const auto state = GetAuxVideoPictureInPictureState(contents);
  if (!state.FindBool("available").value_or(false))
    return base::DictValue().Set("success", false).Set("error", "This page has no available picture-in-picture action.");
  auto* session = content::MediaSession::GetIfExists(contents);
  if (state.FindBool("active").value_or(false)) session->ExitPictureInPicture();
  else session->EnterPictureInPicture();
  // Dispatch is confirmed; renderer/media events determine final active state.
  return base::DictValue().Set("success", true).Set("dispatched", true);
}
