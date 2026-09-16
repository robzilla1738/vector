// Copyright (C) 2026 Vector contributors. Test262-subset fixture (VEC-025).
assert.sameValue(true && true, true);
assert.sameValue(true && false, false);
assert.sameValue(false || true, true);
assert.sameValue(false || false, false);
