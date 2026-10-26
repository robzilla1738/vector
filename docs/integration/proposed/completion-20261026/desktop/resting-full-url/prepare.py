"""Counted resting URL preference join; never projects/builds."""
from pathlib import Path
import difflib,hashlib,json
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
NAME='chrome/browser/ui/views/location_bar/location_bar_view.cc'
old='''                 : url_formatter::FormatUrlForSecurityDisplay(
                       contents->GetLastCommittedURL(),
                       url_formatter::SchemeDisplay::OMIT_HTTP_AND_HTTPS))'''
new='''                 : GetLocationBarModel()->ShouldPreventElision()
                       ? GetLocationBarModel()->GetURLForDisplay()
                       : url_formatter::FormatUrlForSecurityDisplay(
                             contents->GetLastCommittedURL(),
                             url_formatter::SchemeDisplay::OMIT_HTTP_AND_HTTPS))'''
baseline=HERE/'baseline'/NAME;source=HERE/'source'/NAME
if not baseline.exists():
 baseline.parent.mkdir(parents=True,exist_ok=True);baseline.write_bytes((ROOT/NAME).read_bytes())
before=baseline.read_text();assert before.count(old)==1
after=before.replace(old,new);source.parent.mkdir(parents=True,exist_ok=True);source.write_text(after)
(HERE/'native.patch').write_text(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+NAME,tofile='b/'+NAME)))
(HERE/'source-plan.json').write_text(json.dumps({'projected':False,'compiled':False,'files':[{'path':NAME,'beforeSha256':hashlib.sha256(before.encode()).hexdigest(),'afterSha256':hashlib.sha256(after.encode()).hexdigest(),'anchors':1}]},indent=2)+'\n')
print('One resting pill formatting anchor; no projection.')
