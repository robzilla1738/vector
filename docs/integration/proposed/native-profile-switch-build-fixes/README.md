# Profile-switch native compile correction

Actual v47 compilation rejected `NoDestructor<AtomicSequenceNumber>` because the current base sequence is trivially destructible. Use its documented function-local static form and an explicit64-bit sequence for the independent64-bit workspace identity. No SessionID substitution, runtime state or profile behavior changes. Recompile the affected object before claiming success.
