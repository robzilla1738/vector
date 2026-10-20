# Actual155 menu delegate name adaptation

Keep the generation-specific private callback distinct from SimpleMenuModel::Delegate::MenuClosed(). This applies the same already compiled compatibility rule as AuxChatActions: rename the private callback only; preserve post-loop generation checks, ordering, menu flags and effects. Original proposal remains immutable.
