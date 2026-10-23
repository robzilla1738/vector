#!/usr/bin/env python3
# SAME serializer40860; prior36 entry/recipe/pins retained in readiness evidence.
import os,pathlib,sys
repo=pathlib.Path(__file__).resolve().parents[4]
os.execv(sys.executable,[sys.executable,str(repo/'docs/integration/proposed/aux-native-fresh-runtime-readiness/typecheck.py')])
