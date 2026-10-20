# Chats owner actual155 compiler adaptation

Only two bounded corrections to actual316: Trackable definition now exactly matches its two-argument declaration (the third unused argument was accidental); real NavigateParams raw_ptr result is explicitly unwrapped using get() before auto* deduction. Find retains its actual optional excluded-handle parameter. No classification, tab mutation, behavior, source guards or lifetimes change. Foundation proposals remain immutable.

Pure temporary replay passes; uncompiled/unmounted, no shared native mutation. Root compiles.
