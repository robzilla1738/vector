// NOT RUN until an Aux-built PDFium-linked module exists. Original addon refused.
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const [modulePath,expectedHash]=process.argv.slice(2);
assert(modulePath?.endsWith('.node') && /^[a-f0-9]{64}$/.test(expectedHash??''),'Supply Aux module path and reviewed SHA256');
const actual=createHash('sha256').update(await readFile(modulePath)).digest('hex');
assert.equal(actual,expectedHash);
assert.notEqual(actual,'bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb','Original addon execution forbidden');
const {pdf}=createRequire(import.meta.url)(path.resolve(modulePath));
assert.deepEqual(Object.keys(pdf).sort(),['extractText','fillFormFields','getFormFields','merge','renderPages','rotate','split'].sort());
function encodePdf(objects){let body='%PDF-1.7\n',offsets=[0];for(let i=0;i<objects.length;++i){offsets.push(Buffer.byteLength(body));body+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`;}const xref=Buffer.byteLength(body);return body+`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;}
const directory=await mkdtemp(path.join(tmpdir(),'aux-pdf-four-'));
try {
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Resources << /Font << /F1 7 0 R >> >> /Contents 4 0 R >>',null,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Resources << /Font << /F1 7 0 R >> >> /Contents 6 0 R >>',null,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
 for(const [index,text] of [[3,'Aux First'],[5,'Aux Second']]){const stream=`BT /F1 12 Tf 20 250 Td (${text}) Tj ET\n`;objects[index]=`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`;}
 let body='%PDF-1.7\n',offsets=[0];
 for(let i=0;i<objects.length;++i){offsets.push(Buffer.byteLength(body));body+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`;}
 const xref=Buffer.byteLength(body);body+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
 const input=path.join(directory,'input.pdf');await (await import('node:fs/promises')).writeFile(input,body);
 const text=pdf.extractText({filePath:input,pages:[2,1,2]});assert.equal(text.then,undefined);assert.equal(text.pageCount,2);assert.deepEqual(text.pages.map(p=>p.page),[2,1,2]);assert.match(text.pages[0].text,/Aux Second/);assert.match(text.pages[1].text,/Aux First/);
 const merged=path.join(directory,'nested','merged.pdf');assert.equal(pdf.merge({files:[{filePath:input,pages:[2,1,2]}],outputPath:merged}).pageCount,3);assert.match(pdf.extractText({filePath:merged}).pages[2].text,/Aux Second/);
 const rotated=path.join(directory,'rotated.pdf');assert.deepEqual(pdf.rotate({filePath:input,outputPath:rotated,degrees:-90,pages:[2,1]}).pages,[2,1]);assert.equal(pdf.extractText({filePath:rotated}).pageCount,2);
 const split=pdf.split({filePath:input,outputDir:path.join(directory,'split'),pages:[2]});assert.equal(split.pageCount,2);assert.equal(path.basename(split.pages[0].path),'page_002.pdf');assert.equal(pdf.extractText({filePath:split.pages[0].path}).pageCount,1);
 assert.throws(()=>pdf.extractText(),/PDF operation requires an input object/);assert.throws(()=>pdf.extractText({filePath:input,pages:[]}),/pages must not be empty/);assert.throws(()=>pdf.rotate({filePath:input,outputPath:rotated,degrees:0}),/degrees must be/);
 const plainFields=pdf.getFormFields({filePath:input});assert.equal(plainFields.hasFormFields,false);assert.equal(plainFields.fieldCount,0);assert.equal(plainFields.formType,'none');assert.equal(plainFields.supportsXfa,false);
 const rendered=pdf.renderPages({filePath:input,outputDir:path.join(directory,'png'),pages:[2],maxDimension:256});assert.deepEqual(rendered.pages.map(p=>[p.page,p.width,p.height]),[[2,256,256]]);const png=await readFile(rendered.pages[0].path);assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(png.readUInt32BE(16),256);assert.equal(png[25],6);
 assert.throws(()=>pdf.renderPages({filePath:input,outputDir:directory,maxDimension:255}),/maxDimension must be/);
 const missing=pdf.fillFormFields({filePath:input,outputPath:path.join(directory,'missing.pdf'),fields:[{field_id:'missing',value:'x'}]});assert.equal(missing.success,false);assert.deepEqual(missing.missingFields,['missing']);assert.deepEqual(missing.invalidFields,[]);
 assert.throws(()=>pdf.fillFormFields({filePath:input,outputPath:path.join(directory,'empty.pdf'),fields:[]}),/No field values provided/);
 const form=path.join(directory,'form.pdf');await writeFile(form,encodePdf([
  '<< /Type /Catalog /Pages 2 0 R /AcroForm 6 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Annots [4 0 R] /Resources << /Font << /Helv 5 0 R >> >> >>',
  '<< /Type /Annot /Subtype /Widget /FT /Tx /T (aux_text) /TU (Aux description) /V (Before) /Rect [20 200 220 230] /P 3 0 R /F 4 /DA (/Helv 12 Tf 0 g) >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','<< /Fields [4 0 R] /DR << /Font << /Helv 5 0 R >> >> /DA (/Helv 12 Tf 0 g) /NeedAppearances true >>']));
 const fields=pdf.getFormFields({filePath:form});assert.equal(fields.formType,'acroform');assert.equal(fields.fieldCount,1);assert.equal(fields.fields[0].field_id,'aux_text');assert.equal(fields.fields[0].type,'text');assert.equal(fields.fields[0].value,'Before');assert.equal(fields.fields[0].description,'Aux description');assert.deepEqual(fields.fields[0].bounds,{x:20,y:200,width:200,height:30});
 const filledPath=path.join(directory,'filled.pdf'),filled=pdf.fillFormFields({filePath:form,outputPath:filledPath,fields:[{name:'aux_text',value:'ignored duplicate'},{field_id:'aux_text',value:'After Aux'}]});assert.equal(filled.success,true);assert.equal(filled.filledCount,1);assert.deepEqual(filled.filledFields,['aux_text']);assert.equal(pdf.getFormFields({filePath:filledPath}).fields[0].value,'After Aux');
 console.log('Aux PDF7 actual-engine synthetic fixture passed');
} finally {await rm(directory,{recursive:true,force:true});}
