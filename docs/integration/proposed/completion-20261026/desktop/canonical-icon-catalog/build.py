#!/usr/bin/env python3
"""Compile only a canonical Aux icon catalog in fresh output; never alter an app."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import struct
import subprocess
import xml.etree.ElementTree as ET

H=Path(__file__).resolve().parent
sha=lambda data:hashlib.sha256(data).hexdigest()

def require(condition,message):
    if not condition:raise ValueError(message)

def ref(path):
    path=Path(path)
    require(path.is_file() and not path.is_symlink(),'Regular pinned source required: '+str(path))
    return {'path':str(path),'sha256':sha(path.read_bytes())}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repository',type=Path,required=True)
    parser.add_argument('--receipt',type=Path,required=True)
    parser.add_argument('--receipt-sha256',required=True)
    parser.add_argument('--output',type=Path,required=True)
    a=parser.parse_args();repository=a.repository.resolve(strict=True)
    require(not a.output.exists() and not a.output.is_symlink(),'Fresh isolated catalog output required')
    pins=json.loads((H/'source-pins.json').read_text());source_refs=[]
    for item in pins['inputs']:
        frozen=ref(repository/item['path']);require(frozen['sha256']==item['sha256'],'Canonical source changed');source_refs.append(frozen)
    require(ref(a.receipt)['sha256']==a.receipt_sha256,'Unsigned inventory receipt changed')
    receipt=json.loads(a.receipt.read_text());app=Path(receipt['app']);rows={r['path']:r for r in receipt['files']}
    require(receipt.get('passed') is True and receipt.get('productSigned') is False,'Unsigned successful package receipt required')
    for relative in pins['targets']:
        require(rows[relative]['sha256']==pins['originalCatalogSha256']==ref(app/relative)['sha256'],'Actual original catalog differs')
        fallback=Path(relative).parent/'app.icns'
        require(rows[str(fallback)]['sha256']==pins['fallbackIconSha256']==ref(app/fallback)['sha256'],'Approved fallback icon differs')
    scope=json.loads((H/'catalog-scope.json').read_text())
    require(scope['logicalItems']==['AppIcon','Icon'] and scope['unrelatedProductUiAssetsFound'] is False,'Complete icon-only scope proof required')
    svg=ET.fromstring((repository/'assets/brand/arch-mark.svg').read_bytes())
    require(svg.attrib['viewBox']=='0 0 1024 1024' and len(list(svg.iter('{http://www.w3.org/2000/svg}path')))==2,'Canonical complete two-path geometry required')
    a.output.mkdir(parents=True)
    extracted=a.output/'Aux.iconset'
    iconutil=['/usr/bin/iconutil','-c','iconset','-o',str(extracted),str(repository/'assets/brand/Aux.icns')]
    subprocess.run(iconutil,check=True,capture_output=True)
    catalog=a.output/'Assets.xcassets';shutil.copytree(H/'source/Assets.xcassets',catalog)
    content=json.loads((catalog/'AppIcon.appiconset/Contents.json').read_text())
    require({x.name for x in extracted.iterdir()}=={x['filename'] for x in content['images']},'Exact ten approved ICNS raster renditions required')
    rasters=[]
    for image in content['images']:
        source=extracted/image['filename'];data=source.read_bytes();size=int(image['size'].split('x')[0])*int(image['scale'][0])
        require(data[:8]==b'\x89PNG\r\n\x1a\n' and struct.unpack('>II',data[16:24])==(size,size),'Extracted PNG size differs')
        shutil.copyfile(source,catalog/'AppIcon.appiconset'/source.name);rasters.append(ref(source))
    # Match the original catalog's Icon.iconset type and asset name. The document
    # badge consumes only these two sizes; both are existing approved Aux pixels.
    badge=catalog/'Icon.iconset';badge.mkdir()
    for name in ['icon_256x256.png','icon_256x256@2x.png']:shutil.copyfile(extracted/name,badge/name)
    compiled=a.output/'compiled';compiled.mkdir()
    command=['xcrun','actool','--output-format','xml1','--notices','--warnings','--errors',
             '--platform','macosx','--target-device','mac','--minimum-deployment-target','27.0',
             '--app-icon','AppIcon','--output-partial-info-plist',str(a.output/'partial.plist'),
             '--compile',str(compiled),str(catalog)]
    result=subprocess.run(command,text=True,capture_output=True)
    (a.output/'actool.stdout').write_text(result.stdout);(a.output/'actool.stderr').write_text(result.stderr)
    require(result.returncode==0,'actool failed; retain isolated diagnostics')
    output=compiled/'Assets.car';require(output.is_file(),'Actual compiled Assets.car required')
    inspected=subprocess.run(['xcrun','assetutil','--info',str(output)],check=True,text=True,capture_output=True)
    (a.output/'assetutil.json').write_text(inspected.stdout);entries=json.loads(inspected.stdout)
    named={x['Name'] for x in entries if 'Name' in x}
    require('AppIcon' in named and 'Icon' in named and all(x in ['AppIcon','Icon'] or x.startswith('ZZZZPackedAsset-') for x in named),'Only AppIcon/document-badge contract may be compiled')
    actual={(x['PixelWidth'],x['Scale']) for x in entries if x.get('Name')=='AppIcon' and x.get('AssetType')=='Icon Image'}
    expected={(int(x['size'].split('x')[0])*int(x['scale'][0]),int(x['scale'][0])) for x in content['images']}
    require(expected<=actual,'Compiled AppIcon is missing an approved size/scale rendition')
    require(any(x.get('Name')=='Icon' and x.get('AssetType') in ['Icon Image','MultiSized Image'] for x in entries),'Document Icon asset disappeared')
    for item in source_refs:require(ref(item['path'])==item,'Canonical input changed during compile')
    receipt_out={'format':'aux.canonical-icon-catalog.build.v1','passed':True,'sources':source_refs,
        'sourceReceipt':ref(a.receipt),'sourceGeometry':{'viewBox':svg.attrib['viewBox'],'paths':2},
        'generator':ref(__file__),'sourceMetadata':[ref(H/'source-pins.json'),ref(H/'catalog-scope.json'),ref(H/'source-catalog.json')],
        'commands':[iconutil,command],'rasters':rasters,'catalog':ref(output),'catalogBytes':output.stat().st_size,
        'scope':['AppIcon','Icon'],'minimumDeploymentTarget':'27.0','fallbackIcnsUnchanged':True,
        'replacements':[{'path':relative,'input':str(output),'sha256':sha(output.read_bytes()),'previousSha256':pins['originalCatalogSha256'],'mode':rows[relative]['mode']} for relative in pins['targets']],
        'appChanged':False,'productSigned':False,'appExecuted':False,'nativeChromiumBuild':False,'runtimeAccepted':False}
    (a.output/'receipt.json').write_text(json.dumps(receipt_out,indent=2)+'\n')
    print(json.dumps({'receipt':str(a.output/'receipt.json'),'catalog':ref(output),'appChanged':False,'productSigned':False}))

if __name__=='__main__':main()
