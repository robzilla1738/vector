from pathlib import Path
import hashlib,json
HERE=Path(__file__).resolve().parent;ROOT=Path('/Users/rcourson/Documents/Vibe/web')
source=ROOT/'out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs'
raw=source.read_bytes();assert hashlib.sha256(raw).hexdigest()=='48af998738fb6d2fc30cb8d5b2e9de03cb04ab7d8563ebdaa5fe8100944fc514';s=raw.decode()
parts={}
for name,start,end in [('projectSchema','ProjectTable=sqliteTable(`projects`',',SessionTable=sqliteTable'),('sessionProjectForeignKey','SessionTable=sqliteTable(`sessions`',',parentId:text$9'),('projectCreate','function ii(Cn,ei){if(ti(Cn,ei.id))throw Error(`Project already exists:', 'Cn.create=ii;'),('actualAgentContext','accountTaskRoot(this.accountId),ei=this.session.projectId?', ',resolvePath:Cn=>')]:
 if name=='actualAgentContext':start='getAccountTaskRoot(this.accountId),ei=this.session.projectId?'
 a=s.index(start);b=s.index(end,a);text=s[a:b]
 parts[name]={'offset':a,'source':text,'sha256':hashlib.sha256(text.encode()).hexdigest()}
(HERE/'schema-proof.json').write_text(json.dumps({'format':'aux.selected-project-stored-membership-proof.v1','actualSource':str(source),'sourceSha256':hashlib.sha256(raw).hexdigest(),'parts':parts,'storedSessionMembership':'main.sessions.id +created_at, optional project_id','storedProjectIdentity':'main.projects.id+created_at+workspace_path; fields SQLTEXT/TEXT/INTEGER Unixseconds','defaultWorkspace':'actual retained Task/u/account, never caller cwd','loadedOrExecuted':False},indent=2)+'\n')
