from pathlib import Path
import hashlib,json,difflib
root=Path(__file__).resolve().parent
source=(root/'baseline/aux_tab_search_bubble.cc').read_text();text=source;changes=[]
def change(old,new):
 global text
 assert text.count(old)==1,old[:100]
 text=text.replace(old,new);changes.append({'find':old,'replace':new,'count':1})
change('#include <utility>','#include <utility>\n#include <vector>\n#include "chrome/browser/ui/aux_tab_reference_context.h"\n#include "content/public/browser/devtools_agent_host.h"\n#include "content/public/browser/render_frame_host.h"\n#include "content/public/browser/weak_document_ptr.h"')
change('class SearchBrowserBinding :', (root/'source/context-binding.inc').read_text()+'class SearchBrowserBinding :')
change('    proposal_.reset();\n    mode_ = mode;', '    proposal_.reset();\n    context_action_.reset();\n    context_authorized_ = false;\n    context_selected_.clear();\n    mode_ = mode;')
change('    target_ = contents ? contents->GetWeakPtr() : nullptr;', '''    target_ = contents ? contents->GetWeakPtr() : nullptr;
    auto capture = [](content::WebContents* page) {
      return ContextPage{page ? page->GetWeakPtr() : nullptr,
          page && page->GetPrimaryMainFrame() ? page->GetPrimaryMainFrame()->GetWeakDocumentPtr() : content::WeakDocumentPtr()};
    };
    context_active_ = capture(contents);
    auto* strip = owner ? owner->GetTabStripModel() : nullptr;
    if (strip) for (int i = 0; i < strip->count(); ++i)
      if (strip->IsTabSelected(i)) context_selected_.push_back(capture(strip->GetWebContentsAt(i)));''')
change('void Invalidate() { generation_.clear(); target_.reset(); proposal_.reset(); }','void Invalidate() { generation_.clear(); target_.reset(); proposal_.reset(); context_action_.reset(); context_selected_.clear(); context_authorized_ = false; }')
change('  void SetProposal(base::DictValue proposal)', (root/'source/context-methods.inc').read_text()+'  void SetProposal(base::DictValue proposal)')
change('  std::string ask_profile_epoch_;','  std::string ask_profile_epoch_;\n  ContextPage context_active_;\n  std::vector<ContextPage> context_selected_;\n  std::optional<base::DictValue> context_action_;\n  bool context_authorized_ = false;')
change('  result.Set("commands", aux::GetNavigationCommandCatalog(browser));','''  result.Set("commands", aux::GetNavigationCommandCatalog(browser));
  const auto context_page = binding->ContextTargets(false);
  const auto context_selected = binding->ContextTargets(true);
  result.Set("contextActions", base::DictValue()
      .Set("pageAvailable", context_page.has_value())
      .Set("selectedAvailable", context_selected.has_value())
      .Set("selectedCount", context_selected ? static_cast<int>(context_selected->size()) : 0)
      .Set("unavailableReason", "Open a loaded web page or select loaded tabs, then reopen the command bar."));''')
change('  if (*kind == "command") {', (root/'source/context-commit.inc').read_text()+'  if (*kind == "command") {')
(root/'source/aux_tab_search_bubble.cc').write_text(text)
sha=lambda value:hashlib.sha256(value.encode()).hexdigest()
(root/'native-overlay.json').write_text(json.dumps({'path':'chrome/browser/ui/views/frame/aux_tab_search_bubble.cc','predecessor':'palette-ask-v1/source/aux_tab_search_bubble.cc (21bd95bf8 + d32887a05)','inputSha256':sha(source),'outputSha256':sha(text),'changes':changes},indent=2)+'\n')
(root/'native.patch').write_text(''.join(difflib.unified_diff(source.splitlines(True),text.splitlines(True),fromfile='a/chrome/browser/ui/views/frame/aux_tab_search_bubble.cc',tofile='b/chrome/browser/ui/views/frame/aux_tab_search_bubble.cc')))
