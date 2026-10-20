
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 32f48ac: d104c3ff     	sub	sp, sp, #0x130
 32f48b0: a90d6ffc     	stp	x28, x27, [sp, #0xd0]
 32f48b4: a90e67fa     	stp	x26, x25, [sp, #0xe0]
 32f48b8: a90f5ff8     	stp	x24, x23, [sp, #0xf0]
 32f48bc: a91057f6     	stp	x22, x21, [sp, #0x100]
 32f48c0: a9114ff4     	stp	x20, x19, [sp, #0x110]
 32f48c4: a9127bfd     	stp	x29, x30, [sp, #0x120]
 32f48c8: 910483fd     	add	x29, sp, #0x120
 32f48cc: aa0103f6     	mov	x22, x1
 32f48d0: aa0003f3     	mov	x19, x0
 32f48d4: d00575a8     	adrp	x8, 0xe1aa000 <dyld_stub_binder+0xe1aa000>
 32f48d8: 913b4108     	add	x8, x8, #0xed0
 32f48dc: 91020109     	add	x9, x8, #0x80
 32f48e0: aa0003f5     	mov	x21, x0
 32f48e4: f8008ea9     	str	x9, [x21, #0x8]!
 32f48e8: f9000008     	str	x8, [x0]
 32f48ec: 9102c108     	add	x8, x8, #0xb0
 32f48f0: f9000808     	str	x8, [x0, #0x10]
 32f48f4: 925e7428     	and	x8, x1, #0xfffffffc00000000
 32f48f8: d005c5f7     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 32f48fc: f94046e9     	ldr	x9, [x23, #0x88]
 32f4900: eb09011f     	cmp	x8, x9
 32f4904: 54000061     	b.ne	0x32f4910 <_ChromeMain+0x32ef674>
 32f4908: aa1603e0     	mov	x0, x22
 32f490c: 97347e7c     	bl	0x142fc <_ChromeMain+0xf060>
 32f4910: f9000e76     	str	x22, [x19, #0x18]
 32f4914: 6f00e400     	movi.2d	v0, #0000000000000000
 32f4918: ad010260     	stp	q0, q0, [x19, #0x20]
 32f491c: 52a7f008     	mov	w8, #0x3f800000         ; =1065353216
 32f4920: b9004268     	str	w8, [x19, #0x40]
 32f4924: 52800d00     	mov	w0, #0x68               ; =104
 32f4928: 97346a90     	bl	0xf368 <_ChromeMain+0xa0cc>
 32f492c: a901fc1f     	stp	xzr, xzr, [x0, #0x18]
 32f4930: d00575a8     	adrp	x8, 0xe1aa000 <dyld_stub_binder+0xe1aa000>
 32f4934: 91314108     	add	x8, x8, #0xc50
 32f4938: 12800009     	mov	w9, #-0x1               ; =-1
 32f493c: b9002809     	str	w9, [x0, #0x28]
 32f4940: 6f00e400     	movi.2d	v0, #0000000000000000
 32f4944: ad018000     	stp	q0, q0, [x0, #0x30]
 32f4948: 3d801400     	str	q0, [x0, #0x50]
 32f494c: b0057e29     	adrp	x9, 0xe2b9000 <dyld_stub_binder+0xe2b9000>
 32f4950: 91148129     	add	x9, x9, #0x520
 32f4954: f9000008     	str	x8, [x0]
 32f4958: a900fc09     	stp	x9, xzr, [x0, #0x8]
 32f495c: f900301f     	str	xzr, [x0, #0x60]
 32f4960: f0057e08     	adrp	x8, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 32f4964: 913c2108     	add	x8, x8, #0xf08
 32f4968: aa1303f4     	mov	x20, x19
 32f496c: f8078e88     	str	x8, [x20, #0x78]!
 32f4970: f81d0280     	stur	x0, [x20, #-0x30]
 32f4974: 3c9d8280     	stur	q0, [x20, #-0x28]
 32f4978: 3c9e8280     	stur	q0, [x20, #-0x18]
 32f497c: f81f829f     	stur	xzr, [x20, #-0x8]
 32f4980: 52800100     	mov	w0, #0x8                ; =8
 32f4984: 97346a79     	bl	0xf368 <_ChromeMain+0xa0cc>
 32f4988: b900001f     	str	wzr, [x0]
 32f498c: 3900101f     	strb	wzr, [x0, #0x4]
 32f4990: b40000c0     	cbz	x0, 0x32f49a8 <_ChromeMain+0x32ef70c>
 32f4994: 52800028     	mov	w8, #0x1                ; =1
 32f4998: b8280008     	ldadd	w8, w8, [x0]
 32f499c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 32f49a0: 6b09011f     	cmp	w8, w9
 32f49a4: 54001fa0     	b.eq	0x32f4d98 <_ChromeMain+0x32efafc>
 32f49a8: f0057f88     	adrp	x8, 0xe2e7000 <dyld_stub_binder+0xe2e7000>
 32f49ac: 91124108     	add	x8, x8, #0x490
 32f49b0: a9078268     	stp	x8, x0, [x19, #0x78]
 32f49b4: a908fe74     	stp	x20, xzr, [x19, #0x88]
 32f49b8: f900527f     	str	xzr, [x19, #0xa0]
 32f49bc: 52800038     	mov	w24, #0x1               ; =1
 32f49c0: 3902a278     	strb	w24, [x19, #0xa8]
 32f49c4: 52800100     	mov	w0, #0x8                ; =8
 32f49c8: 97346a68     	bl	0xf368 <_ChromeMain+0xa0cc>
 32f49cc: b900001f     	str	wzr, [x0]
 32f49d0: 3900101f     	strb	wzr, [x0, #0x4]
 32f49d4: b40000a0     	cbz	x0, 0x32f49e8 <_ChromeMain+0x32ef74c>
 32f49d8: b8380008     	ldadd	w24, w8, [x0]
 32f49dc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 32f49e0: 6b09011f     	cmp	w8, w9
 32f49e4: 54001d00     	b.eq	0x32f4d84 <_ChromeMain+0x32efae8>
 32f49e8: a90b4e60     	stp	x0, x19, [x19, #0xb0]
 32f49ec: aa1603e0     	mov	x0, x22
 32f49f0: 9793d4f0     	bl	0x17e9db0 <_ChromeMain+0x17e4b14>
 32f49f4: 9101c000     	add	x0, x0, #0x70
 32f49f8: aa1503e1     	mov	x1, x21
 32f49fc: 979de105     	bl	0x1a6ce10 <_ChromeMain+0x1a67b74>
 32f4a00: f9400e60     	ldr	x0, [x19, #0x18]
 32f4a04: f9400008     	ldr	x8, [x0]
 32f4a08: f940b508     	ldr	x8, [x8, #0x168]
 32f4a0c: d63f0100     	blr	x8
 32f4a10: aa0003f5     	mov	x21, x0
 32f4a14: 925e7408     	and	x8, x0, #0xfffffffc00000000
 32f4a18: f94046e9     	ldr	x9, [x23, #0x88]
 32f4a1c: eb09011f     	cmp	x8, x9
 32f4a20: 54000061     	b.ne	0x32f4a2c <_ChromeMain+0x32ef790>
 32f4a24: aa1503e0     	mov	x0, x21
 32f4a28: 97347e35     	bl	0x142fc <_ChromeMain+0xf060>
 32f4a2c: f9405260     	ldr	x0, [x19, #0xa0]
 32f4a30: 925e7408     	and	x8, x0, #0xfffffffc00000000
 32f4a34: f94046e9     	ldr	x9, [x23, #0x88]
 32f4a38: eb09011f     	cmp	x8, x9
 32f4a3c: 54000760     	b.eq	0x32f4b28 <_ChromeMain+0x32ef88c>
 32f4a40: f9005275     	str	x21, [x19, #0xa0]
 32f4a44: 925e7668     	and	x8, x19, #0xfffffffc00000000
 32f4a48: f94046e9     	ldr	x9, [x23, #0x88]
 32f4a4c: eb09011f     	cmp	x8, x9
 32f4a50: 54000061     	b.ne	0x32f4a5c <_ChromeMain+0x32ef7c0>
 32f4a54: aa1303e0     	mov	x0, x19
 32f4a58: 97347e29     	bl	0x142fc <_ChromeMain+0xf060>
 32f4a5c: 52800700     	mov	w0, #0x38               ; =56
 32f4a60: 97346a42     	bl	0xf368 <_ChromeMain+0xa0cc>
 32f4a64: 52800036     	mov	w22, #0x1               ; =1
 32f4a68: b9000016     	str	w22, [x0]
 32f4a6c: b0006228     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 32f4a70: 913a0108     	add	x8, x8, #0xe80
 32f4a74: b0002d29     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 32f4a78: 912d0129     	add	x9, x9, #0xb40
 32f4a7c: a900a408     	stp	x8, x9, [x0, #0x8]
 32f4a80: b0ff9357     	adrp	x23, 0x255d000 <_ChromeMain+0x2557d64>
 32f4a84: 912c02f7     	add	x23, x23, #0xb00
 32f4a88: 90007028     	adrp	x8, 0x40f8000 <_ChromeMain+0x40f2d64>
 32f4a8c: 91207108     	add	x8, x8, #0x81c
 32f4a90: a901a017     	stp	x23, x8, [x0, #0x18]
 32f4a94: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 32f4a98: b40017c0     	cbz	x0, 0x32f4d90 <_ChromeMain+0x32efaf4>
 32f4a9c: aa0003f5     	mov	x21, x0
 32f4aa0: 52800600     	mov	w0, #0x30               ; =48
 32f4aa4: 97346a31     	bl	0xf368 <_ChromeMain+0xa0cc>
 32f4aa8: aa0003e3     	mov	x3, x0
 32f4aac: b9000016     	str	w22, [x0]
 32f4ab0: 90ff9088     	adrp	x8, 0x2504000 <_ChromeMain+0x24fed64>
 32f4ab4: 91117108     	add	x8, x8, #0x45c
 32f4ab8: 90002d29     	adrp	x9, 0x3898000 <_ChromeMain+0x3892d64>
 32f4abc: 91070129     	add	x9, x9, #0x1c0
 32f4ac0: a900a408     	stp	x8, x9, [x0, #0x8]
 32f4ac4: f9000c17     	str	x23, [x0, #0x18]
 32f4ac8: f9001415     	str	x21, [x0, #0x28]
 32f4acc: b004dfa1     	adrp	x1, 0xcee9000 <dyld_stub_binder+0xcee9000>
 32f4ad0: 9128a021     	add	x1, x1, #0xa28
 32f4ad4: aa1403e0     	mov	x0, x20
 32f4ad8: 52800662     	mov	w2, #0x33               ; =51
 32f4adc: 9777d855     	bl	0x10eac30 <_ChromeMain+0x10e5994>
