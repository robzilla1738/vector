# Actual Safari client build ownership

Register the two genuine Safari client adapter sources and its real model/service/importer dependencies on the existing importer target. Remove that target’s retired independent safari_archive dependency; the legacy archive target and probe remain historical source without public importer ownership. The genuine SafariDataImporter target owns real archive parsing, history, password, bookmark/reading-list and card destinations. No runtime service or success substitute is introduced. Generation and native compilation remain separate.
