# Match Agent panel sizing to its installed border

The full-height Aux Agent panel now installs an explicit empty border, but SidePanel still adds/subtracts the stock border in its default/minimum width, content-size upper bound and resize metric. That reports 18 fewer horizontal content pixels and 5 fewer vertical pixels than the actual zero-inset FillLayout.

Use the actual GetInsets() for the explicitly empty border in the Aux Mac owner. Other panels retain the existing calculations: AddHeaderView and RemoveHeaderView rebuild their nonempty borders from the static stock insets before content is added. The current owner has exactly one explicit empty-border caller, the Aux Agent branch in PopulateSidePanel. No current-entry-key query is used because that key is updated later in population.

Construction/early query safety: SidePanel's constructor calls GetMinimumSize before any border is installed. The helper requires a non-null border as well as empty actual insets; a null border preserves the original stock estimate. PopulateSidePanel installs Agent's border before entry content creation and invokes UpdateWidthOnEntryChanged after setting the current key, so the final default width uses the correct actual insets. Existing saved outer-width preferences are left unchanged.

This single-file patch uses exact native v543 preimage/output hashes. Disposable patch replay passed; border-construction paths are unchanged. No shared native edits, build or desktop actions. Focused runtime acceptance is Agent resize/reopen and switching between Agent and an ordinary panel.
