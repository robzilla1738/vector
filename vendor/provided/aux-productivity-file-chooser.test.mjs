import test from 'node:test';
import assert from 'node:assert/strict';
import {upstreamChromiumFile} from '../../scripts/lib/aux-chromium.mjs';
import {transformAuxFileChooser} from './aux-productivity-file-chooser.mjs';
test('selected native chooser source is hooked after policy acceptance and binds the starting document',()=>{
 for(const relative of ['chrome/browser/file_select_helper.cc','chrome/browser/file_select_helper.h']){
  const source=upstreamChromiumFile(relative),result=transformAuxFileChooser({relative,text:source});
  assert.equal(result.anchors.length,relative.endsWith('.cc')?3:2);
  if(relative.endsWith('.cc')){
   const notify=result.text.slice(result.text.indexOf('void FileSelectHelper::NotifyListenerAndEnd('),result.text.indexOf('void FileSelectHelper::DeleteTemporaryFiles('));
   assert.ok(notify.indexOf('RegisterChosenFiles')<notify.indexOf('listener_->FileSelected'));
   assert.equal((result.text.match(/RegisterChosenFiles\(/g)??[]).length,1);
   assert.ok(result.text.includes('aux_chooser_document_ = render_frame_host->GetWeakDocumentPtr()'));
  }
  assert.throws(()=>transformAuxFileChooser({relative,text:result.text}),/already adapted/);
 }
});
