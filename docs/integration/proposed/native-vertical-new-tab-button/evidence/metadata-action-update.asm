
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4244a44: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4244a48: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4244a4c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4244a50: 910083fd     	add	x29, sp, #0x20
 4244a54: 90055815     	adrp	x21, 0xed44000 <dyld_stub_binder+0xed44000>
 4244a58: f94722b3     	ldr	x19, [x21, #0xe40]
 4244a5c: b5000533     	cbnz	x19, 0x4244b00 <_ChromeMain+0x423f864>
 4244a60: 52800d00     	mov	w0, #0x68               ; =104
 4244a64: 96f72a41     	bl	0xf368 <_ChromeMain+0xa0cc>
 4244a68: aa0003f3     	mov	x19, x0
 4244a6c: 9004c661     	adrp	x1, 0xdb10000 <dyld_stub_binder+0xdb10000>
 4244a70: 91356421     	add	x1, x1, #0xd59
 4244a74: 528008a2     	mov	w2, #0x45               ; =69
 4244a78: 52800423     	mov	w3, #0x21               ; =33
 4244a7c: 970b8abf     	bl	0x527578 <_ChromeMain+0x5222dc>
 4244a80: f0050048     	adrp	x8, 0xe24f000 <dyld_stub_binder+0xe24f000>
 4244a84: 913d2108     	add	x8, x8, #0xf48
 4244a88: 9004c669     	adrp	x9, 0xdb10000 <dyld_stub_binder+0xdb10000>
 4244a8c: 91351129     	add	x9, x9, #0xd44
 4244a90: a9002408     	stp	x8, x9, [x0]
 4244a94: 52800288     	mov	w8, #0x14               ; =20
 4244a98: f9000808     	str	x8, [x0, #0x10]
 4244a9c: d0056b56     	adrp	x22, 0xefae000 <dyld_stub_binder+0xefae000>
 4244aa0: f94772d4     	ldr	x20, [x22, #0xee0]
 4244aa4: b4000554     	cbz	x20, 0x4244b4c <_ChromeMain+0x423f8b0>
 4244aa8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4244aac: d0054b76     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4244ab0: f94046c9     	ldr	x9, [x22, #0x88]
 4244ab4: eb09011f     	cmp	x8, x9
 4244ab8: 54000061     	b.ne	0x4244ac4 <_ChromeMain+0x423f828>
 4244abc: aa1403e0     	mov	x0, x20
 4244ac0: 96f73e0f     	bl	0x142fc <_ChromeMain+0xf060>
 4244ac4: f9402660     	ldr	x0, [x19, #0x48]
 4244ac8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4244acc: f94046c9     	ldr	x9, [x22, #0x88]
 4244ad0: eb09011f     	cmp	x8, x9
 4244ad4: 54000380     	b.eq	0x4244b44 <_ChromeMain+0x423f8a8>
 4244ad8: f9002674     	str	x20, [x19, #0x48]
 4244adc: b0056668     	adrp	x8, 0xef11000 <dyld_stub_binder+0xef11000>
 4244ae0: 9106a108     	add	x8, x8, #0x1a8
 4244ae4: 38bfc108     	ldaprb	w8, [x8]
 4244ae8: 36000168     	tbz	w8, #0x0, 0x4244b14 <_ChromeMain+0x423f878>
 4244aec: b0056660     	adrp	x0, 0xef11000 <dyld_stub_binder+0xef11000>
 4244af0: 91064000     	add	x0, x0, #0x190
 4244af4: aa1303e1     	mov	x1, x19
 4244af8: 970b8aca     	bl	0x527620 <_ChromeMain+0x522384>
 4244afc: f90722b3     	str	x19, [x21, #0xe40]
 4244b00: aa1303e0     	mov	x0, x19
 4244b04: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4244b08: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4244b0c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4244b10: d65f03c0     	ret
 4244b14: b0056660     	adrp	x0, 0xef11000 <dyld_stub_binder+0xef11000>
 4244b18: 9106a000     	add	x0, x0, #0x1a8
 4244b1c: 94f6ff69     	bl	0x80048c0 <_ChromeMain+0x7fff624>
 4244b20: 34fffe60     	cbz	w0, 0x4244aec <_ChromeMain+0x423f850>
 4244b24: b0056668     	adrp	x8, 0xef11000 <dyld_stub_binder+0xef11000>
 4244b28: 91064108     	add	x8, x8, #0x190
 4244b2c: a9007d1f     	stp	xzr, xzr, [x8]
 4244b30: f900091f     	str	xzr, [x8, #0x10]
 4244b34: b0056660     	adrp	x0, 0xef11000 <dyld_stub_binder+0xef11000>
 4244b38: 9106a000     	add	x0, x0, #0x1a8
 4244b3c: 94f7249e     	bl	0x800ddb4 <_ChromeMain+0x8008b18>
 4244b40: 17ffffeb     	b	0x4244aec <_ChromeMain+0x423f850>
 4244b44: 96f777be     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4244b48: 17ffffe4     	b	0x4244ad8 <_ChromeMain+0x423f83c>
 4244b4c: 940684f2     	bl	0x43e5f14 <_ChromeMain+0x43e0c78>
 4244b50: aa0003f4     	mov	x20, x0
 4244b54: f90772c0     	str	x0, [x22, #0xee0]
 4244b58: 17ffffd4     	b	0x4244aa8 <_ChromeMain+0x423f80c>
 4244b5c: 17ffffba     	b	0x4244a44 <_ChromeMain+0x423f7a8>
 4244b60: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4244b64: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4244b68: 910043fd     	add	x29, sp, #0x10
 4244b6c: aa0003f3     	mov	x19, x0
 4244b70: f0050048     	adrp	x8, 0xe24f000 <dyld_stub_binder+0xe24f000>
 4244b74: 913c2108     	add	x8, x8, #0xf08
 4244b78: f9000008     	str	x8, [x0]
 4244b7c: f9401000     	ldr	x0, [x0, #0x20]
 4244b80: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4244b84: d0054b74     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4244b88: f9404689     	ldr	x9, [x20, #0x88]
 4244b8c: eb09011f     	cmp	x8, x9
 4244b90: 54000041     	b.ne	0x4244b98 <_ChromeMain+0x423f8fc>
 4244b94: 96f777aa     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4244b98: b0050848     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 4244b9c: 912a6108     	add	x8, x8, #0xa98
 4244ba0: f900127f     	str	xzr, [x19, #0x20]
 4244ba4: f9000268     	str	x8, [x19]
 4244ba8: f9400e60     	ldr	x0, [x19, #0x18]
 4244bac: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4244bb0: f9404689     	ldr	x9, [x20, #0x88]
 4244bb4: eb09011f     	cmp	x8, x9
 4244bb8: 54000041     	b.ne	0x4244bc0 <_ChromeMain+0x423f924>
 4244bbc: 96f777a0     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4244bc0: b0050848     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 4244bc4: 910d0108     	add	x8, x8, #0x340
 4244bc8: f9000e7f     	str	xzr, [x19, #0x18]
 4244bcc: f9000268     	str	x8, [x19]
 4244bd0: f9400a60     	ldr	x0, [x19, #0x10]
 4244bd4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4244bd8: f9404689     	ldr	x9, [x20, #0x88]
 4244bdc: eb09011f     	cmp	x8, x9
 4244be0: 54000041     	b.ne	0x4244be8 <_ChromeMain+0x423f94c>
 4244be4: 96f77796     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4244be8: f0050868     	adrp	x8, 0xe353000 <dyld_stub_binder+0xe353000>
 4244bec: 913d6108     	add	x8, x8, #0xf58
 4244bf0: f9000a7f     	str	xzr, [x19, #0x10]
 4244bf4: f9000268     	str	x8, [x19]
 4244bf8: f9400660     	ldr	x0, [x19, #0x8]
 4244bfc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4244c00: f9404689     	ldr	x9, [x20, #0x88]
 4244c04: eb09011f     	cmp	x8, x9
 4244c08: 54000041     	b.ne	0x4244c10 <_ChromeMain+0x423f974>
 4244c0c: 96f7778c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4244c10: f900067f     	str	xzr, [x19, #0x8]
 4244c14: aa1303e0     	mov	x0, x19
 4244c18: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4244c1c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4244c20: d65f03c0     	ret
 4244c24: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4244c28: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4244c2c: 910043fd     	add	x29, sp, #0x10
 4244c30: aa0003f3     	mov	x19, x0
 4244c34: f0050048     	adrp	x8, 0xe24f000 <dyld_stub_binder+0xe24f000>
 4244c38: 913c2108     	add	x8, x8, #0xf08
 4244c3c: f9000008     	str	x8, [x0]
 4244c40: f9401000     	ldr	x0, [x0, #0x20]
 4244c44: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4244c48: d0054b74     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4244c4c: f9404689     	ldr	x9, [x20, #0x88]
 4244c50: eb09011f     	cmp	x8, x9
 4244c54: 54000041     	b.ne	0x4244c5c <_ChromeMain+0x423f9c0>
 4244c58: 96f77779     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4244c5c: b0050848     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 4244c60: 912a6108     	add	x8, x8, #0xa98
 4244c64: f900127f     	str	xzr, [x19, #0x20]
 4244c68: f9000268     	str	x8, [x19]
 4244c6c: f9400e60     	ldr	x0, [x19, #0x18]
 4244c70: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4244c74: f9404689     	ldr	x9, [x20, #0x88]
 4244c78: eb09011f     	cmp	x8, x9
 4244c7c: 54000041     	b.ne	0x4244c84 <_ChromeMain+0x423f9e8>
 4244c80: 96f7776f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4244c84: b0050848     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 4244c88: 910d0108     	add	x8, x8, #0x340
 4244c8c: f9000e7f     	str	xzr, [x19, #0x18]
 4244c90: f9000268     	str	x8, [x19]
 4244c94: f9400a60     	ldr	x0, [x19, #0x10]
 4244c98: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4244c9c: f9404689     	ldr	x9, [x20, #0x88]
 4244ca0: eb09011f     	cmp	x8, x9
 4244ca4: 54000041     	b.ne	0x4244cac <_ChromeMain+0x423fa10>
 4244ca8: 96f77765     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4244cac: f0050868     	adrp	x8, 0xe353000 <dyld_stub_binder+0xe353000>
 4244cb0: 913d6108     	add	x8, x8, #0xf58
 4244cb4: f9000a7f     	str	xzr, [x19, #0x10]
 4244cb8: f9000268     	str	x8, [x19]
 4244cbc: f9400660     	ldr	x0, [x19, #0x8]
 4244cc0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4244cc4: f9404689     	ldr	x9, [x20, #0x88]
 4244cc8: eb09011f     	cmp	x8, x9
 4244ccc: 54000041     	b.ne	0x4244cd4 <_ChromeMain+0x423fa38>
 4244cd0: 96f7775b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4244cd4: aa1303e0     	mov	x0, x19
 4244cd8: 52800501     	mov	w1, #0x28               ; =40
 4244cdc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4244ce0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4244ce4: 16f71075     	b	0x8eb8 <_ChromeMain+0x3c1c>
 4244ce8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4244cec: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4244cf0: 910043fd     	add	x29, sp, #0x10
 4244cf4: aa0103f4     	mov	x20, x1
 4244cf8: aa0003f3     	mov	x19, x0
 4244cfc: 97983b29     	bl	0x28539a0 <_ChromeMain+0x284e704>
 4244d00: f9401260     	ldr	x0, [x19, #0x20]
 4244d04: 39839e82     	ldrsb	x2, [x20, #0xe7]
 4244d08: b7f80142     	tbnz	x2, #0x3f, 0x4244d30 <_ChromeMain+0x423fa94>
 4244d0c: 91034281     	add	x1, x20, #0xd0
 4244d10: f9400008     	ldr	x8, [x0]
 4244d14: f9423108     	ldr	x8, [x8, #0x460]
 4244d18: d63f0100     	blr	x8
 4244d1c: f9401260     	ldr	x0, [x19, #0x20]
 4244d20: 52800021     	mov	w1, #0x1                ; =1
 4244d24: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4244d28: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4244d2c: 173aa2d6     	b	0x10ed884 <_ChromeMain+0x10e85e8>
 4244d30: a94d0a81     	ldp	x1, x2, [x20, #0xd0]
 4244d34: 17fffff7     	b	0x4244d10 <_ChromeMain+0x423fa74>
