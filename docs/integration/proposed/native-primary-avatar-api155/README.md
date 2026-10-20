# Actual266 avatar compiler correction

Apply after00fcf834d/avatar266. Region-only267 is disjoint. The actual155 sidebar compilation rejects assigning the const constructor-cached `source_icon_` in SetProfileAvatar. The assignment is redundant: this method is given the same ImageModel passed to the row constructor; the actual ImageView separately owns its copied model, and `preserve_source_image_` already suppresses cached generic vector recoloring for profile rows.

Remove only that assignment. Preserve the const cached model, actual `icon_view_->SetImage(image)`, monogram/image visibility, source-image color behavior and the real renderer capture. No const_cast, mutable cache or new fallback is introduced. Renderer itself already compiled successfully in actual266.

The exact diagnostic, baseline/output hashes and one counted anchor are retained. `verify.py` checks the retained ImageView/model/color branches and a disposable one-file replay. No shared write, build, launch, signing or OS action was performed; actual sidebar recompilation remains the integrator's check.
