# Explicit directional tab-row split targets

Static audit found a concrete mismatch with frozen roadmap §3.5: the organization row center silently created a split, with Shift selecting vertical layout. This overlay preserves ordinary center reordering/folder grouping and adds transient directional feedback at the left, right, top and bottom row edges. The chosen axis and leading/trailing placement reach the existing real `JoinNativeSplit` path; no WebContents is fabricated or moved across profiles/windows.

Five owned source changes, based on the newest integrator controller (including its newer lifecycle changes), with counted overlay and hashes. Existing idle row metrics/colors/layout remain unchanged. No additional tests or browser actions: patch replay is structural evidence; actual mouse/trackpad/accessibility behavior and native compilation remain acceptance gates.
