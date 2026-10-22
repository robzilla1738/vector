const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.dirname(path.dirname(process.execPath));
const modulePath=path.join(root,'Resources/native/aux-pdf.node');
const scenario=process.argv[2];
let pdf;
if(scenario==='current'||scenario==='legacy')pdf=require(modulePath).pdf;
const consumer=require(path.join(root,'Resources/native/consumer.node'));
assert.equal(consumer.capture(),scenario==='legacy'?2:scenario==='current'?1:0);
assert.equal(consumer.inspect(),undefined); // No per-env cleanup closure.
if(scenario==='legacy'){assert.equal(consumer.close(),3);assert.equal(consumer.retained(),1);console.log('PASS old reviewed v2 module stays untracked without calling missing exports');process.exit(0);}
if(scenario==='late'){require(modulePath);assert.equal(consumer.close(),3);assert.equal(consumer.retained(),1);console.log('PASS late image introduction stays untracked');process.exit(0);}
if(scenario==='absent') {
 assert.equal(consumer.close(),0);
 console.log('PASS absent image compatibility');process.exit(0);
}
// Actual PDF operation's getter reenters native host consumer while its real
// operation lease is active, requiring pending rather than manufactured drain.
let seen=false;
const input={get filePath(){seen=true;assert.equal(consumer.close(),2);assert.equal(consumer.retained(),1);return path.join(root,'Resources/synthetic.pdf');}};
assert.match(pdf.extractText(input).pages[0].text,/Aux PDF Host Consumer/);
assert.equal(seen,true);assert.equal(consumer.inspect(),1);assert.equal(consumer.close(),1);assert.equal(consumer.retained(),0);
for(const operation of Object.values(pdf))assert.throws(()=>operation({}),/Native PDF admission is closed/);
console.log('PASS actual reviewed loaded image pending/drain and permanent closure');
