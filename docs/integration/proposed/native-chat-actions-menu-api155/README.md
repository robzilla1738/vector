# Actual155 menu callback declaration

Focused305 compile found hidden SimpleMenuModel::Delegate::MenuClosed(SimpleMenuModel*) and an incomplete MenuSourceType enum. Name the private generation callback OnMenuClosedForGeneration, preserving its explicit MenuRunner binding/posted completion, and include the real menu_source_type.mojom.h. This does not override the separate delegate virtual or change menu effects.
