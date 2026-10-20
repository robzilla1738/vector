# Actual clamped numeric template adaptation

Actual335 compilation rejects std::max mixed int and ClampedNumeric<int> operands. Explicitly unwrap the two already clamped subtraction results with RawValue() before template deduction. Overflow clamping, display bounds and original placement semantics are preserved. No original source proposal is rewritten.
