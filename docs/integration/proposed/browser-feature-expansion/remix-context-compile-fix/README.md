# Remix result dictionary compiler correction

The actual a20 compile rejects chaining Set on an lvalue DictValue because its return value is a Value pointer. Three independent Set calls preserve the same result fields and authorization behavior. Exact predecessor and output hashes are pinned in manifest.json. No execution or product signing.
