# Copyright 2026 The Aux Authors. BSD-3-Clause.
# Explicit network refresh into a separate reviewed staging directory.
import argparse
import urllib.request, json, hashlib, re
from pathlib import Path
from urllib.parse import urljoin, urlparse

parser = argparse.ArgumentParser(description="Refresh a pinned manifest's subscriptions into staging; never runs at startup.")
parser.add_argument("--manifest", type=Path, required=True)
parser.add_argument("--output-directory", type=Path, required=True)
args = parser.parse_args()
original = json.loads(args.manifest.read_text())
root = args.output_directory.resolve()
if root == args.manifest.resolve().parent:
    parser.error("Refresh requires a separate staging directory")
root.mkdir(parents=True, exist_ok=True)
commit = original["uAssetsCommit"]
items = [(s["name"], s["url"], s["upstream"]) for s in original["sources"]]
if len(items) > 20:
    raise ValueError("Too many subscriptions")
for _, url, pinned in items:
    if urlparse(url).scheme != "https" or urlparse(pinned).scheme != "https":
        raise ValueError("Subscription sources must use HTTPS")
# Retain the original attribution and license alongside the refreshed snapshot.
for name in ("ATTRIBUTION.md", "LICENSE-GPL-3.0.txt"):
    (root / name).write_bytes((args.manifest.parent / name).read_bytes())
raws={}
def expand(url,ancestors=()):
 if url in ancestors or len(ancestors)>=8:raise ValueError('Include cycle or excessive nesting')
 if url not in raws:
  if len(raws)>=64:raise ValueError('Too many include sources')
  with urllib.request.urlopen(url,timeout=30) as response:
   raw=response.read(16*1024*1024+1)
   if len(raw)>16*1024*1024:raise ValueError('Oversized source')
   raws[url]=raw.decode('utf-8',errors='strict')
 lines=[]
 for line in raws[url].splitlines(keepends=True):
  match=re.fullmatch(r'!#include\s+(\S+)\s*',line.strip())
  if match:
   child=urljoin(url,match[1])
   if urlparse(child).netloc!=urlparse(url).netloc or not child.startswith('https://'):raise ValueError('Foreign include')
   lines.append('! Included '+child+'\n'+expand(child,(*ancestors,url))+'\n')
  else:lines.append(line)
 text=''.join(lines)
 if len(text.encode())>16*1024*1024:raise ValueError('Expanded source too large')
 return text
manifest=[]
for name,url,pinned in items:
 text=expand(pinned or url);raw=text.encode();id=hashlib.sha256(url.encode()).hexdigest()[:12]
 (root/(id+'.txt')).write_bytes(raw)
 manifest.append(dict(id=id,name=name,url=url,enabled=True,kind='adblock',sha256=hashlib.sha256(raw).hexdigest(),bytes=len(raw),file=id+'.txt',upstream=pinned or url))
 print(name,len(raw),flush=True)
if sum(s['bytes'] for s in manifest)>64*1024*1024:raise ValueError('Oversized snapshot')
(root/'manifest.json').write_text(json.dumps(dict(uAssetsCommit=commit,sources=manifest,originalFiles=[dict(url=url,sha256=hashlib.sha256(raw.encode()).hexdigest(),bytes=len(raw.encode())) for url,raw in sorted(raws.items())]),indent=2)+'\n')
