# Native top-control caption allowance: preserve current geometry

Evidence-only finding after the actual v397 windowed/incognito screenshot. **No frame, button offset or visibility patch is justified by this comparison.** The original writer and leading-coordinate predicate support the current caption allowance. Root retains actual native401 unchanged.

## Positive supplied source

Pinned arm64 SHA `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`; exact original instruction ranges/listing hashes are in `source-evidence.json`.

- `45e87b4..45e87e0` obtains actual toolbar and vertical-region rectangles through the same real proposed-layout lookup (`c5e7b34`), with optional-result checks. No screenshot coordinate enters this path.
- `45e8808..45e8858` derives the toolbar-height allowance from actual rectangles and the horizontal allowance as **ceil(the original layout-parameter float at +10) minus the actual vertical-region X**. The same field is the leading-exclusion width used by current155's typed layout producer; the raw source arithmetic is retained without assigning a new meaning to a numeric offset alone.
- `45e885c..45e88a0` reads the actual region's retained latch `+a0c`, forces both allowances to zero only when retained, clamps negatives to zero, and writes the horizontal value through actual region `+590` to top-container **+3ac**. It is not a fixed inset and not a Browser/Agent/profile-account test.
- `3479924..3479960` reads that same +3ac for the expanded leading coordinate, except the original wrapped/exiting branch supplies zero. This is the coordinate sequence used by the real Collapse360 emission pinned in the preceding `native-sidebar-top-controls` proposal.
- `463fde0..463fe48` independently confirms the actual retained-state reset: region+a0c causes genuine top-container toolbar/caption allowances to clear, with the original layout invalidation. Current real retention owner already preserves that distinction.

## Current typed155 correspondence

The retained excerpts pin actual `BrowserViewTabbedLayoutImpl` computing:

```
caption_button_width = ceil(browser_params.leading_exclusion.content.width())
                       - tabstrip_bounds.x();
SetCaptionButtonWidthForLayout(max(0, caption_button_width));
```

The actual top container uses zero during retained presentation and otherwise this allowance, then the same expanded `wrapped || exiting ? 0 : caption_width` leading coordinate. Current Mac frame code separately clears caption widths during actual fullscreen because caption controls move to their real overlay pane; windowed traffic lights retain the real caption exclusion. Those typed155 excerpts are integration evidence, not mislabeled original binary bytes or proof of a particular historical capture's fullscreen state.

## Scope of conclusion

The v397 capture visibly has traffic lights and a windowed incognito identity. The historical reference146 capture has different visible titlebar controls, but its exact fullscreen/titlebar/profile mode is not proven. Navigation controls in v397 begin to the right of the sidebar; a full-width caption/background strip does not by itself prove that the entire toolbar/vertical-region coordinate producer is wrong.

Therefore the observed leading inset does not justify a guessed zero caption allowance, hardcoded negative offset, global frame rewrite or changing profile/incognito gates. Browser/Agent screenshot icon identity and complete top-row visual parity remain unresolved. A useful next runtime comparison must first match actual fullscreen/titlebar and profile mode. This investigation does not claim full frame equivalence, infer screenshot state, or accept global visual parity.

Verification: `python3 docs/integration/proposed/native-top-caption-state/verify.py` checks three immutable original range listings and the retained actual API excerpts. No new native patch, shared write, build, launch, owner profile/data access, grant or signing occurred. REA was not opened for this investigation.
