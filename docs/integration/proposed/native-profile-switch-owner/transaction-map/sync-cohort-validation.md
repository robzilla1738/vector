# Cohort uniqueness followup

Apply after the exact 500ed64f1 output. CanPrepare now rejects duplicate actual group IDs across cohort models before calling any non-nestable PauseTracking. CanFinish additionally verifies the real SavedTabGroupUtils global lookup resolves that exact final model/profile before stock ResumeTracking uses the same lookup. This enforces the original utility's actual global group identity assumption rather than inferring it. The tab-handle membership lookup uses C++20 ranges::find instead of requiring the newer ranges::contains API.

One-source isolated staged replay and output SHA check passed. This is uncompiled and does not alter shared native sources or enable a UI trigger. All no-yield, real lifetime, complete-cohort and explicit finish/abort constraints remain.
