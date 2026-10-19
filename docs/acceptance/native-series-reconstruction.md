# Native series reconstruction evidence

Implements the accepted plan's Phase2 patch reconstruction requirement. This is source reconstruction evidence, not a clean native build, runtime acceptance or provenance approval.

The verifier reads a committed workspace revision, archives only series-owned upstream paths from native base `0e66b94549a8bd85f03fbdf189b752d6e7b63c32`, applies the ordered series in a newly created disposable directory, and compares SHA256 and executable bits against the current product checkout. It never modifies the product checkout or invokes GN/the compiler.

The retired `chrome/browser/ui/aux/`, `chrome/browser/resources/aux/`, `chrome/browser/resources/aux_host/`, `ui/aux/generated/` and `resources/aux/` paths are excluded by path metadata. Their content is not inspected. These exclusions are a proposed retirement boundary, not permission to delete existing files. The integrator must review remaining conditional dependencies and the owner-confirmation requirement for untracked resource retirement.

Run from this workspace:

```sh
python3 scripts/verify-native-series.py \
  --source /Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src \
  --output /absolute/new/disposable/proof-directory
```

The report distinguishes an application failure from a performed byte comparison. An empty mismatch list after an application failure is not success. A nonzero process result means application or byte verification failed.

## First run

Workspace revision `bcaf4d4e8b3654bdc4ad01a421d65ccbd98ef6fc`, upstream/current native HEAD as above:

- 100 ordered patches;678 included paths and466 excluded retired paths.
- 87 patches applied. Patch0089 failed its `chrome/browser/ui/BUILD.gn` hunk.
- That hunk assumed the platform/profile-state dependencies existed before patch0089, but patch0090 actually adds them.
- A context-only correction to0089 anchors the new profile-gate dependency against the existing browser-identifier dependencies. It changes no resulting native bytes.
- With that proposed correction in the disposable tree, all100 patches applied and all678 included native paths matched current SHA256/executable state. No other patch or product-source change was needed for that comparison.

A fresh committed-revision rerun and area-patch preparation follow this initial correction. The active product build remains untouched. Full-series acceptance still requires retirement review, consolidated area patches, source/provenance checks, and a fresh full build from the complete resulting tree.

## Committed rerun and proposed area reconstruction

The committed verifier correction at `f1d711357` was rerun in `out/series-proof-2`. All 100 ordered patches applied; all 678 included paths matched the active native source SHA256 and executable bits. The excluded 466 paths were not read. This comparison happened before overlaying proposals 0102–0104 in the disposable tree.

`scripts/consolidate-native-series.py` builds five area patches from that limited upstream baseline to the declared proposed tree, reapplies them in another disposable tree, compares all included paths, then reverses them and verifies the exact baseline Git tree. It performs the operations sequentially. The proposed output is review material, not the shipped series. The integrator must regenerate from the latest committed complete series after later native changes, including 0101, and make the final consolidation decision.

The area output excludes retired paths; it does not prove those paths are unreachable in every configuration. No product checkout was modified, no full native build was run by these scripts, and no provenance approval follows from successful application.
