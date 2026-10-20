
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 415d554: d100c3ff     	sub	sp, sp, #0x30
 415d558: a9014ff4     	stp	x20, x19, [sp, #0x10]
 415d55c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 415d560: 910083fd     	add	x29, sp, #0x20
 415d564: d0056d28     	adrp	x8, 0xef03000 <dyld_stub_binder+0xef03000>
 415d568: 91254108     	add	x8, x8, #0x950
 415d56c: 38bfc108     	ldaprb	w8, [x8]
 415d570: 36000248     	tbz	w8, #0x0, 0x415d5b8 <_ChromeMain+0x415831c>
 415d574: d0056d33     	adrp	x19, 0xef03000 <dyld_stub_binder+0xef03000>
 415d578: 39648268     	ldrb	w8, [x19, #0x920]
 415d57c: 34000168     	cbz	w8, 0x415d5a8 <_ChromeMain+0x415830c>
 415d580: d0056d28     	adrp	x8, 0xef03000 <dyld_stub_binder+0xef03000>
 415d584: 39e45d08     	ldrsb	w8, [x8, #0x917]
 415d588: 36f800e8     	tbz	w8, #0x1f, 0x415d5a4 <_ChromeMain+0x4158308>
 415d58c: d0056d28     	adrp	x8, 0xef03000 <dyld_stub_binder+0xef03000>
 415d590: 91240108     	add	x8, x8, #0x900
 415d594: f9400100     	ldr	x0, [x8]
 415d598: f9400908     	ldr	x8, [x8, #0x10]
 415d59c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 415d5a0: 96faae46     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 415d5a4: 3924827f     	strb	wzr, [x19, #0x920]
 415d5a8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 415d5ac: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 415d5b0: 9100c3ff     	add	sp, sp, #0x30
 415d5b4: d65f03c0     	ret
 415d5b8: d0056d33     	adrp	x19, 0xef03000 <dyld_stub_binder+0xef03000>
 415d5bc: 91254273     	add	x19, x19, #0x950
 415d5c0: aa1303e0     	mov	x0, x19
 415d5c4: 94fa9cbf     	bl	0x80048c0 <_ChromeMain+0x7fff624>
 415d5c8: 34fffd60     	cbz	w0, 0x415d574 <_ChromeMain+0x41582d8>
 415d5cc: d0056d28     	adrp	x8, 0xef03000 <dyld_stub_binder+0xef03000>
