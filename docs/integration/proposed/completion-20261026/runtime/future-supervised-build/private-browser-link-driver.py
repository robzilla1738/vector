#!/usr/bin/env python3
"""Exact private product outputs; preserve unsigned-only policy and real driver."""
from pathlib import Path
import importlib.util,json,os,sys
# The shared host filter can only name shared-tree outputs. This narrower
# product-only adapter never removes unsigned flags and grants no host signing.
root=Path(sys.argv[1]);args=sys.argv[2:]
assert root.is_absolute() and root.parent==Path('/private/tmp') and root.name.startswith('aux-future-browser-link-')
assert Path.cwd()==Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src/out/AuxFast')
assert args.count('-o')==1 and args.count('-Wl,-no_adhoc_codesign')==1
output=Path(args[args.index('-o')+1]);assert output in [root/'Aux',root/'Aux Framework'] and not output.exists()
assert not any('adhoc_codesign' in x and x!='-Wl,-no_adhoc_codesign' for x in args)
assert args.count('@'+str(output)+'.rsp')==1
recipe=json.loads((root/'recipe.json').read_text());match=[x for x in recipe['links'] if x['label']==output.name];assert len(match)==1
# Consume only the exact command frozen by the private link recipe.
assert match[0]['command'][3:]==args
for arg in args:
 if arg.startswith('-Wcrl,'):
  kind=arg.split(',')[1];assert kind in ['driver','strippath','installnametoolpath','otoolpath','nmpath','tocname']
  if kind=='tocname':assert arg=='-Wcrl,tocname,'+str(output)+'.TOC'
path=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src/build/toolchain/apple/linker_driver.py')
spec=importlib.util.spec_from_file_location('original_aux_linker_driver',path);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
module.LinkerDriver([str(path),*args]).run()
