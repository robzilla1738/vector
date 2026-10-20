# Non-live signed progress before real load

Counted followup to owneracbb2881e. Original4656178 sets committing,4656180 converts the actual selected direction to float,4656188 calls real progress setter4649d80, then46561fc dispatches the actual profile load. Preserve that source effect for a metadata-only fallback: use the selected signed progress before Start, rather than leaving the page at a partial gesture. Live borrowed preview remains on its real animation/frame handoff. Weak owner/sender is rechecked after actual layer updates; no fabricated completion.

Exact source extract is already pinned in owner/live-or-fallback-commit.asm. Two-file private owner-only patch replay passed; no new input trigger, target execution, shared write or compile.
