# Actual155 menu include and GURL accessors

Focused304 compile found the moved SimpleMenuModel header and removed GURL *_piece accessors. Use ui/menus/simple_menu_model.h and actual155 host()/path()/ref() constant string references. Preserve original URL comparisons/navigation rules and real menu model, with no URL-string fallback or reconstructed menu.
