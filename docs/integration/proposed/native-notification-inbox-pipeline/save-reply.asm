
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40f8c34: f9400c08     	ldr	x8, [x0, #0x18]
 40f8c38: b4000da8     	cbz	x8, 0x40f8dec <_ChromeMain+0x40f3b50>
 40f8c3c: d10243ff     	sub	sp, sp, #0x90
 40f8c40: a90657f6     	stp	x22, x21, [sp, #0x60]
 40f8c44: a9074ff4     	stp	x20, x19, [sp, #0x70]
 40f8c48: a9087bfd     	stp	x29, x30, [sp, #0x80]
 40f8c4c: 910203fd     	add	x29, sp, #0x80
 40f8c50: aa0203f5     	mov	x21, x2
 40f8c54: aa0103f3     	mov	x19, x1
 40f8c58: aa0003f4     	mov	x20, x0
 40f8c5c: 39402048     	ldrb	w8, [x2, #0x8]
 40f8c60: 34000488     	cbz	w8, 0x40f8cf0 <_ChromeMain+0x40f3a54>
 40f8c64: f94002a0     	ldr	x0, [x21]
 40f8c68: 910083e8     	add	x8, sp, #0x20
 40f8c6c: 9760528e     	bl	0x190d6a4 <_ChromeMain+0x1908408>
 40f8c70: 3dc00be0     	ldr	q0, [sp, #0x20]
 40f8c74: 3d8013e0     	str	q0, [sp, #0x40]
 40f8c78: f9401be8     	ldr	x8, [sp, #0x30]
 40f8c7c: f9002be8     	str	x8, [sp, #0x50]
 40f8c80: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 40f8c84: f9001bff     	str	xzr, [sp, #0x30]
 40f8c88: 52800088     	mov	w8, #0x4                ; =4
 40f8c8c: 390163e8     	strb	w8, [sp, #0x58]
 40f8c90: f004cca1     	adrp	x1, 0xda8f000 <dyld_stub_binder+0xda8f000>
 40f8c94: 91040c21     	add	x1, x1, #0x103
 40f8c98: 910103e3     	add	x3, sp, #0x40
 40f8c9c: aa1303e0     	mov	x0, x19
 40f8ca0: 528001c2     	mov	w2, #0xe                ; =14
 40f8ca4: 97110887     	bl	0x53aec0 <_ChromeMain+0x535c24>
 40f8ca8: 394163e8     	ldrb	w8, [sp, #0x58]
 40f8cac: f103fd1f     	cmp	x8, #0xff
 40f8cb0: 540000e0     	b.eq	0x40f8ccc <_ChromeMain+0x40f3a30>
 40f8cb4: b0053e49     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 40f8cb8: 9121e129     	add	x9, x9, #0x878
 40f8cbc: f8687928     	ldr	x8, [x9, x8, lsl #3]
 40f8cc0: 9100ffe0     	add	x0, sp, #0x3f
 40f8cc4: 910103e1     	add	x1, sp, #0x40
 40f8cc8: d63f0100     	blr	x8
 40f8ccc: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 40f8cd0: 36f80348     	tbz	w8, #0x1f, 0x40f8d38 <_ChromeMain+0x40f3a9c>
 40f8cd4: f94013e0     	ldr	x0, [sp, #0x20]
 40f8cd8: f9401be8     	ldr	x8, [sp, #0x30]
 40f8cdc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f8ce0: 96fc4076     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f8ce4: 14000015     	b	0x40f8d38 <_ChromeMain+0x40f3a9c>
 40f8ce8: a94112a3     	ldp	x3, x4, [x21, #0x10]
 40f8cec: 14000018     	b	0x40f8d4c <_ChromeMain+0x40f3ab0>
 40f8cf0: 52800028     	mov	w8, #0x1                ; =1
 40f8cf4: 390103e8     	strb	w8, [sp, #0x40]
 40f8cf8: 390163e8     	strb	w8, [sp, #0x58]
 40f8cfc: f004cca1     	adrp	x1, 0xda8f000 <dyld_stub_binder+0xda8f000>
 40f8d00: 91044821     	add	x1, x1, #0x112
 40f8d04: 910103e3     	add	x3, sp, #0x40
 40f8d08: aa1303e0     	mov	x0, x19
 40f8d0c: 52800242     	mov	w2, #0x12               ; =18
 40f8d10: 9711086c     	bl	0x53aec0 <_ChromeMain+0x535c24>
 40f8d14: 394163e8     	ldrb	w8, [sp, #0x58]
 40f8d18: f103fd1f     	cmp	x8, #0xff
 40f8d1c: 540000e0     	b.eq	0x40f8d38 <_ChromeMain+0x40f3a9c>
 40f8d20: b0053e49     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 40f8d24: 9121e129     	add	x9, x9, #0x878
 40f8d28: f8687928     	ldr	x8, [x9, x8, lsl #3]
 40f8d2c: 910083e0     	add	x0, sp, #0x20
 40f8d30: 910103e1     	add	x1, sp, #0x40
 40f8d34: d63f0100     	blr	x8
 40f8d38: 3940a2a8     	ldrb	w8, [x21, #0x28]
 40f8d3c: 34000128     	cbz	w8, 0x40f8d60 <_ChromeMain+0x40f3ac4>
 40f8d40: 39809ea4     	ldrsb	x4, [x21, #0x27]
 40f8d44: b7fffd24     	tbnz	x4, #0x3f, 0x40f8ce8 <_ChromeMain+0x40f3a4c>
 40f8d48: 910042a3     	add	x3, x21, #0x10
 40f8d4c: f004cca1     	adrp	x1, 0xda8f000 <dyld_stub_binder+0xda8f000>
 40f8d50: 91034421     	add	x1, x1, #0xd1
 40f8d54: aa1303e0     	mov	x0, x19
 40f8d58: 52800202     	mov	w2, #0x10               ; =16
 40f8d5c: 97569e1b     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 40f8d60: f9400e94     	ldr	x20, [x20, #0x18]
 40f8d64: f9400268     	ldr	x8, [x19]
 40f8d68: f900027f     	str	xzr, [x19]
 40f8d6c: f90007e8     	str	x8, [sp, #0x8]
 40f8d70: 3cc08260     	ldur	q0, [x19, #0x8]
 40f8d74: 6f00e401     	movi.2d	v1, #0000000000000000
 40f8d78: 3c808261     	stur	q1, [x19, #0x8]
 40f8d7c: 3c8103e0     	stur	q0, [sp, #0x10]
 40f8d80: 9004b761     	adrp	x1, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 40f8d84: 911cdc21     	add	x1, x1, #0x737
 40f8d88: b0046f93     	adrp	x19, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f8d8c: 912cde73     	add	x19, x19, #0xb37
 40f8d90: 910023e0     	add	x0, sp, #0x8
 40f8d94: 52800082     	mov	w2, #0x4                ; =4
 40f8d98: aa1303e3     	mov	x3, x19
 40f8d9c: 97569e55     	bl	0x16a06f0 <_ChromeMain+0x169b454>
 40f8da0: f94007e8     	ldr	x8, [sp, #0x8]
 40f8da4: f90007ff     	str	xzr, [sp, #0x8]
 40f8da8: f90023e8     	str	x8, [sp, #0x40]
 40f8dac: 3cc103e0     	ldur	q0, [sp, #0x10]
 40f8db0: 6f00e401     	movi.2d	v1, #0000000000000000
 40f8db4: 3c8103e1     	stur	q1, [sp, #0x10]
 40f8db8: 3c8483e0     	stur	q0, [sp, #0x48]
 40f8dbc: 910103e2     	add	x2, sp, #0x40
 40f8dc0: aa1403e0     	mov	x0, x20
 40f8dc4: aa1303e1     	mov	x1, x19
 40f8dc8: 94000641     	bl	0x40fa6cc <_ChromeMain+0x40f5430>
 40f8dcc: 910103e0     	add	x0, sp, #0x40
 40f8dd0: 972195ac     	bl	0x95e480 <_ChromeMain+0x9591e4>
 40f8dd4: 910023e0     	add	x0, sp, #0x8
 40f8dd8: 972195aa     	bl	0x95e480 <_ChromeMain+0x9591e4>
 40f8ddc: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 40f8de0: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 40f8de4: a94657f6     	ldp	x22, x21, [sp, #0x60]
 40f8de8: 910243ff     	add	sp, sp, #0x90
 40f8dec: d65f03c0     	ret
