# Preserve public reader signature

One-file integration followup after a7412eab7. The public header still declares the original three-argument ReadEncryptedCategory; a defaulted four-argument definition would create ambiguity. Retain the exact public wrapper and put the byte-capable four-argument implementation (no default) in an anonymous namespace. Only ReadChromiumMigrationSnapshot calls private Impl(true); public wrapper forwards false. No header, caller contract, source/auth policy, native operation or GN change. Static disposable replay only; compilation is root-owned.
