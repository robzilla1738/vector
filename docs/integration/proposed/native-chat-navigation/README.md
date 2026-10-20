# Original New Chat navigation and account fallback

Source-only proposal. Two new files plus an exact delta to the current native Chats transport. Shared native source is untouched; this has not been compiled, mounted or accepted at runtime.

Original command **34067**, selected by `4561570` jump-table entry67, executes `4562b1c`. It requires the actual installed Agent (all five ExtensionRegistry sets), uses nonnegative `aside.account_id`, otherwise original helper **41035c0**, then zero when unset. Crucially, that helper does **not** read daemon `currentAccountId`: it walks real ProfileAttributesStorage display-order entries, compares their actual paths to the profile path and returns the matching index. This corrects the earlier transport foundation's wrong evidence/comment and fallback. `ChatAccountForProfile` shares the recovered semantics between navigation and the real transport, without reading any account registry or owner profile files.

The original order helper **02b3cee0** is the same previously recovered `GetAllProfilesAttributesSortedForDisplay` call chain (see native-profile-switch-owner/README.md). This is a route-account fallback only; it does not alter native APIs' different profileIndex contracts or grant authentication. Original OTR skips both pref and ordered-index fallback, selecting route zero. No Vault gate or manufactured authenticated state is added.

The canonical destination is the real Agent `main.html#/u/N/tasks/new`. Exact matcher **4564b14** checks complete GURLs: visible URL, last committed URL, visible navigation entry URL/virtualURL, pending entry URL/virtualURL, last committed entry URL/virtualURL. It does not strip a query, slash or task ID. The active matching tab wins; otherwise the first matching remaining real tab is activated with source gesture6 (`kNone`). Otherwise real NavigateParams uses LINK, NEW_FOREGROUND_TAB, actual active source contents and kShowWindow. The already ported actual155 Navigator's vertical placement/group code handles the source insertion policy; it is not duplicated here.

Root integration: add `aux_chat_navigation.cc/.h` to the existing enabled-Mac source target that owns `aux_chats_transport.cc`; no extra target is needed. A separate isolated command-registration proposal will supply 34067. The current independent body remains until genuine sections and real owners are mounted coherently.

Run `python3 verify.py` for original artifact/range pins and pure temporary-tree replay only. No target execution, network, credentials, Keychain, native mutation or build occurs.
