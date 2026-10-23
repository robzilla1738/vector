#!/usr/bin/env python3
"""Build only pinned Brotli C objects/static archive; never load/sign/run output."""
import argparse,ast,concurrent.futures,hashlib,json,pathlib,re,shlex,subprocess,tarfile
SOURCE_URL='https://github.com/google/brotli/archive/refs/tags/v1.2.1.tar.gz'
SOURCE_SHA='98d35d11a78dc453aebb7d10c3748f3f73ff78c8267c0dc697b8631f67bf7e8f'
ROOT=pathlib.Path('/Users/rcourson/Documents/Vibe/web')
NODE=ROOT/'out/aux-node-static-26.5.0/node-v26.5.0'
OLD=NODE/'out/Release/libbrotli.a'
sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def run(command):return subprocess.check_output(command,text=True,stderr=subprocess.STDOUT)
def flags(text,name):
    match=re.search(r'^'+re.escape(name)+r' :=(.*?)(?=\n\n|\Z)',text,re.M|re.S)
    assert match,name
    return shlex.split(match.group(1).replace('\\\n',' '))
def symbols(path):
    output=run(['/usr/bin/nm','-gU',str(path)])
    return sorted({line.split()[-1] for line in output.splitlines() if len(line.split())>=3 and line.split()[-2].isupper() and line.split()[-2]!='U'})
def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--archive',type=pathlib.Path,required=True);parser.add_argument('--output',type=pathlib.Path,required=True);args=parser.parse_args()
    archive=args.archive.resolve(strict=True);out=args.output.resolve()
    assert sha(archive)==SOURCE_SHA,'Wrong official source archive'
    assert not out.exists(),'Fresh isolated output required'
    out.mkdir(parents=True)
    originals=[NODE/'deps/brotli/c/common/version.h',NODE/'deps/brotli/brotli.gyp',NODE/'out/deps/brotli/brotli.target.mk',NODE/'config.gypi',ROOT/'out/aux-node-static-26.5.0/static-build-receipt.json',OLD]
    frozen={str(p):sha(p) for p in originals}
    record={'format':'aux.brotli.static.successor.v1','passed':False,'version':'1.2.1','architecture':'arm64','deploymentTarget':'13.5','sourceURL':SOURCE_URL,'sourceArchive':str(archive),'sourceArchiveSha256':SOURCE_SHA,'originalInputs':frozen,'executed':False,'signed':False,'originalsMutated':False}
    try:
        with tarfile.open(archive,'r:gz') as tar:
            assert all(pathlib.PurePosixPath(m.name).parts[0]=='brotli-1.2.1' and '..' not in pathlib.PurePosixPath(m.name).parts and not m.issym() and not m.islnk() for m in tar.getmembers())
            tar.extractall(out/'source',filter='data')
        source=out/'source/brotli-1.2.1';header=source/'c/common/version.h'
        text=header.read_text()
        assert re.search(r'#define BROTLI_VERSION_MAJOR\s+1\b',text) and re.search(r'#define BROTLI_VERSION_MINOR\s+2\b',text) and re.search(r'#define BROTLI_VERSION_PATCH\s+1\b',text)
        sources=ast.literal_eval((NODE/'deps/brotli/brotli.gyp').read_text())['variables']['brotli_sources']
        assert len(sources)==len(set(sources)) and all(p.startswith('c/') and p.endswith('.c') for p in sources)
        mk=(NODE/'out/deps/brotli/brotli.target.mk').read_text();defines=flags(mk,'DEFS_Release');cflags=flags(mk,'CFLAGS_Release')+flags(mk,'CFLAGS_C_Release')
        assert '-mmacosx-version-min=13.5' in cflags and cflags[cflags.index('-arch')+1]=='arm64'
        compiler=run(['xcrun','--find','clang']).strip();sdk=run(['xcrun','--sdk','macosx','--show-sdk-path']).strip()
        (out/'objects').mkdir()
        commands=[]
        for name in sources:
            src=source/name;assert src.is_file()
            obj=out/'objects'/('_'.join(pathlib.PurePosixPath(name).parts[1:]).removesuffix('.c')+'.o')
            commands.append([compiler,'-isysroot',sdk,*defines,*cflags,'-I'+str(source/'c/include'),'-c',str(src),'-o',str(obj)])
        inputs={str(source/p):sha(source/p) for p in sources};inputs[str(header)]=sha(header)
        record.update({'sourceCount':len(sources),'sourceInputs':inputs,'compiler':compiler,'sdk':sdk,'defines':defines,'cflags':cflags,'commands':commands,'jobs':2})
        def compile_one(command):
            p=subprocess.run(command,capture_output=True,text=True);return {'command':command,'exitCode':p.returncode,'output':p.stdout+p.stderr}
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(compile_one,commands))
        (out/'compile.json').write_text(json.dumps(results,indent=2)+'\n')
        assert all(r['exitCode']==0 for r in results),'Brotli C compilation failed'
        objects=[pathlib.Path(command[-1]) for command in commands]
        product=out/'libbrotli.a';link=['/usr/bin/libtool','-static','-o',str(product),*[str(p) for p in objects]]
        record['archiveCommand']=link;(out/'archive.log').write_text(run(link))
        old_symbols=symbols(OLD);new_symbols=symbols(product)
        missing=sorted(set(old_symbols)-set(new_symbols));record.update({'oldDefinedGlobalCount':len(old_symbols),'newDefinedGlobalCount':len(new_symbols),'missingOldGlobalDefinitions':missing,'additionalGlobalDefinitions':sorted(set(new_symbols)-set(old_symbols))})
        assert not missing,'Old static archive symbol coverage lost'
        load=run(['/usr/bin/otool','-l',str(product)]);minimums=sorted(set(re.findall(r'\bminos\s+(\S+)',load)))
        assert minimums==['13.5'],minimums
        disasm=run(['/usr/bin/otool','-tvV',str(product)]);versions={}
        for name in ['_BrotliEncoderVersion','_BrotliDecoderVersion']:
            match=re.search(re.escape(name)+r':\n([^\n]+)\n([^\n]+)\n([^\n]+)',disasm);assert match,name
            body=match.group(0);assert 'w0, #0x2001' in body and 'w0, #0x100, lsl #16' in body and 'ret' in body,body
            versions[name]={'encodedVersion':'0x01002001','disassembly':body}
        record.update({'deploymentTargets':minimums,'versionFunctions':versions,'architectureInspection':run(['/usr/bin/lipo','-info',str(product)]).strip(),'originalInputsPreserved':all(sha(p)==h for p,h in frozen.items()),'sourceInputsPreserved':all(sha(p)==h for p,h in inputs.items()),'path':str(product),'sha256':sha(product),'bytes':product.stat().st_size})
        assert record['originalInputsPreserved'] and record['sourceInputsPreserved']
        record['passed']=True
        (out/'prepare-daemon.json').write_text(json.dumps({key:record[key] for key in ['passed','version','deploymentTarget','path','sha256']},indent=2)+'\n')
    finally:
        (out/'results.json').write_text(json.dumps(record,indent=2)+'\n')
    print(json.dumps({key:record[key] for key in ['passed','version','deploymentTarget','path','sha256','sourceCount','oldDefinedGlobalCount','newDefinedGlobalCount']},indent=2))
if __name__=='__main__':main()
