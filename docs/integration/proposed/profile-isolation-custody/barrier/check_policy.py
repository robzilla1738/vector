"""Run the actual source policy template with existing Apple-signed tools only."""
from pathlib import Path
import re,tempfile,subprocess,json,os,argparse
h=Path(__file__).resolve().parent
parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);a=parser.parse_args()
s=(h/'source/chrome/browser/aux/AuxSelectedStateHome.cc').read_text();template=re.search(r'kNativeHostPathRestrictions\[\] = R"aux\((.*?)\)aux";',s,re.S).group(1)
p=Path(tempfile.mkdtemp(prefix='aux-native-path-policy-',dir='/private/tmp'));data=p/'data';cache=p/'cache';outside=p/'outside'
for root in [data,cache,outside]:root.mkdir()
(data/'file').write_text('original');(cache/'file').write_text('cache');(outside/'symlink').symlink_to(data/'file');os.link(data/'file',outside/'preexisting-hardlink')
args=['/usr/bin/sandbox-exec','-D','AUX_DATA_ROOT='+str(data),'-D','AUX_CACHE_ROOT='+str(cache)];policy=template
parents=sorted(set(data.parents)|set(cache.parents))
for i,parent in enumerate(parent for parent in parents if parent!=parent.parent):
 key='AUX_PARENT_'+str(i);args+=['-D',key+'='+str(parent)];policy+='(deny file-write-unlink (literal (param "'+key+'")))\n'
args+=['-p',policy,'--']
cases=[('data-write','echo changed > "$1/file"',False),('cache-write','echo changed > "$2/file"',False),('symlink-write','echo changed > "$3/symlink"',False),('create-hardlink','ln "$1/file" "$3/new-link"',False),('root-rename','mv "$1" "$3/renamed"',False),('ancestor-rename','mv "$4" "$4-renamed"',False),('child-write','/bin/sh -c \'echo changed > "$1/file"\' sh "$1"',False),('outside-write','echo allowed > "$3/allowed"',True),('stdio','read line; printf "%s" "$line"',True),('existing-hardlink-write','echo changed > "$3/preexisting-hardlink"',True)]
results=[]
for name,cmd,allowed in cases:
 r=subprocess.run(args+['/bin/sh','-c',cmd,'sh',str(data),str(cache),str(outside),str(p)],input='native-message-fixture\n',capture_output=True,text=True)
 results.append({'name':name,'exitCode':r.returncode,'expectedAllowed':allowed,'matched':(r.returncode==0)==allowed,'stdioPreserved':r.stdout=='native-message-fixture' if name=='stdio' else None})
# Exercise the same wrapper argv layout with an executable whose switches matter.
assert 'const auto& original_argv = host.argv();' in s
assert 'wrapped.AppendArg(original_argv[i]);' in s
assert 'host.GetArgs()' not in s
original_argv=['/bin/sh','-c','printf "%s\\n" "$@"','host','--connect-id=synthetic','--','a b','']
argv_run=subprocess.run(args+original_argv,capture_output=True,text=True)
argv_preserved=argv_run.returncode==0 and argv_run.stdout=='--connect-id=synthetic\n--\na b\n\n'
results.append({'name':'host-switches-separator-spaces-empty-argv','exitCode':argv_run.returncode,'matched':argv_preserved})
r={'passed':all(x['matched'] for x in results) and next(x for x in results if x['name']=='stdio')['stdioPreserved'],'results':results,'fixture':str(p),'existingHardlinkBypassConfirmed':(data/'file').read_text()=='changed\n','allExternalWritersConfined':False,'newNativeExecutableBuilt':False,'signingWorkflowInvoked':False,'ownerDataAccessed':False}
Path(a.output).write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
if not r['passed']:raise SystemExit(1)
