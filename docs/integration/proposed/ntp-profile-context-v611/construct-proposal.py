from pathlib import Path
import hashlib,json,difflib
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');out=Path(__file__).resolve().parent
rel='chrome/browser/extensions/api/aux_account/aux_account_api.cc';s=(root/rel).read_text();t=s
edits=[('''    if (args().size() > 1 || (!args().empty() && !args()[0].is_int()))
      return RespondNow(Error("Optional draft tab ID must be an integer"));''','''    // Extension bindings may normalize an omitted optional argument to null.
    const bool has_draft_tab_id = !args().empty() && !args()[0].is_none();
    if (args().size() > 1 || (has_draft_tab_id && !args()[0].is_int()))
      return RespondNow(Error("Optional draft tab ID must be an integer"));'''),
('''    if (!args().empty() && profile()->IsRegularProfile() &&''','''    if (has_draft_tab_id && profile()->IsRegularProfile() &&''')]
for a,b in edits:
 assert t.count(a)==1,(a,t.count(a));t=t.replace(a,b)
p=out/'sources'/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(t)
(out/'native.patch').write_text(''.join(difflib.unified_diff(s.splitlines(True),t.splitlines(True),fromfile='a/'+rel,tofile='b/'+rel)))
(out/'files.json').write_text(json.dumps({'baseComposition':'v611','files':[{'path':rel,'baselineSha256':hashlib.sha256(s.encode()).hexdigest(),'outputSha256':hashlib.sha256(t.encode()).hexdigest()}],'edits':[{'count':1,'anchorSha256':hashlib.sha256(a.encode()).hexdigest()} for a,b in edits]},indent=2)+'\n')
