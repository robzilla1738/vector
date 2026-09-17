assert.sameValue(for (i = 0; i < 3; i = i + 1) i, 2);
assert.sameValue(for (i = 1; i < 1; i = i + 1) 9, undefined);
assert.sameValue((s = 0, for (i = 0; i < 4; i = i + 1) s = s + i), 6);
