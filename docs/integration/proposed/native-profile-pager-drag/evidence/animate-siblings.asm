Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4649c54: f94012a8     	ldr	x8, [x21, #0x20]
 4649c58: b40004c8     	cbz	x8, 0x4649cf0 <_ChromeMain+0x4644a54>
 4649c5c: f90043ff     	str	xzr, [sp, #0x80]
 4649c60: 6f00e400     	movi.2d	v0, #0000000000000000
 4649c64: ad0303e0     	stp	q0, q0, [sp, #0x60]
 4649c68: ad0203e0     	stp	q0, q0, [sp, #0x40]
 4649c6c: ad0103e0     	stp	q0, q0, [sp, #0x20]
 4649c70: ad0003e0     	stp	q0, q0, [sp]
 4649c74: fd0007e9     	str	d9, [sp, #0x8]
 4649c78: 6f00e40c     	movi.2d	v12, #0000000000000000
 4649c7c: 6f00e40d     	movi.2d	v13, #0000000000000000
 4649c80: b9402ab3     	ldr	w19, [x21, #0x28]
 4649c84: 34000173     	cbz	w19, 0x4649cb0 <_ChromeMain+0x4644a14>
 4649c88: 6b1303e8     	negs	w8, w19
 4649c8c: 1e620100     	scvtf	d0, w8
 4649c90: 1e6a4d61     	fcsel	d1, d11, d10, mi
 4649c94: 1e602820     	fadd	d0, d1, d0
 4649c98: 6f00e401     	movi.2d	v1, #0000000000000000
 4649c9c: 9539a15f     	bl	0x94b2218 <_ChromeMain+0x94acf7c>
 4649ca0: 1e600900     	fmul	d0, d8, d0
 4649ca4: 1e780008     	fcvtzs	w8, d0
 4649ca8: 0b080268     	add	w8, w19, w8
 4649cac: 1e22010d     	scvtf	s13, w8
 4649cb0: b9402eb3     	ldr	w19, [x21, #0x2c]
 4649cb4: 34000173     	cbz	w19, 0x4649ce0 <_ChromeMain+0x4644a44>
 4649cb8: 6b1303e8     	negs	w8, w19
 4649cbc: 1e620100     	scvtf	d0, w8
 4649cc0: 1e6a4d61     	fcsel	d1, d11, d10, mi
 4649cc4: 1e602820     	fadd	d0, d1, d0
 4649cc8: 6f00e401     	movi.2d	v1, #0000000000000000
 4649ccc: 9539a153     	bl	0x94b2218 <_ChromeMain+0x94acf7c>
 4649cd0: 1e600900     	fmul	d0, d8, d0
 4649cd4: 1e780008     	fcvtzs	w8, d0
 4649cd8: 0b080268     	add	w8, w19, w8
 4649cdc: 1e22010c     	scvtf	s12, w8
 4649ce0: 2d0233ed     	stp	s13, s12, [sp, #0x10]
 4649ce4: f94012a0     	ldr	x0, [x21, #0x20]
 4649ce8: 910003e1     	mov	x1, sp
 4649cec: 95824104     	bl	0xa6da0fc <_ChromeMain+0xa6d4e60>
 4649cf0: f94006a8     	ldr	x8, [x21, #0x8]
 4649cf4: b5fffa68     	cbnz	x8, 0x4649c40 <_ChromeMain+0x46449a4>
 4649cf8: aa1503e8     	mov	x8, x21
 4649cfc: f9400ab5     	ldr	x21, [x21, #0x10]
 4649d00: f94002a9     	ldr	x9, [x21]
 4649d04: eb09011f     	cmp	x8, x9
 4649d08: 54ffff81     	b.ne	0x4649cf8 <_ChromeMain+0x4644a5c>
 4649d0c: 17ffffd0     	b	0x4649c4c <_ChromeMain+0x46449b0>
