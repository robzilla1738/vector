"""Disposable host: one bounded JSON ping; no network, files, or credentials."""
import json
import struct
import sys

header = sys.stdin.buffer.read(4)
if len(header) != 4:
    raise SystemExit(1)
size = struct.unpack('=I', header)[0]
if size > 4096:
    raise SystemExit(2)
data = sys.stdin.buffer.read(size)
if len(data) != size:
    raise SystemExit(3)
request = json.loads(data)
if request != {'ping': 'aux-dummy-only'}:
    raise SystemExit(4)
response = json.dumps({'pong': 'aux-dummy-only'}).encode()
sys.stdout.buffer.write(struct.pack('=I', len(response)) + response)
sys.stdout.buffer.flush()
