"""Helpers the runtime build scripts share: pinned downloads, extraction and subprocesses."""
import hashlib
import shutil
import subprocess
import tarfile
import urllib.request
from pathlib import Path

SUFFIXES = ('.tar.gz', '.tgz', '.tar.xz', '.tar.bz2')


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run(command, cwd=None, env=None):
    print('+', ' '.join(map(str, command)), flush=True)
    subprocess.run([str(c) for c in command], cwd=cwd, env=env, check=True)


def output(*command) -> str:
    return subprocess.run([str(c) for c in command], capture_output=True, text=True, check=True).stdout


def fetch(source: dict, directory: Path) -> Path:
    suffix = next(s for s in SUFFIXES if source['url'].endswith(s))
    archive = directory / f"{source['name']}-{source['version']}{suffix}"
    if not archive.exists() or sha256(archive) != source['sha256']:
        directory.mkdir(parents=True, exist_ok=True)
        partial = archive.with_name(archive.name + '.partial')
        request = urllib.request.Request(source['url'], headers={'User-Agent': 'curl/8'})
        with urllib.request.urlopen(request, timeout=600) as response, partial.open('wb') as handle:
            shutil.copyfileobj(response, handle)
        if sha256(partial) != source['sha256']:
            partial.unlink()
            raise SystemExit(f"{source['name']}: sha256 mismatch for {source['url']}")
        partial.rename(archive)
    return archive


def extract(source: dict, archive: Path, directory: Path) -> Path:
    target = directory / source['name']
    shutil.rmtree(target, ignore_errors=True)
    target.mkdir(parents=True)
    with tarfile.open(archive) as tar:
        tar.extractall(target, filter='data')
    (root,) = (p for p in target.iterdir() if not p.name.startswith('._'))
    return root
