assert.sameValue(if (0) 1 else 2, 2);
assert.sameValue(if (1) 2 else 3, 2);
assert.sameValue(if (1) (if (0) 1 else 2) else 3, 2);
