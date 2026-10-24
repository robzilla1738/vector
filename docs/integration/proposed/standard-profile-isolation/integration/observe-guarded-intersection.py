#!/usr/bin/env python3
"""Observe actual validator boundary locals without changing its code or outcome."""
from pathlib import Path
import sys,runpy,json
HERE=Path(__file__).resolve().parent
PACKAGE=HERE.parent/'package-v10'
output=HERE/'guarded-intersection-v10.json'
assert not output.exists()
def trace(frame,event,arg):
 if event=='line' and frame.f_code.co_filename==str(PACKAGE/'successor_verify.py') and frame.f_code.co_name=='verify_browser' and frame.f_lineno==349:
  v=frame.f_locals
  data={'format':'aux.validator.actual-guard-intersection.v1','intersections':sorted(v['intersections']),'guardedExpected':sorted(v['expected']),'replayedValues':sorted(v['values']),'toolChanged':False,'successInvented':False}
  with output.open('x') as f:json.dump(data,f,indent=2);f.write('\n')
 return trace
sys.path.insert(0,str(PACKAGE))
sys.argv=[str(PACKAGE/'bind_pair.py'),'--link-result','/private/tmp/aux-daemon-crash-registration-close-check/results.json','--output',str(PACKAGE/'source-pair-final.json')]
sys.settrace(trace)
runpy.run_path(str(PACKAGE/'bind_pair.py'),run_name='__main__')
