#!/bin/bash
# Single-quoted guest commands expand in the guest, not here.
# shellcheck disable=SC2016

# Builds the local Tart VM that Tartelet clones for every CI job (scripts/ci/README.md).
# Keeps the image's Node 24, adds pnpm through corepack and gitleaks, and
# pre-warms the pnpm store from the committed lockfiles. Nothing secret goes
# into the image: no tokens, no Keychain items, no out/ inputs.
set -euo pipefail

BASE=${AUX_CI_BASE:-ghcr.io/cirruslabs/macos-tahoe-xcode:27}
VM=${AUX_CI_VM:-aux-ci}
PNPM_VERSION=11.27.1
root=$(cd "$(dirname "$0")/../.." && pwd)

if tart list --quiet | grep -qx "$VM"; then
  echo "VM $VM already exists. Delete it first (tart delete $VM) or set AUX_CI_VM." >&2
  exit 1
fi

tart clone "$BASE" "$VM"
tart run "$VM" --no-graphics &
run_pid=$!
trap 'tart stop "$VM" >/dev/null 2>&1 || true; wait "$run_pid" 2>/dev/null || true' EXIT

tart ip "$VM" --wait 300 >/dev/null
until tart exec "$VM" true 2>/dev/null; do sleep 2; done
guest() { tart exec "$VM" bash -lc "$1"; }
# copy_in HOST_FILE GUEST_PATH (relative to the guest's home)
copy_in() { tart exec -i "$VM" bash -c "mkdir -p \"\$HOME/\$(dirname $2)\" && cat > \"\$HOME/$2\"" < "$1"; }

guest 'brew install gitleaks'
# The pnpm shim lands beside node in /opt/homebrew/opt/node@24/bin, which CI puts on PATH.
guest "corepack enable && corepack prepare pnpm@$PNPM_VERSION --activate"
copy_in "$root/scripts/ci/post-boot.sh" .tartelet/post-boot.sh

# Pre-warm the pnpm store with the public packages both lockfiles pin.
copy_in "$root/pnpm-lock.yaml" warm/root/pnpm-lock.yaml
copy_in "$root/package.json" warm/root/package.json
for file in package.json pnpm-lock.yaml pnpm-workspace.yaml; do
  copy_in "$root/services/aux-cloud/$file" "warm/aux-cloud/$file"
done
guest 'cd ~/warm/root && pnpm fetch && cd ~/warm/aux-cloud && pnpm fetch'
guest 'rm -rf ~/warm'

guest 'echo "node $(node --version), pnpm $(pnpm --version), $(python3 --version), gitleaks $(gitleaks version)"'
guest sync
tart stop --timeout 120 "$VM"
wait "$run_pid" || true
trap - EXIT
echo "Built $VM from $BASE."
