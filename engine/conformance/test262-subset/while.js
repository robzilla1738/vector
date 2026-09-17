assert.sameValue(while (0) 9, undefined);
assert.sameValue((i = 0, while (i < 3) i = i + 1), 3);
assert.sameValue((i = 5, while (i > 1) i = i - 1), 1);
