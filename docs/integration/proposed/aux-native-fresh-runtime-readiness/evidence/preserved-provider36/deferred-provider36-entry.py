#!/usr/bin/env python3
# SAME waiting serializer40860; prior31/provider36 entries retained in baselines.
import os,pathlib,sys
repo=pathlib.Path(__file__).resolve().parents[4]
os.execv(sys.executable,[sys.executable,str(repo/'docs/integration/proposed/aux-native-fresh-runtime-provider-quarantine/typecheck.py')])
