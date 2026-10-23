#!/usr/bin/env python3
# SAME pending serializer session40860, superseded before child dispatch.
# Exact original31 recipe is preserved in the provider proposal baseline.
import os,pathlib,sys
repo=pathlib.Path(__file__).resolve().parents[4]
os.execv(sys.executable,[sys.executable,str(repo/'docs/integration/proposed/aux-native-fresh-runtime-provider/typecheck.py')])
