#!/usr/bin/env python3
"""Verify the counted successor without executing native/kernel code."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent

def sha(value):
    return hashlib.sha256(value).hexdigest()

review = json.loads((HERE / 'process-and-send-ownership-review.json').read_text())
assert sha((HERE / 'baseline-v1/inputs.json').read_bytes()) == review['parentInputsSha256']
for row in review['files']:
    before = (HERE / 'baseline-v1' / Path(row['path']).name).read_bytes()
    assert sha(before) == row['inputSha256']
    text = before.decode()
    for edit in row['edits']:
        assert text.count(edit['find']) == edit['count'] == 1
        text = text.replace(edit['find'], edit['replace'])
    assert sha(text.encode()) == row['outputSha256']
    assert (HERE / row['path']).read_text() == text
pins = json.loads((HERE / 'inputs.json').read_text())
repo = HERE.parents[3]
for row in pins['sources']:
    assert sha((repo / row['path']).read_bytes()) == row['sha256']
print('PASS: frozen parent hashes; counted process/right ownership successor; current pins')
