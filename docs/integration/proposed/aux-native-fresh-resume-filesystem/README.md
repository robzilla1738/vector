# Focused resumed-owner filesystem check

This fixture compiles the frozen actual fresh/resumed owner, shared inode-keyed
lease registry and existing-only initial-journal reader. It replaces only the
signed-policy identity type with an explicitly named captured fixture type.
There is no signature/authentication acceptance claim. The actual signed policy
loader and full production declarations are checked separately by the paired
runtime consumer graph; they are not invoked here.

Every path is a newly made private disposable tree. Cases cover actual create and
reopen, repeated resumed aliases, fresh/resumed shared operation exclusion,
missing journal without directory/LOCK creation, exact existing journal reads
without recreating a removed fixture lock, absent/malformed/duplicate marker,
unsafe directory mode, live retained-FD child replacement and symlink marker.
Only a synthetic nonsecret journal shape is stored. No authority, key generation,
protected stage, Security operation, daemon, native addon or owner data is used.

A reopened directory is not proof of its creation-time inode after a process
restart; the production context additionally requires the actual protected stage
and authority binding before return. Whole-process custody/readmission remains
outside this fixture. Live retained-owner replacement is explicitly refused.

Run once through `scripts/native-build.py sh .../check.sh`; never run the actual
signed loader merely to test this fixture. No production source fork is added.

Actual serialized session42833 exited0:23 focused filesystem checks passed against the frozen nine inputs. `evidence.json` pins that result; no authenticated policy, Security or authority generation executed.
