# Chromium155 preview and pin API corrections

Focused compilation found a shadowed if-initializer, a helper hiding the inherited Views context-menu virtual, and the native BrowserView exposing BrowserWindowInterface. Rename only the two local helpers/bindings and accept the real browser interface in the two weak-pointer constructors. Actual sender dispatch, model mutations and menu behavior are unchanged. No new downcast or replacement browser is introduced.
