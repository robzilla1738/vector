Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4631bd0: a900a009     	stp	x9, x8, [x0, #0x8]
 4631bd4: 90fef968     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4631bd8: 912c0109     	add	x9, x8, #0xb00
 4631bdc: 10104568     	adr	x8, 0x4652488 <_ChromeMain+0x464d1ec>
 4631be0: d503201f     	nop
 4631be4: a901a009     	stp	x9, x8, [x0, #0x18]
 4631be8: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4631bec: 340000d6     	cbz	w22, 0x4631c04 <_ChromeMain+0x462c968>
 4631bf0: aa1303e0     	mov	x0, x19
 4631bf4: 96e789c2     	bl	0x142fc <_ChromeMain+0xf060>
 4631bf8: f9404748     	ldr	x8, [x26, #0x88]
 4631bfc: eb08037f     	cmp	x27, x8
 4631c00: 1a9f17f6     	cset	w22, eq
 4631c04: 52800700     	mov	w0, #0x38               ; =56
 4631c08: 96e775d8     	bl	0xf368 <_ChromeMain+0xa0cc>
 4631c0c: aa0003fa     	mov	x26, x0
 4631c10: b9000014     	str	w20, [x0]
 4631c14: f0ffd0e8     	adrp	x8, 0x4050000 <_ChromeMain+0x404ad64>
 4631c18: 910a6109     	add	x9, x8, #0x298
 4631c1c: 90ff9348     	adrp	x8, 0x3899000 <_ChromeMain+0x3893d64>
 4631c20: 912d0108     	add	x8, x8, #0xb40
 4631c24: a900a009     	stp	x9, x8, [x0, #0x8]
 4631c28: 90fef968     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4631c2c: 912c0109     	add	x9, x8, #0xb00
 4631c30: 10104e88     	adr	x8, 0x4652600 <_ChromeMain+0x464d364>
 4631c34: d503201f     	nop
 4631c38: a901a009     	stp	x9, x8, [x0, #0x18]
 4631c3c: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4631c40: 34000076     	cbz	w22, 0x4631c4c <_ChromeMain+0x462c9b0>
 4631c44: aa1303e0     	mov	x0, x19
 4631c48: 96e789ad     	bl	0x142fc <_ChromeMain+0xf060>
 4631c4c: 52800700     	mov	w0, #0x38               ; =56
 4631c50: 96e775c6     	bl	0xf368 <_ChromeMain+0xa0cc>
 4631c54: aa0003f6     	mov	x22, x0
 4631c58: 52800034     	mov	w20, #0x1               ; =1
 4631c5c: b9000014     	str	w20, [x0]
 4631c60: 90ffcc48     	adrp	x8, 0x3fb9000 <_ChromeMain+0x3fb3d64>
 4631c64: 910c0109     	add	x9, x8, #0x300
 4631c68: 90ff9348     	adrp	x8, 0x3899000 <_ChromeMain+0x3893d64>
 4631c6c: 912d0108     	add	x8, x8, #0xb40
 4631c70: a900a009     	stp	x9, x8, [x0, #0x8]
 4631c74: 90fef968     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4631c78: 912c0109     	add	x9, x8, #0xb00
 4631c7c: 101064e8     	adr	x8, 0x4652918 <_ChromeMain+0x464d67c>
 4631c80: d503201f     	nop
 4631c84: a901a009     	stp	x9, x8, [x0, #0x18]
 4631c88: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4631c8c: b00546c8     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4631c90: 91120108     	add	x8, x8, #0x480
 4631c94: f8bfc100     	ldapr	x0, [x8]
 4631c98: b4006500     	cbz	x0, 0x4632938 <_ChromeMain+0x462d69c>
 4631c9c: 52809f01     	mov	w1, #0x4f8              ; =1272
 4631ca0: d2800002     	mov	x2, #0x0                ; =0
 4631ca4: 96e9e643     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4631ca8: aa0003fb     	mov	x27, x0
 4631cac: f81803b8     	stur	x24, [x29, #-0x80]
 4631cb0: 381883b4     	sturb	w20, [x29, #-0x78]
 4631cb4: d10203a1     	sub	x1, x29, #0x80
 4631cb8: 9734f1f2     	bl	0x136e480 <_ChromeMain+0x13691e4>
 4631cbc: 385883a8     	ldurb	w8, [x29, #-0x78]
 4631cc0: 7103fd1f     	cmp	w8, #0xff
 4631cc4: 54000060     	b.eq	0x4631cd0 <_ChromeMain+0x462ca34>
 4631cc8: f85803a0     	ldur	x0, [x29, #-0x80]
 4631ccc: b5ffec80     	cbnz	x0, 0x4631a5c <_ChromeMain+0x462c7c0>
 4631cd0: 52801fe8     	mov	w8, #0xff               ; =255
 4631cd4: 381883a8     	sturb	w8, [x29, #-0x78]
 4631cd8: f00507ca     	adrp	x10, 0xe72c000 <dyld_stub_binder+0xe72c000>
 4631cdc: 9133c14a     	add	x10, x10, #0xcf0
 4631ce0: 91118148     	add	x8, x10, #0x460
 4631ce4: a900236a     	stp	x10, x8, [x27]
 4631ce8: 91122148     	add	x8, x10, #0x488
 4631cec: f9000b68     	str	x8, [x27, #0x10]
 4631cf0: 91130148     	add	x8, x10, #0x4c0
 4631cf4: 9113c149     	add	x9, x10, #0x4f0
 4631cf8: a906a768     	stp	x8, x9, [x27, #0x68]
 4631cfc: 91150148     	add	x8, x10, #0x540
 4631d00: f9005b68     	str	x8, [x27, #0xb0]
 4631d04: 91168148     	add	x8, x10, #0x5a0
 4631d08: f9006f68     	str	x8, [x27, #0xd8]
 4631d0c: 91174148     	add	x8, x10, #0x5d0
 4631d10: aa1b03f8     	mov	x24, x27
 4631d14: f80f8f08     	str	x8, [x24, #0xf8]!
 4631d18: 9117e148     	add	x8, x10, #0x5f8
 4631d1c: f9018b68     	str	x8, [x27, #0x310]
 4631d20: 9119e148     	add	x8, x10, #0x678
 4631d24: f9018f68     	str	x8, [x27, #0x318]
 4631d28: 911ce148     	add	x8, x10, #0x738
 4631d2c: f9019368     	str	x8, [x27, #0x320]
 4631d30: b9401be8     	ldr	w8, [sp, #0x18]
 4631d34: 3912c368     	strb	w8, [x27, #0x4b0]
 4631d38: 925e7788     	and	x8, x28, #0xfffffffc00000000
 4631d3c: b0052c09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4631d40: f9404529     	ldr	x9, [x9, #0x88]
 4631d44: eb09011f     	cmp	x8, x9
 4631d48: 9102c3f4     	add	x20, sp, #0xb0
 4631d4c: 54000061     	b.ne	0x4631d58 <_ChromeMain+0x462cabc>
 4631d50: aa1c03e0     	mov	x0, x28
 4631d54: 96e7896a     	bl	0x142fc <_ChromeMain+0xf060>
 4631d58: f9025f7c     	str	x28, [x27, #0x4b8]
 4631d5c: f9026379     	str	x25, [x27, #0x4c0]
 4631d60: f9026775     	str	x21, [x27, #0x4c8]
 4631d64: f9026b7a     	str	x26, [x27, #0x4d0]
 4631d68: f9026f76     	str	x22, [x27, #0x4d8]
 4631d6c: 91138368     	add	x8, x27, #0x4e0
 4631d70: 6f00e400     	movi.2d	v0, #0000000000000000
 4631d74: 3d813b60     	str	q0, [x27, #0x4e0]
 4631d78: b800f11f     	stur	wzr, [x8, #0xf]
 4631d7c: 39518368     	ldrb	w8, [x27, #0x460]
 4631d80: 340000a8     	cbz	w8, 0x4631d94 <_ChromeMain+0x462caf8>
 4631d84: 3911837f     	strb	wzr, [x27, #0x460]
 4631d88: 91118361     	add	x1, x27, #0x460
 4631d8c: aa1803e0     	mov	x0, x24
 4631d90: 9723d890     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4631d94: aa1b03e0     	mov	x0, x27
 4631d98: b21d07e1     	mov	x1, #0x1800000018       ; =103079215128
 4631d9c: 52800022     	mov	w2, #0x1                ; =1
 4631da0: 97867f30     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4631da4: aa1b03e0     	mov	x0, x27
 4631da8: 52800021     	mov	w1, #0x1                ; =1
 4631dac: 97578eb8     	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 4631db0: f9401368     	ldr	x8, [x27, #0x20]
 4631db4: b9400909     	ldr	w9, [x8, #0x8]
 4631db8: 7100093f     	cmp	w9, #0x2
 4631dbc: f94007fc     	ldr	x28, [sp, #0x8]
 4631dc0: f94013f6     	ldr	x22, [sp, #0x20]
 4631dc4: 54005be0     	b.eq	0x4632940 <_ChromeMain+0x462d6a4>
 4631dc8: 39422909     	ldrb	w9, [x8, #0x8a]
 4631dcc: 340000a9     	cbz	w9, 0x4631de0 <_ChromeMain+0x462cb44>
 4631dd0: 3902291f     	strb	wzr, [x8, #0x8a]
 4631dd4: f940b500     	ldr	x0, [x8, #0x168]
 4631dd8: 52800001     	mov	w1, #0x0                ; =0
 4631ddc: 971e6f59     	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 4631de0: aa1b03e0     	mov	x0, x27
 4631de4: 52800041     	mov	w1, #0x2                ; =2
 4631de8: 973c167d     	bl	0x15377dc <_ChromeMain+0x1532540>
 4631dec: aa1b03e0     	mov	x0, x27
 4631df0: 9734f414     	bl	0x136ee40 <_ChromeMain+0x1369ba4>
 4631df4: f9416760     	ldr	x0, [x27, #0x2c8]
 4631df8: b4ffe1a0     	cbz	x0, 0x4631a2c <_ChromeMain+0x462c790>
 4631dfc: 52800121     	mov	w1, #0x9                ; =9
 4631e00: 974171b8     	bl	0x168e4e0 <_ChromeMain+0x1689244>
 4631e04: 910203e1     	add	x1, sp, #0x80
 4631e08: aa1b03e0     	mov	x0, x27
 4631e0c: 970852ce     	bl	0x846944 <_ChromeMain+0x8416a8>
 4631e10: f9416775     	ldr	x21, [x27, #0x2c8]
 4631e14: b4ffdfb5     	cbz	x21, 0x4631a08 <_ChromeMain+0x462c76c>
 4631e18: 38d773b8     	ldursb	w24, [x29, #-0x89]
 4631e1c: 37ffe198     	tbnz	w24, #0x1f, 0x4631a4c <_ChromeMain+0x462c7b0>
 4631e20: 3dc01280     	ldr	q0, [x20, #0x40]
 4631e24: 3d800fe0     	str	q0, [sp, #0x30]
 4631e28: f85703a8     	ldur	x8, [x29, #-0x90]
 4631e2c: f90023e8     	str	x8, [sp, #0x40]
 4631e30: 9100c3e1     	add	x1, sp, #0x30
 4631e34: aa1503e0     	mov	x0, x21
 4631e38: 972ceea8     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 4631e3c: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 4631e40: 36f800a8     	tbz	w8, #0x1f, 0x4631e54 <_ChromeMain+0x462cbb8>
 4631e44: f9401be0     	ldr	x0, [sp, #0x30]
 4631e48: f94023e8     	ldr	x8, [sp, #0x40]
 4631e4c: d37ff901     	lsl	x1, x8, #1
 4631e50: 96e75c1a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4631e54: aa1b03e0     	mov	x0, x27
 4631e58: aa1703e1     	mov	x1, x23
 4631e5c: 94007fea     	bl	0x4651e04 <_ChromeMain+0x464cb68>
