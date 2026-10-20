# Stop the retained preview animation on exit

Original region462d53c and462d8a4 stop its SlideAnimation before hiding the retained preview. Stop the same actual animation before SetVisible(false), preserving its canceled/current-frame callback and the next drag starting from its real source bounds. Static callsite pins live in native-cross-section-drag-preview/evidence/region-callbacks.asm.
