/** Produce a compact immutable source inventory for packaged cache provisioning. */
export function runtimeSourcePinsBytes(runtime) {
  if (runtime.sourceVersion !== '1.26.1019.335') throw new Error('Unexpected runtime source version');
  const files = runtime.files.map(({ path, type, mode, size, sourceSha256, linkTarget, anchors }) => ({
    path, type, mode, ...(size === undefined ? {} : { size }),
    ...(sourceSha256 ? { sourceSha256 } : {}), ...(linkTarget ? { linkTarget } : {}),
    ...(anchors?.length ? { anchors } : {}),
  }));
  return Buffer.from(JSON.stringify({ version: 1, sourceVersion: runtime.sourceVersion, files }));
}
