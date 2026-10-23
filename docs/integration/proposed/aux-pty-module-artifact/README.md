# Retained unsigned PTY module for native symbol pairing

The earlier producer source check deliberately removed temporary outputs. This separate recipe retains one fresh unsigned module artifact so the actual current native main can be compared with its real imports. The baseline source checker, its receipts and source histories are unchanged.

`inputs.json` pins the current revision4 producer and sole-wait header, its source manifest, the canonical six-function host ABI, actual Node26.5 N-API headers and exact node-addon-api7.1.0 headers. `build.py` checks those inputs before and after one actual compile/link. It requires an explicitly named, fresh, absolute output directory with a canonical parent, creates it exclusively with mode 0700, and refuses reuse. It leaves the object, unsigned module, actual undefined/defined symbol lists, load-command metadata, build log and success receipt there. Failed builds leave their fresh output/log for diagnosis; the recipe does not delete or retry them.

Run through the workspace native-build lock, using existing exact headers:

```sh
python3 scripts/native-build.py python3 /tmp/aux-pty-direct-child-fix/docs/integration/proposed/aux-pty-module-artifact/build.py \
  --workspace /Users/rcourson/Documents/Vibe/web \
  --node-source /Users/rcourson/Documents/Vibe/web/out/aux-node-static-26.5.0/node-v26.5.0 \
  --addon-headers /private/tmp/aux-node-pty-build-deps-20261023/node_modules/node-addon-api \
  --output /private/tmp/aux-pty-module-current-20261023-a
```

The real linker explicitly disables automatic ad-hoc signing; the recipe verifies no LC_CODE_SIGNATURE. It verifies all six native reservation/helper imports and the actual N-API module-registration export. The full import list and filtered Node/N-API imports are retained for a separate comparison against the actual main executable. This recipe alone does not resolve or prove host symbol satisfaction. It neither loads nor executes the addon, helper or native main; it does not build the helper, Node or browser, sign anything, alter policy/startup/packaging, change the accepted app/UI, or establish runtime helper admission, Environment lifecycle or descendant custody.

The actual single serialized build passed on 2026-10-23. Its retained module is `/private/tmp/aux-pty-module-current-20261023-a/pty.node`, 168040 bytes, SHA256 `5b703ca2ae0901cc2b8e8e1064aaf4b78a386f402578a995834a8024de433726`. The exact actual receipt is copied to `evidence/artifact-receipt.json`; the external output also retains raw nm/otool metadata and log. Source/header inputs and the executed recipe/input-control hashes matched before and after compilation. No helper/Node/browser rebuild, module load, execution, signing or accepted-runtime change occurred. Actual main-symbol satisfaction is a separate required comparison, not established by this producer build alone.
