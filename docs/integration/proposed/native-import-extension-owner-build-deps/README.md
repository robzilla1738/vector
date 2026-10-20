# Actual importer build dependencies

Add the original extension installation owner’s two new sources and explicit extensions/common dependency to the existing importer target. Add //url to the migrator for source extension URL validation and the bookmark-admission GURL consumer. All three existing GN anchors are count-checked once. No target or runtime success substitute is added. Generation and compilation are separate.
