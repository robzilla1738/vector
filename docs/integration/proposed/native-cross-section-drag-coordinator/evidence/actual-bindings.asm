
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37e0bd8: f9435674     	ldr	x20, [x19, #0x6a8]
 37e0bdc: 925e7676     	and	x22, x19, #0xfffffffc00000000
 37e0be0: f9404788     	ldr	x8, [x28, #0x88]
 37e0be4: eb0802df     	cmp	x22, x8
 37e0be8: 54000061     	b.ne	0x37e0bf4 <_ChromeMain+0x37db958>
 37e0bec: aa1303e0     	mov	x0, x19
 37e0bf0: 9720cdc3     	bl	0x142fc <_ChromeMain+0xf060>
 37e0bf4: 52800700     	mov	w0, #0x38               ; =56
 37e0bf8: 9720b9dc     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e0bfc: aa0003f5     	mov	x21, x0
 37e0c00: 52800037     	mov	w23, #0x1               ; =1
 37e0c04: b9000017     	str	w23, [x0]
 37e0c08: 90007408     	adrp	x8, 0x4660000 <_ChromeMain+0x465ad64>
 37e0c0c: 913e0108     	add	x8, x8, #0xf80
 37e0c10: 105c7989     	adr	x9, 0x3899b40 <_ChromeMain+0x38948a4>
 37e0c14: d503201f     	nop
 37e0c18: a900a408     	stp	x8, x9, [x0, #0x8]
 37e0c1c: f0007248     	adrp	x8, 0x462b000 <_ChromeMain+0x4625d64>
 37e0c20: 91170108     	add	x8, x8, #0x5c0
 37e0c24: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e0c28: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e0c2c: f9404788     	ldr	x8, [x28, #0x88]
 37e0c30: eb0802df     	cmp	x22, x8
 37e0c34: 54000061     	b.ne	0x37e0c40 <_ChromeMain+0x37db9a4>
 37e0c38: aa1303e0     	mov	x0, x19
 37e0c3c: 9720cdb0     	bl	0x142fc <_ChromeMain+0xf060>
 37e0c40: 52800700     	mov	w0, #0x38               ; =56
 37e0c44: 9720b9c9     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e0c48: aa0003f6     	mov	x22, x0
 37e0c4c: b0007408     	adrp	x8, 0x4661000 <_ChromeMain+0x465bd64>
 37e0c50: 9100b108     	add	x8, x8, #0x2c
 37e0c54: 105c7769     	adr	x9, 0x3899b40 <_ChromeMain+0x38948a4>
 37e0c58: d503201f     	nop
 37e0c5c: b9000017     	str	w23, [x0]
 37e0c60: a900a408     	stp	x8, x9, [x0, #0x8]
 37e0c64: f0007248     	adrp	x8, 0x462b000 <_ChromeMain+0x4625d64>
 37e0c68: 912a6108     	add	x8, x8, #0xa98
 37e0c6c: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e0c70: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e0c74: 925e7668     	and	x8, x19, #0xfffffffc00000000
 37e0c78: f9404789     	ldr	x9, [x28, #0x88]
 37e0c7c: eb09011f     	cmp	x8, x9
 37e0c80: 54000061     	b.ne	0x37e0c8c <_ChromeMain+0x37db9f0>
 37e0c84: aa1303e0     	mov	x0, x19
 37e0c88: 9720cd9d     	bl	0x142fc <_ChromeMain+0xf060>
 37e0c8c: 52800700     	mov	w0, #0x38               ; =56
 37e0c90: 9720b9b6     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e0c94: aa0003e3     	mov	x3, x0
 37e0c98: 52800028     	mov	w8, #0x1                ; =1
 37e0c9c: b9000008     	str	w8, [x0]
 37e0ca0: b0003ac8     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e0ca4: 913a0109     	add	x9, x8, #0xe80
 37e0ca8: 105c74c8     	adr	x8, 0x3899b40 <_ChromeMain+0x38948a4>
 37e0cac: d503201f     	nop
 37e0cb0: a900a009     	stp	x9, x8, [x0, #0x8]
 37e0cb4: f0007248     	adrp	x8, 0x462b000 <_ChromeMain+0x4625d64>
 37e0cb8: 913ab108     	add	x8, x8, #0xeac
 37e0cbc: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e0cc0: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e0cc4: aa1403e0     	mov	x0, x20
 37e0cc8: aa1503e1     	mov	x1, x21
 37e0ccc: aa1603e2     	mov	x2, x22
 37e0cd0: 94389884     	bl	0x4606ee0 <_ChromeMain+0x4601c44>
