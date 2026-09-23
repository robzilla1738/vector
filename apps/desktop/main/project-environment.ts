import {execFile} from 'node:child_process';
import {access,glob,lstat,readFile,realpath} from 'node:fs/promises';
import {join,relative,sep} from 'node:path';
import {promisify} from 'node:util';
import type {ProjectEnvironment,ProjectEnvironmentSuggestion} from '@aux/contracts';

const exec=promisify(execFile);
const manifestLimit=256*1024;
const commandPath=process.env.PATH||'/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin';
const quote=(value:string)=>`'${value.replaceAll("'","'\\''")}'`;

async function kind(path:string):Promise<'file'|'directory'|'other'|'missing'> {
  try{const value=await lstat(path);return value.isFile()?'file':value.isDirectory()?'directory':'other';}catch{return 'missing';}
}
async function exists(path:string){try{await access(path);return true;}catch{return false;}}
async function boundedText(path:string,label:string){
  const info=await lstat(path);
  if(!info.isFile()||info.size>manifestLimit)throw new Error(`${label} must be a regular file no larger than 256 KB.`);
  return readFile(path,'utf8');
}
async function json(path:string):Promise<Record<string,unknown>>{
  const info=await lstat(path);
  if(!info.isFile()||info.size>manifestLimit)throw new Error('package.json must be a regular file no larger than 256 KB.');
  const parsed=JSON.parse(await readFile(path,'utf8')) as unknown;
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('package.json must contain a JSON object.');
  return parsed as Record<string,unknown>;
}
const safeWorkspacePatterns=(values:unknown[])=>values.filter((value):value is string=>typeof value==='string'&&value.length>0&&value.length<=200&&!value.startsWith('/')&&!value.split('/').includes('..')).slice(0,50);
async function pnpmWorkspace(path:string):Promise<string[]>{
  try{
    const info=await lstat(path);if(!info.isFile()||info.size>manifestLimit)return [];
    const lines=(await readFile(path,'utf8')).split(/\r?\n/);const start=lines.findIndex(line=>/^packages\s*:/.test(line.trim()));if(start<0)return [];
    const values:string[]=[];
    for(const line of lines.slice(start+1)){if(line.trim()&&!/^\s+/.test(line))break;const match=/^\s*-\s*['"]?([^'"#]+?)['"]?\s*(?:#.*)?$/.exec(line);if(match)values.push(match[1]!.trim());}
    return safeWorkspacePatterns(values);
  }catch{return [];}
}
async function workspaceManifests(root:string,patterns:string[],manifest:string){
  const rootReal=await realpath(root);const found=new Set<string>();
  for(const pattern of patterns){
    for await(const match of glob(`${pattern.replace(/\/$/,'')}/${manifest}`,{cwd:root})){
      if(found.size>=50)break;if(typeof match!=='string'||match.split('/').some(part=>part==='node_modules'||part==='.git'))continue;
      try{const resolved=await realpath(join(root,match));if(!resolved.startsWith(rootReal+sep))continue;found.add(relative(rootReal,join(resolved,'..')).split(sep).join('/'));}catch{/* Ignore missing and linked-out members. */}
    }
    if(found.size>=50)break;
  }
  return [...found].sort();
}
function cargoMemberPatterns(content:string){
  const workspace=/^\s*\[workspace\]\s*$/m.test(content);if(!workspace)return [];
  const block=/^\s*members\s*=\s*\[([\s\S]*?)\]/m.exec(content)?.[1]??'';const values:string[]=[];
  for(const match of block.matchAll(/["']([^"']+)["']/g))values.push(match[1]!);
  return safeWorkspacePatterns(values);
}
function goWorkspacePaths(content:string){
  const values:string[]=[];let inUse=false;
  for(const raw of content.split(/\r?\n/)){const line=raw.replace(/\/\/.*$/,'').trim();if(!line)continue;if(/^use\s*\($/.test(line)){inUse=true;continue;}if(inUse&&line===')'){inUse=false;continue;}const value=inUse?line:/^use\s+(.+)$/.exec(line)?.[1];if(!value)continue;const clean=value.replace(/^["'`]|["'`]$/g,'').replace(/^\.\//,'');if(clean&&safeWorkspacePatterns([clean]).length)values.push(clean);}
  return [...new Set(values)].slice(0,50);
}
const suggestionIntent=(name:string):ProjectEnvironmentSuggestion['intent']=>name==='dev'||name==='start'?'service':/build|test|check|typecheck|lint/i.test(name)?'check':'run';
async function workspacePackages(root:string,patterns:string[],manager:'npm'|'pnpm'|'yarn'|'bun',changedPaths:string[]){
  const rootReal=await realpath(root);const manifests=new Set<string>();
  for(const pattern of patterns){
    for await(const match of glob(`${pattern.replace(/\/$/,'')}/package.json`,{cwd:root})){
      if(manifests.size>=50)break;if(typeof match!=='string'||match.split('/').some(part=>part==='node_modules'||part==='.git'))continue;
      try{const resolved=await realpath(join(root,match));if(!resolved.startsWith(rootReal+sep))continue;manifests.add(resolved);}catch{/* A missing or unreadable workspace is omitted. */}
    }
    if(manifests.size>=50)break;
  }
  const records:{path:string;name:string;scripts:string[];suggestions:ProjectEnvironmentSuggestion[];dependencyNames:string[]}[]=[];
  for(const manifestPath of [...manifests].sort()){
    try{
      const manifest=await json(manifestPath);const path=relative(rootReal,join(manifestPath,'..')).split(sep).join('/');
      const scripts=manifest.scripts&&typeof manifest.scripts==='object'&&!Array.isArray(manifest.scripts)?Object.entries(manifest.scripts as Record<string,unknown>).filter(([,value])=>typeof value==='string').map(([name])=>name).filter(name=>name.length<=200):[];
      const name=typeof manifest.name==='string'&&manifest.name.length<=200?manifest.name:path;
      const suggestions=scriptSuggestions(scripts).slice(0,4).map(item=>({...item,id:`javascript.workspace.${path}.${item.id}`,label:`${name}: ${item.label.replace(/^Run /,'')}`,command:manager==='npm'?`npm --prefix ${quote(path)} run ${quote(item.id.replace(/^javascript\.script\./,''))}`:`${manager} --cwd ${quote(path)} run ${quote(item.id.replace(/^javascript\.script\./,''))}`,intent:suggestionIntent(item.id.replace(/^javascript\.script\./,''))}));
      const dependencyNames=['dependencies','devDependencies','peerDependencies','optionalDependencies'].flatMap(field=>manifest[field]&&typeof manifest[field]==='object'&&!Array.isArray(manifest[field])?Object.keys(manifest[field] as Record<string,unknown>):[]);
      records.push({path,name,scripts,suggestions,dependencyNames});
    }catch{/* Invalid child manifests do not hide valid workspace packages. */}
  }
  const names=new Set(records.map(item=>item.name));const affected=new Set<string>();const reasons=new Map<string,string[]>();
  const rootAffectsAll=changedPaths.some(path=>/^(?:package\.json|(?:pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|package-lock\.json|npm-shrinkwrap\.json)|pnpm-workspace\.yaml|tsconfig(?:\.[^/]+)?\.json)$/.test(path));
  for(const item of records){const direct=changedPaths.some(path=>path===item.path||path.startsWith(item.path+'/'));if(direct||rootAffectsAll){affected.add(item.name);reasons.set(item.name,[direct?'Changed files in this package':'Root workspace configuration changed']);}}
  let changed=true;while(changed){changed=false;for(const item of records){if(affected.has(item.name))continue;const dependency=item.dependencyNames.find(name=>affected.has(name));if(dependency){affected.add(item.name);reasons.set(item.name,[`Depends on ${dependency}`]);changed=true;}}}
  return records.map(item=>({path:item.path,name:item.name,scripts:item.scripts,dependencies:item.dependencyNames.filter(name=>names.has(name)),affected:affected.has(item.name),reasons:reasons.get(item.name)??[],suggestions:item.suggestions}));
}
async function tool(command:string):Promise<ProjectEnvironment['tools'][number]>{
  try{
    const located=(await exec('/usr/bin/which',[command],{env:{PATH:commandPath},timeout:2000,maxBuffer:4096,encoding:'utf8'})).stdout.trim();
    if(!located)return {command,available:false};
    const result=await exec(located,['--version'],{env:{PATH:commandPath},timeout:3000,maxBuffer:4096,encoding:'utf8'});
    const version=`${result.stdout}${result.stderr}`.trim().split(/\r?\n/,1)[0]?.slice(0,160);
    return {command,available:true,...(version?{version}:{})};
  }catch{return {command,available:false};}
}
function scriptSuggestions(scripts:string[]):ProjectEnvironmentSuggestion[]{
  const priority=['dev','start','build','test','check','typecheck','lint'];
  return scripts.slice().sort((a,b)=>{
    const ai=priority.indexOf(a),bi=priority.indexOf(b);return (ai<0?999:ai)-(bi<0?999:bi)||a.localeCompare(b);
  }).slice(0,12).map(name=>({id:`javascript.script.${name}`,label:`Run ${name}`,command:`npm run ${quote(name)}`,intent:name==='dev'||name==='start'?'service':/build|test|check|typecheck|lint/i.test(name)?'check':'run'}));
}

type PythonFramework='django'|'fastapi'|'flask';
function pythonPackages(manifests:Map<string,string>){
  const packages=new Set<string>();
  const requirements=manifests.get('requirements.txt');
  if(requirements)for(const line of requirements.split(/\r?\n/)){
    const match=/^\s*([A-Za-z0-9][A-Za-z0-9._-]*)/.exec(line);
    if(match&&!line.trimStart().startsWith('#'))packages.add(match[1]!.toLowerCase().replaceAll('_','-'));
  }
  const pyproject=manifests.get('pyproject.toml');
  if(pyproject){
    for(const name of ['django','fastapi','flask','uvicorn','pytest','ruff','mypy'])if(new RegExp(`(?:^|["'\\s,{[])${name}(?:["'\\s}=<>=~!]|$)`,'im').test(pyproject))packages.add(name);
  }
  const pipfile=manifests.get('Pipfile');
  if(pipfile)for(const name of ['django','fastapi','flask','uvicorn','pytest','ruff','mypy'])if(new RegExp(`^\\s*${name}\\s*=`, 'im').test(pipfile))packages.add(name);
  return packages;
}
function pythonRunner(manager:'python'|'uv'|'poetry'|'pipenv',environmentPresent:boolean){
  if(environmentPresent)return '.venv/bin/python';
  if(manager==='uv')return 'uv run python';
  if(manager==='poetry')return 'poetry run python';
  if(manager==='pipenv')return 'pipenv run python';
  return 'python3';
}

/** Inspect fixed, root-level environment markers without executing repository code. */
export async function inspectProjectEnvironment(root:string,changedPaths:string[]=[]):Promise<ProjectEnvironment>{
  const environment:ProjectEnvironment={detectedAt:Date.now(),tools:[],unsupported:[],additional:[]};
  const packagePath=join(root,'package.json');
  const packageKind=await kind(packagePath);
  let jsTool:string|undefined;
  if(packageKind!=='missing'){
    const lockCandidates:[string,'pnpm'|'yarn'|'bun'|'npm',string][]=[
      ['pnpm-lock.yaml','pnpm','pnpm install --frozen-lockfile'],['yarn.lock','yarn','yarn install --frozen-lockfile'],['bun.lock','bun','bun install --frozen-lockfile'],['bun.lockb','bun','bun install --frozen-lockfile'],['npm-shrinkwrap.json','npm','npm ci'],['package-lock.json','npm','npm ci'],
    ];
    const lockKinds=await Promise.all(lockCandidates.map(async candidate=>[candidate,await kind(join(root,candidate[0]))] as const));
    const selected=lockKinds.find(([,fileKind])=>fileKind==='file')?.[0];
    let manager=selected?.[1]??'npm';let setup=selected?.[2]??'npm install';let scripts:string[]=[];let error:string|undefined;
    let workspace:NonNullable<ProjectEnvironment['javascript']>['workspace'];
    try{
      const manifest=await json(packagePath);
      if(!selected&&typeof manifest.packageManager==='string'){
        const requested=manifest.packageManager.split('@',1)[0];
        if(requested==='npm'||requested==='pnpm'||requested==='yarn'||requested==='bun'){
          manager=requested;
          setup=requested==='npm'?'npm install':`${requested} install`;
        }
      }
      if(manifest.scripts&&typeof manifest.scripts==='object'&&!Array.isArray(manifest.scripts))scripts=Object.entries(manifest.scripts as Record<string,unknown>).filter(([,value])=>typeof value==='string').map(([name])=>name).filter(name=>name.length<=200);
      const packageWorkspaces=Array.isArray(manifest.workspaces)?manifest.workspaces:manifest.workspaces&&typeof manifest.workspaces==='object'&&!Array.isArray(manifest.workspaces)?(manifest.workspaces as {packages?:unknown}).packages:undefined;
      const packagePatterns=Array.isArray(packageWorkspaces)?safeWorkspacePatterns(packageWorkspaces):[];
      const pnpmPatterns=await pnpmWorkspace(join(root,'pnpm-workspace.yaml'));
      const workspaceDefinition=pnpmPatterns.length?{marker:'pnpm-workspace.yaml',patterns:pnpmPatterns}:packagePatterns.length?{marker:'package.json',patterns:packagePatterns}:null;
      if(workspaceDefinition){const packages=await workspacePackages(root,workspaceDefinition.patterns,manager,changedPaths);const checks=packages.filter(item=>item.affected).flatMap(item=>item.suggestions.filter(suggestion=>suggestion.intent==='check').slice(0,1)).slice(0,8);const command=checks.map(item=>item.command).join(' && ');workspace={...workspaceDefinition,packages,...(command&&command.length<=8000?{affectedSuggestion:{id:'javascript.workspace.affected',label:`Load ${checks.length} affected ${checks.length===1?'check':'checks'}`,command,intent:'check' as const}}:{})};}
    }catch(cause){error=cause instanceof Error?cause.message:'package.json could not be inspected.';}
    jsTool=manager;
    const suggestions:ProjectEnvironmentSuggestion[]=error?[]:[{id:'javascript.setup',label:`Install with ${manager}`,command:setup,intent:'setup'},...scriptSuggestions(scripts).map(suggestion=>({...suggestion,command:suggestion.command.replace(/^npm /,`${manager} `)}))];
    environment.javascript={manager,dependenciesPresent:await kind(join(root,'node_modules'))==='directory',scripts,suggestions,...(selected?{lockfile:selected[0]}:{}),...(workspace?{workspace}:{}),...(error?{error}:{})};
  }

  const pythonMarkers=['pyproject.toml','requirements.txt','Pipfile','Pipfile.lock','poetry.lock','uv.lock'];
  const present=(await Promise.all(pythonMarkers.map(async name=>[name,await kind(join(root,name))] as const))).filter(([,fileKind])=>fileKind!=='missing');
  let pyTool:string|undefined;
  if(present.length){
    const invalid=present.find(([,fileKind])=>fileKind!=='file');
    const manifests=present.map(([name])=>name);
    let manager:'python'|'uv'|'poetry'|'pipenv'='python';let setup='';
    if(manifests.includes('uv.lock')){manager='uv';setup='uv sync --frozen';}
    else if(manifests.includes('poetry.lock')){manager='poetry';setup='poetry install --no-interaction';}
    else if(manifests.includes('Pipfile.lock')){manager='pipenv';setup='pipenv sync --dev';}
    else if(manifests.includes('requirements.txt'))setup='python3 -m venv .venv && .venv/bin/python -m pip install -r requirements.txt';
    else setup='python3 -m venv .venv && .venv/bin/python -m pip install -e .';
    pyTool=manager==='python'?'python3':manager;
    const environmentPresent=await exists(join(root,'.venv','bin','python'));
    let error=invalid?`${invalid[0]} must be a regular file.`:undefined;
    const manifestText=new Map<string,string>();
    if(!error)for(const name of manifests){
      try{manifestText.set(name,await boundedText(join(root,name),name));}
      catch(cause){error=cause instanceof Error?cause.message:`${name} could not be inspected.`;break;}
    }
    const packages=error?new Set<string>():pythonPackages(manifestText);
    const rootFiles=new Map(await Promise.all(['manage.py','main.py','app.py'].map(async name=>[name,await kind(join(root,name))] as const)));
    const frameworks:PythonFramework[]=[];
    if(packages.has('django')&&rootFiles.get('manage.py')==='file')frameworks.push('django');
    if(packages.has('fastapi')&&packages.has('uvicorn')&&(rootFiles.get('main.py')==='file'||rootFiles.get('app.py')==='file'))frameworks.push('fastapi');
    if(packages.has('flask')&&(rootFiles.get('app.py')==='file'||rootFiles.get('main.py')==='file'))frameworks.push('flask');
    const suggestions:ProjectEnvironmentSuggestion[]=error?[]:[{id:'python.setup',label:manager==='python'?(environmentPresent?'Sync .venv':'Prepare .venv'):`Install with ${manager}`,command:setup,intent:'setup'}];
    const testMarkers=['pytest.ini','tox.ini','tests'];
    const runner=pythonRunner(manager,environmentPresent);
    if(!error&&(packages.has('pytest')||(await Promise.all(testMarkers.map(name=>kind(join(root,name))))).some(value=>value==='file'||value==='directory')))suggestions.push({id:'python.test',label:'Run Python tests',command:`${runner} -m pytest`,intent:'check'});
    if(!error&&packages.has('ruff'))suggestions.push({id:'python.ruff',label:'Check with Ruff',command:`${runner} -m ruff check .`,intent:'check'});
    if(!error&&packages.has('mypy'))suggestions.push({id:'python.mypy',label:'Check with mypy',command:`${runner} -m mypy .`,intent:'check'});
    if(frameworks.includes('django'))suggestions.push({id:'python.django.check',label:'Run Django check',command:`${runner} manage.py check`,intent:'check'},{id:'python.django.service',label:'Start Django server',command:`${runner} manage.py runserver 127.0.0.1:8000`,intent:'service'});
    const fastapiModule=rootFiles.get('main.py')==='file'?'main':'app';
    if(frameworks.includes('fastapi'))suggestions.push({id:'python.fastapi.service',label:'Start FastAPI server',command:`${runner} -m uvicorn ${fastapiModule}:app --host 127.0.0.1 --port 8000`,intent:'service'});
    const flaskModule=rootFiles.get('app.py')==='file'?'app':'main';
    if(frameworks.includes('flask'))suggestions.push({id:'python.flask.service',label:'Start Flask server',command:`${runner} -m flask --app ${flaskModule} run --host 127.0.0.1 --port 5000`,intent:'service'});
    environment.python={manager,manifests,environmentPresent,frameworks,suggestions,...(error?{error}:{})};
  }
  const commands=[...new Set([...(environment.javascript?['node']:[]),jsTool,pyTool].filter((value):value is string=>!!value))];
  if(await kind(join(root,'Cargo.toml'))==='file'){
    let content='';let error:string|undefined;try{content=await boundedText(join(root,'Cargo.toml'),'Cargo.toml');}catch(cause){error=cause instanceof Error?cause.message:'Cargo.toml could not be inspected.';}
    const workspace=/^\s*\[workspace\]\s*$/m.test(content);const binary=(await kind(join(root,'src','main.rs')))==='file'||/^\s*\[\[bin\]\]\s*$/m.test(content);const locked=(await kind(join(root,'Cargo.lock')))==='file';const lock=locked?' --locked':'';
    const patterns=error?[]:cargoMemberPatterns(content);const memberPaths=await workspaceManifests(root,patterns,'Cargo.toml');const rootChanged=changedPaths.some(path=>/^(?:Cargo\.toml|Cargo\.lock|rust-toolchain(?:\.toml)?)$/.test(path));
    const members=[] as {path:string;name:string;affected:boolean;reasons:string[]}[];
    for(const path of memberPaths){try{const member=await boundedText(join(root,path,'Cargo.toml'),`${path}/Cargo.toml`);const name=/^\s*name\s*=\s*["']([^"']+)["']/m.exec(member)?.[1]??path;const direct=changedPaths.some(changed=>changed===path||changed.startsWith(path+'/'));members.push({path,name,affected:direct||rootChanged,reasons:direct?['Changed files in this crate']:rootChanged?['Root Cargo configuration changed']:[]});}catch{/* Invalid members remain available through root workspace commands. */}}
    const affected=members.filter(item=>item.affected).slice(0,8);const affectedCommand=affected.map(item=>`cargo check${lock} --package ${quote(item.name)}`).join(' && ');
    const affectedSuggestion=affectedCommand&&affectedCommand.length<=8000?{id:'rust.workspace.affected',label:`Load ${affected.length} affected ${affected.length===1?'crate check':'crate checks'}`,command:affectedCommand,intent:'check' as const}:undefined;
    const suggestions:ProjectEnvironmentSuggestion[]=error?[]:[{id:'rust.check',label:'Run cargo check',command:`cargo check${lock}`,intent:'check'},{id:'rust.test',label:'Run cargo tests',command:`cargo test${lock}`,intent:'check'},{id:'rust.build',label:'Build Rust project',command:`cargo build${lock}`,intent:'check'},...(binary?[{id:'rust.service',label:'Start Rust app',command:`cargo run${lock}`,intent:'service' as const}]:[])];
    environment.rust={manifest:'Cargo.toml',workspace,binary,locked,members,suggestions,...(affectedSuggestion?{affectedSuggestion}:{}),...(error?{error}:{})};
  }
  const goModKind=await kind(join(root,'go.mod'));const goWorkKind=await kind(join(root,'go.work'));
  if(goModKind==='file'||goWorkKind==='file'){
    const manifest=goModKind==='file'?'go.mod':'go.work';let content='';let error:string|undefined;try{content=await boundedText(join(root,manifest),manifest);}catch(cause){error=cause instanceof Error?cause.message:`${manifest} could not be inspected.`;}
    const module=/^\s*module\s+(\S+)\s*$/m.exec(content)?.[1];let binary=false;
    if(goModKind==='file'&&!error)for await(const name of glob('*.go',{cwd:root})){if(typeof name!=='string'||name.endsWith('_test.go'))continue;try{if(/^\s*package\s+main\b/m.test(await boundedText(join(root,name),name))){binary=true;break;}}catch{/* An unreadable source file does not make inspection execute code. */}}
    let workspace:NonNullable<ProjectEnvironment['go']>['workspace'];
    if(goWorkKind==='file'&&!error){const work=manifest==='go.work'?content:await boundedText(join(root,'go.work'),'go.work');const paths=goWorkspacePaths(work);const modules=[] as {path:string;module:string;affected:boolean;reasons:string[]}[];const rootChanged=changedPaths.some(path=>/^(?:go\.work(?:\.sum)?|go\.sum)$/.test(path));for(const path of paths){try{const moduleText=await boundedText(join(root,path,'go.mod'),`${path}/go.mod`);const name=/^\s*module\s+(\S+)\s*$/m.exec(moduleText)?.[1]??path;const direct=changedPaths.some(changed=>changed===path||changed.startsWith(path+'/'));modules.push({path,module:name,affected:direct||rootChanged,reasons:direct?['Changed files in this module']:rootChanged?['Root Go workspace configuration changed']:[]});}catch{/* Invalid workspace members are omitted. */}}const affected=modules.filter(item=>item.affected).slice(0,20);const command=affected.length?`go test ${affected.map(item=>quote(`./${item.path}/...`)).join(' ')}`:'';workspace={marker:'go.work',modules,...(command&&command.length<=8000?{affectedSuggestion:{id:'go.workspace.affected',label:`Load checks for ${affected.length} affected ${affected.length===1?'module':'modules'}`,command,intent:'check' as const}}:{})};}
    const scope=workspace?.modules.length?workspace.modules.map(item=>quote(`./${item.path}/...`)).join(' '):'./...';
    const suggestions:ProjectEnvironmentSuggestion[]=error?[]:[{id:'go.test',label:'Run Go tests',command:`go test ${scope}`,intent:'check'},{id:'go.vet',label:'Run go vet',command:`go vet ${scope}`,intent:'check'},{id:'go.build',label:'Build Go project',command:`go build ${scope}`,intent:'check'},...(binary?[{id:'go.service',label:'Start Go app',command:'go run .',intent:'service' as const}]:[])];
    environment.go={manifest,...(module?{module}:{}),binary,...(workspace?{workspace}:{}),suggestions,...(error?{error}:{})};
  }
  if(environment.rust)commands.push('cargo');if(environment.go)commands.push('go');
  const gemfileKind=await kind(join(root,'Gemfile'));
  if(gemfileKind!=='missing'){
    let error:string|undefined;try{if(gemfileKind!=='file')throw new Error('Gemfile must be a regular file.');await boundedText(join(root,'Gemfile'),'Gemfile');}catch(cause){error=cause instanceof Error?cause.message:'Gemfile could not be inspected.';}
    const manifests=['Gemfile',...((await kind(join(root,'Gemfile.lock')))==='file'?['Gemfile.lock']:[])];const suggestions:ProjectEnvironmentSuggestion[]=error?[]:[{id:'ruby.setup',label:'Install Ruby gems',command:'bundle install',intent:'setup'}];
    if((await kind(join(root,'Rakefile')))==='file')suggestions.push({id:'ruby.rake',label:'Run Rake checks',command:'bundle exec rake',intent:'check'});
    if((await kind(join(root,'spec')))==='directory')suggestions.push({id:'ruby.rspec',label:'Run RSpec',command:'bundle exec rspec',intent:'check'});
    if((await kind(join(root,'bin','rails')))==='file')suggestions.push({id:'ruby.rails',label:'Start Rails server',command:'bundle exec rails server -b 127.0.0.1 -p 3000',intent:'service'});
    else if((await kind(join(root,'config.ru')))==='file')suggestions.push({id:'ruby.rack',label:'Start Rack server',command:'bundle exec rackup -o 127.0.0.1 -p 3000',intent:'service'});
    environment.additional!.push({ecosystem:'Ruby',manifests,description:'Bundler project',suggestions,...(error?{error}:{})});commands.push('bundle');
  }
  const jvmMarkers=(await Promise.all(['pom.xml','build.gradle','build.gradle.kts'].map(async name=>[name,await kind(join(root,name))] as const))).filter(([,value])=>value!=='missing');
  if(jvmMarkers.length){
    const invalid=jvmMarkers.find(([,value])=>value!=='file');let error=invalid?`${invalid[0]} must be a regular file.`:undefined;const manifests=jvmMarkers.map(([name])=>name);let content='';if(!error)try{content=await boundedText(join(root,manifests[0]!),manifests[0]!);}catch(cause){error=cause instanceof Error?cause.message:'JVM manifest could not be inspected.';}
    const maven=manifests.includes('pom.xml');const wrapper=await kind(join(root,maven?'mvnw':'gradlew'))==='file';const runner=wrapper?`./${maven?'mvnw':'gradlew'}`:maven?'mvn':'gradle';const suggestions:ProjectEnvironmentSuggestion[]=error?[]:maven?[{id:'jvm.test',label:'Run Maven tests',command:`${runner} test`,intent:'check'},{id:'jvm.package',label:'Build Maven project',command:`${runner} package`,intent:'check'}]:[{id:'jvm.test',label:'Run Gradle tests',command:`${runner} test`,intent:'check'},{id:'jvm.build',label:'Build Gradle project',command:`${runner} build`,intent:'check'}];
    if(!error&&/spring(?:framework)?[.-]boot/i.test(content))suggestions.push({id:'jvm.spring',label:'Start Spring application',command:maven?`${runner} spring-boot:run`:`${runner} bootRun`,intent:'service'});
    environment.additional!.push({ecosystem:'JVM',manifests,description:`${maven?'Maven':'Gradle'} project${wrapper?' with wrapper':''}`,suggestions,...(error?{error}:{})});if(!wrapper)commands.push(runner);
  }
  const composerKind=await kind(join(root,'composer.json'));
  if(composerKind!=='missing'){
    let error:string|undefined;let scripts=new Set<string>();try{if(composerKind!=='file')throw new Error('composer.json must be a regular file.');const parsed=JSON.parse(await boundedText(join(root,'composer.json'),'composer.json')) as {scripts?:unknown};if(parsed.scripts&&typeof parsed.scripts==='object'&&!Array.isArray(parsed.scripts))scripts=new Set(Object.keys(parsed.scripts));}catch(cause){error=cause instanceof Error?cause.message:'composer.json could not be inspected.';}
    const manifests=['composer.json',...((await kind(join(root,'composer.lock')))==='file'?['composer.lock']:[])];const suggestions:ProjectEnvironmentSuggestion[]=error?[]:[{id:'php.setup',label:'Install Composer dependencies',command:'composer install --no-interaction',intent:'setup'}];
    if(scripts.has('test'))suggestions.push({id:'php.test',label:'Run Composer tests',command:'composer test',intent:'check'});else if((await kind(join(root,'phpunit.xml')))==='file'||(await kind(join(root,'phpunit.xml.dist')))==='file')suggestions.push({id:'php.phpunit',label:'Run PHPUnit',command:'vendor/bin/phpunit',intent:'check'});
    const publicRoot=(await kind(join(root,'public','index.php')))==='file'?'public':(await kind(join(root,'index.php')))==='file'?'.':null;if(publicRoot)suggestions.push({id:'php.service',label:'Start PHP server',command:`php -S 127.0.0.1:8000 -t ${publicRoot}`,intent:'service'});
    environment.additional!.push({ecosystem:'PHP',manifests,description:'Composer project',suggestions,...(error?{error}:{})});commands.push('composer','php');
  }
  const containerNames=['Dockerfile','compose.yaml','compose.yml','docker-compose.yaml','docker-compose.yml'];const containerMarkers=(await Promise.all(containerNames.map(async name=>[name,await kind(join(root,name))] as const))).filter(([,value])=>value!=='missing');
  if(containerMarkers.length){
    const invalid=containerMarkers.find(([,value])=>value!=='file');const manifests=containerMarkers.map(([name])=>name);const error=invalid?`${invalid[0]} must be a regular file.`:undefined;const compose=manifests.find(name=>name!=='Dockerfile');const suggestions:ProjectEnvironmentSuggestion[]=error?[]:[];
    if(manifests.includes('Dockerfile'))suggestions.push({id:'container.build',label:'Build container image',command:'docker build --tag aux-local .',intent:'check'});
    if(compose)suggestions.push({id:'container.check',label:'Validate Compose configuration',command:`docker compose -f ${quote(compose)} config`,intent:'check'},{id:'container.service',label:'Start Compose services',command:`docker compose -f ${quote(compose)} up`,intent:'service'});
    environment.additional!.push({ecosystem:'Container',manifests,description:compose?'Docker Compose project':'Dockerfile project',suggestions,...(error?{error}:{})});commands.push('docker');
  }
  environment.tools=await Promise.all(commands.map(tool));
  return environment;
}
