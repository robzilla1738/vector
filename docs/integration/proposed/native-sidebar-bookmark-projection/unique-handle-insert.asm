
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 6c86d20: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 6c86d24: 910003fd     	mov	x29, sp
 6c86d28: a9402809     	ldp	x9, x10, [x0]
 6c86d2c: d37ef548     	lsl	x8, x10, #2
 6c86d30: b4000308     	cbz	x8, 0x6c86d90 <_ChromeMain+0x6c81af4>
 6c86d34: 9342fd0c     	asr	x12, x8, #2
 6c86d38: b940002b     	ldr	w11, [x1]
 6c86d3c: aa0903e8     	mov	x8, x9
 6c86d40: d341fd8d     	lsr	x13, x12, #1
 6c86d44: 8b0d090e     	add	x14, x8, x13, lsl #2
 6c86d48: b84045cf     	ldr	w15, [x14], #0x4
 6c86d4c: aa6c07f0     	mvn	x16, x12, lsr #1
 6c86d50: 8b10018c     	add	x12, x12, x16
 6c86d54: 6b0b01ff     	cmp	w15, w11
 6c86d58: 9a8db18c     	csel	x12, x12, x13, lt
 6c86d5c: 9a88b1c8     	csel	x8, x14, x8, lt
 6c86d60: b5ffff0c     	cbnz	x12, 0x6c86d40 <_ChromeMain+0x6c81aa4>
 6c86d64: 8b0a0929     	add	x9, x9, x10, lsl #2
 6c86d68: eb09011f     	cmp	x8, x9
 6c86d6c: 54000160     	b.eq	0x6c86d98 <_ChromeMain+0x6c81afc>
 6c86d70: b9400029     	ldr	w9, [x1]
 6c86d74: b940010a     	ldr	w10, [x8]
 6c86d78: 6b0a013f     	cmp	w9, w10
 6c86d7c: 540000eb     	b.lt	0x6c86d98 <_ChromeMain+0x6c81afc>
 6c86d80: d2800001     	mov	x1, #0x0                ; =0
 6c86d84: aa0803e0     	mov	x0, x8
 6c86d88: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 6c86d8c: d65f03c0     	ret
 6c86d90: aa0903e8     	mov	x8, x9
 6c86d94: 17fffff4     	b	0x6c86d64 <_ChromeMain+0x6c81ac8>
 6c86d98: aa0803e1     	mov	x1, x8
 6c86d9c: 94000004     	bl	0x6c86dac <_ChromeMain+0x6c81b10>
 6c86da0: aa0003e8     	mov	x8, x0
 6c86da4: 52800021     	mov	w1, #0x1                ; =1
 6c86da8: 17fffff7     	b	0x6c86d84 <_ChromeMain+0x6c81ae8>
 6c86dac: d10183ff     	sub	sp, sp, #0x60
 6c86db0: a9025ff8     	stp	x24, x23, [sp, #0x20]
 6c86db4: a90357f6     	stp	x22, x21, [sp, #0x30]
 6c86db8: a9044ff4     	stp	x20, x19, [sp, #0x40]
 6c86dbc: a9057bfd     	stp	x29, x30, [sp, #0x50]
 6c86dc0: 910143fd     	add	x29, sp, #0x50
 6c86dc4: aa0203f5     	mov	x21, x2
 6c86dc8: aa0103f4     	mov	x20, x1
 6c86dcc: aa0003f3     	mov	x19, x0
 6c86dd0: a9402809     	ldp	x9, x10, [x0]
 6c86dd4: cb090036     	sub	x22, x1, x9
 6c86dd8: f9400808     	ldr	x8, [x0, #0x10]
 6c86ddc: eb08015f     	cmp	x10, x8
 6c86de0: 54000500     	b.eq	0x6c86e80 <_ChromeMain+0x6c81be4>
 6c86de4: 8b0a0928     	add	x8, x9, x10, lsl #2
 6c86de8: eb08029f     	cmp	x20, x8
 6c86dec: 54000380     	b.eq	0x6c86e5c <_ChromeMain+0x6c81bc0>
 6c86df0: d37ef54a     	lsl	x10, x10, #2
 6c86df4: b94002b5     	ldr	w21, [x21]
 6c86df8: cb16014a     	sub	x10, x10, x22
 6c86dfc: d1001142     	sub	x2, x10, #0x4
 6c86e00: 8b02028a     	add	x10, x20, x2
 6c86e04: eb08015f     	cmp	x10, x8
 6c86e08: 54000063     	b.lo	0x6c86e14 <_ChromeMain+0x6c81b78>
 6c86e0c: aa0803ea     	mov	x10, x8
 6c86e10: 14000005     	b	0x6c86e24 <_ChromeMain+0x6c81b88>
 6c86e14: b9400149     	ldr	w9, [x10]
 6c86e18: aa0803ea     	mov	x10, x8
 6c86e1c: b8004549     	str	w9, [x10], #0x4
 6c86e20: f9400269     	ldr	x9, [x19]
 6c86e24: cb090149     	sub	x9, x10, x9
 6c86e28: 9342fd29     	asr	x9, x9, #2
 6c86e2c: f9000669     	str	x9, [x19, #0x8]
 6c86e30: cb020100     	sub	x0, x8, x2
 6c86e34: aa1403e1     	mov	x1, x20
 6c86e38: 957cba3c     	bl	0xcbb5728 <dyld_stub_binder+0xcbb5728>
 6c86e3c: b9000295     	str	w21, [x20]
 6c86e40: aa1403e0     	mov	x0, x20
 6c86e44: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 6c86e48: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 6c86e4c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 6c86e50: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 6c86e54: 910183ff     	add	sp, sp, #0x60
 6c86e58: d65f03c0     	ret
 6c86e5c: b4000814     	cbz	x20, 0x6c86f5c <_ChromeMain+0x6c81cc0>
 6c86e60: b94002a9     	ldr	w9, [x21]
 6c86e64: b9000109     	str	w9, [x8]
 6c86e68: f9400269     	ldr	x9, [x19]
 6c86e6c: cb090108     	sub	x8, x8, x9
 6c86e70: 91001108     	add	x8, x8, #0x4
 6c86e74: 9342fd08     	asr	x8, x8, #2
 6c86e78: f9000668     	str	x8, [x19, #0x8]
 6c86e7c: 17fffff1     	b	0x6c86e40 <_ChromeMain+0x6c81ba4>
 6c86e80: 91000548     	add	x8, x10, #0x1
 6c86e84: d37efd09     	lsr	x9, x8, #62
 6c86e88: b50006c9     	cbnz	x9, 0x6c86f60 <_ChromeMain+0x6c81cc4>
 6c86e8c: d2800000     	mov	x0, #0x0                ; =0
 6c86e90: d37ff949     	lsl	x9, x10, #1
 6c86e94: eb08013f     	cmp	x9, x8
 6c86e98: 9a888128     	csel	x8, x9, x8, hi
 6c86e9c: 92fc0009     	mov	x9, #0x1fffffffffffffff ; =2305843009213693951
 6c86ea0: 92f8000b     	mov	x11, #0x3fffffffffffffff ; =4611686018427387903
 6c86ea4: eb09015f     	cmp	x10, x9
 6c86ea8: 9a8b3117     	csel	x23, x8, x11, lo
 6c86eac: f90003ff     	str	xzr, [sp]
 6c86eb0: b40000d7     	cbz	x23, 0x6c86ec8 <_ChromeMain+0x6c81c2c>
 6c86eb4: d37efee8     	lsr	x8, x23, #62
 6c86eb8: b5000568     	cbnz	x8, 0x6c86f64 <_ChromeMain+0x6c81cc8>
 6c86ebc: d37ef6e0     	lsl	x0, x23, #2
 6c86ec0: 964e212a     	bl	0xf368 <_ChromeMain+0xa0cc>
 6c86ec4: f90003e0     	str	x0, [sp]
 6c86ec8: 8b160008     	add	x8, x0, x22
 6c86ecc: a900ffe8     	stp	x8, xzr, [sp, #0x8]
 6c86ed0: f9000ff7     	str	x23, [sp, #0x18]
 6c86ed4: 910003e0     	mov	x0, sp
 6c86ed8: aa1503e1     	mov	x1, x21
 6c86edc: 97aeeb99     	bl	0x5841d40 <_ChromeMain+0x583caa4>
 6c86ee0: a9402668     	ldp	x8, x9, [x19]
 6c86ee4: 8b090908     	add	x8, x8, x9, lsl #2
 6c86ee8: a940a7f6     	ldp	x22, x9, [sp, #0x8]
 6c86eec: 8b090ac0     	add	x0, x22, x9, lsl #2
 6c86ef0: cb140115     	sub	x21, x8, x20
 6c86ef4: aa1403e1     	mov	x1, x20
 6c86ef8: aa1503e2     	mov	x2, x21
 6c86efc: 957cba08     	bl	0xcbb571c <dyld_stub_binder+0xcbb571c>
 6c86f00: a940a3e9     	ldp	x9, x8, [sp, #0x8]
 6c86f04: 8b950908     	add	x8, x8, x21, asr #2
 6c86f08: f9000be8     	str	x8, [sp, #0x10]
 6c86f0c: a9402261     	ldp	x1, x8, [x19]
 6c86f10: cb950908     	sub	x8, x8, x21, asr #2
 6c86f14: f9000668     	str	x8, [x19, #0x8]
 6c86f18: cb080935     	sub	x21, x9, x8, lsl #2
 6c86f1c: cb010282     	sub	x2, x20, x1
 6c86f20: aa1503e0     	mov	x0, x21
 6c86f24: 957cb9fe     	bl	0xcbb571c <dyld_stub_binder+0xcbb571c>
 6c86f28: a9402260     	ldp	x0, x8, [x19]
 6c86f2c: a9412be9     	ldp	x9, x10, [sp, #0x10]
 6c86f30: 8b080128     	add	x8, x9, x8
 6c86f34: a9002275     	stp	x21, x8, [x19]
 6c86f38: f9400a68     	ldr	x8, [x19, #0x10]
 6c86f3c: f9000a6a     	str	x10, [x19, #0x10]
 6c86f40: a90003e0     	stp	x0, x0, [sp]
 6c86f44: a90123ff     	stp	xzr, x8, [sp, #0x10]
 6c86f48: b4000060     	cbz	x0, 0x6c86f54 <_ChromeMain+0x6c81cb8>
 6c86f4c: d37ef501     	lsl	x1, x8, #2
 6c86f50: 964e07da     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 6c86f54: aa1603f4     	mov	x20, x22
 6c86f58: 17ffffba     	b	0x6c86e40 <_ChromeMain+0x6c81ba4>
 6c86f5c: d4200020     	brk	#0x1
 6c86f60: 96ca3388     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 6c86f64: 977dfc2f     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 6c86f68: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 6c86f6c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 6c86f70: 910043fd     	add	x29, sp, #0x10
