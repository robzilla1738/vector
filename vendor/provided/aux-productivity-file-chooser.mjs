// Native chooser results only. Do not expose a renderer-supplied path API.
export function transformAuxFileChooser({relative,text}) {
 const anchors=[];
 if((relative==='chrome/browser/file_select_helper.h'||relative==='chrome/browser/file_select_helper.cc')&&text.includes('aux_chooser_document_'))throw Error('Native chooser source already adapted');
 const change=(find,replace,kind)=>{const count=text.split(find).length-1;if(count!==1)throw Error(`${kind}: expected one anchor, got ${count}`);anchors.push({kind,find,replace,count:1});text=text.replace(find,replace)};
 if(relative==='chrome/browser/file_select_helper.h'){
  change('#include "content/public/browser/web_contents_observer.h"','#include "content/public/browser/web_contents_observer.h"\n#include "content/public/browser/weak_document_ptr.h"','aux-native-chooser-document-include');
  change('  raw_ptr<content::RenderFrameHost> render_frame_host_;','  raw_ptr<content::RenderFrameHost> render_frame_host_;\n  content::WeakDocumentPtr aux_chooser_document_;','aux-native-chooser-document');
 }
 if(relative==='chrome/browser/file_select_helper.cc'){
  change('#include "chrome/browser/file_select_helper.h"','#include "chrome/browser/file_select_helper.h"\n#include "chrome/browser/ui/aux_chosen_files_service.h"','aux-native-chooser-service');
  change('  render_frame_host_ = render_frame_host;\n  web_contents_ = WebContents::FromRenderFrameHost(render_frame_host);','  render_frame_host_ = render_frame_host;\n  aux_chooser_document_ = render_frame_host->GetWeakDocumentPtr();\n  web_contents_ = WebContents::FromRenderFrameHost(render_frame_host);','aux-native-chooser-capture-starting-document');
  change('  listener_->FileSelected(std::move(list), base_dir_, dialog_mode_);','  aux::files::RegisterChosenFiles(aux_chooser_document_, dialog_mode_, list);\n  listener_->FileSelected(std::move(list), base_dir_, dialog_mode_);','aux-native-chooser-policy-accepted-results');
 }
 return {text,anchors};
}
