import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {inflateSync} from 'node:zlib';
import path from 'node:path';
import {tmpdir} from 'node:os';
const [modulePath,hash]=process.argv.slice(2);
assert.equal(hash,'6febb242a074317dba3edc1848fdfb77da468e32bb87acffdaa7f6143afece8e');
assert.equal(createHash('sha256').update(await readFile(modulePath)).digest('hex'),hash);
const {pdf}=createRequire(import.meta.url)(path.resolve(modulePath));
function stream(body,extra=''){return `<< /Length ${Buffer.byteLength(body)} ${extra} >>\nstream\n${body}endstream`;}
function encode(objects){let text='%PDF-1.7\n',offsets=[];for(const [i,o] of objects.entries()){offsets.push(Buffer.byteLength(text));text+=`${i+1} 0 obj\n${o}\nendobj\n`;}const start=Buffer.byteLength(text);return text+`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;}
async function image(file){const b=await readFile(file),chunks=[];let at=8;while(at<b.length){const n=b.readUInt32BE(at),type=b.toString('ascii',at+4,at+8);if(type==='IDAT')chunks.push(b.subarray(at+8,at+8+n));at+=n+12;}const w=b.readUInt32BE(16),h=b.readUInt32BE(20),raw=inflateSync(Buffer.concat(chunks));assert.equal(raw.length,(w*4+1)*h);for(let y=0;y<h;++y)assert.equal(raw[y*(w*4+1)],0);return {w,h,pixel(x,y){const i=y*(w*4+1)+1+x*4;return [...raw.subarray(i,i+4)];}};}
const d=await mkdtemp(path.join(tmpdir(),'aux-pdf-specialized-'));
try {
 const input=path.join(d,'controls.pdf');await writeFile(input,encode([
  '<< /Type /Catalog /Pages 2 0 R /AcroForm 9 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 300] /Resources << /Font << /Helv 10 0 R >> >> /Contents 11 0 R /Annots [4 0 R 5 0 R 6 0 R 7 0 R] >>',
  '<< /Type /Annot /Subtype /Widget /FT /Btn /T (check) /V /Off /AS /Off /Rect [20 220 40 240] /P 3 0 R /F 4 /AP << /N << /Off 12 0 R /Yes 13 0 R >> >> >>',
  '<< /Type /Annot /Subtype /Widget /FT /Ch /T (choice) /V (Red) /I [0] /Opt [(Red) (Green) (Blue)] /Rect [70 190 170 260] /P 3 0 R /F 4 /DA (/Helv 12 Tf 0 g) >>',
  '<< /Type /Annot /Subtype /Widget /Parent 8 0 R /AS /Off /Rect [200 220 220 240] /P 3 0 R /F 4 /AP << /N << /Off 12 0 R /A 13 0 R >> >> >>',
  '<< /Type /Annot /Subtype /Widget /Parent 8 0 R /AS /Off /Rect [230 220 250 240] /P 3 0 R /F 4 /AP << /N << /Off 12 0 R /B 13 0 R >> >> >>',
  '<< /FT /Btn /Ff 32768 /T (radio) /V /Off /Kids [6 0 R 7 0 R] >>',
  '<< /Fields [4 0 R 5 0 R 8 0 R] /DR << /Font << /Helv 10 0 R >> >> /DA (/Helv 12 Tf 0 g) /NeedAppearances true >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  stream('1 0 0 rg 20 20 60 30 re f\n'),
  stream('1 1 1 rg 0 0 20 20 re f 0 0 0 RG 1 w 0.5 0.5 19 19 re S\n','/Type /XObject /Subtype /Form /BBox [0 0 20 20] /Resources << >>'),
  stream('1 0 0 rg 0 0 20 20 re f\n','/Type /XObject /Subtype /Form /BBox [0 0 20 20] /Resources << >>')
 ]));
 const initial=pdf.getFormFields({filePath:input});assert.deepEqual(initial.fields.map(f=>[f.name,f.type]),[['check','checkbox'],['radio','radio'],['radio','radio'],['choice','choice']]);
 assert.deepEqual(initial.fields.find(f=>f.name==='choice').options,['Red','Green','Blue']);assert.deepEqual(initial.fields.filter(f=>f.name==='radio').map(f=>f.export_value),['A','B']);
 const before=await image(pdf.renderPages({filePath:input,outputDir:path.join(d,'before'),maxDimension:400}).pages[0].path);
 assert.deepEqual(before.pixel(30,70),[255,255,255,255]);assert.deepEqual(before.pixel(240,70),[255,255,255,255]);
 const filledPath=path.join(d,'filled.pdf'),fill=pdf.fillFormFields({filePath:input,outputPath:filledPath,fields:[{field_id:'check',value:true},{field_id:'choice',value:'Green'},{field_id:'radio',value:'B'}]});
 assert.equal(fill.success,true,JSON.stringify(fill));assert.deepEqual(fill.filledFields,['check','choice','radio']);assert.deepEqual(fill.invalidFields,[]);
 const filled=pdf.getFormFields({filePath:filledPath});assert.equal(filled.fields.find(f=>f.name==='check').value,'Yes');assert.equal(filled.fields.find(f=>f.name==='choice').value,'Green');assert(filled.fields.filter(f=>f.name==='radio').every(f=>f.value==='B'));
 const after=await image(pdf.renderPages({filePath:filledPath,outputDir:path.join(d,'after'),maxDimension:400}).pages[0].path);
 assert.deepEqual(after.pixel(30,70),[0,0,0,255]);assert.deepEqual(after.pixel(210,70),[255,255,255,255]);assert.deepEqual(after.pixel(240,70),[0,0,0,255]);
 const invalid=pdf.fillFormFields({filePath:filledPath,outputPath:path.join(d,'invalid.pdf'),fields:[{field_id:'choice',value:'No option'},{field_id:'check',value:'No export'},{field_id:'radio',value:3}]});
 assert.equal(invalid.success,false);assert.deepEqual(invalid.invalidFields,[{field_id:'check',message:'Value does not match the checkbox export value'},{field_id:'choice',message:'Value does not match a choice option'},{field_id:'radio',message:'Radio fields require an export value string'}]);
 const rotated=path.join(d,'rotated.pdf');pdf.rotate({filePath:input,outputPath:rotated,degrees:90});const rotatedImage=await image(pdf.renderPages({filePath:rotated,outputDir:path.join(d,'rotate'),maxDimension:400}).pages[0].path);
 assert.deepEqual([rotatedImage.w,rotatedImage.h],[300,400]);assert.deepEqual(rotatedImage.pixel(35,50),[255,0,0,255]);assert.deepEqual(rotatedImage.pixel(250,350),[255,255,255,255]);
 console.log(JSON.stringify({passed:true,checks:['checkbox-export-toggle-saved-readback','choice-options-navigation-saved-readback','radio-sibling-export-selection-saved-readback','invalid-control-value-contracts','widget-appearance-before-after-RGBA','clockwise-rotation-dimensions-and-red-marker-position'],moduleSha256:hash}));
} finally {await rm(d,{recursive:true,force:true});}
