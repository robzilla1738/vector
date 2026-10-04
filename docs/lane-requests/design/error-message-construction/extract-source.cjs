const ts=require('/private/tmp/aux-design-error-message-construction/node_modules/typescript');
const fs=require('fs'),path=require('path');const root='/private/tmp/aux-design-error-message-construction';
const config=ts.readConfigFile(root+'/apps/shell/tsconfig.json',ts.sys.readFile);const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,path.dirname(root+'/apps/shell/tsconfig.json'));
const program=ts.createProgram(parsed.fileNames,parsed.options),checker=program.getTypeChecker();const audit=[];
const excluded=new Set(['CommandBar.tsx','HomeAsk.tsx','Conversation.tsx','HomeEntryControls.tsx']);
function globalBuiltIn(node){const s=checker.getSymbolAtLocation(node);return s&&s.declarations?.length&&s.declarations.every(d=>/[/\\]typescript[/\\]lib[/\\]lib\..*\.d\.ts$/.test(d.getSourceFile().fileName));}
for(const sf of program.getSourceFiles()){
 if(!sf.fileName.startsWith(root+'/apps/shell/src/')||/\.(test|spec)\./.test(sf.fileName)||sf.isDeclarationFile||excluded.has(path.basename(sf.fileName)))continue;
 const spans=[];function visit(n){
 if(ts.isConditionalExpression(n)){const c=n.condition,t=n.whenTrue,f=n.whenFalse;
 if(ts.isBinaryExpression(c)&&c.operatorToken.kind===ts.SyntaxKind.InstanceOfKeyword&&ts.isIdentifier(c.left)&&ts.isIdentifier(c.right)&&c.right.text==='Error'&&ts.isPropertyAccessExpression(t)&&ts.isIdentifier(t.expression)&&t.expression.text===c.left.text&&t.name.text==='message'&&ts.isCallExpression(f)&&ts.isIdentifier(f.expression)&&f.expression.text==='String'&&f.arguments.length===1&&ts.isIdentifier(f.arguments[0])&&f.arguments[0].text===c.left.text&&globalBuiltIn(c.right)&&globalBuiltIn(f.expression))spans.push({start:n.getStart(sf),end:n.end,old:n.getText(sf),replacement:`errorMessage(${c.left.text})`});
 }ts.forEachChild(n,visit);
 }visit(sf);if(!spans.length)continue;
 if(/\berrorMessage\b/.test(sf.text))throw Error('name collision '+sf.fileName);
 let result=sf.text;for(const x of spans.toReversed())result=result.slice(0,x.start)+x.replacement+result.slice(x.end);
 let imp=path.relative(path.dirname(sf.fileName),root+'/apps/shell/src/error-message').replaceAll('\\','/');if(!imp.startsWith('.'))imp='./'+imp;
 const prefix=`import { errorMessage } from ${JSON.stringify(imp)};\n`;result=prefix+result;
 fs.writeFileSync(sf.fileName,result);audit.push({path:path.relative(root,sf.fileName),prefix,spans});
}
fs.writeFileSync('/tmp/aux-error-message-span-audit.json',JSON.stringify(audit,null,2));console.log(audit.length,'files',audit.reduce((s,f)=>s+f.spans.length,0),'expressions');
