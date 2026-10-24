# Actual span compiler correction

The actual native compiler reported StrictNumeric<int> offset conversion at the record receipt span. Fixed all same-class literal offsets as compile-time subspan<offset,count>() calls; dynamic bounded size_t offsets remain unchanged. No bounds, policy, target, source or UI semantics change. Source replay only; root owns actual Ninja-path compilation.
