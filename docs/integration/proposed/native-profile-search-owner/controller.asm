
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 459fce0: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 459fce4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 459fce8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 459fcec: 910083fd     	add	x29, sp, #0x20
 459fcf0: aa0103f4     	mov	x20, x1
 459fcf4: aa0003f3     	mov	x19, x0
 459fcf8: aa0003e8     	mov	x8, x0
 459fcfc: f8018d1f     	str	xzr, [x8, #0x18]!
 459fd00: f9000808     	str	x8, [x0, #0x10]
 459fd04: b004fb28     	adrp	x8, 0xe504000 <dyld_stub_binder+0xe504000>
 459fd08: 9124a108     	add	x8, x8, #0x928
 459fd0c: 91046109     	add	x9, x8, #0x118
 459fd10: aa0003f5     	mov	x21, x0
 459fd14: f8030ea9     	str	x9, [x21, #0x30]!
 459fd18: 91014109     	add	x9, x8, #0x50
 459fd1c: a9002408     	stp	x8, x9, [x0]
 459fd20: 9103c108     	add	x8, x8, #0xf0
 459fd24: a902201f     	stp	xzr, x8, [x0, #0x20]
 459fd28: 925e7428     	and	x8, x1, #0xfffffffc00000000
 459fd2c: f0053089     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 459fd30: f9404529     	ldr	x9, [x9, #0x88]
 459fd34: eb09011f     	cmp	x8, x9
 459fd38: 54000061     	b.ne	0x459fd44 <_ChromeMain+0x459aaa8>
 459fd3c: aa1403e0     	mov	x0, x20
 459fd40: 96e9d16f     	bl	0x142fc <_ChromeMain+0xf060>
 459fd44: f9001e74     	str	x20, [x19, #0x38]
 459fd48: 6f00e400     	movi.2d	v0, #0000000000000000
 459fd4c: ad020260     	stp	q0, q0, [x19, #0x40]
 459fd50: f900327f     	str	xzr, [x19, #0x60]
 459fd54: 9101a260     	add	x0, x19, #0x68
 459fd58: aa1503e1     	mov	x1, x21
 459fd5c: 52800782     	mov	w2, #0x3c               ; =60
 459fd60: 97b16748     	bl	0x31f9a80 <_ChromeMain+0x31f47e4>
 459fd64: b900d27f     	str	wzr, [x19, #0xd0]
 459fd68: 6f00e400     	movi.2d	v0, #0000000000000000
 459fd6c: ad058260     	stp	q0, q0, [x19, #0xb0]
 459fd70: 0f03f600     	fmov.2s	v0, #1.00000000
 459fd74: fc0d4260     	stur	d0, [x19, #0xd4]
 459fd78: 52a7f008     	mov	w8, #0x3f800000         ; =1065353216
 459fd7c: b900de68     	str	w8, [x19, #0xdc]
 459fd80: 7901c27f     	strh	wzr, [x19, #0xe0]
 459fd84: 39038a7f     	strb	wzr, [x19, #0xe2]
 459fd88: 52800100     	mov	w0, #0x8                ; =8
 459fd8c: 96e9bd77     	bl	0xf368 <_ChromeMain+0xa0cc>
 459fd90: b900001f     	str	wzr, [x0]
 459fd94: 3900101f     	strb	wzr, [x0, #0x4]
 459fd98: b40000c0     	cbz	x0, 0x459fdb0 <_ChromeMain+0x459ab14>
 459fd9c: 52800028     	mov	w8, #0x1                ; =1
 459fda0: b8280008     	ldadd	w8, w8, [x0]
 459fda4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 459fda8: 6b09011f     	cmp	w8, w9
 459fdac: 540000e0     	b.eq	0x459fdc8 <_ChromeMain+0x459ab2c>
 459fdb0: a90ece60     	stp	x0, x19, [x19, #0xe8]
 459fdb4: aa1303e0     	mov	x0, x19
 459fdb8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 459fdbc: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 459fdc0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 459fdc4: d65f03c0     	ret
 459fdc8: d4200000     	brk	#0
 459fdcc: d4400000     	hlt	#0
 459fdd0: d4200020     	brk	#0x1
 459fdd4: d10343ff     	sub	sp, sp, #0xd0
 459fdd8: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 459fddc: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 459fde0: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 459fde4: 910303fd     	add	x29, sp, #0xc0
 459fde8: aa0003f3     	mov	x19, x0
 459fdec: b004fb28     	adrp	x8, 0xe504000 <dyld_stub_binder+0xe504000>
 459fdf0: 9124a108     	add	x8, x8, #0x928
 459fdf4: f9000008     	str	x8, [x0]
 459fdf8: 91014109     	add	x9, x8, #0x50
 459fdfc: aa0003f4     	mov	x20, x0
 459fe00: f8008e89     	str	x9, [x20, #0x8]!
 459fe04: 9103c109     	add	x9, x8, #0xf0
 459fe08: 91046108     	add	x8, x8, #0x118
 459fe0c: a902a009     	stp	x9, x8, [x0, #0x28]
 459fe10: f9407408     	ldr	x8, [x0, #0xe8]
 459fe14: 52800035     	mov	w21, #0x1               ; =1
 459fe18: 19004115     	stlurb	w21, [x8, #0x4]
 459fe1c: 52800100     	mov	w0, #0x8                ; =8
 459fe20: 96e9bd52     	bl	0xf368 <_ChromeMain+0xa0cc>
 459fe24: b900001f     	str	wzr, [x0]
 459fe28: 3900101f     	strb	wzr, [x0, #0x4]
 459fe2c: b40000a0     	cbz	x0, 0x459fe40 <_ChromeMain+0x459aba4>
 459fe30: b8350008     	ldadd	w21, w8, [x0]
 459fe34: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 459fe38: 6b09011f     	cmp	w8, w9
 459fe3c: 54001480     	b.eq	0x45a00cc <_ChromeMain+0x459ae30>
 459fe40: f9407668     	ldr	x8, [x19, #0xe8]
 459fe44: f9007660     	str	x0, [x19, #0xe8]
 459fe48: b4000108     	cbz	x8, 0x459fe68 <_ChromeMain+0x459abcc>
 459fe4c: 12800009     	mov	w9, #-0x1               ; =-1
 459fe50: b8e90109     	ldaddal	w9, w9, [x8]
 459fe54: 7100053f     	cmp	w9, #0x1
 459fe58: 54000081     	b.ne	0x459fe68 <_ChromeMain+0x459abcc>
 459fe5c: aa0803e0     	mov	x0, x8
 459fe60: 52800101     	mov	w1, #0x8                ; =8
 459fe64: 96e9a415     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 459fe68: 39438a68     	ldrb	w8, [x19, #0xe2]
 459fe6c: 340006a8     	cbz	w8, 0x459ff40 <_ChromeMain+0x459aca4>
 459fe70: f9402268     	ldr	x8, [x19, #0x40]
 459fe74: b4000668     	cbz	x8, 0x459ff40 <_ChromeMain+0x459aca4>
 459fe78: f941a115     	ldr	x21, [x8, #0x340]
 459fe7c: b4000635     	cbz	x21, 0x459ff40 <_ChromeMain+0x459aca4>
 459fe80: 9100a3f6     	add	x22, sp, #0x28
 459fe84: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 459fe88: b803f3ff     	stur	wzr, [sp, #0x3f]
 459fe8c: f9001fff     	str	xzr, [sp, #0x38]
 459fe90: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 459fe94: 3c8483e0     	stur	q0, [sp, #0x48]
 459fe98: 3c8583e0     	stur	q0, [sp, #0x58]
 459fe9c: 3c8683e0     	stur	q0, [sp, #0x68]
 459fea0: 3c8783e0     	stur	q0, [sp, #0x78]
 459fea4: 790113ff     	strh	wzr, [sp, #0x88]
 459fea8: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 459feac: b004a840     	adrp	x0, 0xdaa8000 <dyld_stub_binder+0xdaa8000>
 459feb0: 91330400     	add	x0, x0, #0xcc1
 459feb4: d004c941     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 459feb8: 911de021     	add	x1, x1, #0x778
 459febc: 910023e8     	add	x8, sp, #0x8
 459fec0: 52804462     	mov	w2, #0x223              ; =547
 459fec4: 96eac36f     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 459fec8: 9100a3e1     	add	x1, sp, #0x28
 459fecc: 910023e2     	add	x2, sp, #0x8
 459fed0: aa1503e0     	mov	x0, x21
 459fed4: 9793018c     	bl	0x2a60504 <_ChromeMain+0x2a5b268>
 459fed8: aa0003f5     	mov	x21, x0
 459fedc: 9101c2c0     	add	x0, x22, #0x70
 459fee0: d2800001     	mov	x1, #0x0                ; =0
 459fee4: 96ea1f75     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 459fee8: 910082c0     	add	x0, x22, #0x20
 459feec: 96ea1f63     	bl	0x27c78 <_ChromeMain+0x229dc>
 459fef0: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 459fef4: 36f800a8     	tbz	w8, #0x1f, 0x459ff08 <_ChromeMain+0x459ac6c>
 459fef8: f94017e0     	ldr	x0, [sp, #0x28]
 459fefc: f9401fe8     	ldr	x8, [sp, #0x38]
 459ff00: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 459ff04: 96e9a3ed     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 459ff08: b40001d5     	cbz	x21, 0x459ff40 <_ChromeMain+0x459aca4>
 459ff0c: 528004a8     	mov	w8, #0x25               ; =37
 459ff10: f90007e8     	str	x8, [sp, #0x8]
 459ff14: d0054b56     	adrp	x22, 0xef09000 <dyld_stub_binder+0xef09000>
 459ff18: 395636c0     	ldrb	w0, [x22, #0x58d]
 459ff1c: 35000ea0     	cbnz	w0, 0x45a00f0 <_ChromeMain+0x459ae54>
 459ff20: aa1503e0     	mov	x0, x21
 459ff24: 52800001     	mov	w1, #0x0                ; =0
 459ff28: 52800022     	mov	w2, #0x1                ; =1
 459ff2c: 977feb18     	bl	0x259ab8c <_ChromeMain+0x25958f0>
 459ff30: 528004a8     	mov	w8, #0x25               ; =37
 459ff34: f90007e8     	str	x8, [sp, #0x8]
 459ff38: 395636c0     	ldrb	w0, [x22, #0x58d]
 459ff3c: 35000ce0     	cbnz	w0, 0x45a00d8 <_ChromeMain+0x459ae3c>
 459ff40: 39038a7f     	strb	wzr, [x19, #0xe2]
 459ff44: f9402e60     	ldr	x0, [x19, #0x58]
 459ff48: f9002e7f     	str	xzr, [x19, #0x58]
 459ff4c: b4000080     	cbz	x0, 0x459ff5c <_ChromeMain+0x459acc0>
 459ff50: f9400008     	ldr	x8, [x0]
 459ff54: f9400508     	ldr	x8, [x8, #0x8]
 459ff58: d63f0100     	blr	x8
 459ff5c: f9403260     	ldr	x0, [x19, #0x60]
 459ff60: f900327f     	str	xzr, [x19, #0x60]
 459ff64: b4000080     	cbz	x0, 0x459ff74 <_ChromeMain+0x459acd8>
 459ff68: 977cbc1c     	bl	0x24cefd8 <_ChromeMain+0x24c9d3c>
 459ff6c: 52800801     	mov	w1, #0x40               ; =64
 459ff70: 96e9a3d2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 459ff74: 3941e268     	ldrb	w8, [x19, #0x78]
 459ff78: 34000068     	cbz	w8, 0x459ff84 <_ChromeMain+0x459ace8>
 459ff7c: 9101a260     	add	x0, x19, #0x68
 459ff80: 976da5bd     	bl	0x2109674 <_ChromeMain+0x21043d8>
 459ff84: b900b27f     	str	wzr, [x19, #0xb0]
 459ff88: 7901c27f     	strh	wzr, [x19, #0xe0]
 459ff8c: f9402a60     	ldr	x0, [x19, #0x50]
 459ff90: b40000a0     	cbz	x0, 0x459ffa4 <_ChromeMain+0x459ad08>
 459ff94: f9002a7f     	str	xzr, [x19, #0x50]
 459ff98: f9400008     	ldr	x8, [x0]
 459ff9c: f9400508     	ldr	x8, [x8, #0x8]
 459ffa0: d63f0100     	blr	x8
 459ffa4: f9402260     	ldr	x0, [x19, #0x40]
 459ffa8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 459ffac: f0053095     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 459ffb0: f94046a9     	ldr	x9, [x21, #0x88]
 459ffb4: eb09011f     	cmp	x8, x9
 459ffb8: 54000041     	b.ne	0x459ffc0 <_ChromeMain+0x459ad24>
 459ffbc: 96ea0aa0     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 459ffc0: f9402660     	ldr	x0, [x19, #0x48]
 459ffc4: a9047e7f     	stp	xzr, xzr, [x19, #0x40]
 459ffc8: b4000080     	cbz	x0, 0x459ffd8 <_ChromeMain+0x459ad3c>
 459ffcc: f9400008     	ldr	x8, [x0]
 459ffd0: f9400508     	ldr	x8, [x8, #0x8]
 459ffd4: d63f0100     	blr	x8
 459ffd8: f9007a7f     	str	xzr, [x19, #0xf0]
 459ffdc: f9407668     	ldr	x8, [x19, #0xe8]
 459ffe0: b4000168     	cbz	x8, 0x45a000c <_ChromeMain+0x459ad70>
 459ffe4: 52800029     	mov	w9, #0x1                ; =1
 459ffe8: 19004109     	stlurb	w9, [x8, #0x4]
 459ffec: f9407660     	ldr	x0, [x19, #0xe8]
 459fff0: b40000e0     	cbz	x0, 0x45a000c <_ChromeMain+0x459ad70>
 459fff4: 12800008     	mov	w8, #-0x1               ; =-1
 459fff8: b8e80008     	ldaddal	w8, w8, [x0]
 459fffc: 7100051f     	cmp	w8, #0x1
 45a0000: 54000061     	b.ne	0x45a000c <_ChromeMain+0x459ad70>
 45a0004: 52800101     	mov	w1, #0x8                ; =8
 45a0008: 96e9a3ac     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a000c: 9101a260     	add	x0, x19, #0x68
 45a0010: 972688cf     	bl	0xf4234c <_ChromeMain+0xf3d0b0>
 45a0014: f9403260     	ldr	x0, [x19, #0x60]
 45a0018: f900327f     	str	xzr, [x19, #0x60]
 45a001c: b4000080     	cbz	x0, 0x45a002c <_ChromeMain+0x459ad90>
 45a0020: 977cbbee     	bl	0x24cefd8 <_ChromeMain+0x24c9d3c>
 45a0024: 52800801     	mov	w1, #0x40               ; =64
 45a0028: 96e9a3a4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a002c: f9402e60     	ldr	x0, [x19, #0x58]
 45a0030: f9002e7f     	str	xzr, [x19, #0x58]
 45a0034: b4000080     	cbz	x0, 0x45a0044 <_ChromeMain+0x459ada8>
 45a0038: f9400008     	ldr	x8, [x0]
 45a003c: f9400508     	ldr	x8, [x8, #0x8]
 45a0040: d63f0100     	blr	x8
 45a0044: f9402a60     	ldr	x0, [x19, #0x50]
 45a0048: f9002a7f     	str	xzr, [x19, #0x50]
 45a004c: b4000080     	cbz	x0, 0x45a005c <_ChromeMain+0x459adc0>
 45a0050: f9400008     	ldr	x8, [x0]
 45a0054: f9400508     	ldr	x8, [x8, #0x8]
 45a0058: d63f0100     	blr	x8
 45a005c: f9402660     	ldr	x0, [x19, #0x48]
 45a0060: f900267f     	str	xzr, [x19, #0x48]
 45a0064: b4000080     	cbz	x0, 0x45a0074 <_ChromeMain+0x459add8>
 45a0068: f9400008     	ldr	x8, [x0]
 45a006c: f9400508     	ldr	x8, [x8, #0x8]
 45a0070: d63f0100     	blr	x8
 45a0074: f9402260     	ldr	x0, [x19, #0x40]
 45a0078: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a007c: f94046a9     	ldr	x9, [x21, #0x88]
 45a0080: eb09011f     	cmp	x8, x9
 45a0084: 54000041     	b.ne	0x45a008c <_ChromeMain+0x459adf0>
 45a0088: 96ea0a6d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a008c: f900227f     	str	xzr, [x19, #0x40]
 45a0090: f9401e60     	ldr	x0, [x19, #0x38]
 45a0094: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a0098: f94046a9     	ldr	x9, [x21, #0x88]
 45a009c: eb09011f     	cmp	x8, x9
 45a00a0: 54000041     	b.ne	0x45a00a8 <_ChromeMain+0x459ae0c>
 45a00a4: 96ea0a66     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a00a8: f9001e7f     	str	xzr, [x19, #0x38]
 45a00ac: aa1403e0     	mov	x0, x20
 45a00b0: 975d9078     	bl	0x1d04290 <_ChromeMain+0x1cfeff4>
 45a00b4: aa1303e0     	mov	x0, x19
 45a00b8: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 45a00bc: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 45a00c0: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 45a00c4: 910343ff     	add	sp, sp, #0xd0
 45a00c8: d65f03c0     	ret
 45a00cc: d4200000     	brk	#0
 45a00d0: d4400000     	hlt	#0
 45a00d4: d4200020     	brk	#0x1
 45a00d8: f90017ff     	str	xzr, [sp, #0x28]
 45a00dc: 910023e1     	add	x1, sp, #0x8
 45a00e0: 9100a3e2     	add	x2, sp, #0x28
 45a00e4: 52800043     	mov	w3, #0x2                ; =2
 45a00e8: 96f34ee8     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 45a00ec: 17ffff95     	b	0x459ff40 <_ChromeMain+0x459aca4>
 45a00f0: d004a048     	adrp	x8, 0xd9aa000 <dyld_stub_binder+0xd9aa000>
 45a00f4: 910a6508     	add	x8, x8, #0x299
 45a00f8: f90017e8     	str	x8, [sp, #0x28]
 45a00fc: 910023e1     	add	x1, sp, #0x8
 45a0100: 9100a3e2     	add	x2, sp, #0x28
 45a0104: 52800023     	mov	w3, #0x1                ; =1
 45a0108: 96f34ee0     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 45a010c: 17ffff85     	b	0x459ff20 <_ChromeMain+0x459ac84>
 45a0110: 17ffff31     	b	0x459fdd4 <_ChromeMain+0x459ab38>
 45a0114: d1002000     	sub	x0, x0, #0x8
 45a0118: 17ffff2f     	b	0x459fdd4 <_ChromeMain+0x459ab38>
 45a011c: d100a000     	sub	x0, x0, #0x28
 45a0120: 17ffff2d     	b	0x459fdd4 <_ChromeMain+0x459ab38>
 45a0124: d100c000     	sub	x0, x0, #0x30
 45a0128: 17ffff2b     	b	0x459fdd4 <_ChromeMain+0x459ab38>
 45a012c: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 45a0130: 910003fd     	mov	x29, sp
 45a0134: 97ffff28     	bl	0x459fdd4 <_ChromeMain+0x459ab38>
 45a0138: 52801f01     	mov	w1, #0xf8               ; =248
 45a013c: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 45a0140: 16e9a35e     	b	0x8eb8 <_ChromeMain+0x3c1c>
 45a0144: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 45a0148: 910003fd     	mov	x29, sp
 45a014c: d1002000     	sub	x0, x0, #0x8
 45a0150: 97ffff21     	bl	0x459fdd4 <_ChromeMain+0x459ab38>
 45a0154: 52801f01     	mov	w1, #0xf8               ; =248
 45a0158: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 45a015c: 16e9a357     	b	0x8eb8 <_ChromeMain+0x3c1c>
 45a0160: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 45a0164: 910003fd     	mov	x29, sp
 45a0168: d100a000     	sub	x0, x0, #0x28
 45a016c: 97ffff1a     	bl	0x459fdd4 <_ChromeMain+0x459ab38>
 45a0170: 52801f01     	mov	w1, #0xf8               ; =248
 45a0174: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 45a0178: 16e9a350     	b	0x8eb8 <_ChromeMain+0x3c1c>
 45a017c: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 45a0180: 910003fd     	mov	x29, sp
 45a0184: d100c000     	sub	x0, x0, #0x30
 45a0188: 97ffff13     	bl	0x459fdd4 <_ChromeMain+0x459ab38>
 45a018c: 52801f01     	mov	w1, #0xf8               ; =248
 45a0190: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 45a0194: 16e9a349     	b	0x8eb8 <_ChromeMain+0x3c1c>
 45a0198: d10503ff     	sub	sp, sp, #0x140
 45a019c: a90e6ffc     	stp	x28, x27, [sp, #0xe0]
 45a01a0: a90f67fa     	stp	x26, x25, [sp, #0xf0]
 45a01a4: a9105ff8     	stp	x24, x23, [sp, #0x100]
 45a01a8: a91157f6     	stp	x22, x21, [sp, #0x110]
 45a01ac: a9124ff4     	stp	x20, x19, [sp, #0x120]
 45a01b0: a9137bfd     	stp	x29, x30, [sp, #0x130]
 45a01b4: 9104c3fd     	add	x29, sp, #0x130
 45a01b8: f9401c08     	ldr	x8, [x0, #0x38]
 45a01bc: b4000b68     	cbz	x8, 0x45a0328 <_ChromeMain+0x459b08c>
 45a01c0: aa0003f3     	mov	x19, x0
 45a01c4: f940f909     	ldr	x9, [x8, #0x1f0]
 45a01c8: f9403129     	ldr	x9, [x9, #0x60]
 45a01cc: 90fe0678     	adrp	x24, 0x66c000 <_ChromeMain+0x666d64>
 45a01d0: 91394318     	add	x24, x24, #0xe50
 45a01d4: eb18013f     	cmp	x9, x24
 45a01d8: 54000ca1     	b.ne	0x45a036c <_ChromeMain+0x459b0d0>
 45a01dc: f941b900     	ldr	x0, [x8, #0x370]
 45a01e0: b4000a60     	cbz	x0, 0x45a032c <_ChromeMain+0x459b090>
 45a01e4: f9401e68     	ldr	x8, [x19, #0x38]
 45a01e8: f9429d08     	ldr	x8, [x8, #0x538]
 45a01ec: f9403500     	ldr	x0, [x8, #0x68]
 45a01f0: 97fffe77     	bl	0x459fbcc <_ChromeMain+0x459a930>
 45a01f4: 340009c0     	cbz	w0, 0x45a032c <_ChromeMain+0x459b090>
 45a01f8: 39438a68     	ldrb	w8, [x19, #0xe2]
 45a01fc: f9402a74     	ldr	x20, [x19, #0x50]
 45a0200: 34000a68     	cbz	w8, 0x45a034c <_ChromeMain+0x459b0b0>
 45a0204: b4000414     	cbz	x20, 0x45a0284 <_ChromeMain+0x459afe8>
 45a0208: d2804d95     	mov	x21, #0x26c             ; =620
 45a020c: f2c02a95     	movk	x21, #0x154, lsl #32
 45a0210: f9401e76     	ldr	x22, [x19, #0x38]
 45a0214: b40000f6     	cbz	x22, 0x45a0230 <_ChromeMain+0x459af94>
 45a0218: f940fac8     	ldr	x8, [x22, #0x1f0]
 45a021c: f9403108     	ldr	x8, [x8, #0x60]
 45a0220: eb18011f     	cmp	x8, x24
 45a0224: 54000ba1     	b.ne	0x45a0398 <_ChromeMain+0x459b0fc>
 45a0228: f941bac0     	ldr	x0, [x22, #0x370]
 45a022c: b5000c40     	cbnz	x0, 0x45a03b4 <_ChromeMain+0x459b118>
 45a0230: d2800008     	mov	x8, #0x0                ; =0
 45a0234: a90457e8     	stp	x8, x21, [sp, #0x40]
 45a0238: f9407288     	ldr	x8, [x20, #0xe0]
 45a023c: b4000248     	cbz	x8, 0x45a0284 <_ChromeMain+0x459afe8>
 45a0240: 19404108     	ldapurb	w8, [x8, #0x4]
 45a0244: 35000208     	cbnz	w8, 0x45a0284 <_ChromeMain+0x459afe8>
 45a0248: f9407688     	ldr	x8, [x20, #0xe8]
 45a024c: b40001c8     	cbz	x8, 0x45a0284 <_ChromeMain+0x459afe8>
 45a0250: f9407288     	ldr	x8, [x20, #0xe0]
 45a0254: b4008708     	cbz	x8, 0x45a1334 <_ChromeMain+0x459c098>
 45a0258: 19404108     	ldapurb	w8, [x8, #0x4]
 45a025c: 350086c8     	cbnz	w8, 0x45a1334 <_ChromeMain+0x459c098>
 45a0260: f9407680     	ldr	x0, [x20, #0xe8]
 45a0264: f9402414     	ldr	x20, [x0, #0x48]
 45a0268: b40000f4     	cbz	x20, 0x45a0284 <_ChromeMain+0x459afe8>
 45a026c: 910103e1     	add	x1, sp, #0x40
 45a0270: 975661d6     	bl	0x1b389c8 <_ChromeMain+0x1b3372c>
 45a0274: a90607e0     	stp	x0, x1, [sp, #0x60]
 45a0278: 910183e1     	add	x1, sp, #0x60
 45a027c: aa1403e0     	mov	x0, x20
 45a0280: 9756620d     	bl	0x1b38ab4 <_ChromeMain+0x1b33818>
 45a0284: f9402273     	ldr	x19, [x19, #0x40]
 45a0288: b4000513     	cbz	x19, 0x45a0328 <_ChromeMain+0x459b08c>
 45a028c: f941a260     	ldr	x0, [x19, #0x340]
 45a0290: b40004c0     	cbz	x0, 0x45a0328 <_ChromeMain+0x459b08c>
 45a0294: f9400008     	ldr	x8, [x0]
 45a0298: f9411108     	ldr	x8, [x8, #0x220]
 45a029c: d63f0100     	blr	x8
 45a02a0: f941a273     	ldr	x19, [x19, #0x340]
 45a02a4: 910183f4     	add	x20, sp, #0x60
 45a02a8: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 45a02ac: b80773ff     	stur	wzr, [sp, #0x77]
 45a02b0: f9003bff     	str	xzr, [sp, #0x70]
 45a02b4: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 45a02b8: ad0403e0     	stp	q0, q0, [sp, #0x80]
 45a02bc: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 45a02c0: 790183ff     	strh	wzr, [sp, #0xc0]
 45a02c4: a90cffff     	stp	xzr, xzr, [sp, #0xc8]
 45a02c8: b004c940     	adrp	x0, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a02cc: 911edc00     	add	x0, x0, #0x7b7
 45a02d0: b004c941     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a02d4: 911de021     	add	x1, x1, #0x778
 45a02d8: 910103e8     	add	x8, sp, #0x40
 45a02dc: 528048e2     	mov	w2, #0x247              ; =583
 45a02e0: 96eac268     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 45a02e4: 910183e1     	add	x1, sp, #0x60
 45a02e8: 910103e2     	add	x2, sp, #0x40
 45a02ec: aa1303e0     	mov	x0, x19
 45a02f0: 97930085     	bl	0x2a60504 <_ChromeMain+0x2a5b268>
 45a02f4: aa0003f3     	mov	x19, x0
 45a02f8: 9101c280     	add	x0, x20, #0x70
 45a02fc: d2800001     	mov	x1, #0x0                ; =0
 45a0300: 96ea1e6e     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a0304: 91008280     	add	x0, x20, #0x20
 45a0308: 96ea1e5c     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a030c: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 45a0310: 36f800a8     	tbz	w8, #0x1f, 0x45a0324 <_ChromeMain+0x459b088>
 45a0314: f94033e0     	ldr	x0, [sp, #0x60]
 45a0318: f9403be8     	ldr	x8, [sp, #0x70]
 45a031c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a0320: 96e9a2e6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a0324: b5000353     	cbnz	x19, 0x45a038c <_ChromeMain+0x459b0f0>
 45a0328: 52800000     	mov	w0, #0x0                ; =0
 45a032c: a9537bfd     	ldp	x29, x30, [sp, #0x130]
 45a0330: a9524ff4     	ldp	x20, x19, [sp, #0x120]
 45a0334: a95157f6     	ldp	x22, x21, [sp, #0x110]
 45a0338: a9505ff8     	ldp	x24, x23, [sp, #0x100]
 45a033c: a94f67fa     	ldp	x26, x25, [sp, #0xf0]
 45a0340: a94e6ffc     	ldp	x28, x27, [sp, #0xe0]
 45a0344: 910503ff     	add	sp, sp, #0x140
 45a0348: d65f03c0     	ret
 45a034c: b4000a34     	cbz	x20, 0x45a0490 <_ChromeMain+0x459b1f4>
 45a0350: 3948a288     	ldrb	w8, [x20, #0x228]
 45a0354: 350009e8     	cbnz	w8, 0x45a0490 <_ChromeMain+0x459b1f4>
 45a0358: f9402260     	ldr	x0, [x19, #0x40]
 45a035c: b4fffe80     	cbz	x0, 0x45a032c <_ChromeMain+0x459b090>
 45a0360: 39438268     	ldrb	w8, [x19, #0xe0]
 45a0364: 34004b48     	cbz	w8, 0x45a0ccc <_ChromeMain+0x459ba30>
 45a0368: 14000257     	b	0x45a0cc4 <_ChromeMain+0x459ba28>
 45a036c: 90fe048a     	adrp	x10, 0x630000 <_ChromeMain+0x62ad64>
 45a0370: 9120c14a     	add	x10, x10, #0x830
 45a0374: eb0a013f     	cmp	x9, x10
 45a0378: 54fff320     	b.eq	0x45a01dc <_ChromeMain+0x459af40>
 45a037c: 9107c100     	add	x0, x8, #0x1f0
 45a0380: d63f0120     	blr	x9
 45a0384: b5fff300     	cbnz	x0, 0x45a01e4 <_ChromeMain+0x459af48>
 45a0388: 17ffffe9     	b	0x45a032c <_ChromeMain+0x459b090>
 45a038c: aa1303e0     	mov	x0, x19
 45a0390: 948e828c     	bl	0x6940dc0 <_ChromeMain+0x693bb24>
 45a0394: 17ffffe5     	b	0x45a0328 <_ChromeMain+0x459b08c>
 45a0398: 90fe0489     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 45a039c: 9120c129     	add	x9, x9, #0x830
 45a03a0: eb09011f     	cmp	x8, x9
 45a03a4: 54fff420     	b.eq	0x45a0228 <_ChromeMain+0x459af8c>
 45a03a8: 9107c2c0     	add	x0, x22, #0x1f0
 45a03ac: d63f0100     	blr	x8
 45a03b0: b4fff400     	cbz	x0, 0x45a0230 <_ChromeMain+0x459af94>
 45a03b4: f940fac8     	ldr	x8, [x22, #0x1f0]
 45a03b8: f9403108     	ldr	x8, [x8, #0x60]
 45a03bc: eb18011f     	cmp	x8, x24
 45a03c0: 540003a1     	b.ne	0x45a0434 <_ChromeMain+0x459b198>
 45a03c4: f941bac0     	ldr	x0, [x22, #0x370]
 45a03c8: 97f94336     	bl	0x43f10a0 <_ChromeMain+0x43ebe04>
 45a03cc: 4e080c00     	dup.2d	v0, x0
 45a03d0: d004ccc8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 45a03d4: 3dc01101     	ldr	q1, [x8, #0x40]
 45a03d8: 6ee14400     	ushl.2d	v0, v0, v1
 45a03dc: 0ea12800     	xtn.2s	v0, v0
 45a03e0: 4e080c22     	dup.2d	v2, x1
 45a03e4: 6ee14441     	ushl.2d	v1, v2, v1
 45a03e8: 0ea12821     	xtn.2s	v1, v1
 45a03ec: 92804d68     	mov	x8, #-0x26c             ; =-620
 45a03f0: f2dfd588     	movk	x8, #0xfeac, lsl #32
 45a03f4: 9e670102     	fmov	d2, x8
 45a03f8: 0ea28421     	add.2s	v1, v1, v2
 45a03fc: 2f211421     	usra.2s	v1, v1, #0x1f
 45a0400: 0f3f1420     	ssra.2s	v0, v1, #0x1
 45a0404: d2804d88     	mov	x8, #0x26c              ; =620
 45a0408: f2c02a88     	movk	x8, #0x154, lsl #32
 45a040c: 9e670101     	fmov	d1, x8
 45a0410: 0ea10c01     	sqadd.2s	v1, v0, v1
 45a0414: 0ea02c21     	sqsub.2s	v1, v1, v0
 45a0418: 0e0c3c28     	mov.s	w8, v1[1]
 45a041c: 1e260029     	fmov	w9, s1
 45a0420: 0aa97d29     	bic	w9, w9, w9, asr #31
 45a0424: 0aa87d08     	bic	w8, w8, w8, asr #31
 45a0428: aa088135     	orr	x21, x9, x8, lsl #32
 45a042c: 9e660008     	fmov	x8, d0
 45a0430: 17ffff81     	b	0x45a0234 <_ChromeMain+0x459af98>
 45a0434: 90fe0489     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 45a0438: 9120c129     	add	x9, x9, #0x830
 45a043c: eb09011f     	cmp	x8, x9
 45a0440: 54fffc20     	b.eq	0x45a03c4 <_ChromeMain+0x459b128>
 45a0444: 9107c2c0     	add	x0, x22, #0x1f0
 45a0448: d63f0100     	blr	x8
 45a044c: 17ffffdf     	b	0x45a03c8 <_ChromeMain+0x459b12c>
 45a0450: 52800028     	mov	w8, #0x1                ; =1
 45a0454: b8280328     	ldadd	w8, w8, [x25]
 45a0458: 7100011f     	cmp	w8, #0x0
 45a045c: 54007ccd     	b.le	0x45a13f4 <_ChromeMain+0x459c158>
 45a0460: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45a0464: 6b09011f     	cmp	w8, w9
 45a0468: 54007cc0     	b.eq	0x45a1400 <_ChromeMain+0x459c164>
 45a046c: 1400008b     	b	0x45a0698 <_ChromeMain+0x459b3fc>
 45a0470: 52800028     	mov	w8, #0x1                ; =1
 45a0474: b82802e8     	ldadd	w8, w8, [x23]
 45a0478: 7100011f     	cmp	w8, #0x0
 45a047c: 54007b0d     	b.le	0x45a13dc <_ChromeMain+0x459c140>
 45a0480: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45a0484: 6b09011f     	cmp	w8, w9
 45a0488: 54007b00     	b.eq	0x45a13e8 <_ChromeMain+0x459c14c>
 45a048c: 14000081     	b	0x45a0690 <_ChromeMain+0x459b3f4>
 45a0490: f9401e68     	ldr	x8, [x19, #0x38]
 45a0494: f9429d08     	ldr	x8, [x8, #0x538]
 45a0498: f9403517     	ldr	x23, [x8, #0x68]
 45a049c: f9407675     	ldr	x21, [x19, #0xe8]
 45a04a0: b40000d5     	cbz	x21, 0x45a04b8 <_ChromeMain+0x459b21c>
 45a04a4: 52800028     	mov	w8, #0x1                ; =1
 45a04a8: b82802a8     	ldadd	w8, w8, [x21]
 45a04ac: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45a04b0: 6b09011f     	cmp	w8, w9
 45a04b4: 540075a0     	b.eq	0x45a1368 <_ChromeMain+0x459c0cc>
 45a04b8: f9407a74     	ldr	x20, [x19, #0xf0]
 45a04bc: 52800800     	mov	w0, #0x40               ; =64
 45a04c0: 96e9bbaa     	bl	0xf368 <_ChromeMain+0xa0cc>
 45a04c4: aa0003f6     	mov	x22, x0
 45a04c8: 52800039     	mov	w25, #0x1               ; =1
 45a04cc: b9000019     	str	w25, [x0]
 45a04d0: d0ffce7a     	adrp	x26, 0x3f6e000 <_ChromeMain+0x3f68d64>
 45a04d4: 9123035a     	add	x26, x26, #0x8c0
 45a04d8: 90ffce7b     	adrp	x27, 0x3f6c000 <_ChromeMain+0x3f66d64>
 45a04dc: 912b037b     	add	x27, x27, #0xac0
 45a04e0: a900ec1a     	stp	x26, x27, [x0, #0x8]
 45a04e4: d0ffd87c     	adrp	x28, 0x40ae000 <_ChromeMain+0x40a8d64>
 45a04e8: 911b039c     	add	x28, x28, #0x6c0
 45a04ec: 1000ce08     	adr	x8, 0x45a1eac <_ChromeMain+0x459cc10>
 45a04f0: d503201f     	nop
 45a04f4: a901a01c     	stp	x28, x8, [x0, #0x18]
 45a04f8: a902d41f     	stp	xzr, x21, [x0, #0x28]
 45a04fc: f9001c14     	str	x20, [x0, #0x38]
 45a0500: f9407675     	ldr	x21, [x19, #0xe8]
 45a0504: f90007f7     	str	x23, [sp, #0x8]
 45a0508: b40000d5     	cbz	x21, 0x45a0520 <_ChromeMain+0x459b284>
 45a050c: b83902a8     	ldadd	w25, w8, [x21]
 45a0510: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45a0514: 6b09011f     	cmp	w8, w9
 45a0518: 540072e0     	b.eq	0x45a1374 <_ChromeMain+0x459c0d8>
 45a051c: f9407a74     	ldr	x20, [x19, #0xf0]
 45a0520: 52800800     	mov	w0, #0x40               ; =64
 45a0524: 96e9bb91     	bl	0xf368 <_ChromeMain+0xa0cc>
 45a0528: aa0003f7     	mov	x23, x0
 45a052c: b9000019     	str	w25, [x0]
 45a0530: a900ec1a     	stp	x26, x27, [x0, #0x8]
 45a0534: 100098c8     	adr	x8, 0x45a184c <_ChromeMain+0x459c5b0>
 45a0538: d503201f     	nop
 45a053c: a901a01c     	stp	x28, x8, [x0, #0x18]
 45a0540: a902d41f     	stp	xzr, x21, [x0, #0x28]
 45a0544: f9001c14     	str	x20, [x0, #0x38]
 45a0548: d0054b59     	adrp	x25, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a054c: 91120339     	add	x25, x25, #0x480
 45a0550: f8bfc320     	ldapr	x0, [x25]
 45a0554: b4006fc0     	cbz	x0, 0x45a134c <_ChromeMain+0x459c0b0>
 45a0558: 52806901     	mov	w1, #0x348              ; =840
 45a055c: d2800002     	mov	x2, #0x0                ; =0
 45a0560: 96ec2c14     	bl	0xab5b0 <_ChromeMain+0xa6314>
 45a0564: aa0003f4     	mov	x20, x0
 45a0568: 97373af6     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 45a056c: f004e8a8     	adrp	x8, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 45a0570: 913c2108     	add	x8, x8, #0xf08
 45a0574: f9018808     	str	x8, [x0, #0x310]
 45a0578: 52800100     	mov	w0, #0x8                ; =8
 45a057c: 96e9bb7b     	bl	0xf368 <_ChromeMain+0xa0cc>
 45a0580: b900001f     	str	wzr, [x0]
 45a0584: 3900101f     	strb	wzr, [x0, #0x4]
 45a0588: b40000c0     	cbz	x0, 0x45a05a0 <_ChromeMain+0x459b304>
 45a058c: 52800028     	mov	w8, #0x1                ; =1
 45a0590: b8280008     	ldadd	w8, w8, [x0]
 45a0594: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45a0598: 6b09011f     	cmp	w8, w9
 45a059c: 54006f20     	b.eq	0x45a1380 <_ChromeMain+0x459c0e4>
 45a05a0: 910c4288     	add	x8, x20, #0x310
 45a05a4: f9018e80     	str	x0, [x20, #0x318]
 45a05a8: f9019288     	str	x8, [x20, #0x320]
 45a05ac: f901969f     	str	xzr, [x20, #0x328]
 45a05b0: 90050b08     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a05b4: 9120c108     	add	x8, x8, #0x830
 45a05b8: 910fe109     	add	x9, x8, #0x3f8
 45a05bc: a9002688     	stp	x8, x9, [x20]
 45a05c0: 91108109     	add	x9, x8, #0x420
 45a05c4: f9000a89     	str	x9, [x20, #0x10]
 45a05c8: 91116109     	add	x9, x8, #0x458
 45a05cc: 9112210a     	add	x10, x8, #0x488
 45a05d0: a906aa89     	stp	x9, x10, [x20, #0x68]
 45a05d4: 91136109     	add	x9, x8, #0x4d8
 45a05d8: f9005a89     	str	x9, [x20, #0xb0]
 45a05dc: 9114e109     	add	x9, x8, #0x538
 45a05e0: f9006e89     	str	x9, [x20, #0xd8]
 45a05e4: 9115a109     	add	x9, x8, #0x568
 45a05e8: f9007e89     	str	x9, [x20, #0xf8]
 45a05ec: 91164108     	add	x8, x8, #0x590
 45a05f0: f9018a88     	str	x8, [x20, #0x310]
 45a05f4: f9019a96     	str	x22, [x20, #0x330]
 45a05f8: f9019e97     	str	x23, [x20, #0x338]
 45a05fc: f901a29f     	str	xzr, [x20, #0x340]
 45a0600: aa1403e0     	mov	x0, x20
 45a0604: d2804d81     	mov	x1, #0x26c              ; =620
 45a0608: f2c02a81     	movk	x1, #0x154, lsl #32
 45a060c: 52800022     	mov	w2, #0x1                ; =1
 45a0610: 9788c514     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 45a0614: 52800200     	mov	w0, #0x10               ; =16
 45a0618: 96e9bb54     	bl	0xf368 <_ChromeMain+0xa0cc>
 45a061c: aa0003e1     	mov	x1, x0
 45a0620: f004ed48     	adrp	x8, 0xe34b000 <dyld_stub_binder+0xe34b000>
 45a0624: 913c0108     	add	x8, x8, #0xf00
 45a0628: d2c00029     	mov	x9, #0x100000000        ; =4294967296
 45a062c: a9002408     	stp	x8, x9, [x0]
 45a0630: aa1403e0     	mov	x0, x20
 45a0634: 97261cf3     	bl	0xf27a00 <_ChromeMain+0xf22764>
 45a0638: 52801f00     	mov	w0, #0xf8               ; =248
 45a063c: 96e9bb4b     	bl	0xf368 <_ChromeMain+0xa0cc>
 45a0640: aa0003f6     	mov	x22, x0
 45a0644: 973b9427     	bl	0x14856e0 <_ChromeMain+0x1480444>
 45a0648: d004ed88     	adrp	x8, 0xe352000 <dyld_stub_binder+0xe352000>
 45a064c: 91366108     	add	x8, x8, #0xd98
 45a0650: f9000008     	str	x8, [x0]
 45a0654: 91036108     	add	x8, x8, #0xd8
 45a0658: f9001408     	str	x8, [x0, #0x28]
 45a065c: 52802008     	mov	w8, #0x100              ; =256
 45a0660: 7901e008     	strh	w8, [x0, #0xf0]
 45a0664: aa1403e0     	mov	x0, x20
 45a0668: aa1603e1     	mov	x1, x22
 45a066c: 9757a473     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 45a0670: f8bfc320     	ldapr	x0, [x25]
 45a0674: b4006700     	cbz	x0, 0x45a1354 <_ChromeMain+0x459c0b8>
 45a0678: 5280a501     	mov	w1, #0x528              ; =1320
 45a067c: d2800002     	mov	x2, #0x0                ; =0
 45a0680: 96ec2bcc     	bl	0xab5b0 <_ChromeMain+0xa6314>
 45a0684: aa0003f6     	mov	x22, x0
 45a0688: f9419a97     	ldr	x23, [x20, #0x330]
 45a068c: b5ffef37     	cbnz	x23, 0x45a0470 <_ChromeMain+0x459b1d4>
 45a0690: f9419e99     	ldr	x25, [x20, #0x338]
 45a0694: b5ffedf9     	cbnz	x25, 0x45a0450 <_ChromeMain+0x459b1b4>
 45a0698: aa1603e0     	mov	x0, x22
 45a069c: f94007e1     	ldr	x1, [sp, #0x8]
 45a06a0: 978bd842     	bl	0x28967a8 <_ChromeMain+0x289150c>
 45a06a4: f0050ae8     	adrp	x8, 0xe6ff000 <dyld_stub_binder+0xe6ff000>
 45a06a8: 91254108     	add	x8, x8, #0x950
 45a06ac: 9111e109     	add	x9, x8, #0x478
 45a06b0: a90026c8     	stp	x8, x9, [x22]
 45a06b4: 91128109     	add	x9, x8, #0x4a0
 45a06b8: f9000ac9     	str	x9, [x22, #0x10]
 45a06bc: 91136109     	add	x9, x8, #0x4d8
 45a06c0: 9114210a     	add	x10, x8, #0x508
 45a06c4: a906aac9     	stp	x9, x10, [x22, #0x68]
 45a06c8: 91156109     	add	x9, x8, #0x558
 45a06cc: f9005ac9     	str	x9, [x22, #0xb0]
 45a06d0: 9116e109     	add	x9, x8, #0x5b8
 45a06d4: f9006ec9     	str	x9, [x22, #0xd8]
 45a06d8: 9117a109     	add	x9, x8, #0x5e8
 45a06dc: f9007ec9     	str	x9, [x22, #0xf8]
 45a06e0: 91184109     	add	x9, x8, #0x610
 45a06e4: f9018ac9     	str	x9, [x22, #0x310]
 45a06e8: 9127c109     	add	x9, x8, #0x9f0
 45a06ec: f9019ac9     	str	x9, [x22, #0x330]
 45a06f0: 9137c109     	add	x9, x8, #0xdf0
 45a06f4: f901aac9     	str	x9, [x22, #0x350]
 45a06f8: 91388109     	add	x9, x8, #0xe20
 45a06fc: f901b6c9     	str	x9, [x22, #0x368]
 45a0700: 91392108     	add	x8, x8, #0xe48
 45a0704: f9027ac8     	str	x8, [x22, #0x4f0]
 45a0708: b904fadf     	str	wzr, [x22, #0x4f8]
 45a070c: 6f00e400     	movi.2d	v0, #0000000000000000
 45a0710: 3d8142c0     	str	q0, [x22, #0x500]
 45a0714: 391442df     	strb	wzr, [x22, #0x510]
 45a0718: f9028ed7     	str	x23, [x22, #0x518]
 45a071c: f90292d9     	str	x25, [x22, #0x520]
 45a0720: 52800028     	mov	w8, #0x1                ; =1
 45a0724: 390f42c8     	strb	w8, [x22, #0x3d0]
 45a0728: d2804d81     	mov	x1, #0x26c              ; =620
 45a072c: f2c02a81     	movk	x1, #0x154, lsl #32
 45a0730: 52800022     	mov	w2, #0x1                ; =1
 45a0734: 9788c4cb     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 45a0738: 3945a6c8     	ldrb	w8, [x22, #0x169]
 45a073c: 35006108     	cbnz	w8, 0x45a135c <_ChromeMain+0x459c0c0>
 45a0740: f940ce82     	ldr	x2, [x20, #0x198]
 45a0744: aa1403e0     	mov	x0, x20
 45a0748: aa1603e1     	mov	x1, x22
 45a074c: 9707632c     	bl	0x7793fc <_ChromeMain+0x774160>
 45a0750: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45a0754: d0053097     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a0758: f94046e9     	ldr	x9, [x23, #0x88]
 45a075c: eb09011f     	cmp	x8, x9
 45a0760: 54000061     	b.ne	0x45a076c <_ChromeMain+0x459b4d0>
 45a0764: aa1603e0     	mov	x0, x22
 45a0768: 96e9cee5     	bl	0x142fc <_ChromeMain+0xf060>
 45a076c: f941a280     	ldr	x0, [x20, #0x340]
 45a0770: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a0774: f94046e9     	ldr	x9, [x23, #0x88]
 45a0778: eb09011f     	cmp	x8, x9
 45a077c: 54000041     	b.ne	0x45a0784 <_ChromeMain+0x459b4e8>
 45a0780: 96ea08af     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a0784: f901a296     	str	x22, [x20, #0x340]
 45a0788: 910183f9     	add	x25, sp, #0x60
 45a078c: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 45a0790: b80773ff     	stur	wzr, [sp, #0x77]
 45a0794: f9003bff     	str	xzr, [sp, #0x70]
 45a0798: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 45a079c: ad0403e0     	stp	q0, q0, [sp, #0x80]
 45a07a0: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 45a07a4: 790183ff     	strh	wzr, [sp, #0xc0]
 45a07a8: a90cffff     	stp	xzr, xzr, [sp, #0xc8]
 45a07ac: b004c940     	adrp	x0, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a07b0: 911d5c00     	add	x0, x0, #0x757
 45a07b4: b004c941     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a07b8: 911de021     	add	x1, x1, #0x778
 45a07bc: 910103e8     	add	x8, sp, #0x40
 45a07c0: 52804222     	mov	w2, #0x211              ; =529
 45a07c4: 96eac12f     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 45a07c8: 910183e1     	add	x1, sp, #0x60
 45a07cc: 910103e2     	add	x2, sp, #0x40
 45a07d0: aa1603e0     	mov	x0, x22
 45a07d4: 9792ff4c     	bl	0x2a60504 <_ChromeMain+0x2a5b268>
 45a07d8: aa0003f5     	mov	x21, x0
 45a07dc: 9101c320     	add	x0, x25, #0x70
 45a07e0: d2800001     	mov	x1, #0x0                ; =0
 45a07e4: 96ea1d35     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a07e8: 91008320     	add	x0, x25, #0x20
 45a07ec: 96ea1d23     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a07f0: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 45a07f4: 36f800a8     	tbz	w8, #0x1f, 0x45a0808 <_ChromeMain+0x459b56c>
 45a07f8: f94033e0     	ldr	x0, [sp, #0x60]
 45a07fc: f9403be8     	ldr	x8, [sp, #0x70]
 45a0800: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a0804: 96e9a1ad     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a0808: 910c4280     	add	x0, x20, #0x310
 45a080c: aa1503e1     	mov	x1, x21
 45a0810: 9757fcbe     	bl	0x1b9fb08 <_ChromeMain+0x1b9a86c>
 45a0814: aa1403e0     	mov	x0, x20
 45a0818: 94000dfa     	bl	0x45a4000 <_ChromeMain+0x459ed64>
 45a081c: f941a295     	ldr	x21, [x20, #0x340]
 45a0820: b00529a0     	adrp	x0, 0xead5000 <dyld_stub_binder+0xead5000>
 45a0824: 911be000     	add	x0, x0, #0x6f8
 45a0828: 910083f6     	add	x22, sp, #0x20
 45a082c: 910083e8     	add	x8, sp, #0x20
 45a0830: 528000a1     	mov	w1, #0x5                ; =5
 45a0834: 970328c8     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 45a0838: 3980dfe8     	ldrsb	x8, [sp, #0x37]
 45a083c: a9422be9     	ldp	x9, x10, [sp, #0x20]
 45a0840: f100011f     	cmp	x8, #0x0
 45a0844: 9a964121     	csel	x1, x9, x22, mi
 45a0848: 7100011f     	cmp	w8, #0x0
 45a084c: 9a884142     	csel	x2, x10, x8, mi
 45a0850: 910183f6     	add	x22, sp, #0x60
 45a0854: 910183e0     	add	x0, sp, #0x60
 45a0858: 96f73e5f     	bl	0x3701d4 <_ChromeMain+0x36af38>
 45a085c: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 45a0860: 36f800a8     	tbz	w8, #0x1f, 0x45a0874 <_ChromeMain+0x459b5d8>
 45a0864: f94013e0     	ldr	x0, [sp, #0x20]
 45a0868: f9401be8     	ldr	x8, [sp, #0x30]
 45a086c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a0870: 96e9a192     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a0874: b004c940     	adrp	x0, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a0878: 911d5c00     	add	x0, x0, #0x757
 45a087c: b004c941     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a0880: 911de021     	add	x1, x1, #0x778
 45a0884: 910083e8     	add	x8, sp, #0x20
 45a0888: 52804282     	mov	w2, #0x214              ; =532
 45a088c: 96eac0fd     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 45a0890: 910183e1     	add	x1, sp, #0x60
 45a0894: 910083e3     	add	x3, sp, #0x20
 45a0898: aa1503e0     	mov	x0, x21
 45a089c: 52800022     	mov	w2, #0x1                ; =1
 45a08a0: 97dbc33d     	bl	0x3c91594 <_ChromeMain+0x3c8c2f8>
 45a08a4: 9101c2c0     	add	x0, x22, #0x70
 45a08a8: d2800001     	mov	x1, #0x0                ; =0
 45a08ac: 96ea1d03     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a08b0: 910082c0     	add	x0, x22, #0x20
 45a08b4: 96ea1cf1     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a08b8: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 45a08bc: 36f800a8     	tbz	w8, #0x1f, 0x45a08d0 <_ChromeMain+0x459b634>
 45a08c0: f94033e0     	ldr	x0, [sp, #0x60]
 45a08c4: f9403be8     	ldr	x8, [sp, #0x70]
 45a08c8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a08cc: 96e9a17b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a08d0: 52800368     	mov	w8, #0x1b               ; =27
 45a08d4: 7900c3e8     	strh	w8, [sp, #0x60]
 45a08d8: 290cffff     	stp	wzr, wzr, [sp, #0x64]
 45a08dc: f9003bff     	str	xzr, [sp, #0x70]
 45a08e0: 3901e3ff     	strb	wzr, [sp, #0x78]
 45a08e4: 12800015     	mov	w21, #-0x1              ; =-1
 45a08e8: b9007ff5     	str	w21, [sp, #0x7c]
 45a08ec: 910183e1     	add	x1, sp, #0x60
 45a08f0: aa1403e0     	mov	x0, x20
 45a08f4: 9757aa22     	bl	0x1b8b17c <_ChromeMain+0x1b85ee0>
 45a08f8: 52800828     	mov	w8, #0x41               ; =65
 45a08fc: 7900c3e8     	strh	w8, [sp, #0x60]
 45a0900: d2c00248     	mov	x8, #0x1200000000       ; =77309411328
 45a0904: f80643e8     	stur	x8, [sp, #0x64]
 45a0908: f9003bff     	str	xzr, [sp, #0x70]
 45a090c: 3901e3ff     	strb	wzr, [sp, #0x78]
 45a0910: b9007ff5     	str	w21, [sp, #0x7c]
 45a0914: 910183e1     	add	x1, sp, #0x60
 45a0918: aa1403e0     	mov	x0, x20
 45a091c: 9757aa18     	bl	0x1b8b17c <_ChromeMain+0x1b85ee0>
 45a0920: 925e7688     	and	x8, x20, #0xfffffffc00000000
 45a0924: f94046e9     	ldr	x9, [x23, #0x88]
 45a0928: eb09011f     	cmp	x8, x9
 45a092c: 54000061     	b.ne	0x45a0938 <_ChromeMain+0x459b69c>
 45a0930: aa1403e0     	mov	x0, x20
 45a0934: 96e9ce72     	bl	0x142fc <_ChromeMain+0xf060>
 45a0938: f9402260     	ldr	x0, [x19, #0x40]
 45a093c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a0940: f94046e9     	ldr	x9, [x23, #0x88]
 45a0944: eb09011f     	cmp	x8, x9
 45a0948: 54000041     	b.ne	0x45a0950 <_ChromeMain+0x459b6b4>
 45a094c: 96ea083c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a0950: f9002274     	str	x20, [x19, #0x40]
 45a0954: f941a295     	ldr	x21, [x20, #0x340]
 45a0958: b4000935     	cbz	x21, 0x45a0a7c <_ChromeMain+0x459b7e0>
 45a095c: 910183f6     	add	x22, sp, #0x60
 45a0960: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 45a0964: b80773ff     	stur	wzr, [sp, #0x77]
 45a0968: f9003bff     	str	xzr, [sp, #0x70]
 45a096c: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 45a0970: ad0403e0     	stp	q0, q0, [sp, #0x80]
 45a0974: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 45a0978: 790183ff     	strh	wzr, [sp, #0xc0]
 45a097c: a90cffff     	stp	xzr, xzr, [sp, #0xc8]
 45a0980: 9004a840     	adrp	x0, 0xdaa8000 <dyld_stub_binder+0xdaa8000>
 45a0984: 91330400     	add	x0, x0, #0xcc1
 45a0988: b004c941     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a098c: 911de021     	add	x1, x1, #0x778
 45a0990: 910103e8     	add	x8, sp, #0x40
 45a0994: 52804462     	mov	w2, #0x223              ; =547
 45a0998: 96eac0ba     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 45a099c: 910183e1     	add	x1, sp, #0x60
 45a09a0: 910103e2     	add	x2, sp, #0x40
 45a09a4: aa1503e0     	mov	x0, x21
 45a09a8: 9792fed7     	bl	0x2a60504 <_ChromeMain+0x2a5b268>
 45a09ac: aa0003f5     	mov	x21, x0
 45a09b0: 9101c2c0     	add	x0, x22, #0x70
 45a09b4: d2800001     	mov	x1, #0x0                ; =0
 45a09b8: 96ea1cc0     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a09bc: 910082c0     	add	x0, x22, #0x20
 45a09c0: 96ea1cae     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a09c4: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 45a09c8: 36f800a8     	tbz	w8, #0x1f, 0x45a09dc <_ChromeMain+0x459b740>
 45a09cc: f94033e0     	ldr	x0, [sp, #0x60]
 45a09d0: f9403be8     	ldr	x8, [sp, #0x70]
 45a09d4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a09d8: 96e9a138     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a09dc: b4000515     	cbz	x21, 0x45a0a7c <_ChromeMain+0x459b7e0>
 45a09e0: f9401e68     	ldr	x8, [x19, #0x38]
 45a09e4: f9429d19     	ldr	x25, [x8, #0x538]
 45a09e8: f0048a01     	adrp	x1, 0xd6e3000 <dyld_stub_binder+0xd6e3000>
 45a09ec: 91396021     	add	x1, x1, #0xe58
 45a09f0: 910022a0     	add	x0, x21, #0x8
 45a09f4: 96eac9df     	bl	0x53170 <_ChromeMain+0x4ded4>
 45a09f8: b5000420     	cbnz	x0, 0x45a0a7c <_ChromeMain+0x459b7e0>
 45a09fc: 52800400     	mov	w0, #0x20               ; =32
 45a0a00: 96e9ba5a     	bl	0xf368 <_ChromeMain+0xa0cc>
 45a0a04: aa0003f6     	mov	x22, x0
 45a0a08: 9100a328     	add	x8, x25, #0x28
 45a0a0c: f100033f     	cmp	x25, #0x0
 45a0a10: 9a8803f9     	csel	x25, xzr, x8, eq
 45a0a14: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45a0a18: f94046e9     	ldr	x9, [x23, #0x88]
 45a0a1c: eb09011f     	cmp	x8, x9
 45a0a20: 54000061     	b.ne	0x45a0a2c <_ChromeMain+0x459b790>
 45a0a24: aa1503e0     	mov	x0, x21
 45a0a28: 96e9ce35     	bl	0x142fc <_ChromeMain+0xf060>
 45a0a2c: 9004fb28     	adrp	x8, 0xe504000 <dyld_stub_binder+0xe504000>
 45a0a30: 91338108     	add	x8, x8, #0xce0
 45a0a34: a90056c8     	stp	x8, x21, [x22]
 45a0a38: f940c728     	ldr	x8, [x25, #0x188]
 45a0a3c: b40000c8     	cbz	x8, 0x45a0a54 <_ChromeMain+0x459b7b8>
 45a0a40: 52800029     	mov	w9, #0x1                ; =1
 45a0a44: b8290109     	ldadd	w9, w9, [x8]
 45a0a48: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 45a0a4c: 6b0a013f     	cmp	w9, w10
 45a0a50: 54004780     	b.eq	0x45a1340 <_ChromeMain+0x459c0a4>
 45a0a54: f940cb29     	ldr	x9, [x25, #0x190]
 45a0a58: 9100a12a     	add	x10, x9, #0x28
 45a0a5c: f100013f     	cmp	x9, #0x0
 45a0a60: 9a8a03e9     	csel	x9, xzr, x10, eq
 45a0a64: a90126c8     	stp	x8, x9, [x22, #0x10]
 45a0a68: f0048a01     	adrp	x1, 0xd6e3000 <dyld_stub_binder+0xd6e3000>
 45a0a6c: 91396021     	add	x1, x1, #0xe58
 45a0a70: 910022a0     	add	x0, x21, #0x8
 45a0a74: aa1603e2     	mov	x2, x22
 45a0a78: 97271ca2     	bl	0xf67d00 <_ChromeMain+0xf62a64>
 45a0a7c: 52808c00     	mov	w0, #0x460              ; =1120
 45a0a80: 96e9ba3a     	bl	0xf368 <_ChromeMain+0xa0cc>
 45a0a84: aa0003f5     	mov	x21, x0
 45a0a88: f9401e76     	ldr	x22, [x19, #0x38]
 45a0a8c: f94326c8     	ldr	x8, [x22, #0x648]
 45a0a90: f90023e8     	str	x8, [sp, #0x40]
 45a0a94: f90033ff     	str	xzr, [sp, #0x60]
 45a0a98: 3901a3ff     	strb	wzr, [sp, #0x68]
 45a0a9c: b50047e8     	cbnz	x8, 0x45a1398 <_ChromeMain+0x459c0fc>
 45a0aa0: 910183e1     	add	x1, sp, #0x60
 45a0aa4: aa1503e0     	mov	x0, x21
 45a0aa8: 52800002     	mov	w2, #0x0                ; =0
 45a0aac: 52800023     	mov	w3, #0x1                ; =1
 45a0ab0: 52800004     	mov	w4, #0x0                ; =0
 45a0ab4: 958316df     	bl	0xa666630 <_ChromeMain+0xa661394>
 45a0ab8: 910183e0     	add	x0, sp, #0x60
 45a0abc: 97a56cf0     	bl	0x2efbe7c <_ChromeMain+0x2ef6be0>
 45a0ac0: 9004fb28     	adrp	x8, 0xe504000 <dyld_stub_binder+0xe504000>
 45a0ac4: 912aa108     	add	x8, x8, #0xaa8
 45a0ac8: f90002a8     	str	x8, [x21]
 45a0acc: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45a0ad0: f94046e9     	ldr	x9, [x23, #0x88]
 45a0ad4: eb09011f     	cmp	x8, x9
 45a0ad8: 54000061     	b.ne	0x45a0ae4 <_ChromeMain+0x459b848>
 45a0adc: aa1603e0     	mov	x0, x22
 45a0ae0: 96e9ce07     	bl	0x142fc <_ChromeMain+0xf060>
 45a0ae4: f9022ab6     	str	x22, [x21, #0x450]
 45a0ae8: 925e7668     	and	x8, x19, #0xfffffffc00000000
 45a0aec: f94046e9     	ldr	x9, [x23, #0x88]
 45a0af0: eb09011f     	cmp	x8, x9
 45a0af4: 54000061     	b.ne	0x45a0b00 <_ChromeMain+0x459b864>
 45a0af8: aa1303e0     	mov	x0, x19
 45a0afc: 96e9ce00     	bl	0x142fc <_ChromeMain+0xf060>
 45a0b00: f9022eb3     	str	x19, [x21, #0x458]
 45a0b04: b941daa8     	ldr	w8, [x21, #0x1d8]
 45a0b08: 340000c8     	cbz	w8, 0x45a0b20 <_ChromeMain+0x459b884>
 45a0b0c: b901dabf     	str	wzr, [x21, #0x1d8]
 45a0b10: 910982a0     	add	x0, x21, #0x260
 45a0b14: d2800001     	mov	x1, #0x0                ; =0
 45a0b18: 52800022     	mov	w2, #0x1                ; =1
 45a0b1c: 95853041     	bl	0xa6ecc20 <_ChromeMain+0xa6e7984>
 45a0b20: a918febf     	stp	xzr, xzr, [x21, #0x188]
 45a0b24: 52800148     	mov	w8, #0xa                ; =10
 45a0b28: b901cea8     	str	w8, [x21, #0x1cc]
 45a0b2c: 52800028     	mov	w8, #0x1                ; =1
 45a0b30: 390742a8     	strb	w8, [x21, #0x1d0]
 45a0b34: 390dc6bf     	strb	wzr, [x21, #0x371]
 45a0b38: 390e02bf     	strb	wzr, [x21, #0x380]
 45a0b3c: b90043ff     	str	wzr, [sp, #0x40]
 45a0b40: 390113e8     	strb	w8, [sp, #0x44]
 45a0b44: 910103e1     	add	x1, sp, #0x40
 45a0b48: aa1503e0     	mov	x0, x21
 45a0b4c: 95831ca5     	bl	0xa667de0 <_ChromeMain+0xa662b44>
 45a0b50: 52800400     	mov	w0, #0x20               ; =32
 45a0b54: 96e9ba05     	bl	0xf368 <_ChromeMain+0xa0cc>
 45a0b58: 91007809     	add	x9, x0, #0x1e
 45a0b5c: eb00013f     	cmp	x9, x0
 45a0b60: 54003f43     	b.lo	0x45a1348 <_ChromeMain+0x459c0ac>
 45a0b64: aa0003f6     	mov	x22, x0
 45a0b68: f0048a08     	adrp	x8, 0xd6e3000 <dyld_stub_binder+0xd6e3000>
 45a0b6c: 9138e108     	add	x8, x8, #0xe38
 45a0b70: eb08013f     	cmp	x9, x8
 45a0b74: fa488002     	ccmp	x0, x8, #0x2, hi
 45a0b78: 54003e89     	b.ls	0x45a1348 <_ChromeMain+0x459c0ac>
 45a0b7c: 3dc00100     	ldr	q0, [x8]
 45a0b80: 3d8002c0     	str	q0, [x22]
 45a0b84: 3cc0e100     	ldur	q0, [x8, #0xe]
 45a0b88: 3c80e2c0     	stur	q0, [x22, #0xe]
 45a0b8c: 39007adf     	strb	wzr, [x22, #0x1e]
 45a0b90: 39c2bea8     	ldrsb	w8, [x21, #0xaf]
 45a0b94: 37f83be8     	tbnz	w8, #0x1f, 0x45a1310 <_ChromeMain+0x459c074>
 45a0b98: 910262a0     	add	x0, x21, #0x98
 45a0b9c: aa1603e1     	mov	x1, x22
 45a0ba0: 528003c2     	mov	w2, #0x1e               ; =30
 45a0ba4: 96fc1fc4     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 45a0ba8: aa1603e0     	mov	x0, x22
 45a0bac: 52800401     	mov	w1, #0x20               ; =32
 45a0bb0: 96e9a0c2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a0bb4: f9402660     	ldr	x0, [x19, #0x48]
 45a0bb8: f9002675     	str	x21, [x19, #0x48]
 45a0bbc: b40000a0     	cbz	x0, 0x45a0bd0 <_ChromeMain+0x459b934>
 45a0bc0: f9400008     	ldr	x8, [x0]
 45a0bc4: f9400508     	ldr	x8, [x8, #0x8]
 45a0bc8: d63f0100     	blr	x8
 45a0bcc: f9402675     	ldr	x21, [x19, #0x48]
 45a0bd0: aa1503e0     	mov	x0, x21
 45a0bd4: aa1403e1     	mov	x1, x20
 45a0bd8: 9585198f     	bl	0xa6e7214 <_ChromeMain+0xa6e1f78>
 45a0bdc: f9402660     	ldr	x0, [x19, #0x48]
 45a0be0: 52800001     	mov	w1, #0x0                ; =0
 45a0be4: d2800002     	mov	x2, #0x0                ; =0
 45a0be8: 97f90d76     	bl	0x43e41c0 <_ChromeMain+0x43def24>
 45a0bec: f9402a68     	ldr	x8, [x19, #0x50]
 45a0bf0: f9002a60     	str	x0, [x19, #0x50]
 45a0bf4: b40000c8     	cbz	x8, 0x45a0c0c <_ChromeMain+0x459b970>
 45a0bf8: f9400109     	ldr	x9, [x8]
 45a0bfc: f9400529     	ldr	x9, [x9, #0x8]
 45a0c00: aa0803e0     	mov	x0, x8
 45a0c04: d63f0120     	blr	x9
 45a0c08: f9402a60     	ldr	x0, [x19, #0x50]
 45a0c0c: b5ffba60     	cbnz	x0, 0x45a0358 <_ChromeMain+0x459b0bc>
 45a0c10: 17fffdc7     	b	0x45a032c <_ChromeMain+0x459b090>
 45a0c14: 90fe0489     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 45a0c18: 9120c129     	add	x9, x9, #0x830
 45a0c1c: eb09011f     	cmp	x8, x9
 45a0c20: 540001e0     	b.eq	0x45a0c5c <_ChromeMain+0x459b9c0>
 45a0c24: 9107c280     	add	x0, x20, #0x1f0
 45a0c28: d63f0100     	blr	x8
 45a0c2c: 1400000d     	b	0x45a0c60 <_ChromeMain+0x459b9c4>
 45a0c30: 90fe0489     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 45a0c34: 9120c129     	add	x9, x9, #0x830
 45a0c38: eb09011f     	cmp	x8, x9
 45a0c3c: 540005c0     	b.eq	0x45a0cf4 <_ChromeMain+0x459ba58>
 45a0c40: 9107c280     	add	x0, x20, #0x1f0
 45a0c44: d63f0100     	blr	x8
 45a0c48: b40005a0     	cbz	x0, 0x45a0cfc <_ChromeMain+0x459ba60>
 45a0c4c: f940fa88     	ldr	x8, [x20, #0x1f0]
 45a0c50: f9403108     	ldr	x8, [x8, #0x60]
 45a0c54: eb18011f     	cmp	x8, x24
 45a0c58: 54fffde1     	b.ne	0x45a0c14 <_ChromeMain+0x459b978>
 45a0c5c: f941ba80     	ldr	x0, [x20, #0x370]
 45a0c60: 97f94110     	bl	0x43f10a0 <_ChromeMain+0x43ebe04>
 45a0c64: 4e080c00     	dup.2d	v0, x0
 45a0c68: d004ccc8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 45a0c6c: 3dc01101     	ldr	q1, [x8, #0x40]
 45a0c70: 6ee14400     	ushl.2d	v0, v0, v1
 45a0c74: 0ea12800     	xtn.2s	v0, v0
 45a0c78: 4e080c22     	dup.2d	v2, x1
 45a0c7c: 6ee14441     	ushl.2d	v1, v2, v1
 45a0c80: 0ea12821     	xtn.2s	v1, v1
 45a0c84: 92804d68     	mov	x8, #-0x26c             ; =-620
 45a0c88: f2dfd588     	movk	x8, #0xfeac, lsl #32
 45a0c8c: 9e670102     	fmov	d2, x8
 45a0c90: 0ea28421     	add.2s	v1, v1, v2
 45a0c94: 2f211421     	usra.2s	v1, v1, #0x1f
 45a0c98: 0f3f1420     	ssra.2s	v0, v1, #0x1
 45a0c9c: d2804d88     	mov	x8, #0x26c              ; =620
 45a0ca0: f2c02a88     	movk	x8, #0x154, lsl #32
 45a0ca4: 9e670101     	fmov	d1, x8
 45a0ca8: 0ea10c01     	sqadd.2s	v1, v0, v1
 45a0cac: 0ea02c21     	sqsub.2s	v1, v1, v0
 45a0cb0: 6f00e402     	movi.2d	v2, #0000000000000000
 45a0cb4: 0ea26421     	smax.2s	v1, v1, v2
 45a0cb8: 9e660035     	fmov	x21, d1
 45a0cbc: 9e660016     	fmov	x22, d0
 45a0cc0: 14000010     	b	0x45a0d00 <_ChromeMain+0x459ba64>
 45a0cc4: 3903827f     	strb	wzr, [x19, #0xe0]
 45a0cc8: 9400048f     	bl	0x45a1f04 <_ChromeMain+0x459cc68>
 45a0ccc: d2804d95     	mov	x21, #0x26c             ; =620
 45a0cd0: f2c02a95     	movk	x21, #0x154, lsl #32
 45a0cd4: 52800028     	mov	w8, #0x1                ; =1
 45a0cd8: 39038a68     	strb	w8, [x19, #0xe2]
 45a0cdc: f9401e74     	ldr	x20, [x19, #0x38]
 45a0ce0: b40000f4     	cbz	x20, 0x45a0cfc <_ChromeMain+0x459ba60>
 45a0ce4: f940fa88     	ldr	x8, [x20, #0x1f0]
 45a0ce8: f9403108     	ldr	x8, [x8, #0x60]
 45a0cec: eb18011f     	cmp	x8, x24
 45a0cf0: 54fffa01     	b.ne	0x45a0c30 <_ChromeMain+0x459b994>
 45a0cf4: f941ba80     	ldr	x0, [x20, #0x370]
 45a0cf8: b5fffaa0     	cbnz	x0, 0x45a0c4c <_ChromeMain+0x459b9b0>
 45a0cfc: d2800016     	mov	x22, #0x0               ; =0
 45a0d00: a90457f6     	stp	x22, x21, [sp, #0x40]
 45a0d04: f9402a68     	ldr	x8, [x19, #0x50]
 45a0d08: b40014a8     	cbz	x8, 0x45a0f9c <_ChromeMain+0x459bd00>
 45a0d0c: 3941e268     	ldrb	w8, [x19, #0x78]
 45a0d10: 34000068     	cbz	w8, 0x45a0d1c <_ChromeMain+0x459ba80>
 45a0d14: 9101a260     	add	x0, x19, #0x68
 45a0d18: 976da257     	bl	0x2109674 <_ChromeMain+0x21043d8>
 45a0d1c: b900b27f     	str	wzr, [x19, #0xb0]
 45a0d20: 90054b48     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 45a0d24: f9401914     	ldr	x20, [x8, #0x30]
 45a0d28: d0046421     	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 45a0d2c: 910a4c21     	add	x1, x1, #0x293
 45a0d30: aa1403e0     	mov	x0, x20
 45a0d34: 96f15212     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 45a0d38: 37000180     	tbnz	w0, #0x0, 0x45a0d68 <_ChromeMain+0x459bacc>
 45a0d3c: d0046421     	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 45a0d40: 910ac021     	add	x1, x1, #0x2b0
 45a0d44: aa1403e0     	mov	x0, x20
 45a0d48: 96f1520d     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 45a0d4c: 370006e0     	tbnz	w0, #0x0, 0x45a0e28 <_ChromeMain+0x459bb8c>
 45a0d50: 90054b94     	adrp	x20, 0xef10000 <dyld_stub_binder+0xef10000>
 45a0d54: 394ca688     	ldrb	w8, [x20, #0x329]
 45a0d58: 36002e68     	tbz	w8, #0x0, 0x45a1324 <_ChromeMain+0x459c088>
 45a0d5c: 90054b88     	adrp	x8, 0xef10000 <dyld_stub_binder+0xef10000>
 45a0d60: 394ca108     	ldrb	w8, [x8, #0x328]
 45a0d64: 34000628     	cbz	w8, 0x45a0e28 <_ChromeMain+0x459bb8c>
 45a0d68: f9402a68     	ldr	x8, [x19, #0x50]
 45a0d6c: f9407109     	ldr	x9, [x8, #0xe0]
 45a0d70: b4000249     	cbz	x9, 0x45a0db8 <_ChromeMain+0x459bb1c>
 45a0d74: 19404129     	ldapurb	w9, [x9, #0x4]
 45a0d78: 35000209     	cbnz	w9, 0x45a0db8 <_ChromeMain+0x459bb1c>
 45a0d7c: f9407509     	ldr	x9, [x8, #0xe8]
 45a0d80: b40001c9     	cbz	x9, 0x45a0db8 <_ChromeMain+0x459bb1c>
 45a0d84: f9407109     	ldr	x9, [x8, #0xe0]
 45a0d88: b4003129     	cbz	x9, 0x45a13ac <_ChromeMain+0x459c110>
 45a0d8c: 19404129     	ldapurb	w9, [x9, #0x4]
 45a0d90: 350030e9     	cbnz	w9, 0x45a13ac <_ChromeMain+0x459c110>
 45a0d94: f9407500     	ldr	x0, [x8, #0xe8]
 45a0d98: f9402414     	ldr	x20, [x0, #0x48]
 45a0d9c: b40000f4     	cbz	x20, 0x45a0db8 <_ChromeMain+0x459bb1c>
 45a0da0: 910103e1     	add	x1, sp, #0x40
 45a0da4: 97565f09     	bl	0x1b389c8 <_ChromeMain+0x1b3372c>
 45a0da8: a90607e0     	stp	x0, x1, [sp, #0x60]
 45a0dac: 910183e1     	add	x1, sp, #0x60
 45a0db0: aa1403e0     	mov	x0, x20
 45a0db4: 97565f40     	bl	0x1b38ab4 <_ChromeMain+0x1b33818>
 45a0db8: 52a7f008     	mov	w8, #0x3f800000         ; =1065353216
 45a0dbc: b900de68     	str	w8, [x19, #0xdc]
 45a0dc0: f9402a68     	ldr	x8, [x19, #0x50]
 45a0dc4: f9407109     	ldr	x9, [x8, #0xe0]
 45a0dc8: b4000ea9     	cbz	x9, 0x45a0f9c <_ChromeMain+0x459bd00>
 45a0dcc: 19404129     	ldapurb	w9, [x9, #0x4]
 45a0dd0: 35000e69     	cbnz	w9, 0x45a0f9c <_ChromeMain+0x459bd00>
 45a0dd4: f9407509     	ldr	x9, [x8, #0xe8]
 45a0dd8: b4000e29     	cbz	x9, 0x45a0f9c <_ChromeMain+0x459bd00>
 45a0ddc: f9407109     	ldr	x9, [x8, #0xe0]
 45a0de0: b4002ec9     	cbz	x9, 0x45a13b8 <_ChromeMain+0x459c11c>
 45a0de4: 19404129     	ldapurb	w9, [x9, #0x4]
 45a0de8: 35002e89     	cbnz	w9, 0x45a13b8 <_ChromeMain+0x459c11c>
 45a0dec: f9407508     	ldr	x8, [x8, #0xe8]
 45a0df0: f9402508     	ldr	x8, [x8, #0x48]
 45a0df4: b4000d48     	cbz	x8, 0x45a0f9c <_ChromeMain+0x459bd00>
 45a0df8: f9408509     	ldr	x9, [x8, #0x108]
 45a0dfc: 5280230a     	mov	w10, #0x118             ; =280
 45a0e00: 5280280b     	mov	w11, #0x140             ; =320
 45a0e04: f100013f     	cmp	x9, #0x0
 45a0e08: 9a8a0169     	csel	x9, x11, x10, eq
 45a0e0c: f8696900     	ldr	x0, [x8, x9]
 45a0e10: b4000c60     	cbz	x0, 0x45a0f9c <_ChromeMain+0x459bd00>
 45a0e14: f9400008     	ldr	x8, [x0]
 45a0e18: f9407908     	ldr	x8, [x8, #0xf0]
 45a0e1c: 1e2e1000     	fmov	s0, #1.00000000
 45a0e20: d63f0100     	blr	x8
 45a0e24: 1400005e     	b	0x45a0f9c <_ChromeMain+0x459bd00>
 45a0e28: d360fec8     	lsr	x8, x22, #32
 45a0e2c: d360fea9     	lsr	x9, x21, #32
 45a0e30: 1e2202a0     	scvtf	s0, w21
 45a0e34: 0b557eaa     	add	w10, w21, w21, lsr #31
 45a0e38: 1e230121     	ucvtf	s1, w9
 45a0e3c: 0b490508     	add	w8, w8, w9, lsr #1
 45a0e40: 0b8a06c9     	add	w9, w22, w10, asr #1
 45a0e44: 1e270122     	fmov	s2, w9
 45a0e48: 6e0c0420     	mov.s	v0[1], v1[0]
 45a0e4c: 529851e9     	mov	w9, #0xc28f             ; =49807
 45a0e50: 72a7eea9     	movk	w9, #0x3f75, lsl #16
 45a0e54: 0e040d21     	dup.2s	v1, w9
 45a0e58: 2e21dc00     	fmul.2s	v0, v0, v1
 45a0e5c: 0ea1b800     	fcvtzs.2s	v0, v0
 45a0e60: 0f000421     	movi.2s	v1, #0x1
 45a0e64: 0ea16400     	smax.2s	v0, v0, v1
 45a0e68: 2f3f0401     	ushr.2s	v1, v0, #0x1
 45a0e6c: 4e0c1d02     	mov.s	v2[1], w8
 45a0e70: 2ea18441     	sub.2s	v1, v2, v1
 45a0e74: 0ea00c20     	sqadd.2s	v0, v1, v0
 45a0e78: 0ea12c00     	sqsub.2s	v0, v0, v1
 45a0e7c: 0e0c3c08     	mov.s	w8, v0[1]
 45a0e80: 1e260009     	fmov	w9, s0
 45a0e84: 0aa97d29     	bic	w9, w9, w9, asr #31
 45a0e88: 0aa87d08     	bic	w8, w8, w8, asr #31
 45a0e8c: aa088128     	orr	x8, x9, x8, lsl #32
 45a0e90: aa1303e1     	mov	x1, x19
 45a0e94: fc0b4c21     	str	d1, [x1, #0xb4]!
 45a0e98: f9000428     	str	x8, [x1, #0x8]
 45a0e9c: 3dc013e0     	ldr	q0, [sp, #0x40]
 45a0ea0: 3d800420     	str	q0, [x1, #0x10]
 45a0ea4: f004cd68     	adrp	x8, 0xdf4f000 <dyld_stub_binder+0xdf4f000>
 45a0ea8: fd434d00     	ldr	d0, [x8, #0x698]
 45a0eac: fd001020     	str	d0, [x1, #0x20]
 45a0eb0: 529ae148     	mov	w8, #0xd70a             ; =55050
 45a0eb4: 72a78468     	movk	w8, #0x3c23, lsl #16
 45a0eb8: b9002828     	str	w8, [x1, #0x28]
 45a0ebc: 52800028     	mov	w8, #0x1                ; =1
 45a0ec0: b81fc028     	stur	w8, [x1, #-0x4]
 45a0ec4: f859c028     	ldur	x8, [x1, #-0x64]
 45a0ec8: f9407109     	ldr	x9, [x8, #0xe0]
 45a0ecc: b4000229     	cbz	x9, 0x45a0f10 <_ChromeMain+0x459bc74>
 45a0ed0: 19404129     	ldapurb	w9, [x9, #0x4]
 45a0ed4: 350001e9     	cbnz	w9, 0x45a0f10 <_ChromeMain+0x459bc74>
 45a0ed8: f9407509     	ldr	x9, [x8, #0xe8]
 45a0edc: b40001a9     	cbz	x9, 0x45a0f10 <_ChromeMain+0x459bc74>
 45a0ee0: f9407109     	ldr	x9, [x8, #0xe0]
 45a0ee4: b4002709     	cbz	x9, 0x45a13c4 <_ChromeMain+0x459c128>
 45a0ee8: 19404129     	ldapurb	w9, [x9, #0x4]
 45a0eec: 350026c9     	cbnz	w9, 0x45a13c4 <_ChromeMain+0x459c128>
 45a0ef0: f9407500     	ldr	x0, [x8, #0xe8]
 45a0ef4: f9402414     	ldr	x20, [x0, #0x48]
 45a0ef8: b40000d4     	cbz	x20, 0x45a0f10 <_ChromeMain+0x459bc74>
 45a0efc: 97565eb3     	bl	0x1b389c8 <_ChromeMain+0x1b3372c>
 45a0f00: a90607e0     	stp	x0, x1, [sp, #0x60]
 45a0f04: 910183e1     	add	x1, sp, #0x60
 45a0f08: aa1403e0     	mov	x0, x20
 45a0f0c: 97565eea     	bl	0x1b38ab4 <_ChromeMain+0x1b33818>
 45a0f10: f9402a68     	ldr	x8, [x19, #0x50]
 45a0f14: f9407109     	ldr	x9, [x8, #0xe0]
 45a0f18: b40002e9     	cbz	x9, 0x45a0f74 <_ChromeMain+0x459bcd8>
 45a0f1c: bd40d660     	ldr	s0, [x19, #0xd4]
 45a0f20: 19404129     	ldapurb	w9, [x9, #0x4]
 45a0f24: 35000289     	cbnz	w9, 0x45a0f74 <_ChromeMain+0x459bcd8>
 45a0f28: f9407509     	ldr	x9, [x8, #0xe8]
 45a0f2c: b4000249     	cbz	x9, 0x45a0f74 <_ChromeMain+0x459bcd8>
 45a0f30: f9407109     	ldr	x9, [x8, #0xe0]
 45a0f34: b40024e9     	cbz	x9, 0x45a13d0 <_ChromeMain+0x459c134>
 45a0f38: 19404129     	ldapurb	w9, [x9, #0x4]
 45a0f3c: 350024a9     	cbnz	w9, 0x45a13d0 <_ChromeMain+0x459c134>
 45a0f40: f9407508     	ldr	x8, [x8, #0xe8]
 45a0f44: f9402508     	ldr	x8, [x8, #0x48]
 45a0f48: b4000168     	cbz	x8, 0x45a0f74 <_ChromeMain+0x459bcd8>
 45a0f4c: f9408509     	ldr	x9, [x8, #0x108]
 45a0f50: 5280230a     	mov	w10, #0x118             ; =280
 45a0f54: 5280280b     	mov	w11, #0x140             ; =320
 45a0f58: f100013f     	cmp	x9, #0x0
 45a0f5c: 9a8a0169     	csel	x9, x11, x10, eq
 45a0f60: f8696900     	ldr	x0, [x8, x9]
 45a0f64: b4000080     	cbz	x0, 0x45a0f74 <_ChromeMain+0x459bcd8>
 45a0f68: f9400008     	ldr	x8, [x0]
 45a0f6c: f9407908     	ldr	x8, [x8, #0xf0]
 45a0f70: d63f0100     	blr	x8
 45a0f74: f9403a68     	ldr	x8, [x19, #0x70]
 45a0f78: 529a9809     	mov	w9, #0xd4c0             ; =54464
 45a0f7c: 72a00029     	movk	w9, #0x1, lsl #16
 45a0f80: eb09011f     	cmp	x8, x9
 45a0f84: 9a89c108     	csel	x8, x8, x9, gt
 45a0f88: f9004e68     	str	x8, [x19, #0x98]
 45a0f8c: 3941e268     	ldrb	w8, [x19, #0x78]
 45a0f90: 35001b28     	cbnz	w8, 0x45a12f4 <_ChromeMain+0x459c058>
 45a0f94: 9101a260     	add	x0, x19, #0x68
 45a0f98: 9777f6d7     	bl	0x239eaf4 <_ChromeMain+0x2399858>
 45a0f9c: f9402a60     	ldr	x0, [x19, #0x50]
 45a0fa0: 95850711     	bl	0xa6e2be4 <_ChromeMain+0xa6dd948>
 45a0fa4: f9402a60     	ldr	x0, [x19, #0x50]
 45a0fa8: 95850740     	bl	0xa6e2ca8 <_ChromeMain+0xa6dda0c>
 45a0fac: f9402268     	ldr	x8, [x19, #0x40]
 45a0fb0: f941a114     	ldr	x20, [x8, #0x340]
 45a0fb4: b40005f4     	cbz	x20, 0x45a1070 <_ChromeMain+0x459bdd4>
 45a0fb8: 910183f5     	add	x21, sp, #0x60
 45a0fbc: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 45a0fc0: b80773ff     	stur	wzr, [sp, #0x77]
 45a0fc4: f9003bff     	str	xzr, [sp, #0x70]
 45a0fc8: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 45a0fcc: ad0403e0     	stp	q0, q0, [sp, #0x80]
 45a0fd0: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 45a0fd4: 790183ff     	strh	wzr, [sp, #0xc0]
 45a0fd8: a90cffff     	stp	xzr, xzr, [sp, #0xc8]
 45a0fdc: 9004a840     	adrp	x0, 0xdaa8000 <dyld_stub_binder+0xdaa8000>
 45a0fe0: 91330400     	add	x0, x0, #0xcc1
 45a0fe4: b004c941     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a0fe8: 911de021     	add	x1, x1, #0x778
 45a0fec: 910103e8     	add	x8, sp, #0x40
 45a0ff0: 52804462     	mov	w2, #0x223              ; =547
 45a0ff4: 96eabf23     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 45a0ff8: 910183e1     	add	x1, sp, #0x60
 45a0ffc: 910103e2     	add	x2, sp, #0x40
 45a1000: aa1403e0     	mov	x0, x20
 45a1004: 9792fd40     	bl	0x2a60504 <_ChromeMain+0x2a5b268>
 45a1008: aa0003f4     	mov	x20, x0
 45a100c: 9101c2a0     	add	x0, x21, #0x70
 45a1010: d2800001     	mov	x1, #0x0                ; =0
 45a1014: 96ea1b29     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a1018: 910082a0     	add	x0, x21, #0x20
 45a101c: 96ea1b17     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a1020: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 45a1024: 36f800a8     	tbz	w8, #0x1f, 0x45a1038 <_ChromeMain+0x459bd9c>
 45a1028: f94033e0     	ldr	x0, [sp, #0x60]
 45a102c: f9403be8     	ldr	x8, [sp, #0x70]
 45a1030: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a1034: 96e99fa1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a1038: b40001d4     	cbz	x20, 0x45a1070 <_ChromeMain+0x459bdd4>
 45a103c: 528004a8     	mov	w8, #0x25               ; =37
 45a1040: f90023e8     	str	x8, [sp, #0x40]
 45a1044: 90054b55     	adrp	x21, 0xef09000 <dyld_stub_binder+0xef09000>
 45a1048: 395636a0     	ldrb	w0, [x21, #0x58d]
 45a104c: 35002040     	cbnz	w0, 0x45a1454 <_ChromeMain+0x459c1b8>
 45a1050: aa1403e0     	mov	x0, x20
 45a1054: 52800041     	mov	w1, #0x2                ; =2
 45a1058: 52800022     	mov	w2, #0x1                ; =1
 45a105c: 977fe6cc     	bl	0x259ab8c <_ChromeMain+0x25958f0>
 45a1060: 528004a8     	mov	w8, #0x25               ; =37
 45a1064: f90023e8     	str	x8, [sp, #0x40]
 45a1068: 395636a0     	ldrb	w0, [x21, #0x58d]
 45a106c: 35001e80     	cbnz	w0, 0x45a143c <_ChromeMain+0x459c1a0>
 45a1070: f9402274     	ldr	x20, [x19, #0x40]
 45a1074: b4000514     	cbz	x20, 0x45a1114 <_ChromeMain+0x459be78>
 45a1078: f941a280     	ldr	x0, [x20, #0x340]
 45a107c: b40004c0     	cbz	x0, 0x45a1114 <_ChromeMain+0x459be78>
 45a1080: f9400008     	ldr	x8, [x0]
 45a1084: f9411108     	ldr	x8, [x8, #0x220]
 45a1088: d63f0100     	blr	x8
 45a108c: f941a294     	ldr	x20, [x20, #0x340]
 45a1090: 910183f5     	add	x21, sp, #0x60
 45a1094: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 45a1098: b80773ff     	stur	wzr, [sp, #0x77]
 45a109c: f9003bff     	str	xzr, [sp, #0x70]
 45a10a0: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 45a10a4: ad0403e0     	stp	q0, q0, [sp, #0x80]
 45a10a8: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 45a10ac: 790183ff     	strh	wzr, [sp, #0xc0]
 45a10b0: a90cffff     	stp	xzr, xzr, [sp, #0xc8]
 45a10b4: 9004c940     	adrp	x0, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a10b8: 911edc00     	add	x0, x0, #0x7b7
 45a10bc: 9004c941     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a10c0: 911de021     	add	x1, x1, #0x778
 45a10c4: 910103e8     	add	x8, sp, #0x40
 45a10c8: 528048e2     	mov	w2, #0x247              ; =583
 45a10cc: 96eabeed     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 45a10d0: 910183e1     	add	x1, sp, #0x60
 45a10d4: 910103e2     	add	x2, sp, #0x40
 45a10d8: aa1403e0     	mov	x0, x20
 45a10dc: 9792fd0a     	bl	0x2a60504 <_ChromeMain+0x2a5b268>
 45a10e0: aa0003f4     	mov	x20, x0
 45a10e4: 9101c2a0     	add	x0, x21, #0x70
 45a10e8: d2800001     	mov	x1, #0x0                ; =0
 45a10ec: 96ea1af3     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a10f0: 910082a0     	add	x0, x21, #0x20
 45a10f4: 96ea1ae1     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a10f8: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 45a10fc: 36f800a8     	tbz	w8, #0x1f, 0x45a1110 <_ChromeMain+0x459be74>
 45a1100: f94033e0     	ldr	x0, [sp, #0x60]
 45a1104: f9403be8     	ldr	x8, [sp, #0x70]
 45a1108: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a110c: 96e99f6b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a1110: b5000e14     	cbnz	x20, 0x45a12d0 <_ChromeMain+0x459c034>
 45a1114: f9401e68     	ldr	x8, [x19, #0x38]
 45a1118: f940f909     	ldr	x9, [x8, #0x1f0]
 45a111c: f9403129     	ldr	x9, [x9, #0x60]
 45a1120: eb18013f     	cmp	x9, x24
 45a1124: 54000c81     	b.ne	0x45a12b4 <_ChromeMain+0x459c018>
 45a1128: f941b900     	ldr	x0, [x8, #0x370]
 45a112c: f9407008     	ldr	x8, [x0, #0xe0]
 45a1130: b4000d68     	cbz	x8, 0x45a12dc <_ChromeMain+0x459c040>
 45a1134: 19404108     	ldapurb	w8, [x8, #0x4]
 45a1138: 35000d28     	cbnz	w8, 0x45a12dc <_ChromeMain+0x459c040>
 45a113c: f9407408     	ldr	x8, [x0, #0xe8]
 45a1140: b4000ce8     	cbz	x8, 0x45a12dc <_ChromeMain+0x459c040>
 45a1144: f9407008     	ldr	x8, [x0, #0xe0]
 45a1148: b4001228     	cbz	x8, 0x45a138c <_ChromeMain+0x459c0f0>
 45a114c: 19404108     	ldapurb	w8, [x8, #0x4]
 45a1150: 350011e8     	cbnz	w8, 0x45a138c <_ChromeMain+0x459c0f0>
 45a1154: f9407408     	ldr	x8, [x0, #0xe8]
 45a1158: f9402508     	ldr	x8, [x8, #0x48]
 45a115c: b4001588     	cbz	x8, 0x45a140c <_ChromeMain+0x459c170>
 45a1160: f940a514     	ldr	x20, [x8, #0x148]
 45a1164: aa1403e0     	mov	x0, x20
 45a1168: 94e98980     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 45a116c: 94e9897f     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 45a1170: 94e9897e     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 45a1174: 52800100     	mov	w0, #0x8                ; =8
 45a1178: 96e9b87c     	bl	0xf368 <_ChromeMain+0xa0cc>
 45a117c: aa0003f5     	mov	x21, x0
 45a1180: f900001f     	str	xzr, [x0]
 45a1184: aa1403e1     	mov	x1, x20
 45a1188: 95032bde     	bl	0x866c100 <_ChromeMain+0x8666e64>
 45a118c: aa1403e0     	mov	x0, x20
 45a1190: 94e98973     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 45a1194: aa1403e0     	mov	x0, x20
 45a1198: 94e98971     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 45a119c: aa1403e0     	mov	x0, x20
 45a11a0: 94e9896f     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 45a11a4: a90153f5     	stp	x21, x20, [sp, #0x10]
 45a11a8: 52800400     	mov	w0, #0x20               ; =32
 45a11ac: 96e9b86f     	bl	0xf368 <_ChromeMain+0xa0cc>
 45a11b0: b4000cc0     	cbz	x0, 0x45a1348 <_ChromeMain+0x459c0ac>
 45a11b4: 52800028     	mov	w8, #0x1                ; =1
 45a11b8: b9001c08     	str	w8, [x0, #0x1c]
 45a11bc: 910183e9     	add	x9, sp, #0x60
 45a11c0: 91002129     	add	x9, x9, #0x8
 45a11c4: a9007c1f     	stp	xzr, xzr, [x0]
 45a11c8: f9000809     	str	x9, [x0, #0x10]
 45a11cc: a90603e0     	stp	x0, x0, [sp, #0x60]
 45a11d0: 39006008     	strb	w8, [x0, #0x18]
 45a11d4: f9003be8     	str	x8, [sp, #0x70]
 45a11d8: aa0003e8     	mov	x8, x0
 45a11dc: f9400400     	ldr	x0, [x0, #0x8]
 45a11e0: b5ffffc0     	cbnz	x0, 0x45a11d8 <_ChromeMain+0x459bf3c>
 45a11e4: f90013e8     	str	x8, [sp, #0x20]
 45a11e8: 910183f4     	add	x20, sp, #0x60
 45a11ec: 910083e8     	add	x8, sp, #0x20
 45a11f0: a90423f4     	stp	x20, x8, [sp, #0x40]
 45a11f4: d0048a01     	adrp	x1, 0xd6e3000 <dyld_stub_binder+0xd6e3000>
 45a11f8: 9138d021     	add	x1, x1, #0xe34
 45a11fc: 910103e0     	add	x0, sp, #0x40
 45a1200: aa0103e2     	mov	x2, x1
 45a1204: 97926c2f     	bl	0x2a3c2c0 <_ChromeMain+0x2a37024>
 45a1208: 9100a260     	add	x0, x19, #0x28
 45a120c: 910043e1     	add	x1, sp, #0x10
 45a1210: 910183e2     	add	x2, sp, #0x60
 45a1214: 95855f47     	bl	0xa6f8f30 <_ChromeMain+0xa6f3c94>
 45a1218: aa0003e8     	mov	x8, x0
 45a121c: f9402e60     	ldr	x0, [x19, #0x58]
 45a1220: f9002e68     	str	x8, [x19, #0x58]
 45a1224: b4000080     	cbz	x0, 0x45a1234 <_ChromeMain+0x459bf98>
 45a1228: f9400008     	ldr	x8, [x0]
 45a122c: f9400508     	ldr	x8, [x8, #0x8]
 45a1230: d63f0100     	blr	x8
 45a1234: f94037e1     	ldr	x1, [sp, #0x68]
 45a1238: f90023f4     	str	x20, [sp, #0x40]
 45a123c: 910103e0     	add	x0, sp, #0x40
 45a1240: 97074c40     	bl	0x774340 <_ChromeMain+0x76f0a4>
 45a1244: f9400bf4     	ldr	x20, [sp, #0x10]
 45a1248: f9000bff     	str	xzr, [sp, #0x10]
 45a124c: b40000d4     	cbz	x20, 0x45a1264 <_ChromeMain+0x459bfc8>
 45a1250: aa1403e0     	mov	x0, x20
 45a1254: 95032bb1     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 45a1258: aa1403e0     	mov	x0, x20
 45a125c: 52800101     	mov	w1, #0x8                ; =8
 45a1260: 96e99f16     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a1264: f9403268     	ldr	x8, [x19, #0x60]
 45a1268: b5000228     	cbnz	x8, 0x45a12ac <_ChromeMain+0x459c010>
 45a126c: 52800800     	mov	w0, #0x40               ; =64
 45a1270: 96e9b83e     	bl	0xf368 <_ChromeMain+0xa0cc>
 45a1274: 91002268     	add	x8, x19, #0x8
 45a1278: f100027f     	cmp	x19, #0x0
 45a127c: 9a8803e1     	csel	x1, xzr, x8, eq
 45a1280: aa1303e2     	mov	x2, x19
 45a1284: 9796f217     	bl	0x2b5dae0 <_ChromeMain+0x2b58844>
 45a1288: f9403274     	ldr	x20, [x19, #0x60]
 45a128c: f9003260     	str	x0, [x19, #0x60]
 45a1290: b40000d4     	cbz	x20, 0x45a12a8 <_ChromeMain+0x459c00c>
 45a1294: aa1403e0     	mov	x0, x20
 45a1298: 977cb750     	bl	0x24cefd8 <_ChromeMain+0x24c9d3c>
 45a129c: 52800801     	mov	w1, #0x40               ; =64
 45a12a0: 96e99f06     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a12a4: f9403260     	ldr	x0, [x19, #0x60]
 45a12a8: 9796f245     	bl	0x2b5dbbc <_ChromeMain+0x2b58920>
 45a12ac: 52800020     	mov	w0, #0x1                ; =1
 45a12b0: 17fffc1f     	b	0x45a032c <_ChromeMain+0x459b090>
 45a12b4: f0fe046a     	adrp	x10, 0x630000 <_ChromeMain+0x62ad64>
 45a12b8: 9120c14a     	add	x10, x10, #0x830
 45a12bc: eb0a013f     	cmp	x9, x10
 45a12c0: 54fff340     	b.eq	0x45a1128 <_ChromeMain+0x459be8c>
 45a12c4: 9107c100     	add	x0, x8, #0x1f0
 45a12c8: d63f0120     	blr	x9
 45a12cc: 17ffff98     	b	0x45a112c <_ChromeMain+0x459be90>
 45a12d0: aa1403e0     	mov	x0, x20
 45a12d4: 948e7ebb     	bl	0x6940dc0 <_ChromeMain+0x693bb24>
 45a12d8: 17ffff8f     	b	0x45a1114 <_ChromeMain+0x459be78>
 45a12dc: 52800100     	mov	w0, #0x8                ; =8
 45a12e0: 96e9b822     	bl	0xf368 <_ChromeMain+0xa0cc>
 45a12e4: aa0003f5     	mov	x21, x0
 45a12e8: d2800014     	mov	x20, #0x0               ; =0
 45a12ec: f900001f     	str	xzr, [x0]
 45a12f0: 17ffffad     	b	0x45a11a4 <_ChromeMain+0x459bf08>
 45a12f4: f9404668     	ldr	x8, [x19, #0x88]
 45a12f8: f9400501     	ldr	x1, [x8, #0x8]
 45a12fc: f9403668     	ldr	x8, [x19, #0x68]
 45a1300: f9400108     	ldr	x8, [x8]
 45a1304: 9101a260     	add	x0, x19, #0x68
 45a1308: d63f0100     	blr	x8
 45a130c: 17ffff22     	b	0x45a0f94 <_ChromeMain+0x459bcf8>
 45a1310: 910262a0     	add	x0, x21, #0x98
 45a1314: aa1603e1     	mov	x1, x22
 45a1318: 528003c2     	mov	w2, #0x1e               ; =30
 45a131c: 96fc1e39     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 45a1320: 17fffe22     	b	0x45a0ba8 <_ChromeMain+0x459b90c>
 45a1324: 978e7460     	bl	0x293e4a4 <_ChromeMain+0x2939208>
 45a1328: 394ca688     	ldrb	w8, [x20, #0x329]
 45a132c: 3707d188     	tbnz	w8, #0x0, 0x45a0d5c <_ChromeMain+0x459bac0>
 45a1330: 94197bfb     	bl	0x4c0031c <_ChromeMain+0x4bfb080>
 45a1334: d4200000     	brk	#0
 45a1338: d4400000     	hlt	#0
 45a133c: d4200020     	brk	#0x1
 45a1340: d4200000     	brk	#0
 45a1344: d4400000     	hlt	#0
 45a1348: d4200020     	brk	#0x1
 45a134c: 97f4c8eb     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a1350: 17fffc82     	b	0x45a0558 <_ChromeMain+0x459b2bc>
 45a1354: 97f4c8e9     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a1358: 17fffcc8     	b	0x45a0678 <_ChromeMain+0x459b3dc>
 45a135c: d4200000     	brk	#0
 45a1360: d4400000     	hlt	#0
 45a1364: d4200020     	brk	#0x1
 45a1368: d4200000     	brk	#0
 45a136c: d4400000     	hlt	#0
 45a1370: d4200020     	brk	#0x1
 45a1374: d4200000     	brk	#0
 45a1378: d4400000     	hlt	#0
 45a137c: d4200020     	brk	#0x1
 45a1380: d4200000     	brk	#0
 45a1384: d4400000     	hlt	#0
 45a1388: d4200020     	brk	#0x1
 45a138c: d4200000     	brk	#0
 45a1390: d4400000     	hlt	#0
 45a1394: d4200020     	brk	#0x1
 45a1398: 910183e0     	add	x0, sp, #0x60
 45a139c: 910183e1     	add	x1, sp, #0x60
 45a13a0: 910103e2     	add	x2, sp, #0x40
 45a13a4: 958309a5     	bl	0xa663a38 <_ChromeMain+0xa65e79c>
 45a13a8: 17fffdbe     	b	0x45a0aa0 <_ChromeMain+0x459b804>
 45a13ac: d4200000     	brk	#0
 45a13b0: d4400000     	hlt	#0
 45a13b4: d4200020     	brk	#0x1
 45a13b8: d4200000     	brk	#0
 45a13bc: d4400000     	hlt	#0
 45a13c0: d4200020     	brk	#0x1
 45a13c4: d4200000     	brk	#0
 45a13c8: d4400000     	hlt	#0
 45a13cc: d4200020     	brk	#0x1
 45a13d0: d4200000     	brk	#0
 45a13d4: d4400000     	hlt	#0
 45a13d8: d4200020     	brk	#0x1
 45a13dc: d4200000     	brk	#0
 45a13e0: d4400000     	hlt	#0
 45a13e4: d4200020     	brk	#0x1
 45a13e8: d4200000     	brk	#0
 45a13ec: d4400000     	hlt	#0
 45a13f0: d4200020     	brk	#0x1
 45a13f4: d4200000     	brk	#0
 45a13f8: d4400000     	hlt	#0
 45a13fc: d4200020     	brk	#0x1
 45a1400: d4200000     	brk	#0
 45a1404: d4400000     	hlt	#0
 45a1408: d4200020     	brk	#0x1
 45a140c: d2800000     	mov	x0, #0x0                ; =0
 45a1410: 94e988d6     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 45a1414: d2800000     	mov	x0, #0x0                ; =0
 45a1418: 94e988d4     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 45a141c: 52800100     	mov	w0, #0x8                ; =8
 45a1420: 96e9b7d2     	bl	0xf368 <_ChromeMain+0xa0cc>
 45a1424: aa0003f5     	mov	x21, x0
 45a1428: f900001f     	str	xzr, [x0]
 45a142c: d2800001     	mov	x1, #0x0                ; =0
 45a1430: 95032b34     	bl	0x866c100 <_ChromeMain+0x8666e64>
 45a1434: d2800014     	mov	x20, #0x0               ; =0
 45a1438: 17ffff57     	b	0x45a1194 <_ChromeMain+0x459bef8>
 45a143c: f90033ff     	str	xzr, [sp, #0x60]
 45a1440: 910103e1     	add	x1, sp, #0x40
 45a1444: 910183e2     	add	x2, sp, #0x60
 45a1448: 52800043     	mov	w3, #0x2                ; =2
 45a144c: 96f34a0f     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 45a1450: 17ffff08     	b	0x45a1070 <_ChromeMain+0x459bdd4>
 45a1454: b004a048     	adrp	x8, 0xd9aa000 <dyld_stub_binder+0xd9aa000>
 45a1458: 9109fd08     	add	x8, x8, #0x27f
 45a145c: f90033e8     	str	x8, [sp, #0x60]
 45a1460: 910103e1     	add	x1, sp, #0x40
 45a1464: 910183e2     	add	x2, sp, #0x60
 45a1468: 52800023     	mov	w3, #0x1                ; =1
 45a146c: 96f34a07     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 45a1470: 17fffef8     	b	0x45a1050 <_ChromeMain+0x459bdb4>
 45a1474: d10343ff     	sub	sp, sp, #0xd0
 45a1478: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 45a147c: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 45a1480: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 45a1484: 910303fd     	add	x29, sp, #0xc0
 45a1488: 39438808     	ldrb	w8, [x0, #0xe2]
 45a148c: 340018e8     	cbz	w8, 0x45a17a8 <_ChromeMain+0x459c50c>
 45a1490: aa0003f3     	mov	x19, x0
 45a1494: 3903881f     	strb	wzr, [x0, #0xe2]
 45a1498: f9402c00     	ldr	x0, [x0, #0x58]
 45a149c: f9002e7f     	str	xzr, [x19, #0x58]
 45a14a0: b4000080     	cbz	x0, 0x45a14b0 <_ChromeMain+0x459c214>
 45a14a4: f9400008     	ldr	x8, [x0]
 45a14a8: f9400508     	ldr	x8, [x8, #0x8]
 45a14ac: d63f0100     	blr	x8
 45a14b0: f9403260     	ldr	x0, [x19, #0x60]
 45a14b4: f900327f     	str	xzr, [x19, #0x60]
 45a14b8: b4000080     	cbz	x0, 0x45a14c8 <_ChromeMain+0x459c22c>
 45a14bc: 977cb6c7     	bl	0x24cefd8 <_ChromeMain+0x24c9d3c>
 45a14c0: 52800801     	mov	w1, #0x40               ; =64
 45a14c4: 96e99e7d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a14c8: f9402268     	ldr	x8, [x19, #0x40]
 45a14cc: b4000668     	cbz	x8, 0x45a1598 <_ChromeMain+0x459c2fc>
 45a14d0: f941a114     	ldr	x20, [x8, #0x340]
 45a14d4: b4000634     	cbz	x20, 0x45a1598 <_ChromeMain+0x459c2fc>
 45a14d8: 9100a3f5     	add	x21, sp, #0x28
 45a14dc: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 45a14e0: b803f3ff     	stur	wzr, [sp, #0x3f]
 45a14e4: f9001fff     	str	xzr, [sp, #0x38]
 45a14e8: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 45a14ec: 3c8483e0     	stur	q0, [sp, #0x48]
 45a14f0: 3c8583e0     	stur	q0, [sp, #0x58]
 45a14f4: 3c8683e0     	stur	q0, [sp, #0x68]
 45a14f8: 3c8783e0     	stur	q0, [sp, #0x78]
 45a14fc: 790113ff     	strh	wzr, [sp, #0x88]
 45a1500: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 45a1504: f004a820     	adrp	x0, 0xdaa8000 <dyld_stub_binder+0xdaa8000>
 45a1508: 91330400     	add	x0, x0, #0xcc1
 45a150c: 9004c941     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a1510: 911de021     	add	x1, x1, #0x778
 45a1514: 910023e8     	add	x8, sp, #0x8
 45a1518: 52804462     	mov	w2, #0x223              ; =547
 45a151c: 96eabdd9     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 45a1520: 9100a3e1     	add	x1, sp, #0x28
 45a1524: 910023e2     	add	x2, sp, #0x8
 45a1528: aa1403e0     	mov	x0, x20
 45a152c: 9792fbf6     	bl	0x2a60504 <_ChromeMain+0x2a5b268>
 45a1530: aa0003f4     	mov	x20, x0
 45a1534: 9101c2a0     	add	x0, x21, #0x70
 45a1538: d2800001     	mov	x1, #0x0                ; =0
 45a153c: 96ea19df     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a1540: 910082a0     	add	x0, x21, #0x20
 45a1544: 96ea19cd     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a1548: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 45a154c: 36f800a8     	tbz	w8, #0x1f, 0x45a1560 <_ChromeMain+0x459c2c4>
 45a1550: f94017e0     	ldr	x0, [sp, #0x28]
 45a1554: f9401fe8     	ldr	x8, [sp, #0x38]
 45a1558: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a155c: 96e99e57     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a1560: b40001d4     	cbz	x20, 0x45a1598 <_ChromeMain+0x459c2fc>
 45a1564: 528004a8     	mov	w8, #0x25               ; =37
 45a1568: f90007e8     	str	x8, [sp, #0x8]
 45a156c: 90054b55     	adrp	x21, 0xef09000 <dyld_stub_binder+0xef09000>
 45a1570: 395636a0     	ldrb	w0, [x21, #0x58d]
 45a1574: 350015c0     	cbnz	w0, 0x45a182c <_ChromeMain+0x459c590>
 45a1578: aa1403e0     	mov	x0, x20
 45a157c: 52800001     	mov	w1, #0x0                ; =0
 45a1580: 52800022     	mov	w2, #0x1                ; =1
 45a1584: 977fe582     	bl	0x259ab8c <_ChromeMain+0x25958f0>
 45a1588: 528004a8     	mov	w8, #0x25               ; =37
 45a158c: f90007e8     	str	x8, [sp, #0x8]
 45a1590: 395636a0     	ldrb	w0, [x21, #0x58d]
 45a1594: 35001400     	cbnz	w0, 0x45a1814 <_ChromeMain+0x459c578>
 45a1598: f9402a68     	ldr	x8, [x19, #0x50]
 45a159c: b4001068     	cbz	x8, 0x45a17a8 <_ChromeMain+0x459c50c>
 45a15a0: 3941e268     	ldrb	w8, [x19, #0x78]
 45a15a4: 34000068     	cbz	w8, 0x45a15b0 <_ChromeMain+0x459c314>
 45a15a8: 9101a260     	add	x0, x19, #0x68
 45a15ac: 976da032     	bl	0x2109674 <_ChromeMain+0x21043d8>
 45a15b0: b900b27f     	str	wzr, [x19, #0xb0]
 45a15b4: f0054b28     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 45a15b8: f9401914     	ldr	x20, [x8, #0x30]
 45a15bc: b0046421     	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 45a15c0: 910a4c21     	add	x1, x1, #0x293
 45a15c4: aa1403e0     	mov	x0, x20
 45a15c8: 96f14fed     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 45a15cc: 35001120     	cbnz	w0, 0x45a17f0 <_ChromeMain+0x459c554>
 45a15d0: b0046421     	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 45a15d4: 910ac021     	add	x1, x1, #0x2b0
 45a15d8: aa1403e0     	mov	x0, x20
 45a15dc: 96f14fe8     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 45a15e0: 35001040     	cbnz	w0, 0x45a17e8 <_ChromeMain+0x459c54c>
 45a15e4: f0054b74     	adrp	x20, 0xef10000 <dyld_stub_binder+0xef10000>
 45a15e8: 394ca688     	ldrb	w8, [x20, #0x329]
 45a15ec: 36000f68     	tbz	w8, #0x0, 0x45a17d8 <_ChromeMain+0x459c53c>
 45a15f0: f0054b68     	adrp	x8, 0xef10000 <dyld_stub_binder+0xef10000>
 45a15f4: 394ca108     	ldrb	w8, [x8, #0x328]
 45a15f8: f9402a74     	ldr	x20, [x19, #0x50]
 45a15fc: 34000788     	cbz	w8, 0x45a16ec <_ChromeMain+0x459c450>
 45a1600: b4000d54     	cbz	x20, 0x45a17a8 <_ChromeMain+0x459c50c>
 45a1604: 39438a68     	ldrb	w8, [x19, #0xe2]
 45a1608: 37000d08     	tbnz	w8, #0x0, 0x45a17a8 <_ChromeMain+0x459c50c>
 45a160c: f9407288     	ldr	x8, [x20, #0xe0]
 45a1610: b40002a8     	cbz	x8, 0x45a1664 <_ChromeMain+0x459c3c8>
 45a1614: 19404108     	ldapurb	w8, [x8, #0x4]
 45a1618: 35000268     	cbnz	w8, 0x45a1664 <_ChromeMain+0x459c3c8>
 45a161c: f9407688     	ldr	x8, [x20, #0xe8]
 45a1620: b4000228     	cbz	x8, 0x45a1664 <_ChromeMain+0x459c3c8>
 45a1624: f9407288     	ldr	x8, [x20, #0xe0]
 45a1628: b4000ea8     	cbz	x8, 0x45a17fc <_ChromeMain+0x459c560>
 45a162c: 19404108     	ldapurb	w8, [x8, #0x4]
 45a1630: 35000e68     	cbnz	w8, 0x45a17fc <_ChromeMain+0x459c560>
 45a1634: f9407688     	ldr	x8, [x20, #0xe8]
 45a1638: f9402500     	ldr	x0, [x8, #0x48]
 45a163c: b4000060     	cbz	x0, 0x45a1648 <_ChromeMain+0x459c3ac>
 45a1640: 52800001     	mov	w1, #0x0                ; =0
 45a1644: 979683ee     	bl	0x2b425fc <_ChromeMain+0x2b3d360>
 45a1648: 9795573f     	bl	0x2af7344 <_ChromeMain+0x2af20a8>
 45a164c: f90017f4     	str	x20, [sp, #0x28]
 45a1650: b00309e1     	adrp	x1, 0xa6de000 <_ChromeMain+0xa6d8d64>
 45a1654: 91389021     	add	x1, x1, #0xe24
 45a1658: 9100a3e3     	add	x3, sp, #0x28
 45a165c: d2800002     	mov	x2, #0x0                ; =0
 45a1660: 9771e259     	bl	0x2219fc4 <_ChromeMain+0x2214d28>
 45a1664: 52a7f008     	mov	w8, #0x3f800000         ; =1065353216
 45a1668: b900de68     	str	w8, [x19, #0xdc]
 45a166c: f9402a68     	ldr	x8, [x19, #0x50]
 45a1670: f9407109     	ldr	x9, [x8, #0xe0]
 45a1674: b40002e9     	cbz	x9, 0x45a16d0 <_ChromeMain+0x459c434>
 45a1678: 19404129     	ldapurb	w9, [x9, #0x4]
 45a167c: 350002a9     	cbnz	w9, 0x45a16d0 <_ChromeMain+0x459c434>
 45a1680: f9407509     	ldr	x9, [x8, #0xe8]
 45a1684: b4000269     	cbz	x9, 0x45a16d0 <_ChromeMain+0x459c434>
 45a1688: f9407109     	ldr	x9, [x8, #0xe0]
 45a168c: b4000be9     	cbz	x9, 0x45a1808 <_ChromeMain+0x459c56c>
 45a1690: 19404129     	ldapurb	w9, [x9, #0x4]
 45a1694: 35000ba9     	cbnz	w9, 0x45a1808 <_ChromeMain+0x459c56c>
 45a1698: f9407508     	ldr	x8, [x8, #0xe8]
 45a169c: f9402508     	ldr	x8, [x8, #0x48]
 45a16a0: b4000188     	cbz	x8, 0x45a16d0 <_ChromeMain+0x459c434>
 45a16a4: f9408509     	ldr	x9, [x8, #0x108]
 45a16a8: 5280230a     	mov	w10, #0x118             ; =280
 45a16ac: 5280280b     	mov	w11, #0x140             ; =320
 45a16b0: f100013f     	cmp	x9, #0x0
 45a16b4: 9a8a0169     	csel	x9, x11, x10, eq
 45a16b8: f8696900     	ldr	x0, [x8, x9]
 45a16bc: b40000a0     	cbz	x0, 0x45a16d0 <_ChromeMain+0x459c434>
 45a16c0: f9400008     	ldr	x8, [x0]
 45a16c4: f9407908     	ldr	x8, [x8, #0xf0]
 45a16c8: 1e2e1000     	fmov	s0, #1.00000000
 45a16cc: d63f0100     	blr	x8
 45a16d0: 39438268     	ldrb	w8, [x19, #0xe0]
 45a16d4: 340006a8     	cbz	w8, 0x45a17a8 <_ChromeMain+0x459c50c>
 45a16d8: f9402260     	ldr	x0, [x19, #0x40]
 45a16dc: b4000660     	cbz	x0, 0x45a17a8 <_ChromeMain+0x459c50c>
 45a16e0: 3903827f     	strb	wzr, [x19, #0xe0]
 45a16e4: 94000208     	bl	0x45a1f04 <_ChromeMain+0x459cc68>
 45a16e8: 14000030     	b	0x45a17a8 <_ChromeMain+0x459c50c>
 45a16ec: aa1403e0     	mov	x0, x20
 45a16f0: 97f93e6c     	bl	0x43f10a0 <_ChromeMain+0x43ebe04>
 45a16f4: f80b4260     	stur	x0, [x19, #0xb4]
 45a16f8: f80bc261     	stur	x1, [x19, #0xbc]
 45a16fc: 4e080c00     	dup.2d	v0, x0
 45a1700: b004ccc8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 45a1704: 3dc01101     	ldr	q1, [x8, #0x40]
 45a1708: 6ee14400     	ushl.2d	v0, v0, v1
 45a170c: 0ea12800     	xtn.2s	v0, v0
 45a1710: 4e080c22     	dup.2d	v2, x1
 45a1714: 6ee14441     	ushl.2d	v1, v2, v1
 45a1718: 0ea12821     	xtn.2s	v1, v1
 45a171c: 0e21d822     	scvtf.2s	v2, v1
 45a1720: 2f211421     	usra.2s	v1, v1, #0x1f
 45a1724: 0f3f1420     	ssra.2s	v0, v1, #0x1
 45a1728: 529851e8     	mov	w8, #0xc28f             ; =49807
 45a172c: 72a7eea8     	movk	w8, #0x3f75, lsl #16
 45a1730: 0e040d01     	dup.2s	v1, w8
 45a1734: 2e21dc41     	fmul.2s	v1, v2, v1
 45a1738: 0ea1b821     	fcvtzs.2s	v1, v1
 45a173c: 0f000422     	movi.2s	v2, #0x1
 45a1740: 0ea26421     	smax.2s	v1, v1, v2
 45a1744: 2f3f0422     	ushr.2s	v2, v1, #0x1
 45a1748: 2ea28400     	sub.2s	v0, v0, v2
 45a174c: 0ea10c01     	sqadd.2s	v1, v0, v1
 45a1750: 0ea02c21     	sqsub.2s	v1, v1, v0
 45a1754: 0e0c3c28     	mov.s	w8, v1[1]
 45a1758: 1e260029     	fmov	w9, s1
 45a175c: 0aa97d29     	bic	w9, w9, w9, asr #31
 45a1760: 0aa87d08     	bic	w8, w8, w8, asr #31
 45a1764: aa088128     	orr	x8, x9, x8, lsl #32
 45a1768: fc0c4260     	stur	d0, [x19, #0xc4]
 45a176c: f80cc268     	stur	x8, [x19, #0xcc]
 45a1770: bd40de60     	ldr	s0, [x19, #0xdc]
 45a1774: fc0d4260     	stur	d0, [x19, #0xd4]
 45a1778: 52800048     	mov	w8, #0x2                ; =2
 45a177c: b900b268     	str	w8, [x19, #0xb0]
 45a1780: f9403a68     	ldr	x8, [x19, #0x70]
 45a1784: 528bf209     	mov	w9, #0x5f90             ; =24464
 45a1788: 72a00029     	movk	w9, #0x1, lsl #16
 45a178c: eb09011f     	cmp	x8, x9
 45a1790: 9a89c108     	csel	x8, x8, x9, gt
 45a1794: f9004e68     	str	x8, [x19, #0x98]
 45a1798: 3941e268     	ldrb	w8, [x19, #0x78]
 45a179c: 35000108     	cbnz	w8, 0x45a17bc <_ChromeMain+0x459c520>
 45a17a0: 9101a260     	add	x0, x19, #0x68
 45a17a4: 9777f4d4     	bl	0x239eaf4 <_ChromeMain+0x2399858>
 45a17a8: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 45a17ac: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 45a17b0: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 45a17b4: 910343ff     	add	sp, sp, #0xd0
 45a17b8: d65f03c0     	ret
 45a17bc: f9404668     	ldr	x8, [x19, #0x88]
 45a17c0: f9400501     	ldr	x1, [x8, #0x8]
 45a17c4: f9403668     	ldr	x8, [x19, #0x68]
 45a17c8: f9400108     	ldr	x8, [x8]
 45a17cc: 9101a260     	add	x0, x19, #0x68
 45a17d0: d63f0100     	blr	x8
 45a17d4: 17fffff3     	b	0x45a17a0 <_ChromeMain+0x459c504>
 45a17d8: 978e7333     	bl	0x293e4a4 <_ChromeMain+0x2939208>
 45a17dc: 394ca688     	ldrb	w8, [x20, #0x329]
 45a17e0: 3707f088     	tbnz	w8, #0x0, 0x45a15f0 <_ChromeMain+0x459c354>
 45a17e4: 94197ace     	bl	0x4c0031c <_ChromeMain+0x4bfb080>
 45a17e8: f9402a74     	ldr	x20, [x19, #0x50]
 45a17ec: 17ffffc0     	b	0x45a16ec <_ChromeMain+0x459c450>
 45a17f0: f9402a74     	ldr	x20, [x19, #0x50]
 45a17f4: b5fff094     	cbnz	x20, 0x45a1604 <_ChromeMain+0x459c368>
 45a17f8: 17ffffec     	b	0x45a17a8 <_ChromeMain+0x459c50c>
 45a17fc: d4200000     	brk	#0
 45a1800: d4400000     	hlt	#0
 45a1804: d4200020     	brk	#0x1
 45a1808: d4200000     	brk	#0
 45a180c: d4400000     	hlt	#0
 45a1810: d4200020     	brk	#0x1
 45a1814: f90017ff     	str	xzr, [sp, #0x28]
 45a1818: 910023e1     	add	x1, sp, #0x8
 45a181c: 9100a3e2     	add	x2, sp, #0x28
 45a1820: 52800043     	mov	w3, #0x2                ; =2
 45a1824: 96f34919     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 45a1828: 17ffff5c     	b	0x45a1598 <_ChromeMain+0x459c2fc>
 45a182c: b004a048     	adrp	x8, 0xd9aa000 <dyld_stub_binder+0xd9aa000>
 45a1830: 910a6508     	add	x8, x8, #0x299
 45a1834: f90017e8     	str	x8, [sp, #0x28]
 45a1838: 910023e1     	add	x1, sp, #0x8
 45a183c: 9100a3e2     	add	x2, sp, #0x28
 45a1840: 52800023     	mov	w3, #0x1                ; =1
 45a1844: 96f34911     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 45a1848: 17ffff4c     	b	0x45a1578 <_ChromeMain+0x459c2dc>
 45a184c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a1850: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a1854: 910043fd     	add	x29, sp, #0x10
 45a1858: 39438808     	ldrb	w8, [x0, #0xe2]
 45a185c: 34000168     	cbz	w8, 0x45a1888 <_ChromeMain+0x459c5ec>
 45a1860: aa0003f3     	mov	x19, x0
 45a1864: 52800028     	mov	w8, #0x1                ; =1
 45a1868: 39038008     	strb	w8, [x0, #0xe0]
 45a186c: 97ffff02     	bl	0x45a1474 <_ChromeMain+0x459c1d8>
 45a1870: 39438a68     	ldrb	w8, [x19, #0xe2]
 45a1874: 370000a8     	tbnz	w8, #0x0, 0x45a1888 <_ChromeMain+0x459c5ec>
 45a1878: 3941e268     	ldrb	w8, [x19, #0x78]
 45a187c: 37000068     	tbnz	w8, #0x0, 0x45a1888 <_ChromeMain+0x459c5ec>
 45a1880: 39438268     	ldrb	w8, [x19, #0xe0]
 45a1884: 35000088     	cbnz	w8, 0x45a1894 <_ChromeMain+0x459c5f8>
 45a1888: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a188c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a1890: d65f03c0     	ret
 45a1894: f9402260     	ldr	x0, [x19, #0x40]
 45a1898: b4ffff80     	cbz	x0, 0x45a1888 <_ChromeMain+0x459c5ec>
 45a189c: 3903827f     	strb	wzr, [x19, #0xe0]
 45a18a0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a18a4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a18a8: 14000197     	b	0x45a1f04 <_ChromeMain+0x459cc68>
 45a18ac: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 45a18b0: a9014ff4     	stp	x20, x19, [sp, #0x10]
 45a18b4: a9027bfd     	stp	x29, x30, [sp, #0x20]
 45a18b8: 910083fd     	add	x29, sp, #0x20
 45a18bc: 39438808     	ldrb	w8, [x0, #0xe2]
 45a18c0: 35000128     	cbnz	w8, 0x45a18e4 <_ChromeMain+0x459c648>
 45a18c4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 45a18c8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 45a18cc: a8c357f6     	ldp	x22, x21, [sp], #0x30
 45a18d0: d65f03c0     	ret
 45a18d4: 51002508     	sub	w8, w8, #0x9
 45a18d8: 7100051f     	cmp	w8, #0x1
 45a18dc: 54ffff48     	b.hi	0x45a18c4 <_ChromeMain+0x459c628>
 45a18e0: 14000012     	b	0x45a1928 <_ChromeMain+0x459c68c>
 45a18e4: aa0003f3     	mov	x19, x0
 45a18e8: b9400828     	ldr	w8, [x1, #0x8]
 45a18ec: 51001d09     	sub	w9, w8, #0x7
 45a18f0: 7100053f     	cmp	w9, #0x1
 45a18f4: 54000148     	b.hi	0x45a191c <_ChromeMain+0x459c680>
 45a18f8: 79411029     	ldrh	w9, [x1, #0x88]
 45a18fc: 71006d3f     	cmp	w9, #0x1b
 45a1900: 540003c0     	b.eq	0x45a1978 <_ChromeMain+0x459c6dc>
 45a1904: b940502a     	ldr	w10, [x1, #0x50]
 45a1908: 5280024b     	mov	w11, #0x12              ; =18
 45a190c: 6a2a017f     	bics	wzr, w11, w10
 45a1910: 5280082a     	mov	w10, #0x41              ; =65
 45a1914: 7a4a0120     	ccmp	w9, w10, #0x0, eq
 45a1918: 540003a0     	b.eq	0x45a198c <_ChromeMain+0x459c6f0>
 45a191c: 51000509     	sub	w9, w8, #0x1
 45a1920: 7100193f     	cmp	w9, #0x6
 45a1924: 54fffd82     	b.hs	0x45a18d4 <_ChromeMain+0x459c638>
 45a1928: f9402e60     	ldr	x0, [x19, #0x58]
 45a192c: b4fffcc0     	cbz	x0, 0x45a18c4 <_ChromeMain+0x459c628>
 45a1930: f9400008     	ldr	x8, [x0]
 45a1934: f9400908     	ldr	x8, [x8, #0x10]
 45a1938: d63f0100     	blr	x8
 45a193c: aa0003f4     	mov	x20, x0
 45a1940: f9402a60     	ldr	x0, [x19, #0x50]
 45a1944: b40001a0     	cbz	x0, 0x45a1978 <_ChromeMain+0x459c6dc>
 45a1948: 3948a008     	ldrb	w8, [x0, #0x228]
 45a194c: 37000168     	tbnz	w8, #0x0, 0x45a1978 <_ChromeMain+0x459c6dc>
 45a1950: d360fe95     	lsr	x21, x20, #32
 45a1954: 97f93dd3     	bl	0x43f10a0 <_ChromeMain+0x43ebe04>
 45a1958: 0b000028     	add	w8, w1, w0
 45a195c: 6b00029f     	cmp	w20, w0
 45a1960: 7a54a104     	ccmp	w8, w20, #0x4, ge
 45a1964: d360fc08     	lsr	x8, x0, #32
 45a1968: 7a48c2a8     	ccmp	w21, w8, #0x8, gt
 45a196c: 8b418108     	add	x8, x8, x1, lsr #32
 45a1970: 7a55a104     	ccmp	w8, w21, #0x4, ge
 45a1974: 54fffa8c     	b.gt	0x45a18c4 <_ChromeMain+0x459c628>
 45a1978: aa1303e0     	mov	x0, x19
 45a197c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 45a1980: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 45a1984: a8c357f6     	ldp	x22, x21, [sp], #0x30
 45a1988: 17fffebb     	b	0x45a1474 <_ChromeMain+0x459c1d8>
 45a198c: 52800028     	mov	w8, #0x1                ; =1
 45a1990: 39038268     	strb	w8, [x19, #0xe0]
 45a1994: aa1303e0     	mov	x0, x19
 45a1998: 97fffeb7     	bl	0x45a1474 <_ChromeMain+0x459c1d8>
 45a199c: 39438a68     	ldrb	w8, [x19, #0xe2]
 45a19a0: 3707f928     	tbnz	w8, #0x0, 0x45a18c4 <_ChromeMain+0x459c628>
 45a19a4: 3941e268     	ldrb	w8, [x19, #0x78]
 45a19a8: 3707f8e8     	tbnz	w8, #0x0, 0x45a18c4 <_ChromeMain+0x459c628>
 45a19ac: 39438268     	ldrb	w8, [x19, #0xe0]
 45a19b0: 34fff8a8     	cbz	w8, 0x45a18c4 <_ChromeMain+0x459c628>
 45a19b4: f9402260     	ldr	x0, [x19, #0x40]
 45a19b8: b4fff860     	cbz	x0, 0x45a18c4 <_ChromeMain+0x459c628>
 45a19bc: 3903827f     	strb	wzr, [x19, #0xe0]
 45a19c0: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 45a19c4: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 45a19c8: a8c357f6     	ldp	x22, x21, [sp], #0x30
 45a19cc: 1400014e     	b	0x45a1f04 <_ChromeMain+0x459cc68>
 45a19d0: d100a000     	sub	x0, x0, #0x28
 45a19d4: 17ffffb6     	b	0x45a18ac <_ChromeMain+0x459c610>
		...
 45a19e0: 9101a008     	add	x8, x0, #0x68
 45a19e4: eb08003f     	cmp	x1, x8
 45a19e8: 54000040     	b.eq	0x45a19f0 <_ChromeMain+0x459c754>
 45a19ec: d65f03c0     	ret
 45a19f0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a19f4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a19f8: 910043fd     	add	x29, sp, #0x10
 45a19fc: aa0003f3     	mov	x19, x0
 45a1a00: f9400028     	ldr	x8, [x1]
 45a1a04: f9401508     	ldr	x8, [x8, #0x28]
 45a1a08: aa0103e0     	mov	x0, x1
 45a1a0c: d63f0100     	blr	x8
 45a1a10: aa1303e0     	mov	x0, x19
 45a1a14: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a1a18: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a1a1c: 14000009     	b	0x45a1a40 <_ChromeMain+0x459c7a4>
 45a1a20: d503201f     	nop
 45a1a24: d503201f     	nop
 45a1a28: d503201f     	nop
 45a1a2c: d503201f     	nop
 45a1a30: d503201f     	nop
 45a1a34: d503201f     	nop
 45a1a38: d503201f     	nop
 45a1a3c: d503201f     	nop
 45a1a40: d10143ff     	sub	sp, sp, #0x50
 45a1a44: 6d0223e9     	stp	d9, d8, [sp, #0x20]
 45a1a48: a9034ff4     	stp	x20, x19, [sp, #0x30]
 45a1a4c: a9047bfd     	stp	x29, x30, [sp, #0x40]
 45a1a50: 910103fd     	add	x29, sp, #0x40
 45a1a54: f9402808     	ldr	x8, [x0, #0x50]
 45a1a58: b4000828     	cbz	x8, 0x45a1b5c <_ChromeMain+0x459c8c0>
 45a1a5c: aa0003f3     	mov	x19, x0
 45a1a60: b940b008     	ldr	w8, [x0, #0xb0]
 45a1a64: 52800169     	mov	w9, #0xb                ; =11
 45a1a68: 528000aa     	mov	w10, #0x5               ; =5
 45a1a6c: 7100091f     	cmp	w8, #0x2
 45a1a70: 1a890140     	csel	w0, w10, w9, eq
 45a1a74: 9770b943     	bl	0x21cff80 <_ChromeMain+0x21cace4>
 45a1a78: 4ea01c08     	mov.16b	v8, v0
 45a1a7c: f9402a74     	ldr	x20, [x19, #0x50]
 45a1a80: 9102d260     	add	x0, x19, #0xb4
 45a1a84: 91031261     	add	x1, x19, #0xc4
 45a1a88: 9782ee1f     	bl	0x265d304 <_ChromeMain+0x2658068>
 45a1a8c: a90007e0     	stp	x0, x1, [sp]
 45a1a90: f9407288     	ldr	x8, [x20, #0xe0]
 45a1a94: b4000248     	cbz	x8, 0x45a1adc <_ChromeMain+0x459c840>
 45a1a98: 19404108     	ldapurb	w8, [x8, #0x4]
 45a1a9c: 35000208     	cbnz	w8, 0x45a1adc <_ChromeMain+0x459c840>
 45a1aa0: f9407688     	ldr	x8, [x20, #0xe8]
 45a1aa4: b40001c8     	cbz	x8, 0x45a1adc <_ChromeMain+0x459c840>
 45a1aa8: f9407288     	ldr	x8, [x20, #0xe0]
 45a1aac: b4000628     	cbz	x8, 0x45a1b70 <_ChromeMain+0x459c8d4>
 45a1ab0: 19404108     	ldapurb	w8, [x8, #0x4]
 45a1ab4: 350005e8     	cbnz	w8, 0x45a1b70 <_ChromeMain+0x459c8d4>
 45a1ab8: f9407680     	ldr	x0, [x20, #0xe8]
 45a1abc: f9402414     	ldr	x20, [x0, #0x48]
 45a1ac0: b40000f4     	cbz	x20, 0x45a1adc <_ChromeMain+0x459c840>
 45a1ac4: 910003e1     	mov	x1, sp
 45a1ac8: 97565bc0     	bl	0x1b389c8 <_ChromeMain+0x1b3372c>
 45a1acc: a90107e0     	stp	x0, x1, [sp, #0x10]
 45a1ad0: 910043e1     	add	x1, sp, #0x10
 45a1ad4: aa1403e0     	mov	x0, x20
 45a1ad8: 97565bf7     	bl	0x1b38ab4 <_ChromeMain+0x1b33818>
 45a1adc: 2d5a8660     	ldp	s0, s1, [x19, #0xd4]
 45a1ae0: 1e22c002     	fcvt	d2, s0
 45a1ae4: 1e203820     	fsub	s0, s1, s0
 45a1ae8: 1e22c000     	fcvt	d0, s0
 45a1aec: 1e600900     	fmul	d0, d8, d0
 45a1af0: 1e622800     	fadd	d0, d0, d2
 45a1af4: 1e624000     	fcvt	s0, d0
 45a1af8: bd00de60     	str	s0, [x19, #0xdc]
 45a1afc: f9402a68     	ldr	x8, [x19, #0x50]
 45a1b00: f9407109     	ldr	x9, [x8, #0xe0]
 45a1b04: b40002c9     	cbz	x9, 0x45a1b5c <_ChromeMain+0x459c8c0>
 45a1b08: 19404129     	ldapurb	w9, [x9, #0x4]
 45a1b0c: 35000289     	cbnz	w9, 0x45a1b5c <_ChromeMain+0x459c8c0>
 45a1b10: f9407509     	ldr	x9, [x8, #0xe8]
 45a1b14: b4000249     	cbz	x9, 0x45a1b5c <_ChromeMain+0x459c8c0>
 45a1b18: f9407109     	ldr	x9, [x8, #0xe0]
 45a1b1c: b4000309     	cbz	x9, 0x45a1b7c <_ChromeMain+0x459c8e0>
 45a1b20: 19404129     	ldapurb	w9, [x9, #0x4]
 45a1b24: 350002c9     	cbnz	w9, 0x45a1b7c <_ChromeMain+0x459c8e0>
 45a1b28: f9407508     	ldr	x8, [x8, #0xe8]
 45a1b2c: f9402508     	ldr	x8, [x8, #0x48]
 45a1b30: b4000168     	cbz	x8, 0x45a1b5c <_ChromeMain+0x459c8c0>
 45a1b34: f9408509     	ldr	x9, [x8, #0x108]
 45a1b38: 5280230a     	mov	w10, #0x118             ; =280
 45a1b3c: 5280280b     	mov	w11, #0x140             ; =320
 45a1b40: f100013f     	cmp	x9, #0x0
 45a1b44: 9a8a0169     	csel	x9, x11, x10, eq
 45a1b48: f8696900     	ldr	x0, [x8, x9]
 45a1b4c: b4000080     	cbz	x0, 0x45a1b5c <_ChromeMain+0x459c8c0>
 45a1b50: f9400008     	ldr	x8, [x0]
 45a1b54: f9407908     	ldr	x8, [x8, #0xf0]
 45a1b58: d63f0100     	blr	x8
 45a1b5c: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 45a1b60: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 45a1b64: 6d4223e9     	ldp	d9, d8, [sp, #0x20]
 45a1b68: 910143ff     	add	sp, sp, #0x50
 45a1b6c: d65f03c0     	ret
 45a1b70: d4200000     	brk	#0
 45a1b74: d4400000     	hlt	#0
 45a1b78: d4200020     	brk	#0x1
 45a1b7c: d4200000     	brk	#0
 45a1b80: d4400000     	hlt	#0
 45a1b84: d4200020     	brk	#0x1
 45a1b88: 9100e008     	add	x8, x0, #0x38
 45a1b8c: eb08003f     	cmp	x1, x8
 45a1b90: 54000040     	b.eq	0x45a1b98 <_ChromeMain+0x459c8fc>
 45a1b94: d65f03c0     	ret
 45a1b98: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a1b9c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a1ba0: 910043fd     	add	x29, sp, #0x10
 45a1ba4: d100c013     	sub	x19, x0, #0x30
 45a1ba8: f9400028     	ldr	x8, [x1]
 45a1bac: f9401508     	ldr	x8, [x8, #0x28]
 45a1bb0: aa0103e0     	mov	x0, x1
 45a1bb4: d63f0100     	blr	x8
 45a1bb8: aa1303e0     	mov	x0, x19
 45a1bbc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a1bc0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a1bc4: 17ffff9f     	b	0x45a1a40 <_ChromeMain+0x459c7a4>
 45a1bc8: d100c3ff     	sub	sp, sp, #0x30
 45a1bcc: a9014ff4     	stp	x20, x19, [sp, #0x10]
 45a1bd0: a9027bfd     	stp	x29, x30, [sp, #0x20]
 45a1bd4: 910083fd     	add	x29, sp, #0x20
 45a1bd8: 9101a008     	add	x8, x0, #0x68
 45a1bdc: eb08003f     	cmp	x1, x8
 45a1be0: 540000a0     	b.eq	0x45a1bf4 <_ChromeMain+0x459c958>
 45a1be4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 45a1be8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 45a1bec: 9100c3ff     	add	sp, sp, #0x30
 45a1bf0: d65f03c0     	ret
 45a1bf4: aa0003f3     	mov	x19, x0
 45a1bf8: b940b014     	ldr	w20, [x0, #0xb0]
 45a1bfc: 1e6e1000     	fmov	d0, #1.00000000
 45a1c00: 97ffff90     	bl	0x45a1a40 <_ChromeMain+0x459c7a4>
 45a1c04: b900b27f     	str	wzr, [x19, #0xb0]
 45a1c08: 71000a9f     	cmp	w20, #0x2
 45a1c0c: 54fffec1     	b.ne	0x45a1be4 <_ChromeMain+0x459c948>
 45a1c10: f9402a74     	ldr	x20, [x19, #0x50]
 45a1c14: b4fffe94     	cbz	x20, 0x45a1be4 <_ChromeMain+0x459c948>
 45a1c18: 39438a68     	ldrb	w8, [x19, #0xe2]
 45a1c1c: 3707fe48     	tbnz	w8, #0x0, 0x45a1be4 <_ChromeMain+0x459c948>
 45a1c20: f9407288     	ldr	x8, [x20, #0xe0]
 45a1c24: b40002a8     	cbz	x8, 0x45a1c78 <_ChromeMain+0x459c9dc>
 45a1c28: 19404108     	ldapurb	w8, [x8, #0x4]
 45a1c2c: 35000268     	cbnz	w8, 0x45a1c78 <_ChromeMain+0x459c9dc>
 45a1c30: f9407688     	ldr	x8, [x20, #0xe8]
 45a1c34: b4000228     	cbz	x8, 0x45a1c78 <_ChromeMain+0x459c9dc>
 45a1c38: f9407288     	ldr	x8, [x20, #0xe0]
 45a1c3c: b4000668     	cbz	x8, 0x45a1d08 <_ChromeMain+0x459ca6c>
 45a1c40: 19404108     	ldapurb	w8, [x8, #0x4]
 45a1c44: 35000628     	cbnz	w8, 0x45a1d08 <_ChromeMain+0x459ca6c>
 45a1c48: f9407688     	ldr	x8, [x20, #0xe8]
 45a1c4c: f9402500     	ldr	x0, [x8, #0x48]
 45a1c50: b4000060     	cbz	x0, 0x45a1c5c <_ChromeMain+0x459c9c0>
 45a1c54: 52800001     	mov	w1, #0x0                ; =0
 45a1c58: 97968269     	bl	0x2b425fc <_ChromeMain+0x2b3d360>
 45a1c5c: 979555ba     	bl	0x2af7344 <_ChromeMain+0x2af20a8>
 45a1c60: f90007f4     	str	x20, [sp, #0x8]
 45a1c64: b00309e1     	adrp	x1, 0xa6de000 <_ChromeMain+0xa6d8d64>
 45a1c68: 91389021     	add	x1, x1, #0xe24
 45a1c6c: 910023e3     	add	x3, sp, #0x8
 45a1c70: d2800002     	mov	x2, #0x0                ; =0
 45a1c74: 9771e0d4     	bl	0x2219fc4 <_ChromeMain+0x2214d28>
 45a1c78: 52a7f008     	mov	w8, #0x3f800000         ; =1065353216
 45a1c7c: b900de68     	str	w8, [x19, #0xdc]
 45a1c80: f9402a68     	ldr	x8, [x19, #0x50]
 45a1c84: f9407109     	ldr	x9, [x8, #0xe0]
 45a1c88: b40002e9     	cbz	x9, 0x45a1ce4 <_ChromeMain+0x459ca48>
 45a1c8c: 19404129     	ldapurb	w9, [x9, #0x4]
 45a1c90: 350002a9     	cbnz	w9, 0x45a1ce4 <_ChromeMain+0x459ca48>
 45a1c94: f9407509     	ldr	x9, [x8, #0xe8]
 45a1c98: b4000269     	cbz	x9, 0x45a1ce4 <_ChromeMain+0x459ca48>
 45a1c9c: f9407109     	ldr	x9, [x8, #0xe0]
 45a1ca0: b40003a9     	cbz	x9, 0x45a1d14 <_ChromeMain+0x459ca78>
 45a1ca4: 19404129     	ldapurb	w9, [x9, #0x4]
 45a1ca8: 35000369     	cbnz	w9, 0x45a1d14 <_ChromeMain+0x459ca78>
 45a1cac: f9407508     	ldr	x8, [x8, #0xe8]
 45a1cb0: f9402508     	ldr	x8, [x8, #0x48]
 45a1cb4: b4000188     	cbz	x8, 0x45a1ce4 <_ChromeMain+0x459ca48>
 45a1cb8: f9408509     	ldr	x9, [x8, #0x108]
 45a1cbc: 5280230a     	mov	w10, #0x118             ; =280
 45a1cc0: 5280280b     	mov	w11, #0x140             ; =320
 45a1cc4: f100013f     	cmp	x9, #0x0
 45a1cc8: 9a8a0169     	csel	x9, x11, x10, eq
 45a1ccc: f8696900     	ldr	x0, [x8, x9]
 45a1cd0: b40000a0     	cbz	x0, 0x45a1ce4 <_ChromeMain+0x459ca48>
 45a1cd4: f9400008     	ldr	x8, [x0]
 45a1cd8: f9407908     	ldr	x8, [x8, #0xf0]
 45a1cdc: 1e2e1000     	fmov	s0, #1.00000000
 45a1ce0: d63f0100     	blr	x8
 45a1ce4: 39438268     	ldrb	w8, [x19, #0xe0]
 45a1ce8: 34fff7e8     	cbz	w8, 0x45a1be4 <_ChromeMain+0x459c948>
 45a1cec: f9402260     	ldr	x0, [x19, #0x40]
 45a1cf0: b4fff7a0     	cbz	x0, 0x45a1be4 <_ChromeMain+0x459c948>
 45a1cf4: 3903827f     	strb	wzr, [x19, #0xe0]
 45a1cf8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 45a1cfc: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 45a1d00: 9100c3ff     	add	sp, sp, #0x30
 45a1d04: 14000080     	b	0x45a1f04 <_ChromeMain+0x459cc68>
 45a1d08: d4200000     	brk	#0
 45a1d0c: d4400000     	hlt	#0
 45a1d10: d4200020     	brk	#0x1
 45a1d14: d4200000     	brk	#0
 45a1d18: d4400000     	hlt	#0
 45a1d1c: d4200020     	brk	#0x1
 45a1d20: d100c3ff     	sub	sp, sp, #0x30
 45a1d24: a9014ff4     	stp	x20, x19, [sp, #0x10]
 45a1d28: a9027bfd     	stp	x29, x30, [sp, #0x20]
 45a1d2c: 910083fd     	add	x29, sp, #0x20
 45a1d30: 9100e008     	add	x8, x0, #0x38
 45a1d34: eb08003f     	cmp	x1, x8
 45a1d38: 540000a0     	b.eq	0x45a1d4c <_ChromeMain+0x459cab0>
 45a1d3c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 45a1d40: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 45a1d44: 9100c3ff     	add	sp, sp, #0x30
 45a1d48: d65f03c0     	ret
 45a1d4c: aa0003f3     	mov	x19, x0
 45a1d50: b9408014     	ldr	w20, [x0, #0x80]
 45a1d54: d100c000     	sub	x0, x0, #0x30
 45a1d58: 1e6e1000     	fmov	d0, #1.00000000
 45a1d5c: 97ffff39     	bl	0x45a1a40 <_ChromeMain+0x459c7a4>
 45a1d60: b900827f     	str	wzr, [x19, #0x80]
 45a1d64: 71000a9f     	cmp	w20, #0x2
 45a1d68: 54fffea1     	b.ne	0x45a1d3c <_ChromeMain+0x459caa0>
 45a1d6c: f9401274     	ldr	x20, [x19, #0x20]
 45a1d70: b4fffe74     	cbz	x20, 0x45a1d3c <_ChromeMain+0x459caa0>
 45a1d74: 3942ca68     	ldrb	w8, [x19, #0xb2]
 45a1d78: 3707fe28     	tbnz	w8, #0x0, 0x45a1d3c <_ChromeMain+0x459caa0>
 45a1d7c: f9407288     	ldr	x8, [x20, #0xe0]
 45a1d80: b40002a8     	cbz	x8, 0x45a1dd4 <_ChromeMain+0x459cb38>
 45a1d84: 19404108     	ldapurb	w8, [x8, #0x4]
 45a1d88: 35000268     	cbnz	w8, 0x45a1dd4 <_ChromeMain+0x459cb38>
 45a1d8c: f9407688     	ldr	x8, [x20, #0xe8]
 45a1d90: b4000228     	cbz	x8, 0x45a1dd4 <_ChromeMain+0x459cb38>
 45a1d94: f9407288     	ldr	x8, [x20, #0xe0]
 45a1d98: b4000668     	cbz	x8, 0x45a1e64 <_ChromeMain+0x459cbc8>
 45a1d9c: 19404108     	ldapurb	w8, [x8, #0x4]
 45a1da0: 35000628     	cbnz	w8, 0x45a1e64 <_ChromeMain+0x459cbc8>
 45a1da4: f9407688     	ldr	x8, [x20, #0xe8]
 45a1da8: f9402500     	ldr	x0, [x8, #0x48]
 45a1dac: b4000060     	cbz	x0, 0x45a1db8 <_ChromeMain+0x459cb1c>
 45a1db0: 52800001     	mov	w1, #0x0                ; =0
 45a1db4: 97968212     	bl	0x2b425fc <_ChromeMain+0x2b3d360>
 45a1db8: 97955563     	bl	0x2af7344 <_ChromeMain+0x2af20a8>
 45a1dbc: f90007f4     	str	x20, [sp, #0x8]
 45a1dc0: b00309e1     	adrp	x1, 0xa6de000 <_ChromeMain+0xa6d8d64>
 45a1dc4: 91389021     	add	x1, x1, #0xe24
 45a1dc8: 910023e3     	add	x3, sp, #0x8
 45a1dcc: d2800002     	mov	x2, #0x0                ; =0
 45a1dd0: 9771e07d     	bl	0x2219fc4 <_ChromeMain+0x2214d28>
 45a1dd4: 52a7f008     	mov	w8, #0x3f800000         ; =1065353216
 45a1dd8: b900ae68     	str	w8, [x19, #0xac]
 45a1ddc: f9401268     	ldr	x8, [x19, #0x20]
 45a1de0: f9407109     	ldr	x9, [x8, #0xe0]
 45a1de4: b40002e9     	cbz	x9, 0x45a1e40 <_ChromeMain+0x459cba4>
 45a1de8: 19404129     	ldapurb	w9, [x9, #0x4]
 45a1dec: 350002a9     	cbnz	w9, 0x45a1e40 <_ChromeMain+0x459cba4>
 45a1df0: f9407509     	ldr	x9, [x8, #0xe8]
 45a1df4: b4000269     	cbz	x9, 0x45a1e40 <_ChromeMain+0x459cba4>
 45a1df8: f9407109     	ldr	x9, [x8, #0xe0]
 45a1dfc: b40003a9     	cbz	x9, 0x45a1e70 <_ChromeMain+0x459cbd4>
 45a1e00: 19404129     	ldapurb	w9, [x9, #0x4]
 45a1e04: 35000369     	cbnz	w9, 0x45a1e70 <_ChromeMain+0x459cbd4>
 45a1e08: f9407508     	ldr	x8, [x8, #0xe8]
 45a1e0c: f9402508     	ldr	x8, [x8, #0x48]
 45a1e10: b4000188     	cbz	x8, 0x45a1e40 <_ChromeMain+0x459cba4>
 45a1e14: f9408509     	ldr	x9, [x8, #0x108]
 45a1e18: 5280230a     	mov	w10, #0x118             ; =280
 45a1e1c: 5280280b     	mov	w11, #0x140             ; =320
 45a1e20: f100013f     	cmp	x9, #0x0
 45a1e24: 9a8a0169     	csel	x9, x11, x10, eq
 45a1e28: f8696900     	ldr	x0, [x8, x9]
 45a1e2c: b40000a0     	cbz	x0, 0x45a1e40 <_ChromeMain+0x459cba4>
 45a1e30: f9400008     	ldr	x8, [x0]
 45a1e34: f9407908     	ldr	x8, [x8, #0xf0]
 45a1e38: 1e2e1000     	fmov	s0, #1.00000000
 45a1e3c: d63f0100     	blr	x8
 45a1e40: 3942c268     	ldrb	w8, [x19, #0xb0]
 45a1e44: 34fff7c8     	cbz	w8, 0x45a1d3c <_ChromeMain+0x459caa0>
 45a1e48: f9400a60     	ldr	x0, [x19, #0x10]
 45a1e4c: b4fff780     	cbz	x0, 0x45a1d3c <_ChromeMain+0x459caa0>
 45a1e50: 3902c27f     	strb	wzr, [x19, #0xb0]
 45a1e54: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 45a1e58: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 45a1e5c: 9100c3ff     	add	sp, sp, #0x30
 45a1e60: 14000029     	b	0x45a1f04 <_ChromeMain+0x459cc68>
 45a1e64: d4200000     	brk	#0
 45a1e68: d4400000     	hlt	#0
 45a1e6c: d4200020     	brk	#0x1
 45a1e70: d4200000     	brk	#0
 45a1e74: d4400000     	hlt	#0
 45a1e78: d4200020     	brk	#0x1
 45a1e7c: 9101a008     	add	x8, x0, #0x68
 45a1e80: eb08003f     	cmp	x1, x8
 45a1e84: 54000040     	b.eq	0x45a1e8c <_ChromeMain+0x459cbf0>
 45a1e88: d65f03c0     	ret
 45a1e8c: b900b01f     	str	wzr, [x0, #0xb0]
 45a1e90: d65f03c0     	ret
 45a1e94: 9100e008     	add	x8, x0, #0x38
 45a1e98: eb08003f     	cmp	x1, x8
 45a1e9c: 54000040     	b.eq	0x45a1ea4 <_ChromeMain+0x459cc08>
 45a1ea0: d65f03c0     	ret
 45a1ea4: b900801f     	str	wzr, [x0, #0x80]
 45a1ea8: d65f03c0     	ret
 45a1eac: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a1eb0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a1eb4: 910043fd     	add	x29, sp, #0x10
 45a1eb8: aa0003f3     	mov	x19, x0
 45a1ebc: 52800028     	mov	w8, #0x1                ; =1
 45a1ec0: 39038008     	strb	w8, [x0, #0xe0]
 45a1ec4: 97fffd6c     	bl	0x45a1474 <_ChromeMain+0x459c1d8>
 45a1ec8: 39438a68     	ldrb	w8, [x19, #0xe2]
 45a1ecc: 370000a8     	tbnz	w8, #0x0, 0x45a1ee0 <_ChromeMain+0x459cc44>
 45a1ed0: 3941e268     	ldrb	w8, [x19, #0x78]
 45a1ed4: 37000068     	tbnz	w8, #0x0, 0x45a1ee0 <_ChromeMain+0x459cc44>
 45a1ed8: 39438268     	ldrb	w8, [x19, #0xe0]
 45a1edc: 35000088     	cbnz	w8, 0x45a1eec <_ChromeMain+0x459cc50>
 45a1ee0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a1ee4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a1ee8: d65f03c0     	ret
 45a1eec: f9402260     	ldr	x0, [x19, #0x40]
 45a1ef0: b4ffff80     	cbz	x0, 0x45a1ee0 <_ChromeMain+0x459cc44>
 45a1ef4: 3903827f     	strb	wzr, [x19, #0xe0]
 45a1ef8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a1efc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a1f00: 14000001     	b	0x45a1f04 <_ChromeMain+0x459cc68>
