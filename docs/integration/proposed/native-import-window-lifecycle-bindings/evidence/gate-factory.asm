
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2e84c48: d100c3ff     	sub	sp, sp, #0x30
 2e84c4c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 2e84c50: a9027bfd     	stp	x29, x30, [sp, #0x20]
 2e84c54: 910083fd     	add	x29, sp, #0x20
 2e84c58: 90060408     	adrp	x8, 0xef04000 <dyld_stub_binder+0xef04000>
 2e84c5c: 9108c108     	add	x8, x8, #0x230
 2e84c60: 38bfc108     	ldaprb	w8, [x8]
 2e84c64: 360000e8     	tbz	w8, #0x0, 0x2e84c80 <_ChromeMain+0x2e7f9e4>
 2e84c68: 90060400     	adrp	x0, 0xef04000 <dyld_stub_binder+0xef04000>
 2e84c6c: 9107a000     	add	x0, x0, #0x1e8
 2e84c70: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 2e84c74: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 2e84c78: 9100c3ff     	add	sp, sp, #0x30
 2e84c7c: d65f03c0     	ret
 2e84c80: 90060413     	adrp	x19, 0xef04000 <dyld_stub_binder+0xef04000>
 2e84c84: 9108c273     	add	x19, x19, #0x230
 2e84c88: aa1303e0     	mov	x0, x19
 2e84c8c: 9545ff0d     	bl	0x80048c0 <_ChromeMain+0x7fff624>
 2e84c90: 34fffec0     	cbz	w0, 0x2e84c68 <_ChromeMain+0x2e7f9cc>
 2e84c94: 90060414     	adrp	x20, 0xef04000 <dyld_stub_binder+0xef04000>
 2e84c98: 9107a294     	add	x20, x20, #0x1e8
 2e84c9c: 97473ca0     	bl	0x53f1c <_ChromeMain+0x4ec80>
 2e84ca0: aa0003e2     	mov	x2, x0
 2e84ca4: f0056281     	adrp	x1, 0xdad7000 <dyld_stub_binder+0xdad7000>
 2e84ca8: 91112821     	add	x1, x1, #0x44a
 2e84cac: aa1403e0     	mov	x0, x20
 2e84cb0: 52800003     	mov	w3, #0x0                ; =0
 2e84cb4: 976e3cc5     	bl	0xa13fc8 <_ChromeMain+0xa0ed2c>
 2e84cb8: a9027e9f     	stp	xzr, xzr, [x20, #0x20]
 2e84cbc: f9001a9f     	str	xzr, [x20, #0x30]
 2e84cc0: b00585a8     	adrp	x8, 0xdf39000 <dyld_stub_binder+0xdf39000>
 2e84cc4: 3dc28d00     	ldr	q0, [x8, #0xa30]
 2e84cc8: 3c838280     	stur	q0, [x20, #0x38]
 2e84ccc: f0059c08     	adrp	x8, 0xe207000 <dyld_stub_binder+0xe207000>
 2e84cd0: 9103c108     	add	x8, x8, #0xf0
 2e84cd4: f9000288     	str	x8, [x20]
 2e84cd8: 52800034     	mov	w20, #0x1               ; =1
 2e84cdc: 089ffe74     	stlrb	w20, [x19]
 2e84ce0: f005f320     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 2e84ce4: 9127c000     	add	x0, x0, #0x9f0
 2e84ce8: 9545fef9     	bl	0x80048cc <_ChromeMain+0x7fff630>
 2e84cec: 35000380     	cbnz	w0, 0x2e84d5c <_ChromeMain+0x2e7fac0>
 2e84cf0: 90060408     	adrp	x8, 0xef04000 <dyld_stub_binder+0xef04000>
 2e84cf4: 3948c513     	ldrb	w19, [x8, #0x231]
