# Stop private provider continuation on real owner loss

Apply after `e502ae81e` cache metadata provider output. The private provider now binds all four mutating callbacks to its own final-member WeakPtrFactory. Prepare/Revalidate use explicit weak static dispatch, returning an absent plan/false only before effects if the real provider has gone. No callback keeps an unretained provider receiver.

Each mutating phase records the actual visible and both cache window weak identities before effects. After delegated lifecycle effects, private owner retirement/construction and cohort/cache completion it checks those identities and the provider before the next dereference. The cache helper similarly checks its two real window owners. These checks stop caller continuation; they do not make an unsafe callee safe or synthesize a transaction result. Existing individual owner patches retain their own actual callback/lifetime guards.

This must compose with root's genuine normal-close deferral and weak core cleanup proposal `244b3bbe6`. That proposal retains the real normal close request and retries the real BrowserWindow::Close only after the synchronous transaction settles. This patch alone is not unconditional destruction acceptance: forced CloseNow/native owner destruction can leave an incomplete saved-group cohort whose destructor correctly refuses an unknown completion. Actual forced-retirement semantics remain unresolved; no fake Commit/Abort or dropped observations were added. The UI trigger stays inactive.

Verification: exact baseline/output SHA pins and independent one-file filesystem replay passed. Shared source/build and runtime/owner state were untouched. Actual compile and functional acceptance remain pending.
