# Filter subscription source preparation

These engine-neutral tools consume the maintained native `chrome/browser/ui/aux/semantic/filter-lists` directory. They do not duplicate list texts or licenses in this workspace. All paths are explicit; neither command runs at browser startup.

Generate the runtime headers and native header from the exact pinned manifest, validating source IDs, SHA-256, byte lengths and UTF-8:

```sh
node chromium/filter-lists/build-defaults.mjs \
  --list-directory /absolute/maintained/semantic/filter-lists \
  --contracts-output /absolute/staging/filter-defaults.generated.ts \
  --native-output /absolute/staging/aux_filter_defaults.h
```

Review these outputs before copying them into the workspace/native area patch. The generator writes only the two explicit output paths. List assets, manifest, attribution and GPL license remain in the maintained native source and canonical area patch.

An explicit subscription refresh downloads the manifest's real upstream URLs, retaining pinned uAssets URLs and resolving bounded same-host HTTPS includes. EasyList/EasyPrivacy URLs are live upstream inputs; refreshed bytes and manifests require review. Refresh never overwrites the input directory and does not automatically regenerate or publish product headers:

```sh
python3 chromium/filter-lists/capture-defaults.py \
  --manifest /absolute/maintained/semantic/filter-lists/manifest.json \
  --output-directory /absolute/separate/staging/filter-lists
```

The staging snapshot includes unchanged attribution and GPL license. Use the generator above on the reviewed snapshot. No native Rust wrapper, cosmetic interpreter, or retired engine-specific resource generator is needed.
