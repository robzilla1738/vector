from pathlib import Path
import hashlib,json,re
R=Path.cwd();P=Path(__file__).resolve().parent;sha=lambda b:hashlib.sha256(b).hexdigest();plan=json.loads((P/'source-plan.json').read_text())
f=plan['files'][0];original=Path(f['inputPath']).read_bytes();assert sha(original)==f['inputSha256'];applied=original.decode()
for anchor in f['anchors']:
 assert applied.count(anchor['find'])==anchor['count'];applied=applied.replace(anchor['find'],anchor['replace'],1)
assert sha(applied.encode())==f['outputSha256']==sha((R/f['source']).read_bytes())
for pin in json.loads((P/'upstream-ownership-pins.json').read_text()):assert sha((Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')/pin['path']).read_bytes())==pin['sha256']
# Actual style calls and values must be byte-identical; lifecycle-only change.
style=re.compile(r'^.*(?:set_margins|set_fixed_width|SetButtons|SetShowCloseButton|SetAccessibleTitle|SetBackground|SetBorder|SetLabelFont|SetTooltipText|SetImageModel|SetFontList|SetElideBehavior|SetLayoutManager|SetImageSize|SetImageLabelSpacing|SetEnabledTextColors|SetHorizontalAlignment|SetCaptionStyle|CreateRoundedRect|kProfileMenuWidth).*$' ,re.M)
assert style.findall(original.decode())==style.findall(applied)
# Exactly four previously released delegates now have actual ordinary owners.
assert applied.count('CreateOwnedAuxProfilePopup(std::move(menu))')==2
assert applied.count('CreateOwnedAuxProfilePopup(std::move(popup))')==1
assert applied.count('CreateOwnedPrimaryProfileMenu(browser, std::move(menu))')==2
assert applied.count('DestroyAuxProfilePopup(profile_actions_.get())')==1
assert applied.count('DestroyAuxProfilePopup(profile_actions.get())')==1
assert applied.count('DestroyAuxProfilePopup(icons_.get())')==1
assert 'widget->MakeCloseSynchronous(base::BindOnce(\n      &RetireOwnedAuxProfilePopup, widget));' in applied
owner=applied[applied.index('struct OwnedPrimaryProfileMenu {'):applied.index('using OwnedPrimaryProfileMenus =')]
assert owner.index('widget.reset();')<owner.index('delegate.reset();')
retire=applied[applied.index('void RetireAuxProfileMenu('):applied.index('void TrackAuxProfileMenu(')]
assert '#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)' in retire and 'widget->Close();' in retire
# Real pending action/profile-source fences are unchanged.
for text in ['source_epoch_', 'base::BindOnce(&RunProfileMenuAction, browser_, source_, source_epoch_', 'base::BindOnce(&RunProfileMenuAction, sender_, source_, source_epoch_', 'base::BindOnce(&DispatchSelectedProfile,', 'aux::GetProfileCookieBindingEpoch(source.get()) == epoch']:
 assert original.decode().count(text)==applied.count(text)
report={'format':'aux.popup-lifetime-source-check.v1','countedAnchors':len(f['anchors']),'exactPatchAndOwnershipSourcePins':True,'styleCallsAndValuesByteIdentical':True,'ordinaryOwnedSites':4,'widgetBeforeDelegateDestruction':True,'profileEpochAndDispatchFencesUnchanged':True,'nativeCompiled':False,'nativeExecuted':False,'fixtureExecutableCreated':False}
(P/'focused-check.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
