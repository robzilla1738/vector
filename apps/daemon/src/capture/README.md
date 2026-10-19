# User capture boundary

Independent implementation of `docs/spec/daemon/services.md` Capture and
`docs/spec/ui/utilities.md` Capture, with intrinsic constraints from
`docs/spec/ui/visual-measurements.md` M5/M6. The following receipt and size limits
are Aux design decisions, not recovered reference schemas.

`capture.viewport`, `fullPage`, `region` and `screen` are authenticated mutations.
Each takes accountId/profileId/browserMode/targetId/documentId/documentUrl;
region additionally takes viewport CSS-pixel x/y/width/height. Document identity
is the actual CDP frame ID plus committed loader ID. Results contain PNG base64,
MIME type and actual IHDR pixel dimensions. No result is sent to an agent or
automatically saved to persistent account storage.

The daemon requires the current onboarded, initialized and unlocked account and
its actual profile binding. The extension verifies native account/profile/mode,
current/unlocked state and the exact target/document before and after capture.
Lock, account removal and shutdown invalidate pending results. Only one capture
per account runs at a time. Whole-page uses actual content dimensions and
captureBeyondViewport; viewport and region use visual-viewport dimensions and
document offsets. Maximum dimension is16384 CSS pixels, maximum output is40M
pixels/24MiB PNG. Oversized pages fail explicitly rather than silently truncating.

Screen capture uses the existing helper's Screen Recording preflight. It never
requests or grants permission. The daemon reads only its exact owner-only,
non-symlink, single-link screenshot artifact in the private helper directory and
removes that transient artifact after reading. Cancellation discards an in-flight
helper result; it does not retire the shared Vault helper or assume the OS call
was rolled back.

The page context menu opens original closed-shadow controls. A five-minute,
in-memory nonce binds subsequent top-frame requests to that captured target.
Navigation/close retires the receipt. Region capture requires an explicit drag;
Escape dismisses/cancels without applying a partial result. Controls hide before
capture. Retake, real PNG clipboard write, browser save dialog and dismiss are
explicit actions. Download acknowledgement says started, not completed. Image
object URLs are revoked on retake/dismiss; pixels are never logged.

Focused synthetic daemon/extension checks cover scope refusal, invalidation
during capture, distinct full-page/viewport/region geometry and stale documents.
They do not establish actual browser output, clipboard/download outcomes, OS
permission eligibility, native overlay placement or reference visual parity.
